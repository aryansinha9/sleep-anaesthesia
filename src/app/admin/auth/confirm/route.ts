import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Landing point for invitation and password-reset emails (token_hash flow).
export async function GET(req: NextRequest) {
  const tokenHash = req.nextUrl.searchParams.get('token_hash')
  const type = req.nextUrl.searchParams.get('type') as EmailOtpType | null
  const next = req.nextUrl.searchParams.get('next') === '/admin/set-password' ? '/admin/set-password' : '/admin'
  if (tokenHash && (type === 'invite' || type === 'recovery')) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return NextResponse.redirect(new URL(next, req.url))
  }
  return NextResponse.redirect(new URL('/admin/login?error=link-expired', req.url))
}
