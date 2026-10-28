'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAppEnv } from '@/lib/env';
import { SITZUNG_COOKIE, supabaseOeffentlich } from '@/lib/admin/session';

/** Signs in with e-mail and password. The Supabase token goes into an HTTP-only cookie limited to /admin. */
export async function anmelden(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim();
  const passwort = String(formData.get('passwort') ?? '');
  const sb = supabaseOeffentlich();
  if (getAppEnv() === 'test' || !sb || !email || !passwort) redirect('/admin/login?fehler=1');

  const res = await fetch(`${sb!.url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: sb!.anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: passwort }),
    cache: 'no-store',
  });
  if (!res.ok) redirect('/admin/login?fehler=1');

  const daten = (await res.json()) as { access_token: string; expires_in: number };
  const jar = await cookies();
  jar.set(SITZUNG_COOKIE, daten.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: daten.expires_in,
  });
  redirect('/admin');
}

export async function abmelden(): Promise<void> {
  const jar = await cookies();
  jar.delete({ name: SITZUNG_COOKIE, path: '/admin' });
  redirect('/admin/login');
}
