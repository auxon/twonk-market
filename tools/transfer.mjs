/**
 * Twonk transfer / burn tool (offline signing with a held WIF).
 *
 * The wallet daemon never sees these keys: demo keys come from env
 * (TWONK_WIF_A = current owner, TWONK_WIF_B = transfer target) and every
 * signature is a plain P2PKH SIGHASH_ALL plus the 32-byte collection
 * preimage the Twonk covenant requires. Unlock order: <sig> <pubkey> <cid>.
 *
 * Transfer: rebuilds the token output by swapping ONLY the owner H2 bytes
 * (positions verified against mainnet layout); H1 + metadata stay identical.
 * Burn: spends token UTXOs to a plain P2PKH, destroying the token form.
 *
 *   node tools/transfer.mjs --mint <mintTxid> --vout <n> --fund <txid:vout> --fee <sats> [--broadcast]
 *   node tools/transfer.mjs --burn --mint <mintTxid> --vouts 10,11 --fund <txid:vout> --fee <sats> [--broadcast]
 *
 * Without --broadcast it prints the signed hex for inspection.
 */
import { LockingScript, P2PKH, PrivateKey, Transaction, UnlockingScript } from "@bsv/sdk";
import fs from "node:fs";

const ALPHA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** 20-byte pkh from a base58 P2PKH address (hex). */
function pkhHex(addr) {
  let n = 0n;
  for (const c of addr) {
    const v = ALPHA.indexOf(c);
    if (v < 0) throw new Error("bad address");
    n = n * 58n + BigInt(v);
  }
  let h = n.toString(16);
  if (h.length % 2) h = "0" + h;
  let bytes = Array.from(Buffer.from(h, "hex"));
  while (bytes.length < 25) bytes.unshift(0);
  return Buffer.from(bytes.slice(1, 21)).toString("hex");
}

async function txHex(txid) {
  const r = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${txid}/hex`);
  if (!r.ok) throw new Error(`WoC hex ${r.status} for ${txid}`);
  return (await r.text()).trim();
}

async function broadcast(hex) {
  const r = await fetch("https://api.whatsonchain.com/v1/bsv/main/tx/raw", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ txhex: hex }),
  });
  const body = await r.text();
  if (!r.ok) throw new Error(`broadcast ${r.status}: ${body.slice(0, 300)}`);
  return body;
}

/** Twonk unlock: normal P2PKH signature, then the collection preimage push. */
function twonkUnlock(priv, contractIdHex) {
  const base = new P2PKH().unlock(priv);
  const cid = Array.from(Buffer.from(contractIdHex, "hex"));
  if (cid.length !== 32) throw new Error("contract id must be 32 bytes");
  return {
    sign: async (tx, inputIndex) => {
      const b = await base.sign(tx, inputIndex);
      return UnlockingScript.fromBinary([...b.toBinary(), 0x20, ...cid]);
    },
    estimateLength: async () => (await base.estimateLength()) + 33,
  };
}

const burn = process.argv.includes("--burn");
const doBroadcast = process.argv.includes("--broadcast");
const mintTxid = arg("mint");
const fund = arg("fund");
const fee = Number(arg("fee") || (burn ? 3000 : 1200));
if (!mintTxid || !fund) {
  console.error("need --mint <txid> --fund <txid:vout> [--vout N | --burn --vouts N,N]");
  process.exit(2);
}
const privA = PrivateKey.fromWif(process.env.TWONK_WIF_A || "");
if (!process.env.TWONK_WIF_A) throw new Error("TWONK_WIF_A required");
const addrA = privA.toAddress();
const contractId = fs.readFileSync(new URL("../contract-id.txt", import.meta.url), "utf8").trim();
if (!/^[0-9a-f]{64}$/.test(contractId)) throw new Error("bad contract id");

const mintTx = Transaction.fromHex(await txHex(mintTxid));
const [fundTxid, fundVoutStr] = fund.split(":");
const fundVout = Number(fundVoutStr);
const fundTx = Transaction.fromHex(await txHex(fundTxid));
const fundSats = fundTx.outputs[fundVout].satoshis;

const tx = new Transaction();
tx.addInput({
  sourceTXID: fundTxid,
  sourceOutputIndex: fundVout,
  sourceTransaction: fundTx,
  unlockingScriptTemplate: new P2PKH().unlock(privA),
  sequence: 0xffffffff,
});

if (!burn) {
  const vout = Number(arg("vout"));
  const toAddr = arg("to") || process.env.TWONK_ADDR_B || "";
  if (!toAddr) throw new Error("transfer needs --to <address>");
  const prevHex = mintTx.outputs[vout].lockingScript.toHex();
  // Mainnet layout: a9 14 <H1:20> 88 76 a9 14 <H2:20> 88 ac 6a <meta>.
  const head = prevHex.slice(0, 4 + 40 + 8);
  if (!head.startsWith("a914") || head.slice(44) !== "8876a914") throw new Error("prevout is not a Twonk");
  const rest = prevHex.slice(4 + 40 + 8 + 40);
  if (!rest.startsWith("88ac6a")) throw new Error("prevout is not a Twonk");
  tx.addInput({
    sourceTXID: mintTxid,
    sourceOutputIndex: vout,
    sourceTransaction: mintTx,
    unlockingScriptTemplate: twonkUnlock(privA, contractId),
    sequence: 0xffffffff,
  });
  tx.addOutput({
    lockingScript: LockingScript.fromHex(head + pkhHex(toAddr) + rest),
    satoshis: 546,
  });
  tx.addOutput({
    lockingScript: new P2PKH().lock(addrA),
    satoshis: fundSats - 546 - fee,
  });
} else {
  const vouts = (arg("vouts") || "").split(",").map((s) => Number(s.trim())).filter((n) => Number.isInteger(n));
  if (!vouts.length) throw new Error("--burn needs --vouts N,N,...");
  for (const v of vouts) {
    const prevHex = mintTx.outputs[v].lockingScript.toHex();
    if (!prevHex.startsWith("a914") || mintTx.outputs[v].satoshis !== 546) {
      throw new Error(`vout ${v} is not a 546-sat Twonk`);
    }
    tx.addInput({
      sourceTXID: mintTxid,
      sourceOutputIndex: v,
      sourceTransaction: mintTx,
      unlockingScriptTemplate: twonkUnlock(privA, contractId),
      sequence: 0xffffffff,
    });
  }
  const tokenSats = 546 * vouts.length;
  tx.addOutput({ lockingScript: new P2PKH().lock(addrA), satoshis: tokenSats });
  tx.addOutput({ lockingScript: new P2PKH().lock(addrA), satoshis: fundSats + tokenSats - tokenSats - fee });
}

await tx.sign();
const hex = tx.toHex();
const id = tx.id("hex");
console.log(JSON.stringify({ txid: id, hexLen: hex.length, fee }, null, 1));
if (doBroadcast) {
  const res = await broadcast(hex);
  console.log("broadcast response:", res.slice(0, 200));
} else if (process.env.TWONK_SAVE_HEX) {
  fs.writeFileSync(process.env.TWONK_SAVE_HEX, hex);
  console.log("saved hex to", process.env.TWONK_SAVE_HEX);
} else {
  console.log("hex:", hex.slice(0, 120) + "...");
}
