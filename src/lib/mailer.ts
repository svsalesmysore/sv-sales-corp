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
}

export async function sendQuoteEmail(q: QuoteEmailData) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return

  const productLines = q.items
    .map((i, n) => `${n + 1}. ${i.name}${i.size ? ` — ${i.size}` : ''} × ${i.qty} ${i.unit}`)
    .join('\n')

  const uploadedLines = q.uploaded
    .map((u, n) => `${n + 1}. ${u.name} × ${u.qty}`)
    .join('\n')

  const body = [
    `New quote request received from the website.`,
    ``,
    `── Customer ──`,
    `Name:    ${q.name}`,
    q.company  ? `Company: ${q.company}`  : null,
    `Phone:   ${q.phone}`,
    q.email    ? `Email:   ${q.email}`    : null,
    q.message  ? `Notes:   ${q.message}`  : null,
    q.items.length ? [``, `── Products (${q.items.length}) ──`, productLines] : null,
    q.uploaded.length ? [``, `── Uploaded list (${q.uploaded.length}) ──`, uploadedLines] : null,
    q.attachment ? [``, `📎 Customer attached file: ${q.attachment}`] : null,
  ]
    .flat()
    .filter((l) => l !== null)
    .join('\n')

  await transporter.sendMail({
    from: `"SV Sales Website" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: q.email || undefined,
    subject: `New Quote Request — ${q.name}${q.company ? ` (${q.company})` : ''}`,
    text: body,
  })
}
