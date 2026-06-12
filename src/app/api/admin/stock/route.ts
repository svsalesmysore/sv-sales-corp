import { NextRequest, NextResponse } from 'next/server'
import { getStock, setStock } from '@/lib/store'
import { isAdmin, unauthorized } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized()
  return NextResponse.json({ ok: true, stock: await getStock() })
}

/** Bulk update: { updates: { [key]: qty } } */
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized()
  const body = await req.json().catch(() => null)
  const updates = body?.updates as Record<string, number> | undefined
  if (!updates || typeof updates !== 'object') {
    return NextResponse.json({ ok: false, error: 'updates object required' }, { status: 400 })
  }
  const clean: Record<string, number> = {}
  for (const [k, v] of Object.entries(updates)) {
    const n = Number(v)
    if (Number.isFinite(n)) clean[k] = Math.trunc(n)
  }
  await setStock(clean)
  return NextResponse.json({ ok: true, updated: Object.keys(clean).length })
}
