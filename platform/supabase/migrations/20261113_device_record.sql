-- Geräteakte: Seriennummer, Löschung, Lagerort, Zustand und Entsorgung je Gerät.
-- Nicht angewendet. Erst im Supabase-SQL-Editor ausführen, dann die Admin-Seiten prüfen.
create table if not exists public.device_record (
  device_id uuid primary key references public.donation_device(id) on delete cascade,
  seriennummer text,
  loeschverfahren text,
  loeschdatum date,
  loeschperson text,
  lagerort text,
  zustand text,
  entsorgungsweg text,
  entsorger text,
  nachweisnummer text,
  entsorgungsdatum date,
  aktualisiert timestamptz not null default now(),
  aktualisiert_von text
);

-- Only the server (secret key) reads and writes. Same as the other tables: RLS on, no policies.
alter table public.device_record enable row level security;
