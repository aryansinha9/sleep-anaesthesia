# Admin setup: connecting Supabase

Until Supabase is connected, the public site runs from the seed content in `src/content/seed/`, and `/admin` shows a "not connected" notice. Connecting it takes the steps below and needs no code changes.

## 1. Create the project

1. Create a project at [supabase.com](https://supabase.com). A Sydney region is recommended (patient enquiry data stays in Australia).
2. **Pro plan recommended.** It adds session inactivity timeouts at the auth level, daily backups and `pg_cron` for emptying the bin. MFA (TOTP) is available on all plans.

## 2. Run the migrations

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

This creates every table, index, Row Level Security policy, trigger (audit log and version history) and both storage buckets (`public-media` and `private-uploads`). The SQL is in `supabase/migrations/`.

If `pg_cron` is not enabled, the migration prints a notice. Then either enable `pg_cron` (Database → Extensions) and run:

```sql
select cron.schedule('purge-expired-cms', '17 3 * * *', 'select public.purge_expired()');
```

or schedule `select public.purge_expired();` daily some other way. It empties bin items older than 30 days.

## 3. Configure Auth (dashboard → Authentication)

| Setting | Value |
|---|---|
| **Sign In / Providers → Allow new users to sign up** | **Off** (accounts are created by invitation only) |
| Email provider | On; **Confirm email** on |
| **Multi-Factor → TOTP (App Authenticator)** | **Enabled** |
| Password policy | Minimum 12, letters and digits |
| Secure password change | On |
| Sessions → Inactivity timeout | 30 minutes (Pro plan). The site also signs staff out after `ADMIN_IDLE_TIMEOUT_MINUTES`. |
| URL Configuration → Site URL | `https://sleepanaesthesia.com.au` |
| URL Configuration → Redirect URLs | `https://sleepanaesthesia.com.au/admin/auth/confirm` |
| SMTP | Set up a custom SMTP sender (e.g. Resend). The built-in sender is heavily rate-limited. |

**Email templates.** Replace the **Invite user** and **Reset password** templates with the ones in `supabase/templates/invite.html` and `supabase/templates/recovery.html`. They link to `/admin/auth/confirm?token_hash=…`, which the site verifies on the server.

The same settings are in `supabase/config.toml` for local development (`supabase start`).

## 4. Environment variables

Copy `.env.example` to `.env.local` (and add the same values in your host, e.g. Vercel → Settings → Environment Variables):

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project Settings → API.
- `SUPABASE_SERVICE_ROLE_KEY`: Project Settings → API. **Server only.** Never prefix it with `NEXT_PUBLIC_` and never paste it into the browser.
- Optional: `RESEND_API_KEY` and `ENQUIRY_TO_EMAIL`, to also receive enquiries by email.

## 5. Load the current content

```bash
npm run seed
```

This publishes the approved content (settings, home page, 6 treatments, 7 service areas plus 52 towns (all **inactive**), 64 FAQs, page SEO and the two existing photos), so the site looks identical immediately. It is safe to re-run: collections that already have content are skipped.

## 6. Create the first admin

```bash
npm run create-admin -- you@example.com
```

This prints a one-time temporary password. Then:

1. Go to `/admin/login` and sign in.
2. You'll be asked to **set up two-factor authentication**: scan the QR code with an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password, Authy…) and enter the 6-digit code.
3. Choose **Change password** in the sidebar and set your own password.

Everyone else is invited from **Users** in the dashboard. They receive an email, set a password, and must set up 2FA before they can see anything. There is no way to use the dashboard without 2FA; the database itself rejects writes from sessions that haven't completed it.

Use `--invite` to email the first admin an invitation instead of printing a password (requires SMTP).

## 7. Verify security

With the site running (`npm run build && npm start`):

```bash
npm run verify:security
```

This runs the acceptance checks directly against the Supabase API:

- anonymous access to every table and bucket
- sign-up is disabled
- the public view leaks no drafts
- a password-only session cannot write
- an editor with completed 2FA cannot touch settings, users, audit log or enquiries, or permanently delete anything
- the audit log records changes
- `/admin` redirects, `noindex`, `robots.txt`, the sitemap and 301s

It creates and removes a temporary editor account.

## Roles

| | Admin | Editor |
|---|---|---|
| Edit and publish content, photos and videos | ✓ | ✓ |
| Move items to the bin and restore them | ✓ | ✓ |
| Delete permanently | ✓ | ✗ |
| Site settings (hours, phone, address, chat, minimum bookings, compliance switches) | ✓ | ✗ |
| Users, activity log, enquiries | ✓ | ✗ |

## Chat widget

Choose **Tawk.to** or **Crisp** in Site settings and paste the widget ID. Nothing loads until a valid ID is saved. Configure routing inside the provider:

- **Crisp:** WhatsApp, SMS, Messenger and email channels are native, but WhatsApp needs the paid Essentials plan or higher (Meta also charges per conversation).
- **Tawk.to:** free; email notifications for missed chats and offline messages are built in. WhatsApp or SMS alerts need an automation tool (Make, Zapier or Integrately).

In the provider, add this line to the greeting: *"Please don't share detailed medical information in chat. We'll discuss your health privately."* The privacy policy (`/privacy`) already describes the chat tool.

## Local development

```bash
npm install
npm run dev            # seed content, no database
supabase start         # optional: local Supabase (Docker), then put its URL/keys in .env.local
supabase db reset      # applies migrations to the local database
npm run seed && npm run create-admin -- you@example.com
```
