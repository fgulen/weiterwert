import { describe, expect, it } from 'vitest';
import { istAdminRolle } from './rollen';

describe('istAdminRolle', () => {
  it('accepts the two admin roles', () => {
    expect(istAdminRolle('admin')).toBe(true);
    expect(istAdminRolle('mitarbeiter')).toBe(true);
  });
  it('rejects anything else, including missing roles', () => {
    expect(istAdminRolle(undefined)).toBe(false);
    expect(istAdminRolle('user')).toBe(false);
    expect(istAdminRolle('Admin')).toBe(false);
    expect(istAdminRolle(null)).toBe(false);
  });
});
