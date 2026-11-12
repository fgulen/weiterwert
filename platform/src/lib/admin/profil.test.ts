import { describe, expect, it } from 'vitest';
import { normalisiereCode, pruefePasswortWechsel, pruefeStaerke, sicheresQr } from './profil';

describe('pruefePasswortWechsel', () => {
  const gut = 'Ein-langes-Passwort1';
  it('accepts a valid change', () => expect(pruefePasswortWechsel('alt', gut, gut)).toBeNull());
  it('needs all fields', () => expect(pruefePasswortWechsel('', gut, gut)).toBe('leer'));
  it('enforces minimum length', () => expect(pruefePasswortWechsel('alt', 'kurz', 'kurz')).toBe('zu-kurz'));
  it('enforces maximum length', () => expect(pruefePasswortWechsel('alt', 'x'.repeat(73), 'x'.repeat(73))).toBe('zu-lang'));
  it('needs matching repeat', () => expect(pruefePasswortWechsel('alt', gut, gut + '1')).toBe('ungleich'));
  it('needs upper case, lower case and a digit', () => {
    expect(pruefePasswortWechsel('alt', 'nurkleinbuchstaben', 'nurkleinbuchstaben')).toBe('schwach');
    expect(pruefePasswortWechsel('alt', 'NURGROSS12345', 'NURGROSS12345')).toBe('schwach');
    expect(pruefePasswortWechsel('alt', 'KeinZahlHier', 'KeinZahlHier')).toBe('schwach');
  });
  it('rejects same as old', () => expect(pruefePasswortWechsel(gut, gut, gut)).toBe('gleich'));
});

describe('normalisiereCode', () => {
  it('accepts 6 digits, ignores spaces', () => {
    expect(normalisiereCode('123456')).toBe('123456');
    expect(normalisiereCode('123 456')).toBe('123456');
  });
  it('rejects anything else', () => {
    for (const c of ['', '12345', '1234567', 'abcdef', '12345a']) expect(normalisiereCode(c)).toBeNull();
  });
});

describe('sicheresQr', () => {
  it('only allows svg data urls', () => {
    expect(sicheresQr('data:image/svg+xml;utf-8,<svg/>')).not.toBeNull();
    expect(sicheresQr('https://evil.example/x.svg')).toBeNull();
    expect(sicheresQr('javascript:alert(1)')).toBeNull();
    expect(sicheresQr(undefined)).toBeNull();
  });
});

describe('pruefeStaerke', () => {
  it('accepts a strong password', () => expect(pruefeStaerke('Starkes-Passwort9')).toBeNull());
  it('reports length first', () => expect(pruefeStaerke('Ab1')).toBe('zu-kurz'));
});
