// Rollen des Admin-Bereichs. Die Rolle steht in app_metadata und wird nur serverseitig gelesen (siehe docs/admin-mfa-plan.md).
export const ROLLEN = ['admin', 'mitarbeiter', 'technik'] as const;
export type Rolle = (typeof ROLLEN)[number];

export function istAdminRolle(wert: unknown): wert is Rolle {
  return typeof wert === 'string' && (ROLLEN as readonly string[]).includes(wert);
}

/** Zielstatus, die ein eigenes Formular haben. Sie dürfen nicht über die Status-Buttons gesetzt werden. */
export const FORMULAR_ZIELE: readonly string[] = ['zweite_kontrolle', 'quarantaene', 'loeschung_offen', 'geloescht', 'uebergeben'];

/** Schritte eines Geräts (Schrittleiste plus Freigabe, Rückgabe). */
export type Schritt =
  | 'eingang' | 'zweite' | 'annahme' | 'loeschung' | 'technik'
  | 'freigabe' | 'uebergabe' | 'rueckgabe' | 'abschluss' | 'unbekannt';

/**
 * Wer darf welchen Schritt ausführen. Entspricht der Spalte "wer" in geraet-prozess.ts (Gesamtprozess).
 * Admin darf alles. Technik: Eingang, Löschung, technische Prüfung, Übergabe (Mitwirkung), Entsorgung über "technik".
 * Mitarbeiter: Annahme und Übergabe am Schalter; keine Freigabe, keine Zweite Kontrolle, keine Rückgabe, kein Abschluss.
 * Die Zwei-Personen-Freigabe (Dok. 07) bleibt bei der Löschung und ist zusätzlich geprüft.
 */
const ERLAUBT: Record<Rolle, readonly Schritt[]> = {
  admin: ['eingang', 'zweite', 'annahme', 'loeschung', 'technik', 'freigabe', 'uebergabe', 'rueckgabe', 'abschluss'],
  technik: ['eingang', 'loeschung', 'technik', 'uebergabe'],
  mitarbeiter: ['annahme', 'uebergabe'],
};

export function schrittErlaubt(rolle: unknown, schritt: Schritt): boolean {
  return istAdminRolle(rolle) && ERLAUBT[rolle].includes(schritt);
}

/** Der Schritt, zu dem ein Gerätestatus als Ziel gehört (bestimmt, wer den Button drücken darf). */
export function schrittFuerStatus(nach: string): Schritt {
  switch (nach) {
    case 'zweite_kontrolle':
    case 'quarantaene':
      return 'zweite';
    case 'loeschung_offen':
    case 'geloescht':
      return 'loeschung';
    case 'frei':
    case 'reserviert':
      return 'freigabe';
    case 'uebergeben':
      return 'uebergabe';
    case 'rueckgabe':
      return 'rueckgabe';
    case 'reparatur':
    case 'technische_pruefung':
    case 'entsorgt':
      return 'technik';
    default: // unbekannter Status: nur admin (fail-closed)
      return 'unbekannt';
  }
}
