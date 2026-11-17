// PDF der digitalen Annahme (Dok. 18). Zeigt die erfassten Häkchen, Zustände, Entscheidung und die Unterschrift.
import { PDFDocument, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import type { VorgangDaten } from './vorgang';
import type { AnnahmeDaten } from './annahme-nachweis';
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
const ZUSTAND: Record<string, string> = { gut: 'gut', spuren: 'Spuren', defekt: 'defekt' };
const DATENTRAEGER: Record<string, string> = { ja: 'ja', nein: 'nein', unklar: 'unklar' };
const ENTSCHEIDUNG: Record<string, string> = {
  vollstaendig: 'Annahme vollständig',
  teilweise: 'Annahme teilweise',
  ablehnung: 'Ablehnung',
};

export async function baueAnnahmeDigital(
  v: VorgangDaten,
  d: AnnahmeDaten,
  zeitpunkt: Date,
  hash: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Geräteannahme ${v.vorgangsnummer}`);
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
  const feld = (label: string, wert: string) => {
    platz(20);
    seite.drawText(label, { x: SEITE.rand, y: y - 10, size: 9, font: normal, color: NEBEN });
    seite.drawText(wert, { x: SEITE.rand + 170, y: y - 10, size: 10, font: normal, color: TEXT });
    y -= 20;
  };
  const abschnitt = (titel: string) => {
    y -= 8;
    platz(28);
    zeile(titel, fett, 12);
    y -= 2;
  };

  zeile('WeiterWert · Vorlage 18 (digital)', normal, 9, NEBEN);
  zeile('Geräteannahmeprotokoll', fett, 18);
  y -= 4;
  feld('Vorgang', v.vorgangsnummer);
  feld('Erfasst am', datumDe(zeitpunkt.toISOString()));
  feld('Angenommen durch', d.unterzeichner);
  feld('Spenderart', v.kontakt.organisation ? 'Organisation' : 'Privat');

  abschnitt('1. Übernommene Geräte');
  for (const g of v.geraete) {
    const e = d.geraete.find((x) => x.position === g.position);
    zeile(`${g.position}. ${g.typ}${g.marke ? ` ${g.marke}` : ''}${g.modell ? ` ${g.modell}` : ''}`, fett, 10);
    zeile(
      `Zustand: ${e?.zustand ? ZUSTAND[e.zustand] : '–'}   ·   Datenträger: ${e?.datentraeger ? DATENTRAEGER[e.datentraeger] : '–'}`,
      normal,
      10,
    );
  }

  abschnitt('2. Sicherheits- und Plausibilitätsprüfung');
  SICHERHEIT.forEach((text, i) => {
    const antwort = d.sicherheit[i];
    const mark = antwort === true ? 'Ja' : antwort === false ? 'Nein / n. a.' : '–';
    zeile(`${i + 1}. ${text}: ${mark}`);
  });

  abschnitt('3. Entscheidung');
  zeile(`${d.entscheidung ? ENTSCHEIDUNG[d.entscheidung] : '–'}${d.grund ? ` · Grund: ${d.grund}` : ''}`);

  abschnitt('4. Unterschrift');
  try {
    const png = await doc.embedPng(Buffer.from(d.unterschrift.split(',')[1], 'base64'));
    platz(90);
    seite.drawImage(png, { x: SEITE.rand, y: y - 70, width: 180, height: 60 });
    seite.drawLine({ start: { x: SEITE.rand, y: y - 72 }, end: { x: SEITE.rand + 220, y: y - 72 }, thickness: 0.5, color: NEBEN });
    seite.drawText(`${d.unterzeichner}`, { x: SEITE.rand, y: y - 84, size: 9, font: normal, color: TEXT });
    y -= 96;
  } catch {
    zeile('Unterschrift konnte nicht eingebettet werden.', normal, 10, NEBEN);
  }

  abschnitt('Nachweis');
  zeile(`Prüfsumme (SHA-256): ${hash}`, normal, 7, NEBEN);
  zeile('Digitale Erfassung. Rechtliche Wirksamkeit der elektronischen Unterschrift ist vor Livegang zu prüfen.', normal, 8, NEBEN);

  return doc.save();
}
