-- Zweite Freigabe nur bei fehlgeschlagener Löschung, Ausnahme oder Vernichtung (Dok. 07, Abschnitt 6).
-- Nicht angewendet. Erst im Supabase-SQL-Editor ausführen, nachdem 20261117_geraet_ablauf.sql angewendet wurde.
-- Ersetzt nur die Funktion setze_geraet_status. Gleiche Parameter wie vorher.

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
  if p_schritt in ('loeschung_fehlgeschlagen', 'loeschung_ausnahme', 'vernichtung')
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
