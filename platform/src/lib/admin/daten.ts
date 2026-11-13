import { getAppEnv } from '@/lib/env';
import { devEintraege } from '@/lib/dev/vorschau';

export type ListenGeraet = { typ: string; marke: string | null; modell: string | null };

export type AnfrageZeile = {
  vorgangsnummer: string;
  status: string;
  angelegt: string;
  fotos: number;
  geraete: ListenGeraet[];
};

/** Read-only list of incoming donations for the admin list. Only fields needed for matching; no names, e-mails or addresses. */
export async function ladeSpendenListe(): Promise<AnfrageZeile[]> {
  if (getAppEnv() === 'test') {
    // Dev preview only (next dev): requests sent in this session. Empty everywhere else.
    return devEintraege().map((e) => ({
      vorgangsnummer: e.vorgangsnummer,
      status: 'neu',
      angelegt: e.angelegt,
      fotos: e.fotos.length,
      geraete: ((e.payload.geraete as Array<Record<string, unknown>>) ?? []).map((g) => ({
        typ: String(g.typ),
        marke: (g.marke as string | null) ?? null,
        modell: (g.modell as string | null) ?? null,
      })),
    }));
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return [];

  const select = 'vorgangsnummer,status,created_at,donation_device(typ,marke,modell),donation_photo(id)';
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
    donation_device: ListenGeraet[];
    donation_photo: Array<{ id: string }>;
  }>;
  return zeilen.map((z) => ({
    vorgangsnummer: z.vorgangsnummer,
    status: z.status,
    angelegt: z.created_at,
    fotos: z.donation_photo.length,
    geraete: z.donation_device,
  }));
}
