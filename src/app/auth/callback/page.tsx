'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAILS = new Set(['svsalesmysore@gmail.com', 'abhidk123@gmail.com'])

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Supabase automatically detects the code/hash in the URL and fires SIGNED_IN
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event !== 'SIGNED_IN' || !session) return
        subscription.unsubscribe()

        if (!ADMIN_EMAILS.has(session.user.email ?? '')) {
          await supabase.auth.signOut()
          router.replace('/admin?error=unauthorized')
          return
        }

        const r = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: session.access_token }),
        })
        router.replace(r.ok ? '/admin' : '/admin?error=cookie')
      },
    )

    // Fallback: if SIGNED_IN never fires, redirect with error
    const timeout = setTimeout(() => {
      subscription.unsubscribe()
      router.replace('/admin?error=timeout')
    }, 15000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
      <p className="text-brand-silver text-sm">Signing you in…</p>
    </div>
  )
}
