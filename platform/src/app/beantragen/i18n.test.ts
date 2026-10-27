import { describe, expect, it } from 'vitest';
import { SPRACHEN, TEXTE } from './i18n';

describe('request form texts', () => {
  it('has the same keys in German, Turkish and English', () => {
    const keys = (o: object) => Object.keys(o).sort();
    const de = TEXTE.de;
    for (const s of SPRACHEN) {
      expect(keys(TEXTE[s])).toEqual(keys(de));
      expect(keys(TEXTE[s].nachweisOptionen)).toEqual(keys(de.nachweisOptionen));
    }
  });

  it('has no empty text', () => {
    for (const s of SPRACHEN) {
      for (const [k, v] of Object.entries(TEXTE[s])) {
        if (typeof v === 'string') expect(v.trim(), `${s}.${k}`).not.toBe('');
      }
    }
  });
});
