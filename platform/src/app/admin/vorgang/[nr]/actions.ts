'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/admin/session';
import { datenbankKonfiguriert, dbKopfzeilen } from '@/lib/admin/db';
import { ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { schreibeProtokoll } from '@/lib/admin/protokoll';
import { istErlaubterWechsel } from '@/lib/admin/status';
import { loescheFoto } from '@/lib/fotos/speicher';
import { pruefeKontakt, type Kontakt, type KontaktFehler } from '@/lib/absenden/anfrage';
import { devFotoLoeschen, devKontaktAendern, devVorschauAktiv } from '@/lib/dev/vorschau';
import { loescheVorgang } from '@/lib/admin/loeschen';
import { aktuelleSprache } from '@/lib/i18n/server';
import { adminTexte } from '@/lib/i18n/admin';
import { pfadFuer } from '@/lib/i18n/sprache';
import { CHECK } from '@/lib/i18n/check';

export type StatusErgebnis = { ok?: boolean; fehler?: string };

/**
 * Moves a case to the next status. The audit row is written first: if it cannot be saved, nothing changes.
 * The update only applies while the status is still the one the user saw (no silent overwrite).
 */
export async function statusAendern(nummer: string, nach: string): Promise<StatusErgebnis> {
  const t = adminTexte((await aktuelleSprache()).lang);
  if (!VORGANGSNUMMER.test(nummer)) return { fehler: t.ungueltigeNr };
  const nutzer = await aktuellerNutzer();
  if (!nutzer) return { fehler: t.erneutAnmelden };
  if (nutzer.rolle !== 'admin') return { fehler: t.erneutAnmelden };

  const v = await ladeVorgang(nummer);
  if (!v) return { fehler: t.detail.vorgangNichtGefunden };
  if (!istErlaubterWechsel(v.status, nach)) return { fehler: t.detail.statusNichtErlaubt };

  const db = datenbankKonfiguriert();
  if (!db) return { fehler: t.nichtVerfuegbar };

  try {
    await schreibeProtokoll({ nutzer: nutzer.email, aktion: 'status', vorgang: nummer, details: { von: v.status, nach } });
  } catch {
    return { fehler: t.detail.statusNichtProtokolliert };
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
    return { fehler: t.detail.statusVonAnderem };
  }

  revalidatePath(`/admin/vorgang/${nummer}`);
  revalidatePath('/admin');
  return { ok: true };
}

export type KontaktErgebnis = { ok?: boolean; fehler?: string; feldFehler?: KontaktFehler };

/**
 * Corrects the contact details of a request (typos, a new phone number). Admins and staff may do this.
 * The device answers and the declarations are never changed here. The audit row lists the changed fields, not their values.
 */
export async function kontaktAendern(nummer: string, werte: Kontakt): Promise<KontaktErgebnis> {
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  if (!VORGANGSNUMMER.test(nummer)) return { fehler: t.ungueltigeNr };
  const nutzer = await aktuellerNutzer();
  if (!nutzer) return { fehler: t.erneutAnmelden };

  const saubere: Kontakt = {
    name: String(werte.name ?? '').trim(),
    email: String(werte.email ?? '').trim(),
    plz: String(werte.plz ?? '').trim(),
    telefon: String(werte.telefon ?? '').trim(),
    organisation: String(werte.organisation ?? '').trim(),
  };
  const feldFehler = pruefeKontakt(saubere, CHECK[lang].kontaktFehler);
  if (Object.keys(feldFehler).length > 0) return { fehler: t.detail.feldeMarkiert, feldFehler };

  if (devVorschauAktiv()) {
    devKontaktAendern(nummer, saubere);
    revalidatePath(`/admin/vorgang/${nummer}`);
    return { ok: true };
  }

  const v = await ladeVorgang(nummer);
  if (!v) return { fehler: t.detail.vorgangNichtGefunden };
  const db = datenbankKonfiguriert();
  if (!db) return { fehler: t.nichtVerfuegbar };

  const geaendert = (['name', 'email', 'plz', 'telefon', 'organisation'] as const).filter((f) => (v.kontakt[f] ?? '') !== saubere[f]);
  if (geaendert.length === 0) return { ok: true };
  try {
    await schreibeProtokoll({ nutzer: nutzer.email, aktion: 'kontakt-geaendert', vorgang: nummer, details: { felder: geaendert } });
  } catch {
    return { fehler: t.detail.kontaktNichtProtokolliert };
  }

  const res = await fetch(`${db.url}/rest/v1/contact?id=eq.${v.kontaktId}`, {
    method: 'PATCH',
    headers: dbKopfzeilen(db.key, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify({
      name: saubere.name,
      email: saubere.email,
      plz: saubere.plz,
      telefon: saubere.telefon || null,
      organisation: saubere.organisation || null,
    }),
    cache: 'no-store',
  });
  if (!res.ok) return { fehler: t.detail.kontaktNichtGespeichert };

  revalidatePath(`/admin/vorgang/${nummer}`);
  return { ok: true };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Deletes one device photo. Only the admin role may delete (Plan §11), and the deletion is recorded. */
export async function fotoLoeschen(nummer: string, fotoId: string): Promise<void> {
  if (!VORGANGSNUMMER.test(nummer) || !UUID.test(fotoId)) return;
  const nutzer = await aktuellerNutzer();
  if (!nutzer || nutzer.rolle !== 'admin') return;
  if (devVorschauAktiv()) {
    devFotoLoeschen(nummer, fotoId);
    revalidatePath(`/admin/vorgang/${nummer}`);
    return;
  }
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

export type LoeschErgebnis = { fehler?: string };

/**
 * Deletes a whole request with its contact, devices and photos. Admin role only.
 * The audit row is written first. Photo files are removed from storage before the row goes, so no file is left behind.
 */
export async function vorgangLoeschen(nummer: string): Promise<LoeschErgebnis> {
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  const zurListe = pfadFuer(lang, '/admin');
  if (!VORGANGSNUMMER.test(nummer)) return { fehler: t.ungueltigeNr };
  const nutzer = await aktuellerNutzer();
  if (!nutzer || nutzer.rolle !== 'admin') return { fehler: t.detail.loeschenNurAdmin };

  const ergebnis = await loescheVorgang(nummer, nutzer.email, t);
  if (ergebnis.fehler) return { fehler: ergebnis.fehler };
  revalidatePath('/admin');
  redirect(zurListe);
}
