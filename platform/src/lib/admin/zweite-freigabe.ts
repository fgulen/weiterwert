import 'server-only';
import { supabaseOeffentlich } from './session';
import type { ZweiteFreigabeGrund } from './zweite-freigabe-regel';

export { zweiteFreigabeOk } from './zweite-freigabe-regel';
export type { ZweiteFreigabeGrund } from './zweite-freigabe-regel';

/**
 * Zweite Freigabe (Punkt 13, Methode a): Der zweite Admin meldet sich mit seiner eigenen
 * E-Mail und seinem Passwort an. Das Ergebnis wird nur geprüft. Es wird KEIN Sitzungs-Cookie
 * gesetzt, damit die Sitzung des ersten Admins bestehen bleibt.
 */
export async function bestaetigeZweiteAnmeldung(
  email: string,
  passwort: string,
): Promise<{ email: string; rolle: string | undefined } | { grund: ZweiteFreigabeGrund }> {
  const sb = supabaseOeffentlich();
  if (!sb) return { grund: 'nicht_konfiguriert' };
  const res = await fetch(`${sb.url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: sb.anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: passwort }),
    cache: 'no-store',
  });
  if (!res.ok) return { grund: 'anmeldung_fehlgeschlagen' };
  const daten = (await res.json()) as { user?: { email?: string; app_metadata?: { role?: string } } };
  // Das Zugangs-Token wird absichtlich verworfen: es wird nie gespeichert.
  return { email: daten.user?.email ?? email, rolle: daten.user?.app_metadata?.role };
}
