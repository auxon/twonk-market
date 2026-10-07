const WOC = "https://api.whatsonchain.com/v1/bsv/main";
const short = (s, n = 12) => (s ? s.slice(0, n) + "…" : "");
const wocTx = (txid) => `${WOC}/tx/${txid}`;

let REG = null;
const liveStatus = {}; // outpoint -> 'held' | 'moved' | 'unknown'

async function refreshLive() {
  // Live check: a token is HELD iff its outpoint is still in its owner's unspent set.
  const owners = [...new Set(REG.tokens.map((t) => t.owner))];
  const unspent = new Set();
  await Promise.all(owners.map(async (addr) => {
    try {
      const r = await fetch(`${WOC}/address/${addr}/unspent`);
      if (!r.ok) return;
      for (const u of await r.json()) unspent.add(`${u.txId}:${u.vout}`);
    } catch { /* offline: keep registry snapshot */ }
  }));
  for (const t of REG.tokens) liveStatus[t.outpoint] = unspent.size ? (unspent.has(t.outpoint) ? "held" : "moved") : "unknown";
  render();
}

function render() {
  const c = REG.collection;
  document.getElementById("collection-desc").textContent = c.description;
  document.getElementById("collection-meta").innerHTML =
    `contract <code>${short(c.contractId, 16)}</code> · ` +
    `binding <code>${short(c.bindingHash, 16)}</code> · ` +
    `${c.total} tokens · 546 sats each · ` +
    `mint <a href="${wocTx(c.mintTxid)}">${short(c.mintTxid)}</a> (block ${c.mintBlock})`;
  document.getElementById("xfer-link").href = wocTx(c.transferTxid);
  document.getElementById("burn-link").href = wocTx(c.duplicateBurnTxid);
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  for (const t of REG.tokens) {
    const st = liveStatus[t.outpoint] || "unknown";
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML =
      `<img src="${t.image}" alt="${t.title}" loading="lazy">` +
      `<h3>${t.title}</h3>` +
      `<div class="traits">${t.attributes.map((a) => `<span>${a.value}</span>`).join("")}</div>` +
      `<div class="own">owner <code>${short(t.owner, 10)}</code></div>` +
      `<div class="status ${st}">${st === "held" ? "● HELD" : st === "moved" ? "○ MOVED" : "… registry"}</div>`;
    card.onclick = () => showDetail(t);
    grid.appendChild(card);
  }
}

function showDetail(t) {
  const st = liveStatus[t.outpoint] || "unknown";
  const m = document.getElementById("modal");
  document.getElementById("modal-card").innerHTML =
    `<button id="mx">✕</button>` +
    `<img src="${t.image}" alt="${t.title}">` +
    `<h3>${t.title}</h3>` +
    `<dl>` +
    `<dt>status</dt><dd class="status ${st}">${st}</dd>` +
    `<dt>owner</dt><dd><code>${t.owner}</code></dd>` +
    `<dt>outpoint</dt><dd><a href="${wocTx(t.outpoint.split(":")[0])}">${t.outpoint}</a></dd>` +
    `<dt>image</dt><dd><code>b://${t.imageSha256}</code> (bytes in mint tx outputs 0–9)</dd>` +
    `<dt>provenance</dt><dd>${t.history.map((h) => `${h.event}: <code>${short(h.outpoint || h.txid)}</code>`).join(" → ")}</dd>` +
    `</dl>`;
  m.hidden = false;
  document.getElementById("mx").onclick = () => { m.hidden = true; };
  m.onclick = (e) => { if (e.target === m) m.hidden = true; };
}

fetch("registry.json").then((r) => r.json()).then((j) => {
  REG = j;
  render();
  refreshLive();
});
