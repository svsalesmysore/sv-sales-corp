import nodemailer from 'nodemailer'
import ExcelJS from 'exceljs'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

interface QuoteEmailData {
  name: string
  company?: string
  phone: string
  email?: string
  message?: string
  items: { name: string; size?: string; qty: number; unit: string; brand?: string }[]
  uploaded: { name: string; qty: number; brand?: string }[]
  attachment?: string | null
  fileData?: string | null
  fileType?: string | null
}

/* ─── Border / style helpers ───────────────────────────────────────────────── */
const THIN: ExcelJS.BorderStyle = 'thin'
const border = (color = 'FFB0BEC5'): Partial<ExcelJS.Borders> => ({
  top: { style: THIN, color: { argb: color } },
  left: { style: THIN, color: { argb: color } },
  bottom: { style: THIN, color: { argb: color } },
  right: { style: THIN, color: { argb: color } },
})
const fill = (argb: string): ExcelJS.Fill => ({
  type: 'pattern', pattern: 'solid', fgColor: { argb },
})

function styleHeader(cell: ExcelJS.Cell) {
  cell.fill = fill('FF1E293B')
  cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
  cell.border = border('FF334155')
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false }
}
function styleData(cell: ExcelJS.Cell, shade = false) {
  cell.fill = fill(shade ? 'FFF8FAFC' : 'FFFFFFFF')
  cell.border = border()
  cell.font = { size: 10 }
  cell.alignment = { vertical: 'middle' }
}
function styleQuoteInput(cell: ExcelJS.Cell, shade = false) {
  cell.fill = fill(shade ? 'FFFFFCE7' : 'FFFFFBEB')
  cell.border = { top: { style: THIN, color: { argb: 'FFFCD34D' } }, left: { style: THIN, color: { argb: 'FFFCD34D' } }, bottom: { style: THIN, color: { argb: 'FFFCD34D' } }, right: { style: THIN, color: { argb: 'FFFCD34D' } } }
  cell.font = { size: 10 }
  cell.alignment = { vertical: 'middle', horizontal: 'center' }
  cell.numFmt = '₹#,##0.00'
}
function styleTotal(cell: ExcelJS.Cell, shade = false) {
  cell.fill = fill(shade ? 'FFF0FDF4' : 'FFF7FEE7')
  cell.border = { top: { style: THIN, color: { argb: 'FF86EFAC' } }, left: { style: THIN, color: { argb: 'FF86EFAC' } }, bottom: { style: THIN, color: { argb: 'FF86EFAC' } }, right: { style: THIN, color: { argb: 'FF86EFAC' } } }
  cell.font = { size: 10 }
  cell.alignment = { vertical: 'middle', horizontal: 'center' }
  cell.numFmt = '₹#,##0.00'
}

/* ─── Excel generator ──────────────────────────────────────────────────────── */
// Columns: A=Sr No  B=Brand  C=Product Name  D=Size  E=Qty  F=Unit  G=Quote/Unit(₹)  H=Total Quote(₹)

async function generateQuoteExcel(q: QuoteEmailData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'SV Sales Corporation'

  const addSheet = (
    sheetName: string,
    rows: { srno: number; brand: string; name: string; size: string; qty: number; unit: string }[],
    qtyCol: string,   // Excel col letter for Qty
    quoteCol: string, // Excel col letter for Quote/Unit
    totalCol: string, // Excel col letter for Total Quote
    headers: string[],
    widths: number[],
  ) => {
    const ws = wb.addWorksheet(sheetName)
    ws.views = [{ state: 'frozen', ySplit: 1 }]

    // Column widths
    ws.columns = widths.map((w) => ({ width: w }))

    // Header row
    const hRow = ws.addRow(headers)
    hRow.height = 20
    hRow.eachCell((cell) => styleHeader(cell))

    // Data rows
    rows.forEach((r, i) => {
      const excelRow = i + 2
      const shade = i % 2 === 1
      const row = ws.addRow([r.srno, r.brand, r.name, r.size, r.qty, r.unit, null, null])
      row.height = 18
      row.eachCell({ includeEmpty: true }, (cell, colNum) => {
        const colLetter = ws.getColumn(colNum).letter
        if (colLetter === quoteCol) styleQuoteInput(cell, shade)
        else if (colLetter === totalCol) styleTotal(cell, shade)
        else styleData(cell, shade)
        if (colLetter === 'A' || colLetter === qtyCol) cell.alignment = { horizontal: 'center', vertical: 'middle' }
      })
      // Total Quote formula — blank until price is entered
      ws.getCell(`${totalCol}${excelRow}`).value = { formula: `IF(${quoteCol}${excelRow}="","",${qtyCol}${excelRow}*${quoteCol}${excelRow})` }
    })

    // Final Quotation row
    ws.addRow([])
    const finalExcelRow = rows.length + 3
    const finalRow = ws.addRow([])
    finalRow.height = 22

    // Merge label cells (all except last two)
    const labelEnd = String.fromCharCode(quoteCol.charCodeAt(0) - 1)
    ws.mergeCells(`A${finalExcelRow}:${labelEnd}${finalExcelRow}`)
    const labelCell = ws.getCell(`A${finalExcelRow}`)
    labelCell.value = 'FINAL QUOTATION'
    labelCell.fill = fill('FF1E293B')
    labelCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    labelCell.alignment = { horizontal: 'right', vertical: 'middle' }
    labelCell.border = border('FF334155')

    const quoteCell = ws.getCell(`${quoteCol}${finalExcelRow}`)
    quoteCell.fill = fill('FFFEF3C7')
    quoteCell.border = { top: { style: 'medium', color: { argb: 'FFF59E0B' } }, left: { style: 'medium', color: { argb: 'FFF59E0B' } }, bottom: { style: 'medium', color: { argb: 'FFF59E0B' } }, right: { style: 'medium', color: { argb: 'FFF59E0B' } } }
    quoteCell.alignment = { horizontal: 'center', vertical: 'middle' }

    const totalCell = ws.getCell(`${totalCol}${finalExcelRow}`)
    totalCell.value = { formula: `SUM(${totalCol}2:${totalCol}${finalExcelRow - 2})` }
    totalCell.fill = fill('FFDCFCE7')
    totalCell.font = { bold: true, color: { argb: 'FF166534' }, size: 12 }
    totalCell.border = { top: { style: 'medium', color: { argb: 'FF16A34A' } }, left: { style: 'medium', color: { argb: 'FF16A34A' } }, bottom: { style: 'medium', color: { argb: 'FF16A34A' } }, right: { style: 'medium', color: { argb: 'FF16A34A' } } }
    totalCell.alignment = { horizontal: 'center', vertical: 'middle' }
    totalCell.numFmt = '₹#,##0.00'
  }

  if (q.items.length > 0) {
    const rows = q.items.map((item, i) => ({
      srno: i + 1, brand: item.brand ?? '', name: item.name,
      size: item.size ?? '', qty: item.qty, unit: item.unit,
    }))
    addSheet(
      'Products',
      rows, 'E', 'G', 'H',
      ['Sr No', 'Brand', 'Product Name', 'Size', 'Qty', 'Unit', 'Quote/Unit (₹)', 'Total Quote (₹)'],
      [7, 12, 46, 14, 6, 7, 16, 18],
    )
  }

  if (q.uploaded.length > 0) {
    const rows = q.uploaded.map((u, i) => ({
      srno: i + 1, brand: u.brand ?? '', name: u.name, size: '', qty: u.qty, unit: '',
    }))
    addSheet(
      'Uploaded List',
      rows, 'E', 'G', 'H',
      ['Sr No', 'Brand', 'Product Name', 'Size', 'Qty', 'Unit', 'Quote/Unit (₹)', 'Total Quote (₹)'],
      [7, 12, 46, 14, 6, 7, 16, 18],
    )
  }

  return Buffer.from(await wb.xlsx.writeBuffer())
}

/* ─── HTML helpers ─────────────────────────────────────────────────────────── */
const td = (s: string | number, extra = '') =>
  `<td style="padding:7px 12px;border:1px solid #e2e8f0;${extra}">${s}</td>`
const th = (s: string, extra = '') =>
  `<th style="padding:7px 12px;border:1px solid #334155;background:#1e293b;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#fff;text-align:left;${extra}">${s}</th>`

function buildTable(headers: string[], rows: (string | number)[][]): string {
  const head = `<tr>${headers.map((h) => th(h)).join('')}</tr>`
  const body = rows
    .map(
      (r, ri) =>
        `<tr style="background:${ri % 2 === 1 ? '#f8fafc' : '#fff'};">${r
          .map((c) => td(c, typeof c === 'number' ? 'text-align:center;' : ''))
          .join('')}</tr>`,
    )
    .join('')
  return `<table style="border-collapse:collapse;width:100%;font-size:13px;font-family:sans-serif;">${head}${body}</table>`
}

/* ─── Email sender ─────────────────────────────────────────────────────────── */
export async function sendQuoteEmail(q: QuoteEmailData) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return

  /* plain-text fallback */
  const textParts: string[] = [
    'New quote request from the website.',
    '', '── Customer ──',
    `Name:    ${q.name}`,
    ...(q.company ? [`Company: ${q.company}`] : []),
    `Phone:   ${q.phone}`,
    ...(q.email   ? [`Email:   ${q.email}`]   : []),
    ...(q.message ? [`Notes:   ${q.message}`] : []),
  ]
  if (q.items.length) {
    textParts.push('', `── Products (${q.items.length}) ──`)
    textParts.push('Sr  Brand        Product Name                          Size       Qty  Unit')
    textParts.push('--  -----------  ------------------------------------  ---------  ---  ----')
    q.items.forEach((i, n) =>
      textParts.push(`${String(n+1).padEnd(2)}  ${(i.brand??'').padEnd(11)}  ${i.name.slice(0,36).padEnd(36)}  ${(i.size??'').padEnd(9)}  ${String(i.qty).padEnd(3)}  ${i.unit}`),
    )
  }
  if (q.uploaded.length) {
    textParts.push('', `── Uploaded list (${q.uploaded.length}) ──`)
    textParts.push('Sr  Brand        Product Name                          Qty')
    textParts.push('--  -----------  ------------------------------------  ---')
    q.uploaded.forEach((u, n) =>
      textParts.push(`${String(n+1).padEnd(2)}  ${(u.brand??'').padEnd(11)}  ${u.name.slice(0,36).padEnd(36)}  ${u.qty}`),
    )
  }
  if (q.attachment) textParts.push('', `Attached file: ${q.attachment}`)
  textParts.push('', '📊 Open the attached Excel — fill Quote/Unit to auto-calculate Total Quote and Final Quotation.')
  const text = textParts.join('\n')

  /* HTML email */
  const infoRows: [string, string][] = [
    ['Name', q.name],
    ...(q.company ? [['Company', q.company] as [string, string]] : []),
    ['Phone', q.phone],
    ...(q.email   ? [['Email', q.email]   as [string, string]] : []),
    ...(q.message ? [['Notes', q.message] as [string, string]] : []),
  ]
  const infoTable = `<table style="border-collapse:collapse;font-size:13px;font-family:sans-serif;">${infoRows
    .map(([k, v]) => `<tr>
      <td style="padding:5px 12px 5px 0;font-weight:600;color:#475569;white-space:nowrap;">${k}</td>
      <td style="padding:5px 0;">${v}</td></tr>`)
    .join('')}</table>`

  let productSection = ''
  if (q.items.length) {
    const rows = q.items.map((i, n) => [n + 1, i.brand ?? '', i.name, i.size ?? '—', i.qty, i.unit])
    productSection = `
      <h3 style="margin:24px 0 8px;font-size:14px;color:#1e293b;">Products (${q.items.length})</h3>
      ${buildTable(['Sr No', 'Brand', 'Product Name', 'Size', 'Qty', 'Unit'], rows)}`
  }

  let uploadedSection = ''
  if (q.uploaded.length) {
    const rows = q.uploaded.map((u, n) => [n + 1, u.brand ?? '', u.name, u.qty])
    uploadedSection = `
      <h3 style="margin:24px 0 8px;font-size:14px;color:#1e293b;">Uploaded list (${q.uploaded.length})</h3>
      ${buildTable(['Sr No', 'Brand', 'Product Name', 'Qty'], rows)}`
  }

  const excelNote = `<div style="margin-top:20px;padding:12px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;font-size:12px;color:#166534;">
    📊 <strong>Attached Excel</strong> — fill in <em>Quote/Unit (₹)</em> column. <em>Total Quote</em> and <em>Final Quotation</em> calculate automatically.
  </div>`

  const attachNote = q.attachment
    ? `<p style="margin-top:12px;font-size:12px;color:#64748b;">📎 Customer file: <strong>${q.attachment}</strong></p>`
    : ''

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;font-family:sans-serif;background:#f8fafc;">
  <div style="max-width:760px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:28px;">
    <h2 style="margin:0 0 4px;font-size:18px;color:#1e293b;">New Quote Request</h2>
    <p style="margin:0 0 20px;font-size:13px;color:#64748b;">Received from <strong>svsales.co.in</strong></p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin-bottom:20px;">
    ${infoTable}${productSection}${uploadedSection}${excelNote}${attachNote}
  </div>
</body></html>`

  /* attachments */
  const excelBuf = await generateQuoteExcel(q)
  const customerName = q.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const attachments: nodemailer.SendMailOptions['attachments'] = [
    {
      filename: `quote-${customerName}.xlsx`,
      content: excelBuf,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  ]
  if (q.fileData && q.attachment) {
    attachments.push({
      filename: q.attachment,
      content: Buffer.from(q.fileData, 'base64'),
      contentType: q.fileType || 'application/octet-stream',
    })
  }

  await transporter.sendMail({
    from: `"SV Sales Website" <${process.env.GMAIL_USER}>`,
    to: 'svsalesmysore@gmail.com',
    replyTo: q.email || undefined,
    subject: `New Quote Request — ${q.name}${q.company ? ` (${q.company})` : ''}`,
    text,
    html,
    attachments,
  })
}
