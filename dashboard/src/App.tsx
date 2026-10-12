import { useCallback, useEffect, useState } from "react";
import { fmtSats, getState, reset, runCycle, saveConfig, type WatchConfig, type WatchState } from "./api";

const POLL_MS = 30_000;

export default function App() {
  const [config, setConfig] = useState<WatchConfig | null>(null);
  const [state, setState] = useState<WatchState | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<WatchConfig | null>(null);

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
    if (!draft) return;
    setBusy(true);
    try {
      await saveConfig(draft);
      setConfig(draft);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "save failed");
    } finally {
      setBusy(false);
    }
  }, [draft]);

  const onReset = useCallback(
    async (mode: "bankroll" | "all") => {
      if (!window.confirm(mode === "all" ? "Wipe all watcher state (seen listings, floors, paper history)?" : "Reset the paper bankroll to the configured starting amount?")) return;
      setBusy(true);
      try {
        await reset(mode);
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
  const dirty = draft != null && config != null && JSON.stringify(draft) !== JSON.stringify(config);

  return (
    <main>
      <header>
        <h1>🔭 Twonk Watch</h1>
        <span className="fine">paper-trading TwetchCollector floors · no sats move</span>
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
        <h2>Open signals ({open.length})</h2>
        {open.length === 0 && <p className="fine">Nothing under the rule right now.</p>}
        {open.map((t) => (
          <div key={t.id} className="card">
            <div><span className="pill open">open paper</span><b><a href={t.url} target="_blank" rel="noreferrer">{t.name}</a></b></div>
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
                  <td><a href={t.url} target="_blank" rel="noreferrer">{t.name}</a></td>
                  <td>{fmtSats(t.priceSats)}</td>
                  <td>{t.status === "closed-sold" ? `sold ${fmtSats(t.closePriceSats)}` : "delisted"}</td>
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
              <input value={draft.maxPriceSats ?? ""} inputMode="numeric" onChange={(e) => setDraft({ ...draft, maxPriceSats: e.target.value.trim() === "" ? null : Number(e.target.value) })} />
            </label>
            <label>Discount vs floor (0.15 = 15% under)
              <input value={String(draft.discountVsFloor)} inputMode="decimal" onChange={(e) => setDraft({ ...draft, discountVsFloor: Number(e.target.value) })} />
            </label>
            <label>Fee bps on closes (690 ≈ 6.9%)
              <input value={String(draft.feeBps)} inputMode="numeric" onChange={(e) => setDraft({ ...draft, feeBps: Number(e.target.value) })} />
            </label>
            <label>Paper bankroll (sats)
              <input value={String(draft.paperBankrollSats)} inputMode="numeric" onChange={(e) => setDraft({ ...draft, paperBankrollSats: Number(e.target.value) })} />
            </label>
            <label>Poll seconds (loop mode)
              <input value={String(draft.pollSecs)} inputMode="numeric" onChange={(e) => setDraft({ ...draft, pollSecs: Number(e.target.value) })} />
            </label>
          </div>
        )}
        <p className="row">
          <button disabled={busy || !dirty} onClick={() => void onSave()}>Save rules</button>
          {!dirty && <span className="fine">applies to the next cycle</span>}
        </p>
      </section>
    </main>
  );
}
