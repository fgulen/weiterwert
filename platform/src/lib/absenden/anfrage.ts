import type { GeraetEingabe } from '@/lib/vorpruefung/types';

export type Kontakt = { name: string; email: string; plz: string; telefon: string; organisation: string };
export type KontaktFehler = Partial<Record<keyof Kontakt, string>>;

export type Anfrage = {
  idempotencyKey: string;
  geraete: GeraetEingabe[];
  kontakt: Kontakt;
  erklaerungen: { eigentum: boolean; daten: boolean };
  /** Honeypot: hidden from people, bots fill it. */
  website: string;
};

export const LEERER_KONTAKT: Kontakt = { name: '', email: '', plz: '', telefon: '', organisation: '' };
export const MAX_GERAETE = 10;
const MAX_TEXT = 100;

// The declarations a donor confirms; the version and a hash of this exact text are stored with each request.
export const ERKLAERUNGEN = {
  version: 'erklaerungen-v1',
  eigentum: 'Die Geräte gehören mir oder ich darf sie spenden. Sie sind nicht geleast, gemietet oder Eigentum meines Arbeitgebers.',
  daten: 'Ich habe meine Daten gesichert. Mir ist bewusst, dass Daten auf den Geräten bei der Aufbereitung verloren gehen.',
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PLZ = /^\d{5}$/;

/** Messages of the contact check; the page passes the same keys in the visitor's language. */
export type KontaktMeldungen = { name: string; nameLang: string; email: string; plz: string; telefonLang: string; organisationLang: string };
export const KONTAKT_MELDUNGEN_DE: KontaktMeldungen = {
  name: 'Bitte geben Sie Ihren Namen an.',
  nameLang: 'Der Name ist zu lang.',
  email: 'Bitte geben Sie eine gültige E-Mail-Adresse an.',
  plz: 'Bitte geben Sie eine fünfstellige Postleitzahl an.',
  telefonLang: 'Die Telefonnummer ist zu lang.',
  organisationLang: 'Der Name der Organisation ist zu lang.',
};

export function pruefeKontakt(k: Kontakt, m: KontaktMeldungen = KONTAKT_MELDUNGEN_DE): KontaktFehler {
  const f: KontaktFehler = {};
  if (!k.name.trim()) f.name = m.name;
  else if (k.name.length > MAX_TEXT) f.name = m.nameLang;
  if (!EMAIL.test(k.email.trim()) || k.email.length > MAX_TEXT) f.email = m.email;
  if (!PLZ.test(k.plz.trim())) f.plz = m.plz;
  if (k.telefon.length > 40) f.telefon = m.telefonLang;
  if (k.organisation.length > MAX_TEXT) f.organisation = m.organisationLang;
  return f;
}

/** Why a request was refused; the page shows its own text per language, `fehler` stays the German fallback. */
export type FehlerCode = 'ungueltig' | 'keinGeraet' | 'zuViele' | 'erklaerung' | 'nichtGeeignet' | 'technik';
export type LeseFehler = { ok: false; fehler: string; code: FehlerCode };

const WERTE: { [K in Exclude<keyof GeraetEingabe, 'marke' | 'modell'>]: readonly GeraetEingabe[K][] } = {
  typ: ['laptop', 'chromebook', 'macbook', 'android', 'ipad', 'unbekannt'],
  alter: ['0-3', '4-6', '7-9', '10+', 'unbekannt'],
  startet: ['ja', 'nein', 'unbekannt'],
  display: ['ok', 'schaden', 'unbekannt'],
  akku: ['ok', 'schwach', 'gebläht', 'unbekannt'],
  sperren: ['keine', 'konto', 'firma', 'unbekannt'],
  eigentum: ['ja', 'leasing', 'unbekannt'],
  ram: ['8+', '4', 'unbekannt'],
};

const text = (v: unknown, max = MAX_TEXT) => (typeof v === 'string' && v.length <= max ? v : null);

function geraet(v: unknown): GeraetEingabe | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const marke = text(o.marke);
  const modell = text(o.modell);
  if (marke === null || modell === null) return null;
  const g: Record<string, unknown> = { marke: marke.trim(), modell: modell.trim() };
  for (const [k, erlaubt] of Object.entries(WERTE)) {
    if (!(erlaubt as readonly unknown[]).includes(o[k])) return null;
    g[k] = o[k];
  }
  return g as GeraetEingabe;
}

/** Server-side check of untrusted input. Returns a clean copy or a message for the donor. */
export function leseAnfrage(v: unknown): { ok: true; anfrage: Anfrage } | LeseFehler {
  const ungueltig = { ok: false as const, fehler: 'Die Angaben sind unvollständig. Bitte prüfen Sie das Formular.', code: 'ungueltig' as const };
  if (!v || typeof v !== 'object') return ungueltig;
  const o = v as Record<string, unknown>;
  if (typeof o.idempotencyKey !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(o.idempotencyKey)) return ungueltig;
  if (!Array.isArray(o.geraete) || o.geraete.length === 0) return { ok: false, fehler: 'Bitte erfassen Sie mindestens ein Gerät.', code: 'keinGeraet' };
  if (o.geraete.length > MAX_GERAETE) return { ok: false, fehler: `Bitte senden Sie höchstens ${MAX_GERAETE} Geräte pro Anfrage.`, code: 'zuViele' };
  const geraete = o.geraete.map(geraet);
  if (geraete.some((g) => g === null)) return ungueltig;

  const k = (o.kontakt ?? {}) as Record<string, unknown>;
  const kontakt: Kontakt = { name: '', email: '', plz: '', telefon: '', organisation: '' };
  for (const key of Object.keys(kontakt) as (keyof Kontakt)[]) {
    const t = text(k[key] ?? '', 200);
    if (t === null) return ungueltig;
    kontakt[key] = t.trim();
  }
  if (Object.keys(pruefeKontakt(kontakt)).length > 0) return ungueltig;

  const e = (o.erklaerungen ?? {}) as Record<string, unknown>;
  if (e.eigentum !== true || e.daten !== true) return { ok: false, fehler: 'Bitte bestätigen Sie beide Erklärungen.', code: 'erklaerung' };

  return {
    ok: true,
    anfrage: {
      idempotencyKey: o.idempotencyKey.toLowerCase(),
      geraete: geraete as GeraetEingabe[],
      kontakt,
      erklaerungen: { eigentum: true, daten: true },
      website: typeof o.website === 'string' ? o.website : '',
    },
  };
}
