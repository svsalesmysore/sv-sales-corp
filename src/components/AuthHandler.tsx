'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAILS = new Set(['svsalesmysore@gmail.com', 'abhidk123@gmail.com'])

/**
 * Mounted in the root layout. Catches OAuth redirects that land on any page
 * (e.g. home page) when Supabase puts #access_token= in the hash.
 */
export default function AuthHandler() {
  const router = useRouter()

  useEffect(() => {
    if (!window.location.hash.includes('access_token=')) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event !== 'SIGNED_IN' || !session) return
        subscription.unsubscribe()

        // Clear the token from the URL immediately
        window.history.replaceState(null, '', window.location.pathname)

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

    return () => subscription.unsubscribe()
  }, [router])

  return null
}
