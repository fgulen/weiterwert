import { describe, expect, it } from 'vitest';
import { zweiteFreigabeOk } from './zweite-freigabe-regel';

describe('Zweite Freigabe (Punkt 13)', () => {
  it('zwei verschiedene Admins sind erlaubt', () => {
    expect(zweiteFreigabeOk('anna@x.de', 'ben@x.de', 'admin')).toEqual({ ok: true });
  });

  it('dieselbe Person ist nicht erlaubt, auch mit anderer Groß-/Kleinschreibung', () => {
    expect(zweiteFreigabeOk('Anna@x.de', ' anna@x.de ', 'admin')).toEqual({ ok: false, grund: 'gleiche_person' });
  });

  it('Mitarbeiter als zweite Person ist erlaubt', () => {
    expect(zweiteFreigabeOk('anna@x.de', 'ben@x.de', 'mitarbeiter')).toEqual({ ok: true });
  });

  it('ohne Rolle oder mit fremder Rolle wird abgelehnt', () => {
    expect(zweiteFreigabeOk('anna@x.de', 'ben@x.de', undefined)).toEqual({ ok: false, grund: 'keine_berechtigung' });
    expect(zweiteFreigabeOk('anna@x.de', 'ben@x.de', 'spender')).toEqual({ ok: false, grund: 'keine_berechtigung' });
  });
});
