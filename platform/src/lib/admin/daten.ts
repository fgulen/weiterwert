import { getAppEnv } from '@/lib/env';

export type AnfrageZeile = {
  vorgangsnummer: string;
  status: string;
  angelegt: string;
  geraete: string[];
};

/** Read-only list of incoming donations for the admin list. Only fields needed for matching; no names, e-mails or addresses. */
export async function ladeSpendenListe(): Promise<AnfrageZeile[]> {
  if (getAppEnv() === 'test') return [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return [];

  const select = 'vorgangsnummer,status,created_at,donation_device(typ)';
  const res = await fetch(`${url}/rest/v1/donation_request?select=${select}&order=created_at.desc&limit=200`, {
    headers: {
      apikey: key,
      // Same rule as speicher.ts: legacy service_role keys are also sent as bearer token; sb_secret_ keys are not.
      ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Supabase Liste: ${res.status}`);
  const zeilen = (await res.json()) as Array<{
    vorgangsnummer: string;
    status: string;
    created_at: string;
    donation_device: Array<{ typ: string }>;
  }>;
  return zeilen.map((z) => ({
    vorgangsnummer: z.vorgangsnummer,
    status: z.status,
    angelegt: z.created_at.slice(0, 10),
    geraete: z.donation_device.map((d) => d.typ),
  }));
}
