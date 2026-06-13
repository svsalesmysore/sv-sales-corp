import { NextRequest, NextResponse } from 'next/server'
import { addQuote, listQuotes, updateQuoteStatus, type QuoteLine } from '@/lib/store'
import { isAdmin, unauthorized } from '@/lib/admin-auth'
import { sendQuoteEmail } from '@/lib/mailer'

/** Public: store a quote and email it to the owner. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.name || !body?.phone) {
    return NextResponse.json({ ok: false, error: 'name and phone required' }, { status: 400 })
  }
  const items: QuoteLine[] = Array.isArray(body.items) ? body.items.slice(0, 200) : []
  const uploaded = Array.isArray(body.uploaded) ? body.uploaded.slice(0, 200) : []
  const rec = await addQuote({
    name: String(body.name).slice(0, 120),
    company: body.company ? String(body.company).slice(0, 120) : undefined,
    phone: String(body.phone).slice(0, 40),
    email: body.email ? String(body.email).slice(0, 120) : undefined,
    message: body.message ? String(body.message).slice(0, 1000) : undefined,
    items,
    uploaded,
    attachment: body.attachment ? String(body.attachment).slice(0, 200) : null,
  })
  // Fire-and-forget — quote is already saved; email failure doesn't block the response
  sendQuoteEmail({
    name: rec.name, company: rec.company, phone: rec.phone,
    email: rec.email, message: rec.message,
    items, uploaded, attachment: rec.attachment,
  }).catch(() => {})
  return NextResponse.json({ ok: true, id: rec.id })
}

/** Admin: list stored quotes. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized()
  return NextResponse.json({ ok: true, quotes: await listQuotes() })
}

/** Admin: dismiss / restore a quote. Body: { id, status: 'dismissed' | 'new' } */
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized()
  const body = await req.json().catch(() => null)
  if (!body?.id || !['dismissed', 'new'].includes(body?.status)) {
    return NextResponse.json({ ok: false, error: 'id and status required' }, { status: 400 })
  }
  const q = await updateQuoteStatus(String(body.id), body.status)
  if (!q) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
