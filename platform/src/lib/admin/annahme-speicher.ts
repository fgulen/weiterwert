import 'server-only';
import { datenbankKonfiguriert, dbKopfzeilen } from './db';
import { sha256Hex, bytesZuBytea } from './protokoll-pdf-kodierung';
import { kettenHash, type AnnahmeDaten } from './annahme-nachweis';
import { baueAnnahmeDigital } from './annahme-digital-pdf';
import type { VorgangDaten } from './vorgang';
import { getAppEnv } from '@/lib/env';

/**
 * Speichert eine digitale Annahme in EINER Datenbanktransaktion (Funktion speichere_annahme,
 * Migration 20261121): Nachweis in der Hash-Kette und PDF-Version. Schlägt eines fehl, wird nichts gespeichert.
 * Ohne Datenbank (Testumgebung): nur das PDF wird erzeugt, nichts gespeichert.
 */
export async function speichereAnnahme(
  v: VorgangDaten,
  daten: AnnahmeDaten,
  nutzer: string,
): Promise<{ ok: true; bytes: Uint8Array; gespeichert: boolean } | { ok: false; fehler: string }> {
  const db = datenbankKonfiguriert();
  const jetzt = new Date();
  // Außerhalb der Testumgebung darf nie "gespeichert" vorgetäuscht werden (Review-Befund).
  if (!db && getAppEnv() !== 'test') return { ok: false, fehler: 'nachweis' };
  if (!db) {
    const hash = kettenHash(null, daten, jetzt.toISOString(), nutzer);
    return { ok: true, bytes: await baueAnnahmeDigital(v, daten, jetzt, hash), gespeichert: false };
  }

  const letzter = await fetch(
    `${db.url}/rest/v1/ablauf_nachweis?nummer=eq.${encodeURIComponent(v.vorgangsnummer)}&art=eq.annahme&select=hash&order=id.desc&limit=1`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!letzter.ok) return { ok: false, fehler: 'lesen' };
  const vorher = ((await letzter.json()) as Array<{ hash: string }>)[0]?.hash ?? null;

  const zeit = jetzt.toISOString();
  const hash = kettenHash(vorher, daten, zeit, nutzer);
  const bytes = await baueAnnahmeDigital(v, daten, jetzt, hash);

  const rpc = await fetch(`${db.url}/rest/v1/rpc/speichere_annahme`, {
    method: 'POST',
    headers: dbKopfzeilen(db.key, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      p_nummer: v.vorgangsnummer,
      p_daten: daten,
      p_prev_hash: vorher,
      p_hash: hash,
      p_nutzer: nutzer,
      p_zeit: zeit,
      p_sha256: sha256Hex(bytes),
      p_inhalt: bytesZuBytea(bytes),
    }),
    cache: 'no-store',
  });
  if (!rpc.ok) {
    const text = await rpc.text();
    return { ok: false, fehler: text.includes('kette_geaendert') ? 'kette' : 'nachweis' };
  }
  return { ok: true, bytes, gespeichert: true };
}
