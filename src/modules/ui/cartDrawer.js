import * as Cart from '../cart/index.js'
import { money } from '../core/format.js'

export function mount(){
  const drawer = document.getElementById('cartDrawer')
  const btn = document.getElementById('cartButton')
  const close = document.getElementById('closeCart')
  const itemsEl = document.getElementById('cartItems')
  const totalEl = document.getElementById('cartTotal')
  const countEl = document.getElementById('cartCount')

  function open(){ drawer.style.transform = 'translateX(0%)' }
  function hide(){ drawer.style.transform = 'translateX(100%)' }

  function refresh(){
    countEl.textContent = String(Cart.count())
    Cart.renderList(itemsEl)
    totalEl.textContent = money(Cart.total())
  }

  document.addEventListener('input', (e) => {
    const t = e.target
    if(t && t.matches('#cartItems input[type="number"]')){
      const id = t.getAttribute('data-id')
      const val = Number(t.value || 0)
      Cart.setQty(id, val)
      refresh()
    }
  })

  btn?.addEventListener('click', ()=>{ open(); refresh() })
  close?.addEventListener('click', hide)

  refresh()
}
