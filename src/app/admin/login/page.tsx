import Link from 'next/link'
import { redirect } from 'next/navigation'
import { NotConfigured } from '@/components/admin/NotConfigured'
import { getSessionState } from '@/lib/auth'
import { supabaseConfigured } from '@/lib/env'
import { LoginForm } from './LoginForm'

const REASONS: Record<string, { kind: 'ok' | 'error'; text: string }> = {
  idle: { kind: 'error', text: 'You were signed out after a period of inactivity.' },
  'signed-out': { kind: 'ok', text: 'You have been signed out.' },
  'not-staff': { kind: 'error', text: 'This account does not have dashboard access.' },
  'link-expired': { kind: 'error', text: 'That link is invalid or has expired. Ask an admin to send a new invitation, or reset your password.' },
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reason?: string; error?: string }> }) {
  if (!supabaseConfigured) return <NotConfigured />
  const s = await getSessionState()
  if (s.status === 'staff') redirect('/admin')
  if (s.status === 'needs-mfa') redirect('/admin/mfa')
  const sp = await searchParams
  const notice = REASONS[sp.reason || sp.error || '']
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div>
          <span className="kicker" style={{ marginBottom: 6 }}>Sleep Anaesthesia</span>
          <h1>Sign in to the dashboard</h1>
        </div>
        {notice && <p className={`notice ${notice.kind}`}>{notice.text}</p>}
        <LoginForm />
        <p style={{ margin: 0, fontSize: 14 }}><Link href="/admin/forgot">Forgot your password?</Link></p>
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>Accounts are created by invitation only. Ask an admin if you need access.</p>
      </div>
    </main>
  )
}
