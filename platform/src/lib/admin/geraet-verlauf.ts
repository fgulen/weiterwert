import 'server-only';
import { datenbankKonfiguriert, dbKopfzeilen } from './db';
import { ersterDatensatz } from './embed';

export type GeraetStatusZeile = { deviceId: string; status: string; erfasst: boolean };
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
    donation_device: Array<{ id: string; device_record: Array<{ ablauf_status: string }> | { ablauf_status: string } | null }> | null;
  }>;
  return (zeilen[0]?.donation_device ?? []).map((g) => ({
    deviceId: g.id,
    status: ersterDatensatz(g.device_record)?.ablauf_status ?? 'eingegangen',
    erfasst: ersterDatensatz(g.device_record) !== null,
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

/** Ereignisse mehrerer Geräte in einer Abfrage, je Gerät höchstens 20, neueste zuerst. */
export async function ladeEreignisseVieler(deviceIds: string[]): Promise<Record<string, GeraetEreignis[]>> {
  const db = datenbankKonfiguriert();
  if (!db || deviceIds.length === 0) return {};
  const liste = deviceIds.map((id) => encodeURIComponent(id)).join(',');
  const res = await fetch(
    `${db.url}/rest/v1/geraet_ereignis?device_id=in.(${liste})&select=device_id,von,nach,schritt,nutzer,zweiter_nutzer,zeit&order=id.desc&limit=500`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!res.ok) return {};
  const zeilen = (await res.json()) as Array<GeraetEreignis & { device_id: string }>;
  const nachGeraet: Record<string, GeraetEreignis[]> = {};
  for (const z of zeilen) {
    const liste2 = (nachGeraet[z.device_id] ??= []);
    if (liste2.length < 20) liste2.push(z);
  }
  return nachGeraet;
}
