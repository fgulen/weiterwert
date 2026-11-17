import 'server-only';
import { datenbankKonfiguriert, dbKopfzeilen } from './db';
import { byteaZuBytes } from './protokoll-pdf-kodierung';

export type PdfArt = 'uebergabe-formular' | 'annahme-formular' | 'annahme-digital' | 'uebergabe-digital' | 'loeschung-digital' | 'loeschprotokoll' | 'entsorgung' | 'vorgangsblatt';

/** Nur lesen: das zuletzt gespeicherte PDF dieser Art, oder null wenn keines existiert. */
export async function holeLetzteVersion(nummer: string, art: PdfArt): Promise<Uint8Array | null> {
  const db = datenbankKonfiguriert();
  if (!db) return null;
  const suche = await fetch(
    `${db.url}/rest/v1/protokoll?nummer=eq.${encodeURIComponent(nummer)}&art=eq.${art}&select=inhalt&order=version.desc&limit=1`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!suche.ok) return null;
  const gefunden = (await suche.json()) as Array<{ inhalt: string }>;
  return gefunden[0] ? byteaZuBytes(gefunden[0].inhalt) : null;
}

/**
 * Leere Vorlagen und Auswertungen werden bei jedem Download aus dem aktuellen Stand erzeugt.
 * Nur die digitalen Nachweise (Annahme, Übergabe, Löschung) werden gespeichert, siehe speichereNachweis.
 * Eine frühere Speicherung hätte veraltete Stände eingefroren (Review-Befund).
 */
export async function holeOderErzeuge(
  _nummer: string,
  _art: PdfArt,
  _nutzer: string,
  baue: () => Promise<Uint8Array>,
): Promise<{ ok: true; bytes: Uint8Array } | { ok: false }> {
  return { ok: true, bytes: await baue() };
}

/** Nur prüfen, ob ein Protokoll dieser Art existiert (ohne den Inhalt zu laden). */
export async function hatProtokoll(nummer: string, art: PdfArt): Promise<boolean> {
  const db = datenbankKonfiguriert();
  if (!db) return false;
  const res = await fetch(
    `${db.url}/rest/v1/protokoll?nummer=eq.${encodeURIComponent(nummer)}&art=eq.${art}&select=id&limit=1`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!res.ok) return false;
  return ((await res.json()) as unknown[]).length > 0;
}
