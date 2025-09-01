
(function(){
  function ready(fn){ if(document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  window.__PAGE_INIT__ = function(){
    var DATA = window.DATA || [];
    var fShape = document.getElementById("fShape");
    var fSize  = document.getElementById("fSize");
    var fPrice = document.getElementById("fPrice");
    var searchInput = document.getElementById("searchInput");
    var clearBtn = document.getElementById("clearFilters");
    var catalogGrid = document.getElementById("catalogGrid");
    var catalogEmpty = document.getElementById("catalogEmpty");

    function populateFilterOptions(items){
      if(!fShape || !fSize) return;
      var shapes = Array.from(new Set(items.map(function(i){return i.shape;}).filter(Boolean))).sort(function(a,b){return a.localeCompare(b)});
      var sizes  = Array.from(new Set(items.map(function(i){return i.size;}).filter(Boolean))).sort(function(a,b){
        var na = parseInt(String(a).replace(/[^0-9]/g,''))||0;
        var nb = parseInt(String(b).replace(/[^0-9]/g,''))||0;
        return na-nb;
      });
      fShape.innerHTML = '<option value=\"\">Shape: All</option>' + shapes.map(function(s){return '<option>'+s+'</option>';}).join('');
      fSize.innerHTML  = '<option value=\"\">Size: All</option>'  + sizes.map(function(s){return '<option>'+s+'</option>';}).join('');
    }

    function card(it){
      var id = it.id;
      return [
        '<article class="card rounded-xl bg-white border border-slate-200 overflow-hidden p-3" data-id="'+id+'">',
          '<div class="flex items-center justify-between">',
            '<span class="badge">'+ (it.stone||'') +'</span>',
            '<button title="Save to Favorites" data-fav="'+id+'">♡</button>',
          '</div>',
          '<div class="mt-2 space-y-1">',
            '<div><div class="label">Full name</div><div class="value font-medium">'+ (it.name||'') +'</div></div>',
            '<div class="grid grid-cols-2 gap-2">',
              '<div><div class="label">Stone</div><div class="value">'+ (it.stone||'') +'</div></div>',
              '<div><div class="label">Price</div><div class="value text-sky-700 font-semibold">$'+ Number(it.price||0).toFixed(2) +'</div></div>',
              '<div><div class="label">Shape</div><div class="value">'+ ((it.shape||'') || '-') +'</div></div>',
              '<div><div class="label">Size</div><div class="value">'+ ((it.size||'') || '-') +'</div></div>',
            '</div>',
          '</div>',
          '<div class="mt-3 flex items-center justify-between">',
            '<input type="number" min="1" value="1" class="w-24 rounded border border-slate-300 px-2 py-1" data-qty="'+id+'"/>',
            '<button class="add-btn text-xs rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50" data-id="'+id+'">Add to List</button>',
          '</div>',
        '</article>'
      ].join('');
    }

    function render(items){
      if(!catalogGrid) return;
      catalogGrid.innerHTML = items.map(card).join('');
      if(catalogEmpty){ catalogEmpty.classList.toggle('hidden', items.length !== 0); }
      renderFavIcons();
    }

    function applyFilters(items){
      var q = (searchInput && searchInput.value || '').toLowerCase().trim();
      var sShape = fShape ? fShape.value : '';
      var sSize  = fSize ? fSize.value : '';
      var sPrice = fPrice ? fPrice.value : '';
      [fShape,fSize,fPrice].filter(Boolean).forEach(function(el){ el.classList.toggle('filter-active', !!el.value); });

      var out = items.filter(function(i){
        var hay = (i.name+' '+i.stone+' '+i.shape+' '+i.size).toLowerCase();
        if(q && hay.indexOf(q) === -1) return false;
        if(sShape && i.shape !== sShape) return false;
        if(sSize  && i.size  !== sSize) return false;
        if(sPrice){
          var parts = sPrice.split('-');
          var lo = Number(parts[0]||0), hi = Number(parts[1]||999999);
          var p = i.price || 0;
          if(!(p>=lo && p<hi)) return false;
        }
        return true;
      });
      render(out);
    }

    // Only on stone pages (where DATA exists and catalogGrid exists)
    if((DATA && DATA.length) && catalogGrid){
      populateFilterOptions(DATA);
      render(DATA);
      ['input','change'].forEach(function(evt){
        if(fShape) fShape.addEventListener(evt, function(){ applyFilters(DATA); });
        if(fSize)  fSize.addEventListener(evt,  function(){ applyFilters(DATA); });
        if(fPrice) fPrice.addEventListener(evt, function(){ applyFilters(DATA); });
        if(searchInput) searchInput.addEventListener(evt, function(){ applyFilters(DATA); });
      });
      if(clearBtn) clearBtn.addEventListener('click', function(){ clearFilters(['fShape','fSize','fPrice']); if(searchInput) searchInput.value=''; applyFilters(DATA); });
    }

    // Delegation for Add & Fav (both pages)
    document.addEventListener('click', function(e){
      var btn = e.target;
      if(btn.matches && btn.matches('.add-btn')){
        var id = btn.getAttribute('data-id');
        var qtyEl = document.querySelector('input[data-qty="'+id+'"]');
        var q = parseInt((qtyEl && qtyEl.value) || '1', 10) || 1;
        var item = (window.DATA || []).find(function(d){ return String(d.id) === String(id); });
        if(item){ addToCart(item, Math.max(1,q)); }
      }
      if(btn.matches && btn.hasAttribute('data-fav') && btn.getAttribute('data-fav')){
        toggleFav(btn.getAttribute('data-fav'));
      }
      if(btn && btn.id === 'openList'){ var dr = document.getElementById('drawer'); if(dr) dr.style.transform='translateX(0)'; }
      if(btn && btn.id === 'printSummaryHeader'){ printSummary(); }
    });

    updateCartUI();
    renderFavIcons();
  };
  ready(function(){ window.__PAGE_INIT__ && window.__PAGE_INIT__(); });
})();
