// Pure validation helpers for the admin profile page (password change, TOTP).
export const PASSWORT_MIN = 12;
export const PASSWORT_MAX = 72; // bcrypt limit used by Supabase

export type PruefFehler = 'leer' | 'zu-kurz' | 'zu-lang' | 'ungleich' | 'gleich' | 'code';

/** Checks the password-change form. Returns an error key or null. */
export function pruefePasswortWechsel(aktuell: string, neu: string, wiederholung: string): PruefFehler | null {
  if (!aktuell || !neu) return 'leer';
  if (neu.length < PASSWORT_MIN) return 'zu-kurz';
  if (neu.length > PASSWORT_MAX) return 'zu-lang';
  if (neu !== wiederholung) return 'ungleich';
  if (neu === aktuell) return 'gleich';
  return null;
}

/** A TOTP code is exactly 6 digits (spaces typed by the user are ignored). */
export function normalisiereCode(roh: string): string | null {
  const c = roh.replace(/\s+/g, '');
  return /^\d{6}$/.test(c) ? c : null;
}

/** Only accept the SVG data URL that Supabase returns for the QR code. */
export function sicheresQr(qr: unknown): string | null {
  return typeof qr === 'string' && /^data:image\/svg\+xml/i.test(qr) ? qr : null;
}

export const FEHLER_TEXT: Record<PruefFehler, string> = {
  leer: 'Bitte alle Felder ausfüllen.',
  'zu-kurz': `Das neue Passwort muss mindestens ${PASSWORT_MIN} Zeichen haben.`,
  'zu-lang': `Das neue Passwort darf höchstens ${PASSWORT_MAX} Zeichen haben.`,
  ungleich: 'Die beiden neuen Passwörter stimmen nicht überein.',
  gleich: 'Das neue Passwort muss sich vom alten unterscheiden.',
  code: 'Der Code ist nicht richtig. Bitte einen 6-stelligen Code eingeben.',
};
