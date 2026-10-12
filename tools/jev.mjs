/**
 * Minimal Jev client (TypeSafe System One via OpenRouter's decisions endpoint).
 * Fetch-only, zero deps. Same contract as decision-oracle's jev.ts, trimmed to
 * the single choice question the watcher needs.
 *
 * Key from OPENROUTER_API_KEY (or JEV_API_KEY). Never logged. Every failure
 * throws a coded Error so the caller can fail closed (hold) without trading.
 */
const URL = process.env.JEV_URL ?? "https://openrouter.ai/api/alpha/decisions";
const MODEL = process.env.JEV_MODEL ?? "typesafe/jev-1.13";

export function jevConfigured() {
  return Boolean((process.env.JEV_API_KEY ?? process.env.OPENROUTER_API_KEY ?? "").trim());
}

/**
 * Ask Jev for one choice verdict. Returns {decision, confidence}.
 * Throws on missing key, HTTP error, timeout, or malformed answer.
 */
export async function jevDecide(state, options, timeoutMs = 10_000) {
  const key = (process.env.JEV_API_KEY ?? process.env.OPENROUTER_API_KEY ?? "").trim();
  if (!key) throw Object.assign(new Error("no Jev key (export OPENROUTER_API_KEY)"), { code: "NO_KEY" });
  const keys = Object.keys(options);
  if (keys.length < 2) throw new Error("need at least 2 options");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        state,
        model: MODEL,
        questions: { verdict: { type: "choice", instructions: "Should a disciplined trader buy, hold off, or sell/avoid this?", criteria: options } },
      }),
      signal: ctrl.signal,
    });
    const text = await res.text();
    if (!res.ok) throw Object.assign(new Error(`Jev ${res.status}: ${text.slice(0, 200)}`), { code: "JEV_HTTP" });
    const body = JSON.parse(text);
    const a = body?.answers?.verdict;
    if (!a || a.type !== "choice" || !Object.prototype.hasOwnProperty.call(options, a.choice) || typeof a.confidence !== "number") {
      throw Object.assign(new Error(`unusable Jev answer: ${text.slice(0, 200)}`), { code: "BAD_RESPONSE" });
    }
    return { decision: a.choice, confidence: a.confidence };
  } catch (e) {
    if (e instanceof Error && (e.code === "NO_KEY" || e.code === "JEV_HTTP" || e.code === "BAD_RESPONSE")) throw e;
    throw Object.assign(new Error(e instanceof Error ? e.message : String(e)), { code: "JEV_UNAVAILABLE" });
  } finally {
    clearTimeout(timer);
  }
}
