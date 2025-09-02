
(function(){
  "use strict";
  var DATA = Array.isArray(window.DATA) ? window.DATA : [];
  var PAGE=1, PER=50;
  var elTBody = document.getElementById("tblBody");
  var elInfo  = document.getElementById("pageInfo");
  var elSearch= document.getElementById("tblSearch");
  function fmt(n){ return "$"+(Number(n||0).toFixed(2)); }
  function render(){
    var q=(elSearch&&elSearch.value||"").toLowerCase().trim();
    var rows = DATA.filter(function(i){
      if(!q) return true;
      var hay=(i.name+' '+i.stone+' '+i.shape+' '+i.size+' '+i.code).toLowerCase();
      return hay.indexOf(q)!==-1;
    });
    var total=rows.length; var pages=Math.max(1, Math.ceil(total/PER));
    if(PAGE>pages) PAGE=pages; var start=(PAGE-1)*PER, end=start+PER; var slice=rows.slice(start,end);
    elTBody.innerHTML = slice.map(function(i){
      return '<tr>'+
        '<td><input type="checkbox" data-id="'+i.id+'"/></td>'+
        '<td class="hide-sm">'+(i.code||'')+'</td>'+
        '<td><div class="font-medium">'+(i.name||'')+'</div><div class="text-xs text-slate-500">'+(i.stone||'')+'</div></td>'+
        '<td>'+ (i.shape||'') +'</td>'+
        '<td>'+ (i.size||'') +'</td>'+
        '<td class="text-right">'+ fmt(i.price) +'</td>'+
        '<td class="text-right"><input type="number" min="1" value="1" class="qty-input" data-qty="'+i.id+'"/></td>'+
      '</tr>';
    }).join("");
    elInfo.textContent = (slice.length? (start+1) : 0) + '–' + (start+slice.length) + ' of ' + total;
    document.getElementById("btnPrev").disabled = PAGE<=1;
    document.getElementById("btnNext").disabled = PAGE>=pages;
  }
  document.getElementById("btnPrev").addEventListener("click", function(){ PAGE=Math.max(1,PAGE-1); render(); });
  document.getElementById("btnNext").addEventListener("click", function(){ PAGE=PAGE+1; render(); });
  if(elSearch){ elSearch.addEventListener("input", function(){ PAGE=1; render(); }); }
  document.getElementById("addSelected").addEventListener("click", function(){
    var checked = Array.from(document.querySelectorAll('input[type="checkbox"][data-id]:checked'));
    if(!checked.length) return;
    checked.forEach(function(box){
      var id=box.getAttribute("data-id");
      var it=DATA.find(x=>x.id===id);
      var q=document.querySelector('[data-qty="'+id+'"]');
      var qty=Math.max(1, parseInt((q&&q.value)||"1",10));
      if(window.addToCart) window.addToCart(it, qty);
    });
    if(window.updateCartUI) window.updateCartUI();
    alert(checked.length + " item(s) added to list.");
  });
  render();
})();