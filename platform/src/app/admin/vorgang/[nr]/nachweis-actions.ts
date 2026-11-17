'use server';

import { redirect } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/admin/session';
import { ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { ablaufSichtbar } from '@/lib/admin/ablauf-sichtbar';
import { speichereNachweis } from '@/lib/admin/nachweis-speicher';
import { baueUebergabeDigital, baueLoeschungDigital } from '@/lib/admin/nachweis-pdf';
import {
  pruefeUebergabe, pruefeLoeschung, UEBERGABE_PUNKTE,
  type LoeschungDaten, type LoeschungGeraet, type LoeschErgebnis, type UebergabeDaten, type Verfahren,
} from '@/lib/admin/nachweis-regeln';
import { bestaetigeZweiteAnmeldung, zweiteFreigabeOk } from '@/lib/admin/zweite-freigabe';
import { aktuelleSprache } from '@/lib/i18n/server';
import { pfadFuer } from '@/lib/i18n/sprache';

function text(form: FormData, feld: string): string {
  return String(form.get(feld) ?? '');
}

async function kopf(form: FormData) {
  const { lang } = await aktuelleSprache();
  const nummer = text(form, 'vorgangsnummer');
  const zurueck = (zusatz: string) => pfadFuer(lang, `/admin/vorgang/${nummer}${zusatz}`);
  if (!ablaufSichtbar() || !VORGANGSNUMMER.test(nummer)) redirect(pfadFuer(lang, '/admin'));
  const nutzer = await aktuellerNutzer();
  if (!nutzer || (nutzer.rolle !== 'admin' && nutzer.rolle !== 'mitarbeiter')) redirect(pfadFuer(lang, '/admin/login'));
  const vorgang = await ladeVorgang(nummer);
  if (!vorgang) redirect(zurueck('?na=fehler&grund=vorgang'));
  return { nummer, zurueck, nutzer: nutzer!, vorgang: vorgang! };
}

/** Übergabe nach Dok. 28. */
export async function speichereUebergabeAktion(form: FormData): Promise<void> {
  const { zurueck, nutzer, vorgang } = await kopf(form);
  const daten: UebergabeDaten = {
    kontrolle: Array.from({ length: UEBERGABE_PUNKTE }, (_, i) => {
      const w = text(form, `kontrolle_${i}`);
      return w === 'ja' ? true : w === 'nein' ? false : null;
    }),
    empfaenger: text(form, 'empfaenger').trim(),
    unterzeichner: nutzer.email,
    unterschriftEmpfaenger: text(form, 'unterschrift'),
  };
  const fehler = pruefeUebergabe(daten);
  if (fehler.length > 0) redirect(zurueck(`?na=fehler&grund=${encodeURIComponent(fehler[0])}`));

  const ergebnis = await speichereNachweis({
    art: 'uebergabe',
    pdfArt: 'uebergabe-digital',
    v: vorgang,
    daten,
    nutzer: nutzer.email,
    baue: (hash, zeit) => baueUebergabeDigital(vorgang, daten, zeit, hash),
  });
  if (!ergebnis.ok) redirect(zurueck(`?na=fehler&grund=${ergebnis.fehler}`));
  redirect(zurueck(ergebnis.gespeichert ? '?na=ok' : '?na=test'));
}

/**
 * Löschung nach Dok. 07. Bei fehlgeschlagener Löschung oder Ausnahme bestätigt eine zweite Person
 * mit eigener Anmeldung (Punkt 13). Ihr Passwort wird nur geprüft und nicht gespeichert.
 */
export async function speichereLoeschungAktion(form: FormData): Promise<void> {
  const { zurueck, nutzer, vorgang } = await kopf(form);

  const geraete: LoeschungGeraet[] = vorgang.geraete.map((g) => {
    const p = g.position;
    const verifiziertWert = text(form, `verifiziert_${p}`);
    return {
      position: p,
      verfahren: (text(form, `verfahren_${p}`) || null) as Verfahren | null,
      verifiziert: verifiziertWert === 'ja' ? true : verifiziertWert === 'nein' ? false : null,
      werkzeug: text(form, `werkzeug_${p}`).trim(),
      ergebnis: (text(form, `ergebnis_${p}`) || null) as LoeschErgebnis | null,
      bemerkung: text(form, `bemerkung_${p}`).trim(),
    };
  });
  const daten: LoeschungDaten = { geraete, unterzeichner: nutzer.email, zweiter: null };

  const braucht = geraete.some((g) => g.ergebnis === 'fehlgeschlagen' || g.ergebnis === 'ausnahme');
  if (braucht) {
    const bestaetigung = await bestaetigeZweiteAnmeldung(text(form, 'zweiter_email').trim(), text(form, 'zweiter_passwort'));
    if ('grund' in bestaetigung) redirect(zurueck(`?na=fehler&grund=zweiter_${bestaetigung.grund}`));
    const regel = zweiteFreigabeOk(nutzer.email, bestaetigung.email, bestaetigung.rolle);
    if (!regel.ok) redirect(zurueck(`?na=fehler&grund=zweiter_${regel.grund}`));
    daten.zweiter = bestaetigung.email;
  }

  const fehler = pruefeLoeschung(daten);
  if (fehler.length > 0) redirect(zurueck(`?na=fehler&grund=${encodeURIComponent(fehler[0])}`));

  const ergebnis = await speichereNachweis({
    art: 'loeschung',
    pdfArt: 'loeschung-digital',
    v: vorgang,
    daten,
    nutzer: nutzer.email,
    baue: (hash, zeit) => baueLoeschungDigital(vorgang, daten, zeit, hash),
  });
  if (!ergebnis.ok) redirect(zurueck(`?na=fehler&grund=${ergebnis.fehler}`));
  redirect(zurueck(ergebnis.gespeichert ? '?na=ok' : '?na=test'));
}
