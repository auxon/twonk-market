# TwonkLab — a permissionless Twonk collection + marketplace scaffold

Twetch's NFT protocol ("Twonks") reverse-engineered from mainnet and re-implemented
permissionlessly. No Twetch involvement: new collection id, our own minter, our own venue.

## The protocol (verified on-chain)

Token = 546-sat UTXO, locking script:

```
OP_HASH160 <H1> OP_EQUALVERIFY
OP_DUP OP_HASH160 <H2> OP_EQUALVERIFY OP_CHECKSIG
OP_RETURN <{"attributes":[…],"image":"b://…","number":N,"title":"…"}>
```

- **H1** = HASH160(raw 32-byte collection id). Proven against NOOGIES:
  `HASH160(df0c100a…af14f7) = 20b42e73…7647`, byte-exact in every NOOGIES script.
- **H2** = owner pubkey hash. Unlock order: `<sig> <pubkey> <collection-id>`.
- BSV's OP_RETURN semantics keep these spendable (top-of-stack true after CHECKSIG);
  `OP_0 OP_RETURN` data outputs stay unspendable. Transfer + burn on mainnet prove it.
- Trades are atomic swaps: buyer funds + token in → seller payment + token→buyer +
  ~6.9% market fee + change (observed NOOGIES #2108, 7.78M sats).

## This collection

- Contract: `fa421c7f4a1caf782a1397f889f58113708dc9abb6133ae9855f8672d0f55690`
  (H1 `749fd13e711cade0afe8d377dff4e309672e22b9`)
- Mint: `0576d150…9b637c` (block 970084) — 10 B:// image outputs + 10×546-sat tokens.
- Transfer: TWONKLAB #1 A→B in `230048c3…4c98b7` (proves third-party movement).
- A duplicate broadcast of the same 10 tokens (`f48c7dc1…9700b8`) was burned to
  plain P2PKH in `8be7ca5c…febd1`. Supply: 10.
- Live: https://twonk-market.richard-hein.workers.dev

## Layout

- `contract-id.txt` — 32-byte collection id (the entire "mint authority" is this file).
- `manifest.json` — tokens + attributes + image hashes (mint input).
- `mint-result.json` — daemon mint output (outpoints).
- `registry.json` — collection + token state + provenance (marketplace source of truth).
- `img/` — token artwork (bytes also on-chain in mint outputs 0–9, sha256-pinned).
- `site/` — static marketplace (grid, detail, live held/moved via WoC, protocol docs).
- `tools/transfer.mjs` — offline transfer/burn signer (held WIFs via env, never committed).
- `tools/watch.mjs` — market monitor + paper trader (zero deps, Node only).
- `worker/` — Cloudflare static-asset deployment.

## Watch (monitor + paper trades, Jev-gated live drop buys)

Polls Twetch's live market through the bsvOS daemon, scores new listings
against collection floors, and paper-trades the mispriced ones — then settles
each signal against later sales/delistings to score the strategy.
Paper trading moves no sats, ever. Live drop buying (below) is a separate,
explicitly-armed path with its own gates.

```bash
node tools/watch.mjs            # one cycle (50 live listings, ~34 floors)
node tools/watch.mjs --loop     # poll every pollSecs (default 300s)
node tools/watch.mjs --json     # machine-readable summary
```

Rules live in `tools/watch.config.json`: collections allowlist (empty = all),
`maxPriceSats` cap, `rankTopN` (cheapest N fresh listings vs floor go to Jev
each cycle, default 3), `feeBps` on paper closes
(default 690 ≈ the observed ~6.9%), `paperBankrollSats` play money (signals
beyond it log as UNFUNDED, not bought). State in `data/watch-state.json`.
Reads are `bsv twetch market <listings|sales|collections>` — the daemon must
be running. Graduate a proven rule to live buys via `bsv twetchBuy` inside an
agent sub-wallet budget, never by editing this tool.

**Jev screen** (`tools/jev.mjs`, needs `OPENROUTER_API_KEY`): the `rankTopN`
cheapest fresh listings vs floor get one buy/hold choice from Jev
(`typesafe/jev-1.13`); only confident buys open paper trades, the rest log as
HOLD with the verdict. Open trades get a hold/sell screen — a confident sell
abandons the paper position. `jevMinConfidence` (default 0.6) and
`jevMaxPerCycle` (default 10, entries first) bound cost to ~$0.0002/cycle.
Without a key, the rank picks open as rules-only paper trades, flagged
`[rules-only]` in the output and dashboard — paper risks nothing, so nothing
fails closed except live buys, which don't exist yet.

**Drop alerts** (`tools/drops.mjs`): every cycle also polls the official @0
Twetch account's latest posts (`dropsPollLimit`, default 20) and flags Twonk
mint/drop announcements — `MINT IS LIVE`, launchpad/box/market links plus
drop keywords, treasure-box teases, and sold-out/wrap-up updates (kind
`update`). New drops print as `DROP [drop|update] @0 #<id> …` in the cycle
output (visible in `journalctl --user -u twonk-watch -f`), persist in
`state.drops` (deduped via `state.dropsSeen`), and surface at the top of the
dashboard with a NEW badge for the last 24h. Reads the public Twetch API
directly — the bsv daemon rejects userId 0, and drops keep working even when
the daemon/market reads are down. Never fails the cycle: fetch problems land
in `report.errors` / `report.drops.error`.
Optional `dropsWebhookUrl` POSTs each new drop as JSON (`{text, …drop}` —
works with Discord/Slack webhooks, ntfy, etc.); extra match terms via
`dropsKeywords`. Toggle/depth live in the dashboard Rules section.

**Live drop buys** (`tools/launchpad.mjs` + `tools/livebuy.mjs`): when @0
announces a launch, it goes live under the Launchpad section
(`twetch.com/launchpad`, API `GET /v1/launchpad/{contractHex}/status` —
public, safe to poll). Every cycle, each fresh drop post that resolves to a
collection gets a status check; live ones go to Jev with the quoted mint price
and the $6 cap context (`liveBuyMaxUsd`, default 6; price via Coinbase with a
CoinGecko fallback). On a confident buy verdict the launchpad mint flow runs:
quote → approve → prepare → sign → submit → poll → reveal.

Arming (all three required, nothing spends otherwise):

1. `liveBuyEnabled: true` (dashboard Rules, or config) — default **off**.
2. `liveBuyDryRun: false` — default **true** (dry run quotes + asks Jev,
   then cancels the attempt and logs `dryrun`; nothing is approved/signed).
3. `TWETCH_MINT_WIF` in env (or `mint` in `~/.config/twonk-market/keys.json`;
   same held-key pattern as `tools/transfer.mjs` — never committed) holding
   the Twetch mint funds, plus `OPENROUTER_API_KEY` for Jev.

Fail-closed gates: no key / no Jev key / Jev hold or low confidence
(`liveBuyMinConfidence`, default 0.7) / quote over the $6-in-sats cap /
insufficient mint balance / unknown approve+prepare shapes (aborts before any
signature) / expired quote. Mints sign ONLY server-dictated outputs and
re-verify `unitPrice×qty + fee ≤ maximumDebit` before signing. At most
`liveBuyMaxPerCycle` (default 1) evaluations per cycle. Every attempt —
bought, dryrun, held, skipped, failed — is recorded in `state.liveBuys` and
shown in the dashboard's Live drop buys section with quote, Jev verdict, and
txid. Box (`/box/`) drops are alerted but not executed (mint flow only).

## Dashboard (view + manage, loopback only)

React + TypeScript + Vite SPA with a zero-dep Node server on `127.0.0.3:8791`:
Twonk-drop alerts from @0, Jev-gated live drop buys, bankroll + realized P&L,
open signals, closed trades, collection floors, rule editor, run-now, bankroll
reset / full wipe. Verified in headless Chromium.

```bash
npm run dashboard:build   # install + tsc + vite build -> dashboard/dist
node dashboard/server.mjs # http://127.0.0.3:8791/ (loopback only)
```

Run it always:

```bash
cp packaging/twonk-watch.service packaging/twonk-dashboard.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now twonk-watch twonk-dashboard
```

Or install as a bsvOS app (own loopback origin): `bsv app install 127.0.0.3 --manifest-file dashboard/manifest.json` —
see below. `GET /api/state` is the whole dashboard as JSON.

## Next

Trade execution UI (seller-side signing service for atomic swaps), collection creator
flow in the wallet UI, and — optionally — asking Twetch to index the contract.
