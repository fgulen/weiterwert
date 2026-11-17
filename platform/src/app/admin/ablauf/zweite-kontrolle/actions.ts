'use server';

import { redirect } from 'next/navigation';
import { ablaufSichtbar } from '@/lib/admin/ablauf-sichtbar';
import { aktuellerNutzer } from '@/lib/admin/session';
import { istAdminRolle, schrittErlaubt } from '@/lib/admin/rollen';
import { zweiteKontrolleErgebnis, type GeraetMerkmale } from '@/lib/admin/geraet-ablauf';
import { setzeGeraetStatus } from '@/lib/admin/geraet-ablauf-db';
import { datenbankKonfiguriert } from '@/lib/admin/db';
import { baueSchrittPdf } from '@/lib/admin/schritt-pdf';
import { speichereSchrittPdf } from '@/lib/admin/schritt-speicher';
import { ladeVorgang } from '@/lib/admin/vorgang';
import { getAppEnv } from '@/lib/env';
import { aktuelleSprache } from '@/lib/i18n/server';
import { pfadFuer } from '@/lib/i18n/sprache';
import { schrittAnhang, schrittAnker } from '@/lib/admin/schritt-parameter';

const VORGANGSNUMMER_PRUEFUNG = /^WW-\d{4}-\d{6}$/;

function text(form: FormData, feld: string): string | null {
  const wert = String(form.get(feld) ?? '').trim();
  return wert === '' ? null : wert;
}

/**
 * Zweite Kontrolle, direkt im Vorgang je Gerät.
 * Schritte: eingegangen → zweite_kontrolle → (passt) loeschung_offen | (Abweichung) quarantaene.
 * Jeder Schritt wird einzeln protokolliert.
 */
export async function pruefeZweiteKontrolle(form: FormData): Promise<void> {
  const { lang } = await aktuelleSprache();
  const nummer = text(form, 'vorgangsnummer');
  const zurueck = (zusatz: string) => pfadFuer(lang, `/admin/vorgang/${nummer ?? ''}${zusatz}${schrittAnhang(form)}${schrittAnker(form)}`);

  if (!ablaufSichtbar()) redirect(pfadFuer(lang, '/admin'));
  const nutzer = await aktuellerNutzer();
  if (!nutzer || !istAdminRolle(nutzer.rolle)) redirect(pfadFuer(lang, '/admin/login'));
  if (!schrittErlaubt(nutzer.rolle, 'zweite')) redirect(zurueck('?zk=berechtigung'));

  const deviceId = text(form, 'device_id');
  if (!nummer || !VORGANGSNUMMER_PRUEFUNG.test(nummer) || !deviceId) redirect(zurueck('?zk=eingabe'));

  const vorgang = await ladeVorgang(nummer!);
  const geraet = vorgang?.geraete.find((g) => g.id === deviceId);
  if (!geraet) redirect(zurueck('?zk=geraet'));

  // Antrag wird frisch geladen, nicht aus dem Formular übernommen.
  const antrag: GeraetMerkmale = { typ: geraet!.typ, marke: geraet!.marke, modell: geraet!.modell };
  const geliefert: GeraetMerkmale = {
    typ: text(form, 'typ') ?? '',
    marke: text(form, 'marke'),
    modell: text(form, 'modell'),
  };
  if (!geliefert.typ) redirect(zurueck('?zk=eingabe'));
  const ergebnis = zweiteKontrolleErgebnis(antrag, geliefert);

  if (!datenbankKonfiguriert()) {
    // Nur in der Testumgebung ohne Datenbank. Sonst nichts vortäuschen (Review-Befund).
    if (getAppEnv() === 'test') redirect(zurueck(`?zk=${ergebnis}&test=1`));
    redirect(zurueck('?zk=datenbank_nicht_konfiguriert'));
  }

  const basis = { deviceId: deviceId!, nutzer: nutzer!.email, zweiter: null };
  const schritt1 = await setzeGeraetStatus({ ...basis, von: 'eingegangen', nach: 'zweite_kontrolle', schritt: 'zweite_kontrolle' });
  if (!schritt1.ok) redirect(zurueck(`?zk=${schritt1.fehler}`));

  const schritt2 = await setzeGeraetStatus({
    ...basis,
    von: 'zweite_kontrolle',
    nach: ergebnis === 'passt' ? 'loeschung_offen' : 'quarantaene',
    schritt: ergebnis === 'passt' ? 'zweite_kontrolle_passt' : 'zweite_kontrolle_abweichung',
  });
  if (!schritt2.ok) redirect(zurueck(`?zk=${schritt2.fehler}`));

  // Schrittprotokoll für die Zweite Kontrolle (Gesamtschritt eingegangen → Ergebnis)
  const pdf = await baueSchrittPdf({
    v: vorgang!, geraet: geraet!, von: 'eingegangen',
    nach: ergebnis === 'passt' ? 'loeschung_offen' : 'quarantaene',
    nutzer: nutzer!.email, zeit: new Date(), zweiter: null,
  });
  const gespeichert = await speichereSchrittPdf(nummer!, deviceId!, pdf, nutzer!.email);
  if (!gespeichert.ok) redirect(zurueck('?zk=pdf'));

  redirect(zurueck(`?zk=${ergebnis}`));
}
