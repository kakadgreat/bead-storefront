import * as Cart from '../cart/index.js'

export async function loadItems(){
  const res = await fetch('/data/products.json', { cache: 'no-store' })
  if(!res.ok) return []
  return await res.json()
}

export function renderFilters(items){
  const shapes = [...new Set(items.map(x => x.shape).filter(Boolean))].sort()
  const stones = [...new Set(items.map(x => x.stone).filter(Boolean))].sort()
  const selShape = document.getElementById('shape')
  const selStone = document.getElementById('stone')
  selShape.innerHTML = '<option value="">All</option>' + shapes.map(s=>`<option>${s}</option>`).join('')
  selStone.innerHTML = '<option value="">All</option>' + stones.map(s=>`<option>${s}</option>`).join('')
}

export function renderTable(items, opts={}){
  const q = (document.getElementById('q')?.value || '').toLowerCase()
  const shape = document.getElementById('shape')?.value || ''
  const stone = document.getElementById('stone')?.value || ''
  const tbody = document.getElementById('tbody')

  const rows = items.filter(i => {
    if(shape && i.shape!==shape) return False
    if(stone && i.stone!==stone) return False
    const hay = `${i.code||''} ${i.name||''} ${i.stone||''} ${i.shape||''} ${i.size||''}`.toLowerCase()
    return q ? hay.includes(q) : true
  })

  const pageSize = opts.pageSize || 20
  const page = Math.min(Math.max(1, Number(opts.page||1)), Math.ceil(rows.length / pageSize) || 1)
  const start = (page-1)*pageSize
  const slice = rows.slice(start, start+pageSize)

  tbody.innerHTML = slice.map(i => `
    <tr>
      <td>${i.code||''}</td>
      <td><div class="font-medium">${i.name||''}</div><div class="text-xs text-slate-500">${i.stone||''}</div></td>
      <td>${i.shape||''}</td>
      <td>${i.size||''}</td>
      <td class="text-right">$${Number(i.price||0).toFixed(2)}</td>
      <td class="text-right">
        <button class="rounded-lg px-2 py-1 border" data-action="add" data-id="${i.id}">Add</button>
      </td>
    </tr>
  `).join('')

  // pager
  const pager = document.getElementById('pager')
  const pages = Math.ceil(rows.length / pageSize)
  pager.innerHTML = Array.from({length: pages}, (_,k)=>k+1).map(n => `
    <button class="px-3 py-1 rounded border ${n===page ? 'bg-slate-900 text-white' : ''}" data-page="${n}">${n}</button>
  `).join('')

  return { page, pageSize, total: rows.length }
}

export function handleTableEvents(items, state){
  document.addEventListener('click', (e) => {
    const t = e.target
    if(t && t.matches('#pager [data-page]')){
      state.page = Number(t.getAttribute('data-page')) || 1
      renderTable(items, state)
    }
    if(t && t.matches('button[data-action="add"]')){
      const id = t.getAttribute('data-id')
      const item = items.find(x => String(x.id) === String(id))
      if(item){ Cart.add(item, 1) }
    }
  })

  document.addEventListener('input', (e) => {
    const t = e.target
    if(t && (t.id==='q' || t.id==='shape' || t.id==='stone')){
      state.page = 1
      renderTable(items, state)
    }
  })
}
