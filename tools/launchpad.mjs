/**
 * Twetch Launchpad client — status (public) + mint flow (authed).
 *
 * When @0 announces a launch, the drop goes live under the Launchpad section
 * (https://twetch.com/launchpad) backed by `https://api.twetch.com/v1/launchpad/*`.
 * Verified against the live site + its own JS bundle:
 *
 *   GET  /v1/launchpad/{contractHex}/status          (public, safe)
 *     -> {available, confirmedMinted, mintEnded, mintingEnabled, reserved, supply}
 *   GET  /v1/launchpad/{contractHex}/purchases        (authed)
 *   POST /v1/launchpad/{contractHex}/quote   {quantity}              (authed)
 *   POST /v1/launchpad/{contractHex}/approve  {...}                   (authed)
 *   POST /v1/launchpad/{contractHex}/purchases/{attempt}/prepare {funding} (authed)
 *   POST .../submit {buyerTxHex}  (authed — the spend happens here)
 *   GET  .../purchases/{attempt}  (authed — poll to confirmed)
 *   POST .../reveal {count}       (authed)
 *   POST .../cancel {}            (authed — releases the attempt)
 *
 * Auth (same scheme the daemon and the web client use):
 *   x-twetch-user: <userId>      x-twetch-ts: <ms>
 *   x-twetch-sig: BSM("METHOD\n/path\n<userId>\n<ts>\n<body>")  (body = raw JSON, '' for GET)
 * The signing key is the Twetch account key (NOT the daemon identity key).
 * It arrives via TWETCH_MINT_WIF env (or keys.json `mint`, same held-key
 * pattern as tools/transfer.mjs) — never committed, never logged.
 *
 * Safety: every mutating step validates the server response shape and the
 * quote economics (unitPrice*qty+fee <= maximumDebit, fee <= maxFee, expiry)
 * before proceeding; anything unexpected aborts with no spend.
 */
import { BSM, PrivateKey } from "@bsv/sdk";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const TWETCH_API = process.env.TWETCH_API ?? "https://api.twetch.com";
const CONTRACT_RE = /^[0-9a-f]{64}$/i;
const ATTEMPT_RE = /^[a-zA-Z0-9-]{1,80}$/;

/** Load the mint signing key: env first, then keys.json `mint`. Never logged. */
export function loadMintKey() {
  const wif = (process.env.TWETCH_MINT_WIF ?? "").trim();
  if (wif) return PrivateKey.fromWif(wif);
  const path = process.env.TWONK_KEYS ?? join(homedir(), ".config", "twonk-market", "keys.json");
  if (existsSync(path)) {
    try {
      const raw = JSON.parse(readFileSync(path, "utf8"));
      const maybe = raw?.mint?.wif ?? raw?.mint;
      if (typeof maybe === "string" && maybe.trim()) return PrivateKey.fromWif(maybe.trim());
    } catch {
      // fall through to null
    }
  }
  return null;
}

export function mintAddressOf(priv) {
  return priv.toAddress();
}

/** Twetch userId for a pubkey (keyless read). */
export async function userIdByPubkey(pubkeyHex, { fetchFn = fetch, timeoutMs = 15_000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchFn(`${TWETCH_API}/v1/auth/user-by-pubkey/${pubkeyHex}`, {
      headers: { accept: "application/json", "user-agent": "twonk-market-launchpad/1.0" },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`user-by-pubkey ${res.status}`);
    const body = await res.json().catch(() => ({}));
    const id = Math.floor(Number(body.userId ?? 0));
    if (!(id > 0)) throw new Error("no Twetch user for this key");
    return id;
  } finally {
    clearTimeout(timer);
  }
}

/** Public drop status. Safe to poll; never spends. */
export async function launchStatus(contractHex, { fetchFn = fetch, timeoutMs = 15_000 } = {}) {
  if (!CONTRACT_RE.test(contractHex ?? "")) throw new Error("bad contract id");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchFn(`${TWETCH_API}/v1/launchpad/${contractHex.toLowerCase()}/status`, {
      headers: { accept: "application/json", "user-agent": "twonk-market-launchpad/1.0" },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`launchpad status ${res.status}`);
    const s = await res.json().catch(() => ({}));
    for (const k of ["available", "confirmedMinted", "supply"]) {
      if (!Number.isInteger(s[k]) || s[k] < 0) throw new Error(`bad status field ${k}`);
    }
    return {
      available: s.available,
      confirmedMinted: s.confirmedMinted,
      mintEnded: s.mintEnded === true,
      mintingEnabled: s.mintingEnabled === true,
      reserved: Number.isInteger(s.reserved) ? s.reserved : 0,
      supply: s.supply,
      live: s.mintingEnabled === true && s.mintEnded !== true && s.available > 0,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Authed API client. Signs the exact bytes it sends (server verifies raw body). */
export class LaunchpadAuthed {
  constructor(priv, userId) {
    this.priv = priv;
    this.userId = userId;
  }

  static async fromKey(priv, { fetchFn = fetch } = {}) {
    const pubHex = priv.toPublicKey().toString();
    const userId = await userIdByPubkey(pubHex, { fetchFn });
    return new LaunchpadAuthed(priv, userId);
  }

  sigBytes(method, path, ts, bodyStr) {
    const msg = `${method}\n${path}\n${this.userId}\n${ts}\n${bodyStr}`;
    return { msg, sig: BSM.sign(Array.from(Buffer.from(msg, "utf8")), this.priv) };
  }

  async call(method, path, body, { fetchFn = fetch, timeoutMs = 20_000 } = {}) {
    const ts = Date.now();
    const bodyStr = body === undefined ? "" : JSON.stringify(body);
    const { sig } = this.sigBytes(method, path, ts, bodyStr);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetchFn(`${TWETCH_API}${path}`, {
        method,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "user-agent": "twonk-market-launchpad/1.0",
          "x-twetch-user": String(this.userId),
          "x-twetch-ts": String(ts),
          "x-twetch-sig": String(sig),
        },
        ...(body === undefined ? {} : { body: bodyStr }),
        signal: ctrl.signal,
      });
      const text = await res.text();
      if (!res.ok) {
        let detail = "";
        try {
          detail = JSON.parse(text)?.error ?? "";
        } catch {
          detail = text;
        }
        throw Object.assign(new Error(`${method} ${path} -> ${res.status}${detail ? `: ${detail}` : ""}`), { status: res.status });
      }
      return text ? JSON.parse(text) : {};
    } finally {
      clearTimeout(timer);
    }
  }

  get(path, opts) {
    return this.call("GET", path, undefined, opts);
  }

  post(path, body, opts) {
    return this.call("POST", path, body ?? {}, opts);
  }
}

const int = (v) => (Number.isSafeInteger(v) && v >= 0 ? v : null);

/**
 * Request a mint quote. Creates a server-side attempt (expirable, cancellable).
 * Validates the economics; throws on anything unexpected. No spend.
 */
export function validateQuote(q, { quantity, maxUsdSatsHint = null } = {}) {
  if (!q || typeof q !== "object") throw new Error("empty quote");
  const attemptId = typeof q.attemptId === "string" && ATTEMPT_RE.test(q.attemptId) ? q.attemptId : null;
  const qty = int(q.quantity);
  const unit = int(q.unitPriceSats);
  const subtotal = int(q.subtotalSats);
  const maxDebit = int(q.maximumDebitSats);
  const maxFee = int(q.maximumNetworkFeeSats);
  const expires = Number(q.expiresAtMs);
  if (!attemptId || qty !== quantity || unit == null || unit <= 0) throw new Error("bad quote (id/qty/price)");
  if (subtotal !== unit * qty) throw new Error("bad quote (subtotal mismatch)");
  if (maxDebit == null || maxDebit < subtotal) throw new Error("bad quote (max debit)");
  if (maxFee == null) throw new Error("bad quote (max fee)");
  if (!(expires > Date.now() + 5_000)) throw new Error("quote already expired");
  if (maxUsdSatsHint != null && subtotal > maxUsdSatsHint) {
    throw Object.assign(new Error(`quote ${subtotal} sats exceeds $${(maxUsdSatsHint / 1e8).toFixed(2)}-in-sats cap`), { code: "OVER_CAP" });
  }
  return { attemptId, quantity: qty, unitPriceSats: unit, subtotalSats: subtotal, maximumDebitSats: maxDebit, maximumNetworkFeeSats: maxFee, expiresAtMs: expires, raw: q };
}

export function basePath(contractHex) {
  if (!CONTRACT_RE.test(contractHex ?? "")) throw new Error("bad contract id");
  return `/v1/launchpad/${contractHex.toLowerCase()}`;
}

/** UTXO selection mirroring the web client's funding rules (P2PKH >546, big first). */
export function selectFunding(utxos, needSats, limit = 200) {
  const seen = new Set();
  const cands = [];
  for (const u of utxos ?? []) {
    if (!u || typeof u.txid !== "string" || !/^[0-9a-f]{64}$/i.test(u.txid)) continue;
    if (!Number.isSafeInteger(u.vout) || u.vout > 0xffffffff) continue;
    if (!Number.isSafeInteger(u.satoshis) || u.satoshis <= 546) continue;
    if (typeof u.scriptHex !== "string" || !/^76a914[0-9a-f]{40}88ac$/i.test(u.scriptHex)) continue;
    const k = `${u.txid.toLowerCase()}:${u.vout}`;
    if (seen.has(k)) continue;
    seen.add(k);
    cands.push({ txid: u.txid.toLowerCase(), vout: u.vout, satoshis: u.satoshis, scriptHex: u.scriptHex });
  }
  cands.sort((a, b) => b.satoshis - a.satoshis || (a.txid < b.txid ? -1 : 1) || a.vout - b.vout);
  const picked = [];
  let total = 0;
  for (const c of cands.slice(0, limit)) {
    picked.push({ txid: c.txid, vout: c.vout, satoshis: c.satoshis, scriptHex: c.scriptHex });
    total += c.satoshis;
    if (!Number.isSafeInteger(total)) throw new Error("balance overflow");
    if (total >= needSats) break;
  }
  if (total < needSats) throw new Error(`insufficient mint funds: have ${total}, need ${needSats}`);
  return { inputs: picked, totalSats: total };
}

/** P2PKH script for an address (same 76a914..88ac pattern the client funds). */
export function p2pkhScriptHex(address) {
  const ALPHA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let n = 0n;
  for (const c of address) {
    const v = ALPHA.indexOf(c);
    if (v < 0) throw new Error("bad address");
    n = n * 58n + BigInt(v);
  }
  let h = n.toString(16);
  if (h.length % 2) h = "0" + h;
  const bytes = Array.from(Buffer.from(h, "hex"));
  while (bytes.length < 25) bytes.unshift(0);
  const pkh = Buffer.from(bytes.slice(1, 21)).toString("hex");
  return `76a914${pkh}88ac`;
}
