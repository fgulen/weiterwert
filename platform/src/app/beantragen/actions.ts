'use server';

import { leseAntrag, waehleAntragSpeicher } from '@/lib/antrag/antrag';

export type AntragAntwort = { ok: true; antragsnummer: string } | { ok: false; fehler: string };

const TECHNIK = 'Ihr Antrag konnte gerade nicht gespeichert werden. Bitte versuchen Sie es später erneut oder schreiben Sie uns an weiterwert@gmail.com.';

/** Public endpoint: everything from the browser is checked again here. */
export async function sendeAntrag(eingabe: unknown): Promise<AntragAntwort> {
  const speicher = waehleAntragSpeicher();
  if (!speicher) return { ok: false, fehler: TECHNIK };

  const gelesen = leseAntrag(eingabe);
  if (!gelesen.ok) return gelesen;

  try {
    const zufall = Math.floor(Math.random() * 1_000_000);
    const gespeichert = await speicher.speichere(gelesen.antrag, zufall, new Date().getUTCFullYear());
    return { ok: true, antragsnummer: gespeichert.antragsnummer };
  } catch (e) {
    console.error('Antrag speichern fehlgeschlagen', e);
    return { ok: false, fehler: TECHNIK };
  }
}
