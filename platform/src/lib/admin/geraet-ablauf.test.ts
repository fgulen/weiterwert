import { describe, expect, it } from 'vitest';
import {
  brauchtZweiAdmins,
  geraetFertig,
  istErlaubterGeraetWechsel,
  vorgangFertig,
  korrekturVon,
  zweiAdminFreigabeOk,
  zweiteKontrolleErgebnis,
} from './geraet-ablauf';

describe('Gerät-Ablauf', () => {
  it('Eingang führt zuerst zur zweiten Kontrolle', () => {
    expect(istErlaubterGeraetWechsel('eingegangen', 'zweite_kontrolle')).toBe(true);
    expect(istErlaubterGeraetWechsel('eingegangen', 'loeschung_offen')).toBe(false);
  });

  it('Abweichung geht in Quarantäne, Quarantäne in Bestand oder Rückgabe', () => {
    expect(istErlaubterGeraetWechsel('zweite_kontrolle', 'quarantaene')).toBe(true);
    expect(istErlaubterGeraetWechsel('quarantaene', 'loeschung_offen')).toBe(true);
    expect(istErlaubterGeraetWechsel('quarantaene', 'rueckgabe')).toBe(true);
    expect(istErlaubterGeraetWechsel('quarantaene', 'uebergeben')).toBe(false);
  });

  it('Rückgabe und Übergabe sind Endstatus', () => {
    expect(istErlaubterGeraetWechsel('rueckgabe', 'frei')).toBe(false);
    expect(istErlaubterGeraetWechsel('uebergeben', 'frei')).toBe(false);
  });

  it('Löschung ist Pflicht vor der technischen Prüfung', () => {
    expect(istErlaubterGeraetWechsel('loeschung_offen', 'technische_pruefung')).toBe(false);
    expect(istErlaubterGeraetWechsel('geloescht', 'technische_pruefung')).toBe(true);
  });

  it('unbekannter Status hat keinen Nachfolger', () => {
    expect(istErlaubterGeraetWechsel('unbekannt', 'frei')).toBe(false);
  });
});

describe('Vorgang folgt den einzelnen Geräten', () => {
  it('Vorgang ist erst fertig, wenn alle Geräte fertig sind', () => {
    expect(vorgangFertig(['uebergeben', 'quarantaene', 'uebergeben'])).toBe(false);
    expect(vorgangFertig(['uebergeben', 'rueckgabe', 'entsorgt'])).toBe(true);
  });

  it('Vorgang ohne Geräte ist nicht fertig', () => {
    expect(vorgangFertig([])).toBe(false);
  });

  it('Gerät in Bearbeitung ist nicht fertig', () => {
    expect(geraetFertig('loeschung_offen')).toBe(false);
    expect(geraetFertig('frei')).toBe(false);
  });
});

describe('Zwei-Admin-Freigabe', () => {
  it('verlangt zwei Admins bei Vorab-Freigabe, Annahme und Löschung', () => {
    expect(brauchtZweiAdmins('loeschung_fehlgeschlagen')).toBe(true);
    expect(brauchtZweiAdmins('loeschung_ausnahme')).toBe(true);
    expect(brauchtZweiAdmins('vernichtung')).toBe(true);
    expect(brauchtZweiAdmins('loeschung')).toBe(false);
    expect(brauchtZweiAdmins('annahme')).toBe(false);
    expect(brauchtZweiAdmins('vorab_freigabe')).toBe(false);
    expect(brauchtZweiAdmins('zweite_kontrolle')).toBe(false);
  });

  it('gleicher Admin zweimal ist nicht erlaubt', () => {
    expect(zweiAdminFreigabeOk('loeschung_fehlgeschlagen', 'anna', 'anna')).toBe(false);
  });

  it('zwei verschiedene Admins sind erlaubt', () => {
    expect(zweiAdminFreigabeOk('loeschung_fehlgeschlagen', 'anna', 'ben')).toBe(true);
  });

  it('fehlende Freigabe blockiert Pflichtschritte', () => {
    expect(zweiAdminFreigabeOk('loeschung_fehlgeschlagen', 'anna', null)).toBe(false);
    expect(zweiAdminFreigabeOk('loeschung_fehlgeschlagen', null, null)).toBe(false);
  });

  it('Schritte ohne Pflicht brauchen keine Freigabe', () => {
    expect(zweiAdminFreigabeOk('zweite_kontrolle', null, null)).toBe(true);
  });
});

describe('Zweite Kontrolle (Foto vs. Gerät)', () => {
  const foto = { typ: 'Laptop', marke: 'Lenovo', modell: 'T14' };

  it('gleiche Angaben passen', () => {
    expect(zweiteKontrolleErgebnis(foto, { typ: 'laptop ', marke: 'LENOVO', modell: 't14' })).toBe('passt');
  });

  it('anderes Modell ist eine Abweichung', () => {
    expect(zweiteKontrolleErgebnis(foto, { typ: 'Laptop', marke: 'Lenovo', modell: 'T15' })).toBe('abweichung');
  });

  it('fehlende Marke bei einer Seite ist eine Abweichung', () => {
    expect(zweiteKontrolleErgebnis(foto, { typ: 'Laptop', marke: null, modell: 'T14' })).toBe('abweichung');
  });
});

describe('Korrektur von PDF-Protokollen', () => {
  it('erzeugt eine neue Version mit Verweis auf das alte Protokoll', () => {
    const neu = korrekturVon({ nummer: 'WW-PRO-2026-000012', version: 1, bezug: null });
    expect(neu).toEqual({ nummer: 'WW-PRO-2026-000012', version: 2, bezug: 'WW-PRO-2026-000012-v1' });
  });
});

describe('Zweite Kontrolle: unbekannte Antragsangaben', () => {
  it('unbekannter Antragstyp widerspricht nicht', () => {
    expect(zweiteKontrolleErgebnis({ typ: 'unbekannt', marke: 'HP', modell: 'EliteBook 840 G8' }, { typ: 'Laptop', marke: 'HP', modell: 'EliteBook 840 G8' })).toBe('passt');
  });
  it('bekannte Angaben müssen übereinstimmen', () => {
    expect(zweiteKontrolleErgebnis({ typ: 'Laptop', marke: 'HP', modell: 'X' }, { typ: 'Laptop', marke: 'Lenovo', modell: 'X' })).toBe('abweichung');
  });
});
