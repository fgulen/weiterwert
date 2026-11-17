-- Annahme in einer Transaktion: Nachweis (Hash-Kette) und PDF-Protokoll gemeinsam oder gar nicht.
-- Nicht angewendet. Erst im Supabase-SQL-Editor ausführen, nachdem 20261120_ablauf_nachweis.sql angewendet wurde.

create or replace function public.speichere_annahme(
  p_nummer text,
  p_daten jsonb,
  p_prev_hash text,
  p_hash text,
  p_nutzer text,
  p_zeit timestamptz,
  p_sha256 text,
  p_inhalt bytea
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  letzter_hash text;
  letzte_version int;
begin
  -- Sperre auf den Vorgang, damit zwei gleichzeitige Speicherungen nicht gegeneinander laufen.
  perform 1 from public.donation_request where vorgangsnummer = p_nummer for update;

  select hash into letzter_hash
  from public.ablauf_nachweis
  where nummer = p_nummer and art = 'annahme'
  order by id desc
  limit 1;

  -- Die Kette muss beim Stand sein, den der Aufrufer gelesen hat. Sonst wurde dazwischen gespeichert.
  if letzter_hash is distinct from p_prev_hash then
    raise exception 'kette_geaendert';
  end if;

  insert into public.ablauf_nachweis (nummer, art, daten, prev_hash, hash, nutzer, zeit)
  values (p_nummer, 'annahme', p_daten, p_prev_hash, p_hash, p_nutzer, p_zeit);

  select coalesce(max(version), 0) into letzte_version
  from public.protokoll
  where nummer = p_nummer and art = 'annahme-digital';

  insert into public.protokoll (nummer, art, version, bezug, sha256, inhalt, nutzer)
  values (
    p_nummer, 'annahme-digital', letzte_version + 1,
    case when letzte_version > 0 then p_nummer || '-v' || letzte_version else null end,
    p_sha256, p_inhalt, p_nutzer
  );
end;
$$;

revoke execute on function public.speichere_annahme(text, jsonb, text, text, text, timestamptz, text, bytea) from public, anon, authenticated;
grant execute on function public.speichere_annahme(text, jsonb, text, text, text, timestamptz, text, bytea) to service_role;
