import { describe, expect, it } from 'vitest';
import { baueUebergabeFormular } from './uebergabe-formular';
import type { VorgangDaten } from './vorgang';

const vorgang = {
  id: 'x',
  vorgangsnummer: 'WW-2026-000001',
  status: 'uebergeben',
  angelegt: '2026-11-01T10:00:00Z',
  regelVersion: 'r1',
  erklaerungVersion: 'e1',
  erklaerungHash: 'h',
  kontaktId: 'k',
  kontakt: { name: 'Test', email: 'test@example.invalid', plz: '10115', telefon: null, organisation: null },
  geraete: [
    {
      id: 'd1',
      akte: {} as never,
      position: 1,
      typ: 'Laptop',
      marke: 'Lenovo',
      modell: 'T14',
      angaben: {},
      ergebnis: 'ok',
      gruende: [],
    },
  ],
} as unknown as VorgangDaten;

describe('Übergabeprotokoll nach Vorlage 28', () => {
  it('erzeugt ein gültiges PDF', async () => {
    const bytes = await baueUebergabeFormular(vorgang, new Date('2026-11-17T10:00:00Z'));
    expect(Buffer.from(bytes.slice(0, 5)).toString('ascii')).toBe('%PDF-');
    expect(bytes.length).toBeGreaterThan(1000);
  });
});
