import { describe, expect, it } from 'vitest';
import { braucht2Personen, pruefeLoeschung, pruefeUebergabe, type LoeschungDaten, type UebergabeDaten } from './nachweis-regeln';

const png = 'data:image/png;base64,iVBORw0KGgo=';

describe('Übergabe (Dok. 28): Prüfung', () => {
  const gueltig: UebergabeDaten = {
    kontrolle: [true, true, true, true, true, true],
    empfaenger: 'Max Muster',
    unterzeichner: 'anna@x.de',
    unterschriftEmpfaenger: png,
  };

  it('vollständig ist gültig', () => {
    expect(pruefeUebergabe(gueltig)).toEqual([]);
  });

  it('unbeantwortete Kontrollpunkte blockieren', () => {
    expect(pruefeUebergabe({ ...gueltig, kontrolle: [true, null, true, true, true, true] })).toContain('kontrolle');
  });

  it('ohne Empfänger oder Unterschrift geht es nicht', () => {
    expect(pruefeUebergabe({ ...gueltig, empfaenger: ' ' })).toContain('empfaenger');
    expect(pruefeUebergabe({ ...gueltig, unterschriftEmpfaenger: '' })).toContain('unterschrift');
  });
});

describe('Löschung (Dok. 07): Prüfung', () => {
  const erfolg = (position: number) => ({
    position,
    verfahren: 'ssd' as const,
    verifiziert: true,
    werkzeug: 'nwipe 0.36',
    ergebnis: 'erfolgreich' as const,
    bemerkung: '',
  });

  it('erfolgreiche und verifizierte Löschung braucht keine zweite Person', () => {
    expect(pruefeLoeschung({ geraete: [erfolg(1)], unterzeichner: 'anna@x.de', zweiter: null })).toEqual([]);
    expect(braucht2Personen(erfolg(1))).toBe(false);
  });

  it('fehlgeschlagene Löschung braucht zweite Person und Bemerkung', () => {
    const fehl = { ...erfolg(1), ergebnis: 'fehlgeschlagen' as const, verifiziert: false, bemerkung: 'Sektoren nicht lesbar' };
    expect(braucht2Personen(fehl)).toBe(true);
    expect(pruefeLoeschung({ geraete: [fehl], unterzeichner: 'anna@x.de', zweiter: null })).toContain('zweiter_fehlt');
    expect(pruefeLoeschung({ geraete: [fehl], unterzeichner: 'anna@x.de', zweiter: 'anna@x.de' })).toContain('zweiter_gleich');
    expect(pruefeLoeschung({ geraete: [fehl], unterzeichner: 'anna@x.de', zweiter: 'ben@x.de' })).toEqual([]);
  });

  it('Erfolg ohne Verifikation wird abgelehnt', () => {
    expect(pruefeLoeschung({ geraete: [{ ...erfolg(1), verifiziert: false }], unterzeichner: 'anna@x.de', zweiter: null })).toContain('erfolg_unverifiziert_1');
  });

  it('fehlendes Verfahren und Werkzeug blockieren', () => {
    const fehler = pruefeLoeschung({ geraete: [{ ...erfolg(2), verfahren: null, werkzeug: '' }], unterzeichner: 'anna@x.de', zweiter: null } as LoeschungDaten);
    expect(fehler).toContain('verfahren_2');
    expect(fehler).toContain('werkzeug_2');
  });
});
