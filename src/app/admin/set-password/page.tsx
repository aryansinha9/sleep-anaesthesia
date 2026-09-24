import { redirect } from 'next/navigation'
import { NotConfigured } from '@/components/admin/NotConfigured'
import { supabaseConfigured } from '@/lib/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SetPasswordForm } from './SetPasswordForm'

export default async function SetPasswordPage() {
  if (!supabaseConfigured) return <NotConfigured />
  const { data } = await (await createSupabaseServerClient()).auth.getUser()
  if (!data.user) redirect('/admin/login?error=link-expired')
  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Choose a password</h1>
        <p className="muted" style={{ margin: 0 }}>For {data.user.email}. Use at least 12 characters, including letters and numbers. Next you&apos;ll set up two-factor authentication.</p>
        <SetPasswordForm />
      </div>
    </main>
  )
}
