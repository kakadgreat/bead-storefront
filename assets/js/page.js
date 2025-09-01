
(function(){
  "use strict";
  var DATA = Array.isArray(window.DATA) ? window.DATA : [];
  var elGrid = document.getElementById("catalogGrid");
  var elEmpty = document.getElementById("catalogEmpty");
  if(!elGrid){ return; }

  function buckets(){ return [["0-10",0,10],["10-20",10,20],["20-50",20,50],["50-999",50,999999]]; }
  function inBucket(p,tag){
    var b = buckets().find(function(x){ return x[0]===tag; });
    if(!b) return true;
    return p>=b[1] && p<b[2];
  }
  function uniq(arr){ var m={}, out=[]; arr.forEach(function(x){ if(!x) return; if(!m[x]){ m[x]=1; out.push(x); } }); return out; }
  function sortBy(arr, sel){
    var a = arr.slice();
    if(sel==="price-asc") a.sort(function(x,y){ return (x.price||0)-(y.price||0); });
    else if(sel==="price-desc") a.sort(function(x,y){ return (y.price||0)-(x.price||0); });
    else if(sel==="size-asc"){
      function mm(v){ var m=String(v||"").match(/(\d+(?:\.\d+)?)mm/); return m?parseFloat(m[1]):9999; }
      a.sort(function(x,y){ return mm(x.size)-mm(y.size); });
    } else if(sel==="name-asc") a.sort(function(x,y){ return String(x.name).localeCompare(String(y.name)); });
    return a;
  }

  function card(it){
    return [
      '<article class="card rounded-xl bg-white border border-slate-200 overflow-hidden p-3" data-id="'+it.id+'">',
      '<div class="flex items-center justify-between">',
      '<span class="badge">'+(it.stone||'')+'</span>',
      '<button title="Save to Favorites" data-fav="'+it.id+'">♡</button>',
      '</div>',
      '<div class="mt-2 space-y-1">',
      '<div class="value font-medium">'+(it.name||'')+'</div>',
      '<div class="grid grid-cols-2 gap-2">',
      '<div><div class="label">Stone</div><div class="value">'+(it.stone||'')+'</div></div>',
      '<div><div class="label">Price</div><div class="value text-sky-700 font-semibold">$'+Number(it.price||0).toFixed(2)+'</div></div>',
      '<div><div class="label">Shape</div><div class="value">'+((it.shape||'')||'-')+'</div></div>',
      '<div><div class="label">Size</div><div class="value">'+((it.size||'')||'-')+'</div></div>',
      '</div>',
      '</div>',
      '<div class="mt-3 flex items-center justify-between">',
      '<input type="number" min="1" value="1" class="w-24 rounded border border-slate-300 px-2 py-1" data-qty="'+it.id+'"/>',
      '<button class="add-btn text-xs rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50" data-id="'+it.id+'">Add to List</button>',
      '</div>',
      '</article>'
    ].join('');
  }

  function render(){
    var fShape = document.getElementById("fShape");
    var fSize  = document.getElementById("fSize");
    var fPrice = document.getElementById("fPrice");
    var fSort  = document.getElementById("fSort");
    var q      = (document.getElementById("searchInput")||{value:""}).value.toLowerCase().trim();

    var rows = DATA.filter(function(it){
      if(fShape && fShape.value && String(it.shape||"")!==fShape.value) return false;
      if(fSize && fSize.value && String(it.size||"")!==fSize.value) return false;
      if(fPrice && fPrice.value && !inBucket(Number(it.price)||0, fPrice.value)) return false;
      if(q){
        var hay = (it.name+" "+it.stone+" "+it.shape+" "+it.size).toLowerCase();
        if(hay.indexOf(q)===-1) return false;
      }
      return true;
    });

    rows = sortBy(rows, fSort?fSort.value:"");

    if(rows.length===0){
      if(elEmpty) elEmpty.classList.remove("hidden");
      elGrid.innerHTML = "";
      return;
    }
    if(elEmpty) elEmpty.classList.add("hidden");

    elGrid.innerHTML = '<div class="grid-3">'+rows.map(card).join("")+'</div>';
  }

  // Populate select options
  (function initFilters(){
    var elShape = document.getElementById("fShape");
    var elSize  = document.getElementById("fSize");
    if(elShape){
      var shapes = uniq(DATA.map(function(x){return x.shape;})).sort(function(a,b){return String(a).localeCompare(String(b));});
      elShape.innerHTML = '<option value="">Shape: All</option>' + shapes.map(function(s){return '<option>'+s+'</option>';}).join("");
    }
    if(elSize){
      var sizes = uniq(DATA.map(function(x){return x.size;})).sort(function(a,b){
        function mm(v){ var m=String(v||"").match(/(\d+(?:\.\d+)?)mm/); return m?parseFloat(m[1]):9999; }
        return mm(a)-mm(b);
      });
      elSize.innerHTML = '<option value="">Size: All</option>' + sizes.map(function(s){return '<option>'+s+'</option>';}).join("");
    }
  })();

  // Wire events if the controls exist
  ["fShape","fSize","fPrice","fSort","searchInput","clearFilters"].forEach(function(id){
    var el = document.getElementById(id);
    if(!el) return;
    if(id==="clearFilters"){
      el.addEventListener("click", function(){
        var fs=document.getElementById("fShape"); if(fs) fs.value="";
        var fz=document.getElementById("fSize"); if(fz) fz.value="";
        var fp=document.getElementById("fPrice"); if(fp) fp.value="";
        var so=document.getElementById("fSort"); if(so) so.value="";
        var si=document.getElementById("searchInput"); if(si) si.value="";
        render();
      });
    } else {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    }
  });

  // Add to List (delegated)
  document.addEventListener("click", function(e){
    var btn = e.target.closest(".add-btn");
    if(!btn) return;
    var id = btn.getAttribute("data-id");
    var item = DATA.find(function(x){ return x.id===id; });
    var qtyInput = document.querySelector('[data-qty="'+id+'"]');
    var qty = Math.max(1, parseInt((qtyInput && qtyInput.value) || "1", 10));
    if(window.addToCart) window.addToCart(item, qty);
    // update UI count if available
    if(window.updateCartUI) window.updateCartUI();
  });

  // First paint
  render();
})();
