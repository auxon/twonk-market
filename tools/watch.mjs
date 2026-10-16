/**
 * Twonk watcher — monitor Twetch NFT listings and paper-trade the mispriced ones.
 *
 * Paper trading moves no sats, ever. Separately, fresh @0 Twonk drops can be
 * bought with REAL BSV when liveBuyEnabled is true: Jev decides buy/hold per
 * drop against a USD cap (default $6), then the launchpad mint flow runs
 * (quote -> approve -> prepare -> sign -> submit -> reveal). Dry-run is the
 * default even when enabled (liveBuyDryRun), so arming live spends takes two
 * explicit config flips plus TWETCH_MINT_WIF.
 *
 * Each cycle it reads the live market through the bsvOS
 * daemon (`bsv twetch market …`, JSON on stdout), scores new listings against
 * collection floors, logs PAPER BUY signals, and settles old signals against
 * sales/delistings to score the strategy.
 *
 * Usage:
 *   node tools/watch.mjs                  # one cycle, default config
 *   node tools/watch.mjs --loop           # poll every pollSecs forever
 *   node tools/watch.mjs --config path    # alternate config file
 *   node tools/watch.mjs --json           # machine-readable summary on stdout
 *
 * Config (tools/watch.config.json): collections allowlist (substring match
 * against collection id or name, empty = all), maxPriceSats cap,
 * rankTopN (cheapest N listings vs floor go to Jev each cycle, default 3),
 * feeBps applied on paper closes (default 690 = the ~6.9% observed on
 * NOOGIES #2108), paperBankrollSats starting play money, pollSecs loop
 * interval, jevEnabled + jevMinConfidence + jevMaxPerCycle for the Jev screen.
 *
 * The Jev screen (needs OPENROUTER_API_KEY): each rule-passing candidate
 * gets one buy/hold choice; only confident buys open paper trades, the rest
 * log as HOLD with the verdict. Open trades get a hold/sell screen; confident
 * sells abandon the paper position. Without a key (or with jevEnabled false)
 * entries fall back to rules-only, flagged as such — paper never spends, so
 * nothing fails closed except live buys, which don't exist yet.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { jevConfigured, jevDecide } from "./jev.mjs";
import { checkDrops } from "./drops.mjs";
import { LaunchpadAuthed, launchStatus, loadMintKey } from "./launchpad.mjs";
import { evaluateDropBuy, extractContractHex, getBsvUsdPrice } from "./livebuy.mjs";

const here = dirname(fileURLToPath(import.meta.url));

function arg(name, fallback) {
  const eq = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && i + 1 < process.argv.length) return process.argv[i + 1];
  return fallback;
}

const DEFAULT_CONFIG = {
  collections: [],
  maxPriceSats: null,
  rankTopN: 3,
  feeBps: 690,
  paperBankrollSats: 10_000_000,
  pollSecs: 300,
  stateDir: join(here, "..", "data"),
  jevEnabled: true,
  jevMinConfidence: 0.6,
  jevMaxPerCycle: 10,
  dropsEnabled: true,
  dropsPollLimit: 20,
  dropsWebhookUrl: null,
  dropsKeywords: [],
  liveBuyEnabled: false,
  liveBuyDryRun: true,
  liveBuyMaxUsd: 6,
  liveBuyMinConfidence: 0.7,
  liveBuyMaxPerCycle: 1,
  liveBuyQuantity: 1,
};

/** Choice sets for the Jev screen. Entries buy or pass; exits hold or bail. */
const ENTRY_OPTIONS = {
  buy: "buy now at this price versus the collection floor — a genuine mispricing",
  hold: "pass — fairly priced, overpriced, or too uncertain to buy",
};
const EXIT_OPTIONS = {
  hold: "keep tracking this open paper position",
  sell: "abandon — exit the paper position now, the edge is gone",
};

function loadConfig() {
  const path = resolve(arg("config", join(here, "watch.config.json")));
  let file = {};
  if (existsSync(path)) {
    try {
      file = JSON.parse(readFileSync(path, "utf8"));
    } catch (e) {
      console.error(`bad config ${path}: ${(e instanceof Error ? e.message : e)}`);
      process.exit(2);
    }
  }
  return { ...DEFAULT_CONFIG, ...file };
}

/** Run the bsv CLI and parse its JSON stdout. Throws with a human hint. */
function bsv(args) {
  let out;
  try {
    out = execFileSync("bsv", args, { encoding: "utf8", timeout: 60_000, maxBuffer: 8 * 1024 * 1024 });
  } catch (e) {
    const detail = e.stdout?.toString?.().slice(0, 200) ?? e.message;
    throw new Error(`bsv ${args.join(" ")} failed — is the daemon running (bsv status)? ${detail}`);
  }
  try {
    return JSON.parse(out);
  } catch {
    throw new Error(`bsv ${args.join(" ")} returned non-JSON: ${out.slice(0, 200)}`);
  }
}

function matchCollection(cfg, listing) {
  if (!cfg.collections.length) return true;
  const hay = `${listing.collection ?? ""} ${listing.collectionName ?? ""} ${listing.name ?? ""}`.toLowerCase();
  return cfg.collections.some((c) => hay.includes(String(c).toLowerCase()));
}

function loadState(dir) {
  const path = join(dir, "watch-state.json");
  if (!existsSync(path)) {
    return { seen: {}, floors: {}, paper: [], bankrollSats: null, dropsSeen: {}, drops: [], dropsCheckedAt: null, liveBuys: [] };
  }
  try {
    const s = JSON.parse(readFileSync(path, "utf8"));
    if (!s.dropsSeen || typeof s.dropsSeen !== "object") s.dropsSeen = {};
    if (!Array.isArray(s.drops)) s.drops = [];
    if (!("dropsCheckedAt" in s)) s.dropsCheckedAt = null;
    if (!Array.isArray(s.liveBuys)) s.liveBuys = [];
    if (!s.seen || typeof s.seen !== "object") s.seen = {};
    if (!s.floors || typeof s.floors !== "object") s.floors = {};
    if (!Array.isArray(s.paper)) s.paper = [];
    return s;
  } catch {
    return { seen: {}, floors: {}, paper: [], bankrollSats: null, dropsSeen: {}, drops: [], dropsCheckedAt: null, liveBuys: [] };
  }
}

function saveState(dir, state) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "watch-state.json"), JSON.stringify(state, null, 2));
}

async function cycle(cfg, state) {
  const report = { at: new Date().toISOString(), signals: [], settled: [], held: [], unfunded: [], errors: [] };
  const jev = { enabled: cfg.jevEnabled === true, configured: jevConfigured(), judged: 0 };
  report.jev = jev;
  let listings = [];
  let sales = [];
  let collections = [];
  try {
    listings = bsv(["twetch", "market", "listings", "--limit=50"]).items ?? [];
  } catch (e) {
    report.errors.push(e.message);
  }
  try {
    sales = bsv(["twetch", "market", "sales", "--limit=50"]).items ?? [];
  } catch (e) {
    report.errors.push(e.message);
  }
  try {
    collections = bsv(["twetch", "market", "collections", "--limit=50"]).items ?? [];
  } catch (e) {
    report.errors.push(e.message);
  }

  // Floors: prefer the collections view, fall back to min recent sale.
  const floors = {};
  for (const c of collections) {
    if (c.contractAddress && c.floorSats > 0) floors[c.contractAddress] = { floorSats: c.floorSats, source: "collections", numListings: c.numListings };
  }
  for (const s of sales) {
    const key = s.collection;
    if (!key || !s.priceSats) continue;
    if (!floors[key] || s.priceSats < floors[key].floorSats) {
      floors[key] = { floorSats: s.priceSats, source: "sales", numListings: null };
    }
  }
  state.floors = floors;
  if (state.bankrollSats == null) state.bankrollSats = cfg.paperBankrollSats;

  const liveIds = new Set(listings.map((l) => l.id));
  const salesKeys = new Set(sales.map((s) => `${s.collection}:${s.outpoint}`));

  // Settle open paper trades first (cheaper than signals: uses this cycle's data).
  for (const t of state.paper) {
    if (t.status !== "open") continue;
    const saleKey = `${t.collection}:${t.outpoint}`;
    if (salesKeys.has(saleKey)) {
      const sale = sales.find((s) => `${s.collection}:${s.outpoint}` === saleKey);
      const gross = sale?.priceSats ?? t.priceSats;
      const net = Math.floor((gross * (10_000 - cfg.feeBps)) / 10_000);
      t.status = "closed-sold";
      t.closePriceSats = gross;
      t.netSats = net;
      t.pnlSats = net - t.priceSats;
      t.closedAt = report.at;
      state.bankrollSats += net;
      report.settled.push(t);
    } else if (!liveIds.has(t.listingId)) {
      t.status = "closed-gone";
      t.closedAt = report.at;
      state.bankrollSats += t.priceSats; // delisted: paper funds return, no fee
      report.settled.push(t);
    }
  }

  // Jev exit screen: hold or abandon each surviving open trade.
  for (const t of state.paper) {
    if (t.status !== "open") continue;
    if (!jev.enabled || !jev.configured || jev.judged >= cfg.jevMaxPerCycle) continue;
    try {
      const v = await jevDecide(
        { position: t.name, collection: t.collection, paid_sats: t.priceSats, floor_sats: t.floorSats },
        EXIT_OPTIONS,
      );
      jev.judged++;
      t.exitJev = { ...v, at: report.at };
      if (v.decision === "sell" && v.confidence >= cfg.jevMinConfidence) {
        t.status = "closed-abandoned";
        t.closedAt = report.at;
        state.bankrollSats += t.priceSats; // abandoned: funds return, no fee, no sale
        report.settled.push(t);
      }
    } catch (e) {
      report.errors.push(`jev exit ${t.name}: ${e.message}`);
    }
  }

  // Score new listings: cheap filters first (free), rank by premium,
  // bankroll second, Jev last (paid). The old threshold gate ("X% under
  // floor") could never fire — the floor IS the minimum — so each cycle now
  // ranks fresh listings by premium over floor and Jev picks from the top N.
  const ranked = [];
  for (const l of listings) {
    if (l.status && l.status !== "listed") continue;
    if (state.seen[l.id]) continue;
    state.seen[l.id] = report.at;
    if (!matchCollection(cfg, l)) continue;
    if (cfg.maxPriceSats != null && l.priceSats > cfg.maxPriceSats) continue;
    const floor = floors[l.collection]?.floorSats ?? 0;
    if (!(floor > 0)) continue;
    ranked.push({ l, floor, premium: l.priceSats / floor - 1 });
  }
  ranked.sort((a, b) => a.premium - b.premium || a.l.priceSats - b.l.priceSats || a.l.id - b.l.id);
  const topN = Math.max(1, Math.min(25, Math.floor(cfg.rankTopN ?? 3)));
  const candidates = ranked.slice(0, topN);
  let keyWarned = false;
  for (const { l, floor, premium } of candidates) {
    const pct = Math.round(premium * 100);
    const reason = `rank vs floor ${pct >= 0 ? "+" : ""}${pct}% (floor ${floor})`;
    if (l.priceSats > state.bankrollSats) {
      report.unfunded.push({ name: l.name, priceSats: l.priceSats, floorSats: floor, reason, url: l.url });
      continue;
    }
    // Jev entry screen: buy, or hold with the verdict on record.
    let entryJev = null;
    if (jev.enabled) {
      if (!jev.configured) {
        if (!keyWarned) {
          report.errors.push("jev: no key (export OPENROUTER_API_KEY) — entries are rules-only this cycle");
          keyWarned = true;
        }
      } else if (jev.judged >= cfg.jevMaxPerCycle) {
        report.held.push({ name: l.name, priceSats: l.priceSats, decision: "hold", confidence: null, note: "jev budget spent" });
        continue;
      } else {
        try {
          entryJev = await jevDecide(
            {
              listing: l.name,
              collection: l.collectionName ?? l.collection,
              price_sats: l.priceSats,
              floor_sats: floor,
              premium_pct: pct,
              rarity: l.rarity,
            },
            ENTRY_OPTIONS,
          );
          jev.judged++;
        } catch (e) {
          report.held.push({ name: l.name, priceSats: l.priceSats, decision: "hold", confidence: null, note: `jev failed: ${e.message}` });
          report.errors.push(`jev entry ${l.name}: ${e.message}`);
          continue;
        }
        if (entryJev.decision !== "buy" || entryJev.confidence < cfg.jevMinConfidence) {
          report.held.push({ name: l.name, priceSats: l.priceSats, decision: entryJev.decision, confidence: entryJev.confidence, note: "below bar" });
          continue;
        }
      }
    }
    const trade = {
      id: `paper_${l.id}`,
      status: "open",
      openedAt: report.at,
      listingId: l.id,
      name: l.name,
      collection: l.collection,
      collectionName: l.collectionName,
      outpoint: l.outpoint,
      priceSats: l.priceSats,
      floorSats: floor,
      reasons: [reason],
      url: l.url,
      jev: entryJev ? { ...entryJev, at: report.at } : null,
    };
    state.paper.push(trade);
    state.bankrollSats -= l.priceSats;
    report.signals.push(trade);
  }

  report.bankrollSats = state.bankrollSats;
  report.openTrades = state.paper.filter((t) => t.status === "open").length;
  report.listingsSeen = listings.length;

  // Official @0 Twonk drop alerts (direct Twetch API; daemon blocks id 0).
  // Never fails the cycle: errors land in report.errors.
  report.drops = { enabled: cfg.dropsEnabled !== false, checked: false, fetched: 0, newDrops: [], totalDrops: state.drops?.length ?? 0 };
  if (cfg.dropsEnabled !== false) {
    try {
      const r = await checkDrops(cfg, state);
      report.drops.checked = true;
      report.drops.fetched = r.fetched;
      report.drops.newDrops = r.newDrops;
      report.drops.totalDrops = state.drops.length;
      if (r.error) report.errors.push(`drops: ${r.error}`);
    } catch (e) {
      report.errors.push(`drops: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Live drop buying (Jev-gated, real BSV, default $6 cap). Disabled by
  // default; dry-run by default. Never fails the cycle.
  report.liveBuys = { enabled: cfg.liveBuyEnabled === true, dryRun: cfg.liveBuyDryRun !== false, actions: [], totalBuys: state.liveBuys.length };
  if (cfg.liveBuyEnabled === true) {
    try {
      await runLiveBuys(cfg, state, report, jev);
      report.liveBuys.totalBuys = state.liveBuys.length;
    } catch (e) {
      report.errors.push(`livebuy: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return report;
}

/**
 * Jev-gated live minting for fresh drops. Status checks (public, safe) run
 * for every new drop; full evaluation (quote + Jev + conditional spend) for
 * at most liveBuyMaxPerCycle live ones.
 */
async function runLiveBuys(cfg, state, report, jev) {
  const fresh = (report.drops.newDrops ?? []).filter((d) => d.kind === "drop");
  if (!fresh.length) return;
  const maxEval = Math.max(1, Math.min(5, Math.floor(cfg.liveBuyMaxPerCycle ?? 1)));

  // Phase 1: public status for every fresh drop (safe, keyless, informative
  // even with live buying unarmed).
  const live = [];
  for (const d of fresh) {
    const contract = extractContractHex(d);
    if (!contract) {
      pushLiveBuy(state, report, { dropId: d.id, contract, kind: d.kind, at: report.at, action: "skipped", reason: "no collection link — cannot query launchpad status" });
      continue;
    }
    let status = null;
    try {
      status = await launchStatus(contract);
    } catch (e) {
      pushLiveBuy(state, report, { dropId: d.id, contract, kind: d.kind, at: report.at, action: "failed", reason: `status failed: ${e.message}` });
      continue;
    }
    if (!status.live) {
      pushLiveBuy(state, report, { dropId: d.id, contract, kind: d.kind, at: report.at, action: "skipped", reason: status.mintEnded ? "mint ended" : "not live (sold out or not started)", status });
      continue;
    }
    live.push({ d, contract, status });
  }
  if (!live.length) return;

  // Phase 2: key + price + auth, then Jev-gated evaluation (at most maxEval).
  let mintPriv = null;
  let mintAddress = null;
  try {
    mintPriv = loadMintKey();
    if (mintPriv) mintAddress = String(mintPriv.toAddress());
  } catch (e) {
    for (const { d, contract, status } of live) pushLiveBuy(state, report, { dropId: d.id, contract, kind: d.kind, at: report.at, action: "failed", reason: `bad mint key: ${e.message}`, status });
    return;
  }
  if (!mintPriv) {
    for (const { d, contract, status } of live) pushLiveBuy(state, report, { dropId: d.id, contract, kind: d.kind, at: report.at, action: "skipped", reason: "live drop — needs TWETCH_MINT_WIF (held mint key)", status });
    return;
  }
  let priceUsd = null;
  let authed = null;
  try {
    const p = await getBsvUsdPrice();
    priceUsd = p.price;
    report.liveBuys.priceUsd = p.price;
    report.liveBuys.priceSource = p.source;
  } catch (e) {
    for (const { d, contract, status } of live) pushLiveBuy(state, report, { dropId: d.id, contract, kind: d.kind, at: report.at, action: "failed", reason: `price unavailable: ${e.message}`, status });
    return;
  }
  try {
    authed = await LaunchpadAuthed.fromKey(mintPriv);
  } catch (e) {
    for (const { d, contract, status } of live) pushLiveBuy(state, report, { dropId: d.id, contract, kind: d.kind, at: report.at, action: "failed", reason: `mint auth failed: ${e.message}`, status });
    return;
  }

  let evaluated = 0;
  for (const { d, contract, status } of live) {
    if (evaluated >= maxEval) {
      pushLiveBuy(state, report, { dropId: d.id, contract, kind: d.kind, at: report.at, action: "skipped", reason: "live-buy evaluation budget spent this cycle", status });
      continue;
    }
    evaluated++;
    const action = await evaluateDropBuy({
      cfg, drop: d, status, authed, mintPriv, mintAddress, priceUsd,
      jev: { configured: jev.configured },
      jevJudge: (s, opts) => jevDecide(s, opts),
      judged: jev,
    });
    pushLiveBuy(state, report, { ...action, status });
  }
  if (state.liveBuys.length > 100) state.liveBuys = state.liveBuys.slice(-100);
}

function pushLiveBuy(state, report, action) {
  state.liveBuys.push(action);
  report.liveBuys.actions.push(action);
}

function jevBadge(t) {
  const j = t.jev ?? t.exitJev;
  if (!j || !j.decision) return "rules-only";
  return `jev:${j.decision} ${(j.confidence ?? 0).toFixed(2)}`;
}

function printHuman(cfg, report) {
  const j = report.jev;
  const jevNote = j.enabled ? (j.configured ? `jev on (${j.judged} judged)` : "jev off (no key)") : "jev off (disabled)";
  const d = report.drops;
  const dropsNote = !d || !d.enabled ? "drops off" : !d.checked ? "drops unchecked" : d.newDrops.length ? `${d.newDrops.length} NEW DROP${d.newDrops.length > 1 ? "S" : ""}` : `drops ok (${d.totalDrops} tracked)`;
  console.log(`watch ${report.at} — ${report.listingsSeen} listings live, bankroll ${report.bankrollSats} sats (${report.openTrades} open) [${jevNote}; ${dropsNote}]`);
  for (const drop of d?.newDrops ?? []) {
    console.log(`DROP [${drop.kind}] @0 #${drop.id} ${drop.snippet} ${drop.postUrl}`);
  }
  const lb = report.liveBuys;
  if (lb?.enabled) {
    const tag = lb.dryRun ? "dry-run" : "LIVE";
    for (const a of lb.actions ?? []) {
      const what = a.action === "bought" ? `BOUGHT ${a.buyTxid ?? ""}`.trim() : a.action.toUpperCase();
      console.log(`LIVEBUY [${tag}] ${what} @0 #${a.dropId} ${a.contract ? a.contract.slice(0, 12) + "…" : "(no contract)"} — ${a.reason}`);
    }
    if (!(lb.actions ?? []).length) console.log(`LIVEBUY [${tag}] no fresh drops to evaluate`);
  }
  for (const t of report.signals) {
    console.log(`PAPER BUY ${t.name} @ ${t.priceSats} sats (${t.reasons.join("; ")}) floor ${t.floorSats} [${jevBadge(t)}] ${t.url}`);
  }
  for (const h of report.held) {
    console.log(`HOLD ${h.name} @ ${h.priceSats} sats (jev:${h.decision ?? "?"}${h.confidence != null ? ` ${h.confidence.toFixed(2)}` : ""}${h.note ? ` — ${h.note}` : ""})`);
  }
  for (const u of report.unfunded) {
    console.log(`UNFUNDED ${u.name} @ ${u.priceSats} sats exceeds bankroll (${u.reason}) ${u.url}`);
  }
  for (const t of report.settled) {
    if (t.status === "closed-sold") {
      console.log(`CLOSED ${t.name}: sold ${t.closePriceSats} (net ${t.netSats}) pnl ${t.pnlSats >= 0 ? "+" : ""}${t.pnlSats} sats`);
    } else if (t.status === "closed-abandoned") {
      console.log(`CLOSED ${t.name}: abandoned on jev:sell [${jevBadge(t)}], funds returned`);
    } else {
      console.log(`CLOSED ${t.name}: gone (delisted/expired), funds returned`);
    }
  }
  for (const e of report.errors) console.error(`warn: ${e}`);
}

async function main() {
  const cfg = loadConfig();
  mkdirSync(cfg.stateDir, { recursive: true });
  const asJson = process.argv.includes("--json");
  const loop = process.argv.includes("--loop");

  do {
    const state = loadState(cfg.stateDir);
    const report = await cycle(cfg, state);
    saveState(cfg.stateDir, state);
    if (asJson) console.log(JSON.stringify(report));
    else printHuman(cfg, report);
    if (!loop) break;
    const end = Date.now() + cfg.pollSecs * 1000;
    while (Date.now() < end) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.min(1000, end - Date.now()));
    }
  } while (loop);
}

main();
