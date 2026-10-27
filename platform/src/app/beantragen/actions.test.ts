import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { sendeAntrag } from './actions';

const KEY = '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e';
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

const alteUmgebung = process.env.NEXT_PUBLIC_APP_ENV;
beforeEach(() => {
  process.env.NEXT_PUBLIC_APP_ENV = 'test';
});
afterEach(() => {
  process.env.NEXT_PUBLIC_APP_ENV = alteUmgebung;
});

describe('sendeAntrag (test environment)', () => {
  it('returns an antragsnummer for a valid request', async () => {
    const r = await sendeAntrag(privat);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.antragsnummer).toMatch(/^WW-A-\d{4}-\d{6}$/);
  });

  it('returns the same number when the same request is sent twice', async () => {
    const a = await sendeAntrag({ ...privat, idempotencyKey: '11111111-2222-4333-8444-555555555555' });
    const b = await sendeAntrag({ ...privat, idempotencyKey: '11111111-2222-4333-8444-555555555555' });
    expect(a.ok && b.ok && a.antragsnummer === (b as { antragsnummer: string }).antragsnummer).toBe(true);
  });

  it('rejects an invalid request with the message for the applicant', async () => {
    const r = await sendeAntrag({ ...privat, nachweis: 'eigene_erklaerung' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fehler).toMatch(/Nachweis/);
  });
});

describe('sendeAntrag (production)', () => {
  it('refuses to save while no request store is configured', async () => {
    process.env.NEXT_PUBLIC_APP_ENV = 'production';
    const r = await sendeAntrag(privat);
    expect(r.ok).toBe(false);
  });
});
