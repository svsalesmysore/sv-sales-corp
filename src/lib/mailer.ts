import nodemailer from 'nodemailer'

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

/* ── HTML helpers ── */
const td = (s: string | number, extra = '') =>
  `<td style="padding:7px 12px;border:1px solid #e2e8f0;${extra}">${s}</td>`
const th = (s: string, extra = '') =>
  `<th style="padding:7px 12px;border:1px solid #cbd5e1;background:#f8fafc;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#475569;text-align:left;${extra}">${s}</th>`
const tdQuote =
  `<td style="padding:7px 16px;border:1px solid #fcd34d;background:#fffbeb;text-align:center;min-width:110px;color:#a16207;">____________</td>`
const thQuote = th('Quote (₹)', 'background:#fef9c3;border-color:#fcd34d;color:#854d0e;')

function buildTable(headers: string[], rows: (string | number)[][]): string {
  const colCount = headers.length + 1 // +1 for Quote column
  const head = `<tr>${headers.map((h) => th(h)).join('')}${thQuote}</tr>`
  const body = rows
    .map(
      (r) =>
        `<tr>${r
          .map((c) => td(c, typeof c === 'number' ? 'text-align:center;' : ''))
          .join('')}${tdQuote}</tr>`,
    )
    .join('')
  const finalRow = `<tr>
    <td colspan="${colCount - 1}" style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;text-align:right;font-weight:700;font-size:13px;color:#1e293b;letter-spacing:.03em;">FINAL QUOTATION</td>
    <td style="padding:10px 16px;border:2px solid #f59e0b;background:#fef3c7;text-align:center;font-weight:700;font-size:14px;color:#92400e;min-width:110px;">₹ __________</td>
  </tr>`
  return `<table style="border-collapse:collapse;width:100%;font-size:13px;font-family:sans-serif;">${head}${body}${finalRow}</table>`
}

export async function sendQuoteEmail(q: QuoteEmailData) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return

  /* ── plain-text fallback ── */
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
    textParts.push('Sr  Product Name                          Size       Qty  Unit  Quote (₹)')
    textParts.push('--  ------------------------------------  ---------  ---  ----  ----------')
    q.items.forEach((i, n) => {
      textParts.push(
        `${String(n + 1).padEnd(2)}  ${i.name.slice(0, 36).padEnd(36)}  ${(i.size ?? '').padEnd(9)}  ${String(i.qty).padEnd(3)}  ${i.unit.padEnd(4)}  ________`,
      )
    })
    textParts.push('', '                                                    FINAL QUOTATION:  ₹ ___________')
  }
  if (q.uploaded.length) {
    textParts.push('', `── Uploaded list (${q.uploaded.length}) ──`)
    textParts.push('Sr  Product Name                                     Qty  Quote (₹)')
    textParts.push('--  -----------------------------------------------  ---  ----------')
    q.uploaded.forEach((u, n) => {
      textParts.push(`${String(n + 1).padEnd(2)}  ${u.name.slice(0, 47).padEnd(47)}  ${String(u.qty).padEnd(3)}  ________`)
    })
    textParts.push('', '                                                         FINAL QUOTATION:  ₹ ___________')
  }
  if (q.attachment) textParts.push('', `Attached file: ${q.attachment}`)
  const text = textParts.join('\n')

  /* ── HTML email ── */
  const infoRows: [string, string][] = [
    ['Name', q.name],
    ...(q.company ? [['Company', q.company] as [string, string]] : []),
    ['Phone', q.phone],
    ...(q.email   ? [['Email', q.email]   as [string, string]] : []),
    ...(q.message ? [['Notes', q.message] as [string, string]] : []),
  ]
  const infoTable = `<table style="border-collapse:collapse;font-size:13px;font-family:sans-serif;">${infoRows
    .map(
      ([k, v]) =>
        `<tr>
          <td style="padding:5px 12px 5px 0;font-weight:600;color:#475569;white-space:nowrap;">${k}</td>
          <td style="padding:5px 0;">${v}</td>
        </tr>`,
    )
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

  const attachNote = q.attachment
    ? `<p style="margin-top:16px;font-size:12px;color:#64748b;">📎 Attached file: <strong>${q.attachment}</strong></p>`
    : ''

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;font-family:sans-serif;background:#f8fafc;">
  <div style="max-width:760px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:28px;">
    <h2 style="margin:0 0 4px;font-size:18px;color:#1e293b;">New Quote Request</h2>
    <p style="margin:0 0 20px;font-size:13px;color:#64748b;">Received from <strong>svsales.co.in</strong></p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin-bottom:20px;">
    ${infoTable}
    ${productSection}
    ${uploadedSection}
    ${attachNote}
  </div>
</body></html>`

  await transporter.sendMail({
    from: `"SV Sales Website" <${process.env.GMAIL_USER}>`,
    to: 'svsalesmysore@gmail.com',
    replyTo: q.email || undefined,
    subject: `New Quote Request — ${q.name}${q.company ? ` (${q.company})` : ''}`,
    text,
    html,
    attachments: q.fileData && q.attachment
      ? [{ filename: q.attachment, content: Buffer.from(q.fileData, 'base64'), contentType: q.fileType || 'application/octet-stream' }]
      : [],
  })
}
