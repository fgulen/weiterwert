import 'server-only';
import { datenbankKonfiguriert, dbKopfzeilen } from './db';

/**
 * Ruft die atomare Statusfunktion setze_geraet_status auf (Migration 20261117_geraet_ablauf.sql).
 * Der Aufrufer MUSS vorher prüfen, dass zweiter ein anderer, angemeldeter Admin ist (Punkt 13,
 * Methode a: zweiter Admin meldet sich mit eigener Sitzung an). Die Datenbank vertraut dem Namen.
 */
export type GeraetWechsel = {
  deviceId: string;
  von: string;
  nach: string;
  schritt: string;
  nutzer: string;
  zweiter: string | null;
};

export type GeraetWechselFehler =
  | 'geraet_unbekannt'
  | 'status_veraltet'
  | 'wechsel_nicht_erlaubt'
  | 'zwei_admin_fehlt'
  | 'datenbank_nicht_konfiguriert'
  | 'unbekannt';

const BEKANNTE_FEHLER: GeraetWechselFehler[] = [
  'geraet_unbekannt',
  'status_veraltet',
  'wechsel_nicht_erlaubt',
  'zwei_admin_fehlt',
];

export async function setzeGeraetStatus(w: GeraetWechsel): Promise<{ ok: true } | { ok: false; fehler: GeraetWechselFehler }> {
  const db = datenbankKonfiguriert();
  if (!db) return { ok: false, fehler: 'datenbank_nicht_konfiguriert' };

  const res = await fetch(`${db.url}/rest/v1/rpc/setze_geraet_status`, {
    method: 'POST',
    headers: dbKopfzeilen(db.key, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      p_device: w.deviceId,
      p_von: w.von,
      p_nach: w.nach,
      p_schritt: w.schritt,
      p_nutzer: w.nutzer,
      p_zweiter: w.zweiter,
    }),
    cache: 'no-store',
  });

  if (res.ok) return { ok: true };

  // PostgREST liefert die Fehlermeldung aus RAISE EXCEPTION im Feld "message".
  const text = await res.text();
  const treffer = BEKANNTE_FEHLER.find((code) => text.includes(code));
  return { ok: false, fehler: treffer ?? 'unbekannt' };
}

/**
 * Statuswechsel und Schrittprotokoll-PDF in einer Transaktion (Migration 20261123).
 * Schlägt das Speichern fehl, bleibt der Status unverändert. Ein Statuswechsel ohne PDF ist nicht möglich.
 */
export async function setzeGeraetStatusMitPdf(
  w: GeraetWechsel & { vorgangsnummer: string; pdf: Uint8Array },
): Promise<{ ok: true } | { ok: false; fehler: GeraetWechselFehler }> {
  const db = datenbankKonfiguriert();
  if (!db) return { ok: false, fehler: 'datenbank_nicht_konfiguriert' };
  const { bytesZuBytea, sha256Hex } = await import('./protokoll-pdf-kodierung');
  const res = await fetch(`${db.url}/rest/v1/rpc/setze_geraet_status_mit_pdf`, {
    method: 'POST',
    headers: dbKopfzeilen(db.key, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      p_device: w.deviceId,
      p_von: w.von,
      p_nach: w.nach,
      p_schritt: w.schritt,
      p_nutzer: w.nutzer,
      p_zweiter: w.zweiter,
      p_vorgang: w.vorgangsnummer,
      p_sha256: sha256Hex(w.pdf),
      p_inhalt: bytesZuBytea(w.pdf),
    }),
    cache: 'no-store',
  });
  if (res.ok) return { ok: true };
  const text = await res.text();
  const treffer = BEKANNTE_FEHLER.find((code) => text.includes(code));
  return { ok: false, fehler: treffer ?? 'unbekannt' };
}
