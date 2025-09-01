
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7t7O-yUIZNSrglVHnMcRgd2IMAYBQyrdGd6d-JUCoSmxWb5uJNI2G3oKqL8j22BtIBD1yhOXAtsZs/pub?output=csv";
const DIST = "dist";

async function fetchCSV(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error("Failed to fetch CSV: "+res.status);
  return await res.text();
}
function ci(row){
  const map = Object.fromEntries(Object.entries(row).map(([k,v]) => [String(k).toLowerCase().trim(), v]));
  return (...cands) => {
    for(const c of cands){
      const v = map[String(c).toLowerCase()];
      if(v!==undefined && v!==null && String(v).trim()!=="") return v;
    }
    return undefined;
  };
}
function parseMoney(x){
  if(x===undefined || x===null) return 0;
  const s = String(x).replace(/\$/g,"").replace(/,/g,"").trim();
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}
function nOnly(x){
  const m = String(x||"").match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : undefined;
}
function normSize(size1, size2, name){
  const s1 = size1!==undefined ? String(size1) : "";
  const s2 = size2!==undefined ? String(size2) : "";
  function fmt(a,b){
    if(a && b && a!==b) return `${a}mm to ${b}mm`;
    if(a) return `${a}mm`;
    return "";
  }
  let m = s1.match(/(\d+(?:\.\d+)?)\s*(?:x|to|–|-|—|\s)\s*(\d+(?:\.\d+)?)/i);
  if(m) return fmt(m[1], m[2]);
  const a = nOnly(s1), b = nOnly(s2);
  if(a && b) return fmt(String(a), String(b));
  if(a && !b) return fmt(String(a));
  let t = String(name||"").toLowerCase().replace(/mm/g,"");
  let m2 = t.match(/(\d{1,2})\s*(?:to|–|-|—|x|\s)\s*(\d{1,2})/);
  if(m2) return fmt(m2[1], m2[2]);
  let m3 = t.match(/\b(2|3|4|5|6|7|8|9|10|12|14|16|18|20)\b/);
  if(m3) return fmt(m3[1]);
  return "";
}
function combineShape(s1, s2){
  const a = String(s1||"").trim();
  let b = String(s2||"").trim();
  b = b.toLowerCase()==="roundell" || b.toLowerCase()==="roundel" ? "Rondelle" : b;
  const parts = [a, b].filter(Boolean);
  return parts.join(" ");
}
function normalize(rows){
  return rows.map((row, idx) => {
    const get = ci(row);
    const name = get("Full Name","Name","Item","String") || "Bead";
    const stone = get("Stone") || "";
    const shape1 = get("Shape 1","Shape1","Shape") || "";
    const shape2 = get("Shape 2","Shape2") || "";
    const shape = combineShape(shape1, shape2);
    const price = parseMoney(get("Price","Retail","Sell","$","Value"));
    const size1 = get("Size1","Size 1") || "";
    const size2 = get("Size2","Size 2") || "";
    const size = normSize(size1, size2, name);
    const code = get("Code","SKU") || "";
    const id = (code ? String(code) : `${stone}-${name}-${idx}`).toLowerCase().replace(/[^a-z0-9]+/g,"-");
    return { id, name, stone, shape, size, price, code };
  }).filter(x => x.name && x.stone);
}

function head({title, desc}){
  return `<!DOCTYPE html><html lang="en"><head>
  <meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title}</title><meta name="description" content="${desc}"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/assets/css/extra.css">
  </head><body class="bg-white text-slate-800">`;
}

function header(stones){
  const links = stones.map(s => `<a class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 whitespace-nowrap text-sm" href="/stone/${slug(s)}/">${s}</a>`).join("");
  return `<header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <a href="/" class="text-xl font-bold tracking-tight">Canton <span class="text-sky-600">Bead</span> Shop</a>
      <nav class="hidden md:block flex-1 mx-6">
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">${links}</div>
      </nav>
      <div class="flex items-center gap-2">
        <button id="printSummaryHeader" class="hidden sm:inline-flex rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">Print Summary</button>
        <button id="openList" class="relative inline-flex items-center rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">
          My List <span id="listCount" class="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-600 text-white text-[11px]">0</span>
        </button>
      </div>
    </div>
  </header>`;
}
/">${s}</a>`).join("");
  return `<header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <a href="/" class="text-xl font-bold tracking-tight">Canton <span class="text-sky-600">Bead</span> Shop</a>
    <nav class="hidden md:flex items-center gap-2 text-sm">${links}</nav>
    <div class="flex items-center gap-2">
      <button id="printSummaryHeader" class="hidden sm:inline-flex rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">Print Summary</button>
      <button id="openList" class="relative inline-flex items-center rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">
        My List <span id="listCount" class="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-600 text-white text-[11px]">0</span>
      </button>
    </div>
  </div></header>`;
}
function footer(){
  return `<footer class="border-t border-slate-200">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-500">
      © <span id="year"></span> Canton Bead Shop
    </div></footer>
    <script src="/assets/js/app.js"></script>
    <script>
      document.getElementById("year").textContent = new Date().getFullYear();
      document.getElementById("printSummaryHeader")?.addEventListener("click", printSummary);
      loadCartFromHash(); updateCartUI();
    </script>
  </body></html>`;
}
function slug(s){ return String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function toMoney(n){ return `$${Number(n||0).toFixed(2)}`; }

function card(it){
  const id = it.id;
  return `<article class="card rounded-xl bg-white border border-slate-200 overflow-hidden p-3" data-id="${id}">
    <div class="flex items-center justify-between">
      <span class="badge">${it.stone}</span>
      <button title="Save to Favorites" data-fav="${id}" onclick="toggleFav('${id}')">♡</button>
    </div>
    <h3 class="mt-2 text-sm font-semibold">${it.name}</h3>
    <div class="mt-1 text-xs text-slate-500">${it.shape ? it.shape : ""}${it.size ? (it.shape? " • ":"") + it.size : ""}</div>
    <div class="mt-2 flex items-center justify-between">
      <div class="text-sky-700 font-semibold">${toMoney(it.price)}</div>
      <div class="flex items-center gap-2">
        <input type="number" min="1" value="1" class="w-20 rounded border border-slate-300 px-2 py-1" id="qty_${id}"/>
        <button class="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 hover:bg-slate-50"
          onclick="(function(){const q=parseInt(document.getElementById('qty_${id}').value||1); addToCart(${JSON.stringify(it)}, Math.max(1,q)); })()">Add</button>
      </div>
    </div>
  </article>`;
}
function grid(items){ return `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${items.map(card).join("")}</div>`; }


function filters(stones){
  return `<div class="filters-sticky flex flex-wrap items-center gap-2 mb-4">
    <select id="fShape" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
      <option value="">Shape: All</option>
    </select>
    <select id="fSize" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
      <option value="">Size: All</option>
    </select>
    <select id="fPrice" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
      <option value="">Price: All</option>
      <option value="0-10">$0–$10</option>
      <option value="10-20">$10–$20</option>
      <option value="20-50">$20–$50</option>
      <option value="50-999">$50+</option>
    </select>
    <button id="clearFilters" class="btn-clear rounded-lg px-3 py-2 text-sm">Clear</button>
    <div class="relative ml-auto">
      <input id="searchInput" type="search" placeholder="Search stone, shape, size, name…" class="w-64 max-w-[60vw] rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"/>
      <div id="suggestMenu" class="absolute left-0 right-0 bg-white border border-slate-200 rounded-lg mt-1 shadow hidden z-10"></div>
    </div>
  </div>`;
}
</option>`).join("")}
    </select>
    <select id="fShape" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
      <option value="">Shape: All</option>
    </select>
    <select id="fSize" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
      <option value="">Size: All</option>
    </select>
    <select id="fPrice" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
      <option value="">Price: All</option>
      <option value="0-10">$0–$10</option>
      <option value="10-20">$10–$20</option>
      <option value="20-50">$20–$50</option>
      <option value="50-999">$50+</option>
    </select>
    <button id="clearFilters" class="btn-clear rounded-lg px-3 py-2 text-sm">Clear</button>
    <div class="relative ml-auto">
      <input id="searchInput" type="search" placeholder="Search stone, shape, size, name…" class="w-64 max-w-[60vw] rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"/>
      <div id="suggestMenu" class="absolute left-0 right-0 bg-white border border-slate-200 rounded-lg mt-1 shadow hidden z-10"></div>
    </div>
  </div>`;
}
function drawer(){
  return `<aside id="drawer" class="fixed top-0 right-0 h-full w-[90vw] max-w-md bg-white border-l border-slate-200 shadow-xl translate-x-full transition-transform no-print">
    <div class="h-16 px-4 flex items-center justify-between border-b border-slate-200">
      <h3 class="font-semibold">My List</h3>
      <div class="flex items-center gap-2">
        <button id="printSummaryDrawer" class="text-sm border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50">Print</button>
        <button onclick="exportCSV()" class="text-sm border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50">CSV</button>
        <button onclick="shareCart()" class="text-sm border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50">Share</button>
        <button id="clearList" class="text-sm text-slate-600 hover:text-slate-800">Clear</button>
        <button id="closeList" class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">Close</button>
      </div>
    </div>
    <div id="listItems" class="p-4 space-y-3 overflow-y-auto h-[calc(100%-9.5rem)]"></div>
    <div class="p-4 border-t border-slate-200 flex items-center justify-between">
      <div class="text-sm text-slate-600"><span id="listTotalCount">0</span> items</div>
      <div class="text-sm font-semibold">Total: <span id="grandTotal">$0.00</span></div>
      <a href="#request" id="goRequest" class="inline-flex items-center rounded-xl bg-sky-600 px-4 py-2 text-white text-sm font-semibold shadow-soft hover:bg-sky-700">Proceed</a>
    </div>
  </aside>`;
}
function requestForm(){
  return `<section id="request" class="border-t border-slate-200 bg-slate-50/60">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Send Request</h2>
        <button id="printSummary" class="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100">Print Summary</button>
      </div>
      <p class="text-slate-600 mb-4">Add items to your list, then submit your details. We'll reply with price & shipping.</p>
      <form name="request" method="POST" data-netlify="true" class="grid sm:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <input type="hidden" name="form-name" value="request"/>
        <input type="hidden" id="listPayload" name="listPayload" />
        <label class="text-sm">Name <input required name="name" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"/></label>
        <label class="text-sm">Company <input name="company" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"/></label>
        <label class="text-sm">Phone <input name="phone" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"/></label>
        <label class="text-sm">Email <input required type="email" name="email" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"/></label>
        <label class="sm:col-span-2 text-sm">Address <input name="address" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"/></label>
        <label class="sm:col-span-2 text-sm">Comments <textarea name="comments" rows="4" class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="Any notes or special instructions"></textarea></label>
        <div class="sm:col-span-2 flex items-center justify-between">
          <div class="text-xs text-slate-500">Your selected items (with totals & wholesale tiers) will be sent with this request.</div>
          <button id="submitRequest" class="inline-flex items-center rounded-2xl bg-sky-600 px-5 py-3 text-white font-semibold">Submit</button>
        </div>
      </form>
    </div>
  </section>`;
}
function printArea(){
  return `<section id="printArea" class="hidden max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-2">Canton Bead Shop – Request Summary</h1>
    <div id="printCustomer" class="text-sm text-slate-700 mb-4"></div>
    <table class="w-full text-sm border border-slate-300 border-collapse">
      <thead class="bg-slate-100">
        <tr>
          <th class="border border-slate-300 p-2 text-left">Item</th>
          <th class="border border-slate-300 p-2 text-left">Stone</th>
          <th class="border border-slate-300 p-2 text-left">Size</th>
          <th class="border border-slate-300 p-2 text-left">Shape</th>
          <th class="border border-slate-300 p-2 text-right">Unit</th>
          <th class="border border-slate-300 p-2 text-right">Qty</th>
          <th class="border border-slate-300 p-2 text-right">Line</th>
        </tr>
      </thead>
      <tbody id="printRows"></tbody>
      <tfoot>
        <tr><td colspan="6" class="border border-slate-300 p-2 text-right font-semibold">Total</td>
            <td class="border border-slate-300 p-2 text-right font-bold" id="printGrand">$0.00</td></tr>
      </tfoot>
    </table>
  </section>`;
}


function page({ title, desc, stones, items, h1 }){
  const uniqueStones = Array.from(new Set(stones));
  return head({title, desc}) +
  header(uniqueStones) +
  `<main><section id="catalog"><div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between gap-4 mb-3">
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">${h1}</h1>
    </div>
    ${filters(uniqueStones)}
    <div id="catalogGrid"></div>
    <div id="catalogEmpty" class="hidden text-slate-500 text-sm mt-6">No items match your filters.</div>
    <div id="recentlyWrap" class="mt-10">
      <div id="recently"></div>
    </div>
  </div></section>
  ${requestForm()}
  ${drawer()}
  ${printArea()}
  </main>
  <script>window.DATA = ${JSON.stringify(items)};</script>
  <script src="/assets/js/page.js"></script>` + footer();
}

function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }
function writePage(p, html){ ensureDir(path.dirname(p)); fs.writeFileSync(p, html, "utf-8"); }

const csvText = await fetchCSV(CSV_URL);
const rows = parse(csvText, { columns: true, skip_empty_lines: true });
const items = normalize(rows);
const stones = Array.from(new Set(items.map(i=>i.stone))).sort((a,b)=> a.localeCompare(b));

fs.cpSync("assets", path.join(DIST, "assets"), { recursive: true });

writePage(path.join(DIST, "index.html"),
  page({ title: "Canton Bead Shop – Catalog",
         desc: "Browse beads by stone, shape and size. Build a list and request a quote.",
         stones, items, h1: "Catalog (All Stones)" })
);

const byStone = {};
for(const it of items){ (byStone[it.stone] ??= []).push(it); }
for(const stone of stones){
  const s = stone.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  writePage(path.join(DIST, "stone", s, "index.html"),
    page({ title: `${stone} Beads – Canton Bead Shop`,
           desc: `Shop ${stone} beads by shape and size. Build a list and request a quote.`,
           stones, items: byStone[stone], h1: `${stone}` })
  );
}

console.log("Build complete.");
