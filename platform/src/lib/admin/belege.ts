import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, PDFFont, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { VorgangDaten } from './vorgang';
import { hatEntsorgung, hatLoeschung } from './akte';
import { datumZeitDe, geraeteName } from './anzeige';

// Same embedded Inter font as the case sheet (ş, ğ, ı, İ, ä, ö, ü, ß all present).
const SCHRIFT = path.join(process.cwd(), 'public/fonts/inter-merged-400.ttf');
const SCHRIFT_FETT = path.join(process.cwd(), 'public/fonts/inter-merged-700.ttf');
const SEITE = { breite: 595.28, hoehe: 841.89, rand: 50 };
const TEXT = rgb(0.1, 0.12, 0.16);
const NEBEN = rgb(0.4, 0.43, 0.48);

/** Small page writer for the device documents. Wraps text and starts new pages when needed. */
class Writer {
  seite;
  y = SEITE.hoehe - SEITE.rand;
  breite = SEITE.breite - 2 * SEITE.rand;

  constructor(
    private doc: PDFDocument,
    readonly normal: PDFFont,
    readonly fett: PDFFont,
  ) {
    this.seite = doc.addPage([SEITE.breite, SEITE.hoehe]);
  }

  private neueSeite() {
    this.seite = this.doc.addPage([SEITE.breite, SEITE.hoehe]);
    this.y = SEITE.hoehe - SEITE.rand;
  }

  private platz(h: number) {
    if (this.y - h < SEITE.rand + 30) this.neueSeite();
  }

  private umbrechen(text: string, font: PDFFont, groesse: number, max: number): string[] {
    const zeilen: string[] = [];
    let aktuell = '';
    for (const wort0 of text.split(/\s+/).filter(Boolean)) {
      // A word wider than the column (a long serial or hash) is cut into pieces.
      const teile: string[] = [];
      let rest = wort0;
      while (font.widthOfTextAtSize(rest, groesse) > max && rest.length > 1) {
        let n = rest.length - 1;
        while (n > 1 && font.widthOfTextAtSize(rest.slice(0, n), groesse) > max) n--;
        teile.push(rest.slice(0, n));
        rest = rest.slice(n);
      }
      teile.push(rest);
      for (const wort of teile) {
        const probe = aktuell ? `${aktuell} ${wort}` : wort;
        if (font.widthOfTextAtSize(probe, groesse) <= max) {
          aktuell = probe;
        } else {
          if (aktuell) zeilen.push(aktuell);
          aktuell = wort;
        }
      }
    }
    if (aktuell) zeilen.push(aktuell);
    return zeilen.length ? zeilen : [''];
  }

  text(text: string, font: PDFFont, groesse: number, farbe = TEXT) {
    for (const l of this.umbrechen(text, font, groesse, this.breite)) {
      this.platz(groesse + 4);
      this.seite.drawText(l, { x: SEITE.rand, y: this.y - groesse, size: groesse, font, color: farbe });
      this.y -= groesse + 4;
    }
  }

  abstand(h: number) {
    this.y -= h;
  }

  ueberschrift(text: string) {
    this.abstand(10);
    this.platz(30);
    this.text(text, this.fett, 12);
    this.seite.drawLine({ start: { x: SEITE.rand, y: this.y + 2 }, end: { x: SEITE.rand + this.breite, y: this.y + 2 }, thickness: 0.5, color: rgb(0.8, 0.82, 0.85) });
    this.abstand(6);
  }

  zeileKV(label: string, wert: string) {
    const spalte = 150;
    const zeilen = this.umbrechen(wert, this.normal, 10, this.breite - spalte);
    this.platz(14 * zeilen.length);
    this.seite.drawText(label, { x: SEITE.rand, y: this.y - 10, size: 10, font: this.fett, color: NEBEN });
    zeilen.forEach((l, i) => this.seite.drawText(l, { x: SEITE.rand + spalte, y: this.y - 10 - i * 14, size: 10, font: this.normal, color: TEXT }));
    this.y -= 14 * zeilen.length + 2;
  }

  geraet(pos: number, name: string, felder: Array<[string, string | null]>) {
    this.platz(60);
    this.text(`${pos}. ${name}`, this.fett, 11);
    this.abstand(2);
    for (const [label, wert] of felder) this.zeileKV(label, wert ?? '–');
    this.abstand(8);
  }

  unterschrift(label: string) {
    this.abstand(16);
    this.zeileKV(label, '______________________________');
  }
}

async function schreibe(
  titel: string,
  untertitel: string,
  v: VorgangDaten,
  erstelltAm: Date,
  inhalt: (w: Writer) => void,
  fuss: (seite: number, gesamt: number) => string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const normal = await doc.embedFont(await readFile(SCHRIFT), { subset: true });
  const fett = await doc.embedFont(await readFile(SCHRIFT_FETT), { subset: true });
  doc.setTitle(`${titel} ${v.vorgangsnummer}`);
  doc.setSubject(titel);
  doc.setAuthor('WeiterWert');
  const w = new Writer(doc, normal, fett);
  w.text('WeiterWert', normal, 9, NEBEN);
  w.abstand(4);
  w.text(titel, fett, 18);
  w.abstand(4);
  w.text(untertitel, normal, 10, NEBEN);
  w.abstand(6);
  w.text(`Vorgangsnummer ${v.vorgangsnummer}`, fett, 13);
  w.abstand(4);
  w.zeileKV('Ausgedruckt am', datumZeitDe(erstelltAm.toISOString()));
  w.abstand(6);
  inhalt(w);
  const seiten = doc.getPages();
  seiten.forEach((p, i) => p.drawText(fuss(i + 1, seiten.length), { x: SEITE.rand, y: 28, size: 8, font: normal, color: NEBEN }));
  return doc.save();
}

/** Deletion log (Löschprotokoll): one block per device for which a deletion was entered. */
export async function baueLoeschprotokoll(v: VorgangDaten, erstelltAm: Date): Promise<Uint8Array> {
  return schreibe(
    'Löschprotokoll',
    'Nachweis der Datenlöschung je Gerät',
    v,
    erstelltAm,
    (w) => {
      const mit = v.geraete.filter((g) => hatLoeschung(g.akte));
      w.ueberschrift(`Gelöschte Geräte (${mit.length} von ${v.geraete.length})`);
      if (mit.length === 0) w.text('Für diesen Vorgang ist noch keine Datenlöschung eingetragen.', w.normal, 10);
      for (const g of mit) {
        w.geraet(g.position, geraeteName(g), [
          ['Seriennummer', g.akte.seriennummer],
          ['Löschverfahren', g.akte.loeschverfahren],
          ['Löschdatum', g.akte.loeschdatum],
          ['Gelöscht von', g.akte.loeschperson],
          ['Zustand', g.akte.zustand],
        ]);
      }
      w.unterschrift('Geprüft von');
      w.zeileKV('Datum', '______________________________');
    },
    (s, n) => `Löschprotokoll · ${v.vorgangsnummer} · Seite ${s} von ${n}`,
  );
}

/** Disposal proof (Entsorgungsnachweis), in line with the ElektroG: one block per device with a disposal route. */
export async function baueEntsorgungsnachweis(v: VorgangDaten, erstelltAm: Date): Promise<Uint8Array> {
  return schreibe(
    'Entsorgungsnachweis',
    'Nachweis der Entsorgung nach ElektroG',
    v,
    erstelltAm,
    (w) => {
      const mit = v.geraete.filter((g) => hatEntsorgung(g.akte));
      w.ueberschrift(`Entsorgte Geräte (${mit.length} von ${v.geraete.length})`);
      if (mit.length === 0) w.text('Für diesen Vorgang ist noch kein Entsorgungsweg eingetragen.', w.normal, 10);
      for (const g of mit) {
        w.geraet(g.position, geraeteName(g), [
          ['Seriennummer', g.akte.seriennummer],
          ['Entsorgungsweg', g.akte.entsorgungsweg],
          ['Entsorgungsfachbetrieb', g.akte.entsorger],
          ['Nachweisnummer', g.akte.nachweisnummer],
          ['Entsorgungsdatum', g.akte.entsorgungsdatum],
        ]);
      }
      w.abstand(6);
      w.text('Der Nachweis des Entsorgungsfachbetriebs wird diesem Blatt beigelegt.', w.normal, 9, NEBEN);
      w.unterschrift('Erstellt von');
    },
    (s, n) => `Entsorgungsnachweis · ${v.vorgangsnummer} · Seite ${s} von ${n}`,
  );
}

/** Inventory as CSV: semicolon-separated, UTF-8 with BOM so Excel shows umlauts. */
export function envanterCsv(vorgaenge: VorgangDaten[]): string {
  const kopf = ['Vorgang', 'Position', 'Gerät', 'Seriennummer', 'Zustand', 'Lagerort', 'Löschverfahren', 'Löschdatum', 'Entsorgungsweg', 'Nachweisnummer'];
  const zelle = (x: string | null | undefined) => {
    // Cells starting with = + - @ or a tab/CR are read as formulas by Excel: prefix them with an apostrophe.
    let s = (x ?? '').replace(/"/g, '""');
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[";\r\n]/.test(s) ? `"${s}"` : s;
  };
  const zeilen = [kopf.join(';')];
  for (const v of vorgaenge) {
    for (const g of v.geraete) {
      zeilen.push(
        [v.vorgangsnummer, String(g.position), geraeteName(g), g.akte.seriennummer, g.akte.zustand, g.akte.lagerort, g.akte.loeschverfahren, g.akte.loeschdatum, g.akte.entsorgungsweg, g.akte.nachweisnummer]
          .map(zelle)
          .join(';'),
      );
    }
  }
  return '﻿' + zeilen.join('\r\n') + '\r\n';
}
