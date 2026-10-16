/** Dashboard API client (same origin; vite proxies /api to the local server). */
const API_BASE: string = (import.meta as unknown as { env: Record<string, string | undefined> }).env.VITE_API_BASE ?? "";
export interface WatchConfig {
  collections: string[];
  maxPriceSats: number | null;
  rankTopN: number;
  feeBps: number;
  paperBankrollSats: number;
  pollSecs: number;
  jevEnabled: boolean;
  jevMinConfidence: number;
  jevMaxPerCycle: number;
  dropsEnabled: boolean;
  dropsPollLimit: number;
  dropsWebhookUrl: string | null;
  dropsKeywords: string[];
  liveBuyEnabled: boolean;
  liveBuyDryRun: boolean;
  liveBuyMaxUsd: number;
  liveBuyMinConfidence: number;
  liveBuyMaxPerCycle: number;
  liveBuyQuantity: number;
}

export interface JevVerdict {
  decision: string;
  confidence: number | null;
  at?: string;
}

export interface PaperTrade {
  id: string;
  status: "open" | "closed-sold" | "closed-gone" | "closed-abandoned";
  openedAt: string;
  listingId: number;
  name: string;
  collection: string;
  collectionName: string | null;
  outpoint: string;
  priceSats: number;
  floorSats: number;
  reasons: string[];
  url: string;
  jev?: JevVerdict | null;
  exitJev?: JevVerdict | null;
  closePriceSats?: number;
  netSats?: number;
  pnlSats?: number;
  closedAt?: string;
}

export interface Floor {
  floorSats: number;
  source: string;
  numListings: number | null;
}

export interface WatchState {
  seen: Record<string, string>;
  floors: Record<string, Floor>;
  paper: PaperTrade[];
  bankrollSats: number | null;
  dropsSeen?: Record<string, string>;
  drops?: DropAlert[];
  dropsCheckedAt?: string | null;
  liveBuys?: LiveBuyAction[];
}

export interface LiveBuyAction {
  dropId: number;
  contract: string | null;
  kind: string;
  at: string;
  action: "bought" | "dryrun" | "held" | "skipped" | "failed";
  reason: string;
  status?: { live?: boolean; available?: number; supply?: number; mintEnded?: boolean } | null;
  quote?: { attemptId?: string; quantity?: number; subtotalSats?: number; maximumDebitSats?: number } | null;
  jev?: { decision: string; confidence: number | null } | null;
  priceUsd?: number | null;
  capSats?: number | null;
  mintPriceUsd?: number | null;
  buyTxid?: string | null;
}

export interface DropAlert {
  id: number;
  txid: string | null;
  content: string;
  snippet: string;
  postUrl: string;
  links: string[];
  kind: "drop" | "update";
  reasons: string[];
  detectedAt: string;
  postedAtMs: number;
  notified?: boolean;
}

export interface StateResponse {
  config: WatchConfig;
  state: WatchState;
  updatedAt: string | null;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  let json: T & { error?: { code?: string; message?: string } };
  try {
    json = JSON.parse(text) as T & { error?: { code?: string; message?: string } };
  } catch {
    throw new Error(
      res.ok
        ? "dashboard API returned non-JSON (tunnel origin unreachable?)"
        : `request failed (${res.status}) — home tunnel may be offline`,
    );
  }
  if (!res.ok) throw new Error(json.error?.message ?? `request failed (${res.status})`);
  return json;
}

export const getState = (): Promise<StateResponse> => req("/api/state");
export const saveConfig = (config: WatchConfig): Promise<{ ok: true }> =>
  req("/api/config", { method: "POST", body: JSON.stringify(config) });
export const runCycle = (): Promise<{ report: { signals: unknown[]; settled: unknown[] } }> =>
  req("/api/run", { method: "POST" });
export const reset = (mode: "bankroll" | "all"): Promise<{ ok: true }> =>
  req("/api/reset", { method: "POST", body: JSON.stringify({ mode }) });

export function fmtSats(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US");
}
