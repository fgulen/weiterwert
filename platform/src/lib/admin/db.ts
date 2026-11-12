import 'server-only';
import { getAppEnv } from '@/lib/env';

/** Server-only access to the Supabase REST API with the secret key. Never imported by client code. */
export function datenbankKonfiguriert(): { url: string; key: string } | null {
  if (getAppEnv() === 'test') return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  return url && key ? { url, key } : null;
}

export function dbKopfzeilen(key: string, extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: key,
    // Same rule as speicher.ts: legacy service_role keys are also sent as bearer token; sb_secret_ keys are not.
    ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}),
    ...extra,
  };
}
