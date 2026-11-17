'use server';

import { redirect } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/admin/session';
import { istAdminRolle, schrittErlaubt, schrittFuerStatus } from '@/lib/admin/rollen';
import { ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { ablaufSichtbar } from '@/lib/admin/ablauf-sichtbar';
import { geraetNaechsteStatus, brauchtZweiAdmins } from '@/lib/admin/geraet-ablauf';
import { setzeGeraetStatusMitPdf } from '@/lib/admin/geraet-ablauf-db';
import { ladeGeraetStatusListe } from '@/lib/admin/geraet-verlauf';
import { baueSchrittPdf } from '@/lib/admin/schritt-pdf';
import { aktuelleSprache } from '@/lib/i18n/server';
import { pfadFuer } from '@/lib/i18n/sprache';
import { schrittAnhang, schrittAnker } from '@/lib/admin/schritt-parameter';

/**
 * Ein Schritt per Button. Nur erlaubte Nachfolger, nur mit aktuellem Stand (kein stilles Überschreiben).
 * Schritte mit zweiter Person laufen über ihre eigenen Formulare (Löschung), nicht über diesen Button.
 */
export async function setzeStatusAktion(form: FormData): Promise<void> {
  const { lang } = await aktuelleSprache();
  const nummer = String(form.get('vorgangsnummer') ?? '');
  const deviceId = String(form.get('device_id') ?? '');
  const nach = String(form.get('nach') ?? '');
  const zurueck = (zusatz: string) => pfadFuer(lang, `/admin/vorgang/${nummer}${zusatz}${schrittAnhang(form)}${schrittAnker(form)}`);

  if (!ablaufSichtbar() || !VORGANGSNUMMER.test(nummer)) redirect(pfadFuer(lang, '/admin'));
  const nutzer = await aktuellerNutzer();
  if (!nutzer || !istAdminRolle(nutzer.rolle)) redirect(pfadFuer(lang, '/admin/login'));

  const vorgang = await ladeVorgang(nummer);
  if (!vorgang || !vorgang.geraete.some((g) => g.id === deviceId)) redirect(zurueck('?st=fehler&grund=geraet'));

  const liste = await ladeGeraetStatusListe(nummer);
  if (liste === null) redirect(zurueck('?st=fehler&grund=datenbank'));
  const aktuell = liste!.find((z) => z.deviceId === deviceId)?.status ?? 'eingegangen';

  if (!geraetNaechsteStatus(aktuell).includes(nach)) redirect(zurueck('?st=fehler&grund=wechsel'));
  if (!schrittErlaubt(nutzer!.rolle, schrittFuerStatus(nach))) redirect(zurueck('?st=fehler&grund=berechtigung'));

  // Schritt-Name: aus dem Ziel abgeleitet, damit das Protokoll lesbar bleibt.
  const schritt = nach;
  if (brauchtZweiAdmins(schritt)) redirect(zurueck('?st=fehler&grund=zweiter'));

  // Erst das PDF für den Zielzustand erzeugen, dann Status und PDF gemeinsam speichern.
  // Schlägt eines fehl, bleibt der Status unverändert (keine Änderung ohne Protokoll).
  const geraet = vorgang.geraete.find((g) => g.id === deviceId)!;
  const pdf = await baueSchrittPdf({ v: vorgang, geraet, von: aktuell, nach, nutzer: nutzer!.email, zeit: new Date(), zweiter: null });
  const ergebnis = await setzeGeraetStatusMitPdf({
    deviceId, von: aktuell, nach, schritt, nutzer: nutzer!.email, zweiter: null, vorgangsnummer: nummer, pdf,
  });
  if (!ergebnis.ok) redirect(zurueck(`?st=fehler&grund=${ergebnis.fehler}`));
  redirect(zurueck(`?st=ok&dev=${deviceId}`));
}
