-- Digitale Nachweise (Annahme nach Dok. 18). Nicht angewendet.
-- Erst im Supabase-SQL-Editor ausführen, nachdem 20261119_zweite_freigabe_regel.sql angewendet wurde.
-- Jeder Eintrag verweist über prev_hash auf den vorherigen. Nie ändern, nie löschen.

create table if not exists public.ablauf_nachweis (
  id bigserial primary key,
  nummer text not null,            -- Vorgangsnummer WW-JJJJ-NNNNNN
  art text not null,               -- z. B. 'annahme'
  daten jsonb not null,            -- Checkliste, Zustände, Entscheidung, Unterzeichner, Unterschrift (PNG)
  prev_hash text null,
  hash text not null unique,
  nutzer text not null,
  zeit timestamptz not null default now()
);

alter table public.ablauf_nachweis enable row level security;

create or replace function public.ablauf_nachweis_unveraenderlich()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'ablauf_nachweis ist unveraenderlich';
end;
$$;

drop trigger if exists ablauf_nachweis_kein_update_loeschen on public.ablauf_nachweis;
create trigger ablauf_nachweis_kein_update_loeschen
  before update or delete on public.ablauf_nachweis
  for each row execute function public.ablauf_nachweis_unveraenderlich();

drop trigger if exists ablauf_nachweis_kein_truncate on public.ablauf_nachweis;
create trigger ablauf_nachweis_kein_truncate
  before truncate on public.ablauf_nachweis
  for each statement execute function public.ablauf_nachweis_unveraenderlich();

revoke all on public.ablauf_nachweis from public, anon, authenticated;
grant select, insert on public.ablauf_nachweis to service_role;
revoke update, delete, truncate on public.ablauf_nachweis from service_role;
