'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAILS = new Set(['svsalesmysore@gmail.com', 'abhidk123@gmail.com'])

function CallbackHandler() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const code = params.get('code')
    if (!code) {
      router.replace('/admin?error=nocode')
      return
    }

    supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
      if (error || !data.session) {
        router.replace('/admin?error=auth')
        return
      }
      if (!ADMIN_EMAILS.has(data.session.user.email ?? '')) {
        await supabase.auth.signOut()
        router.replace('/admin?error=unauthorized')
        return
      }
      const r = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: data.session.access_token }),
      })
      router.replace(r.ok ? '/admin' : '/admin?error=cookie')
    })
  }, [params, router])

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
      <p className="text-brand-silver text-sm">Signing you in…</p>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-dark" />}>
      <CallbackHandler />
    </Suspense>
  )
}
