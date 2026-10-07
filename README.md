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
- `worker/` — Cloudflare static-asset deployment.

## Next

Trade execution UI (seller-side signing service for atomic swaps), collection creator
flow in the wallet UI, and — optionally — asking Twetch to index the contract.
