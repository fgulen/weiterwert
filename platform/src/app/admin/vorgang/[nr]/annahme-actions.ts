'use server';

import { redirect } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/admin/session';
import { ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { ablaufSichtbar } from '@/lib/admin/ablauf-sichtbar';
import { pruefeAnnahme, SICHERHEITS_PUNKTE, type AnnahmeDaten, type Datentraeger, type Entscheidung, type Zustand } from '@/lib/admin/annahme-nachweis';
import { speichereAnnahme } from '@/lib/admin/annahme-speicher';
import { aktuelleSprache } from '@/lib/i18n/server';
import { pfadFuer } from '@/lib/i18n/sprache';

/** Liest die Formularfelder in die Annahme-Daten. Fehlende Antworten bleiben null. */
function lesen(form: FormData, geraetePositionen: number[]): AnnahmeDaten {
  const text = (feld: string) => String(form.get(feld) ?? '');
  const geraete = geraetePositionen.map((position) => ({
    position,
    zustand: (text(`zustand_${position}`) || null) as Zustand | null,
    datentraeger: (text(`datentraeger_${position}`) || null) as Datentraeger | null,
  }));
  const sicherheit = Array.from({ length: SICHERHEITS_PUNKTE }, (_, i) => {
    const wert = text(`sicherheit_${i}`);
    return wert === 'ja' ? true : wert === 'nein' ? false : null;
  });
  return {
    geraete,
    sicherheit,
    entscheidung: (text('entscheidung') || null) as Entscheidung | null,
    grund: text('grund'),
    unterzeichner: '',
    unterschrift: text('unterschrift'),
  };
}

/** Speichert die digitale Annahme. Fehler kommen als Schlüssel in der Adresse zurück. */
export async function speichereAnnahmeAktion(form: FormData): Promise<void> {
  const { lang } = await aktuelleSprache();
  const nummer = String(form.get('vorgangsnummer') ?? '');
  const zurueck = (zusatz: string) => pfadFuer(lang, `/admin/vorgang/${nummer}${zusatz}`);

  if (!ablaufSichtbar() || !VORGANGSNUMMER.test(nummer)) redirect(pfadFuer(lang, '/admin'));
  const nutzer = await aktuellerNutzer();
  if (!nutzer || (nutzer.rolle !== 'admin' && nutzer.rolle !== 'mitarbeiter')) redirect(pfadFuer(lang, '/admin/login'));

  const vorgang = await ladeVorgang(nummer);
  if (!vorgang) redirect(zurueck('?an=fehler&grund=vorgang'));

  const daten = lesen(form, vorgang!.geraete.map((g) => g.position));
  daten.unterzeichner = nutzer!.email;

  const fehler = pruefeAnnahme(daten);
  if (fehler.length > 0) redirect(zurueck(`?an=fehler&grund=${encodeURIComponent(fehler[0])}`));

  const ergebnis = await speichereAnnahme(vorgang!, daten, nutzer!.email);
  if (!ergebnis.ok) redirect(zurueck(`?an=fehler&grund=${ergebnis.fehler}`));
  redirect(zurueck(ergebnis.gespeichert ? '?an=ok' : '?an=test'));
}
