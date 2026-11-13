'use server';

import { getAppEnv } from '@/lib/env';
import { supabaseOeffentlich } from '@/lib/admin/session';
import { PASSWORT_MAX, PASSWORT_MIN, pruefeStaerke } from '@/lib/admin/profil';
import { aktuelleSprache } from '@/lib/i18n/server';
import { adminTexte, mit } from '@/lib/i18n/admin';

export type NeuErgebnis = { ok?: boolean; fehler?: string };

/** Sets a new password with the recovery token from the mail link. The token is only used for this one request. */
export async function neuesPasswort(token: string, neu: string, wiederholung: string): Promise<NeuErgebnis> {
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  if (!token || token.length > 4000) return { fehler: t.reset.linkUngueltig };
  const staerke = pruefeStaerke(neu);
  if (staerke) {
    const n = staerke === 'zu-lang' ? PASSWORT_MAX : PASSWORT_MIN;
    return { fehler: mit(t.konto.pwFehler[staerke], { n }) };
  }
  if (neu !== wiederholung) return { fehler: t.reset.ungleich };

  const sb = supabaseOeffentlich();
  if (getAppEnv() === 'test' || !sb) return { fehler: t.reset.nichtVerfuegbar };

  const res = await fetch(`${sb.url}/auth/v1/user`, {
    method: 'PUT',
    headers: { apikey: sb.anon, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: neu }),
    cache: 'no-store',
  });
  if (!res.ok) return { fehler: t.reset.linkUngueltig };
  return { ok: true };
}
