import { describe, expect, it } from 'vitest';
import { istErlaubterWechsel, naechsteStatus } from './status';

describe('status flow', () => {
  it('allows only the next step', () => {
    expect(istErlaubterWechsel('neu', 'geprueft')).toBe(true);
    expect(istErlaubterWechsel('neu', 'uebergeben')).toBe(false);
  });
  it('never goes back', () => {
    expect(istErlaubterWechsel('geprueft', 'neu')).toBe(false);
    expect(istErlaubterWechsel('abgeschlossen', 'uebergeben')).toBe(false);
  });
  it('closed cases have no next step', () => {
    expect(naechsteStatus('abgeschlossen')).toEqual([]);
  });
  it('unknown status has no next step', () => {
    expect(naechsteStatus('wartet')).toEqual([]);
  });
});
