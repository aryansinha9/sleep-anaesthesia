import { redirect } from 'next/navigation'
import { NotConfigured } from '@/components/admin/NotConfigured'
import { getSessionState } from '@/lib/auth'
import { supabaseConfigured } from '@/lib/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { signOut } from '../actions/auth'
import { MfaEnroll, MfaVerify } from './MfaForms'

// Two-factor authentication is mandatory for every dashboard account.
export default async function MfaPage() {
  if (!supabaseConfigured) return <NotConfigured />
  const s = await getSessionState()
  if (s.status === 'anonymous') redirect('/admin/login')
  if (s.status === 'staff') redirect('/admin')
  if (s.status === 'not-staff') {
    await (await createSupabaseServerClient()).auth.signOut()
    redirect('/admin/login?error=not-staff')
  }
  let factorId = ''
  if (s.hasFactor) {
    const { data } = await (await createSupabaseServerClient()).auth.mfa.listFactors()
    factorId = data?.totp.find((f) => f.status === 'verified')?.id || ''
  }
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div>
          <span className="kicker" style={{ marginBottom: 6 }}>Two-factor authentication</span>
          <h1>{s.hasFactor ? 'Enter your code' : 'Set up two-factor authentication'}</h1>
        </div>
        {s.hasFactor ? <MfaVerify factorId={factorId} /> : <MfaEnroll />}
        <form action={signOut}><button className="btn btn-ghost btn-sm" type="submit">Sign out</button></form>
      </div>
    </main>
  )
}
