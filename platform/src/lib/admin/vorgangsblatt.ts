import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, PDFFont, PDFPage, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { ANGABE_REIHENFOLGE, angabeLabel, angabeText, ERGEBNIS_KURZ, type VorgangDaten } from './vorgang';
import { statusText } from './anzeige';

// Inter (SIL OFL) from public/fonts. Standard PDF fonts cannot show ş, ğ, ı or İ, so the font is embedded.
const SCHRIFT = path.join(process.cwd(), 'public/fonts/inter-latin-ext-400.woff2');
const SCHRIFT_FETT = path.join(process.cwd(), 'public/fonts/inter-latin-ext-700.woff2');

const SEITE = { breite: 595.28, hoehe: 841.89, rand: 50 };
const FARBE_TEXT = rgb(0.1, 0.12, 0.16);
const FARBE_NEBEN = rgb(0.4, 0.43, 0.48);

/** Builds the internal case sheet (Vorgangsblatt). Its title and footer are neutral: it is not a tax receipt. */
export async function baueVorgangsblatt(v: VorgangDaten, erstelltAm: Date): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const normal = await doc.embedFont(await readFile(SCHRIFT), { subset: false });
  const fett = await doc.embedFont(await readFile(SCHRIFT_FETT), { subset: false });
  doc.setTitle(`Vorgangsblatt ${v.vorgangsnummer}`);
  doc.setSubject('Vorgangsblatt / Annahmeprotokoll');
  doc.setAuthor('WeiterWert');
  doc.setCreator('WeiterWert Admin');

  let seite = doc.addPage([SEITE.breite, SEITE.hoehe]);
  let y = SEITE.hoehe - SEITE.rand;
  const breite = SEITE.breite - 2 * SEITE.rand;

  const neueSeite = () => {
    seite = doc.addPage([SEITE.breite, SEITE.hoehe]);
    y = SEITE.hoehe - SEITE.rand;
  };
  const platz = (hoehe: number) => {
    if (y - hoehe < SEITE.rand + 30) neueSeite();
  };
  /** Wraps text to the width and returns the lines. */
  const umbrechen = (text: string, font: PDFFont, groesse: number, max: number): string[] => {
    const woerter = text.split(/\s+/).filter(Boolean);
    const zeilen: string[] = [];
    let aktuell = '';
    for (const wort of woerter) {
      const probe = aktuell ? `${aktuell} ${wort}` : wort;
      if (font.widthOfTextAtSize(probe, groesse) <= max) {
        aktuell = probe;
      } else {
        if (aktuell) zeilen.push(aktuell);
        aktuell = wort;
      }
    }
    if (aktuell) zeilen.push(aktuell);
    return zeilen.length ? zeilen : [''];
  };
  const zeile = (text: string, font: PDFFont, groesse: number, farbe = FARBE_TEXT, x = SEITE.rand, max = breite) => {
    for (const l of umbrechen(text, font, groesse, max)) {
      platz(groesse + 4);
      seite.drawText(l, { x, y: y - groesse, size: groesse, font, color: farbe });
      y -= groesse + 4;
    }
  };
  const abstand = (h: number) => {
    y -= h;
  };
  const ueberschrift = (text: string) => {
    abstand(10);
    platz(30);
    zeile(text, fett, 12);
    seite.drawLine({
      start: { x: SEITE.rand, y: y + 2 },
      end: { x: SEITE.rand + breite, y: y + 2 },
      thickness: 0.5,
      color: rgb(0.8, 0.82, 0.85),
    });
    abstand(6);
  };
  /** A two-column row: label on the left, value on the right. */
  const zeileKV = (label: string, wert: string) => {
    const spalte = 150;
    const zeilen = umbrechen(wert, normal, 10, breite - spalte);
    platz(14 * zeilen.length);
    seite.drawText(label, { x: SEITE.rand, y: y - 10, size: 10, font: fett, color: FARBE_NEBEN });
    zeilen.forEach((l, i) => {
      seite.drawText(l, { x: SEITE.rand + spalte, y: y - 10 - i * 14, size: 10, font: normal, color: FARBE_TEXT });
    });
    y -= 14 * zeilen.length + 2;
  };

  // Kopf
  zeile('WeiterWert', normal, 9, FARBE_NEBEN);
  abstand(4);
  zeile('Vorgangsblatt / Annahmeprotokoll', fett, 18);
  abstand(6);
  zeile(`Vorgangsnummer ${v.vorgangsnummer}`, fett, 13);
  abstand(10);

  ueberschrift('Vorgang');
  zeileKV('Eingegangen am', v.angelegt);
  zeileKV('Status', statusText(v.status));
  zeileKV('Ausgedruckt am', erstelltAm.toISOString().slice(0, 16).replace('T', ' ') + ' UTC');

  ueberschrift('Kontakt (Spender/in)');
  zeileKV('Name', v.kontakt.name);
  zeileKV('E-Mail', v.kontakt.email);
  zeileKV('PLZ', v.kontakt.plz);
  zeileKV('Telefon', v.kontakt.telefon || 'nicht angegeben');
  zeileKV('Organisation', v.kontakt.organisation || 'nicht angegeben');

  ueberschrift(`Geräte (${v.geraete.length})`);
  for (const g of v.geraete) {
    platz(60);
    const titel = [g.marke, g.modell].filter(Boolean).join(' ') || 'ohne Angabe';
    zeile(`${g.position}. ${titel}`, fett, 11);
    abstand(2);
    for (const feld of ANGABE_REIHENFOLGE) {
      const wert = feld === 'typ' ? g.typ : g.angaben[feld];
      if (wert === undefined || wert === null || wert === '') continue;
      zeileKV(angabeLabel(feld), angabeText(feld, String(wert)));
    }
    zeileKV('Vorprüfung', `${ERGEBNIS_KURZ[g.ergebnis] ?? g.ergebnis}`);
    if (g.gruende.length > 0) {
      zeileKV('Gründe', g.gruende.join('; '));
    }
    abstand(8);
  }

  ueberschrift('Erklärungen der Spenderin / des Spenders');
  zeile('Eigentum: Die Geräte gehören der Spenderin / dem Spender oder dürfen gespendet werden.', normal, 10);
  zeile('Datensicherung: Die Spenderin / der Spender hat die eigenen Daten gesichert.', normal, 10);
  abstand(4);
  zeileKV('Textversion', v.erklaerungVersion);
  zeileKV('Prüfsumme (SHA-256)', v.erklaerungHash);
  zeileKV('Regelversion Vorprüfung', v.regelVersion);

  ueberschrift('Bearbeitung');
  zeile('Übergabe und Datenlöschung werden auf den Protokollen dieses Vorgangs festgehalten.', normal, 10, FARBE_NEBEN);
  abstand(14);
  zeileKV('Geprüft von', '______________________________');
  zeileKV('Datum', '______________________________');

  // Fußzeile auf jeder Seite
  const seiten = doc.getPages();
  seiten.forEach((p: PDFPage, i: number) => {
    p.drawText(`Interne Unterlage · ${v.vorgangsnummer} · Seite ${i + 1} von ${seiten.length}`, {
      x: SEITE.rand,
      y: 28,
      size: 8,
      font: normal,
      color: FARBE_NEBEN,
    });
  });

  return doc.save();
}
