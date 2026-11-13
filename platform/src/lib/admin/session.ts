import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { getAppEnv } from '@/lib/env';
import { istAdminRolle, type Rolle } from './rollen';

export const SITZUNG_COOKIE = 'ww_admin_sitzung';

export type Nutzer = { email: string; rolle: Rolle };

/**
 * Local-only admin login for `next dev` with APP_ENV=test. Credentials come from .env.local
 * (DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD). Never active in a production build or on Vercel.
 */
// Random per dev-server start, so another machine on the LAN cannot guess it.
const devHalter = globalThis as unknown as { __wwDevToken?: string };
devHalter.__wwDevToken ??= randomBytes(24).toString('hex');
export const DEV_SITZUNG_TOKEN: string = devHalter.__wwDevToken;
export function lokalerDevAdminAktiv(): boolean {
  return process.env.NODE_ENV === 'development' && getAppEnv() === 'test';
}

/** Public Supabase settings (URL and anon key are public by design). */
export function supabaseOeffentlich(): { url: string; anon: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anon ? { url, anon } : null;
}

/** The signed-in admin user, or null. The token is checked with Supabase on every request. */
export async function aktuellerNutzer(): Promise<Nutzer | null> {
  if (lokalerDevAdminAktiv()) {
    const lokal = (await cookies()).get(SITZUNG_COOKIE)?.value;
    return lokal === DEV_SITZUNG_TOKEN ? { email: process.env.DEV_ADMIN_EMAIL ?? '', rolle: 'admin' } : null;
  }
  if (getAppEnv() === 'test') return null; // the test environment has no real accounts
  const jar = await cookies();
  const token = jar.get(SITZUNG_COOKIE)?.value;
  const sb = supabaseOeffentlich();
  if (!token || !sb) return null;

  const res = await fetch(`${sb.url}/auth/v1/user`, {
    headers: { apikey: sb.anon, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const user = (await res.json()) as { email?: string; app_metadata?: { role?: unknown } };
  const rolle = user.app_metadata?.role;
  if (!user.email || !istAdminRolle(rolle)) return null;
  return { email: user.email, rolle };
}
