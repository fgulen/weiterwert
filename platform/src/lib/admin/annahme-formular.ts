// Geräteannahmeprotokoll nach Vorlage 18 (WeiterWert V1.0). Gleiche Abschnitte wie im Dokument.
// Nicht erfasste Felder (Annahme-Nr., Datum/Uhrzeit, Inventar-ID) bleiben als Leerfeld zum Ausfüllen.
import { PDFDocument, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import type { VorgangDaten } from './vorgang';
import { datumDe } from './anzeige';

const SEITE = { breite: 595.28, hoehe: 841.89, rand: 50 };
const TEXT = rgb(0.1, 0.12, 0.16);
const NEBEN = rgb(0.4, 0.43, 0.48);

const SICHERHEIT = [
  'Eigentum oder Übereignung schriftlich bestätigt',
  'Keine Hinweise auf fremdes Eigentum oder Diebstahl',
  'Keine sichtbaren Akku-, Brand- oder Flüssigkeitsschäden',
  'Aktivierungssperre / MDM / BIOS-Passwort: Status erfragt',
  'Lose Datenträger oder Speicherkarten erfasst und ID zugeordnet',
  'Gerät in Quarantäne verbracht und gekennzeichnet',
  'Datenschutzinformation (Dok. 16) übergeben',
];

export async function baueAnnahmeFormular(v: VorgangDaten, erstelltAm: Date): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Geräteannahmeprotokoll ${v.vorgangsnummer}`);
  doc.setAuthor('WeiterWert');
  doc.setCreator('WeiterWert Admin');
  const normal = await doc.embedFont(StandardFonts.Helvetica);
  const fett = await doc.embedFont(StandardFonts.HelveticaBold);

  let seite = doc.addPage([SEITE.breite, SEITE.hoehe]);
  let y = SEITE.hoehe - SEITE.rand;
  const breite = SEITE.breite - 2 * SEITE.rand;

  const platz = (h: number) => {
    if (y - h < SEITE.rand + 30) {
      seite = doc.addPage([SEITE.breite, SEITE.hoehe]);
      y = SEITE.hoehe - SEITE.rand;
    }
  };
  const umbruch = (text: string, font: PDFFont, groesse: number, max: number): string[] => {
    const zeilen: string[] = [];
    let aktuell = '';
    for (const wort of text.split(/\s+/).filter(Boolean)) {
      const probe = aktuell ? `${aktuell} ${wort}` : wort;
      if (font.widthOfTextAtSize(probe, groesse) <= max) aktuell = probe;
      else {
        if (aktuell) zeilen.push(aktuell);
        aktuell = wort;
      }
    }
    if (aktuell) zeilen.push(aktuell);
    return zeilen.length ? zeilen : [''];
  };
  const zeile = (text: string, font = normal, groesse = 10, farbe = TEXT) => {
    for (const l of umbruch(text, font, groesse, breite)) {
      platz(groesse + 5);
      seite.drawText(l, { x: SEITE.rand, y: y - groesse, size: groesse, font, color: farbe });
      y -= groesse + 5;
    }
  };
  const abschnitt = (titel: string) => {
    y -= 10;
    platz(30);
    zeile(titel, fett, 12);
    y -= 2;
  };
  const feld = (label: string, wert: string | null) => {
    platz(22);
    seite.drawText(label, { x: SEITE.rand, y: y - 10, size: 9, font: normal, color: NEBEN });
    seite.drawText(wert ?? '', { x: SEITE.rand + 170, y: y - 10, size: 10, font: normal, color: TEXT });
    seite.drawLine({ start: { x: SEITE.rand + 170, y: y - 13 }, end: { x: SEITE.rand + breite, y: y - 13 }, thickness: 0.5, color: NEBEN });
    y -= 22;
  };
  const ankreuzen = (text: string, optionen: string) => {
    platz(26);
    zeile(text, normal, 10);
    seite.drawText(optionen, { x: SEITE.rand + 10, y: y - 2, size: 9, font: normal, color: NEBEN });
    y -= 14;
  };
  const unterschrift = (rolle: string) => {
    platz(44);
    seite.drawLine({ start: { x: SEITE.rand, y: y - 30 }, end: { x: SEITE.rand + 220, y: y - 30 }, thickness: 0.5, color: NEBEN });
    seite.drawText(rolle, { x: SEITE.rand, y: y - 40, size: 9, font: normal, color: NEBEN });
    y -= 50;
  };

  zeile('WeiterWert · Vorlage 18', normal, 9, NEBEN);
  zeile('Geräteannahmeprotokoll', fett, 18);
  zeile('Dokumentation des Geräteeingangs bei Übergabe – Grundlage für Inventarisierung und Quarantäne.', normal, 10, NEBEN);
  y -= 6;
  feld('Dokument-Nr.', '18');
  feld('Version', '1.0');
  feld('Vorgang', v.vorgangsnummer);
  feld('Stand des Ausdrucks', datumDe(erstelltAm.toISOString()));

  abschnitt('1. Eingang');
  feld('Annahme-Nr.', null);
  feld('Datum / Uhrzeit', null);
  ankreuzen('Spenderart', '[  ] Privat      [  ] Unternehmen      [  ] Organisation');
  feld('Bezug (Dok. 14 / 15 / 17)', null);
  feld('Annahmeort', null);
  feld('Annahme durch', null);

  abschnitt('2. Übernommene Geräte');
  if (v.geraete.length === 0) zeile('Keine Geräte im Vorgang erfasst.', normal, 10, NEBEN);
  for (const g of v.geraete) {
    platz(70);
    zeile(`Gerät ${g.position}`, fett, 10);
    feld('Inventar-ID', null);
    feld('Geräteart', g.typ);
    feld('Hersteller / Modell', [g.marke, g.modell].filter(Boolean).join(' ') || null);
    ankreuzen('Äußerer Zustand', '[  ] gut      [  ] Spuren      [  ] defekt');
    ankreuzen('Datenträger vorhanden', '[  ] ja      [  ] nein      [  ] unklar');
    feld('Zubehör', null);
  }

  abschnitt('3. Sicherheits- und Plausibilitätsprüfung');
  SICHERHEIT.forEach((text, i) => ankreuzen(`${i + 1}. ${text}`, '[  ] Ja      [  ] Nein / n. a.'));

  abschnitt('4. Entscheidung');
  zeile('[  ] Annahme vollständig      [  ] Annahme teilweise (abgelehnt: ______)      [  ] Ablehnung, Grund: ______');
  y -= 6;
  unterschrift('Annehmende Person: Name, Funktion, Datum, Unterschrift');
  unterschrift('Spender/in (Bestätigung der Übergabe): Name, Datum, Unterschrift');

  abschnitt('Datenschutz und Aufbewahrung');
  zeile('Nur Annahmedaten und Inventar-IDs erfassen; Spenderdaten bleiben in Dok. 14 / 15 / 17. Aufbewahrung 10 Jahre als Nachweis der Mittelherkunft (Dok. 13).', normal, 9, NEBEN);

  abschnitt('Freigabe des Formulars');
  feld('Verantwortliche Person / Funktion', null);
  feld('Datum / Unterschrift', null);
  zeile('Interne Vorlage – vor produktivem Einsatz mit den verknüpften Richtlinien abgleichen.', normal, 8, NEBEN);

  return doc.save();
}
