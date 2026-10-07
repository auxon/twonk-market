/**
 * Browser-side Twonk delivery: sign with a pasted WIF, broadcast via our relay.
 * The WIF never leaves this page — only the fully-signed tx hex is POSTed.
 */
import { LockingScript, P2PKH, PrivateKey, Transaction, UnlockingScript, Utils } from "@bsv/sdk";

const WOC = "https://api.whatsonchain.com/v1/bsv/main";
const $ = (id) => document.getElementById(id);
const short = (s, n = 12) => (s ? s.slice(0, n) + "..." : "");
const hexOf = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

const ALPHA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function pkhHex(addr) {
  let n = 0n;
  for (const c of addr.trim()) {
    const v = ALPHA.indexOf(c);
    if (v < 0) throw new Error("bad address");
    n = n * 58n + BigInt(v);
  }
  let h = n.toString(16);
  if (h.length % 2) h = "0" + h;
  const bytes = Array.from(Utils.toArray(h, "hex"));
  while (bytes.length < 25) bytes.unshift(0);
  return hexOf(bytes.slice(1, 21));
}

let REG = null;
let PRIV = null; // PrivateKey, memory only
let ADDR = "";
let SEL = null; // { txid, vout, scriptHex, sats, title }
let SIGNED = null; // { hex, txid, fee }

fetch("registry.json").then((r) => r.json()).then((j) => { REG = j; });

async function woc(path) {
  const r = await fetch(WOC + path);
  if (!r.ok) throw new Error(`chain ${r.status}`);
  return r.json();
}
async function txHex(txid) {
  const r = await fetch(`${WOC}/tx/${txid}/hex`);
  if (!r.ok) throw new Error(`tx ${txid.slice(0, 12)}… unavailable (${r.status})`);
  return (await r.text()).trim();
}

function twonkUnlock(priv, contractIdHex) {
  const base = new P2PKH().unlock(priv);
  const cid = Array.from(Utils.toArray(contractIdHex, "hex"));
  return {
    sign: async (tx, i) => {
      const b = await base.sign(tx, i);
      return UnlockingScript.fromBinary([...b.toBinary(), 0x20, ...cid]);
    },
    estimateLength: async () => (await base.estimateLength()) + 33,
  };
}

$("wif-go").onclick = () => {
  try {
    PRIV = PrivateKey.fromWif($("wif").value.trim());
    ADDR = PRIV.toAddress();
    $("wif").value = "";
    $("wif-out").innerHTML = `seller address: <code>${ADDR}</code>`;
    $("wif-forget").disabled = false;
    listTokens();
  } catch {
    $("wif-out").textContent = "that WIF did not parse.";
  }
};
$("wif-forget").onclick = () => {
  PRIV = null; ADDR = ""; SEL = null; SIGNED = null;
  $("wif-out").textContent = "";
  $("token-list").textContent = "Load a key first.";
  $("build").disabled = true; $("send").disabled = true;
  $("review").textContent = "Nothing signed yet.";
  $("wif-forget").disabled = true;
};

function listTokens() {
  const mine = REG.tokens.filter((t) => t.owner === ADDR);
  $("token-list").innerHTML = mine.length
    ? mine.map((t) => `<label><input type="radio" name="tok" value="${t.outpoint}"> ${t.title} <code>${short(t.outpoint, 20)}</code></label>`).join("<br>")
    : `This key owns none of the registry's 10 tokens. Enter an outpoint manually below.`;
  for (const r of document.querySelectorAll('input[name="tok"]')) {
    r.onchange = () => selectOutpoint(r.value, null);
  }
  if (mine.length === 1) {
    document.querySelector('input[name="tok"]').checked = true;
    selectOutpoint(mine[0].outpoint, mine[0].title);
  }
}

async function selectOutpoint(outpoint, title) {
  try {
    const [txid, vout] = outpoint.split(":");
    const prev = Transaction.fromHex(await txHex(txid));
    const out = prev.outputs[Number(vout)];
    const scriptHex = out.lockingScript.toHex();
    if (!scriptHex.startsWith("a914") || out.satoshis !== 546) throw new Error("not a Twonk-shaped output");
    SEL = { txid, vout: Number(vout), scriptHex, sats: out.satoshis, title: title || "manual outpoint" };
    $("build").disabled = false;
    $("review").textContent = `Selected ${SEL.title} at ${outpoint}.`;
  } catch (e) {
    SEL = null;
    $("build").disabled = true;
    $("review").textContent = `Could not load outpoint: ${e.message}`;
  }
}

$("manual-out").onchange = () => {
  const v = $("manual-out").value.trim();
  if (/^[0-9a-f]{64}:\d+$/.test(v)) selectOutpoint(v, null);
};

$("build").onclick = async () => {
  $("review").textContent = "Building…";
  $("send").disabled = true;
  try {
    const buyer = $("buyer").value.trim();
    if (!buyer) throw new Error("buyer address required");
    const buyerPkh = pkhHex(buyer);
    const fee = Math.max(500, Math.floor(Number($("fee").value) || 1500));
    // Funding: same key. Prefer confirmed unspent; allow manual override (incl. unconfirmed change).
    let fundTxid, fundVout, fundTx;
    const manual = $("manual-fund").value.trim();
    if (manual && /^[0-9a-f]{64}:\d+$/.test(manual)) {
      [fundTxid, fundVout] = manual.split(":");
      fundVout = Number(fundVout);
      fundTx = Transaction.fromHex(await txHex(fundTxid));
    } else {
      const unspent = await woc(`/address/${ADDR}/unspent`);
      const cand = (unspent || []).filter((u) => `${u.txId}:${u.vout}` !== `${SEL.txid}:${SEL.vout}` && u.value > 1000);
      if (!cand.length) throw new Error("no confirmed funding UTXO on this key — paste one manually (change from a recent tx works)");
      cand.sort((a, b) => b.value - a.value);
      fundTxid = cand[0].txId; fundVout = cand[0].vout;
      fundTx = Transaction.fromHex(await txHex(fundTxid));
    }
    const fundSats = fundTx.outputs[fundVout].satoshis;
    const fundScript = fundTx.outputs[fundVout].lockingScript.toHex();
    if (!fundScript.startsWith("76a914") || !fundScript.includes(pkhHex(ADDR))) {
      throw new Error("funding outpoint is not this key's P2PKH");
    }
    // Rebuild token output: identical script, new owner H2.
    const head = SEL.scriptHex.slice(0, 4 + 40 + 8);
    const rest = SEL.scriptHex.slice(4 + 40 + 8 + 40);
    if (!head.startsWith("a914") || !rest.startsWith("88ac6a")) throw new Error("token script shape unexpected");
    const contractId = REG.collection.contractId;
    const tx = new Transaction();
    tx.addInput({
      sourceTXID: fundTxid, sourceOutputIndex: fundVout, sourceTransaction: fundTx,
      unlockingScriptTemplate: new P2PKH().unlock(PRIV), sequence: 0xffffffff,
    });
    const mintTx = Transaction.fromHex(await txHex(SEL.txid));
    tx.addInput({
      sourceTXID: SEL.txid, sourceOutputIndex: SEL.vout, sourceTransaction: mintTx,
      unlockingScriptTemplate: twonkUnlock(PRIV, contractId), sequence: 0xffffffff,
    });
    tx.addOutput({ lockingScript: LockingScript.fromHex(head + buyerPkh + rest), satoshis: 546 });
    const change = fundSats - 546 - fee;
    if (change < 0) throw new Error(`funding ${fundSats} sats cannot cover 546 + ${fee} fee`);
    if (change > 0) tx.addOutput({ lockingScript: new P2PKH().lock(ADDR), satoshis: change });
    await tx.sign();
    SIGNED = { hex: tx.toHex(), txid: tx.id("hex"), fee };
    $("review").innerHTML =
      `token → <code>${buyer}</code><br>change → <code>${ADDR}</code><br>` +
      `txid <code>${SIGNED.txid}</code> · ${SIGNED.hex.length / 2} bytes · fee ${fee} sats`;
    $("send").disabled = false;
  } catch (e) {
    SIGNED = null;
    $("review").textContent = `Build failed: ${e.message}`;
  }
};

$("send").onclick = async () => {
  if (!SIGNED) return;
  $("send-out").textContent = "Broadcasting…";
  try {
    const r = await fetch("/api/broadcast", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ txhex: SIGNED.hex }),
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "relay failed");
    $("send-out").innerHTML =
      `Delivered in <code>${j.txid}</code> — ` +
      `<a href="${WOC}/tx/${j.txid}">${short(j.txid)}</a>. Tell me and I'll update the registry.`;
    SIGNED = null;
    $("send").disabled = true;
  } catch (e) {
    $("send-out").textContent = `Broadcast failed: ${e.message}`;
  }
};
