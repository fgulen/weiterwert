import { supabaseOeffentlich } from './session';

// Server-only calls to the Supabase Auth REST API for the signed-in user's own account.
// The user token comes from the HTTP-only cookie; the service key is never used here.

export type Faktor = { id: string; status: 'verified' | 'unverified'; name: string };
export type Konto = { email: string; faktoren: Faktor[] };
export type Einrichtung = { faktorId: string; qr: string | null; secret: string; uri: string };

type Sb = { url: string; anon: string };

async function anfrage(sb: Sb, token: string, pfad: string, methode: string, body?: unknown): Promise<Response> {
  return fetch(`${sb.url}/auth/v1${pfad}`, {
    method: methode,
    headers: { apikey: sb.anon, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
}

export async function ladeKonto(token: string): Promise<Konto | null> {
  const sb = supabaseOeffentlich();
  if (!sb) return null;
  const res = await anfrage(sb, token, '/user', 'GET');
  if (!res.ok) return null;
  const u = (await res.json()) as { email?: string; factors?: { id: string; status: string; friendly_name?: string; factor_type?: string }[] };
  if (!u.email) return null;
  const faktoren = (u.factors ?? [])
    .filter((f) => f.factor_type === 'totp' || f.factor_type === undefined)
    .map((f) => ({ id: f.id, status: f.status === 'verified' ? ('verified' as const) : ('unverified' as const), name: f.friendly_name ?? 'Authenticator' }));
  return { email: u.email, faktoren };
}

/** Re-verifies the current password by signing in again. Returns the fresh token or null. */
export async function pruefePasswort(email: string, passwort: string): Promise<string | null> {
  const sb = supabaseOeffentlich();
  if (!sb) return null;
  const res = await fetch(`${sb.url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: sb.anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: passwort }),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return ((await res.json()) as { access_token?: string }).access_token ?? null;
}

/** Challenge + verify a TOTP code. Returns a session (aal2) or null. */
export async function pruefeCode(token: string, faktorId: string, code: string): Promise<{ token: string; laufzeit: number } | null> {
  const sb = supabaseOeffentlich();
  if (!sb) return null;
  const f = encodeURIComponent(faktorId);
  const ch = await anfrage(sb, token, `/factors/${f}/challenge`, 'POST', {});
  if (!ch.ok) return null;
  const { id } = (await ch.json()) as { id?: string };
  if (!id) return null;
  const v = await anfrage(sb, token, `/factors/${f}/verify`, 'POST', { challenge_id: id, code });
  if (!v.ok) return null;
  const d = (await v.json()) as { access_token?: string; expires_in?: number };
  return d.access_token ? { token: d.access_token, laufzeit: d.expires_in ?? 3600 } : null;
}

export async function starteEinrichtung(token: string, name: string): Promise<Einrichtung | null> {
  const sb = supabaseOeffentlich();
  if (!sb) return null;
  const res = await anfrage(sb, token, '/factors', 'POST', { factor_type: 'totp', friendly_name: name, issuer: 'WeiterWert' });
  if (!res.ok) return null;
  const d = (await res.json()) as { id?: string; totp?: { qr_code?: string; secret?: string; uri?: string } };
  if (!d.id || !d.totp?.secret || !d.totp.uri) return null;
  return { faktorId: d.id, qr: d.totp.qr_code ?? null, secret: d.totp.secret, uri: d.totp.uri };
}

export async function entferneFaktor(token: string, faktorId: string): Promise<boolean> {
  const sb = supabaseOeffentlich();
  if (!sb) return false;
  return (await anfrage(sb, token, `/factors/${encodeURIComponent(faktorId)}`, 'DELETE')).ok;
}

export async function setzePasswort(token: string, neu: string): Promise<boolean> {
  const sb = supabaseOeffentlich();
  if (!sb) return false;
  return (await anfrage(sb, token, '/user', 'PUT', { password: neu })).ok;
}
