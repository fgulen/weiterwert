// Digitale Annahme nach Dok. 18: Checkliste, Zustand je Gerät, Entscheidung und Unterschrift.
// Reine Regeln und Hash-Kette, ohne Serverzugriff, testbar.
import { createHash } from 'node:crypto';

export const SICHERHEITS_PUNKTE = 7;
export type Zustand = 'gut' | 'spuren' | 'defekt';
export type Datentraeger = 'ja' | 'nein' | 'unklar';
export type Entscheidung = 'vollstaendig' | 'teilweise' | 'ablehnung';

export type AnnahmeGeraet = { position: number; zustand: Zustand | null; datentraeger: Datentraeger | null };

export type AnnahmeDaten = {
  geraete: AnnahmeGeraet[];
  /** true = Ja, false = Nein / n. a., null = nicht beantwortet. */
  sicherheit: Array<boolean | null>;
  entscheidung: Entscheidung | null;
  grund: string;
  unterzeichner: string;
  /** PNG als Data-URL der handschriftlichen Zeichnung. */
  unterschrift: string;
};

/** Echte PNG-Unterschrift als Data-URL, mit Größenlimit (Review-Befund: ungeprüfte Bytes ließen das PDF abbrechen). */
export function istPngUnterschrift(s: string): boolean {
  if (!s.startsWith('data:image/png;base64,') || s.length > 400_000) return false;
  const bytes = Buffer.from(s.slice('data:image/png;base64,'.length), 'base64');
  return bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}

/** Liste der Fehler. Leer = gültig. Die Texte sind Schlüssel für die Anzeige. */
export function pruefeAnnahme(d: AnnahmeDaten): string[] {
  const fehler: string[] = [];
  if (d.geraete.length === 0) fehler.push('keine_geraete');
  for (const g of d.geraete) {
    if (!g.zustand) fehler.push(`zustand_${g.position}`);
    if (!g.datentraeger) fehler.push(`datentraeger_${g.position}`);
  }
  if (d.sicherheit.length !== SICHERHEITS_PUNKTE || d.sicherheit.some((v) => v === null)) fehler.push('sicherheit');
  if (!d.entscheidung) fehler.push('entscheidung');
  if (d.entscheidung === 'ablehnung' && !d.grund.trim()) fehler.push('grund');
  if (d.entscheidung === 'teilweise' && !d.grund.trim()) fehler.push('grund');
  if (!d.unterzeichner.trim()) fehler.push('unterzeichner');
  if (!istPngUnterschrift(d.unterschrift)) fehler.push('unterschrift');
  return fehler;
}

/**
 * Hash-Kette: jeder Eintrag enthält den Hash des vorherigen. Eine Änderung eines alten
 * Eintrags würde alle folgenden Hashes verändern und fällt so auf.
 */
export function kettenHash(prevHash: string | null, daten: unknown, zeit: string, nutzer: string): string {
  return createHash('sha256')
    .update(`${prevHash ?? 'start'}|${JSON.stringify(daten)}|${zeit}|${nutzer}`)
    .digest('hex');
}
