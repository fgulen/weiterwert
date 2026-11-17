// Schrittprotokoll: ein PDF je Statuswechsel eines Geräts. Auch bei einfachen Schritten gibt es so immer ein Dokument.
import { PDFDocument, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import type { VorgangDaten, GeraetDaten } from './vorgang';
import { datumZeitDe } from './anzeige';

const SEITE = { breite: 595.28, hoehe: 841.89, rand: 50 };
const TEXT = rgb(0.1, 0.12, 0.16);
const NEBEN = rgb(0.4, 0.43, 0.48);

/** Beschreibung je Zielstatus, in Deutsch (Dokumentsprache). */
const BESCHREIBUNG: Record<string, string> = {
  zweite_kontrolle: 'Gelieferte Angaben wurden mit dem Antrag verglichen.',
  loeschung_offen: 'Die Angaben stimmen überein. Das Gerät geht zur Löschung.',
  quarantaene: 'Abweichung oder nicht löschbar. Das Gerät ist in Quarantäne.',
  geloescht: 'Die Datenlöschung wurde nach Dok. 07 abgeschlossen.',
  technische_pruefung: 'Das Gerät wird technisch geprüft.',
  reparatur: 'Das Gerät wird repariert. Danach erneute Prüfung.',
  frei: 'Das Gerät ist freigegeben.',
  reserviert: 'Das Gerät ist einem Vorgang zugeordnet.',
  uebergeben: 'Das Gerät wurde übergeben.',
  rueckgabe: 'Das Gerät wurde an den Spender zurückgesandt.',
  entsorgt: 'Das Gerät wurde entsorgt. Der Nachweis wird geführt.',
};

export const STATUS_NAME_DE: Record<string, string> = {
  eingegangen: 'eingegangen', zweite_kontrolle: 'zweite Kontrolle', quarantaene: 'Quarantäne',
  loeschung_offen: 'Löschung offen', geloescht: 'gelöscht', technische_pruefung: 'technische Prüfung',
  reparatur: 'Reparatur', frei: 'freigegeben', reserviert: 'reserviert', uebergeben: 'übergeben',
  rueckgabe: 'zurückgegeben', entsorgt: 'entsorgt',
};

export async function baueSchrittPdf(opt: {
  v: VorgangDaten;
  geraet: GeraetDaten;
  von: string;
  nach: string;
  nutzer: string;
  zeit: Date;
  zweiter: string | null;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Schrittprotokoll ${opt.v.vorgangsnummer} ${opt.geraet.position}`);
  doc.setAuthor('WeiterWert');
  const normal = await doc.embedFont(StandardFonts.Helvetica);
  const fett = await doc.embedFont(StandardFonts.HelveticaBold);

  let seite = doc.addPage([SEITE.breite, SEITE.hoehe]);
  let y = SEITE.hoehe - SEITE.rand;
  const breite = SEITE.breite - 2 * SEITE.rand;
  const zeile = (text: string, font: PDFFont = normal, groesse = 10, farbe = TEXT) => {
    const woerter = text.split(/\s+/).filter(Boolean);
    let aktuell = '';
    const zeilen: string[] = [];
    for (const w of woerter) {
      const probe = aktuell ? `${aktuell} ${w}` : w;
      if (font.widthOfTextAtSize(probe, groesse) <= breite) aktuell = probe;
      else { zeilen.push(aktuell); aktuell = w; }
    }
    zeilen.push(aktuell);
    for (const l of zeilen) {
      if (y - groesse < SEITE.rand + 30) { seite = doc.addPage([SEITE.breite, SEITE.hoehe]); y = SEITE.hoehe - SEITE.rand; }
      seite.drawText(l, { x: SEITE.rand, y: y - groesse, size: groesse, font, color: farbe });
      y -= groesse + 6;
    }
  };
  const feld = (label: string, wert: string) => {
    seite.drawText(label, { x: SEITE.rand, y: y - 10, size: 9, font: normal, color: NEBEN });
    seite.drawText(wert, { x: SEITE.rand + 150, y: y - 10, size: 10, font: normal, color: TEXT });
    y -= 20;
  };
  const g = opt.geraet;
  const geraetName = `${g.typ}${g.marke ? ` ${g.marke}` : ''}${g.modell ? ` ${g.modell}` : ''}`;

  zeile('WeiterWert · Schrittprotokoll', fett, 16);
  zeile(`Vorgang ${opt.v.vorgangsnummer} · Gerät ${g.position}`, normal, 10, NEBEN);
  y -= 8;
  feld('Gerät', geraetName);
  feld('Schritt', `${STATUS_NAME_DE[opt.von] ?? opt.von} nach ${STATUS_NAME_DE[opt.nach] ?? opt.nach}`);
  feld('Zeitpunkt', datumZeitDe(opt.zeit.toISOString()));
  feld('Durchgeführt von', opt.nutzer);
  feld('Zweite Person', opt.zweiter ?? 'nicht erforderlich');
  y -= 10;
  zeile(BESCHREIBUNG[opt.nach] ?? 'Statuswechsel.');
  y -= 8;
  zeile('Dieses Protokoll dokumentiert genau einen Schritt. Es wird nicht geändert; Korrekturen erfolgen als neue Einträge.', normal, 8, NEBEN);
  return doc.save();
}
