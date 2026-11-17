import { describe, expect, it } from 'vitest';
import { baueAnnahmeFormular } from './annahme-formular';
import type { VorgangDaten } from './vorgang';

const vorgang = {
  id: 'x',
  vorgangsnummer: 'WW-2026-000001',
  status: 'neu',
  angelegt: '2026-11-01T10:00:00Z',
  regelVersion: 'r1',
  erklaerungVersion: 'e1',
  erklaerungHash: 'h',
  kontaktId: 'k',
  kontakt: { name: 'Test', email: 'test@example.invalid', plz: '10115', telefon: null, organisation: null },
  geraete: [
    { id: 'd1', akte: {} as never, position: 1, typ: 'Laptop', marke: 'Lenovo', modell: 'T14', angaben: {}, ergebnis: 'ok', gruende: [] },
    { id: 'd2', akte: {} as never, position: 2, typ: 'Monitor', marke: null, modell: null, angaben: {}, ergebnis: 'ok', gruende: [] },
  ],
} as unknown as VorgangDaten;

describe('Geräteannahmeprotokoll nach Vorlage 18', () => {
  it('erzeugt ein gültiges PDF mit mehreren Geräten', async () => {
    const bytes = await baueAnnahmeFormular(vorgang, new Date('2026-11-17T10:00:00Z'));
    expect(Buffer.from(bytes.slice(0, 5)).toString('ascii')).toBe('%PDF-');
    expect(bytes.length).toBeGreaterThan(1000);
  });

  it('erzeugt ein PDF auch ohne Geräte', async () => {
    const bytes = await baueAnnahmeFormular({ ...vorgang, geraete: [] } as VorgangDaten, new Date());
    expect(Buffer.from(bytes.slice(0, 5)).toString('ascii')).toBe('%PDF-');
  });
});
