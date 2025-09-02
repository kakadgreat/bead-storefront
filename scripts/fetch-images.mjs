
import fs from "fs";
const INPUT = "data/inventory.csv";
const OUTPUT = "data/image-column.csv";
const BASE = "https://dir.indiamart.com/impcat/gemstone-beads.html";
function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }
function idx(header, name){ const i = header.findIndex(h => (h||"").trim().toLowerCase() === name.trim().toLowerCase()); return i >= 0 ? i : -1; }
function parseCSV(text){ const lines = text.split(/\r?\n/).filter(Boolean); const rows = lines.map(l => l.split(",")); return rows; }
async function findImage(q){ await sleep(900 + Math.random()*400); const res = await fetch(BASE + "?q=" + encodeURIComponent(q), { headers: { "User-Agent":"Mozilla/5.0" } }); const html = await res.text(); const m = html.match(/<img[^>]+src="([^"]+)"[^>]*>/i); return m ? m[1] : ""; }
if(!fs.existsSync(INPUT)){ console.error("Missing", INPUT, "- download your live CSV there first."); process.exit(1); }
const raw = fs.readFileSync(INPUT, "utf-8"); const rows = parseCSV(raw); const header = rows.shift();
const iFull = idx(header, "Full Name") >= 0 ? idx(header, "Full Name") : idx(header, "Name");
const iStone = idx(header, "Stone"); const iS1 = idx(header, "Shape 1"); const iS2 = idx(header, "Shape 2");
const out = [];
for(const r of rows){
  if(!r || !r.length){ out.push(""); continue; }
  const name = (r[iFull]||"").trim(); const stone = (r[iStone]||"").trim(); const s1 = (r[iS1]||"").trim(); const s2 = (r[iS2]||"").trim();
  const shape = (s1 + " " + s2).trim(); if(!name && !stone){ out.push(""); continue; }
  const q = [stone, shape || "", "gemstone beads"].join(" ").replace(/\s+/g," ").trim();
  try{ const url = await findImage(q); out.push(url || ""); console.log((name||stone), "=>", url); }catch(e){ out.push(""); }
}
fs.writeFileSync(OUTPUT, out.join("\n"), "utf-8"); console.log("Wrote", OUTPUT);
