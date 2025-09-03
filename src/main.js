import { mount as mountCart } from './modules/ui/cartDrawer.js'
import { loadItems, renderFilters, renderTable, handleTableEvents } from './modules/catalog/index.js'

const state = { page: 1, pageSize: 20 }

async function boot(){
  try {
    const items = await loadItems()
    renderFilters(items)
    renderTable(items, state)
    handleTableEvents(items, state)
    mountCart()
  } catch (e){
    console.error(e)
  }
}

boot()
