import { useCallback, useEffect, useState } from "react";
import { fmtSats, getState, reset, runCycle, saveConfig, type WatchConfig, type WatchState } from "./api";

const POLL_MS = 30_000;

function jevLabel(t: { jev?: { decision: string; confidence: number | null } | null }): string {
  if (!t.jev || !t.jev.decision) return "rules-only";
  const c = t.jev.confidence;
  return `jev:${t.jev.decision}${c != null ? ` ${c.toFixed(2)}` : ""}`;
}

function outcome(t: { status: string; closePriceSats?: number }): string {
  if (t.status === "closed-sold") return `sold ${fmtSats(t.closePriceSats)}`;
  if (t.status === "closed-abandoned") return "abandoned (jev:sell)";
  return "delisted";
}

export default function App() {  const [config, setConfig] = useState<WatchConfig | null>(null);
  const [state, setState] = useState<WatchState | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<WatchConfig | null>(null);
  // Raw text for numeric fields: parsing on every keystroke breaks decimal
  // entry (typing "0." collapses to 0), so the text lives here until save.
  const [raw, setRaw] = useState<Record<string, string>>({});

  type NumKey = "maxPriceSats" | "rankTopN" | "feeBps" | "paperBankrollSats" | "pollSecs" | "jevMinConfidence" | "jevMaxPerCycle" | "dropsPollLimit" | "liveBuyMaxUsd" | "liveBuyMinConfidence" | "liveBuyMaxPerCycle" | "liveBuyQuantity";

  const setNum = useCallback(
    (key: NumKey, text: string, nullable = false) => {
      setRaw((r) => ({ ...r, [key]: text }));
      const t = text.trim();
      if (t === "") {
        if (nullable) setDraft((d) => (d ? { ...d, [key]: null } : d));
        return;
      }
      const n = Number(t);
      if (Number.isFinite(n)) setDraft((d) => (d ? ({ ...d, [key]: n } as WatchConfig) : d));
    },
    [],
  );

  const numVal = (key: NumKey): string => {
    if (raw[key] !== undefined) return raw[key];
    const v = draft?.[key];
    return v == null ? "" : String(v);
  };

  const rawInvalid = Object.entries(raw).some(([, v]) => v.trim() !== "" && !Number.isFinite(Number(v)));

  const refresh = useCallback(async () => {
    try {
      const r = await getState();
      setConfig(r.config);
      setState(r.state);
      setUpdatedAt(r.updatedAt);
      setDraft((d) => d ?? r.config);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "server unreachable — is dashboard/server.mjs running?");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  const onRun = useCallback(async () => {
    setBusy(true);
    try {
      await runCycle();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "cycle failed");
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const onSave = useCallback(async () => {
    if (!draft || rawInvalid) return;
    setBusy(true);
    try {
      await saveConfig(draft);
      setConfig(draft);
      setRaw({});
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "save failed");
    } finally {
      setBusy(false);
    }
  }, [draft, rawInvalid]);

  const onReset = useCallback(
    async (mode: "bankroll" | "all") => {
      if (!window.confirm(mode === "all" ? "Wipe all watcher state (seen listings, floors, paper history)?" : "Reset the paper bankroll to the configured starting amount?")) return;
      setBusy(true);
      try {
        await reset(mode);
        setRaw({});
        setDraft(null);
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "reset failed");
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const paper = state?.paper ?? [];
  const open = paper.filter((t) => t.status === "open");
  const closed = paper.filter((t) => t.status !== "open").slice().reverse();
  const pnl = paper.filter((t) => typeof t.pnlSats === "number").reduce((s, t) => s + (t.pnlSats ?? 0), 0);
  const floors = Object.entries(state?.floors ?? {}).sort((a, b) => b[1].floorSats - a[1].floorSats);
  const drops = [...(state?.drops ?? [])].reverse();
  const freshCutoff = Date.now() - 24 * 3600 * 1000;
  const freshDrops = drops.filter((d) => new Date(d.detectedAt).getTime() >= freshCutoff);
  const liveBuys = [...(state?.liveBuys ?? [])].reverse();
  const dirty = draft != null && config != null && JSON.stringify(draft) !== JSON.stringify(config);

  return (
    <main>
      <header>
        <h1>🔭 Twonk Watch</h1>
        <span className="fine">paper-trading floors{config?.liveBuyEnabled ? " + Jev-gated live drop buys (real BSV)" : " · paper only"}</span>
        <div className="bank">
          <div className="fine">paper bankroll</div>
          <b>{fmtSats(state?.bankrollSats)} sats</b>
          <div className={`fine ${pnl >= 0 ? "win" : "loss"}`}>realized {pnl >= 0 ? "+" : ""}{fmtSats(pnl)}</div>
        </div>
      </header>

      {error && <p className="err">{error}</p>}
      <p className="row">
        <button disabled={busy} onClick={() => void onRun()}>{busy ? "Working…" : "Run cycle now"}</button>
        <button className="ghost" disabled={busy} onClick={() => void onReset("bankroll")}>Reset bankroll</button>
        <button className="danger" disabled={busy} onClick={() => void onReset("all")}>Wipe state</button>
        <span className="fine">{updatedAt ? `state updated ${new Date(updatedAt).toLocaleString()}` : state ? "no cycles yet" : "connecting…"}</span>
      </p>

      <section>
        <h2>💸 Live drop buys {config && !config.liveBuyEnabled && <span className="fine">(off — enable in Rules)</span>}</h2>
        <p className="fine">
          Jev-gated launchpad mints with real BSV (default ${config?.liveBuyMaxUsd ?? 6} cap)
          {config && config.liveBuyEnabled && (config.liveBuyDryRun ? " · DRY RUN (nothing spends)" : " · ARMED — real spends")}
        </p>
        {liveBuys.length === 0 && <p className="fine">No evaluations yet — fresh drops land here with the verdict.</p>}
        {liveBuys.slice(0, 20).map((a, i) => (
          <div key={`${a.dropId}-${a.at}-${i}`} className="card">
            <div>
              <span className={`pill ${a.action === "bought" ? "open" : "sold"}`}>{a.action}</span>
              <b>@0 #{a.dropId}</b>{" "}
              <span className="fine">{a.contract ? <code>{a.contract.slice(0, 12)}…</code> : "(no contract)"}</span>
            </div>
            <div>{a.reason}</div>
            <div className="fine">
              {new Date(a.at).toLocaleString()}
              {a.quote?.subtotalSats != null && <> · quote {fmtSats(a.quote.subtotalSats)} sats{a.mintPriceUsd != null && <> (~${a.mintPriceUsd})</>}</>}
              {a.jev && <> · jev:{a.jev.decision} {a.jev.confidence?.toFixed(2)}</>}
              {a.buyTxid && <> · <code>{a.buyTxid.slice(0, 16)}…</code></>}
              {a.status && a.status.available != null && <> · {a.status.available}/{a.status.supply} avail</>}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2>🔔 Twonk drops — @0 {freshDrops.length > 0 && <span className="pill open">{freshDrops.length} new</span>}</h2>
        <p className="fine">
          Official Twetch posts watched every cycle
          {state?.dropsCheckedAt ? ` · last checked ${new Date(state.dropsCheckedAt).toLocaleString()}` : ""}
          {config && !config.dropsEnabled && " · paused (enable in Rules)"}
        </p>
        {drops.length === 0 && <p className="fine">No drops seen yet — run a cycle and they’ll land here.</p>}
        {drops.slice(0, 20).map((d) => {
          const fresh = new Date(d.detectedAt).getTime() >= freshCutoff;
          return (
            <div key={d.id} className="card">
              <div>
                <span className={`pill ${d.kind === "drop" ? "open" : "sold"}`}>{d.kind === "drop" ? "drop" : "update"}</span>
                {fresh && <span className="pill open">new</span>}
                <b><a href={d.postUrl} target="_blank" rel="noreferrer">@0 #{d.id}</a></b>{" "}
                <span className="fine">{d.reasons.join(" · ")}</span>
              </div>
              <div>{d.snippet || "(no text — see post)"}</div>
              <div className="fine">
                detected {new Date(d.detectedAt).toLocaleString()}
                {d.links.slice(0, 3).map((l) => (
                  <span key={l}> · <a href={l} target="_blank" rel="noreferrer">{l.replace(/^https?:\/\//, "").slice(0, 48)}</a></span>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section>
        <h2>Open signals ({open.length})</h2>
        {open.length === 0 && <p className="fine">Nothing under the rule right now.</p>}
        {open.map((t) => (
          <div key={t.id} className="card">
            <div><span className="pill open">open paper</span><b><a href={t.url} target="_blank" rel="noreferrer">{t.name}</a></b> <span className="fine">[{jevLabel(t)}]</span></div>
            <div>buy {fmtSats(t.priceSats)} · floor {fmtSats(t.floorSats)} · {t.reasons.join("; ")}</div>
            <div className="fine">opened {new Date(t.openedAt).toLocaleString()} · <code>{t.outpoint.slice(0, 18)}…</code></div>
          </div>
        ))}
      </section>

      <section>
        <h2>Closed ({closed.length})</h2>
        {closed.length > 0 && (
          <table>
            <thead><tr><th>Token</th><th>Bought</th><th>Outcome</th><th>P&L</th></tr></thead>
            <tbody>
              {closed.map((t) => (
                <tr key={t.id}>
                  <td><a href={t.url} target="_blank" rel="noreferrer">{t.name}</a> <span className="fine">[{jevLabel(t)}]</span></td>
                  <td>{fmtSats(t.priceSats)}</td>
                  <td>{outcome(t)}</td>
                  <td className={t.status === "closed-sold" ? ((t.pnlSats ?? 0) >= 0 ? "win" : "loss") : ""}>
                    {t.status === "closed-sold" ? `${(t.pnlSats ?? 0) >= 0 ? "+" : ""}${fmtSats(t.pnlSats)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {closed.length === 0 && <p className="fine">No settled trades yet — closes land here as listings sell or vanish.</p>}
      </section>

      <section>
        <h2>Floors ({floors.length})</h2>
        <table>
          <thead><tr><th>Collection</th><th>Floor</th><th>Listings</th><th>Source</th></tr></thead>
          <tbody>
            {floors.slice(0, 25).map(([id, f]) => (
              <tr key={id}>
                <td><code>{id.slice(0, 12)}…</code></td>
                <td>{fmtSats(f.floorSats)}</td>
                <td>{f.numListings ?? "—"}</td>
                <td className="fine">{f.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Rules</h2>
        {draft && (
          <div className="grid2">
            <label>Collections allowlist (comma-separated, empty = all)
              <input value={draft.collections.join(", ")} onChange={(e) => setDraft({ ...draft, collections: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            </label>
            <label>Max price (sats, empty = none)
              <input value={numVal("maxPriceSats")} inputMode="numeric" onChange={(e) => setNum("maxPriceSats", e.target.value, true)} />
            </label>
            <label>Rank top N (cheapest N vs floor go to Jev each cycle)
              <input value={numVal("rankTopN")} inputMode="numeric" onChange={(e) => setNum("rankTopN", e.target.value)} />
            </label>
            <label>Fee bps on closes (690 ≈ 6.9%)
              <input value={numVal("feeBps")} inputMode="numeric" onChange={(e) => setNum("feeBps", e.target.value)} />
            </label>
            <label>Paper bankroll (sats)
              <input value={numVal("paperBankrollSats")} inputMode="numeric" onChange={(e) => setNum("paperBankrollSats", e.target.value)} />
            </label>
            <label>Poll seconds (loop mode)
              <input value={numVal("pollSecs")} inputMode="numeric" onChange={(e) => setNum("pollSecs", e.target.value)} />
            </label>
            <label>Jev screen (buy/hold/sell judge, needs OPENROUTER_API_KEY)
              <select value={draft.jevEnabled ? "on" : "off"} onChange={(e) => setDraft({ ...draft, jevEnabled: e.target.value === "on" })}>
                <option value="on">on</option>
                <option value="off">off</option>
              </select>
            </label>
            <label>Jev min confidence (0–1)
              <input value={numVal("jevMinConfidence")} inputMode="decimal" onChange={(e) => setNum("jevMinConfidence", e.target.value)} />
            </label>
            <label>Jev max judgements per cycle
              <input value={numVal("jevMaxPerCycle")} inputMode="numeric" onChange={(e) => setNum("jevMaxPerCycle", e.target.value)} />
            </label>
            <label>Drop alerts from @0 (official Twetch posts)
              <select value={draft.dropsEnabled ? "on" : "off"} onChange={(e) => setDraft({ ...draft, dropsEnabled: e.target.value === "on" })}>
                <option value="on">on</option>
                <option value="off">off</option>
              </select>
            </label>
            <label>Drop check depth (posts per cycle, 5–100)
              <input value={numVal("dropsPollLimit")} inputMode="numeric" onChange={(e) => setNum("dropsPollLimit", e.target.value)} />
            </label>
            <label>Drop webhook URL (optional, POST on each new drop)
              <input value={draft.dropsWebhookUrl ?? ""} placeholder="https://… (empty = none)" onChange={(e) => setDraft({ ...draft, dropsWebhookUrl: e.target.value.trim() === "" ? null : e.target.value.trim() })} />
            </label>
            <label>Extra drop keywords (comma-separated, optional)
              <input value={(draft.dropsKeywords ?? []).join(", ")} onChange={(e) => setDraft({ ...draft, dropsKeywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            </label>
            <label>Live drop buys — real BSV mints from the launchpad (Jev-gated)
              <select value={draft.liveBuyEnabled ? "on" : "off"} onChange={(e) => setDraft({ ...draft, liveBuyEnabled: e.target.value === "on" })}>
                <option value="off">off (paper + alerts only)</option>
                <option value="on">on (needs TWETCH_MINT_WIF + Jev key)</option>
              </select>
            </label>
            <label>Dry run (evaluate + Jev, cancel before spending)
              <select value={draft.liveBuyDryRun ? "on" : "off"} onChange={(e) => setDraft({ ...draft, liveBuyDryRun: e.target.value === "on" })}>
                <option value="on">on (safe — nothing spends)</option>
                <option value="off">off (ARMED — real spends)</option>
              </select>
            </label>
            <label>Max USD per mint (default 6)
              <input value={numVal("liveBuyMaxUsd")} inputMode="decimal" onChange={(e) => setNum("liveBuyMaxUsd", e.target.value)} />
            </label>
            <label>Jev min confidence for live buys (0–1)
              <input value={numVal("liveBuyMinConfidence")} inputMode="decimal" onChange={(e) => setNum("liveBuyMinConfidence", e.target.value)} />
            </label>
            <label>Live evaluations per cycle (1–5)
              <input value={numVal("liveBuyMaxPerCycle")} inputMode="numeric" onChange={(e) => setNum("liveBuyMaxPerCycle", e.target.value)} />
            </label>
            <label>Mint quantity per drop (1–100)
              <input value={numVal("liveBuyQuantity")} inputMode="numeric" onChange={(e) => setNum("liveBuyQuantity", e.target.value)} />
            </label>
          </div>
        )}
        <p className="row">
          <button disabled={busy || !dirty || rawInvalid} onClick={() => void onSave()}>Save rules</button>
          {!dirty && <span className="fine">applies to the next cycle</span>}
          {rawInvalid && <span className="err">fix the highlighted number first</span>}
        </p>
      </section>
    </main>
  );
}
