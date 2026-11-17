// Rollen des Admin-Bereichs. Die Rolle steht in app_metadata und wird nur serverseitig gelesen (siehe docs/admin-mfa-plan.md).
export const ROLLEN = ['admin', 'mitarbeiter', 'technik'] as const;
export type Rolle = (typeof ROLLEN)[number];

export function istAdminRolle(wert: unknown): wert is Rolle {
  return typeof wert === 'string' && (ROLLEN as readonly string[]).includes(wert);
}

/** Ablaufschritte, die ein Vorgang durchläuft (wie in der Schrittleiste). */
export type Schritt = 'eingang' | 'zweite' | 'annahme' | 'loeschung' | 'technik' | 'uebergabe' | 'abschluss';

/**
 * Wer darf welchen Schritt ausführen. Admin darf alles.
 * Mitarbeiter: Annahme und Übergabe, Zweite Kontrolle. Technik: Löschung und technische Prüfung.
 * Die Zwei-Personen-Freigabe (Dok. 07) bleibt beim Schritt Löschung und ist zusätzlich geprüft.
 */
const ERLAUBT: Record<Rolle, readonly Schritt[]> = {
  admin: ['eingang', 'zweite', 'annahme', 'loeschung', 'technik', 'uebergabe', 'abschluss'],
  mitarbeiter: ['eingang', 'zweite', 'annahme', 'uebergabe', 'abschluss'],
  technik: ['loeschung', 'technik'],
};

export function schrittErlaubt(rolle: unknown, schritt: Schritt): boolean {
  return istAdminRolle(rolle) && ERLAUBT[rolle].includes(schritt);
}

/** Der Schritt, zu dem ein Gerätestatus gehört (für Berechtigung der Status-Buttons). */
export function schrittFuerStatus(nach: string): Schritt {
  switch (nach) {
    case 'zweite_kontrolle':
    case 'quarantaene':
      return 'zweite';
    case 'loeschung_offen':
    case 'geloescht':
      return 'loeschung';
    case 'uebergeben':
    case 'rueckgabe':
      return 'uebergabe';
    default:
      return 'technik';
  }
}
