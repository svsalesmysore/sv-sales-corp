import { NextRequest, NextResponse } from 'next/server'
import { checkPassword, adminToken } from '@/lib/store'

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: '' }))
  if (!checkPassword(String(password ?? ''))) {
    return NextResponse.json({ ok: false, error: 'Wrong password' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('sv_admin', adminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('sv_admin', '', { path: '/', maxAge: 0 })
  return res
}
