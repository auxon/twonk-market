/**
 * Twonk Watch dashboard server — loopback only.
 *
 * Serves the built Vite SPA (dashboard/dist) plus a JSON API over the
 * watcher's files. No dependencies, Node only.
 *
 *   node dashboard/server.mjs                 # 127.0.0.3:8791
 *   WATCH_HOST=127.0.0.1 WATCH_PORT=8791 node dashboard/server.mjs
 *
 *   GET  /api/state    {config, state, updatedAt}
 *   POST /api/config   validated WatchConfig -> tools/watch.config.json
 *   POST /api/run      one watch cycle now (spawns tools/watch.mjs --json)
 *   POST /api/reset    {mode: "bankroll" | "all"}
 */
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const DIST = join(here, "dist");
const CONFIG_PATH = join(ROOT, "tools", "watch.config.json");
const WATCH_BIN = join(ROOT, "tools", "watch.mjs");
const DEFAULT_STATE = join(ROOT, "data", "watch-state.json");

const HOST = process.env.WATCH_HOST ?? "127.0.0.3";
const PORT = Number(process.env.WATCH_PORT ?? 8791);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  const buf = Buffer.from(body);
  res.writeHead(status, { "content-type": type, "content-length": buf.length });
  res.end(buf);
}

const ok = (res, data) => send(res, 200, JSON.stringify(data));
const fail = (res, status, code, message) => send(res, status, JSON.stringify({ error: { code, message } }));

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => {
      raw += c;
      if (raw.length > 256 * 1024) {
        req.destroy();
        reject(new Error("body too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function readState() {
  if (!existsSync(DEFAULT_STATE)) return { state: null, updatedAt: null };
  try {
    const st = statSync(DEFAULT_STATE);
    return { state: JSON.parse(readFileSync(DEFAULT_STATE, "utf8")), updatedAt: st.mtime.toISOString() };
  } catch {
    return { state: null, updatedAt: null };
  }
}

function validateConfig(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("config must be an object");
  const { collections, maxPriceSats, rankTopN = 3, feeBps, paperBankrollSats, pollSecs } = raw;
  if (!Array.isArray(collections) || !collections.every((c) => typeof c === "string" && c.length <= 128)) {
    throw new Error("collections must be an array of strings");
  }
  if (maxPriceSats !== null && (!Number.isInteger(maxPriceSats) || maxPriceSats < 1)) {
    throw new Error("maxPriceSats must be null or a positive integer");
  }
  if (!Number.isInteger(rankTopN) || rankTopN < 1 || rankTopN > 25) {
    throw new Error("rankTopN must be an integer 1..25");
  }
  if (!Number.isInteger(feeBps) || feeBps < 0 || feeBps > 10000) {
    throw new Error("feeBps must be an integer 0..10000");
  }
  if (!Number.isInteger(paperBankrollSats) || paperBankrollSats < 1) {
    throw new Error("paperBankrollSats must be a positive integer");
  }
  if (!Number.isInteger(pollSecs) || pollSecs < 30) {
    throw new Error("pollSecs must be an integer >= 30");
  }
  const { jevEnabled, jevMinConfidence, jevMaxPerCycle } = raw;
  if (typeof jevEnabled !== "boolean") {
    throw new Error("jevEnabled must be a boolean");
  }
  if (typeof jevMinConfidence !== "number" || !(jevMinConfidence >= 0 && jevMinConfidence <= 1)) {
    throw new Error("jevMinConfidence must be a number in [0, 1]");
  }
  if (!Number.isInteger(jevMaxPerCycle) || jevMaxPerCycle < 1 || jevMaxPerCycle > 50) {
    throw new Error("jevMaxPerCycle must be an integer 1..50");
  }
  const { dropsEnabled = true, dropsPollLimit = 20, dropsWebhookUrl = null, dropsKeywords = [] } = raw;
  if (typeof dropsEnabled !== "boolean") {
    throw new Error("dropsEnabled must be a boolean");
  }
  if (!Number.isInteger(dropsPollLimit) || dropsPollLimit < 5 || dropsPollLimit > 100) {
    throw new Error("dropsPollLimit must be an integer 5..100");
  }
  if (dropsWebhookUrl !== null && (typeof dropsWebhookUrl !== "string" || dropsWebhookUrl.length > 500 || (dropsWebhookUrl.trim() !== "" && !/^https?:\/\//.test(dropsWebhookUrl.trim())))) {
    throw new Error("dropsWebhookUrl must be null or an http(s) URL");
  }
  if (!Array.isArray(dropsKeywords) || !dropsKeywords.every((k) => typeof k === "string" && k.length <= 64)) {
    throw new Error("dropsKeywords must be an array of strings (max 64 chars each)");
  }
  const { liveBuyEnabled = false, liveBuyDryRun = true, liveBuyMaxUsd = 6, liveBuyMinConfidence = 0.7, liveBuyMaxPerCycle = 1, liveBuyQuantity = 1 } = raw;
  if (typeof liveBuyEnabled !== "boolean") {
    throw new Error("liveBuyEnabled must be a boolean");
  }
  if (typeof liveBuyDryRun !== "boolean") {
    throw new Error("liveBuyDryRun must be a boolean");
  }
  if (typeof liveBuyMaxUsd !== "number" || !(liveBuyMaxUsd >= 0.01 && liveBuyMaxUsd <= 10000)) {
    throw new Error("liveBuyMaxUsd must be a number in [0.01, 10000]");
  }
  if (typeof liveBuyMinConfidence !== "number" || !(liveBuyMinConfidence >= 0 && liveBuyMinConfidence <= 1)) {
    throw new Error("liveBuyMinConfidence must be a number in [0, 1]");
  }
  if (!Number.isInteger(liveBuyMaxPerCycle) || liveBuyMaxPerCycle < 1 || liveBuyMaxPerCycle > 5) {
    throw new Error("liveBuyMaxPerCycle must be an integer 1..5");
  }
  if (!Number.isInteger(liveBuyQuantity) || liveBuyQuantity < 1 || liveBuyQuantity > 100) {
    throw new Error("liveBuyQuantity must be an integer 1..100");
  }
  return { collections, maxPriceSats, rankTopN, feeBps, paperBankrollSats, pollSecs, jevEnabled, jevMinConfidence, jevMaxPerCycle, dropsEnabled, dropsPollLimit, dropsWebhookUrl: dropsWebhookUrl === "" ? null : dropsWebhookUrl, dropsKeywords, liveBuyEnabled, liveBuyDryRun, liveBuyMaxUsd, liveBuyMinConfidence, liveBuyMaxPerCycle, liveBuyQuantity };
}

function serveStatic(req, res) {
  const url = new URL(req.url ?? "/", "http://x");
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const file = normalize(join(DIST, rel));
  if (!file.startsWith(DIST + "/") && file !== join(DIST, "index.html")) {
    return fail(res, 403, "forbidden", "nope");
  }
  const pick = existsSync(file) && statSync(file).isFile() ? file : join(DIST, "index.html");
  if (!existsSync(pick)) {
    return send(res, 503, "dashboard not built — run `npm run build` in dashboard/", "text/plain; charset=utf-8");
  }
  send(res, 200, readFileSync(pick), MIME[extname(pick)] ?? "application/octet-stream");
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://x");
    if (url.pathname === "/api/state" && req.method === "GET") {
      const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
      const { state, updatedAt } = readState();
      return ok(res, { config, state, updatedAt });
    }
    if (url.pathname === "/api/config" && req.method === "POST") {
      const body = await readJson(req);
      let config;
      try {
        config = validateConfig(body);
      } catch (e) {
        return fail(res, 400, "bad_config", e.message);
      }
      writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
      return ok(res, { ok: true });
    }
    if (url.pathname === "/api/run" && req.method === "POST") {
      const r = spawnSync(process.execPath, [WATCH_BIN, `--config=${CONFIG_PATH}`, "--json"], {
        encoding: "utf8",
        timeout: 180_000,
        maxBuffer: 16 * 1024 * 1024,
        cwd: ROOT,
      });
      if (r.error) return fail(res, 500, "cycle_failed", String(r.error.message ?? r.error).slice(0, 300));
      if (r.status !== 0) {
        return fail(res, 500, "cycle_failed", (r.stderr || r.stdout || `exit ${r.status}`).slice(0, 500));
      }
      try {
        return ok(res, { report: JSON.parse(r.stdout) });
      } catch {
        return fail(res, 500, "cycle_failed", "watcher returned non-JSON");
      }
    }
    if (url.pathname === "/api/reset" && req.method === "POST") {
      const body = await readJson(req);
      const mode = body.mode === "all" ? "all" : "bankroll";
      const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
      if (mode === "all" || !existsSync(DEFAULT_STATE)) {
        writeFileSync(DEFAULT_STATE, JSON.stringify({ seen: {}, floors: {}, paper: [], bankrollSats: config.paperBankrollSats, dropsSeen: {}, drops: [], dropsCheckedAt: null, liveBuys: [] }, null, 2));
      } else {
        const { state } = readState();
        const next = state ?? { seen: {}, floors: {}, paper: [], bankrollSats: null, dropsSeen: {}, drops: [], dropsCheckedAt: null, liveBuys: [] };
        next.bankrollSats = config.paperBankrollSats;
        if (!next.dropsSeen || typeof next.dropsSeen !== "object") next.dropsSeen = {};
        if (!Array.isArray(next.drops)) next.drops = [];
        if (!Array.isArray(next.liveBuys)) next.liveBuys = [];
        writeFileSync(DEFAULT_STATE, JSON.stringify(next, null, 2));
      }
      return ok(res, { ok: true });
    }
    if (url.pathname.startsWith("/api/")) return fail(res, 404, "not_found", "no such endpoint");
    if (req.method === "GET" || req.method === "HEAD") return serveStatic(req, res);
    return fail(res, 405, "method_not_allowed", "use GET");
  } catch (e) {
    return fail(res, 500, "internal", e instanceof Error ? e.message : "boom");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`twonk watch dashboard: http://${HOST}:${PORT}/ (loopback only)`);
});
