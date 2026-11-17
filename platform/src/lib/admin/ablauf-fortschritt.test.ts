import { describe, expect, it } from 'vitest';
import { geraetAktuellerSchritt, listenSchritt, vorgangFortschritt } from './ablauf-fortschritt';

describe('Fortschritt je Gerät', () => {
  it('neues Gerät steht bei der Zweiten Kontrolle', () => {
    expect(geraetAktuellerSchritt('eingegangen')).toBe('zweite');
  });
  it('nach Löschung steht es bei der Technik', () => {
    expect(geraetAktuellerSchritt('geloescht')).toBe('technik');
  });
  it('übergebenes Gerät ist am Ende', () => {
    expect(geraetAktuellerSchritt('uebergeben')).toBe('abschluss');
  });
  it('Quarantäne gilt als Zweite Kontrolle bestanden', () => {
    expect(geraetAktuellerSchritt('quarantaene')).toBe('loeschung');
  });
});

describe('Fortschritt des Vorgangs', () => {
  it('ohne Annahme und mit neuen Geräten: Eingang offen, Annahme aktiv', () => {
    const f = vorgangFortschritt(['eingegangen', 'eingegangen'], false);
    expect(f.eingang).toBe('erledigt');
    expect(f.zweite).toBe('aktiv');
  });
  it('Annahme gespeichert: Eingang und Annahme erledigt', () => {
    const f = vorgangFortschritt(['eingegangen'], true);
    expect(f.eingang).toBe('erledigt');
    expect(f.annahme).toBe('erledigt');
    expect(f.zweite).toBe('aktiv');
  });
  it('alle Geräte übergeben: alle Schritte erledigt', () => {
    const f = vorgangFortschritt(['uebergeben', 'rueckgabe'], true);
    expect(Object.values(f).every((s) => s === 'erledigt')).toBe(true);
  });
  it('nur ein Gerät fertig: Schritt bleibt aktiv, bis alle durch sind', () => {
    const f = vorgangFortschritt(['geloescht', 'eingegangen'], true);
    expect(f.zweite).toBe('aktiv');
    expect(f.loeschung).toBe('offen');
  });
  it('ohne Geräte ist nichts erledigt außer Annahme', () => {
    const f = vorgangFortschritt([], false);
    expect(f.eingang).toBe('aktiv');
    expect(f.zweite).toBe('offen');
    expect(f.abschluss).toBe('offen');
  });
});

describe('Listenanzeige je Vorgang', () => {
  it('ohne Gerätedatensatz bleibt es "neu"', () => {
    expect(listenSchritt('neu', [null])).toBe('neu');
    expect(listenSchritt('neu', [])).toBe('neu');
  });
  it('erfasstes, noch nicht bearbeitetes Gerät steht bei der Zweiten Kontrolle', () => {
    expect(listenSchritt('neu', ['eingegangen'])).toBe('zweite');
  });
  it('Gerät in der Technik zeigt Technik', () => {
    expect(listenSchritt('neu', ['geloescht'])).toBe('technik');
  });
  it('alle Geräte übergeben: Abschluss', () => {
    expect(listenSchritt('neu', ['uebergeben'])).toBe('abschluss');
  });
  it('abgeschlossener Vorgang: Abschluss', () => {
    expect(listenSchritt('abgeschlossen', ['uebergeben'])).toBe('abschluss');
  });
});
