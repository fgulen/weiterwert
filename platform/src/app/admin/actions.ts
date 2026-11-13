'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { aktuelleSprache } from '@/lib/i18n/server';
import { pfadFuer } from '@/lib/i18n/sprache';
import { getAppEnv } from '@/lib/env';
import { DEV_SITZUNG_TOKEN, SITZUNG_COOKIE, lokalerDevAdminAktiv, supabaseOeffentlich } from '@/lib/admin/session';

/** Signs in with e-mail and password. The Supabase token goes into an HTTP-only cookie limited to /admin. */
export async function anmelden(formData: FormData): Promise<void> {
  const { lang } = await aktuelleSprache();
  const email = String(formData.get('email') ?? '').trim();
  const passwort = String(formData.get('passwort') ?? '');
  const sb = supabaseOeffentlich();
  const zurueck = `${pfadFuer(lang, '/admin/login')}?fehler=1&email=${encodeURIComponent(email.slice(0, 200))}`;
  if (lokalerDevAdminAktiv() && email && passwort && email === process.env.DEV_ADMIN_EMAIL && passwort === process.env.DEV_ADMIN_PASSWORD) {
    (await cookies()).set(SITZUNG_COOKIE, DEV_SITZUNG_TOKEN, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
    redirect(pfadFuer(lang, '/admin'));
  }
  if (getAppEnv() === 'test' || !sb || !email || !passwort) redirect(zurueck);

  const res = await fetch(`${sb!.url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: sb!.anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: passwort }),
    cache: 'no-store',
  });
  if (!res.ok) redirect(zurueck);

  const daten = (await res.json()) as { access_token: string; expires_in: number };
  const jar = await cookies();
  jar.set(SITZUNG_COOKIE, daten.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: daten.expires_in,
  });
  redirect(pfadFuer(lang, '/admin'));
}

export async function abmelden(): Promise<void> {
  const { lang } = await aktuelleSprache();
  const jar = await cookies();
  jar.delete({ name: SITZUNG_COOKIE, path: '/' });
  jar.delete({ name: SITZUNG_COOKIE, path: '/admin' }); // cookie set before the path change
  redirect(pfadFuer(lang, '/admin/login'));
}
