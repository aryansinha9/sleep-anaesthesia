import 'server-only'
import { createHash, createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { createSupabaseServiceClient, serviceRoleConfigured } from '@/lib/supabase/admin'

// Clinic portal: per-clinic access codes unlock the GA clinic requirements.
// Codes are stored hashed. A correct code sets a signed, HTTP-only cookie;
// every portal visit re-checks that the code is still active, so switching a
// code off in the dashboard locks that clinic out immediately.

export const PORTAL_COOKIE = 'sa_portal'
const MAX_AGE_S = 30 * 24 * 3600
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I

export const portalAvailable = () => serviceRoleConfigured()

export function normaliseCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function hashCode(code: string): string {
  return createHash('sha256').update('sa-portal:' + normaliseCode(code)).digest('hex')
}

/** A new code like "K7QM2-XR9TP" (10 characters, ~50 bits). */
export function generateCode(): string {
  const chars = Array.from({ length: 10 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
  return `${chars.slice(0, 5)}-${chars.slice(5)}`
}

function key(): Buffer {
  return createHash('sha256').update('sa-portal-cookie:' + (process.env.SUPABASE_SERVICE_ROLE_KEY || '')).digest()
}

function sign(payload: string): string {
  return createHmac('sha256', key()).update(payload).digest('base64url')
}

export function makeToken(codeId: string): { value: string; maxAge: number } {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S
  const payload = `${codeId}.${exp}`
  return { value: `${payload}.${sign(payload)}`, maxAge: MAX_AGE_S }
}

function readToken(value: string | undefined): string | null {
  if (!value) return null
  const [id, exp, sig] = value.split('.')
  if (!id || !exp || !sig || !/^[0-9a-f-]{36}$/i.test(id)) return null
  const expected = Buffer.from(sign(`${id}.${exp}`))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  if (Number(exp) < Date.now() / 1000) return null
  return id
}

/** The clinic this visitor has unlocked the portal for, or null. */
export async function getPortalAccess(): Promise<{ clinicName: string } | null> {
  if (!portalAvailable()) return null
  const id = readToken((await cookies()).get(PORTAL_COOKIE)?.value)
  if (!id) return null
  const { data } = await createSupabaseServiceClient().from('portal_access_codes').select('clinic_name, active').eq('id', id).maybeSingle()
  return data?.active ? { clinicName: data.clinic_name as string } : null
}
