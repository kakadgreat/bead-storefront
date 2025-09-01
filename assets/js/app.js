
// Simple cart in localStorage
(function(){
  "use strict";
  const KEY = "canton_bead_cart_v1";

  function getCart(){
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch(e){ return []; }
  }
  function saveCart(arr){
    localStorage.setItem(KEY, JSON.stringify(arr));
  }

  window.addToCart = function(item, qty){
    if(!item) return;
    const q = Math.max(1, parseInt(qty||1,10));
    const cart = getCart();
    const i = cart.findIndex(x => x.id===item.id);
    if(i>=0){ cart[i].qty = Math.max(1, (cart[i].qty||1) + q); }
    else { cart.push({ id:item.id, code:item.code||"", name:item.name||"", stone:item.stone||"", shape:item.shape||"", size:item.size||"", price:Number(item.price||0), qty:q }); }
    saveCart(cart);
    updateCartUI();
  };

  window.removeFromCart = function(id){
    const cart = getCart().filter(x=>x.id!==id);
    saveCart(cart);
    updateCartUI();
  };

  window.clearCart = function(){
    saveCart([]);
    updateCartUI();
  };

  function fmt(n){ return "$"+Number(n||0).toFixed(2); }

  window.updateCartUI = function(){
    const cart = getCart();
    const count = cart.reduce((a,b)=>a+(b.qty||1),0);
    const elCount = document.getElementById("listCount");
    if(elCount) elCount.textContent = String(count);

    // Drawer list
    const list = document.getElementById("listItems");
    if(list){
      list.innerHTML = cart.map(x => {
        const line = (x.qty||1) * Number(x.price||0);
        return [
          '<div class="p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-3">',
          '<div>',
          '<div class="font-medium text-sm">'+(x.name||'')+'</div>',
          '<div class="text-xs text-slate-500">'+(x.stone||'')+' • '+(x.shape||'-')+' • '+(x.size||'-')+'</div>',
          '<div class="text-xs text-slate-500">Unit: '+fmt(x.price)+' • Qty: '+(x.qty||1)+' • Line: '+fmt(line)+'</div>',
          '</div>',
          '<div class="flex items-center gap-2">',
          '<button data-minus="'+x.id+'" class="rounded border border-slate-300 w-8 h-8">-</button>',
          '<div class="w-9 text-center">'+(x.qty||1)+'</div>',
          '<button data-plus="'+x.id+'" class="rounded border border-slate-300 w-8 h-8">+</button>',
          '<button data-remove="'+x.id+'" class="ml-2 text-slate-600 hover:text-red-600">Remove</button>',
          '</div>',
          '</div>'
        ].join('');
      }).join('');
    }
    const total = cart.reduce((a,b)=> a + (Number(b.price||0)*(b.qty||1)), 0);
    const elGrand = document.getElementById("grandTotal");
    if(elGrand) elGrand.textContent = fmt(total);
    const elTC = document.getElementById("listTotalCount");
    if(elTC) elTC.textContent = String(count);

    // sync hidden payload for Netlify form
    const payload = document.getElementById("listPayload");
    if(payload) payload.value = JSON.stringify(cart);
  };

  // plus/minus/remove delegation
  document.addEventListener("click", function(e){
    const el = e.target.closest("[data-minus],[data-plus],[data-remove]");
    if(!el) return;
    const cart = getCart();
    if(el.hasAttribute("data-minus")){
      const id = el.getAttribute("data-minus");
      const i = cart.findIndex(x=>x.id===id);
      if(i>=0){ cart[i].qty = Math.max(1, (cart[i].qty||1)-1); saveCart(cart); updateCartUI(); }
    } else if(el.hasAttribute("data-plus")){
      const id = el.getAttribute("data-plus");
      const i = cart.findIndex(x=>x.id===id);
      if(i>=0){ cart[i].qty = (cart[i].qty||1)+1; saveCart(cart); updateCartUI(); }
    } else if(el.hasAttribute("data-remove")){
      const id = el.getAttribute("data-remove");
      saveCart(cart.filter(x=>x.id!==id)); updateCartUI();
    }
  });

  // Drawer controls
  function openDrawer(){ const d=document.getElementById("drawer"); if(d) d.style.transform = "translateX(0)"; }
  function closeDrawer(){ const d=document.getElementById("drawer"); if(d) d.style.transform = "translateX(100%)"; }
  document.addEventListener("click", function(e){
    const open = e.target.closest("#openList");
    const close = e.target.closest("#closeList");
    const clear = e.target.closest("#clearList");
    if(open){ e.preventDefault(); openDrawer(); }
    if(close){ e.preventDefault(); closeDrawer(); }
    if(clear){ e.preventDefault(); clearCart(); }
  });

  // Export CSV
  window.exportCSV = function(){
    const cart = getCart();
    const rows = [["Code","Name","Stone","Shape","Size","Unit","Qty","Line"]].concat(
      cart.map(x => [x.code,x.name,x.stone,x.shape,x.size,Number(x.price||0),x.qty||1,Number(x.price||0)*(x.qty||1)])
    );
    const csv = rows.map(r=>r.map(v=>('"'+String(v).replace(/"/g,'""')+'"')).join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bead-list.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Print Summary
  window.printSummary = function(){
    const cart = getCart();
    const rows = cart.map(x => {
      const line = Number(x.price||0)*(x.qty||1);
      return '<tr>'+
        '<td class="border border-slate-300 p-2">'+x.name+'</td>'+
        '<td class="border border-slate-300 p-2">'+(x.stone||"")+'</td>'+
        '<td class="border border-slate-300 p-2">'+(x.size||"")+'</td>'+
        '<td class="border border-slate-300 p-2">'+(x.shape||"")+'</td>'+
        '<td class="border border-slate-300 p-2 text-right">$'+Number(x.price||0).toFixed(2)+'</td>'+
        '<td class="border border-slate-300 p-2 text-right">'+(x.qty||1)+'</td>'+
        '<td class="border border-slate-300 p-2 text-right">$'+line.toFixed(2)+'</td>'+
      '</tr>';
    }).join("");
    const total = cart.reduce((a,b)=> a + (Number(b.price||0)*(b.qty||1)), 0);
    const tbody = document.getElementById("printRows");
    if(tbody) tbody.innerHTML = rows;
    const g = document.getElementById("printGrand");
    if(g) g.textContent = "$"+total.toFixed(2);
    const area = document.getElementById("printArea");
    if(area){
      area.classList.remove("hidden");
      window.print();
      setTimeout(()=>area.classList.add("hidden"), 300);
    } else {
      window.print();
    }
  };

  // Optional: share via URL (hash)
  window.shareCart = function(){
    const cart = getCart();
    const data = btoa(unescape(encodeURIComponent(JSON.stringify(cart))));
    const url = location.origin + location.pathname + "#cart="+data;
    navigator.clipboard && navigator.clipboard.writeText(url);
    alert("List link copied to clipboard.");
  };

  // Load from hash if provided
  window.loadCartFromHash = function(){
    const m = (location.hash||"").match(/cart=([^&]+)/);
    if(!m) return;
    try {
      const json = decodeURIComponent(escape(atob(m[1])));
      const arr = JSON.parse(json);
      if(Array.isArray(arr)) saveCart(arr);
    } catch(e){}
  };

  // Initialize UI on load
  window.addEventListener("load", function(){
    loadCartFromHash();
    updateCartUI();
    const p1=document.getElementById("printSummary");
    const p2=document.getElementById("printSummaryHeader");
    const p3=document.getElementById("printSummaryDrawer");
    [p1,p2,p3].forEach(btn => btn && btn.addEventListener("click", printSummary));
  });
})();
