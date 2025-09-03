import fs from 'fs/promises'
import path from 'path'

const CSV_URL = process.env.CSV_URL || 'REPLACE_WITH_YOUR_PUBLISHED_SHEET_CSV_URL'
const OUT = path.resolve('public/data/products.json')

async function fetchCSV(url){
  const res = await fetch(url)
  if(!res.ok) throw new Error(`CSV fetch failed: ${res.status}`)
  return await res.text()
}

function parseCSV(text){
  const lines = text.split(/\r?\n/).filter(Boolean)
  const headers = lines[0].split(',').map(h => h.trim())
  const rows = lines.slice(1).map(line => {
    const cols = []
    let cur = '', inQ=false
    for (let i=0;i<line.length;i++){
      const ch=line[i]
      if(ch==='"'){ inQ=!inQ; continue }
      if(ch===',' && !inQ){ cols.push(cur); cur=''; continue }
      cur += ch
    }
    cols.push(cur)
    const obj = {}
    headers.forEach((h,i)=>obj[h]=cols[i]?.trim() ?? '')
    return obj
  })
  return rows
}

function normalize(rows){
  const items = rows.map((r,idx)=>{
    const price = Number(String(r.price||r.Price||0).replace(/[^\d.]/g,'')) || 0
    return {
      id: r.id || r.ID || String(idx+1),
      code: r.code || r.Code || '',
      name: r.name || r.Name || '',
      stone: r.stone || r.Stone || '',
      shape: r.shape || r.Shape || '',
      size: r.size || r.Size || '',
      price,
      image: r.image || r.Image || '',
    }
  })
  return items
}

async function main(){
  const csv = await fetchCSV(CSV_URL)
  const rows = parseCSV(csv)
  const items = normalize(rows)
  await fs.mkdir(path.dirname(OUT), { recursive: true })
  await fs.writeFile(OUT, JSON.stringify(items, null, 2))
  console.log(`Wrote ${items.length} items -> ${OUT}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
