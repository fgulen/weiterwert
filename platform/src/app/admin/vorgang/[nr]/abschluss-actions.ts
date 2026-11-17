'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/admin/session';
import { datenbankKonfiguriert, dbKopfzeilen } from '@/lib/admin/db';
import { ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { schreibeProtokoll } from '@/lib/admin/protokoll';
import { ladeGeraeteStatus } from '@/lib/admin/geraete-status';
import { vorgangFertig } from '@/lib/admin/geraet-ablauf';
import { aktuelleSprache } from '@/lib/i18n/server';
import { pfadFuer } from '@/lib/i18n/sprache';

/**
 * Vorgang abschließen. Nur Admin, nur wenn jedes Gerät in einem Endstatus ist
 * (übergeben, rückgabe, entsorgt; siehe vorgangFertig). Keine Zweitfreigabe.
 * Der Abschluss wird im Protokoll festgehalten. Die alten Zwischenstufen werden nicht gesetzt.
 */
export async function schliesseVorgangAktion(form: FormData): Promise<void> {
  const { lang } = await aktuelleSprache();
  const nummer = String(form.get('vorgangsnummer') ?? '');
  const zurueck = (zusatz: string) => pfadFuer(lang, `/admin/vorgang/${nummer}${zusatz}#status-titel`);

  if (!VORGANGSNUMMER.test(nummer)) redirect(pfadFuer(lang, '/admin'));
  const nutzer = await aktuellerNutzer();
  if (!nutzer || nutzer.rolle !== 'admin') redirect(zurueck('?ab=fehler&grund=berechtigung'));

  const v = await ladeVorgang(nummer);
  if (!v) redirect(zurueck('?ab=fehler&grund=vorgang'));
  if (v.status === 'abgeschlossen') redirect(zurueck('?ab=ok'));

  const geraete = await ladeGeraeteStatus(nummer);
  if (!geraete || !vorgangFertig(geraete)) redirect(zurueck('?ab=fehler&grund=nicht_fertig'));

  const db = datenbankKonfiguriert();
  if (!db) redirect(zurueck('?ab=fehler&grund=datenbank'));

  try {
    await schreibeProtokoll({ nutzer: nutzer.email, aktion: 'vorgang-abschluss', vorgang: nummer, details: { von: v.status, nach: 'abgeschlossen' } });
  } catch {
    redirect(zurueck('?ab=fehler&grund=protokoll'));
  }

  const res = await fetch(`${db.url}/rest/v1/donation_request?vorgangsnummer=eq.${nummer}&status=eq.${v.status}`, {
    method: 'PATCH',
    headers: dbKopfzeilen(db.key, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify({ status: 'abgeschlossen' }),
    cache: 'no-store',
  });
  const geaendert = res.ok ? ((await res.json()) as unknown[]) : [];
  if (!res.ok || geaendert.length === 0) redirect(zurueck('?ab=fehler&grund=status'));

  revalidatePath(`/admin/vorgang/${nummer}`);
  revalidatePath('/admin');
  redirect(zurueck('?ab=ok'));
}
