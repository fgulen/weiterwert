import { describe, expect, it } from 'vitest';
import { GERAET_FOLGE, geraetNaechsteStatus } from './geraet-ablauf';
import { ERLEDIGT_SCHRITTE, GERAET_PROZESS } from './geraet-prozess';
import { ABLAUF_STAND_GRUPPEN } from './ablauf-stand';

const prozessStatus = new Set(GERAET_PROZESS.flatMap((s) => s.status));

describe('Gesamtprozess passt zu den Regeln', () => {
  it('jeder Status der Regeln kommt im Prozess vor', () => {
    const alle = new Set([...Object.keys(GERAET_FOLGE), ...Object.values(GERAET_FOLGE).flat()]);
    for (const s of alle) expect(prozessStatus.has(s), `fehlt im Prozess: ${s}`).toBe(true);
  });

  it('jeder Status im Prozess ist auch eine Regel', () => {
    const regeln = new Set([...Object.keys(GERAET_FOLGE), ...Object.values(GERAET_FOLGE).flat()]);
    for (const s of prozessStatus) expect(regeln.has(s), `unbekannt: ${s}`).toBe(true);
  });

  it('Endstatus haben keinen Nachfolger', () => {
    for (const s of ['uebergeben', 'rueckgabe', 'entsorgt']) expect(geraetNaechsteStatus(s)).toEqual([]);
  });

  it('Schritte sind durchnummeriert 1 bis 12 ohne Lücke', () => {
    expect(GERAET_PROZESS.map((s) => s.nr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('jeder Schritt hat Titel, Text und Verantwortliche in Deutsch und Türkisch', () => {
    for (const s of GERAET_PROZESS) {
      for (const feld of [s.titel, s.wer, s.text]) {
        expect(feld.de.trim().length).toBeGreaterThan(0);
        expect(feld.tr.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('erledigte Schritte gibt es im Prozess', () => {
    const nummern = GERAET_PROZESS.map((s) => s.nr);
    for (const n of ERLEDIGT_SCHRITTE) expect(nummern.includes(n)).toBe(true);
  });

  it('offene Punktnummern gibt es in der Liste der offenen Fragen', () => {
    const nummern = new Set(
      ABLAUF_STAND_GRUPPEN.flatMap((g) => g.punkte).map((p) => Number(p.text.de.match(/Punkt (\d+)/)?.[1] ?? p.text.tr.match(/madde (\d+)/)?.[1])),
    );
    for (const s of GERAET_PROZESS) {
      for (const n of s.offen) expect(nummern.has(n), `Punkt ${n} fehlt`).toBe(true);
    }
  });
});
