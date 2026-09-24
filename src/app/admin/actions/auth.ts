'use server'

import { createHash } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { guard, UserError, type ActionResult } from '@/lib/admin/result'
import { getSessionState } from '@/lib/auth'
import { SITE_URL } from '@/lib/env'
import { createSupabaseServiceClient, serviceRoleConfigured } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Sign-in, TOTP two-factor, password set/reset. There is no sign-up action:
// accounts are created only by invitation (see users.ts).

const WINDOW_MS = 15 * 60 * 1000
const MAX_PER_EMAIL = 5
const MAX_PER_IP = 20

async function ipHash() {
  const h = await headers()
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown'
  return createHash('sha256').update(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY || '')).digest('hex').slice(0, 32)
}

async function checkRateLimit(bucket: string, ip: string) {
  if (!serviceRoleConfigured()) throw new UserError('Sign-in is not configured on this server yet (missing SUPABASE_SERVICE_ROLE_KEY).')
  const db = createSupabaseServiceClient()
  const since = new Date(Date.now() - WINDOW_MS).toISOString()
  const [{ count: byEmail }, { count: byIp }] = await Promise.all([
    db.from('login_attempts').select('id', { count: 'exact', head: true }).eq('email', bucket).eq('success', false).gte('at', since),
    db.from('login_attempts').select('id', { count: 'exact', head: true }).eq('ip_hash', ip).eq('success', false).gte('at', since),
  ])
  if ((byEmail || 0) >= MAX_PER_EMAIL || (byIp || 0) >= MAX_PER_IP) throw new UserError('Too many unsuccessful attempts. Please wait 15 minutes and try again.')
}

async function recordAttempt(bucket: string, ip: string, success: boolean) {
  await createSupabaseServiceClient().from('login_attempts').insert({ email: bucket, ip_hash: ip, success })
}

const credentials = z.object({ email: z.email('Enter your email address.').max(160), password: z.string().min(1, 'Enter your password.').max(200) })

export async function signIn(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const result = await guard<undefined>(async () => {
    const parsed = credentials.safeParse({ email: String(form.get('email') || '').trim().toLowerCase(), password: String(form.get('password') || '') })
    if (!parsed.success) throw new UserError(parsed.error.issues[0].message)
    const ip = await ipHash()
    await checkRateLimit(parsed.data.email, ip)
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.signInWithPassword(parsed.data)
    await recordAttempt(parsed.data.email, ip, !error)
    if (error) throw new UserError('Email or password is incorrect.')
    const state = await getSessionState()
    if (state.status === 'not-staff') {
      await supabase.auth.signOut()
      throw new UserError('This account does not have dashboard access.')
    }
    return { ok: true }
  })
  if (result.ok) redirect('/admin/mfa')
  return result
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  ;(await cookies()).delete('sa_last_active')
  redirect('/admin/login?reason=signed-out')
}

/** Starts TOTP enrolment: returns the QR code and secret for the authenticator app. */
export async function startMfaEnrollment(): Promise<ActionResult<{ factorId: string; qr: string; secret: string }>> {
  return guard(async () => {
    const state = await getSessionState()
    if (state.status !== 'needs-mfa' || state.hasFactor) throw new UserError('Two-factor authentication is already set up for this account.')
    const supabase = await createSupabaseServerClient()
    // Clear abandoned, unverified set-ups first.
    const { data: factors } = await supabase.auth.mfa.listFactors()
    for (const f of factors?.all || []) if (f.status === 'unverified') await supabase.auth.mfa.unenroll({ factorId: f.id })
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Sleep Anaesthesia admin ${new Date().toISOString().slice(0, 10)}` })
    if (error || !data) throw new UserError('Could not start two-factor set-up. Please try again.')
    return { ok: true, data: { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret } }
  })
}

export async function verifyMfa(factorId: string, code: string): Promise<ActionResult> {
  const result = await guard<undefined>(async () => {
    const state = await getSessionState()
    if (state.status === 'staff') return { ok: true }
    if (state.status !== 'needs-mfa') throw new UserError('Your session has expired. Please sign in again.')
    if (!/^\d{6}$/.test(code.trim())) throw new UserError('Enter the 6-digit code from your authenticator app.')
    const ip = await ipHash()
    const bucket = `mfa:${state.email}`
    await checkRateLimit(bucket, ip)
    const supabase = await createSupabaseServerClient()
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const factor = (factors?.all || []).find((f) => f.id === factorId && f.factor_type === 'totp')
    if (!factor) throw new UserError('Two-factor set-up not found. Please start again.')
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() })
    await recordAttempt(bucket, ip, !error)
    if (error) throw new UserError('That code is not correct or has expired. Try the latest code.')
    return { ok: true }
  })
  if (result.ok) redirect('/admin')
  return result
}

export async function requestPasswordReset(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  return guard(async () => {
    const email = String(form.get('email') || '').trim().toLowerCase()
    if (!z.email().safeParse(email).success) throw new UserError('Enter your email address.')
    const ip = await ipHash()
    await checkRateLimit(`reset:${email}`, ip)
    await recordAttempt(`reset:${email}`, ip, false) // counts toward the limit
    const supabase = await createSupabaseServerClient()
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${SITE_URL}/admin/auth/confirm?next=/admin/set-password` })
    // Same response whether or not the account exists.
    return { ok: true, message: 'If that email belongs to a dashboard account, a reset link is on its way.' }
  })
}

const passwordSchema = z
  .string()
  .min(12, 'Use at least 12 characters.')
  .max(200)
  .refine((p) => /[a-z]/i.test(p) && /\d/.test(p), 'Include at least one letter and one number.')

export async function setPassword(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const result = await guard<undefined>(async () => {
    const password = String(form.get('password') || '')
    const confirm = String(form.get('confirm') || '')
    const parsed = passwordSchema.safeParse(password)
    if (!parsed.success) throw new UserError(parsed.error.issues[0].message)
    if (password !== confirm) throw new UserError('The passwords do not match.')
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) throw new UserError('This link has expired. Ask an admin for a new invitation, or request a password reset.')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new UserError(error.message.includes('different') ? 'Choose a password you have not used before.' : 'Could not set your password. The link may have expired.')
    return { ok: true }
  })
  if (result.ok) redirect('/admin/mfa')
  return result
}
