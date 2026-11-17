'use server';

import { redirect } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/admin/session';
import { ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { ablaufSichtbar } from '@/lib/admin/ablauf-sichtbar';
import { geraetNaechsteStatus, brauchtZweiAdmins } from '@/lib/admin/geraet-ablauf';
import { setzeGeraetStatus } from '@/lib/admin/geraet-ablauf-db';
import { ladeGeraetStatusListe } from '@/lib/admin/geraet-verlauf';
import { baueSchrittPdf } from '@/lib/admin/schritt-pdf';
import { speichereSchrittPdf } from '@/lib/admin/schritt-speicher';
import { aktuelleSprache } from '@/lib/i18n/server';
import { pfadFuer } from '@/lib/i18n/sprache';
import { schrittAnhang } from '@/lib/admin/schritt-parameter';

/**
 * Ein Schritt per Button. Nur erlaubte Nachfolger, nur mit aktuellem Stand (kein stilles Überschreiben).
 * Schritte mit zweiter Person laufen über ihre eigenen Formulare (Löschung), nicht über diesen Button.
 */
export async function setzeStatusAktion(form: FormData): Promise<void> {
  const { lang } = await aktuelleSprache();
  const nummer = String(form.get('vorgangsnummer') ?? '');
  const deviceId = String(form.get('device_id') ?? '');
  const nach = String(form.get('nach') ?? '');
  const zurueck = (zusatz: string) => pfadFuer(lang, `/admin/vorgang/${nummer}${zusatz}${schrittAnhang(form)}`);

  if (!ablaufSichtbar() || !VORGANGSNUMMER.test(nummer)) redirect(pfadFuer(lang, '/admin'));
  const nutzer = await aktuellerNutzer();
  if (!nutzer || (nutzer.rolle !== 'admin' && nutzer.rolle !== 'mitarbeiter')) redirect(pfadFuer(lang, '/admin/login'));

  const vorgang = await ladeVorgang(nummer);
  if (!vorgang || !vorgang.geraete.some((g) => g.id === deviceId)) redirect(zurueck('?st=fehler&grund=geraet'));

  const liste = await ladeGeraetStatusListe(nummer);
  if (liste === null) redirect(zurueck('?st=fehler&grund=datenbank'));
  const aktuell = liste!.find((z) => z.deviceId === deviceId)?.status ?? 'eingegangen';

  if (!geraetNaechsteStatus(aktuell).includes(nach)) redirect(zurueck('?st=fehler&grund=wechsel'));

  // Schritt-Name: aus dem Ziel abgeleitet, damit das Protokoll lesbar bleibt.
  const schritt = nach;
  if (brauchtZweiAdmins(schritt)) redirect(zurueck('?st=fehler&grund=zweiter'));

  const ergebnis = await setzeGeraetStatus({ deviceId, von: aktuell, nach, schritt, nutzer: nutzer!.email, zweiter: null });
  if (!ergebnis.ok) redirect(zurueck(`?st=fehler&grund=${ergebnis.fehler}`));

  // Jeder Schritt bekommt sein Protokoll-PDF. Schlägt das fehl, wird das deutlich gemeldet.
  const geraet = vorgang.geraete.find((g) => g.id === deviceId)!;
  const pdf = await baueSchrittPdf({ v: vorgang, geraet, von: aktuell, nach, nutzer: nutzer!.email, zeit: new Date(), zweiter: null });
  const gespeichert = await speichereSchrittPdf(nummer, deviceId, pdf, nutzer!.email);
  if (!gespeichert.ok) redirect(zurueck('?st=pdf'));
  redirect(zurueck('?st=ok'));
}
