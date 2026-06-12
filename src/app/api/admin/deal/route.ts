import { NextRequest, NextResponse } from 'next/server'
import { decrementStock, addSale, updateQuoteStatus, type SaleLine } from '@/lib/store'
import { isAdmin, unauthorized } from '@/lib/admin-auth'

/**
 * Convert a quote to a deal (or record a manual/walk-in sale).
 * Body: { lines: SaleLine[], quoteId?: string, customer?: string }
 * Decrements stock per line and appends to the sales log.
 */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized()
  const body = await req.json().catch(() => null)
  const lines = (body?.lines as SaleLine[] | undefined)?.filter(
    (l) => l && typeof l.key === 'string' && Number.isFinite(Number(l.qty)) && Number(l.qty) > 0,
  )
  if (!lines?.length) {
    return NextResponse.json({ ok: false, error: 'lines required' }, { status: 400 })
  }
  const clean = lines.map((l) => ({
    key: l.key,
    label: String(l.label ?? l.key).slice(0, 200),
    qty: Math.trunc(Number(l.qty)),
  }))

  await decrementStock(clean)
  const sale = await addSale({
    source: body.quoteId ? 'quote' : 'manual',
    quoteId: body.quoteId ? String(body.quoteId) : undefined,
    customer: body.customer ? String(body.customer).slice(0, 120) : undefined,
    lines: clean,
  })
  if (body.quoteId) await updateQuoteStatus(String(body.quoteId), 'deal')

  return NextResponse.json({ ok: true, saleId: sale.id })
}
