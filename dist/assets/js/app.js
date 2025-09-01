
(function(){
  "use strict";
  const KEY="canton_bead_cart_v1";
  function get(){ try{return JSON.parse(localStorage.getItem(KEY)||"[]");}catch(e){return[]} }
  function save(a){ localStorage.setItem(KEY, JSON.stringify(a)); }
  function fmt(n){ return "$"+(Number(n||0).toFixed(2)); }
  window.addToCart=function(item, qty){ if(!item) return; const q=Math.max(1,parseInt(qty||1,10)); const c=get(); const i=c.findIndex(x=>x.id===item.id); if(i>=0) c[i].qty=(c[i].qty||1)+q; else c.push({...item, price:Number(item.price||0), qty:q}); save(c); updateCartUI(); };
  window.updateCartUI=function(){ const c=get(); const count=c.reduce((a,b)=>a+(b.qty||1),0); const badge=document.getElementById("listCount"); if(badge) badge.textContent=String(count);
    const list=document.getElementById("listItems"); if(list){ list.innerHTML=c.map(x=>{const ln=(x.qty||1)*Number(x.price||0); return `<div class="p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
      <div><div class="font-medium text-sm">${x.name}</div><div class="text-xs text-slate-500">${x.stone||""} · ${x.shape||""} · ${x.size||""}</div><div class="text-xs text-slate-600">${fmt(x.price)} × ${x.qty||1}</div></div>
      <div class="flex items-center gap-2"><button data-minus="${x.id}" class="px-2 py-1 rounded-lg border">–</button><span>${x.qty||1}</span><button data-plus="${x.id}" class="px-2 py-1 rounded-lg border">+</button><button data-remove="${x.id}" class="px-2 py-1 rounded-lg border">Remove</button></div>
    </div>`; }).join("");
    const payload=document.getElementById("listPayload"); if(payload) payload.value=JSON.stringify(c);
    const total=c.reduce((a,b)=>a+(Number(b.price||0)*(b.qty||1)),0); const g=document.getElementById("grandTotal"); if(g) g.textContent=fmt(total); const tc=document.getElementById("listTotalCount"); if(tc) tc.textContent=String(count); }
  };
  document.addEventListener("click", (e)=>{ const el=e.target.closest("[data-minus],[data-plus],[data-remove]"); if(!el) return; const c=get(); if(el.hasAttribute("data-minus")){ const id=el.getAttribute("data-minus"); const i=c.findIndex(x=>x.id===id); if(i>=0){ c[i].qty=Math.max(1,(c[i].qty||1)-1); save(c); updateCartUI(); } }
    else if(el.hasAttribute("data-plus")){ const id=el.getAttribute("data-plus"); const i=c.findIndex(x=>x.id===id); if(i>=0){ c[i].qty=(c[i].qty||1)+1; save(c); updateCartUI(); } }
    else if(el.hasAttribute("data-remove")){ const id=el.getAttribute("data-remove"); const i=c.findIndex(x=>x.id===id); if(i>=0){ c.splice(i,1); save(c); updateCartUI(); } } });
  function openD(){ const d=document.getElementById("drawer"); if(d) d.style.transform="translateX(0)"; }
  function closeD(){ const d=document.getElementById("drawer"); if(d) d.style.transform="translateX(100%)"; }
  document.addEventListener("click",(e)=>{ if(e.target.closest("#openList")){ e.preventDefault(); openD(); } if(e.target.closest("#closeList")){ e.preventDefault(); closeD(); } if(e.target.closest("#clearList")){ e.preventDefault(); localStorage.setItem(KEY,"[]"); updateCartUI(); } });
  function wirePrint(id){ const b=document.getElementById(id); if(!b) return; b.addEventListener("click", function(){ const c=get(); const rows=c.map(x=>{const ln=Number(x.price||0)*(x.qty||1); return `<tr><td class="b p">${x.name}</td><td class="b p">${x.stone||""}</td><td class="b p">${x.size||""}</td><td class="b p">${x.shape||""}</td><td class="b p r">${fmt(x.price||0)}</td><td class="b p r">${x.qty||1}</td><td class="b p r">${fmt(ln)}</td></tr>`; }).join(""); const total=c.reduce((a,b)=>a+(Number(b.price||0)*(b.qty||1)),0);
      const tbl=document.getElementById("printRows"), g=document.getElementById("printGrand"); if(tbl) tbl.innerHTML=rows; if(g) g.textContent=fmt(total); window.print(); }); }
  ["printSummaryHeader","printSummary","printSummaryDrawer"].forEach(wirePrint);
  // Overlay menu
  const btn = document.getElementById("allStonesBtn"), overlay=document.getElementById("megaOverlay"), panel=document.getElementById("megaPanel");
  if(btn&&overlay&&panel){ btn.addEventListener("click",()=>{ overlay.style.display="block"; panel.style.display="block"; panel.focus(); });
    function close(){ overlay.style.display="none"; panel.style.display="none"; }
    overlay.addEventListener("click", close); document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") close(); });
    const listEl=document.getElementById("megaList"); if(listEl){ const stonesCSV=document.body.getAttribute("data-stones")||""; let stones=stonesCSV?stonesCSV.split("|"):[]; stones=[...new Set(stones)].sort((a,b)=>a.localeCompare(b)); listEl.innerHTML=stones.map(s=>`<a href="/stone/${s.toLowerCase().replace(/[^a-z0-9]+/g,'-')}/">${s}</a>`).join(""); } }
  window.addEventListener("load", updateCartUI);
})();