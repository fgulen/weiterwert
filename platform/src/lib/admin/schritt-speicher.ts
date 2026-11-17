import 'server-only';
import { datenbankKonfiguriert, dbKopfzeilen } from './db';
import { byteaZuBytes, bytesZuBytea, sha256Hex } from './protokoll-pdf-kodierung';

/** Art im Protokollspeicher je Gerät: "schritt:<geräte-id>". */
export function schrittArt(deviceId: string): string {
  return `schritt:${deviceId}`;
}

/** Speichert das Schrittprotokoll als nächste Version dieses Geräts. Ohne Datenbank: nichts (nur Testumgebung). */
export async function speichereSchrittPdf(nummer: string, deviceId: string, bytes: Uint8Array, nutzer: string): Promise<{ ok: boolean }> {
  const db = datenbankKonfiguriert();
  if (!db) return { ok: true };
  const art = schrittArt(deviceId);
  const letzte = await fetch(
    `${db.url}/rest/v1/protokoll?nummer=eq.${encodeURIComponent(nummer)}&art=eq.${encodeURIComponent(art)}&select=version&order=version.desc&limit=1`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!letzte.ok) return { ok: false };
  const version = (((await letzte.json()) as Array<{ version: number }>)[0]?.version ?? 0) + 1;
  const res = await fetch(`${db.url}/rest/v1/protokoll`, {
    method: 'POST',
    headers: dbKopfzeilen(db.key, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify({
      nummer, art, version, bezug: version > 1 ? `${nummer}-${deviceId}-v${version - 1}` : null,
      sha256: sha256Hex(bytes), inhalt: bytesZuBytea(bytes), nutzer,
    }),
    cache: 'no-store',
  });
  return { ok: res.ok };
}

/** Das zuletzt gespeicherte Schrittprotokoll eines Geräts, oder null. */
export async function holeLetztesSchrittPdf(nummer: string, deviceId: string): Promise<Uint8Array | null> {
  const db = datenbankKonfiguriert();
  if (!db) return null;
  const res = await fetch(
    `${db.url}/rest/v1/protokoll?nummer=eq.${encodeURIComponent(nummer)}&art=eq.${encodeURIComponent(schrittArt(deviceId))}&select=inhalt&order=version.desc&limit=1`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!res.ok) return null;
  const gefunden = (await res.json()) as Array<{ inhalt: string }>;
  return gefunden[0] ? byteaZuBytes(gefunden[0].inhalt) : null;
}
