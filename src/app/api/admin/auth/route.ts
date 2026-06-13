import { NextRequest, NextResponse } from 'next/server'
import { checkPassword, adminToken } from '@/lib/store'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAILS = new Set(['svsalesmysore@gmail.com', 'abhidk123@gmail.com'])

function setAdminCookie(res: NextResponse) {
  res.cookies.set('sv_admin', adminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))

  // OAuth path: callback page passes the Supabase access token; verify it server-side
  if (body?.accessToken) {
    const { data: { user }, error } = await supabase.auth.getUser(body.accessToken)
    if (error || !user || !ADMIN_EMAILS.has(user.email ?? '')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const res = NextResponse.json({ ok: true })
    setAdminCookie(res)
    return res
  }

  // Password fallback (kept for emergency access)
  const { password } = body
  if (!checkPassword(String(password ?? ''))) {
    return NextResponse.json({ ok: false, error: 'Wrong password' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  setAdminCookie(res)
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('sv_admin', '', { path: '/', maxAge: 0 })
  return res
}
