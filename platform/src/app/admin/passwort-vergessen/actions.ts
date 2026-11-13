'use server';

import { headers } from 'next/headers';
import { getAppEnv } from '@/lib/env';
import { supabaseOeffentlich } from '@/lib/admin/session';
import { aktuelleSprache } from '@/lib/i18n/server';
import { adminTexte } from '@/lib/i18n/admin';

export type ResetErgebnis = { gesendet?: boolean; fehler?: string };

/** Asks Supabase to mail a reset link. The answer is the same whether or not the address exists. */
export async function resetAnfordern(_v: ResetErgebnis, fd: FormData): Promise<ResetErgebnis> {
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  const email = String(fd.get('email') ?? '').trim();
  if (!email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { fehler: t.reset.emailUngueltig };
  }
  const sb = supabaseOeffentlich();
  if (getAppEnv() === 'test' || !sb) return { gesendet: true };

  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  // The link leads back in the language the user asked in (German has no prefix).
  const pfad = lang === 'de' ? '/admin/passwort-neu' : `/${lang}/admin/passwort-neu`;
  const weiterleitung = `${proto}://${host}${pfad}`;

  // Errors are not shown: the text must not reveal whether the account exists.
  await fetch(`${sb.url}/auth/v1/recover?redirect_to=${encodeURIComponent(weiterleitung)}`, {
    method: 'POST',
    headers: { apikey: sb.anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    cache: 'no-store',
  }).catch(() => undefined);
  return { gesendet: true };
}
