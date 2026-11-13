import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { baueEntsorgungsnachweis, baueLoeschprotokoll } from './belege';
import { pruefeAkte } from './akte';
import type { VorgangDaten } from './vorgang';

const akte = pruefeAkte({
  seriennummer: 'PF-2X91HK', zustand: 'Gut', lagerort: 'Regal B3', loeschverfahren: 'Software-Löschung (Wipe)',
  loeschdatum: '2026-11-13', loeschperson: 'Fatih Gülen', entsorgungsweg: 'Recycling über Entsorgungsfachbetrieb',
  entsorger: 'EcoRecycle GmbH', nachweisnummer: 'EN-2026-0042', entsorgungsdatum: '2026-11-14',
}).werte;

const v = {
  vorgangsnummer: 'WW-2026-123456',
  geraete: [{ id: 'g1', position: 1, typ: 'laptop', marke: 'Lenovo', modell: 'T14', angaben: {}, ergebnis: 'angaben', gruende: [], akte }],
} as unknown as VorgangDaten;

describe('device documents', () => {
  it('builds the deletion log PDF', async () => {
    const pdf = await baueLoeschprotokoll(v, new Date('2026-11-13T12:00:00Z'));
    const doc = await PDFDocument.load(pdf);
    expect(doc.getTitle()).toBe('Löschprotokoll WW-2026-123456');
  });
  it('builds the disposal proof PDF', async () => {
    const pdf = await baueEntsorgungsnachweis(v, new Date('2026-11-13T12:00:00Z'));
    const doc = await PDFDocument.load(pdf);
    expect(doc.getTitle()).toBe('Entsorgungsnachweis WW-2026-123456');
  });
});
