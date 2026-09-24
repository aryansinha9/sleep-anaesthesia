import Link from 'next/link'
import { NotConfigured } from '@/components/admin/NotConfigured'
import { supabaseConfigured } from '@/lib/env'
import { ForgotForm } from './ForgotForm'

export default function ForgotPage() {
  if (!supabaseConfigured) return <NotConfigured />
  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Reset your password</h1>
        <p className="muted" style={{ margin: 0 }}>Enter your dashboard email and we&apos;ll send a reset link.</p>
        <ForgotForm />
        <p style={{ margin: 0, fontSize: 14 }}><Link href="/admin/login">Back to sign in</Link></p>
      </div>
    </main>
  )
}
