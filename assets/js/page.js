
(function(){
  "use strict";
  var DATA = Array.isArray(window.DATA) ? window.DATA : [];
  var elGrid = document.getElementById("catalogGrid");
  if(!elGrid){ return; }
  function uniq(a){ var m={},out=[]; a.forEach(function(x){ if(!x) return; if(!m[x]){ m[x]=1; out.push(x);} }); return out; }
  function card(it){
    var img = it.image ? '<div class="thumb"><img src="'+it.image+'" alt="'+(it.name||'').replace(/\"/g,'&quot;')+'" loading="lazy"></div>' : '';
    return '<article class="card rounded-xl bg-white border border-slate-200 overflow-hidden p-3" data-id="'+it.id+'">'+
      img+
      '<div class="mt-2 space-y-2">'+
        '<div class="value font-medium leading-snug">'+(it.name||'')+'</div>'+
        '<div class="info-grid">'+
          '<div class="info-cell"><div class="info-label">Stone</div><div class="info-value">'+(it.stone||'')+'</div></div>'+
          '<div class="info-cell"><div class="info-label">Price</div><div class="info-value text-sky-700 font-semibold">'+'$'+Number(it.price||0).toFixed(2)+'</div></div>'+
          '<div class="info-cell"><div class="info-label">Shape</div><div class="info-value">'+(it.shape||'-')+'</div></div>'+
          '<div class="info-cell"><div class="info-label">Size</div><div class="info-value">'+(it.size||'-')+'</div></div>'+
        '</div>'+
      '</div>'+
      '<div class="mt-3 flex items-center justify-between">'+
        '<input type="number" min="1" value="1" class="w-24 rounded border border-slate-300 px-2 py-1" data-qty="'+it.id+'"/>'+
        '<button class="add-btn text-xs rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50" data-id="'+it.id+'">Add to List</button>'+
      '</div>'+
    '</article>';
  }
  function buckets(){ return [["0-10",0,10],["10-20",10,20],["20-50",20,50],["50-999",50,999999]]; }
  function inBucket(p,tag){ var b=buckets().find(function(x){return x[0]===tag}); return b? (p>=b[1]&&p<b[2]) : true; }
  function render(){
    var fs=document.getElementById("fShape"), fz=document.getElementById("fSize"), fp=document.getElementById("fPrice"), so=document.getElementById("fSort");
    var q=(document.getElementById("searchInput")||{value:""}).value.toLowerCase().trim();
    var rows=DATA.filter(function(i){
      if(fs && fs.value && String(i.shape||"")!==fs.value) return false;
      if(fz && fz.value && String(i.size||"")!==fz.value) return false;
      if(fp && fp.value && !inBucket(Number(i.price)||0, fp.value)) return false;
      if(q){ var hay=(i.name+' '+i.stone+' '+i.shape+' '+i.size).toLowerCase(); if(hay.indexOf(q)===-1) return false; }
      return true;
    });
    if(so && so.value==="price-asc") rows.sort((a,b)=> (a.price||0)-(b.price||0));
    else if(so && so.value==="price-desc") rows.sort((a,b)=> (b.price||0)-(a.price||0));
    else if(so && so.value==="name-asc") rows.sort((a,b)=> String(a.name).localeCompare(String(b.name)));
    elGrid.innerHTML = '<div class="grid-3">'+rows.map(card).join("")+'</div>';
    var elEmpty=document.getElementById("catalogEmpty");
    if(elEmpty) elEmpty.classList.toggle("hidden", rows.length>0);
  }
  (function(){
    var elShape=document.getElementById("fShape"), elSize=document.getElementById("fSize");
    if(elShape){
      var shapes = uniq(DATA.map(x=>x.shape)).sort((a,b)=> String(a).localeCompare(String(b)));
      elShape.innerHTML = '<option value="">Shape: All</option>' + shapes.map(s=>'<option>'+s+'</option>').join("");
    }
    if(elSize){
      var sizes = uniq(DATA.map(x=>x.size)).sort();
      elSize.innerHTML = '<option value="">Size: All</option>' + sizes.map(s=>'<option>'+s+'</option>').join("");
    }
  })();
  ["fShape","fSize","fPrice","fSort","searchInput","clearFilters"].forEach(function(id){
    var el=document.getElementById(id);
    if(!el) return;
    if(id==="clearFilters"){ el.addEventListener("click", function(){ var a=["fShape","fSize","fPrice","fSort","searchInput"]; a.forEach(function(i){ var x=document.getElementById(i); if(x) x.value=""; }); render(); }); }
    else { el.addEventListener("input", render); el.addEventListener("change", render); }
  });
  document.addEventListener("click", function(e){
    var btn=e.target.closest(".add-btn"); if(!btn) return;
    var id=btn.getAttribute("data-id"); var it=DATA.find(x=>x.id===id);
    var qty=document.querySelector('[data-qty="'+id+'"]'); var q=Math.max(1, parseInt((qty&&qty.value)||"1",10));
    if(window.addToCart) window.addToCart(it,q);
    if(window.updateCartUI) window.updateCartUI();
  });
  render();
})();