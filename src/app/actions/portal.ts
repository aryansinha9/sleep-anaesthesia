'use server'

import { createHash } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase/admin'
import { hashCode, makeToken, normaliseCode, PORTAL_COOKIE, portalAvailable } from '@/lib/portal'

export type PortalState = { error?: string } | null

const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILS = 10

export async function unlockPortal(_prev: PortalState, form: FormData): Promise<PortalState> {
  if (!portalAvailable()) return { error: 'The portal is not available right now. Please contact our team.' }
  const code = normaliseCode(String(form.get('code') || ''))
  if (code.length < 6 || code.length > 40) return { error: 'Enter the access code we sent you.' }

  const h = await headers()
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
  const ipHash = createHash('sha256').update(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY || '')).digest('hex').slice(0, 32)
  const db = createSupabaseServiceClient()
  const since = new Date(Date.now() - WINDOW_MS).toISOString()
  const { count } = await db.from('login_attempts').select('id', { count: 'exact', head: true }).eq('email', 'portal').eq('ip_hash', ipHash).eq('success', false).gte('at', since)
  if ((count || 0) >= MAX_FAILS) return { error: 'Too many attempts. Please wait 15 minutes and try again.' }

  const { data } = await db.from('portal_access_codes').select('id, active').eq('code_hash', hashCode(code)).maybeSingle()
  const ok = Boolean(data?.active)
  await db.from('login_attempts').insert({ email: 'portal', ip_hash: ipHash, success: ok })
  if (!ok || !data) return { error: 'That access code is not valid. Contact our team if you need a new one.' }

  await db.from('portal_access_codes').update({ last_used_at: new Date().toISOString() }).eq('id', data.id)
  const token = makeToken(data.id as string)
  ;(await cookies()).set(PORTAL_COOKIE, token.value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: token.maxAge })
  redirect('/portal')
}

export async function lockPortal() {
  ;(await cookies()).delete(PORTAL_COOKIE)
  redirect('/portal')
}
