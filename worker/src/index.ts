/**
 * twonk-market worker: static marketplace + tiny JSON API.
 * No keys here — signing happens in the seller's browser; this worker only
 * relays fully-signed transactions to WhatsOnChain (CORS-safe broadcast).
 */
const WOC_RAW = "https://api.whatsonchain.com/v1/bsv/main/tx/raw";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, { headers: CORS });
    }
    if (url.pathname === "/api/broadcast" && req.method === "POST") {
      let body;
      try {
        body = await req.json();
      } catch {
        return Response.json({ ok: false, error: "bad json" }, { status: 400, headers: CORS });
      }
      const hex = typeof body.txhex === "string" ? body.txhex.trim() : "";
      if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0 || hex.length < 200) {
        return Response.json({ ok: false, error: "txhex required" }, { status: 400, headers: CORS });
      }
      const up = await fetch(WOC_RAW, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ txhex: hex }),
      });
      const text = await up.text();
      if (!up.ok) {
        return Response.json({ ok: false, error: `upstream ${up.status}: ${text.slice(0, 200)}` }, { status: 502, headers: CORS });
      }
      return Response.json({ ok: true, txid: text.replace(/"/g, "") }, { headers: CORS });
    }
    return env.ASSETS.fetch(req);
  },
};
