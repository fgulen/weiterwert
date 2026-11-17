import 'server-only';
import { datenbankKonfiguriert, dbKopfzeilen } from './db';

export type GeraetStatusZeile = { deviceId: string; status: string };
export type GeraetEreignis = { von: string; nach: string; schritt: string; nutzer: string; zweiter_nutzer: string | null; zeit: string };

/** Status jedes Geräts eines Vorgangs mit seiner ID. Ohne Datenbank: null. Ohne Eintrag: "eingegangen". */
export async function ladeGeraetStatusListe(nummer: string): Promise<GeraetStatusZeile[] | null> {
  const db = datenbankKonfiguriert();
  if (!db) return null;
  const res = await fetch(
    `${db.url}/rest/v1/donation_request?vorgangsnummer=eq.${encodeURIComponent(nummer)}&select=donation_device(id,device_record(ablauf_status))`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!res.ok) return null;
  const zeilen = (await res.json()) as Array<{
    donation_device: Array<{ id: string; device_record: Array<{ ablauf_status: string }> | null }> | null;
  }>;
  return (zeilen[0]?.donation_device ?? []).map((g) => ({
    deviceId: g.id,
    status: g.device_record?.[0]?.ablauf_status ?? 'eingegangen',
  }));
}

/** Protokollierte Schritte eines Geräts, neueste zuerst. */
export async function ladeGeraetEreignisse(deviceId: string): Promise<GeraetEreignis[]> {
  const db = datenbankKonfiguriert();
  if (!db) return [];
  const res = await fetch(
    `${db.url}/rest/v1/geraet_ereignis?device_id=eq.${encodeURIComponent(deviceId)}&select=von,nach,schritt,nutzer,zweiter_nutzer,zeit&order=id.desc&limit=20`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!res.ok) return [];
  return (await res.json()) as GeraetEreignis[];
}
