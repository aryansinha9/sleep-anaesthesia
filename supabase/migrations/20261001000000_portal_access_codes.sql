-- Clinic portal access codes (client request, Oct 2026: GA clinic suitability
-- requirements and site logistics go "behind locked pages").
--
-- Each partner clinic gets its own code so access can be revoked per clinic.
-- Only a SHA-256 hash of each code is stored; the plain code is shown to the
-- admin once, when it is created. Admins manage codes in the dashboard; the
-- website checks codes on the server with the service role.

create table public.portal_access_codes (
  id            uuid primary key default gen_random_uuid(),
  clinic_name   text not null check (char_length(clinic_name) between 1 and 120),
  code_hash     text not null unique check (code_hash ~ '^[0-9a-f]{64}$'),
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  created_by    uuid references auth.users (id) on delete set null default auth.uid(),
  last_used_at  timestamptz
);
alter table public.portal_access_codes enable row level security;

create policy portal_codes_admin_all on public.portal_access_codes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on public.portal_access_codes from anon;
grant select, insert, update, delete on public.portal_access_codes to authenticated;
grant all on public.portal_access_codes to service_role;

create or replace function public.portal_codes_after_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then perform write_audit('create-portal-code', 'portal', new.id::text, new.clinic_name);
  elsif tg_op = 'DELETE' then perform write_audit('delete-portal-code', 'portal', old.id::text, old.clinic_name);
  elsif new.active is distinct from old.active then
    perform write_audit(case when new.active then 'enable-portal-code' else 'disable-portal-code' end, 'portal', new.id::text, new.clinic_name);
  end if;
  return coalesce(new, old);
end $$;

-- last_used_at updates (service role) are not audited: only the three actions above.
create trigger portal_codes_after_change after insert or update or delete on public.portal_access_codes
  for each row execute function public.portal_codes_after_change();
