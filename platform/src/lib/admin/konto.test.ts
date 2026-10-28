import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { entferneFaktor, ladeKonto, pruefeCode, pruefePasswort, setzePasswort, starteEinrichtung } from './konto';

const ok = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
const nein = () => Promise.resolve(new Response('{}', { status: 400 }));

describe('konto (Supabase mocked)', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://sb.test');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('ladeKonto maps factors and sends the user token', async () => {
    fetchMock.mockReturnValueOnce(ok({ email: 'a@b.de', factors: [{ id: 'f1', status: 'verified', factor_type: 'totp', friendly_name: 'Tel' }] }));
    const k = await ladeKonto('tok');
    expect(k).toEqual({ email: 'a@b.de', faktoren: [{ id: 'f1', status: 'verified', name: 'Tel' }] });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer tok');
  });

  it('ladeKonto returns null on rejected token', async () => {
    fetchMock.mockReturnValueOnce(nein());
    expect(await ladeKonto('bad')).toBeNull();
  });

  it('pruefePasswort returns null for a wrong password', async () => {
    fetchMock.mockReturnValueOnce(nein());
    expect(await pruefePasswort('a@b.de', 'falsch')).toBeNull();
  });

  it('pruefeCode does challenge then verify and returns the aal2 token', async () => {
    fetchMock.mockReturnValueOnce(ok({ id: 'ch1' })).mockReturnValueOnce(ok({ access_token: 'aal2', expires_in: 100 }));
    expect(await pruefeCode('tok', 'f1', '123456')).toEqual({ token: 'aal2', laufzeit: 100 });
    expect(fetchMock.mock.calls[0][0]).toBe('https://sb.test/auth/v1/factors/f1/challenge');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ challenge_id: 'ch1', code: '123456' });
  });

  it('pruefeCode returns null on a wrong code', async () => {
    fetchMock.mockReturnValueOnce(ok({ id: 'ch1' })).mockReturnValueOnce(nein());
    expect(await pruefeCode('tok', 'f1', '000000')).toBeNull();
  });

  it('starteEinrichtung asks for a totp factor', async () => {
    fetchMock.mockReturnValueOnce(ok({ id: 'f2', totp: { qr_code: 'data:image/svg+xml;utf-8,<svg/>', secret: 'ABC', uri: 'otpauth://x' } }));
    const e = await starteEinrichtung('tok', 'n');
    expect(e?.faktorId).toBe('f2');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).factor_type).toBe('totp');
  });

  it('entferneFaktor and setzePasswort report failure', async () => {
    fetchMock.mockReturnValue(nein());
    expect(await entferneFaktor('t', 'f')).toBe(false);
    expect(await setzePasswort('t', 'x')).toBe(false);
  });

  it('does nothing without Supabase settings', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    expect(await ladeKonto('t')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
