import { NextRequest, NextResponse } from 'next/server'
import { listSales } from '@/lib/store'
import { isAdmin, unauthorized } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized()
  return NextResponse.json({ ok: true, sales: await listSales() })
}
