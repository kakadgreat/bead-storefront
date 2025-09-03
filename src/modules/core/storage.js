const KEY = 'canton_bead_cart_v2'
export function load(){ try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
export function save(items){ localStorage.setItem(KEY, JSON.stringify(items||[])) }
