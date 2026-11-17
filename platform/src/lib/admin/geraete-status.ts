import 'server-only';
import { datenbankKonfiguriert, dbKopfzeilen } from './db';
import { ersterDatensatz } from './embed';

/**
 * Lädt den Ablaufstatus jedes Geräts eines Vorgangs (Migration 20261117).
 * Ohne Datenbank oder bei Fehler: null. Ein Gerät ohne Eintrag gilt als "eingegangen".
 */
export async function ladeGeraeteStatus(vorgangsnummer: string): Promise<string[] | null> {
  const db = datenbankKonfiguriert();
  if (!db) return null;
  const res = await fetch(
    `${db.url}/rest/v1/donation_request?vorgangsnummer=eq.${encodeURIComponent(vorgangsnummer)}&select=donation_device(device_record(ablauf_status))`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!res.ok) return null;
  const zeilen = (await res.json()) as Array<{
    donation_device: Array<{ device_record: Array<{ ablauf_status: string }> | null }> | null;
  }>;
  const geraete = zeilen[0]?.donation_device ?? [];
  return geraete.map((g) => ersterDatensatz(g.device_record)?.ablauf_status ?? 'eingegangen');
}
