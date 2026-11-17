'use server';

import { redirect } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/admin/session';
import { ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { ablaufSichtbar } from '@/lib/admin/ablauf-sichtbar';
import { istAdminRolle, schrittErlaubt } from '@/lib/admin/rollen';
import { legeEingangAn } from '@/lib/admin/geraet-ablauf-db';
import { aktuelleSprache } from '@/lib/i18n/server';
import { pfadFuer } from '@/lib/i18n/sprache';

/** Schritt Eingang: das angekommene Gerät im System erfassen. */
export async function erfasseEingangAktion(form: FormData): Promise<void> {
  const { lang } = await aktuelleSprache();
  const nummer = String(form.get('vorgangsnummer') ?? '');
  const deviceId = String(form.get('device_id') ?? '');
  const zurueck = (zusatz: string) => pfadFuer(lang, `/admin/vorgang/${nummer}${zusatz}#status-verlauf-titel`);

  if (!ablaufSichtbar() || !VORGANGSNUMMER.test(nummer)) redirect(pfadFuer(lang, '/admin'));
  const nutzer = await aktuellerNutzer();
  if (!nutzer || !istAdminRolle(nutzer.rolle)) redirect(pfadFuer(lang, '/admin/login'));
  if (!schrittErlaubt(nutzer.rolle, 'eingang')) redirect(zurueck('?ei=fehler&grund=berechtigung'));

  const vorgang = await ladeVorgang(nummer);
  if (!vorgang || !vorgang.geraete.some((g) => g.id === deviceId)) redirect(zurueck('?ei=fehler&grund=geraet'));

  const ergebnis = await legeEingangAn(deviceId);
  if (!ergebnis.ok) redirect(zurueck('?ei=fehler&grund=datenbank'));
  redirect(zurueck('?ei=ok'));
}
