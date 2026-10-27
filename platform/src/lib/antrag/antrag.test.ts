import { describe, expect, it } from 'vitest';
import { antragsnummer, erstelleTestSpeicher, leseAntrag, loeschfrist } from './antrag';

const KEY = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';

const kurum = {
  idempotencyKey: KEY,
  art: 'kurum',
  geraeteart: 'tablet',
  anzahl: 4,
  zweck: 'Hausaufgaben und Distanzunterricht für Klasse 7',
  name: 'Anna Beispiel',
  email: 'lehrkraft@example.org',
  plz: '10115',
  organisation: 'Beispiel-Oberschule',
  datenschutzGelesen: true,
  website: '',
};

const privat = {
  idempotencyKey: KEY,
  art: 'privat',
  geraeteart: 'laptop',
  anzahl: 1,
  zweck: 'Schule und Hausaufgaben',
  name: 'Max',
  email: 'max@example.org',
  plz: '80331',
  nachweis: 'buergergeld',
  datenschutzGelesen: true,
  website: '',
};

describe('leseAntrag (Kurum)', () => {
  it('accepts a complete institutional request and fixes the Nachweis to Einrichtung', () => {
    const r = leseAntrag(kurum);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.antrag.art).toBe('kurum');
      expect(r.antrag.nachweis).toBe('einrichtung');
      expect(r.antrag.organisation).toBe('Beispiel-Oberschule');
    }
  });

  it('requires the institution name', () => {
    expect(leseAntrag({ ...kurum, organisation: '' }).ok).toBe(false);
  });
});

describe('leseAntrag (privat)', () => {
  it('accepts a private request with one Bescheid type', () => {
    const r = leseAntrag(privat);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.antrag.nachweis).toBe('buergergeld');
  });

  it('stores only the first two digits of the PLZ', () => {
    const r = leseAntrag(privat);
    if (r.ok) expect(r.antrag.plzRegion).toBe('80');
  });

  it('rejects a self-declaration instead of a Bescheid', () => {
    expect(leseAntrag({ ...privat, nachweis: 'einrichtung' }).ok).toBe(false);
    expect(leseAntrag({ ...privat, nachweis: 'eigene_erklaerung' }).ok).toBe(false);
  });

  it('does not accept a missing Nachweis', () => {
    const { nachweis: _, ...ohne } = privat;
    expect(leseAntrag(ohne).ok).toBe(false);
  });

  it('keeps the form to one person and one device type per request', () => {
    expect(leseAntrag({ ...privat, anzahl: 0 }).ok).toBe(false);
    expect(leseAntrag({ ...privat, anzahl: 11 }).ok).toBe(false);
    expect(leseAntrag({ ...privat, anzahl: 1.5 }).ok).toBe(false);
  });
});

describe('leseAntrag (gemeinsam)', () => {
  it('requires the Datenschutz confirmation', () => {
    expect(leseAntrag({ ...privat, datenschutzGelesen: false }).ok).toBe(false);
  });

  it('rejects a filled honeypot', () => {
    expect(leseAntrag({ ...privat, website: 'http://spam.example' }).ok).toBe(false);
  });

  it('rejects an invalid idempotency key and a 5-digit PLZ that is not numeric', () => {
    expect(leseAntrag({ ...privat, idempotencyKey: 'abc' }).ok).toBe(false);
    expect(leseAntrag({ ...privat, plz: '8033A' }).ok).toBe(false);
  });

  it('does not accept unknown fields as data', () => {
    const r = leseAntrag({ ...privat, adresse: 'Musterstraße 1', geburtsdatum: '2010-01-01' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(JSON.stringify(r.antrag)).not.toMatch(/Musterstraße|2010-01-01/);
  });
});

describe('antragsnummer', () => {
  it('uses the WW-A- prefix, year and six digits', () => {
    expect(antragsnummer(2027, 42)).toBe('WW-A-2027-000042');
  });
});

describe('loeschfrist', () => {
  const am = new Date('2027-03-01T10:00:00Z');

  it('deletes rejected applications 14 days after the decision', () => {
    expect(loeschfrist('abgelehnt', am)?.toISOString()).toBe('2027-03-15T10:00:00.000Z');
  });

  it('has no fixed period for other categories yet (plan §9)', () => {
    expect(loeschfrist('offen', am)).toBeNull();
    expect(loeschfrist('abgeschlossen', am)).toBeNull();
  });
});

describe('test store', () => {
  it('returns the same number for the same idempotency key', async () => {
    const s = erstelleTestSpeicher();
    const parsed = leseAntrag(privat);
    if (!parsed.ok) throw new Error('fixture invalid');
    const a = await s.speichere(parsed.antrag, 7, 2027);
    const b = await s.speichere(parsed.antrag, 99, 2027);
    expect(a).toEqual({ antragsnummer: 'WW-A-2027-000007', neu: true });
    expect(b).toEqual({ antragsnummer: 'WW-A-2027-000007', neu: false });
  });
});
