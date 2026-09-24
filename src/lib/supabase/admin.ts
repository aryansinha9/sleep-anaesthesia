import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL } from '@/lib/env'

// Service-role client. Bypasses RLS, so it is only used for the few jobs that
// need it (invitations, upload processing, enquiries, login rate limiting),
// always AFTER the caller's role has been checked. Never import this from a
// client component; 'server-only' makes that a build error.
export function createSupabaseServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.')
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export const serviceRoleConfigured = () => Boolean(SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
