
const STORAGE = { CART:"bead_cart_v2", FAVS:"bead_favs_v2", RECENT:"bead_recent_v2" };
const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));
const toMoney = n => `$${Number(n||0).toFixed(2)}`;
const cssSafe = s => String(s||'na').replace(/[^a-zA-Z0-9_-]/g,'_');

const WHOLESALE_TIERS = [
  { minQty: 5,  discount: 0.05 },
  { minQty: 10, discount: 0.10 },
  { minQty: 20, discount: 0.15 },
];
function priceWithTiers(unit, qty){
  let disc = 0;
  for(const t of WHOLESALE_TIERS){ if(qty >= t.minQty) disc = Math.max(disc, t.discount); }
  return unit * (1 - disc);
}

// CART
function loadCart(){ try{return JSON.parse(localStorage.getItem(STORAGE.CART))||[]}catch{return[]} }
function saveCart(list){ localStorage.setItem(STORAGE.CART, JSON.stringify(list)); updateCartUI(); }
function addToCart(item, qty=1){
  const list = loadCart();
  const id = item.id || item.code || item.name;
  const found = list.find(x => (x.id||x.code||x.name) === id);
  if(found) found.qty = (found.qty||1) + qty;
  else list.push({ id, code:item.code, name:item.name, stone:item.stone, shape:item.shape, size:item.size, price:item.price, qty });
  saveCart(list);
  pushRecent(item);
}
function updateCartQty(id, qty){
  const list = loadCart();
  const it = list.find(x => (x.id||x.code||x.name) === id);
  if(it){ it.qty = Math.max(1, parseInt(qty||1)); saveCart(list); }
}
function removeCart(id){ saveCart(loadCart().filter(x => (x.id||x.code||x.name) !== id)); }
function cartTotals(list){
  const total = list.reduce((a,c)=> a + priceWithTiers(Number(c.price)||0, c.qty||1) * (c.qty||1), 0);
  const count = list.reduce((a,c)=> a + (c.qty||1), 0);
  return { total, count };
}
function updateCartUI(){
  const list = loadCart();
  const { total, count } = cartTotals(list);
  $("#listCount")?.textContent = count;
  $("#grandTotal")?.textContent = toMoney(total);
  $("#listTotalCount")?.textContent = count;
  const itemsEl = $("#listItems");
  if(itemsEl){
    itemsEl.innerHTML = list.map(it=>{
      const unit = Number(it.price)||0;
      const tierUnit = priceWithTiers(unit, it.qty||1);
      const line = tierUnit * (it.qty||1);
      return `<div class="p-3 border border-slate-200 rounded-xl">
        <div class="flex items-center justify-between gap-3">
          <div class="flex-1">
            <div class="text-sm font-medium">${it.name}</div>
            <div class="text-xs text-slate-500">${it.stone||""} ${it.size? "• "+it.size:""} ${it.shape? "• "+it.shape:""} ${it.code? "• "+it.code:""}</div>
          </div>
          <div class="text-right text-sm">
            <div class="text-slate-500">Unit: ${toMoney(unit)}${tierUnit<unit ? ` <span class='text-emerald-600'>(${toMoney(tierUnit)} tier)</span>`:""}</div>
            <div class="font-semibold">Line: ${toMoney(line)}</div>
          </div>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <label class="text-slate-500">Qty</label>
            <input type="number" min="1" value="${it.qty||1}" class="w-20 rounded border border-slate-300 px-2 py-1" oninput="updateCartQty('${cssSafe(it.id||it.code||it.name)}', this.value)"/>
          </div>
          <div class="flex items-center gap-2">
            <button class="text-xs border border-slate-300 rounded-lg px-2 py-1" onclick="exportCSV()">CSV</button>
            <button class="text-xs border border-slate-300 rounded-lg px-2 py-1" onclick="shareCart()">Share</button>
            <button class="text-sm text-rose-600 hover:text-rose-700" onclick="removeCart('${cssSafe(it.id||it.code||it.name)}')">Remove</button>
          </div>
        </div>
      </div>`;
    }).join("") || '<div class="text-sm text-slate-500">Your list is empty.</div>';
  }
  const payload = $("#listPayload");
  if(payload){ payload.value = JSON.stringify({ items: list, totals: { total, count } }, null, 2); }
}

// Favorites + Recently Viewed
function loadFavs(){ try{return JSON.parse(localStorage.getItem(STORAGE.FAVS))||{}}catch{return{}} }
function saveFavs(f){ localStorage.setItem(STORAGE.FAVS, JSON.stringify(f)); }
function toggleFav(id){ const f = loadFavs(); f[id] = !f[id]; saveFavs(f); renderFavIcons(); }
function renderFavIcons(){
  const favs = loadFavs();
  $$("[data-fav]").forEach(btn => {
    const id = btn.getAttribute("data-fav");
    const on = !!favs[id];
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.innerHTML = on ? "♥" : "♡";
    btn.className = "w-8 h-8 rounded-full grid place-items-center text-sm " + (on ? "text-rose-600" : "text-slate-400");
  });
}

function pushRecent(item){
  const key = item.id || item.code || item.name;
  const rec = (JSON.parse(localStorage.getItem(STORAGE.RECENT)) || []).filter(r => r.key !== key);
  rec.unshift({ key, name:item.name, stone:item.stone, price:item.price, shape:item.shape, size:item.size });
  localStorage.setItem(STORAGE.RECENT, JSON.stringify(rec.slice(0,12)));
}
function getRecent(){ try{return JSON.parse(localStorage.getItem(STORAGE.RECENT))||[]}catch{return[]} }
function renderRecently(containerId, dataset){
  const el = document.getElementById(containerId);
  if(!el) return;
  const rec = getRecent();
  if(!rec.length){ el.classList.add("hidden"); return; }
  const map = new Map(dataset.map(d => [d.id || d.code || d.name, d]));
  const items = rec.map(r => map.get(r.key)).filter(Boolean);
  if(!items.length){ el.classList.add("hidden"); return; }
  el.innerHTML = `<h3 class="text-lg font-semibold mb-2">Recently Viewed</h3>
    <div class="carousel">${items.map(it => `
      <div class="border border-slate-200 rounded-xl p-3 min-w-0">
        <div class="flex items-center justify-between">
          <span class="badge">${it.stone}</span>
          <button title="Save to Favorites" data-fav="${it.id}" onclick="toggleFav('${it.id}')">♡</button>
        </div>
        <div class="mt-1 text-sm font-medium truncate">${it.name}</div>
        <div class="text-xs text-slate-500 truncate">${it.shape||""}${it.size ? (it.shape? " • ":"") + it.size : ""}</div>
        <div class="mt-2 flex items-center justify-between">
          <div class="text-sky-700 font-semibold">${toMoney(it.price)}</div>
          <div class="flex items-center gap-2">
            <input type="number" min="1" value="1" class="w-16 rounded border border-slate-300 px-2 py-1" id="qty_recent_${cssSafe(it.id)}"/>
            <button class="text-xs rounded-lg border border-slate-300 px-2 py-1" onclick="(function(){const q=parseInt(document.getElementById('qty_recent_${cssSafe(it.id)}').value||1); addToCart(${JSON.stringify({"id":"__ID__","code":"__CODE__","name":"__NAME__","stone":"__STONE__","shape":"__SHAPE__","size":"__SIZE__","price":"__PRICE__"})}, Math.max(1,q));})()">Add</button>
          </div>
        </div>
      </div>`
      .replace("__ID__", String(it.id||""))
      .replace("__CODE__", String(it.code||""))
      .replace("__NAME__", String(it.name||""))
      .replace("__STONE__", String(it.stone||""))
      .replace("__SHAPE__", String(it.shape||""))
      .replace("__SIZE__", String(it.size||""))
      .replace("__PRICE__", String(it.price||0))
    ).join("")}</div>`;
  renderFavIcons();
}

// Share & Export
function shareCart(){
  const list = loadCart();
  const data = btoa(unescape(encodeURIComponent(JSON.stringify(list))));
  const url = `${location.origin}${location.pathname}#cart=${data}`;
  navigator.clipboard.writeText(url).then(()=>{
    alert("Shareable link copied!");
  }).catch(()=>{ alert("Link ready: " + url); });
}
function loadCartFromHash(){
  const m = location.hash.match(/#cart=([A-Za-z0-9+/=]+)/);
  if(m){
    try{
      const json = decodeURIComponent(escape(atob(m[1])));
      const list = JSON.parse(json);
      if(Array.isArray(list) && list.length){ localStorage.setItem(STORAGE.CART, JSON.stringify(list)); }
    }catch(e){}
  }
}
function exportCSV(){
  const list = loadCart();
  const header = ["Name","Stone","Shape","Size","Code","Unit Price","Qty","Line Total"];
  const rows = list.map(it => {
    const unit = Number(it.price)||0;
    const line = priceWithTiers(unit, it.qty||1) * (it.qty||1);
    return [it.name, it.stone||"", it.shape||"", it.size||"", it.code||"", unit, it.qty||1, line];
  });
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bead-list.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

// Filters & UI helpers
function clearFilters(ids){ ids.forEach(id=>{const el=document.getElementById(id); if(el){el.value=""; el.classList.remove('filter-active');}}); const si=$("#searchInput"); if(si) si.value=""; }

// Print
function fillPrintArea(){
  const list = loadCart();
  const form = document.forms.request;
  const customer = form ? Object.fromEntries(new FormData(form).entries()) : {};
  const tbody = $("#printRows");
  const total = list.reduce((a,c)=> a + priceWithTiers(Number(c.price)||0, c.qty||1) * (c.qty||1), 0);
  if(tbody){
    tbody.innerHTML = list.map(it => {
      const unit = Number(it.price)||0;
      const tierUnit = priceWithTiers(unit, it.qty||1);
      const line = tierUnit * (it.qty||1);
      return `<tr>
        <td class="border border-slate-300 p-2">${it.name||""}</td>
        <td class="border border-slate-300 p-2">${it.stone||""}</td>
        <td class="border border-slate-300 p-2">${it.size||""}</td>
        <td class="border border-slate-300 p-2">${it.shape||""}</td>
        <td class="border border-slate-300 p-2" style="text-align:right;">${toMoney(unit)}</td>
        <td class="border border-slate-300 p-2" style="text-align:right;">${it.qty||1}</td>
        <td class="border border-slate-300 p-2" style="text-align:right;">${toMoney(line)}</td>
      </tr>`;
    }).join("");
  }
  $("#printGrand")?.textContent = toMoney(total);
  const pc = $("#printCustomer");
  if(pc){
    pc.innerHTML = `
      <div><strong>Name:</strong> ${customer.name||""}</div>
      <div><strong>Company:</strong> ${customer.company||""}</div>
      <div><strong>Phone:</strong> ${customer.phone||""}</div>
      <div><strong>Email:</strong> ${customer.email||""}</div>
      <div><strong>Address:</strong> ${customer.address||""}</div>
      <div><strong>Comments:</strong> ${customer.comments||""}</div>`;
  }
}
function printSummary(){ fillPrintArea(); window.print(); }

// Expose needed funcs
window.addToCart = addToCart;
window.updateCartQty = updateCartQty;
window.removeCart = removeCart;
window.toggleFav = toggleFav;
window.printSummary = printSummary;
window.clearFilters = clearFilters;
window.updateCartUI = updateCartUI;
window.renderFavIcons = renderFavIcons;
window.renderRecently = renderRecently;
window.shareCart = shareCart;
window.exportCSV = exportCSV;
window.loadCartFromHash = loadCartFromHash;
