import { NextRequest, NextResponse } from 'next/server'
import { adminToken } from '@/lib/store'

export function isAdmin(req: NextRequest): boolean {
  return req.cookies.get('sv_admin')?.value === adminToken()
}

export function unauthorized() {
  return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
}
