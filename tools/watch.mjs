/**
 * Twonk watcher — monitor Twetch NFT listings and paper-trade the mispriced ones.
 *
 * No sats move. Ever. Each cycle it reads the live market through the bsvOS
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
 * discountVsFloor (signal when price <= floor*(1-d)), feeBps applied on
 * paper closes (default 690 = the ~6.9% observed on NOOGIES #2108),
 * paperBankrollSats starting play money, pollSecs loop interval.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
  discountVsFloor: 0.15,
  feeBps: 690,
  paperBankrollSats: 10_000_000,
  pollSecs: 300,
  stateDir: join(here, "..", "data"),
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
  if (!existsSync(path)) return { seen: {}, floors: {}, paper: [], bankrollSats: null };
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return { seen: {}, floors: {}, paper: [], bankrollSats: null };
  }
}

function saveState(dir, state) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "watch-state.json"), JSON.stringify(state, null, 2));
}

function cycle(cfg, state) {
  const report = { at: new Date().toISOString(), signals: [], settled: [], unfunded: [], errors: [] };
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

  // Score new listings.
  for (const l of listings) {
    if (l.status && l.status !== "listed") continue;
    if (state.seen[l.id]) continue;
    state.seen[l.id] = report.at;
    if (!matchCollection(cfg, l)) continue;
    if (cfg.maxPriceSats != null && l.priceSats > cfg.maxPriceSats) continue;
    const floor = floors[l.collection]?.floorSats ?? 0;
    if (!(floor > 0 && l.priceSats <= floor * (1 - cfg.discountVsFloor))) continue;
    const pct = Math.round((1 - l.priceSats / floor) * 100);
    const reason = pct >= 0 ? `${pct}% under floor ${floor}` : `${-pct}% OVER floor ${floor} (loose rule)`;
    if (l.priceSats > state.bankrollSats) {
      report.unfunded.push({ name: l.name, priceSats: l.priceSats, floorSats: floor, reason, url: l.url });
      continue;
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
    };
    state.paper.push(trade);
    state.bankrollSats -= l.priceSats;
    report.signals.push(trade);
  }

  report.bankrollSats = state.bankrollSats;
  report.openTrades = state.paper.filter((t) => t.status === "open").length;
  report.listingsSeen = listings.length;
  return report;
}

function printHuman(cfg, report) {
  console.log(`watch ${report.at} — ${report.listingsSeen} listings live, bankroll ${report.bankrollSats} sats (${report.openTrades} open)`);
  for (const t of report.signals) {
    console.log(`PAPER BUY ${t.name} @ ${t.priceSats} sats (${t.reasons.join("; ")}) floor ${t.floorSats} ${t.url}`);
  }
  for (const u of report.unfunded) {
    console.log(`UNFUNDED ${u.name} @ ${u.priceSats} sats exceeds bankroll (${u.reason}) ${u.url}`);
  }
  for (const t of report.settled) {
    if (t.status === "closed-sold") {
      console.log(`CLOSED ${t.name}: sold ${t.closePriceSats} (net ${t.netSats}) pnl ${t.pnlSats >= 0 ? "+" : ""}${t.pnlSats} sats`);
    } else {
      console.log(`CLOSED ${t.name}: gone (delisted/expired), funds returned`);
    }
  }
  for (const e of report.errors) console.error(`warn: ${e}`);
}

function main() {
  const cfg = loadConfig();
  mkdirSync(cfg.stateDir, { recursive: true });
  const asJson = process.argv.includes("--json");
  const loop = process.argv.includes("--loop");

  do {
    const state = loadState(cfg.stateDir);
    const report = cycle(cfg, state);
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
