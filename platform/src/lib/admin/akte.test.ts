import { describe, expect, it } from 'vitest';
import { hatEntsorgung, hatLoeschung, pruefeAkte } from './akte';
import { envanterCsv } from './belege';
import type { VorgangDaten } from './vorgang';

describe('pruefeAkte', () => {
  it('turns empty fields into null and trims text', () => {
    const { werte, fehler } = pruefeAkte({ seriennummer: '  SN-1  ', lagerort: '   ' });
    expect(werte.seriennummer).toBe('SN-1');
    expect(werte.lagerort).toBeNull();
    expect(fehler).toEqual({});
  });

  it('rejects dates that are not YYYY-MM-DD and unknown choices', () => {
    const { fehler } = pruefeAkte({ loeschdatum: '13.11.2026', zustand: 'Kaputt', loeschverfahren: 'egal' });
    expect(fehler.loeschdatum).toBeDefined();
    expect(fehler.zustand).toBeDefined();
    expect(fehler.loeschverfahren).toBeDefined();
  });

  it('accepts the listed choices and a correct date', () => {
    const { fehler } = pruefeAkte({ zustand: 'Gut', loeschverfahren: 'Keine Daten gespeichert', loeschdatum: '2026-11-13' });
    expect(fehler).toEqual({});
  });
});

describe('hatLoeschung / hatEntsorgung', () => {
  const leer = pruefeAkte({}).werte;
  it('needs method, date and person for a deletion entry', () => {
    expect(hatLoeschung({ ...leer, loeschverfahren: 'Keine Daten gespeichert', loeschdatum: '2026-11-13' })).toBe(false);
    expect(hatLoeschung({ ...leer, loeschverfahren: 'Keine Daten gespeichert', loeschdatum: '2026-11-13', loeschperson: 'Fatih' })).toBe(true);
  });
  it('needs route and proof number for a disposal entry', () => {
    expect(hatEntsorgung({ ...leer, entsorgungsweg: 'Recycling über Entsorgungsfachbetrieb' })).toBe(false);
    expect(hatEntsorgung({ ...leer, entsorgungsweg: 'Recycling über Entsorgungsfachbetrieb', nachweisnummer: 'EN-7' })).toBe(true);
  });
});

describe('envanterCsv', () => {
  it('writes a BOM, a header and one line per device with quoted separators', () => {
    const akte = pruefeAkte({ seriennummer: 'SN;1', zustand: 'Gut', lagerort: 'Regal "A"' }).werte;
    const v = {
      vorgangsnummer: 'WW-2026-123456',
      geraete: [{ id: 'x', position: 1, typ: 'laptop', marke: 'Lenovo', modell: 'T14', akte }],
    } as unknown as VorgangDaten;
    const csv = envanterCsv([v]);
    expect(csv.startsWith('﻿')).toBe(true);
    const zeilen = csv.replace('﻿', '').trim().split('\r\n');
    expect(zeilen[0]).toContain('Seriennummer');
    expect(zeilen[1]).toContain('"SN;1"');
    expect(zeilen[1]).toContain('"Regal ""A"""');
  });
});
