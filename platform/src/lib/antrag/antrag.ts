// "Gerät beantragen": server-side core. The page and the upload are not built yet; the feature stays "demnaechst".
import { getAppEnv } from '@/lib/env';

export const ANTRAGSARTEN = ['kurum', 'privat'] as const;
export type Antragsart = (typeof ANTRAGSARTEN)[number];

export const GERAETEARTEN = ['laptop', 'tablet', 'beides'] as const;
export type Geraeteart = (typeof GERAETEARTEN)[number];

// Accepted proof (plan §1 and §10). Only the Bescheid types of the list are allowed; a private applicant
// cannot substitute a self-declaration. 'einrichtung' is the institution's confirmation, used by Kurum applications.
export const NACHWEISE = ['buergergeld', 'sozialhilfe', 'wohngeld', 'bvg_bkgg', 'einrichtung'] as const;
export type Nachweis = (typeof NACHWEISE)[number];

/** Plan decision pending: device limit per application. Kept as a constant so it is changed in one place. */
export const MAX_ANTRAG_GERAETE = 10;
export const LOESCHFRIST_ABGELEHNT_TAGE = 14;

export type Antrag = {
  idempotencyKey: string;
  art: Antragsart;
  geraeteart: Geraeteart;
  anzahl: number;
  zweck: string;
  name: string;
  email: string;
  /** Only the first two digits of the PLZ are stored (region, not address). */
  plzRegion: string;
  organisation: string;
  nachweis: Nachweis;
  /** The applicant has read the Datenschutz notice for this form. */
  datenschutzGelesen: boolean;
  /** Honeypot: hidden from people, bots fill it. Must stay empty. */
  website: string;
};

export type AntragFehler = { ok: false; fehler: string };
export type AntragLesen = { ok: true; antrag: Antrag } | AntragFehler;

const UNVOLLSTAENDIG = 'Die Angaben sind unvollständig. Bitte prüfen Sie das Formular.';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_TEXT = 100;
const MAX_ZWECK = 300;

const text = (v: unknown, max: number): string | null => (typeof v === 'string' && v.length <= max ? v.trim() : null);

/** Server-side check of untrusted input. Returns a clean copy or a message for the applicant. */
export function leseAntrag(v: unknown): AntragLesen {
  if (!v || typeof v !== 'object') return { ok: false, fehler: UNVOLLSTAENDIG };
  const o = v as Record<string, unknown>;

  if (typeof o.idempotencyKey !== 'string' || !UUID.test(o.idempotencyKey)) return { ok: false, fehler: UNVOLLSTAENDIG };
  if (typeof o.website === 'string' && o.website !== '') return { ok: false, fehler: UNVOLLSTAENDIG };

  const art = ANTRAGSARTEN.find((a) => a === o.art);
  const geraeteart = GERAETEARTEN.find((g) => g === o.geraeteart);
  if (!art || !geraeteart) return { ok: false, fehler: UNVOLLSTAENDIG };

  const anzahl = o.anzahl;
  if (typeof anzahl !== 'number' || !Number.isInteger(anzahl) || anzahl < 1 || anzahl > MAX_ANTRAG_GERAETE) {
    return { ok: false, fehler: `Bitte geben Sie zwischen 1 und ${MAX_ANTRAG_GERAETE} Geräte an.` };
  }

  const zweck = text(o.zweck, MAX_ZWECK);
  if (zweck === null || zweck.length < 10) return { ok: false, fehler: 'Bitte beschreiben Sie den Verwendungszweck in einem Satz.' };

  const name = text(o.name, MAX_TEXT);
  if (name === null || name.length < 2) return { ok: false, fehler: 'Bitte geben Sie einen Namen an.' };

  const email = text(o.email, MAX_TEXT);
  if (email === null || !EMAIL.test(email)) return { ok: false, fehler: 'Bitte geben Sie eine gültige E-Mail-Adresse an.' };

  const plz = text(o.plz, 5);
  if (plz === null || !/^\d{5}$/.test(plz)) return { ok: false, fehler: 'Bitte geben Sie eine fünfstellige Postleitzahl an.' };

  if (o.datenschutzGelesen !== true) return { ok: false, fehler: 'Bitte bestätigen Sie, dass Sie den Datenschutzhinweis gelesen haben.' };

  let organisation = '';
  let nachweis: Nachweis;
  if (art === 'kurum') {
    const org = text(o.organisation, MAX_TEXT);
    if (org === null || org.length < 2) return { ok: false, fehler: 'Bitte geben Sie den Namen der Einrichtung an.' };
    organisation = org;
    nachweis = 'einrichtung';
  } else {
    // Private applicants give one accepted Bescheid type. The file itself is not handled here yet (see plan §1).
    const n = NACHWEISE.find((x) => x === o.nachweis && x !== 'einrichtung');
    if (!n) return { ok: false, fehler: 'Bitte wählen Sie einen der angegebenen Nachweise.' };
    nachweis = n;
  }

  return {
    ok: true,
    antrag: {
      idempotencyKey: o.idempotencyKey.toLowerCase(),
      art,
      geraeteart,
      anzahl,
      zweck,
      name,
      email,
      plzRegion: plz.slice(0, 2),
      organisation,
      nachweis,
      datenschutzGelesen: true,
      website: '',
    },
  };
}

/** Antragsnummer with its own prefix (WW-A-), so it cannot be confused with donations (WW-) or inventory (WW-G-). */
export function antragsnummer(jahr: number, zufall: number): string {
  return `WW-A-${jahr}-${String(zufall).padStart(6, '0')}`;
}

/**
 * Deletion deadline per plan §9 (decided by Fatih): only rejected applications have a fixed period (14 days).
 * Other categories return null, because their retention is not decided yet.
 */
export function loeschfrist(entscheidung: 'abgelehnt' | 'offen' | 'abgeschlossen', entschieden: Date): Date | null {
  if (entscheidung !== 'abgelehnt') return null;
  const frist = new Date(entschieden);
  frist.setUTCDate(frist.getUTCDate() + LOESCHFRIST_ABGELEHNT_TAGE);
  return frist;
}

export type AntragSpeicher = {
  name: 'test-attrappe';
  speichere(antrag: Antrag, zufall: number, jahr: number): Promise<{ antragsnummer: string; neu: boolean }>;
};

/** Test store: in memory, same idempotency behaviour as the donation test store. Never writes to a database. */
export function erstelleTestSpeicher(): AntragSpeicher {
  const nachSchluessel = new Map<string, string>();
  return {
    name: 'test-attrappe',
    async speichere(antrag, zufall, jahr) {
      const vorhanden = nachSchluessel.get(antrag.idempotencyKey);
      if (vorhanden) return { antragsnummer: vorhanden, neu: false };
      const nr = antragsnummer(jahr, zufall);
      nachSchluessel.set(antrag.idempotencyKey, nr);
      return { antragsnummer: nr, neu: true };
    },
  };
}

// One shared test store per process, so repeated sends of the same request are recognised (as with donations).
const testSpeicher = erstelleTestSpeicher();

/** Production has no request store yet, so this returns null and the form stays off. */
export function waehleAntragSpeicher(): AntragSpeicher | null {
  return getAppEnv() === 'test' ? testSpeicher : null;
}
