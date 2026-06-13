import { NextResponse } from 'next/server'
import catalog from '@/data/lion-catalog.json'

interface CatalogVariant { option: string; model?: string }
interface CatalogProduct {
  id: string; name: string; model?: string; brand?: string
  variants?: CatalogVariant[]
}

function escape(s: string) { return `"${String(s).replace(/"/g, '""')}"` }

export async function GET() {
  const rows: string[][] = [['Sr No', 'Brand', 'Model', 'Product Name', 'Qty']]
  let n = 1
  for (const p of catalog.products as unknown as CatalogProduct[]) {
    const brand = p.brand ?? ''
    if (p.variants?.length) {
      for (const v of p.variants) {
        const model = v.model || p.model || ''
        rows.push([String(n++), brand, model, `${p.name} — ${v.option}`, ''])
      }
    } else {
      rows.push([String(n++), brand, p.model ?? '', p.name, ''])
    }
  }

  const csv = rows.map((r) => r.map(escape).join(',')).join('\r\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sv-sales-quote-template.csv"',
    },
  })
}
