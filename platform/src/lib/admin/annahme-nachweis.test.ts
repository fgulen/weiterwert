import { describe, expect, it } from 'vitest';
import { kettenHash, pruefeAnnahme, type AnnahmeDaten } from './annahme-nachweis';

const gueltig: AnnahmeDaten = {
  geraete: [{ position: 1, zustand: 'gut', datentraeger: 'nein' }],
  sicherheit: [true, true, true, true, true, true, true],
  entscheidung: 'vollstaendig',
  grund: '',
  unterzeichner: 'Anna',
  unterschrift: 'data:image/png;base64,iVBORw0KGgo=',
};

describe('Annahme: Prüfung der Eingaben', () => {
  it('vollständige Eingaben sind gültig', () => {
    expect(pruefeAnnahme(gueltig)).toEqual([]);
  });

  it('unbeantwortete Sicherheitspunkte blockieren', () => {
    expect(pruefeAnnahme({ ...gueltig, sicherheit: [true, null, true, true, true, true, true] })).toContain('sicherheit');
  });

  it('fehlender Zustand oder Datenträger blockiert', () => {
    const fehler = pruefeAnnahme({ ...gueltig, geraete: [{ position: 2, zustand: null, datentraeger: null }] });
    expect(fehler).toContain('zustand_2');
    expect(fehler).toContain('datentraeger_2');
  });

  it('Ablehnung braucht einen Grund', () => {
    expect(pruefeAnnahme({ ...gueltig, entscheidung: 'ablehnung', grund: '  ' })).toContain('grund');
    expect(pruefeAnnahme({ ...gueltig, entscheidung: 'ablehnung', grund: 'Akku geschwollen' })).toEqual([]);
  });

  it('ohne Unterschrift oder Unterzeichner geht es nicht', () => {
    expect(pruefeAnnahme({ ...gueltig, unterschrift: '' })).toContain('unterschrift');
    expect(pruefeAnnahme({ ...gueltig, unterzeichner: '' })).toContain('unterzeichner');
  });

  it('ohne Geräte geht es nicht', () => {
    expect(pruefeAnnahme({ ...gueltig, geraete: [] })).toContain('keine_geraete');
  });
});

describe('Annahme: Hash-Kette', () => {
  it('gleiche Eingaben ergeben denselben Hash', () => {
    expect(kettenHash(null, { a: 1 }, 'z', 'n')).toBe(kettenHash(null, { a: 1 }, 'z', 'n'));
  });

  it('eine Änderung ändert den Hash', () => {
    expect(kettenHash(null, { a: 1 }, 'z', 'n')).not.toBe(kettenHash(null, { a: 2 }, 'z', 'n'));
  });

  it('der vorherige Hash fließt ein: Kette bricht bei Änderung des alten Eintrags', () => {
    const h1 = kettenHash(null, { schritt: 1 }, 'z1', 'anna');
    const h2 = kettenHash(h1, { schritt: 2 }, 'z2', 'anna');
    const h1_verfaelscht = kettenHash(null, { schritt: 1, x: true }, 'z1', 'anna');
    expect(kettenHash(h1_verfaelscht, { schritt: 2 }, 'z2', 'anna')).not.toBe(h2);
  });
});
