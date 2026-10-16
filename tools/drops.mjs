/**
 * Twonk drop alerts — official @0 Twetch posts.
 *
 * Twetch announces Twonk mints/drops from user 0 ("Twetch", the official
 * account). The bsv daemon refuses userId 0 (`id > 0` required), so this
 * module reads the public Twetch API directly — no daemon, no key, fetch
 * only, zero deps. It is imported by tools/watch.mjs each cycle and shares
 * watch-state.json (keys: dropsSeen, drops, dropsCheckedAt).
 *
 * A post is a drop when it is actionable or informative about a mint:
 *   - a mint/box/launchpad/market URL *plus* a drop keyword, or
 *   - a strong standalone phrase (MINT IS LIVE, launchpad, treasure box,
 *     airdrop), or
 *   - a post-mortem (sold out / minted out / wrap up) mentioning the
 *     drop/mint/next — kind "update" instead of "drop".
 *
 * Deliberately NOT drops: automated "Bought N NFTs" sweeps, daily puzzle
 * posts, job payouts, chart chatter — none carry drop keywords + links.
 */

export const TWETCH_API = process.env.TWETCH_API ?? "https://api.twetch.com";
export const OFFICIAL_USER_ID = 0;

const URL_RE = /https?:\/\/[^\s)\]"']+/gi;

const DROP_URL_RES = [
  /twetch\.com\/mint/i,
  /twetch\.com\/launchpad/i,
  /twetch\.com\/box\/[0-9a-f-]+/i,
  /twetch\.com\/market\/[0-9a-f]{64}/i,
  /twetch\.com\/twonks\//i,
  /api\.twetch\.com\/v1\/launchpad/i,
  /api\.twetch\.com\/v1\/nft-buy-batches/i,
];

const BASE_KEYWORDS = [
  "mint is live",
  "treasure box",
  "launchpad",
  "airdrop",
  "sold out",
  "minted out",
  "minting",
  "wrap up",
  "mint",
  "drop",
  "claim",
];

const STRONG_RE = /mint is live|treasure box|launchpad|airdrop/i;
const UPDATE_RE = /sold out|minted out|wrap up/i;

export function extractLinks(text) {
  if (!text) return [];
  const out = [];
  for (const m of String(text).matchAll(URL_RE)) {
    // Trim trailing punctuation the regex may have caught.
    out.push(m[0].replace(/[.,;!?]+$/, ""));
  }
  return [...new Set(out)];
}

export function isDropUrl(url) {
  return DROP_URL_RES.some((re) => re.test(url));
}

function matchKeywords(lower, extraKeywords) {
  const all = [...BASE_KEYWORDS, ...(extraKeywords ?? [])];
  const hits = [];
  for (const k of all) {
    const key = String(k).toLowerCase().trim();
    if (key && lower.includes(key)) hits.push(key);
  }
  return hits;
}

/**
 * Classify one post. Pass content + optional quotedContent (resolved from
 * the API's quotedPosts map). Returns {isDrop, kind, reasons, links}.
 * kind is "drop" (live/upcoming) or "update" (sold out / wrap up).
 */
export function classifyDrop({ content, quotedContent = "", extraKeywords = [] } = {}) {
  const text = `${content ?? ""}\n${quotedContent ?? ""}`;
  const lower = text.toLowerCase();
  const links = extractLinks(text);
  const dropLinks = links.filter(isDropUrl);
  const kwHits = matchKeywords(lower, extraKeywords);
  const hasKeyword = kwHits.length > 0;
  const hasStrong = STRONG_RE.test(text);
  const hasUpdateWrap = UPDATE_RE.test(text) && /(drop|mint|next)/i.test(text);

  const isDrop = hasStrong || (hasKeyword && (dropLinks.length > 0 || hasUpdateWrap));
  if (!isDrop) return { isDrop: false, kind: null, reasons: [], links };

  const kind = UPDATE_RE.test(text) ? "update" : "drop";
  const reasons = [
    ...kwHits.slice(0, 4).map((k) => `keyword:${k}`),
    ...dropLinks.slice(0, 3).map((u) => `link:${dropLinkKind(u)}`),
  ];
  if (hasStrong) reasons.unshift("phrase:announcement");
  return { isDrop: true, kind, reasons, links };
}

function dropLinkKind(url) {
  const l = url.toLowerCase();
  if (l.includes("/mint")) return "mint";
  if (l.includes("launchpad")) return "launchpad";
  if (l.includes("/box/")) return "box";
  if (l.includes("/market/")) return "market";
  if (l.includes("/twonks/")) return "twonks";
  if (l.includes("nft-buy-batches")) return "buy-batch";
  return "drop-link";
}

export function snippet(content, max = 140) {
  const s = String(content ?? "").replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export function postUrlOf(post) {
  if (post?.txid) return `https://twetch.com/t/${post.txid}`;
  return "https://twetch.com/u/0";
}

/** Normalize one raw API post + resolve quoted content from the payload. */
export function normalizePost(raw, quotedPosts = {}) {
  const id = Number(raw?.id ?? 0);
  const content = typeof raw?.content === "string" ? raw.content : "";
  const txid = typeof raw?.txid === "string" ? raw.txid : null;
  const postedAtMs = Number(raw?.postedAtMs ?? raw?.createdAtMs ?? 0);
  let quotedContent = "";
  const qid = raw?.quotedPostId;
  if (qid != null) {
    const q = quotedPosts[String(qid)] ?? quotedPosts[qid];
    if (q && typeof q.content === "string") quotedContent = q.content;
    else if (typeof q === "string") quotedContent = q;
  }
  return { id, content, txid, postedAtMs, quotedContent, postUrl: postUrlOf(raw) };
}

/** Fetch the latest official posts directly (daemon blocks id 0). */
export async function fetchOfficialPosts({ limit = 20, fetchFn = fetch, timeoutMs = 20_000 } = {}) {
  const n = Math.min(Math.max(Math.floor(limit) || 20, 1), 100);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchFn(`${TWETCH_API}/v1/users/0/posts?limit=${n}`, {
      headers: { accept: "application/json", "user-agent": "twonk-market-drops/1.0" },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`twetch api ${res.status}`);
    const body = await res.json().catch(() => ({}));
    const data = Array.isArray(body.data) ? body.data : [];
    const quotedPosts = body.quotedPosts && typeof body.quotedPosts === "object" ? body.quotedPosts : {};
    return data.map((r) => normalizePost(r, quotedPosts)).filter((p) => p.id > 0);
  } finally {
    clearTimeout(timer);
  }
}

/** POST a drop to a webhook (Discord/Slack/ntfy-compatible JSON). Never throws fatally. */
export async function sendWebhook(webhookUrl, drop, timeoutMs = 10_000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const label = drop.kind === "update" ? "Twonk drop update" : "Twonk DROP";
    const text = `${label}: ${snippet(drop.content)} ${drop.postUrl}`;
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, ...drop }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`webhook ${res.status}`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Check @0 for new drops, mutate state (dropsSeen/drops/dropsCheckedAt),
 * optionally webhook each new drop. Returns {fetched, newDrops, error?}.
 * Never throws — errors are returned, so the watch cycle never fails on drops.
 */
export async function checkDrops(cfg, state, { fetchFn = fetch } = {}) {
  const now = new Date().toISOString();
  if (!state.dropsSeen || typeof state.dropsSeen !== "object") state.dropsSeen = {};
  if (!Array.isArray(state.drops)) state.drops = [];

  let posts = [];
  try {
    posts = await fetchOfficialPosts({ limit: cfg.dropsPollLimit ?? 20, fetchFn });
  } catch (e) {
    state.dropsCheckedAt = now;
    return { fetched: 0, newDrops: [], error: e instanceof Error ? e.message : String(e) };
  }

  const extraKeywords = Array.isArray(cfg.dropsKeywords)
    ? cfg.dropsKeywords.filter((k) => typeof k === "string" && k.trim()).map((k) => k.toLowerCase())
    : [];
  const newDrops = [];
  // Oldest-first so state.drops stays chronological.
  for (const post of [...posts].reverse()) {
    if (state.dropsSeen[post.id]) continue;
    state.dropsSeen[post.id] = now;
    const c = classifyDrop({ content: post.content, quotedContent: post.quotedContent, extraKeywords });
    if (!c.isDrop) continue;
    const drop = {
      id: post.id,
      txid: post.txid,
      content: post.content,
      snippet: snippet(post.content),
      postUrl: post.postUrl,
      links: c.links,
      kind: c.kind,
      reasons: c.reasons,
      detectedAt: now,
      postedAtMs: post.postedAtMs,
      notified: false,
    };
    state.drops.push(drop);
    newDrops.push(drop);
  }
  // Cap history (seen map pruned to recent ids to bound file size).
  if (state.drops.length > 100) state.drops = state.drops.slice(-100);
  const seenIds = Object.keys(state.dropsSeen).map(Number).sort((a, b) => a - b);
  if (seenIds.length > 500) {
    for (const id of seenIds.slice(0, seenIds.length - 500)) delete state.dropsSeen[id];
  }
  state.dropsCheckedAt = now;

  const webhookUrl = typeof cfg.dropsWebhookUrl === "string" ? cfg.dropsWebhookUrl.trim() : "";
  if (webhookUrl && newDrops.length) {
    for (const d of newDrops) {
      try {
        await sendWebhook(webhookUrl, d);
        d.notified = true;
      } catch (e) {
        d.notifyError = e instanceof Error ? e.message : String(e);
      }
    }
  }
  return { fetched: posts.length, newDrops };
}
