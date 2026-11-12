'use server';

import { revalidatePath } from 'next/cache';
import { aktuellerNutzer } from '@/lib/admin/session';
import { datenbankKonfiguriert, dbKopfzeilen } from '@/lib/admin/db';
import { ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { schreibeProtokoll } from '@/lib/admin/protokoll';
import { istErlaubterWechsel } from '@/lib/admin/status';
import { loescheFoto } from '@/lib/fotos/speicher';

export type StatusErgebnis = { ok?: boolean; fehler?: string };

/**
 * Moves a case to the next status. The audit row is written first: if it cannot be saved, nothing changes.
 * The update only applies while the status is still the one the user saw (no silent overwrite).
 */
export async function statusAendern(nummer: string, nach: string): Promise<StatusErgebnis> {
  if (!VORGANGSNUMMER.test(nummer)) return { fehler: 'Ungültige Vorgangsnummer.' };
  const nutzer = await aktuellerNutzer();
  if (!nutzer) return { fehler: 'Bitte erneut anmelden.' };

  const v = await ladeVorgang(nummer);
  if (!v) return { fehler: 'Vorgang nicht gefunden.' };
  if (!istErlaubterWechsel(v.status, nach)) return { fehler: 'Dieser Statuswechsel ist nicht erlaubt.' };

  const db = datenbankKonfiguriert();
  if (!db) return { fehler: 'Speichern ist hier nicht verfügbar.' };

  try {
    await schreibeProtokoll({ nutzer: nutzer.email, aktion: 'status', vorgang: nummer, details: { von: v.status, nach } });
  } catch {
    return { fehler: 'Der Statuswechsel konnte nicht protokolliert werden. Bitte später erneut versuchen.' };
  }

  const res = await fetch(`${db.url}/rest/v1/donation_request?vorgangsnummer=eq.${nummer}&status=eq.${v.status}`, {
    method: 'PATCH',
    headers: dbKopfzeilen(db.key, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify({ status: nach }),
    cache: 'no-store',
  });
  const geaendert = res.ok ? ((await res.json()) as unknown[]) : [];
  if (!res.ok || geaendert.length === 0) {
    await schreibeProtokoll({ nutzer: nutzer.email, aktion: 'status-fehlgeschlagen', vorgang: nummer, details: { von: v.status, nach } }).catch(() => undefined);
    return { fehler: 'Der Status wurde inzwischen von jemand anderem geändert. Bitte Seite neu laden.' };
  }

  revalidatePath(`/admin/vorgang/${nummer}`);
  revalidatePath('/admin');
  return { ok: true };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Deletes one device photo. Only the admin role may delete (Plan §11), and the deletion is recorded. */
export async function fotoLoeschen(nummer: string, fotoId: string): Promise<void> {
  if (!VORGANGSNUMMER.test(nummer) || !UUID.test(fotoId)) return;
  const nutzer = await aktuellerNutzer();
  if (!nutzer || nutzer.rolle !== 'admin') return;
  const db = datenbankKonfiguriert();
  if (!db) return;
  const v = await ladeVorgang(nummer);
  if (!v) return;
  const res = await fetch(`${db.url}/rest/v1/donation_photo?select=id,pfad&id=eq.${fotoId}&request_id=eq.${v.id}`, {
    headers: dbKopfzeilen(db.key),
    cache: 'no-store',
  });
  const [foto] = res.ok ? ((await res.json()) as Array<{ id: string; pfad: string }>) : [];
  if (!foto) return;
  await loescheFoto({ id: foto.id, pfad: foto.pfad, requestId: v.id, nutzer: nutzer.email, vorgang: nummer });
  revalidatePath(`/admin/vorgang/${nummer}`);
}
