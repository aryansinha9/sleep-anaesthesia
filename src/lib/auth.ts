import 'server-only'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { supabaseConfigured } from '@/lib/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type StaffRole = 'admin' | 'editor'

export type SessionState =
  | { status: 'anonymous' }
  | { status: 'not-staff'; email: string }
  | { status: 'needs-mfa'; email: string; role: StaffRole; hasFactor: boolean }
  | { status: 'staff'; userId: string; email: string; role: StaffRole }

/**
 * Resolves the current admin session on the server. getUser() validates the
 * JWT with Supabase Auth (never trust the cookie alone), and the MFA level
 * must be aal2 before any admin access is granted.
 */
export const getSessionState = cache(async (): Promise<SessionState> => {
  if (!supabaseConfigured) return { status: 'anonymous' }
  const supabase = await createSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) return { status: 'anonymous' }
  const email = user.email || ''

  const { data: row } = await supabase.from('admin_users').select('role, disabled_at').eq('user_id', user.id).maybeSingle()
  if (!row || row.disabled_at) return { status: 'not-staff', email }
  const role = row.role as StaffRole

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal?.currentLevel !== 'aal2') {
    return { status: 'needs-mfa', email, role, hasFactor: aal?.nextLevel === 'aal2' }
  }
  return { status: 'staff', userId: user.id, email, role }
})

export type Staff = Extract<SessionState, { status: 'staff' }>

/** For admin pages: redirects anyone who is not fully signed-in staff. */
export async function requireStaffPage(minRole: StaffRole = 'editor'): Promise<Staff> {
  const s = await getSessionState()
  if (s.status === 'anonymous') redirect('/admin/login')
  if (s.status === 'not-staff') redirect('/admin/login?error=not-staff')
  if (s.status === 'needs-mfa') redirect('/admin/mfa')
  if (minRole === 'admin' && s.role !== 'admin') redirect('/admin?error=admin-only')
  return s
}

export class AuthError extends Error {}

/** For server actions and route handlers: throws unless fully signed-in staff. */
export async function requireStaff(minRole: StaffRole = 'editor'): Promise<Staff> {
  const s = await getSessionState()
  if (s.status !== 'staff') throw new AuthError('Your session has expired. Please sign in again.')
  if (minRole === 'admin' && s.role !== 'admin') throw new AuthError('Only admins can do this.')
  return s
}
