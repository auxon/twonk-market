/**
 * twonkwatch edge worker: serves the Twonk Watch dashboard at
 * entangleit.com/twonkwatch with full remote control behind a cookie check.
 *
 *   /twonkwatch/login   key gate (sets HttpOnly cookie, 30d)
 *   /twonkwatch/logout  clears the cookie
 *   /twonkwatch/api/*   authed proxy to the home dashboard (tunnel origin),
 *                       injecting x-twonkwatch-key which the home server
 *                       requires — direct tunnel hits without it get 403.
 *   /twonkwatch/*       static dashboard SPA (edge build, dist-edge).
 */
interface Env {
  ASSETS: Fetcher;
  TWONKWATCH_ORIGIN: string;
  TWONKWATCH_SECRET: string;
}

const COOKIE = "twonkwatch_auth";
const MAX_AGE = 30 * 24 * 3600;

function timingSafe(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function authed(req: Request, secret: string): boolean {
  const h = req.headers.get("cookie") ?? "";
  for (const part of h.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === COOKIE && timingSafe(rest.join("=").trim(), secret)) return true;
  }
  return false;
}

function loginPage(msg = ""): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Twonk Watch — sign in</title>` +
      `<style>body{background:#0b0e13;color:#e8ecf2;font:15px/1.5 system-ui;margin:0;display:grid;place-items:center;min-height:100vh}form{border:1px solid #2a3348;border-radius:.75rem;padding:2rem;width:min(22rem,90vw)}input{width:100%;box-sizing:border-box;background:#131926;color:#e8ecf2;border:1px solid #2a3348;border-radius:.5rem;padding:.6rem;margin:.6rem 0}button{background:#7dd3fc;border:0;border-radius:.5rem;padding:.6rem 1rem;font-weight:700;width:100%}p.err{color:#fda4af}</style></head>` +
      `<body><form method="post"><h2>🔭 Twonk Watch</h2>${msg ? `<p class=err>${msg}</p>` : ""}` +
      `<input type="password" name="key" placeholder="access key" autocomplete="off" autofocus><button>Sign in</button></form></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/twonkwatch")) return new Response("not found", { status: 404 });
    const sub = url.pathname.slice("/twonkwatch".length) || "/";

    if (sub === "/login") {
      if (req.method === "POST") {
        const ct = req.headers.get("content-type") ?? "";
        let key = "";
        if (ct.includes("application/json")) {
          try {
            key = String((await req.json()).key ?? "");
          } catch {
            key = "";
          }
        } else {
          const form = await req.formData().catch(() => null);
          key = String(form?.get("key") ?? "");
        }
        if (key && timingSafe(key, env.TWONKWATCH_SECRET)) {
          return new Response(null, {
            status: 303,
            headers: {
              location: "/twonkwatch/",
              "set-cookie": `${COOKIE}=${env.TWONKWATCH_SECRET}; Path=/twonkwatch; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
              "cache-control": "no-store",
            },
          });
        }
        return loginPage("wrong key");
      }
      return loginPage();
    }
    if (sub === "/logout") {
      return new Response(null, {
        status: 303,
        headers: {
          location: "/twonkwatch/login",
          "set-cookie": `${COOKIE}=; Path=/twonkwatch; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
          "cache-control": "no-store",
        },
      });
    }
    if (!authed(req, env.TWONKWATCH_SECRET)) {
      return new Response(null, { status: 303, headers: { location: "/twonkwatch/login", "cache-control": "no-store" } });
    }

    if (sub.startsWith("/api/")) {
      let up: Response;
      try {
        const upstream = new URL(sub.slice("/api".length) === "" ? "/api/" : sub.replace(/^\/api/, "/api"), env.TWONKWATCH_ORIGIN);
        upstream.search = url.search;
        const headers = new Headers(req.headers);
        headers.set("x-twonkwatch-key", env.TWONKWATCH_SECRET);
        headers.set("host", new URL(env.TWONKWATCH_ORIGIN).host);
        up = await fetch(new Request(upstream.toString(), { method: req.method, headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body }));
      } catch (e) {
        return Response.json(
          { error: { code: "origin_unreachable", message: "home tunnel offline or hostname not routed yet" } },
          { status: 502, headers: { "cache-control": "no-store" } },
        );
      }
      const ct = up.headers.get("content-type") ?? "";
      if (!ct.includes("application/json")) {
        return Response.json(
          { error: { code: "origin_unreachable", message: "home tunnel offline or hostname not routed yet" } },
          { status: 502, headers: { "cache-control": "no-store" } },
        );
      }
      return new Response(up.body, { status: up.status, headers: up.headers });
    }

    // Static SPA: the assets binding maps the full /twonkwatch/* path onto
    // dist-edge/twonkwatch/* (route-prefixed layout), so pass through
    // untouched; the binding's SPA fallback serves twonkwatch/index.html.
    return env.ASSETS.fetch(req);
  },
};
