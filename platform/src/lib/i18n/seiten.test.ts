import { describe, expect, it } from 'vitest';
import { CHECK } from './check';
import { KRITERIEN_TEXTE } from './kriterien';
import { SEITEN } from './seiten';
import { pfade, texte } from './widen';

const SPRACHEN = ['tr', 'en'] as const;
const woerterbuecher = { SEITEN, CHECK, KRITERIEN_TEXTE };

describe.each(Object.entries(woerterbuecher))('%s', (_name, wb) => {
  it.each(SPRACHEN)('has the same keys, list lengths and rows in %s as in German', (s) => {
    expect(pfade(wb[s])).toEqual(pfade(wb.de));
  });

  it.each(SPRACHEN)('has no empty text in %s', (s) => {
    for (const t of texte(wb[s])) expect(t.trim(), `${s}`).not.toBe('');
  });

  it.each(SPRACHEN)('keeps the placeholders of the German text in %s', (s) => {
    const platz = (o: unknown) => texte(o).map((t) => (t.match(/\{\w+\}/g) ?? []).sort().join(','));
    expect(platz(wb[s])).toEqual(platz(wb.de));
  });
});

describe('criteria tables', () => {
  it.each(SPRACHEN)('keep the rows that have a "not suitable" column in %s', (s) => {
    const form = (l: 'de' | 'tr' | 'en') => KRITERIEN_TEXTE[l].tabellen.map((t) => t.zeilen.map((z) => Boolean(z.nichtGeeignet)));
    expect(form(s)).toEqual(form('de'));
  });
});

describe('pre-check reasons', () => {
  it('has a text for every reason code', () => {
    for (const s of ['de', 'tr', 'en'] as const) {
      expect(Object.keys(CHECK[s].gruende).length).toBe(19);
    }
  });
});
