-- Sleep Anaesthesia CMS schema.
--
-- Security model
--   • RLS is enabled on every table. Anonymous visitors cannot read any table
--     directly; they read published content through the `published_entries`
--     view, which exposes only published columns of published rows.
--   • Staff = a row in admin_users (role 'admin' or 'editor') AND a session at
--     MFA level aal2. Every write policy checks both, in the database, so a
--     stolen password without the TOTP code cannot change anything.
--   • Admin-only: site settings, users, permanent deletion, audit log, enquiries.
--   • Audit log and version history are written by triggers, so every change
--     is recorded no matter which code path made it.

create extension if not exists pgcrypto;

-- ─── staff ─────────────────────────────────────────────────────────────────
create table public.admin_users (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  role        text not null check (role in ('admin', 'editor')),
  invited_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  disabled_at timestamptz
);
alter table public.admin_users enable row level security;

-- Role of the current user, only when they have completed MFA (aal2).
create or replace function public.staff_role() returns text
language sql stable security definer set search_path = public as $$
  select au.role
  from public.admin_users au
  where au.user_id = auth.uid()
    and au.disabled_at is null
    and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
$$;

create or replace function public.is_staff() returns boolean
language sql stable as $$ select public.staff_role() is not null $$;

create or replace function public.is_admin() returns boolean
language sql stable as $$ select public.staff_role() = 'admin' $$;

revoke all on function public.staff_role() from public, anon;
grant execute on function public.staff_role(), public.is_staff(), public.is_admin() to authenticated;

-- A signed-in user may read their own row (to route them to MFA); admins read all.
create policy admin_users_self_read on public.admin_users for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy admin_users_admin_write on public.admin_users for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─── content ───────────────────────────────────────────────────────────────
-- One table for every collection; each collection's fields are defined and
-- validated in src/content/collections.ts + src/content/validation.ts.
--   draft_data      pending edits (null when there are none)
--   published_data  what the live site shows (null = not published)
create table public.entries (
  id              uuid primary key default gen_random_uuid(),
  collection      text not null check (collection in ('settings','home','banner','treatments','locations','videos','media','faqs','testimonials','before_after','page_seo')),
  slug            text,
  published_slug  text,
  sort_order      integer not null default 0,
  draft_data      jsonb,
  published_data  jsonb,
  published_at    timestamptz,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  created_by      uuid references auth.users (id) on delete set null,
  updated_at      timestamptz not null default now(),
  updated_by      uuid references auth.users (id) on delete set null,
  constraint entries_has_data check (draft_data is not null or published_data is not null)
);
create unique index entries_slug_unique on public.entries (collection, slug) where slug is not null and deleted_at is null;
create unique index entries_singleton on public.entries (collection) where collection in ('settings','home','banner') and deleted_at is null;
create index entries_collection_order on public.entries (collection, sort_order) where deleted_at is null;
alter table public.entries enable row level security;

create policy entries_staff_read on public.entries for select to authenticated using (public.is_staff());
create policy entries_staff_insert on public.entries for insert to authenticated
  with check (public.is_staff() and (collection <> 'settings' or public.is_admin()));
create policy entries_staff_update on public.entries for update to authenticated
  using (public.is_staff() and (collection <> 'settings' or public.is_admin()))
  with check (public.is_staff() and (collection <> 'settings' or public.is_admin()));
create policy entries_admin_delete on public.entries for delete to authenticated using (public.is_admin());

-- Public read path: published columns of published, non-deleted rows only.
-- Runs with the view owner's rights, so anon needs no access to `entries`.
create view public.published_entries as
  select id, collection, published_slug as slug, sort_order, published_data as data, published_at
  from public.entries
  where published_data is not null and deleted_at is null;
revoke all on public.published_entries from public;
grant select on public.published_entries to anon, authenticated;

-- Editors may not permanently remove published content: soft delete only.
-- Guard against un-deleting or editing rows outside the 30-day bin window.
create or replace function public.entries_before_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.deleted_at is not null and new.deleted_at is null and old.deleted_at < now() - interval '30 days' then
    raise exception 'Items can only be restored within 30 days of deletion.';
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;
create trigger entries_before_update before update on public.entries
  for each row execute function public.entries_before_update();

create or replace function public.entries_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.created_by := coalesce(new.created_by, auth.uid());
  new.updated_by := auth.uid();
  return new;
end $$;
create trigger entries_before_insert before insert on public.entries
  for each row execute function public.entries_before_insert();

-- ─── version history ───────────────────────────────────────────────────────
create table public.entry_versions (
  id          bigint generated always as identity primary key,
  entry_id    uuid not null references public.entries (id) on delete cascade,
  kind        text not null check (kind in ('draft', 'published')),
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users (id) on delete set null
);
create index entry_versions_entry on public.entry_versions (entry_id, created_at desc);
alter table public.entry_versions enable row level security;
create policy entry_versions_staff_read on public.entry_versions for select to authenticated using (public.is_staff());
-- Inserted only by the trigger below (security definer); never edited.

-- ─── audit log ─────────────────────────────────────────────────────────────
create table public.audit_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor_id    uuid,
  actor_email text,
  action      text not null,
  target      text not null,
  target_id   text,
  summary     text
);
create index audit_log_at on public.audit_log (at desc);
alter table public.audit_log enable row level security;
create policy audit_log_admin_read on public.audit_log for select to authenticated using (public.is_admin());
-- No insert/update/delete policies: rows are written only by triggers.

create or replace function public.write_audit(p_action text, p_target text, p_target_id text, p_summary text) returns void
language sql security definer set search_path = public as $$
  insert into public.audit_log (actor_id, actor_email, action, target, target_id, summary)
  values (auth.uid(), (select email from auth.users where id = auth.uid()), p_action, p_target, p_target_id, left(p_summary, 200));
$$;
revoke all on function public.write_audit(text, text, text, text) from public, anon, authenticated;

create or replace function public.entry_title(d jsonb) returns text language sql immutable as $$
  select coalesce(d ->> 'title', d ->> 'name', d ->> 'question', d ->> 'heroHeadline', d ->> 'businessName', d ->> 'message', d ->> 'caption', d ->> 'page', d ->> 'slot', '')
$$;

create or replace function public.entries_after_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_action text;
  v_title  text;
begin
  if tg_op = 'INSERT' then
    v_title := entry_title(coalesce(new.draft_data, new.published_data));
    perform write_audit(case when new.published_data is not null then 'create+publish' else 'create' end, new.collection, new.id::text, v_title);
    if new.draft_data is not null then
      insert into entry_versions (entry_id, kind, data, created_by) values (new.id, 'draft', new.draft_data, auth.uid());
    end if;
    if new.published_data is not null then
      insert into entry_versions (entry_id, kind, data, created_by) values (new.id, 'published', new.published_data, auth.uid());
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    perform write_audit('delete-permanently', old.collection, old.id::text, entry_title(coalesce(old.published_data, old.draft_data)));
    return old;
  end if;

  v_title := entry_title(coalesce(new.draft_data, new.published_data, old.published_data));
  if old.deleted_at is null and new.deleted_at is not null then
    v_action := 'delete';
  elsif old.deleted_at is not null and new.deleted_at is null then
    v_action := 'restore';
  elsif new.published_data is distinct from old.published_data and new.published_data is null then
    v_action := 'unpublish';
  elsif new.published_data is distinct from old.published_data then
    v_action := 'publish';
    insert into entry_versions (entry_id, kind, data, created_by) values (new.id, 'published', new.published_data, auth.uid());
  elsif new.draft_data is distinct from old.draft_data and new.draft_data is not null then
    v_action := 'update-draft';
    insert into entry_versions (entry_id, kind, data, created_by) values (new.id, 'draft', new.draft_data, auth.uid());
  elsif new.draft_data is distinct from old.draft_data then
    v_action := 'discard-draft';
  elsif new.sort_order is distinct from old.sort_order then
    return new; -- reordering is not audited row by row
  else
    v_action := 'update';
  end if;
  perform write_audit(v_action, new.collection, new.id::text, v_title);
  return new;
end $$;
create trigger entries_after_change after insert or update or delete on public.entries
  for each row execute function public.entries_after_change();

create or replace function public.admin_users_after_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then perform write_audit('invite-user', 'users', new.user_id::text, new.email || ' as ' || new.role);
  elsif tg_op = 'DELETE' then perform write_audit('remove-user', 'users', old.user_id::text, old.email);
  elsif new.disabled_at is distinct from old.disabled_at then perform write_audit(case when new.disabled_at is null then 'enable-user' else 'disable-user' end, 'users', new.user_id::text, new.email);
  elsif new.role is distinct from old.role then perform write_audit('change-role', 'users', new.user_id::text, new.email || ': ' || old.role || ' → ' || new.role);
  end if;
  return coalesce(new, old);
end $$;
create trigger admin_users_after_change after insert or update or delete on public.admin_users
  for each row execute function public.admin_users_after_change();

-- ─── redirects ─────────────────────────────────────────────────────────────
-- Created automatically when a published slug changes. Public read so the
-- proxy can issue 301s; only staff can add, only admins can remove.
create table public.redirects (
  from_path   text primary key check (from_path ~ '^/[a-z0-9/_-]+$'),
  to_path     text not null check (to_path ~ '^/[a-z0-9/_-]*$'),
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users (id) on delete set null default auth.uid()
);
alter table public.redirects enable row level security;
create policy redirects_public_read on public.redirects for select to anon, authenticated using (true);
create policy redirects_staff_write on public.redirects for insert to authenticated with check (public.is_staff());
create policy redirects_staff_update on public.redirects for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy redirects_admin_delete on public.redirects for delete to authenticated using (public.is_admin());

-- ─── enquiries ─────────────────────────────────────────────────────────────
-- Written by the website's server action with the service role only.
create table public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  audience    text not null check (audience in ('clinic', 'patient')),
  name        text not null check (char_length(name) <= 80),
  clinic      text check (char_length(clinic) <= 120),
  email       text check (char_length(email) <= 160),
  phone       text check (char_length(phone) <= 20),
  message     text check (char_length(message) <= 1500),
  page        text,
  ip_hash     text,
  handled_at  timestamptz
);
create index enquiries_created on public.enquiries (created_at desc);
create index enquiries_ip on public.enquiries (ip_hash, created_at);
alter table public.enquiries enable row level security;
create policy enquiries_admin_read on public.enquiries for select to authenticated using (public.is_admin());
create policy enquiries_admin_update on public.enquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy enquiries_admin_delete on public.enquiries for delete to authenticated using (public.is_admin());

-- ─── login rate limiting ───────────────────────────────────────────────────
-- Service role only (no policies): failed attempts per email and per IP hash.
create table public.login_attempts (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  email       text not null,
  ip_hash     text not null,
  success     boolean not null
);
create index login_attempts_email on public.login_attempts (email, at desc);
create index login_attempts_ip on public.login_attempts (ip_hash, at desc);
alter table public.login_attempts enable row level security;

-- ─── housekeeping ──────────────────────────────────────────────────────────
-- Empties the bin (items deleted > 30 days ago) and trims old login records.
create or replace function public.purge_expired() returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from public.entries where deleted_at < now() - interval '30 days';
  delete from public.login_attempts where at < now() - interval '30 days';
end $$;
revoke all on function public.purge_expired() from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('purge-expired-cms', '17 3 * * *', 'select public.purge_expired()');
  end if;
exception when others then
  raise notice 'pg_cron not available; schedule public.purge_expired() another way (see ADMIN_SETUP.md).';
end $$;

-- ─── table privileges ──────────────────────────────────────────────────────
-- Belt and braces on top of RLS: anon has no table access at all.
revoke all on public.admin_users, public.entries, public.entry_versions, public.audit_log, public.enquiries, public.login_attempts from anon;
revoke all on public.login_attempts from authenticated;
revoke insert, update, delete on public.entry_versions, public.audit_log from authenticated;
grant select on public.redirects to anon;

-- ─── storage ───────────────────────────────────────────────────────────────
-- public-media:    optimised images, videos, captions. Public read; staff write.
-- private-uploads: raw uploads awaiting validation/processing. Staff write
--                  only via one-time signed URLs; never publicly readable.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-media', 'public-media', true, 209715200, array['image/webp', 'image/jpeg', 'image/png', 'video/mp4', 'text/vtt']),
  ('private-uploads', 'private-uploads', false, 209715200, array['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])
on conflict (id) do nothing;

create policy public_media_read on storage.objects for select to anon, authenticated using (bucket_id = 'public-media');
create policy public_media_staff_insert on storage.objects for insert to authenticated with check (bucket_id = 'public-media' and public.is_staff());
create policy public_media_staff_update on storage.objects for update to authenticated using (bucket_id = 'public-media' and public.is_staff());
create policy public_media_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'public-media' and public.is_admin());
create policy private_uploads_staff_insert on storage.objects for insert to authenticated with check (bucket_id = 'private-uploads' and public.is_staff());
