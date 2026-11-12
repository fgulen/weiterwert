-- Admin audit log (Plan §11): every status change and every PDF download is recorded.
-- Additive only. Run once in the Supabase SQL editor. Closed to the public API; only the server (secret key) writes and reads it.

create table if not exists public.admin_audit (
  id uuid primary key default gen_random_uuid(),
  zeit timestamptz not null default now(),
  nutzer text not null,
  aktion text not null,
  vorgang text,
  details jsonb not null default '{}'::jsonb
);

create index if not exists admin_audit_vorgang_idx on public.admin_audit (vorgang, zeit desc);

alter table public.admin_audit enable row level security;
revoke all on public.admin_audit from anon, authenticated;

notify pgrst, 'reload schema';
