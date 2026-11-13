'use server';

import { revalidatePath } from 'next/cache';
import { aktuellerNutzer } from '@/lib/admin/session';
import { datenbankKonfiguriert, dbKopfzeilen } from '@/lib/admin/db';
import { ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { schreibeProtokoll } from '@/lib/admin/protokoll';
import { pruefeAkte, type AkteFehler } from '@/lib/admin/akte';
import { devAkteSetzen, devVorschauAktiv } from '@/lib/dev/vorschau';
import { aktuelleSprache } from '@/lib/i18n/server';
import { adminTexte } from '@/lib/i18n/admin';

export type AkteErgebnis = { ok?: string; fehler?: string; feld?: AkteFehler };

/** Saves the device record of one device. Admins and staff only. The audit row lists the changed fields, not their values. */
export async function akteSpeichern(nummer: string, position: number, _v: AkteErgebnis, fd: FormData): Promise<AkteErgebnis> {
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  if (!VORGANGSNUMMER.test(nummer)) return { fehler: t.ungueltigeNr };
  const nutzer = await aktuellerNutzer();
  if (!nutzer || (nutzer.rolle !== 'admin' && nutzer.rolle !== 'mitarbeiter')) return { fehler: t.akte.nurLesen };
  if (!Number.isInteger(position) || position < 1) return { fehler: t.akte.ungueltigPosition };

  const { werte, fehler } = pruefeAkte(Object.fromEntries(fd.entries()));
  if (Object.keys(fehler).length > 0) return { fehler: t.fehlerAllgemein, feld: fehler };

  if (devVorschauAktiv()) {
    if (!devAkteSetzen(nummer, position, werte)) return { fehler: t.akte.ungueltigPosition };
    revalidatePath(`/admin/vorgang/${nummer}`);
    return { ok: t.akte.gespeichert };
  }

  const v = await ladeVorgang(nummer);
  if (!v) return { fehler: t.detail.vorgangNichtGefunden };
  const geraet = v.geraete.find((g) => g.position === position);
  if (!geraet) return { fehler: t.akte.ungueltigPosition };
  const db = datenbankKonfiguriert();
  if (!db) return { fehler: t.nichtVerfuegbar };

  const alt = geraet.akte;
  const geaendert = (Object.keys(werte) as Array<keyof typeof werte>).filter((k) => (alt[k] ?? null) !== (werte[k] ?? null));
  if (geaendert.length === 0) return { ok: t.akte.gespeichert };
  try {
    await schreibeProtokoll({ nutzer: nutzer.email, aktion: 'akte-geaendert', vorgang: nummer, details: { position, felder: geaendert } });
  } catch {
    return { fehler: t.akte.protokollFehler };
  }

  const res = await fetch(`${db.url}/rest/v1/device_record?on_conflict=device_id`, {
    method: 'POST',
    headers: dbKopfzeilen(db.key, { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify({ device_id: geraet.id, ...werte, aktualisiert: new Date().toISOString(), aktualisiert_von: nutzer.email }),
    cache: 'no-store',
  });
  if (!res.ok) return { fehler: t.akte.speicherFehler };
  revalidatePath(`/admin/vorgang/${nummer}`);
  return { ok: t.akte.gespeichert };
}
