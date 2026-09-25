import 'server-only'
import { serviceRoleConfigured } from '@/lib/supabase/admin'

/** The enquiry form is only rendered when there is somewhere to send it. */
export function enquiriesEnabled(): boolean {
  return serviceRoleConfigured() || Boolean(process.env.RESEND_API_KEY && process.env.ENQUIRY_TO_EMAIL)
}
