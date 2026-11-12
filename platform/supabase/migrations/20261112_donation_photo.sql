-- Device photos (optional, after submission). Additive only. Run once in the Supabase SQL editor.
-- Photos live in a PRIVATE storage bucket; the database row records the path and the deletion date (14 days).

create table if not exists public.donation_photo (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.donation_request(id) on delete cascade,
  pfad text not null unique,
  typ text not null check (typ in ('jpeg', 'png')),
  groesse int not null check (groesse > 0),
  angelegt timestamptz not null default now(),
  loeschen_am timestamptz not null default (now() + interval '14 days')
);

create index if not exists donation_photo_request_idx on public.donation_photo (request_id);

alter table public.donation_photo enable row level security;
revoke all on public.donation_photo from anon, authenticated;

insert into storage.buckets (id, name, public) values ('geraete-fotos', 'geraete-fotos', false)
on conflict (id) do nothing;

notify pgrst, 'reload schema';
