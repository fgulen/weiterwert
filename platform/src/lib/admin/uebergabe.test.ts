import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { baueUebergabeprotokoll } from './vorgangsblatt';
import type { VorgangDaten } from './vorgang';

const beispiel = {
  id: 'd21ad96a-0000-0000-0000-000000000000',
  kontaktId: 'k-1',
  vorgangsnummer: 'WW-2026-123456',
  status: 'neu',
  angelegt: '2026-11-12',
  regelVersion: 'regel-v1',
  erklaerungVersion: 'erklaerungen-v1',
  erklaerungHash: 'abc',
  kontakt: { name: 'Erika Muster', email: 'erika@example.de', plz: '50667', telefon: null, organisation: null },
  geraete: [{ position: 1, typ: 'laptop', marke: 'Lenovo', modell: 'T14', angaben: {}, ergebnis: 'angaben', gruende: [] }],
} as unknown as VorgangDaten;

describe('baueUebergabeprotokoll', () => {
  it('builds a PDF with the handover title and the signature block', async () => {
    const pdf = await baueUebergabeprotokoll(beispiel, new Date('2026-11-13T12:00:00Z'));
    const doc = await PDFDocument.load(pdf);
    expect(doc.getTitle()).toBe('Übergabeprotokoll WW-2026-123456');
    expect(doc.getPageCount()).toBeGreaterThan(0);
  });
});
