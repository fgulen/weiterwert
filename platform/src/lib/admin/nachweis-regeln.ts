// Regeln für digitale Übergabe (Dok. 28) und Löschung (Dok. 07). Ohne Serverzugriff, testbar.
import { istPngUnterschrift } from './annahme-nachweis';

// ---------- Übergabe (Dok. 28) ----------
export const UEBERGABE_PUNKTE = 6;

export type UebergabeDaten = {
  /** true = Ja, false = Nein / n. a., null = nicht beantwortet. */
  kontrolle: Array<boolean | null>;
  empfaenger: string;
  unterzeichner: string;
  /** PNG-Data-URL der Unterschrift der empfangenden Person. */
  unterschriftEmpfaenger: string;
};

export function pruefeUebergabe(d: UebergabeDaten): string[] {
  const fehler: string[] = [];
  if (d.kontrolle.length !== UEBERGABE_PUNKTE || d.kontrolle.some((v) => v === null)) fehler.push('kontrolle');
  if (!d.empfaenger.trim()) fehler.push('empfaenger');
  if (!d.unterzeichner.trim()) fehler.push('unterzeichner');
  if (!istPngUnterschrift(d.unterschriftEmpfaenger)) fehler.push('unterschrift');
  return fehler;
}

// ---------- Löschung (Dok. 07) ----------
export type Verfahren = 'hdd' | 'ssd' | 'nvme' | 'emmc' | 'smartphone' | 'usb' | 'keines';
export type LoeschErgebnis = 'erfolgreich' | 'fehlgeschlagen' | 'ausnahme';

export type LoeschungGeraet = {
  position: number;
  /** Eingesetztes Verfahren laut Tabelle Dok. 07, Abschnitt 3. */
  verfahren: Verfahren | null;
  /** Verifikation: Werkzeugbericht ohne Fehler, Datenträger nicht mehr lesbar. */
  verifiziert: boolean | null;
  werkzeug: string;
  ergebnis: LoeschErgebnis | null;
  /** Bei fehlgeschlagener Löschung oder Ausnahme: Hinweis oder Vernichtungsentscheidung. */
  bemerkung: string;
};

export type LoeschungDaten = {
  geraete: LoeschungGeraet[];
  unterzeichner: string;
  /** Zweite Person bei Fehlschlag, Ausnahme oder Vernichtung (Dok. 07, Abschnitt 6). */
  zweiter: string | null;
};

export function braucht2Personen(g: LoeschungGeraet): boolean {
  return g.ergebnis === 'fehlgeschlagen' || g.ergebnis === 'ausnahme';
}

export function pruefeLoeschung(d: LoeschungDaten): string[] {
  const fehler: string[] = [];
  if (d.geraete.length === 0) fehler.push('keine_geraete');
  for (const g of d.geraete) {
    if (!g.verfahren) fehler.push(`verfahren_${g.position}`);
    if (g.verifiziert === null) fehler.push(`verifiziert_${g.position}`);
    if (!g.werkzeug.trim()) fehler.push(`werkzeug_${g.position}`);
    if (!g.ergebnis) fehler.push(`ergebnis_${g.position}`);
    if (g.ergebnis === 'erfolgreich' && g.verifiziert === false) fehler.push(`erfolg_unverifiziert_${g.position}`);
    if (braucht2Personen(g) && !g.bemerkung.trim()) fehler.push(`bemerkung_${g.position}`);
  }
  if (!d.unterzeichner.trim()) fehler.push('unterzeichner');
  if (d.geraete.some(braucht2Personen)) {
    if (!d.zweiter) fehler.push('zweiter_fehlt');
    else if (d.zweiter.trim().toLowerCase() === d.unterzeichner.trim().toLowerCase()) fehler.push('zweiter_gleich');
  }
  return fehler;
}
