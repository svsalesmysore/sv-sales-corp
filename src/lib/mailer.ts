import nodemailer from 'nodemailer'
import * as XLSX from 'xlsx'

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
  items: { name: string; size?: string; qty: number; unit: string }[]
  uploaded: { name: string; qty: number }[]
  attachment?: string | null
  fileData?: string | null
  fileType?: string | null
}

/* ─── Excel generator ──────────────────────────────────────────────────────── */
// Columns: A=Sr No  B=Product Name  C=Size  D=Qty  E=Unit  F=Quote/Unit(₹)  G=Total Quote(₹)

function generateQuoteExcel(q: QuoteEmailData): Buffer {
  const wb = XLSX.utils.book_new()

  const aoa: (string | number)[][] = [
    ['Sr No', 'Product Name', 'Size', 'Qty', 'Unit', 'Quote/Unit (₹)', 'Total Quote (₹)'],
  ]

  // Catalog items
  q.items.forEach((item, i) => {
    aoa.push([i + 1, item.name, item.size ?? '', item.qty, item.unit, '', ''])
  })

  // Uploaded list (separator + rows)
  if (q.uploaded.length) {
    if (q.items.length) {
      aoa.push([])
      aoa.push(['', '— Uploaded Product List —', '', '', '', '', ''])
    }
    q.uploaded.forEach((u, i) => {
      aoa.push([i + 1, u.name, '', u.qty, '', '', ''])
    })
  }

  const lastDataRow = aoa.length   // Excel row index (1-based) of the last data row
  aoa.push([])                     // blank separator
  aoa.push(['FINAL QUOTATION', '', '', '', '', '', ''])

  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const finalRow = aoa.length      // Excel row index of FINAL QUOTATION

  // Per-row Total Quote formula: =D{r}*F{r}
  for (let r = 2; r <= lastDataRow; r++) {
    ws[`G${r}`] = { t: 'n', f: `D${r}*F${r}` }
  }
  // Final sum
  ws[`G${finalRow}`] = { t: 'n', f: `SUM(G2:G${lastDataRow})` }

  ws['!cols'] = [
    { wch: 6 },   // Sr No
    { wch: 46 },  // Product Name
    { wch: 14 },  // Size
    { wch: 6 },   // Qty
    { wch: 7 },   // Unit
    { wch: 16 },  // Quote/Unit (₹)
    { wch: 18 },  // Total Quote (₹)
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Quote Request')
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as ArrayBuffer)
}

/* ─── HTML helpers ─────────────────────────────────────────────────────────── */
const td = (s: string | number, extra = '') =>
  `<td style="padding:7px 12px;border:1px solid #e2e8f0;${extra}">${s}</td>`
const th = (s: string, extra = '') =>
  `<th style="padding:7px 12px;border:1px solid #cbd5e1;background:#f8fafc;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#475569;text-align:left;${extra}">${s}</th>`

const QUOTE_UNIT_STYLE = 'border:1px solid #fcd34d;background:#fffbeb;text-align:center;min-width:110px;color:#a16207;'
const QUOTE_TOTAL_STYLE = 'border:1px solid #d1fae5;background:#f0fdf4;text-align:center;min-width:110px;color:#166534;'

function buildTable(headers: string[], rows: (string | number)[][]): string {
  const colCount = headers.length + 2 // +2 for Quote/Unit and Total Quote
  const head = `<tr>
    ${headers.map((h) => th(h)).join('')}
    ${th('Quote/Unit (₹)', QUOTE_UNIT_STYLE)}
    ${th('Total Quote (₹)', QUOTE_TOTAL_STYLE)}
  </tr>`

  const body = rows
    .map(
      (r) => `<tr>
        ${r.map((c) => td(c, typeof c === 'number' ? 'text-align:center;' : '')).join('')}
        ${td('________', QUOTE_UNIT_STYLE)}
        ${td('________', QUOTE_TOTAL_STYLE)}
      </tr>`,
    )
    .join('')

  const finalRow = `<tr>
    <td colspan="${colCount - 1}" style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;text-align:right;font-weight:700;font-size:13px;color:#1e293b;">FINAL QUOTATION</td>
    <td style="padding:10px 16px;border:2px solid #16a34a;background:#dcfce7;text-align:center;font-weight:700;font-size:14px;color:#15803d;min-width:110px;">₹ __________</td>
  </tr>`

  return `<table style="border-collapse:collapse;width:100%;font-size:13px;font-family:sans-serif;">${head}${body}${finalRow}</table>`
}

/* ─── Email sender ─────────────────────────────────────────────────────────── */
export async function sendQuoteEmail(q: QuoteEmailData) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return

  /* plain-text fallback */
  const textParts: string[] = [
    'New quote request from the website.',
    '',
    '── Customer ──',
    `Name:    ${q.name}`,
    ...(q.company ? [`Company: ${q.company}`] : []),
    `Phone:   ${q.phone}`,
    ...(q.email   ? [`Email:   ${q.email}`]   : []),
    ...(q.message ? [`Notes:   ${q.message}`] : []),
  ]
  if (q.items.length) {
    textParts.push('', `── Products (${q.items.length}) ──`)
    textParts.push('Sr  Product Name                          Size       Qty  Unit  Quote/Unit  Total Quote')
    textParts.push('--  ------------------------------------  ---------  ---  ----  ----------  -----------')
    q.items.forEach((i, n) =>
      textParts.push(
        `${String(n + 1).padEnd(2)}  ${i.name.slice(0, 36).padEnd(36)}  ${(i.size ?? '').padEnd(9)}  ${String(i.qty).padEnd(3)}  ${i.unit.padEnd(4)}  __________  ___________`,
      ),
    )
    textParts.push('', '                                                              FINAL QUOTATION: ₹ ___________')
  }
  if (q.uploaded.length) {
    textParts.push('', `── Uploaded list (${q.uploaded.length}) ──`)
    textParts.push('Sr  Product Name                                     Qty  Quote/Unit  Total Quote')
    textParts.push('--  -----------------------------------------------  ---  ----------  -----------')
    q.uploaded.forEach((u, n) =>
      textParts.push(
        `${String(n + 1).padEnd(2)}  ${u.name.slice(0, 47).padEnd(47)}  ${String(u.qty).padEnd(3)}  __________  ___________`,
      ),
    )
    textParts.push('', '                                                         FINAL QUOTATION: ₹ ___________')
  }
  if (q.attachment) textParts.push('', `Attached file: ${q.attachment}`)
  textParts.push('', '📊 Open the attached Excel to fill in Quote/Unit — Total Quote and Final Quotation calculate automatically.')
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
      <td style="padding:5px 0;">${v}</td>
    </tr>`)
    .join('')}</table>`

  let productSection = ''
  if (q.items.length) {
    const rows = q.items.map((i, n) => [n + 1, i.name, i.size ?? '—', i.qty, i.unit])
    productSection = `
      <h3 style="margin:24px 0 8px;font-size:14px;color:#1e293b;">Products selected from website (${q.items.length})</h3>
      ${buildTable(['Sr No', 'Product Name', 'Size', 'Qty', 'Unit'], rows)}`
  }

  let uploadedSection = ''
  if (q.uploaded.length) {
    const rows = q.uploaded.map((u, n) => [n + 1, u.name, u.qty])
    uploadedSection = `
      <h3 style="margin:24px 0 8px;font-size:14px;color:#1e293b;">Uploaded product list (${q.uploaded.length})</h3>
      ${buildTable(['Sr No', 'Product Name', 'Qty'], rows)}`
  }

  const excelNote = `<div style="margin-top:20px;padding:12px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;font-size:12px;color:#166534;">
    📊 <strong>Attached Excel</strong> — fill in the <em>Quote/Unit (₹)</em> column. <em>Total Quote</em> and <em>Final Quotation</em> calculate automatically.
  </div>`

  const attachNote = q.attachment
    ? `<p style="margin-top:12px;font-size:12px;color:#64748b;">📎 Customer file: <strong>${q.attachment}</strong></p>`
    : ''

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;font-family:sans-serif;background:#f8fafc;">
  <div style="max-width:800px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:28px;">
    <h2 style="margin:0 0 4px;font-size:18px;color:#1e293b;">New Quote Request</h2>
    <p style="margin:0 0 20px;font-size:13px;color:#64748b;">Received from <strong>svsales.co.in</strong></p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin-bottom:20px;">
    ${infoTable}
    ${productSection}
    ${uploadedSection}
    ${excelNote}
    ${attachNote}
  </div>
</body></html>`

  /* attachments: Excel quote sheet + optional customer file */
  const excelBuf = generateQuoteExcel(q)
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
