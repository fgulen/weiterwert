-- Gerätestatus und Schrittprotokoll-PDF in EINER Transaktion (Regel: kein Statuswechsel ohne PDF).
-- Nicht angewendet. Erst im Supabase-SQL-Editor ausführen, nachdem 20261122_nachweis_allgemein.sql angewendet wurde.
-- Gleiche Prüfungen wie setze_geraet_status (20261119). Zusätzlich: PDF-Version je Gerät.

create or replace function public.setze_geraet_status_mit_pdf(
  p_device uuid, p_von text, p_nach text, p_schritt text, p_nutzer text, p_zweiter text,
  p_vorgang text, p_sha256 text, p_inhalt bytea
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  aktuell text;
  letzte_version int;
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
  if p_schritt in ('loeschung_fehlgeschlagen', 'loeschung_ausnahme', 'vernichtung')
     and (p_zweiter is null or p_zweiter = p_nutzer) then
    raise exception 'zwei_admin_fehlt';
  end if;

  insert into public.geraet_ereignis (device_id, von, nach, schritt, nutzer, zweiter_nutzer)
  values (p_device, p_von, p_nach, p_schritt, p_nutzer, p_zweiter);

  update public.device_record
  set ablauf_status = p_nach, ablauf_aktualisiert = now()
  where device_id = p_device;

  -- Schrittprotokoll als nächste Version dieses Geräts (Art "schritt:<geräte-id>")
  select coalesce(max(version), 0) into letzte_version
  from public.protokoll
  where nummer = p_vorgang and art = 'schritt:' || p_device::text;

  insert into public.protokoll (nummer, art, version, bezug, sha256, inhalt, nutzer)
  values (
    p_vorgang, 'schritt:' || p_device::text, letzte_version + 1,
    case when letzte_version > 0 then p_vorgang || '-' || p_device::text || '-v' || letzte_version else null end,
    p_sha256, p_inhalt, p_nutzer
  );
end;
$$;

revoke execute on function public.setze_geraet_status_mit_pdf(uuid, text, text, text, text, text, text, text, bytea) from public, anon, authenticated;
grant execute on function public.setze_geraet_status_mit_pdf(uuid, text, text, text, text, text, text, text, bytea) to service_role;
