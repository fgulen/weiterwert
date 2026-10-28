import { describe, expect, it } from 'vitest';
import { geraeteText, statusText } from './anzeige';

describe('statusText', () => {
  it('shows German labels for known statuses', () => {
    expect(statusText('neu')).toBe('Neu');
    expect(statusText('uebergeben')).toBe('Übergeben');
  });
  it('keeps unknown statuses unchanged', () => {
    expect(statusText('wartet')).toBe('wartet');
  });
});

describe('geraeteText', () => {
  it('shows German device names', () => {
    expect(geraeteText('laptop')).toBe('Laptop');
    expect(geraeteText('tablet')).toBe('Tablet');
  });
  it('keeps unknown types unchanged', () => {
    expect(geraeteText('drucker')).toBe('drucker');
  });
});
