import 'server-only';
import { datenbankKonfiguriert, dbKopfzeilen } from './db';
import { sha256Hex, bytesZuBytea } from './protokoll-pdf-kodierung';
import { kettenHash } from './annahme-nachweis';
import type { VorgangDaten } from './vorgang';
import { getAppEnv } from '@/lib/env';

/**
 * Speichert einen digitalen Nachweis (Übergabe, Löschung) in EINER Transaktion (speichere_nachweis,
 * Migration 20261122). Die Kette wird je Art (art) geführt. Ohne Datenbank: nur das PDF, nichts gespeichert.
 */
export async function speichereNachweis<T>(opt: {
  art: string;
  pdfArt: string;
  v: VorgangDaten;
  daten: T;
  nutzer: string;
  baue: (hash: string, zeit: Date) => Promise<Uint8Array>;
}): Promise<{ ok: true; bytes: Uint8Array; gespeichert: boolean } | { ok: false; fehler: string }> {
  const db = datenbankKonfiguriert();
  const jetzt = new Date();
  // Außerhalb der Testumgebung darf nie "gespeichert" vorgetäuscht werden (Review-Befund).
  if (!db && getAppEnv() !== 'test') return { ok: false, fehler: 'nachweis' };
  if (!db) {
    const hash = kettenHash(null, opt.daten, jetzt.toISOString(), opt.nutzer);
    return { ok: true, bytes: await opt.baue(hash, jetzt), gespeichert: false };
  }

  const nummer = opt.v.vorgangsnummer;
  const letzter = await fetch(
    `${db.url}/rest/v1/ablauf_nachweis?nummer=eq.${encodeURIComponent(nummer)}&art=eq.${opt.art}&select=hash&order=id.desc&limit=1`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!letzter.ok) return { ok: false, fehler: 'lesen' };
  const vorher = ((await letzter.json()) as Array<{ hash: string }>)[0]?.hash ?? null;

  const zeit = jetzt.toISOString();
  const hash = kettenHash(vorher, opt.daten, zeit, opt.nutzer);
  const bytes = await opt.baue(hash, jetzt);

  const rpc = await fetch(`${db.url}/rest/v1/rpc/speichere_nachweis`, {
    method: 'POST',
    headers: dbKopfzeilen(db.key, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      p_art: opt.art,
      p_pdf_art: opt.pdfArt,
      p_nummer: nummer,
      p_daten: opt.daten,
      p_prev_hash: vorher,
      p_hash: hash,
      p_nutzer: opt.nutzer,
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
