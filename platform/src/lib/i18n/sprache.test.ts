import { describe, expect, it } from 'vitest';
import { pfadFuer, trenneSprache } from './sprache';
import { UI } from './ui';

describe('trenneSprache', () => {
  it('keeps German paths as they are', () => {
    expect(trenneSprache('/spenden')).toEqual({ lang: 'de', rest: '/spenden' });
    expect(trenneSprache('/')).toEqual({ lang: 'de', rest: '/' });
  });
  it('removes the Turkish and English prefix', () => {
    expect(trenneSprache('/tr/spenden')).toEqual({ lang: 'tr', rest: '/spenden' });
    expect(trenneSprache('/en/beantragen/x')).toEqual({ lang: 'en', rest: '/beantragen/x' });
    expect(trenneSprache('/en')).toEqual({ lang: 'en', rest: '/' });
  });
  it('does not treat similar names as a language', () => {
    expect(trenneSprache('/trial')).toEqual({ lang: 'de', rest: '/trial' });
    expect(trenneSprache('/english')).toEqual({ lang: 'de', rest: '/english' });
  });
});

describe('pfadFuer', () => {
  it('builds German paths without prefix', () => {
    expect(pfadFuer('de', '/spenden')).toBe('/spenden');
    expect(pfadFuer('de', '/')).toBe('/');
  });
  it('adds the prefix for Turkish and English', () => {
    expect(pfadFuer('tr', '/spenden')).toBe('/tr/spenden');
    expect(pfadFuer('en', '/')).toBe('/en');
  });
});

describe('UI texts', () => {
  it('have a non-empty text for every key in Turkish and English', () => {
    for (const lang of ['tr', 'en'] as const) {
      for (const [key, wert] of Object.entries(UI[lang])) {
        if (key === 'nurDeutsch') continue;
        expect(wert, `${lang}.${key}`).not.toBe('');
      }
    }
  });
});
