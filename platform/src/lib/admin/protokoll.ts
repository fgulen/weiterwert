import 'server-only';
import { datenbankKonfiguriert, dbKopfzeilen } from './db';

export type ProtokollEintrag = {
  zeit: string;
  nutzer: string;
  aktion: string;
  details: Record<string, unknown>;
};

/**
 * Writes one audit row. Throws when it fails, so the caller can stop before the protected action
 * (a status change or a download is not allowed without a record of it).
 */
export async function schreibeProtokoll(e: { nutzer: string; aktion: string; vorgang: string; details?: Record<string, unknown> }): Promise<void> {
  const db = datenbankKonfiguriert();
  if (!db) throw new Error('Protokoll: Datenbank nicht konfiguriert.');
  const res = await fetch(`${db.url}/rest/v1/admin_audit`, {
    method: 'POST',
    headers: dbKopfzeilen(db.key, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify({ nutzer: e.nutzer, aktion: e.aktion, vorgang: e.vorgang, details: e.details ?? {} }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Protokoll: ${res.status}`);
}

/** The most recent entries for one case, newest first. Empty when the database is not configured. */
export async function ladeProtokoll(vorgang: string): Promise<ProtokollEintrag[]> {
  const db = datenbankKonfiguriert();
  if (!db) return [];
  const res = await fetch(
    `${db.url}/rest/v1/admin_audit?select=zeit,nutzer,aktion,details&vorgang=eq.${vorgang}&order=zeit.desc&limit=50`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!res.ok) throw new Error(`Protokoll lesen: ${res.status}`);
  return (await res.json()) as ProtokollEintrag[];
}
