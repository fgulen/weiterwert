// Fortschritt eines Vorgangs und je Gerät, aus den Gerätestatus abgeleitet. Rein, testbar.
// Ein Schritt gilt als erledigt, wenn alle Geräte ihn passiert haben (Abzweige Quarantäne und Rückgabe zählen als erledigt).

export type FortschrittStatus = 'erledigt' | 'aktiv' | 'offen';

const NACH_ZWEITE = ['loeschung_offen', 'quarantaene', 'geloescht', 'technische_pruefung', 'reparatur', 'frei', 'reserviert', 'uebergeben', 'rueckgabe', 'entsorgt'];
const NACH_LOESCHUNG = ['geloescht', 'technische_pruefung', 'reparatur', 'frei', 'reserviert', 'uebergeben', 'rueckgabe', 'entsorgt'];
const NACH_TECHNIK = ['frei', 'reserviert', 'uebergeben', 'rueckgabe', 'entsorgt'];
const NACH_UEBERGABE = ['uebergeben', 'rueckgabe', 'entsorgt'];

export const SCHRITT_IDS = ['eingang', 'zweite', 'annahme', 'loeschung', 'technik', 'uebergabe', 'abschluss'] as const;
export type SchrittId = (typeof SCHRITT_IDS)[number];

/** Hat ein einzelnes Gerät einen Schritt passiert? (annahme ist Vorgangssache, nicht Gerätesache.) */
export function geraetHatSchritt(status: string, schritt: SchrittId): boolean {
  switch (schritt) {
    case 'eingang': return status !== 'eingegangen';
    case 'zweite': return NACH_ZWEITE.includes(status);
    case 'loeschung': return NACH_LOESCHUNG.includes(status);
    case 'technik': return NACH_TECHNIK.includes(status);
    case 'uebergabe': return NACH_UEBERGABE.includes(status);
    default: return false;
  }
}

/** Der aktuelle Schritt eines Geräts: der erste, den es noch nicht passiert hat. */
export function geraetAktuellerSchritt(status: string): SchrittId {
  for (const s of ['zweite', 'loeschung', 'technik', 'uebergabe'] as const) {
    if (!geraetHatSchritt(status, s)) return s;
  }
  return 'abschluss';
}

/**
 * Status je Schritt für den ganzen Vorgang.
 * annahmeVorhanden: ob ein Annahme-Protokoll gespeichert ist.
 * Eingang gilt als erledigt, sobald die Annahme vorliegt oder ein Gerät nicht mehr "eingegangen" ist.
 */
export function vorgangFortschritt(geraeteStatus: string[], annahmeVorhanden: boolean): Record<SchrittId, FortschrittStatus> {
  const alleGeraete = (s: SchrittId) => geraeteStatus.length > 0 && geraeteStatus.every((g) => geraetHatSchritt(g, s));
  const erledigt: Record<SchrittId, boolean> = {
    eingang: annahmeVorhanden || geraeteStatus.length > 0,
    zweite: alleGeraete('zweite'),
    annahme: annahmeVorhanden,
    loeschung: alleGeraete('loeschung'),
    technik: alleGeraete('technik'),
    uebergabe: alleGeraete('uebergabe'),
    abschluss: geraeteStatus.length > 0 && geraeteStatus.every((g) => ['uebergeben', 'rueckgabe', 'entsorgt'].includes(g)),
  };
  const ergebnis = {} as Record<SchrittId, FortschrittStatus>;
  let aktivGesetzt = false;
  for (const s of SCHRITT_IDS) {
    if (erledigt[s]) ergebnis[s] = 'erledigt';
    else if (!aktivGesetzt) { ergebnis[s] = 'aktiv'; aktivGesetzt = true; }
    else ergebnis[s] = 'offen';
  }
  return ergebnis;
}
