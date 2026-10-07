/** Headless smoke test for site/deliver.bundle.js (stubs DOM + network edges). */
import fs from "node:fs";

const bundle = fs.readFileSync(new URL("../site/deliver.bundle.js", import.meta.url), "utf8");
const registry = JSON.parse(fs.readFileSync(new URL("../site/registry.json", import.meta.url), "utf8"));
const keys = JSON.parse(fs.readFileSync(process.env.TWONK_KEYS || (process.env.HOME + "/.config/twonk-market/keys.json"), "utf8"));

const els = {};
function el(id) {
  if (!els[id]) els[id] = { value: "", disabled: false, textContent: "", innerHTML: "", hidden: true, onclick: null, onchange: null };
  return els[id];
}
const fakeRadio = { checked: false, value: "", onchange: null };
globalThis.document = {
  getElementById: el,
  querySelector: () => fakeRadio,
  querySelectorAll: () => [fakeRadio],
};

const F1 = "0ad9ebf3b7ddd79005e8a48adbf0361c5f892f4ab6cfdf62459b84a46403c0df";
const realFetch = fetch;
globalThis.fetch = async (url, opts) => {
  const u = String(url);
  if (u.endsWith("registry.json")) return new Response(JSON.stringify(registry));
  if (u.includes("/address/") && u.includes("/unspent")) {
    return new Response(JSON.stringify([{ txId: F1, vout: 0, value: 20000 }]));
  }
  if (u === "/api/broadcast") {
    const body = JSON.parse(opts.body);
    if (!/^[0-9a-f]{100,}$/.test(body.txhex)) return new Response(JSON.stringify({ ok: false }), { status: 400 });
    return new Response(JSON.stringify({ ok: true, txid: "smoke-broadcast-ok" }));
  }
  return realFetch(url, opts); // WoC passthrough
};

eval(bundle);
await new Promise((r) => setTimeout(r, 500)); // registry load

// 1. load seller key B (owns #1)
el("wif").value = keys.a.wif;
el("wif-go").onclick();
await new Promise((r) => setTimeout(r, 300));
console.log("addr shown:", el("wif-out").innerHTML.includes(keys.a.addr) ? "OK" : "FAIL " + el("wif-out").innerHTML);
console.log("wif cleared:", el("wif").value === "" ? "OK" : "FAIL");
// auto-select (B owns exactly #1) -> selectOutpoint fetches live hex
await new Promise((r) => setTimeout(r, 4000));
await new Promise((r) => setTimeout(r, 1000));

// 2. build transfer #1 B -> A
el("buyer").value = keys.b.addr;
el("fee").value = "1500";
el("manual-out").value = "0576d15033d01b67e4bf1dbabd40e456104fb3f499ba5505405f7190bc9b637c:11";
el("manual-out").onchange();
await new Promise((r) => setTimeout(r, 4000));
el("manual-fund").value = "230048c3e48bff6eb22893b610ff8227258c6937a03f7d8c04048197754c98b7:1";
await el("build").onclick();
console.log("token selected:", el("review").textContent.includes("TWONKLAB #2") ? "OK" : "FAIL " + el("review").textContent.slice(0, 80));
await new Promise((r) => setTimeout(r, 1000));
const rev = el("review").innerHTML;
console.log("signed:", rev.includes("txid") && rev.includes(keys.b.addr) ? "OK" : "FAIL " + rev.slice(0, 120));

// 3. broadcast via relay stub
await el("send").onclick();
await new Promise((r) => setTimeout(r, 300));
console.log("relay:", el("send-out").innerHTML.includes("smoke-broadcast-ok") ? "OK" : "FAIL " + el("send-out").innerHTML.slice(0, 120));
