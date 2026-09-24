# Sleep Anaesthesia website

Next.js (App Router, TypeScript) site with a Supabase-backed admin dashboard at `/admin`.

```bash
npm install
npm run dev          # http://localhost:3000, renders from seed content
npm run build        # production build
npm run check:content  # validates seed content against the dashboard's rules
```

- **Content layer:** `src/content/`. Types, the field registry (`collections.ts`, which drives dashboard forms and validation), media slots and seed data.
- **Data access:** `src/lib/data.ts`. Pages only call these getters. They read seed data, or Supabase once it's connected, and serve drafts in preview.
- **Public pages:** `src/app/(site)/`. **Dashboard:** `src/app/admin/`. **Redirects and session handling:** `src/proxy.ts`.
- **Database:** `supabase/migrations/` (tables, RLS, triggers, storage).

Connecting Supabase, creating the first admin and enabling 2FA: see [ADMIN_SETUP.md](ADMIN_SETUP.md).

Deploys to Vercel (or any Node host) with the environment variables in `.env.example`.
