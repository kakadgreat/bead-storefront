
// Cart + Print + Menu overlay
(function(){
  "use strict";
  const KEY="canton_bead_cart_v1";
  function get(){ try{return JSON.parse(localStorage.getItem(KEY)||"[]");}catch(e){return[]} }
  function save(a){ localStorage.setItem(KEY, JSON.stringify(a)); }
  window.addToCart=function(item, qty){ if(!item) return; const q=Math.max(1,parseInt(qty||1,10)); const c=get(); const i=c.findIndex(x=>x.id===item.id); if(i>=0) c[i].qty=(c[i].qty||1)+q; else c.push({...item, price:Number(item.price||0), qty:q}); save(c); updateCartUI(); };
  window.updateCartUI=function(){ const c=get(); const count=c.reduce((a,b)=>a+(b.qty||1),0); const badge=document.getElementById("listCount"); if(badge) badge.textContent=String(count); const list=document.getElementById("listItems"); if(list){ list.innerHTML=c.map(x=>{const ln=(x.qty||1)*Number(x.price||0); return `<div class="p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-3"><div><div class="font-medium text-sm">${x.name}</div><div class="text-xs text-slate-500">${x.stone||""} • ${x.shape||"-"} • ${x.size||"-"}</div><div class="text-xs text-slate-500">Unit: $${(x.price||0).toFixed(2)} • Qty: ${x.qty||1} • Line: $${ln.toFixed(2)}</div></div><div class="flex items-center gap-2"><button data-minus="${x.id}" class="rounded border border-slate-300 w-8 h-8">-</button><div class="w-9 text-center">${x.qty||1}</div><button data-plus="${x.id}" class="rounded border border-slate-300 w-8 h-8">+</button><button data-remove="${x.id}" class="ml-2 text-slate-600 hover:text-red-600">Remove</button></div></div>`; }).join(""); }
    const total=c.reduce((a,b)=>a+(Number(b.price||0)*(b.qty||1)),0); const g=document.getElementById("grandTotal"); if(g) g.textContent="$"+total.toFixed(2); const tc=document.getElementById("listTotalCount"); if(tc) tc.textContent=String(count); const payload=document.getElementById("listPayload"); if(payload) payload.value=JSON.stringify(c); };
  document.addEventListener("click", (e)=>{ const el=e.target.closest("[data-minus],[data-plus],[data-remove]"); if(!el) return; const c=get(); if(el.hasAttribute("data-minus")){ const id=el.getAttribute("data-minus"); const i=c.findIndex(x=>x.id===id); if(i>=0){ c[i].qty=Math.max(1,(c[i].qty||1)-1); save(c); updateCartUI(); } } else if(el.hasAttribute("data-plus")){ const id=el.getAttribute("data-plus"); const i=c.findIndex(x=>x.id===id); if(i>=0){ c[i].qty=(c[i].qty||1)+1; save(c); updateCartUI(); } } else if(el.hasAttribute("data-remove")){ const id=el.getAttribute("data-remove"); const n=c.filter(x=>x.id!==id); localStorage.setItem(KEY,JSON.stringify(n)); updateCartUI(); } });

  // Drawer open/close
  function openD(){ const d=document.getElementById("drawer"); if(d) d.style.transform="translateX(0)"; }
  function closeD(){ const d=document.getElementById("drawer"); if(d) d.style.transform="translateX(100%)"; }
  document.addEventListener("click",(e)=>{ if(e.target.closest("#openList")){ e.preventDefault(); openD(); } if(e.target.closest("#closeList")){ e.preventDefault(); closeD(); } if(e.target.closest("#clearList")){ e.preventDefault(); localStorage.setItem(KEY,"[]"); updateCartUI(); } });

  // Print Summary (works from header or drawer)
  function wirePrint(id){ const b=document.getElementById(id); if(!b) return; b.addEventListener("click", function(){ const c=get(); const rows=c.map(x=>{const ln=Number(x.price||0)*(x.qty||1); return `<tr><td class="b p">${x.name}</td><td class="b p">${x.stone||""}</td><td class="b p">${x.size||""}</td><td class="b p">${x.shape||""}</td><td class="b p r">$${(x.price||0).toFixed(2)}</td><td class="b p r">${x.qty||1}</td><td class="b p r">$${ln.toFixed(2)}</td></tr>`; }).join(""); const total=c.reduce((a,b)=>a+(Number(b.price||0)*(b.qty||1)),0); const tbody=document.getElementById("printRows"); if(tbody) tbody.innerHTML=rows; const g=document.getElementById("printGrand"); if(g) g.textContent="$"+total.toFixed(2); const area=document.getElementById("printArea"); if(area){ area.classList.remove("hidden"); window.print(); setTimeout(()=>area.classList.add("hidden"), 300); } else { window.print(); } }); }
  ["printSummaryHeader","printSummary","printSummaryDrawer"].forEach(wirePrint);

  // Click-to-open Stones menu (overlay panel)
  function slug(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
  const btn = document.getElementById("allStonesBtn");
  const overlay = document.getElementById("megaOverlay");
  const panel = document.getElementById("megaPanel");
  if(btn && overlay && panel){
    btn.addEventListener("click", function(){ overlay.style.display="block"; panel.style.display="block"; panel.focus(); });
    function close(){ overlay.style.display="none"; panel.style.display="none"; }
    overlay.addEventListener("click", close);
    document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") close(); });
    // Populate links from data-stones attribute (CSV build injects), otherwise from visible chips
    const listEl = document.getElementById("megaList");
    if(listEl){
      const stonesCSV = document.body.getAttribute("data-stones")||"";
      let stones = stonesCSV ? stonesCSV.split("|") : Array.from(document.querySelectorAll('.chip-scroll a')).map(a=>a.textContent.trim());
      stones = Array.from(new Set(stones)).sort((a,b)=>a.localeCompare(b));
      listEl.innerHTML = stones.map(s=>`<a href="/stone/${slug(s)}/">${s}</a>`).join("");
    }
  }

  window.addEventListener("load", updateCartUI);
})();
