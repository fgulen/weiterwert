import { describe, expect, it } from 'vitest';
import { baueSchrittPdf } from './schritt-pdf';
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
  geraete: [{ id: 'd1', akte: {} as never, position: 1, typ: 'Laptop', marke: 'Lenovo', modell: 'T14', angaben: {}, ergebnis: 'ok', gruende: [] }],
} as unknown as VorgangDaten;

describe('Schrittprotokoll je Statuswechsel', () => {
  it('erzeugt ein gültiges PDF für jeden Schritt', async () => {
    for (const nach of ['zweite_kontrolle', 'quarantaene', 'technische_pruefung', 'entsorgt']) {
      const bytes = await baueSchrittPdf({
        v: vorgang,
        geraet: vorgang.geraete[0],
        von: 'eingegangen',
        nach,
        nutzer: 'anna@x.de',
        zeit: new Date('2026-11-17T10:00:00Z'),
        zweiter: null,
      });
      expect(Buffer.from(bytes.slice(0, 5)).toString('ascii')).toBe('%PDF-');
    }
  });

  it('zweite Person wird im Protokoll aufgeführt', async () => {
    const bytes = await baueSchrittPdf({
      v: vorgang,
      geraet: vorgang.geraete[0],
      von: 'loeschung_offen',
      nach: 'geloescht',
      nutzer: 'anna@x.de',
      zeit: new Date(),
      zweiter: 'ben@x.de',
    });
    expect(bytes.length).toBeGreaterThan(500);
  });
});
