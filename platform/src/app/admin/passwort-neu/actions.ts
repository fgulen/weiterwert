'use server';

import { getAppEnv } from '@/lib/env';
import { supabaseOeffentlich } from '@/lib/admin/session';
import { FEHLER_TEXT, pruefeStaerke } from '@/lib/admin/profil';

export type NeuErgebnis = { ok?: boolean; fehler?: string };

/** Sets a new password with the recovery token from the mail link. The token is only used for this one request. */
export async function neuesPasswort(token: string, neu: string, wiederholung: string): Promise<NeuErgebnis> {
  if (!token || token.length > 4000) return { fehler: 'Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.' };
  const staerke = pruefeStaerke(neu);
  if (staerke) return { fehler: FEHLER_TEXT[staerke] };
  if (neu !== wiederholung) return { fehler: 'Die beiden Passwörter stimmen nicht überein.' };

  const sb = supabaseOeffentlich();
  if (getAppEnv() === 'test' || !sb) return { fehler: 'Diese Funktion ist hier nicht verfügbar.' };

  const res = await fetch(`${sb.url}/auth/v1/user`, {
    method: 'PUT',
    headers: { apikey: sb.anon, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: neu }),
    cache: 'no-store',
  });
  if (!res.ok) return { fehler: 'Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.' };
  return { ok: true };
}
