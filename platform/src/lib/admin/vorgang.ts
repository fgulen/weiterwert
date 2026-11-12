import { getAppEnv } from '@/lib/env';

/** WW-2026-123456: the number the donor receives. Anything else is refused before it reaches the database. */
export const VORGANGSNUMMER = /^WW-\d{4}-\d{6}$/;

export type KontaktDaten = { name: string; email: string; plz: string; telefon: string | null; organisation: string | null };

export type GeraetDaten = {
  position: number;
  typ: string;
  marke: string | null;
  modell: string | null;
  angaben: Record<string, string>;
  ergebnis: string;
  gruende: string[];
};

export type VorgangDaten = {
  id: string;
  vorgangsnummer: string;
  status: string;
  angelegt: string;
  regelVersion: string;
  erklaerungVersion: string;
  erklaerungHash: string;
  kontakt: KontaktDaten;
  geraete: GeraetDaten[];
};

/** One request with its contact and devices. Null when the number is unknown or the database is not configured. */
export async function ladeVorgang(nummer: string): Promise<VorgangDaten | null> {
  if (!VORGANGSNUMMER.test(nummer)) return null;
  if (getAppEnv() === 'test') return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;

  const select = [
    'id', 'vorgangsnummer', 'status', 'created_at', 'regel_version', 'erklaerung_version', 'erklaerung_hash',
    'contact(name,email,plz,telefon,organisation)',
    'donation_device(position,typ,marke,modell,angaben,ergebnis,gruende)',
  ].join(',');
  const res = await fetch(
    `${url}/rest/v1/donation_request?select=${select}&vorgangsnummer=eq.${nummer}&limit=1`,
    {
      headers: {
        apikey: key,
        // Same rule as speicher.ts: legacy service_role keys are also sent as bearer token; sb_secret_ keys are not.
        ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}),
      },
      cache: 'no-store',
    },
  );
  if (!res.ok) throw new Error(`Supabase Vorgang: ${res.status}`);
  const zeilen = (await res.json()) as Array<{
    id: string;
    vorgangsnummer: string;
    status: string;
    created_at: string;
    regel_version: string;
    erklaerung_version: string;
    erklaerung_hash: string;
    contact: KontaktDaten;
    donation_device: GeraetDaten[];
  }>;
  const z = zeilen[0];
  if (!z) return null;
  return {
    id: z.id,
    vorgangsnummer: z.vorgangsnummer,
    status: z.status,
    angelegt: z.created_at.slice(0, 10),
    regelVersion: z.regel_version,
    erklaerungVersion: z.erklaerung_version,
    erklaerungHash: z.erklaerung_hash,
    kontakt: z.contact,
    geraete: [...z.donation_device].sort((a, b) => a.position - b.position),
  };
}

/** Short result labels for the case sheet and the admin detail page. Unknown values stay as they are. */
export const ERGEBNIS_KURZ: Record<string, string> = {
  geeignet: 'Vorläufig geeignet',
  angaben: 'Weitere Angaben erforderlich',
  manuell: 'Manuelle Prüfung erforderlich',
  nichtGeeignet: 'Nach den veröffentlichten Kriterien voraussichtlich nicht geeignet',
};

/** Readable German labels for the stored reason and answer values. Unknown values stay as they are. */
const ANGABE_TEXT: Record<string, Record<string, string>> = {
  typ: { laptop: 'Laptop', chromebook: 'Chromebook', macbook: 'MacBook', android: 'Android-Tablet', ipad: 'iPad', unbekannt: 'unbekannt' },
  alter: { '0-3': '0–3 Jahre', '4-6': '4–6 Jahre', '7-9': '7–9 Jahre', '10+': '10 Jahre oder älter', unbekannt: 'unbekannt' },
  startet: { ja: 'ja', nein: 'nein', unbekannt: 'unbekannt' },
  display: { ok: 'ohne Schaden', schaden: 'Schaden', unbekannt: 'unbekannt' },
  akku: { ok: 'in Ordnung', schwach: 'schwach', gebläht: 'aufgebläht', unbekannt: 'unbekannt' },
  sperren: { keine: 'keine', konto: 'Konto-Sperre', firma: 'Firmen-Sperre', unbekannt: 'unbekannt' },
  eigentum: { ja: 'ja, eigenes Gerät', leasing: 'Leasing / Miete', unbekannt: 'unbekannt' },
  ram: { '8+': '8 GB oder mehr', '4': '4 bis 6 GB', unter4: 'weniger als 4 GB', unbekannt: 'unbekannt' },
};

const ANGABE_LABEL: Record<string, string> = {
  typ: 'Gerätetyp',
  alter: 'Alter',
  startet: 'Startet',
  display: 'Display',
  akku: 'Akku',
  sperren: 'Sperren',
  eigentum: 'Eigentum',
  ram: 'Arbeitsspeicher',
};

export const ANGABE_REIHENFOLGE = ['typ', 'alter', 'startet', 'display', 'akku', 'sperren', 'eigentum', 'ram'] as const;

export function angabeText(feld: string, wert: string): string {
  return ANGABE_TEXT[feld]?.[wert] ?? wert;
}

export function angabeLabel(feld: string): string {
  return ANGABE_LABEL[feld] ?? feld;
}
