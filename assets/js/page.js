
(function(){
  // Run once DOM is ready
  function ready(fn){ if(document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  window.__PAGE_INIT__ = function(){
    const DATA = window.DATA || [];
        const fShape = document.getElementById("fShape");
    const fSize  = document.getElementById("fSize");
    const fPrice = document.getElementById("fPrice");
    const searchInput = document.getElementById("searchInput");
    const clearBtn = document.getElementById("clearFilters");
    const catalogGrid = document.getElementById("catalogGrid");
    const catalogEmpty = document.getElementById("catalogEmpty");

    function populateFilterOptions(items){
      const shapes = [...new Set(items.map(i=>i.shape).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
      const sizes  = [...new Set(items.map(i=>i.size).filter(Boolean))].sort((a,b)=>{
        const na = parseInt(String(a).replace(/[^0-9]/g,''))||0;
        const nb = parseInt(String(b).replace(/[^0-9]/g,''))||0;
        return na-nb;
      });
      fShape.innerHTML = '<option value=\"\">Shape: All</option>' + shapes.map(s=>'<option>'+s+'</option>').join("");
      fSize.innerHTML  = '<option value=\"\">Size: All</option>'  + sizes.map(s=>'<option>'+s+'</option>').join("");
    }
    populateFilterOptions(DATA);

    function card(it){
      const id = it.id;
      return (
        '<article class=\"card rounded-xl bg-white border border-slate-200 overflow-hidden p-3\" data-id=\"'+id+'\">' +
          '<div class=\"flex items-center justify-between\">' +
            '<span class=\"badge\">'+ (it.stone||'') +'</span>' +
            '<button title=\"Save to Favorites\" data-fav=\"'+id+'\" onclick=\"toggleFav(\''+id+'\')\">♡</button>' +
          '</div>' +
          '<h3 class=\"mt-2 text-sm font-semibold\">'+ (it.name||'') +'</h3>' +
          '<div class=\"mt-1 text-xs text-slate-500\">'+ ((it.shape? it.shape : '') + (it.size ? ((it.shape? ' • ' : '') + it.size) : '')) +'</div>' +
          '<div class=\"mt-2 flex items-center justify-between\">' +
            '<div class=\"text-sky-700 font-semibold\">$'+ Number(it.price||0).toFixed(2) +'</div>' +
            '<div class=\"flex items-center gap-2\">' +
              '<input type=\"number\" min=\"1\" value=\"1\" class=\"w-20 rounded border border-slate-300 px-2 py-1\" id=\"qty_'+id+'\"/>' +
              '<button class=\"text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 hover:bg-slate-50\" onclick=\"(function(){ var q=parseInt(document.getElementById(\'qty_'+id+'\').value||1); addToCart('+ JSON.stringify({"id":"__ID__","code":"__CODE__","name":"__NAME__","stone":"__STONE__","shape":"__SHAPE__","size":"__SIZE__","price":"__PRICE__"}) +', Math.max(1,q)); })()\">Add</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      )
      .replace('__ID__', String(it.id||''))
      .replace('__CODE__', String(it.code||''))
      .replace('__NAME__', String(it.name||''))
      .replace('__STONE__', String(it.stone||''))
      .replace('__SHAPE__', String(it.shape||''))
      .replace('__SIZE__', String(it.size||''))
      .replace('__PRICE__', String(it.price||0));
    }

    function render(items){
      catalogGrid.innerHTML = items.map(card).join('');
      catalogEmpty.classList.toggle('hidden', items.length !== 0);
      renderFavIcons();
    }
    render(DATA);

    function applyFilters(items){
      var q = (searchInput.value||'').toLowerCase().trim();
      var sStone = ""; // stone filter removed
      var sShape = fShape.value;
      var sSize  = fSize.value;
      var sPrice = fPrice.value;

      [fShape,fSize,fPrice].forEach(function(el){ el.classList.toggle('filter-active', !!el.value); });

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

    ['input','change'].forEach(function(evt){
      fStone.addEventListener(evt, function(){ applyFilters(DATA); });
      fShape.addEventListener(evt, function(){ applyFilters(DATA); });
      fSize.addEventListener(evt,  function(){ applyFilters(DATA); });
      fPrice.addEventListener(evt, function(){ applyFilters(DATA); });
      searchInput.addEventListener(evt, function(){ applyFilters(DATA); });
    });
    clearBtn.addEventListener('click', function(){ clearFilters(['fStone','fShape','fSize','fPrice']); applyFilters(DATA); });

    // Recently viewed carousel
    renderRecently('recently', DATA);

    // Drawer controls
    document.getElementById('openList').addEventListener('click', function(){ document.getElementById('drawer').style.transform = 'translateX(0)'; });
    document.getElementById('closeList').addEventListener('click', function(){ document.getElementById('drawer').style.transform = 'translateX(100%)'; });
    document.getElementById('goRequest').addEventListener('click', function(){ document.getElementById('drawer').style.transform = 'translateX(100%)'; });
    document.getElementById('clearList').addEventListener('click', function(){ localStorage.setItem('bead_cart_v2','[]'); updateCartUI(); });

    document.getElementById('printSummary')?.addEventListener('click', printSummary);
    document.getElementById('printSummaryDrawer')?.addEventListener('click', printSummary);

    updateCartUI();
    renderFavIcons();
  };
  ready(function(){ window.__PAGE_INIT__ && window.__PAGE_INIT__(); });
})();
