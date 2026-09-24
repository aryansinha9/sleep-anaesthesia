'use client'
import { createClient } from '@supabase/supabase-js'

// Session-less browser client. It only uploads files to one-time signed URLs
// issued by the server; auth cookies are HTTP-only and never read in the browser.
export function createSupabaseUploadClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
