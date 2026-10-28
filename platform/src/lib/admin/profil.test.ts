import { describe, expect, it } from 'vitest';
import { normalisiereCode, pruefePasswortWechsel, sicheresQr } from './profil';

describe('pruefePasswortWechsel', () => {
  const gut = 'ein-langes-passwort';
  it('accepts a valid change', () => expect(pruefePasswortWechsel('alt', gut, gut)).toBeNull());
  it('needs all fields', () => expect(pruefePasswortWechsel('', gut, gut)).toBe('leer'));
  it('enforces minimum length', () => expect(pruefePasswortWechsel('alt', 'kurz', 'kurz')).toBe('zu-kurz'));
  it('enforces maximum length', () => expect(pruefePasswortWechsel('alt', 'x'.repeat(73), 'x'.repeat(73))).toBe('zu-lang'));
  it('needs matching repeat', () => expect(pruefePasswortWechsel('alt', gut, gut + '1')).toBe('ungleich'));
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
