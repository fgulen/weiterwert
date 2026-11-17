// Übergabeprotokoll nach Vorlage 28 (WeiterWert V1.0). Gleiche Abschnitte und Kontrollpunkte wie im Dokument.
// Felder, die im System nicht erfasst werden (Vertrag-Nr., Übergabe-Nr., übergebende Person), bleiben als Leerfeld.
import { PDFDocument, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import type { VorgangDaten } from './vorgang';
import { datumDe } from './anzeige';

const SEITE = { breite: 595.28, hoehe: 841.89, rand: 50 };
const TEXT = rgb(0.1, 0.12, 0.16);
const NEBEN = rgb(0.4, 0.43, 0.48);

const KONTROLLPUNKTE = [
  'Gerät startet, Erststart-Assistent erscheint',
  'Keine fremden Konten oder Daten sichtbar',
  'Netzteil und Zubehör vollständig laut Vertrag',
  'Bekannte Einschränkungen erklärt',
  'Identität der empfangenden Person geprüft (Abgleich mit Antrag)',
  'Ausfertigung Vertrag übergeben',
];

export async function baueUebergabeFormular(v: VorgangDaten, erstelltAm: Date): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Übergabeprotokoll ${v.vorgangsnummer}`);
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
  const zeile = (text: string, font = normal, groesse = 10, farbe = TEXT, x = SEITE.rand, max = breite) => {
    for (const l of umbruch(text, font, groesse, max)) {
      platz(groesse + 5);
      seite.drawText(l, { x, y: y - groesse, size: groesse, font, color: farbe });
      y -= groesse + 5;
    }
  };
  const abschnitt = (titel: string) => {
    y -= 10;
    platz(30);
    zeile(titel, fett, 12);
    y -= 2;
  };
  /** Feld mit Beschriftung und Leerlinie (zum Ausfüllen) oder Wert. */
  const feld = (label: string, wert: string | null) => {
    platz(22);
    seite.drawText(label, { x: SEITE.rand, y: y - 10, size: 9, font: normal, color: NEBEN });
    seite.drawText(wert ?? '', { x: SEITE.rand + 170, y: y - 10, size: 10, font: normal, color: TEXT });
    seite.drawLine({ start: { x: SEITE.rand + 170, y: y - 13 }, end: { x: SEITE.rand + breite, y: y - 13 }, thickness: 0.5, color: NEBEN });
    y -= 22;
  };
  const kontrolle = (nr: number, text: string) => {
    platz(22);
    zeile(`${nr}. ${text}`, normal, 10);
    seite.drawText('[  ] Ja      [  ] Nein / n. a.', { x: SEITE.rand + 10, y: y - 2, size: 9, font: normal, color: NEBEN });
    y -= 14;
  };
  const unterschrift = (rolle: string) => {
    platz(44);
    seite.drawLine({ start: { x: SEITE.rand, y: y - 30 }, end: { x: SEITE.rand + 220, y: y - 30 }, thickness: 0.5, color: NEBEN });
    seite.drawText(rolle, { x: SEITE.rand, y: y - 40, size: 9, font: normal, color: NEBEN });
    y -= 50;
  };

  // Kopf (wie Vorlage 28)
  zeile('WeiterWert · Vorlage 28', normal, 9, NEBEN);
  zeile('Übergabeprotokoll', fett, 18);
  zeile('Bestätigung der tatsächlichen Übergabe eines Geräts an Person oder Organisation.', normal, 10, NEBEN);
  y -= 6;
  feld('Dokument-Nr.', '28');
  feld('Version', '1.0');
  feld('Vorgang', v.vorgangsnummer);
  feld('Stand des Ausdrucks', datumDe(erstelltAm.toISOString()));

  abschnitt('1. Übergabe');
  feld('Übergabe-Nr.', null);
  feld('Datum / Ort', null);
  feld('Inventar-ID(s)', v.geraete.map((g) => `${g.position}. ${g.typ}${g.marke ? ` ${g.marke}` : ''}${g.modell ? ` ${g.modell}` : ''}`).join('; ') || '–');
  feld('Vertrag (Dok. 27 / 29) Nr.', null);
  feld('Empfänger-Referenz', null);
  feld('Übergebende Person', null);

  abschnitt('2. Kontrolle bei Übergabe');
  KONTROLLPUNKTE.forEach((text, i) => kontrolle(i + 1, text));

  abschnitt('3. Empfangsbestätigung');
  zeile('Ich bestätige, das oben bezeichnete Gerät mit Zubehör in ordnungsgemäß beschriebenem Zustand erhalten zu haben.');
  y -= 6;
  unterschrift('Empfänger/in: Name, Funktion, Datum, Unterschrift');
  unterschrift('Für WeiterWert: Name, Funktion, Datum, Unterschrift');

  abschnitt('4. Abschluss (intern)');
  feld('Inventar auf „vergeben“ gesetzt am', null);
  feld('Durch', null);
  kontrolle(1, 'Spendenregister / Mittelverwendung aktualisiert');

  abschnitt('Datenschutz und Aufbewahrung');
  zeile('Keine über die Identifikation hinausgehenden Daten erfassen. Aufbewahrung 10 Jahre (Dok. 13).', normal, 9, NEBEN);

  abschnitt('Freigabe des Formulars');
  feld('Verantwortliche Person / Funktion', null);
  feld('Datum / Unterschrift', null);
  zeile('Interne Vorlage – vor produktivem Einsatz mit den verknüpften Richtlinien abgleichen.', normal, 8, NEBEN);

  return doc.save();
}
