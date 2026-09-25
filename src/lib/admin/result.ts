import 'server-only'
import { AuthError } from '@/lib/auth'

export type ActionResult<T = undefined> =
  | ({ ok: true; message?: string } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string; errors?: Record<string, string> }

export class UserError extends Error {
  constructor(message: string, public errors?: Record<string, string>) { super(message) }
}

/** Runs an admin action, turning auth failures and unexpected errors into friendly messages. */
export async function guard<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn()
  } catch (e) {
    if (e instanceof AuthError || e instanceof UserError) return { ok: false, error: e.message, errors: e instanceof UserError ? e.errors : undefined }
    // Next.js uses thrown errors for redirect()/notFound(); let those through.
    if (e && typeof e === 'object' && 'digest' in e && typeof (e as { digest: unknown }).digest === 'string' && String((e as { digest: string }).digest).startsWith('NEXT_')) throw e
    console.error('[admin action]', e)
    return { ok: false, error: 'Something went wrong and your change was not saved. Please try again.' }
  }
}
