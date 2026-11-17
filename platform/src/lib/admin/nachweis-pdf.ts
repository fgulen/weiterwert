// Ausgefüllte PDFs für digitale Übergabe (Dok. 28) und Löschung (Dok. 07). Zeigt Häkchen, Angaben und Unterschriften.
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import type { VorgangDaten } from './vorgang';
import type { UebergabeDaten, LoeschungDaten } from './nachweis-regeln';
import { datumDe } from './anzeige';

const SEITE = { breite: 595.28, hoehe: 841.89, rand: 50 };
const TEXT = rgb(0.1, 0.12, 0.16);
const NEBEN = rgb(0.4, 0.43, 0.48);

/** Gemeinsamer Schreiber für Seiten mit Überlauf. */
function schreiber(doc: PDFDocument, normal: PDFFont, fett: PDFFont) {
  let seite: PDFPage = doc.addPage([SEITE.breite, SEITE.hoehe]);
  let y = SEITE.hoehe - SEITE.rand;
  const breite = SEITE.breite - 2 * SEITE.rand;
  const platz = (h: number) => {
    if (y - h < SEITE.rand + 30) {
      seite = doc.addPage([SEITE.breite, SEITE.hoehe]);
      y = SEITE.hoehe - SEITE.rand;
    }
  };
  const umbruch = (text: string, font: PDFFont, groesse: number): string[] => {
    const zeilen: string[] = [];
    let aktuell = '';
    for (const wort of text.split(/\s+/).filter(Boolean)) {
      const probe = aktuell ? `${aktuell} ${wort}` : wort;
      if (font.widthOfTextAtSize(probe, groesse) <= breite) aktuell = probe;
      else {
        if (aktuell) zeilen.push(aktuell);
        aktuell = wort;
      }
    }
    if (aktuell) zeilen.push(aktuell);
    return zeilen.length ? zeilen : [''];
  };
  return {
    zeile(text: string, font = normal, groesse = 10, farbe = TEXT) {
      for (const l of umbruch(text, font, groesse)) {
        platz(groesse + 5);
        seite.drawText(l, { x: SEITE.rand, y: y - groesse, size: groesse, font, color: farbe });
        y -= groesse + 5;
      }
    },
    feld(label: string, wert: string) {
      platz(20);
      seite.drawText(label, { x: SEITE.rand, y: y - 10, size: 9, font: normal, color: NEBEN });
      seite.drawText(wert, { x: SEITE.rand + 170, y: y - 10, size: 10, font: normal, color: TEXT });
      y -= 20;
    },
    abschnitt(titel: string) {
      y -= 8;
      platz(28);
      seite.drawText(titel, { x: SEITE.rand, y: y - 12, size: 12, font: fett, color: TEXT });
      y -= 20;
    },
    async bild(png: string, beschriftung: string) {
      try {
        const bild = await doc.embedPng(Buffer.from(png.split(',')[1], 'base64'));
        platz(90);
        seite.drawImage(bild, { x: SEITE.rand, y: y - 70, width: 180, height: 60 });
        seite.drawLine({ start: { x: SEITE.rand, y: y - 72 }, end: { x: SEITE.rand + 220, y: y - 72 }, thickness: 0.5, color: NEBEN });
        seite.drawText(beschriftung, { x: SEITE.rand, y: y - 84, size: 9, font: normal, color: TEXT });
        y -= 96;
      } catch {
        this.zeile('Unterschrift konnte nicht eingebettet werden.', normal, 10, NEBEN);
      }
    },
  };
}

export async function baueUebergabeDigital(v: VorgangDaten, d: UebergabeDaten, zeit: Date, hash: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Übergabeprotokoll ${v.vorgangsnummer}`);
  doc.setAuthor('WeiterWert');
  const normal = await doc.embedFont(StandardFonts.Helvetica);
  const fett = await doc.embedFont(StandardFonts.HelveticaBold);
  const s = schreiber(doc, normal, fett);
  const punkte = [
    'Gerät startet, Erststart-Assistent erscheint',
    'Keine fremden Konten oder Daten sichtbar',
    'Netzteil und Zubehör vollständig laut Vertrag',
    'Bekannte Einschränkungen erklärt',
    'Identität der empfangenden Person geprüft (Abgleich mit Antrag)',
    'Ausfertigung Vertrag übergeben',
  ];

  s.zeile('WeiterWert · Vorlage 28 (digital)', normal, 9, NEBEN);
  s.zeile('Übergabeprotokoll', fett, 18);
  s.feld('Vorgang', v.vorgangsnummer);
  s.feld('Erfasst am', datumDe(zeit.toISOString()));
  s.feld('Übergebende Person', d.unterzeichner);
  s.feld('Empfänger/in', d.empfaenger);
  s.feld('Inventar', v.geraete.map((g) => `${g.position}. ${g.typ}${g.marke ? ` ${g.marke}` : ''}${g.modell ? ` ${g.modell}` : ''}`).join('; ') || '–');

  s.abschnitt('1. Kontrolle bei Übergabe');
  punkte.forEach((text, i) => {
    const a = d.kontrolle[i];
    s.zeile(`${i + 1}. ${text}: ${a === true ? 'Ja' : a === false ? 'Nein / n. a.' : '–'}`);
  });

  s.abschnitt('2. Empfangsbestätigung');
  s.zeile('Ich bestätige, das oben bezeichnete Gerät mit Zubehör in ordnungsgemäß beschriebenem Zustand erhalten zu haben.');
  await s.bild(d.unterschriftEmpfaenger, `${d.empfaenger}`);

  s.abschnitt('Nachweis');
  s.zeile(`Prüfsumme (SHA-256): ${hash}`, normal, 7, NEBEN);
  s.zeile('Digitale Erfassung. Rechtliche Wirksamkeit der elektronischen Unterschrift ist vor Livegang zu prüfen.', normal, 8, NEBEN);
  return doc.save();
}

export async function baueLoeschungDigital(v: VorgangDaten, d: LoeschungDaten, zeit: Date, hash: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Löschnachweis ${v.vorgangsnummer}`);
  doc.setAuthor('WeiterWert');
  const normal = await doc.embedFont(StandardFonts.Helvetica);
  const fett = await doc.embedFont(StandardFonts.HelveticaBold);
  const s = schreiber(doc, normal, fett);

  s.zeile('WeiterWert · Datenlöschrichtlinie Dok. 07 (digital)', normal, 9, NEBEN);
  s.zeile('Löschnachweis je Datenträger', fett, 18);
  s.feld('Vorgang', v.vorgangsnummer);
  s.feld('Erfasst am', datumDe(zeit.toISOString()));
  s.feld('Gelöscht durch', d.unterzeichner);
  s.feld('Zweite Person', d.zweiter ?? 'nicht erforderlich');

  s.abschnitt('Geräte und Verfahren');
  for (const g of d.geraete) {
    const geraet = v.geraete.find((x) => x.position === g.position);
    s.zeile(`${g.position}. ${geraet?.typ ?? 'Gerät'}${geraet?.marke ? ` ${geraet.marke}` : ''}${geraet?.modell ? ` ${geraet.modell}` : ''}`, fett, 10);
    s.zeile(`Verfahren: ${g.verfahren ?? '–'}   ·   Verifiziert: ${g.verifiziert === null ? '–' : g.verifiziert ? 'ja' : 'nein'}   ·   Ergebnis: ${g.ergebnis ?? '–'}`);
    s.zeile(`Werkzeug: ${g.werkzeug || '–'}`);
    if (g.bemerkung) s.zeile(`Bemerkung: ${g.bemerkung}`);
  }

  s.abschnitt('Nachweis');
  s.zeile(`Prüfsumme (SHA-256): ${hash}`, normal, 7, NEBEN);
  s.zeile('Digitale Erfassung. Gemäß Dok. 07 ist ohne Löschprotokoll keine Freigabe möglich.', normal, 8, NEBEN);
  return doc.save();
}
