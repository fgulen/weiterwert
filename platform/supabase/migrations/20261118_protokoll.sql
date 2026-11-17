-- Gespeicherte PDF-Protokolle (Schritt 1 der PDF-Speicherung). Nicht angewendet.
-- Erst im Supabase-SQL-Editor ausführen, nachdem 20261117_geraet_ablauf.sql angewendet wurde.
-- Jede Version wird einmal erzeugt und danach unverändert ausgeliefert. Korrektur = neue Version mit Verweis.

create table if not exists public.protokoll (
  id bigserial primary key,
  nummer text not null,                 -- Vorgangsnummer WW-JJJJ-NNNNNN
  art text not null,                    -- 'uebergabe' | 'loeschprotokoll'
  version int not null default 1,
  bezug text null,                      -- Verweis auf die vorherige Version bei Korrektur
  sha256 text not null,
  inhalt bytea not null,
  nutzer text not null,
  zeit timestamptz not null default now(),
  unique (nummer, art, version)
);

alter table public.protokoll enable row level security;

-- Nie ändern oder löschen, auch nicht der Tabellen-Owner (Trigger, siehe geraet_ereignis).
create or replace function public.protokoll_unveraenderlich()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'protokoll ist unveraenderlich';
end;
$$;

drop trigger if exists protokoll_kein_update_loeschen on public.protokoll;
create trigger protokoll_kein_update_loeschen
  before update or delete on public.protokoll
  for each row execute function public.protokoll_unveraenderlich();

drop trigger if exists protokoll_kein_truncate on public.protokoll;
create trigger protokoll_kein_truncate
  before truncate on public.protokoll
  for each statement execute function public.protokoll_unveraenderlich();

revoke all on public.protokoll from public, anon, authenticated;
grant select, insert on public.protokoll to service_role;
revoke update, delete, truncate on public.protokoll from service_role;
