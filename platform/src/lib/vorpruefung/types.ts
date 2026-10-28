export type Geraetetyp = 'laptop' | 'chromebook' | 'macbook' | 'android' | 'ipad' | 'unbekannt';

export type GeraetEingabe = {
  typ: Geraetetyp;
  marke: string;
  modell: string;
  alter: '0-3' | '4-6' | '7-9' | '10+' | 'unbekannt';
  startet: 'ja' | 'nein' | 'unbekannt';
  display: 'ok' | 'schaden' | 'unbekannt';
  akku: 'ok' | 'schwach' | 'gebläht' | 'unbekannt';
  sperren: 'keine' | 'konto' | 'firma' | 'unbekannt';
  eigentum: 'ja' | 'leasing' | 'unbekannt';
  ram: '8+' | '4' | 'unbekannt';
};

export type Ergebnis = 'geeignet' | 'angaben' | 'manuell' | 'nichtGeeignet';

/** Stable names of the reasons, so the page can show them in the visitor's language. */
export type GrundCode =
  | 'akkuGeblaeht' | 'leasing' | 'startetNicht' | 'chromeAlt' | 'alterLaptop' | 'alterAndere' | 'alter10'
  | 'displaySchaden' | 'akkuSchwach' | 'sperrenKonto' | 'sperrenFirma' | 'ram4' | 'typUnbekannt' | 'alterUnbekannt'
  | 'startetUnbekannt' | 'displayUnbekannt' | 'akkuUnbekannt' | 'sperrenUnbekannt' | 'eigentumUnbekannt';

/** `gruende` are the German texts (stored and mailed to staff); `codes` are the same reasons for the page. */
export type Pruefergebnis = { ergebnis: Ergebnis; gruende: string[]; codes: GrundCode[]; regelVersion: string };

export const ERGEBNIS_TEXT: Record<Ergebnis, string> = {
  geeignet: 'Vorläufig geeignet',
  angaben: 'Weitere Angaben erforderlich',
  manuell: 'Manuelle Prüfung erforderlich',
  nichtGeeignet: 'Nach den veröffentlichten Kriterien voraussichtlich nicht geeignet',
};
