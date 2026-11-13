import { describe, expect, it } from 'vitest';
import { EMAIL_FORMAT } from './email';

describe('EMAIL_FORMAT', () => {
  it('accepts normal addresses', () => {
    expect(EMAIL_FORMAT.test('erika@example.de')).toBe(true);
    expect(EMAIL_FORMAT.test('a.b+c@sub.example.co')).toBe(true);
  });
  it('rejects spaces, markup and missing parts', () => {
    expect(EMAIL_FORMAT.test('erika example@x.de')).toBe(false);
    expect(EMAIL_FORMAT.test('erika@<script>.de')).toBe(false);
    expect(EMAIL_FORMAT.test('erika@')).toBe(false);
    expect(EMAIL_FORMAT.test('@example.de')).toBe(false);
    expect(EMAIL_FORMAT.test('erika@example')).toBe(false);
  });
});
