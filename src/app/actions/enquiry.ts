'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { z } from 'zod'
import { toPlainText } from '@/lib/sanitize'
import { createSupabaseServiceClient, serviceRoleConfigured } from '@/lib/supabase/admin'

export type EnquiryState = { status: 'idle' | 'ok' | 'error'; message?: string; errors?: Record<string, string> }

const clean = (max: number) => z.string().default('').transform((v) => toPlainText(v).trim()).pipe(z.string().max(max))

const schema = z
  .object({
    audience: z.enum(['clinic', 'patient'], { message: 'Tell us whether you are a dental clinic or a patient.' }),
    name: clean(80).refine((v) => v.length > 0, 'Please enter your name.'),
    clinic: clean(120),
    email: clean(160).refine((v) => !v || z.email().safeParse(v).success, 'Please enter a valid email address.'),
    phone: clean(20).refine((v) => !v || /^[0-9 +()-]{6,20}$/.test(v), 'Please enter a valid phone number.'),
    message: clean(1500),
    page: clean(80),
  })
  .superRefine((v, ctx) => {
    if (!v.email && !v.phone) ctx.addIssue({ code: 'custom', path: ['email'], message: 'Please give us an email address or a phone number.' })
    if (v.audience === 'clinic' && !v.clinic) ctx.addIssue({ code: 'custom', path: ['clinic'], message: 'Please enter your clinic name.' })
  })

async function sendEmail(e: z.infer<typeof schema>) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.ENQUIRY_TO_EMAIL
  if (!key || !to) return false
  const lines = [
    `Type: ${e.audience === 'clinic' ? 'Dental clinic' : 'Patient'}`,
    `Name: ${e.name}`,
    e.clinic && `Clinic: ${e.clinic}`,
    e.email && `Email: ${e.email}`,
    e.phone && `Phone: ${e.phone}`,
    `Page: ${e.page}`,
    '',
    e.message || '(no message)',
  ].filter((l): l is string => typeof l === 'string')
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.ENQUIRY_FROM_EMAIL || 'Sleep Anaesthesia <onboarding@resend.dev>',
      to: [to],
      reply_to: e.email || undefined,
      subject: `New ${e.audience === 'clinic' ? 'clinic' : 'patient'} enquiry: ${e.name}`,
      text: lines.join('\n'),
    }),
  })
  return res.ok
}

export async function submitEnquiry(_prev: EnquiryState, form: FormData): Promise<EnquiryState> {
  // Bot checks: hidden honeypot field, and a minimum time on the form.
  if (String(form.get('website') || '')) return { status: 'ok' }
  const started = Number(form.get('started') || 0)
  if (started && Date.now() - started < 2500) return { status: 'ok' }

  const parsed = schema.safeParse(Object.fromEntries(form.entries()))
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message
    return { status: 'error', message: 'Please check the highlighted fields.', errors }
  }
  const data = parsed.data

  const h = await headers()
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
  const ipHash = createHash('sha256').update(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY || 'salt')).digest('hex').slice(0, 32)

  let stored = false
  if (serviceRoleConfigured()) {
    const db = createSupabaseServiceClient()
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { count } = await db.from('enquiries').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since)
    if ((count || 0) >= 5) return { status: 'error', message: 'Too many enquiries from this connection. Please call or email us instead.' }
    const { error } = await db.from('enquiries').insert({ audience: data.audience, name: data.name, clinic: data.clinic, email: data.email, phone: data.phone, message: data.message, page: data.page, ip_hash: ipHash })
    stored = !error
  }
  const emailed = await sendEmail(data).catch(() => false)
  if (!stored && !emailed) return { status: 'error', message: 'Sorry, your enquiry could not be sent. Please call or email us instead.' }
  return { status: 'ok', message: 'Thank you. A member of our team will be in touch shortly.' }
}
