import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { baueVorgangsblatt } from './vorgangsblatt';
import type { VorgangDaten } from './vorgang';

const beispiel: VorgangDaten = {
  id: 'd21ad96a-0000-0000-0000-000000000000',
  kontaktId: 'k-1',
  vorgangsnummer: 'WW-2026-123456',
  status: 'neu',
  angelegt: '2026-11-12',
  regelVersion: 'regel-v1',
  erklaerungVersion: 'erklaerungen-v1',
  erklaerungHash: 'a'.repeat(64),
  kontakt: { name: 'Şükrü Ğülİ', email: 'test@example.com', plz: '10115', telefon: null, organisation: 'Schule İzmir' },
  geraete: Array.from({ length: 12 }, (_, i) => ({
    id: `g-${i + 1}`,
    akte: { seriennummer: null, loeschverfahren: null, loeschdatum: null, loeschperson: null, lagerort: null, zustand: null, entsorgungsweg: null, entsorger: null, nachweisnummer: null, entsorgungsdatum: null },
    position: i + 1,
    typ: 'laptop',
    marke: 'Lenovo',
    modell: `ThinkPad T${i}`,
    angaben: { alter: '4-6', startet: 'ja', display: 'ok', akku: 'schwach', sperren: 'keine', eigentum: 'ja', ram: '4' },
    ergebnis: 'angaben',
    gruende: ['Akku schwach – Angaben zur Prüfung nötig'],
  })),
};

describe('baueVorgangsblatt', () => {
  it('returns a valid PDF with one page per filled section, including Turkish characters', async () => {
    const bytes = await baueVorgangsblatt(beispiel, new Date('2026-11-12T10:00:00Z'));
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-');
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(2);
    expect(pdf.getTitle()).toBe('Vorgangsblatt WW-2026-123456');
  });
});
