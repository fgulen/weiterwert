import { adminTexte } from '@/lib/i18n/admin';
import type { Lang } from '@/lib/i18n/sprache';
import { getAppEnv } from '@/lib/env';
import { devEintrag } from '@/lib/dev/vorschau';

/** WW-2026-123456: the number the donor receives. Anything else is refused before it reaches the database. */
export const VORGANGSNUMMER = /^WW-\d{4}-\d{6}$/;

export type KontaktDaten = { name: string; email: string; plz: string; telefon: string | null; organisation: string | null };

import { LEER_AKTE, type GeraetAkte } from './akte';

export type GeraetDaten = {
  id: string;
  akte: GeraetAkte;
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
  /** Contact row id (needed to correct the contact). Dev preview uses "dev". */
  kontaktId: string;
  kontakt: KontaktDaten;
  geraete: GeraetDaten[];
};

/** One request with its contact and devices. Null when the number is unknown or the database is not configured. */
export async function ladeVorgang(nummer: string): Promise<VorgangDaten | null> {
  if (!VORGANGSNUMMER.test(nummer)) return null;
  if (getAppEnv() === 'test') {
    // Dev preview only (next dev): the request as it was sent in this session.
    const e = devEintrag(nummer);
    if (!e) return null;
    const p = e.payload as { idempotency_key: string; kontakt: KontaktDaten; geraete: Array<Record<string, unknown>>; regel_version: string; erklaerung_version: string; erklaerung_hash: string };
    return {
      id: String(p.idempotency_key),
      vorgangsnummer: nummer,
      status: 'neu',
      angelegt: e.angelegt,
      regelVersion: p.regel_version,
      erklaerungVersion: p.erklaerung_version,
      erklaerungHash: p.erklaerung_hash,
      kontaktId: "dev",
      kontakt: p.kontakt,
      geraete: p.geraete.map((g, i) => ({
        id: `dev-${i + 1}`,
        akte: { ...LEER_AKTE, ...((g.akte as Partial<GeraetAkte>) ?? {}) },
        position: i + 1,
        typ: String(g.typ),
        marke: (g.marke as string | null) ?? null,
        modell: (g.modell as string | null) ?? null,
        angaben: (g.angaben as Record<string, string>) ?? {},
        ergebnis: String(g.ergebnis),
        gruende: (g.gruende as string[]) ?? [],
      })),
    };
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;

  const select = [
    'id', 'vorgangsnummer', 'status', 'created_at', 'regel_version', 'erklaerung_version', 'erklaerung_hash',
    'contact(id,name,email,plz,telefon,organisation)',
    'donation_device(id,position,typ,marke,modell,angaben,ergebnis,gruende,device_record(seriennummer,loeschverfahren,loeschdatum,loeschperson,lagerort,zustand,entsorgungsweg,entsorger,nachweisnummer,entsorgungsdatum))',
  ].join(',');
  const holen = (sel: string) =>
    fetch(`${url}/rest/v1/donation_request?select=${sel}&vorgangsnummer=eq.${nummer}&limit=1`, {
      headers: {
        apikey: key,
        // Same rule as speicher.ts: legacy service_role keys are also sent as bearer token; sb_secret_ keys are not.
        ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}),
      },
      cache: 'no-store',
    });
  let res = await holen(select);
  if (res.status === 400) {
    // Only a bad request (missing table or column) falls back; other errors must not hide device records.
    // Until the device_record migration has run, the embed fails: load the case without the device records.
    const ohneAkte = ['id', 'vorgangsnummer', 'status', 'created_at', 'regel_version', 'erklaerung_version', 'erklaerung_hash',
      'contact(id,name,email,plz,telefon,organisation)',
      'donation_device(id,position,typ,marke,modell,angaben,ergebnis,gruende)'].join(',');
    res = await holen(ohneAkte);
  }
  if (!res.ok) throw new Error(`Supabase Vorgang: ${res.status}`);
  const zeilen = (await res.json()) as Array<{
    id: string;
    vorgangsnummer: string;
    status: string;
    created_at: string;
    regel_version: string;
    erklaerung_version: string;
    erklaerung_hash: string;
    contact: KontaktDaten & { id: string };
    donation_device: Array<Omit<GeraetDaten, 'akte'> & { device_record: Array<Partial<GeraetAkte>> | null }>;
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
    kontaktId: z.contact.id,
    kontakt: { name: z.contact.name, email: z.contact.email, plz: z.contact.plz, telefon: z.contact.telefon, organisation: z.contact.organisation },
    geraete: [...z.donation_device]
      .sort((a, b) => a.position - b.position)
      .map(({ device_record, ...d }) => ({ ...d, akte: { ...LEER_AKTE, ...(device_record?.[0] ?? {}) } })),
  };
}

/** Result labels for the case sheet, the admin pages and the PDF (German by default). */
export function ergebnisKurz(ergebnis: string, lang: Lang = 'de'): string {
  const e = adminTexte(lang);
  const map: Record<string, string> = {
    geeignet: e.detail.ergebnisGeeignet,
    angaben: e.detail.ergebnisAngaben,
    manuell: e.detail.ergebnisManuell,
    nichtGeeignet: e.detail.ergebnisNichtGeeignet,
  };
  return map[ergebnis] ?? ergebnis;
}

/** Kept for the PDF, which stays German. */
export const ERGEBNIS_KURZ: Record<string, string> = Object.fromEntries(
  ['geeignet', 'angaben', 'manuell', 'nichtGeeignet'].map((k) => [k, ergebnisKurz(k, 'de')]),
);

export const ANGABE_REIHENFOLGE = ['typ', 'alter', 'startet', 'display', 'akku', 'sperren', 'eigentum', 'ram'] as const;

export function angabeText(feld: string, wert: string, lang: Lang = 'de'): string {
  const w = adminTexte(lang).angabe.wert as Record<string, Record<string, string>>;
  return w[feld]?.[wert] ?? wert;
}

export function angabeLabel(feld: string, lang: Lang = 'de'): string {
  const l = adminTexte(lang).angabe.label as Record<string, string>;
  return l[feld] ?? feld;
}
