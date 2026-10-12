/** Dashboard API client (same origin; vite proxies /api to the local server). */
export interface WatchConfig {
  collections: string[];
  maxPriceSats: number | null;
  discountVsFloor: number;
  feeBps: number;
  paperBankrollSats: number;
  pollSecs: number;
}

export interface PaperTrade {
  id: string;
  status: "open" | "closed-sold" | "closed-gone";
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
}

export interface StateResponse {
  config: WatchConfig;
  state: WatchState;
  updatedAt: string | null;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = (await res.json()) as T & { error?: { code?: string; message?: string } };
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
