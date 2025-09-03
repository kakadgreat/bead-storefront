import { load, save } from '../core/storage.js'
import { money } from '../core/format.js'

export function get(){ return load() }
export function count(){ return get().reduce((a,x)=>a + Number(x.qty||1), 0) }
export function total(){ return get().reduce((a,x)=>a + Number(x.qty||1) * Number(x.price||0), 0) }

export function add(item, qty=1){
  if(!item) return
  const c = get()
  const id = String(item.id ?? item.code ?? item.name ?? Math.random())
  const i = c.findIndex(x => String(x.id) === id)
  if(i>=0){ c[i].qty = Number(c[i].qty||1) + Number(qty||1) }
  else { c.push({ id, name: item.name||'', price: Number(item.price||0), qty: Number(qty||1) }) }
  save(c)
}

export function setQty(id, qty){
  const c = get()
  const i = c.findIndex(x => String(x.id) === String(id))
  if(i>=0){
    const q = Math.max(0, Number(qty||0))
    if(q===0) c.splice(i,1)
    else c[i].qty = q
    save(c)
  }
}

export function clear(){ save([]) }

export function renderList(el){
  const c = get()
  el.innerHTML = c.map(x => `
    <div class="flex items-start justify-between gap-3 border p-2 rounded-lg">
      <div>
        <div class="font-medium text-sm">${x.name||''}</div>
        <div class="text-xs text-slate-600">${money(x.price)} × 
          <input type="number" min="0" value="${x.qty||1}" data-id="${x.id}" class="w-16 border rounded px-1 py-0.5 ml-1">
        </div>
      </div>
      <div class="text-sm">${money((x.qty||1)*(x.price||0))}</div>
    </div>
  `).join('')
}
