import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import catalog from '@/data/lion-catalog.json'

interface CatalogVariant { option: string; model?: string }
interface CatalogProduct {
  id: string; name: string; model?: string; brand?: string; unit?: string
  variants?: CatalogVariant[]
}

const THIN: ExcelJS.BorderStyle = 'thin'

function borderAll(color = 'FFB0BEC5'): Partial<ExcelJS.Borders> {
  const s = { style: THIN, color: { argb: color } }
  return { top: s, left: s, bottom: s, right: s }
}
function fill(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } }
}

export async function GET() {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'SV Sales Corporation'
  const ws = wb.addWorksheet('Quote Template')

  ws.views = [{ state: 'frozen', ySplit: 1 }]

  // A=Sr No  B=Brand  C=Model  D=Product Name  E=Unit  F=Qty
  ws.columns = [
    { width: 7  },  // A – Sr No
    { width: 12 },  // B – Brand
    { width: 14 },  // C – Model
    { width: 48 },  // D – Product Name
    { width: 8  },  // E – Unit
    { width: 10 },  // F – Qty
  ]

  // ── Header row ──────────────────────────────────────────────────
  const hRow = ws.addRow(['Sr No', 'Brand', 'Model', 'Product Name', 'Unit', 'Qty'])
  hRow.height = 22
  hRow.eachCell((cell, col) => {
    cell.fill = fill('FF1E293B')
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
    cell.border = borderAll('FF334155')
    cell.alignment = { vertical: 'middle', horizontal: col === 4 ? 'left' : 'center' }
  })
  // Qty header — yellow to hint "fill this in"
  const qtyHeader = ws.getCell('F1')
  qtyHeader.fill = fill('FFF59E0B')
  qtyHeader.font = { bold: true, color: { argb: 'FF1C1917' }, size: 10 }
  qtyHeader.border = borderAll('FFB45309')

  // ── Data rows ───────────────────────────────────────────────────
  let n = 1
  const products = catalog.products as unknown as CatalogProduct[]

  for (const p of products) {
    const brand = p.brand ?? ''
    const unit  = p.unit  ?? ''
    const entries: [string, string, string][] = p.variants?.length
      ? p.variants.map((v) => [brand, v.model || p.model || '', `${p.name} — ${v.option}`])
      : [[brand, p.model ?? '', p.name]]

    for (const [b, model, name] of entries) {
      const shade = n % 2 === 0
      const row = ws.addRow([n, b, model, name, unit, null])
      row.height = 16

      row.eachCell({ includeEmpty: true }, (cell, col) => {
        cell.font = { size: 10 }
        cell.alignment = { vertical: 'middle', horizontal: col === 4 ? 'left' : 'center' }

        if (col === 6) {
          // Qty column — light yellow, user fills this in
          cell.fill = fill(shade ? 'FFFFFCE7' : 'FFFFFBEB')
          cell.border = {
            top:    { style: THIN, color: { argb: 'FFFCD34D' } },
            left:   { style: THIN, color: { argb: 'FFFCD34D' } },
            bottom: { style: THIN, color: { argb: 'FFFCD34D' } },
            right:  { style: THIN, color: { argb: 'FFFCD34D' } },
          }
        } else {
          cell.fill = fill(shade ? 'FFF8FAFC' : 'FFFFFFFF')
          cell.border = borderAll()
        }
      })
      n++
    }
  }

  // ── Footer note ─────────────────────────────────────────────────
  ws.addRow([])
  const noteRow = ws.addRow([null, null, null, 'Fill in the Qty column for products you need, then upload this file at svsales.co.in/quote'])
  ws.getCell(`D${noteRow.number}`).font = { italic: true, color: { argb: 'FF94A3B8' }, size: 9 }

  const buf = Buffer.from(await wb.xlsx.writeBuffer())
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="sv-sales-quote-template.xlsx"',
    },
  })
}
