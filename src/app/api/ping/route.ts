import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Called by Vercel cron daily to prevent Supabase free-tier pausing (pauses after 1 week inactivity)
export async function GET() {
  const { error } = await supabaseAdmin.from('stock').select('key').limit(1)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
