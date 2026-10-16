/**
 * Live drop buying — Jev decides, real BSV spends (default $6 cap).
 *
 * Pipeline per new @0 drop (kind=drop only):
 *   status (public) -> quote (authed, creates expirable attempt) -> cap check
 *   -> Jev buy/hold -> funds check -> approve -> prepare -> sign -> submit
 *   -> poll confirmed -> reveal -> record.
 *
 * Gating (fail closed at every step):
 *   - liveBuyEnabled false (default) -> nothing evaluated, no Jev cost.
 *   - liveBuyDryRun true (default) -> quote + Jev run, then the attempt is
 *     cancelled and the outcome recorded as dryrun. NOTHING is approved,
 *     signed, or submitted. Set false to arm live spends.
 *   - No TWETCH_MINT_WIF -> status + alert only ("live buy needs key").
 *   - No Jev key, or Jev hold / low confidence -> hold, attempt cancelled.
 *   - Quote over the $6-in-sats cap, or insufficient mint funds -> skip.
 *   - Unknown approve/prepare shapes -> abort + cancel, no spend.
 *   - Mint signs ONLY server-dictated outputs, re-verified against the quote
 *     (unitPrice*qty + fee <= maximumDebit, fee <= maxFee, unexpired).
 *
 * Funds move ONLY via the held mint key (offline @bsv/sdk signing, same
 * pattern as tools/transfer.mjs). The daemon never sees the key. Spends are
 * recorded in state.liveBuys and surfaced on the dashboard.
 */
import { P2PKH, Transaction } from "@bsv/sdk";
import { basePath, p2pkhScriptHex, selectFunding, validateQuote } from "./launchpad.mjs";

export const DROP_BUY_OPTIONS = {
  buy: "mint/buy this live drop now — fairly priced within the USD cap, confident it is genuine and buyable",
  hold: "pass — overpriced, over cap, low conviction, sold out, or unbuyable",
};

export async function getBsvUsdPrice({ fetchFn = fetch, timeoutMs = 10_000 } = {}) {
  const tries = [
    async () => {
      const r = await fetchFn("https://api.coinbase.com/v2/prices/BSV-USD/spot", {
        headers: { accept: "application/json", "user-agent": "twonk-market-livebuy/1.0" },
      });
      if (!r.ok) throw new Error(`coinbase ${r.status}`);
      const p = Number((await r.json())?.data?.amount);
      if (!(p > 0)) throw new Error("coinbase bad price");
      return { price: p, source: "coinbase" };
    },
    async () => {
      const r = await fetchFn("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash-sv&vs_currencies=usd", {
        headers: { accept: "application/json", "user-agent": "twonk-market-livebuy/1.0" },
      });
      if (!r.ok) throw new Error(`coingecko ${r.status}`);
      const p = Number((await r.json())?.["bitcoin-cash-sv"]?.usd);
      if (!(p > 0)) throw new Error("coingecko bad price");
      return { price: p, source: "coingecko" };
    },
  ];
  let last = null;
  for (const t of tries) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      return await t();
    } catch (e) {
      last = e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`price unavailable (${last?.message ?? "all feeds failed"})`);
}

export function capSatsForUsd(maxUsd, priceUsd) {
  if (!(maxUsd > 0) || !(priceUsd > 0)) throw new Error("bad cap/price");
  return Math.floor((maxUsd / priceUsd) * 1e8);
}

/** Contract hex from a drop's links (/market/{hex} or /launchpad/{hex}). */
export function extractContractHex(drop) {
  for (const u of drop?.links ?? []) {
    const m = String(u).match(/twetch\.com\/(?:market|launchpad)\/([0-9a-f]{64})/i)
      ?? String(u).match(/launchpad\/([0-9a-f]{64})/i);
    if (m) return m[1].toLowerCase();
  }
  return null;
}

/** Mint-fund address balance + UTXOs (public reads). */
export async function mintFunds(address, { fetchFn = fetch, timeoutMs = 15_000 } = {}) {
  const [u, b] = await Promise.all([
    fetchFn(`https://api.whatsonchain.com/v1/bsv/main/address/${address}/unspent`, {
      headers: { accept: "application/json", "user-agent": "twonk-market-livebuy/1.0" },
    }).then((r) => (r.ok ? r.json() : [])),
    fetchFn(`https://api.whatsonchain.com/v1/bsv/main/address/${address}/balance`, {
      headers: { accept: "application/json", "user-agent": "twonk-market-livebuy/1.0" },
    }).then((r) => (r.ok ? r.json() : {})),
  ]);
  const scriptHex = p2pkhScriptHex(address);
  const utxos = (Array.isArray(u) ? u : [])
    .filter((x) => typeof x?.tx_hash === "string" && Number.isSafeInteger(x?.value))
    .map((x) => ({ txid: x.tx_hash, vout: x.tx_pos ?? 0, satoshis: x.value, scriptHex }));
  return { balanceSats: b?.confirmed ?? 0, utxos };
}

/**
 * Evaluate one live drop for a real buy. All side effects (Jev, quote,
 * spend) happen here; every dependency injectable for tests.
 * Returns an action record (also appended to state.liveBuys by the caller).
 */
export async function evaluateDropBuy({
  cfg, drop, status, authed, mintPriv, mintAddress,
  priceUsd, jev, jevJudge, judged = null,
  cancelAttempt = true, fetchFn = fetch,
} = {}) {
  const at = new Date().toISOString();
  const contract = extractContractHex(drop);
  const base = { dropId: drop.id, contract, kind: drop.kind, at };
  const fail = (action, reason, extra = {}) => ({ ...base, action, reason, ...extra });

  if (drop.kind !== "drop") return fail("skipped", "not a buyable drop kind (update/post-mortem)");
  if (!contract) return fail("skipped", "no collection link — cannot query launchpad status");
  if (!status?.live) return fail("skipped", status?.mintEnded ? "mint ended" : "drop not live (sold out or not started)");
  if (!authed || !mintPriv) return fail("skipped", "live buy needs TWETCH_MINT_WIF (held mint key)");
  if (!jev?.configured) return fail("held", "no Jev key — fail closed, never buy blind");
  if (judged && Number.isFinite(cfg.jevMaxPerCycle) && judged.judged >= cfg.jevMaxPerCycle) {
    return fail("held", "jev budget spent", {});
  }

  const qty = Math.max(1, Math.min(1000, Math.floor(cfg.liveBuyQuantity ?? 1)));
  const capSats = capSatsForUsd(cfg.liveBuyMaxUsd ?? 6, priceUsd);

  // Quote first (non-spending; creates an expirable attempt) to get the exact price.
  let quote;
  try {
    const raw = await authed.post(`${basePath(base.contract)}/quote`, { quantity: qty });
    quote = validateQuote(raw, { quantity: qty });
  } catch (e) {
    if (e?.code === "OVER_CAP") return fail("skipped", String(e.message));
    return fail("failed", `quote failed: ${e.message}`);
  }
  const done = async () => {
    if (cancelAttempt) {
      try {
        await authed.post(`${basePath(base.contract)}/purchases/${quote.attemptId}/cancel`, {});
      } catch {
        // best effort; attempt expires server-side
      }
    }
  };

  if (quote.subtotalSats > capSats) {
    await done();
    return fail("skipped", `mint ${quote.subtotalSats} sats exceeds $${cfg.liveBuyMaxUsd} cap (${capSats} sats)`, { quote });
  }

  // Funds precheck against the maximum debit, not just the subtotal.
  let funds;
  try {
    funds = await mintFunds(mintAddress, { fetchFn });
  } catch (e) {
    await done();
    return fail("failed", `funds lookup failed: ${e.message}`, { quote });
  }
  if (funds.balanceSats < quote.maximumDebitSats) {
    await done();
    return fail("skipped", `insufficient mint funds: have ${funds.balanceSats}, need ${quote.maximumDebitSats}`, { quote });
  }

  // Jev decides with the exact price + cap context.
  let verdict;
  try {
    verdict = await jevJudge(
      {
        drop: drop.snippet,
        collection: base.contract,
        quantity: qty,
        mint_price_sats: quote.subtotalSats,
        mint_price_usd: Number((quote.subtotalSats / 1e8 * priceUsd).toFixed(4)),
        cap_usd: cfg.liveBuyMaxUsd,
        available: status.available,
        supply: status.supply,
        post: drop.postUrl,
      },
      DROP_BUY_OPTIONS,
    );
    if (judged) judged.judged++;
  } catch (e) {
    await done();
    return fail("held", `jev failed: ${e.message}`, { quote });
  }
  const conf = verdict?.confidence ?? 0;
  if (verdict?.decision !== "buy" || conf < (cfg.liveBuyMinConfidence ?? 0.7)) {
    await done();
    return fail("held", `jev:${verdict?.decision ?? "?"} ${conf.toFixed(2)} below bar`, { quote, jev: verdict });
  }

  // Dry run: decision recorded, attempt released, nothing approved/signed/sent.
  if (cfg.liveBuyDryRun !== false) {
    await done();
    return fail("dryrun", `jev:buy ${conf.toFixed(2)} — dry run, attempt cancelled, nothing spent`, {
      quote, jev: verdict, priceUsd, capSats,
      mintPriceUsd: Number((quote.subtotalSats / 1e8 * priceUsd).toFixed(4)),
    });
  }

  // LIVE: approve -> prepare -> sign server-dictated outputs -> submit -> poll -> reveal.
  try {
    return await executeMint({ cfg, drop, base, quote, qty, status, authed, mintPriv, mintAddress, funds, verdict, priceUsd, capSats, fetchFn });
  } catch (e) {
    try {
      await authed.post(`${basePath(base.contract)}/purchases/${quote.attemptId}/cancel`, {});
    } catch {
      // best effort
    }
    return fail("failed", e.message, { quote, jev: verdict });
  }
}

/** Select funding inputs covering maximumDebitSats. */
function pickFunding(funds, needSats) {
  return selectFunding(funds.utxos, needSats);
}

/**
 * Execute the live mint. Strict shape validation at every step; anything
 * unexpected aborts BEFORE signing. Signs only server-dictated outputs and
 * re-verifies quote economics (mirror of the web client's checks).
 */
export async function executeMint({ cfg, drop, base, quote, qty, status, authed, mintPriv, mintAddress, funds, verdict, priceUsd, capSats, fetchFn = fetch }) {
  const base_path = basePath(base.contract);
  const attempt = quote.attemptId;

  const approve = await authed.post(`${base_path}/approve`, { attemptId: attempt });
  if (approve && typeof approve === "object" && approve.ok === false) throw new Error("approve rejected");

  const funding = pickFunding(funds, quote.maximumDebitSats);
  const prepare = await authed.post(`${base_path}/purchases/${attempt}/prepare`, {
    funding: funding.inputs.map(({ txid, vout }) => ({ txid, vout })),
  });
  const unsigned = parsePrepare(prepare, { quote, mintAddress });
  const txHex = await buildSignedFundingTx({ unsigned, funding, mintPriv, mintAddress, quote, fetchTxHex: (txid) => fetchTxHex(txid, { fetchFn }) });

  const submitted = await authed.post(`${base_path}/purchases/${attempt}/submit`, { buyerTxHex: txHex });
  const buyTxid = typeof submitted?.txid === "string" ? submitted.txid : typeof submitted?.buyerTxid === "string" ? submitted.buyerTxid : null;

  const confirmed = await pollConfirmed({ authed, base_path, attempt, timeoutMs: 120_000 });
  const revealed = await authed.post(`${base_path}/purchases/${attempt}/reveal`, { count: qty });

  return {
    ...base, action: "bought",
    reason: `jev:buy ${(verdict?.confidence ?? 0).toFixed(2)} — minted ${qty} @ ${quote.subtotalSats} sats`,
    quote: { attemptId: attempt, quantity: qty, subtotalSats: quote.subtotalSats, maximumDebitSats: quote.maximumDebitSats },
    jev: verdict, priceUsd, capSats,
    mintPriceUsd: Number((quote.subtotalSats / 1e8 * priceUsd).toFixed(4)),
    buyTxid, purchase: confirmed, reveal: Array.isArray(revealed?.items) ? revealed.items.slice(0, 8) : undefined,
  };
}

/**
 * Parse prepare response. Accepts ONLY explicit output layouts; anything
 * else throws (fail closed — we never guess a mint layout with real money).
 * Expected: {outputs:[{address,sats}...], ...} with escrow exact == subtotal.
 */
export function parsePrepare(prepare, { quote, mintAddress }) {
  if (!prepare || typeof prepare !== "object") throw new Error("prepare: empty response");
  const outputs = prepare.outputs ?? prepare.txOutputs;
  if (!Array.isArray(outputs) || !outputs.length) {
    throw new Error(`prepare: unsupported layout (keys: ${Object.keys(prepare).slice(0, 8).join(",") || "none"})`);
  }
  const clean = outputs.map((o) => {
    const address = o.address ?? o.to;
    const sats = o.sats ?? o.value ?? o.amount;
    if (typeof address !== "string" || !Number.isSafeInteger(sats) || sats <= 0) throw new Error("prepare: bad output");
    return { address, sats };
  });
  const toEscrow = clean.filter((o) => o.address !== mintAddress).reduce((s, o) => s + o.sats, 0);
  if (toEscrow !== quote.subtotalSats) {
    throw new Error(`prepare: escrow ${toEscrow} != quoted subtotal ${quote.subtotalSats}`);
  }
  return { outputs: clean, changeTo: mintAddress };
}

/** Fetch a raw tx hex (for input signing). Injectable for tests. */
export async function fetchTxHex(txid, { fetchFn = fetch, timeoutMs = 15_000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetchFn(`https://api.whatsonchain.com/v1/bsv/main/tx/${txid}/hex`, {
      headers: { accept: "text/plain", "user-agent": "twonk-market-livebuy/1.0" },
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error(`prevtx ${r.status}`);
    const hex = (await r.text()).trim();
    if (!/^[0-9a-f]+$/i.test(hex) || hex.length > 4_000_000) throw new Error("bad prevtx hex");
    return hex;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Build + sign the funding tx: server-dictated outputs, change home, fee
 * bounded by the quote. Mirrors the web client's verification (economics
 * re-checked here before any signature is produced).
 */
export async function buildSignedFundingTx({ unsigned, funding, mintPriv, mintAddress, quote, fetchTxHex: getHex = fetchTxHex }) {
  let totalIn = 0;
  for (const inp of funding.inputs) {
    if (!Number.isSafeInteger(inp.satoshis)) throw new Error("funding input missing value — refusing to sign blind");
    totalIn += inp.satoshis;
  }
  const escrowOut = unsigned.outputs.reduce((s, o) => s + o.sats, 0);
  if (escrowOut !== quote.subtotalSats) throw new Error("escrow != quoted subtotal");
  if (Date.now() >= quote.expiresAtMs - 5_000) throw new Error("quote expired before signing");

  const tx = new Transaction();
  for (const inp of funding.inputs) {
    const hex = await getHex(inp.txid);
    const prev = Transaction.fromHex(hex);
    const out = prev.outputs[inp.vout];
    if (!out) throw new Error("prevout missing");
    tx.addInput({
      sourceTransaction: prev,
      sourceTXID: inp.txid,
      sourceOutputIndex: inp.vout,
      unlockingScriptTemplate: new P2PKH().unlock(mintPriv),
    });
    void out;
  }
  for (const o of unsigned.outputs) {
    tx.addOutput({ lockingScript: new P2PKH().lock(o.address), change: false, satoshis: o.sats });
  }
  // Fee from size estimate (2 sats/byte), bounded by the quote's max fee.
  const sizeEst = 10 + funding.inputs.length * 148 + (unsigned.outputs.length + 1) * 34;
  const fee = Math.min(quote.maximumNetworkFeeSats, Math.max(200, sizeEst * 2));
  const change = totalIn - escrowOut - fee;
  if (change < 0) throw new Error("inputs do not cover escrow + fee");
  if (change > 0) {
    tx.addOutput({ lockingScript: new P2PKH().lock(mintAddress), change: true, satoshis: change });
  }
  const buyerDebit = totalIn - change;
  if (buyerDebit !== quote.subtotalSats + fee) throw new Error("debit mismatch");
  if (buyerDebit > quote.maximumDebitSats) throw new Error("debit exceeds quoted maximum");
  await tx.sign();
  const hex = tx.toHex();
  if (!/^[0-9a-f]+$/i.test(hex)) throw new Error("bad signed hex");
  return hex;
}

/** Poll purchase until confirmed (or timeout). Non-spending. */
export async function pollConfirmed({ authed, base_path, attempt, timeoutMs = 120_000, intervalMs = 5_000 } = {}) {
  const end = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < end) {
    const p = await authed.get(`${base_path}/purchases/${attempt}`);
    last = p;
    const phase = p?.phase ?? p?.purchase?.phase;
    if (phase === "confirmed") return p?.purchase ?? p;
    if (phase === "cancelled" || phase === "expired" || phase === "failed") {
      throw new Error(`purchase ${phase}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`confirmation timeout (last: ${JSON.stringify(last).slice(0, 160)})`);
}
