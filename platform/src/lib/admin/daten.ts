import { ersterDatensatz } from './embed';
import { getAppEnv } from '@/lib/env';
import type { VorgangDaten } from './vorgang';
import { devEintraege } from '@/lib/dev/vorschau';

export type ListenGeraet = { typ: string; marke: string | null; modell: string | null };

export type AnfrageZeile = {
  vorgangsnummer: string;
  status: string;
  angelegt: string;
  fotos: number;
  geraete: ListenGeraet[];
  /** Je Gerät der Ablaufstatus, null wenn noch kein Gerätedatensatz. */
  geraeteStatus: (string | null)[];
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
      geraeteStatus: [],
    }));
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return [];

  const kopf = { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) };
  const abfrage = (select: string) =>
    fetch(`${url}/rest/v1/donation_request?select=${select}&order=created_at.desc&limit=200`, { headers: kopf, cache: 'no-store' });
  // Until the donation_photo migration has run, the photo join fails: then the list still loads, without photo counts.
  let res = await abfrage('vorgangsnummer,status,created_at,donation_device(typ,marke,modell,device_record(ablauf_status)),donation_photo(id)');
  let mitFotos = true;
  let mitGeraeteStand = true;
  if (res.status === 400) {
    // Only a bad request (missing photo table) falls back; other errors must not show 0 photos silently.
    // Ohne device_record: Liste lädt auch vor der Ablauf-Migration (Gerätestand dann nicht verfügbar).
    res = await abfrage('vorgangsnummer,status,created_at,donation_device(typ,marke,modell)');
    mitFotos = false;
    mitGeraeteStand = false;
  }
  if (!res.ok) throw new Error(`Supabase Liste: ${res.status}`);
  const zeilen = (await res.json()) as Array<{
    vorgangsnummer: string;
    status: string;
    created_at: string;
    donation_device: Array<ListenGeraet & { device_record?: Array<{ ablauf_status: string }> | { ablauf_status: string } | null }>;
    donation_photo?: Array<{ id: string }>;
  }>;
  return zeilen.map((z) => ({
    vorgangsnummer: z.vorgangsnummer,
    status: z.status,
    angelegt: z.created_at,
    fotos: mitFotos ? (z.donation_photo?.length ?? 0) : 0,
    geraete: z.donation_device.map(({ typ, marke, modell }) => ({ typ, marke, modell })),
    geraeteStatus: z.donation_device.map((g) => (mitGeraeteStand ? ersterDatensatz(g.device_record)?.ablauf_status ?? null : null)),
  }));
}

/** Every request with its devices and device records (for the inventory). Newest first, at most 200. */
export async function ladeAlleVorgaenge(): Promise<VorgangDaten[]> {
  const { ladeVorgang } = await import('./vorgang');
  const liste = await ladeSpendenListe();
  const ergebnisse = await Promise.all(liste.slice(0, 200).map((z) => ladeVorgang(z.vorgangsnummer).catch(() => null)));
  return ergebnisse.filter((v): v is VorgangDaten => v !== null);
}
