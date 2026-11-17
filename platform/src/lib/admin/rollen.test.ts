import { describe, expect, it } from 'vitest';
import { schrittErlaubt, schrittFuerStatus, type Schritt } from './rollen';

// Erwartung nach geraet-prozess.ts (Spalte "wer") und den Dokumenten 07, 18, 28.
describe('Rollen je Schritt entsprechen dem Gesamtprozess', () => {
  it('admin darf alles', () => {
    const alle: Schritt[] = ['eingang', 'zweite', 'annahme', 'loeschung', 'technik', 'freigabe', 'uebergabe', 'rueckgabe', 'abschluss'];
    for (const s of alle) expect(schrittErlaubt('admin', s)).toBe(true);
  });

  it('technik: Eingang, Löschung, technische Prüfung, Übergabe; nicht Zweite Kontrolle, Freigabe, Rückgabe, Abschluss', () => {
    expect(schrittErlaubt('technik', 'eingang')).toBe(true);
    expect(schrittErlaubt('technik', 'loeschung')).toBe(true);
    expect(schrittErlaubt('technik', 'technik')).toBe(true);
    expect(schrittErlaubt('technik', 'uebergabe')).toBe(true);
    expect(schrittErlaubt('technik', 'zweite')).toBe(false);
    expect(schrittErlaubt('technik', 'freigabe')).toBe(false);
    expect(schrittErlaubt('technik', 'rueckgabe')).toBe(false);
    expect(schrittErlaubt('technik', 'abschluss')).toBe(false);
  });

  it('mitarbeiter: Annahme und Übergabe, sonst nichts', () => {
    expect(schrittErlaubt('mitarbeiter', 'annahme')).toBe(true);
    expect(schrittErlaubt('mitarbeiter', 'uebergabe')).toBe(true);
    expect(schrittErlaubt('mitarbeiter', 'zweite')).toBe(false);
    expect(schrittErlaubt('mitarbeiter', 'rueckgabe')).toBe(false);
    expect(schrittErlaubt('mitarbeiter', 'abschluss')).toBe(false);
    expect(schrittErlaubt('mitarbeiter', 'freigabe')).toBe(false);
  });

  it('unbekannte oder fehlende Rolle darf nichts', () => {
    expect(schrittErlaubt(undefined, 'eingang')).toBe(false);
    expect(schrittErlaubt('spender', 'eingang')).toBe(false);
  });

  it('Statusziel bestimmt den Schritt: Freigabe ist Admin, Entsorgung ist Technik', () => {
    expect(schrittFuerStatus('frei')).toBe('freigabe');
    expect(schrittFuerStatus('reserviert')).toBe('freigabe');
    expect(schrittFuerStatus('rueckgabe')).toBe('rueckgabe');
    expect(schrittFuerStatus('entsorgt')).toBe('technik');
    expect(schrittFuerStatus('reparatur')).toBe('technik');
    expect(schrittFuerStatus('quarantaene')).toBe('zweite');
    expect(schrittFuerStatus('geloescht')).toBe('loeschung');
    expect(schrittErlaubt('technik', schrittFuerStatus('frei'))).toBe(false);
    expect(schrittErlaubt('technik', schrittFuerStatus('entsorgt'))).toBe(true);
  });
});
