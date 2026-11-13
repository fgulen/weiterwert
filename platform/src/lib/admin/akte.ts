// Device record (Geräteakte): the data needed for the deletion log, the inventory and the disposal proof.
// Pure module: no server imports, so it can be unit-tested.

export const LOESCHVERFAHREN = ['Software-Löschung (Wipe)', 'Werksreset mit Verschlüsselung', 'Festplatte ausgebaut und vernichtet', 'Keine Daten gespeichert'] as const;
export const ZUSTAND = ['Gut', 'Gebraucht', 'Defekt', 'Nicht verwertbar'] as const;
export const ENTSORGUNGSWEG = ['Wiederverwendung', 'Recycling über Entsorgungsfachbetrieb', 'Sondermüll (Akku)'] as const;

export type GeraetAkte = {
  seriennummer: string | null;
  loeschverfahren: string | null;
  loeschdatum: string | null;
  loeschperson: string | null;
  lagerort: string | null;
  zustand: string | null;
  entsorgungsweg: string | null;
  entsorger: string | null;
  nachweisnummer: string | null;
  entsorgungsdatum: string | null;
};

export const LEER_AKTE: GeraetAkte = {
  seriennummer: null, loeschverfahren: null, loeschdatum: null, loeschperson: null,
  lagerort: null, zustand: null, entsorgungsweg: null, entsorger: null, nachweisnummer: null, entsorgungsdatum: null,
};

export type AkteFehler = Partial<Record<keyof GeraetAkte, string>>;

const DATUM = /^\d{4}-\d{2}-\d{2}$/;

/** Cleans and checks one form. Empty fields become null. Returns the values and the field errors. */
export function pruefeAkte(roh: Record<string, unknown>): { werte: GeraetAkte; fehler: AkteFehler } {
  const text = (k: keyof GeraetAkte, max: number): string | null => {
    const v = String(roh[k] ?? '').trim();
    return v === '' ? null : v.slice(0, max);
  };
  const werte: GeraetAkte = {
    seriennummer: text('seriennummer', 100),
    loeschverfahren: text('loeschverfahren', 100),
    loeschdatum: text('loeschdatum', 10),
    loeschperson: text('loeschperson', 100),
    lagerort: text('lagerort', 100),
    zustand: text('zustand', 40),
    entsorgungsweg: text('entsorgungsweg', 100),
    entsorger: text('entsorger', 150),
    nachweisnummer: text('nachweisnummer', 60),
    entsorgungsdatum: text('entsorgungsdatum', 10),
  };
  const fehler: AkteFehler = {};
  if (werte.loeschdatum && !DATUM.test(werte.loeschdatum)) fehler.loeschdatum = 'Bitte ein Datum im Format JJJJ-MM-TT eingeben.';
  if (werte.entsorgungsdatum && !DATUM.test(werte.entsorgungsdatum)) fehler.entsorgungsdatum = 'Bitte ein Datum im Format JJJJ-MM-TT eingeben.';
  if (werte.loeschverfahren && !(LOESCHVERFAHREN as readonly string[]).includes(werte.loeschverfahren)) fehler.loeschverfahren = 'Unbekanntes Löschverfahren.';
  if (werte.zustand && !(ZUSTAND as readonly string[]).includes(werte.zustand)) fehler.zustand = 'Unbekannter Zustand.';
  if (werte.entsorgungsweg && !(ENTSORGUNGSWEG as readonly string[]).includes(werte.entsorgungsweg)) fehler.entsorgungsweg = 'Unbekannter Entsorgungsweg.';
  return { werte, fehler };
}

/** A device is in the deletion log when a deletion was entered for it. */
export function hatLoeschung(a: GeraetAkte): boolean {
  return Boolean(a.loeschverfahren && a.loeschdatum && a.loeschperson);
}

/** A device is in the disposal proof when a disposal route and a proof number are entered. */
export function hatEntsorgung(a: GeraetAkte): boolean {
  return Boolean(a.entsorgungsweg && a.nachweisnummer);
}
