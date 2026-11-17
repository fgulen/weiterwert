-- Gerät-Ablauf je Gerät (Schritt 1 von 2). Nicht angewendet.
-- Erst im Supabase-SQL-Editor ausführen, nachdem 20261113_device_record.sql angewendet wurde.
-- Regeln spiegeln src/lib/admin/geraet-ablauf.ts (GERAET_FOLGE, brauchtZweiAdmins).
-- Zweite Freigabe pro Schritt: 'vorab_freigabe', 'annahme', 'loeschung'.

-- 1) Ablaufstatus je Gerät
alter table public.device_record
  add column if not exists ablauf_status text not null default 'eingegangen',
  add column if not exists ablauf_aktualisiert timestamptz not null default now();

-- 2) Erlaubte Übergänge (gleiche Liste wie GERAET_FOLGE in TypeScript)
create or replace function public.geraet_wechsel_erlaubt(von text, nach text)
returns boolean
language sql
immutable
as $$
  select exists (
    select 1 from (values
      ('eingegangen', 'zweite_kontrolle'),
      ('zweite_kontrolle', 'loeschung_offen'),
      ('zweite_kontrolle', 'quarantaene'),
      ('quarantaene', 'loeschung_offen'),
      ('quarantaene', 'rueckgabe'),
      ('loeschung_offen', 'geloescht'),
      ('geloescht', 'technische_pruefung'),
      ('technische_pruefung', 'reparatur'),
      ('technische_pruefung', 'frei'),
      ('technische_pruefung', 'entsorgt'),
      ('reparatur', 'technische_pruefung'),
      ('frei', 'reserviert'),
      ('reserviert', 'uebergeben'),
      ('reserviert', 'frei')
    ) as f(a, b)
    where f.a = von and f.b = nach
  );
$$;

-- 3) Ereignisprotokoll: nur anhängen, nie ändern oder löschen (Audit + Vier-Augen-Nachweis)
create table if not exists public.geraet_ereignis (
  id bigserial primary key,
  device_id uuid not null references public.donation_device(id) on delete restrict,
  von text not null,
  nach text not null,
  schritt text not null,
  nutzer text not null,
  zweiter_nutzer text,
  zeit timestamptz not null default now()
);
alter table public.geraet_ereignis enable row level security;

-- 4) Atomare Statusänderung: Sperre, Regelprüfung, Ereignis und Statusupdate in einer Transaktion.
create or replace function public.setze_geraet_status(
  p_device uuid, p_von text, p_nach text, p_schritt text, p_nutzer text, p_zweiter text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  aktuell text;
begin
  select ablauf_status into aktuell
  from public.device_record
  where device_id = p_device
  for update;

  if not found then
    raise exception 'geraet_unbekannt';
  end if;
  if aktuell <> p_von then
    raise exception 'status_veraltet';
  end if;
  if not public.geraet_wechsel_erlaubt(p_von, p_nach) then
    raise exception 'wechsel_nicht_erlaubt';
  end if;
  if p_schritt in ('vorab_freigabe', 'annahme', 'loeschung')
     and (p_zweiter is null or p_zweiter = p_nutzer) then
    raise exception 'zwei_admin_fehlt';
  end if;

  insert into public.geraet_ereignis (device_id, von, nach, schritt, nutzer, zweiter_nutzer)
  values (p_device, p_von, p_nach, p_schritt, p_nutzer, p_zweiter);

  update public.device_record
  set ablauf_status = p_nach, ablauf_aktualisiert = now()
  where device_id = p_device;
end;
$$;

-- Ereignisse nie ändern oder löschen. Die Rechte allein reichen nicht: der Tabellen-Owner
-- (postgres, auch im SQL-Editor) umgeht sie. Daher ein Trigger, der jede Änderung abbricht.
create or replace function public.geraet_ereignis_unveraenderlich()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'geraet_ereignis ist unveraenderlich';
end;
$$;

drop trigger if exists geraet_ereignis_kein_update_loeschen on public.geraet_ereignis;
create trigger geraet_ereignis_kein_update_loeschen
  before update or delete on public.geraet_ereignis
  for each row execute function public.geraet_ereignis_unveraenderlich();

drop trigger if exists geraet_ereignis_kein_truncate on public.geraet_ereignis;
create trigger geraet_ereignis_kein_truncate
  before truncate on public.geraet_ereignis
  for each statement execute function public.geraet_ereignis_unveraenderlich();

-- Nur der Server (service_role) darf schreiben.
-- HINWEIS (offen): p_zweiter wird der Funktion vertraut. Die App muss die zweite Person
-- über ihre eigene Sitzung bestätigen, bevor sie aufruft. Die SQL-Funktion prüft das nicht.
revoke all on public.geraet_ereignis from public, anon, authenticated;
grant select, insert on public.geraet_ereignis to service_role;
revoke update, delete, truncate on public.geraet_ereignis from service_role;
revoke execute on function public.setze_geraet_status(uuid, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.setze_geraet_status(uuid, text, text, text, text, text) to service_role;
revoke execute on function public.geraet_wechsel_erlaubt(text, text) from public, anon, authenticated;
grant execute on function public.geraet_wechsel_erlaubt(text, text) to service_role;
