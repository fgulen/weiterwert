'use server';

import { headers } from 'next/headers';
import { getAppEnv } from '@/lib/env';
import { supabaseOeffentlich } from '@/lib/admin/session';

export type ResetErgebnis = { gesendet?: boolean; fehler?: string };

/** Asks Supabase to mail a reset link. The answer is the same whether or not the address exists. */
export async function resetAnfordern(_v: ResetErgebnis, fd: FormData): Promise<ResetErgebnis> {
  const email = String(fd.get('email') ?? '').trim();
  if (!email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { fehler: 'Bitte eine gültige E-Mail-Adresse eingeben.' };
  }
  const sb = supabaseOeffentlich();
  if (getAppEnv() === 'test' || !sb) return { gesendet: true };

  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const weiterleitung = `${proto}://${host}/admin/passwort-neu`;

  // Errors are not shown: the donor-facing text must not reveal whether the account exists.
  await fetch(`${sb.url}/auth/v1/recover?redirect_to=${encodeURIComponent(weiterleitung)}`, {
    method: 'POST',
    headers: { apikey: sb.anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    cache: 'no-store',
  }).catch(() => undefined);
  return { gesendet: true };
}
