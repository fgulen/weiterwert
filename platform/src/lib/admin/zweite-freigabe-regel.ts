// Reine Regel für die zweite Freigabe (Punkt 13). Ohne Serverzugriff, damit sie testbar ist.

export type ZweiteFreigabeGrund = 'gleiche_person' | 'keine_berechtigung' | 'anmeldung_fehlgeschlagen' | 'nicht_konfiguriert';

/** Zwei verschiedene Personen, und die zweite hat eine Admin- oder Mitarbeiter-Rolle. */
export function zweiteFreigabeOk(
  erster: string,
  zweiter: string,
  zweiterRolle: string | undefined,
): { ok: true } | { ok: false; grund: ZweiteFreigabeGrund } {
  if (erster.trim().toLowerCase() === zweiter.trim().toLowerCase()) return { ok: false, grund: 'gleiche_person' };
  if (zweiterRolle !== 'admin' && zweiterRolle !== 'mitarbeiter') return { ok: false, grund: 'keine_berechtigung' };
  return { ok: true };
}
