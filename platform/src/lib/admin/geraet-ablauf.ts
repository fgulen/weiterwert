// Ablauf eines Geräts (Cihaz) vom Eingang bis zur Übergabe bzw. Rückgabe.
// Reine Regeln ohne Datenbank, damit sie getestet werden können.
// Entscheidungen 2026-11-17: zweite Kontrolle bei Eingang; Abweichung → Quarantäne;
// Quarantäne endet mit Bestand (weiter in den normalen Ablauf) oder Rücksendung (Protokoll).

export const GERAET_FOLGE: Record<string, string[]> = {
  eingegangen: ['zweite_kontrolle'],
  zweite_kontrolle: ['loeschung_offen', 'quarantaene'],
  quarantaene: ['loeschung_offen', 'rueckgabe'],
  loeschung_offen: ['geloescht'],
  geloescht: ['technische_pruefung'],
  technische_pruefung: ['reparatur', 'frei', 'entsorgt'],
  reparatur: ['technische_pruefung'],
  frei: ['reserviert'],
  reserviert: ['uebergeben', 'frei'],
  uebergeben: [],
  rueckgabe: [],
  entsorgt: [],
};

export function geraetNaechsteStatus(status: string): string[] {
  return GERAET_FOLGE[status] ?? [];
}

export function istErlaubterGeraetWechsel(von: string, nach: string): boolean {
  return geraetNaechsteStatus(von).includes(nach);
}

/** Endstatus eines einzelnen Geräts: Übergabe, Rückgabe oder Entsorgung. */
export const GERAET_ENDSTATUS = ['uebergeben', 'rueckgabe', 'entsorgt'];

export function geraetFertig(status: string): boolean {
  return GERAET_ENDSTATUS.includes(status);
}

/**
 * Ein Vorgang ist erst abgeschlossen, wenn jedes Gerät darin fertig ist.
 * Jedes Gerät wird einzeln bewertet; der Vorgang folgt den Geräten.
 * Ohne Geräte gilt der Vorgang nicht als abgeschlossen.
 */
export function vorgangFertig(geraeteStatus: string[]): boolean {
  return geraeteStatus.length > 0 && geraeteStatus.every(geraetFertig);
}

/** Schritte, die zwei verschiedene Admins verlangen (Entscheidung Fatih: Vorab-Freigabe, Annahme, Löschung). */
// Laut Datenlöschrichtlinie (Dok. 07, Abschnitt 6) nur bei fehlgeschlagener Löschung, Ausnahme oder Vernichtung.
// Annahme (Dok. 18) und Übergabe (Dok. 28) haben je eine Unterschrift und brauchen keine zweite Freigabe.
const ZWEI_ADMIN_SCHRITTE = new Set(['loeschung_fehlgeschlagen', 'loeschung_ausnahme', 'vernichtung']);

export function brauchtZweiAdmins(schritt: string): boolean {
  return ZWEI_ADMIN_SCHRITTE.has(schritt);
}

/**
 * Vier-Augen-Prüfung: Erstfreigabe und Zweitfreigabe müssen von zwei verschiedenen,
 * bekannten Admins stammen. Schritte ohne Pflicht gelten immer als erlaubt.
 */
export function zweiAdminFreigabeOk(schritt: string, erster: string | null, zweiter: string | null): boolean {
  if (!brauchtZweiAdmins(schritt)) return true;
  if (!erster || !zweiter) return false;
  return erster !== zweiter;
}

/** Zweite Kontrolle: Fotoergebnis und gelieferter Gerätetyp, Marke und Modell müssen übereinstimmen. */
export type GeraetMerkmale = { typ: string; marke: string | null; modell: string | null };

export function zweiteKontrolleErgebnis(foto: GeraetMerkmale, geliefert: GeraetMerkmale): 'passt' | 'abweichung' {
  const norm = (s: string | null) => (s ?? '').trim().toLowerCase();
  const gleich =
    norm(foto.typ) === norm(geliefert.typ) &&
    norm(foto.marke) === norm(geliefert.marke) &&
    norm(foto.modell) === norm(geliefert.modell);
  return gleich ? 'passt' : 'abweichung';
}

/**
 * Protokollierte PDFs werden nie geändert (Audit). Eine Korrektur ist ein neues Protokoll,
 * das auf das alte verweist und eine um 1 höhere Version bekommt.
 */
export type ProtokollRef = { nummer: string; version: number; bezug: string | null };

export function korrekturVon(altes: ProtokollRef): ProtokollRef {
  return { nummer: altes.nummer, version: altes.version + 1, bezug: `${altes.nummer}-v${altes.version}` };
}
