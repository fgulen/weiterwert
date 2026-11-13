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

  const kopf = { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) };
  const abfrage = (select: string) =>
    fetch(`${url}/rest/v1/donation_request?select=${select}&order=created_at.desc&limit=200`, { headers: kopf, cache: 'no-store' });
  // Until the donation_photo migration has run, the photo join fails: then the list still loads, without photo counts.
  let res = await abfrage('vorgangsnummer,status,created_at,donation_device(typ,marke,modell),donation_photo(id)');
  let mitFotos = true;
  if (!res.ok) {
    res = await abfrage('vorgangsnummer,status,created_at,donation_device(typ,marke,modell)');
    mitFotos = false;
  }
  if (!res.ok) throw new Error(`Supabase Liste: ${res.status}`);
  const zeilen = (await res.json()) as Array<{
    vorgangsnummer: string;
    status: string;
    created_at: string;
    donation_device: ListenGeraet[];
    donation_photo?: Array<{ id: string }>;
  }>;
  return zeilen.map((z) => ({
    vorgangsnummer: z.vorgangsnummer,
    status: z.status,
    angelegt: z.created_at,
    fotos: mitFotos ? (z.donation_photo?.length ?? 0) : 0,
    geraete: z.donation_device,
  }));
}
