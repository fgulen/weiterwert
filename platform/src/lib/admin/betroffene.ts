import 'server-only';
import { devEintraege, devEintrag, devVorschauAktiv } from '@/lib/dev/vorschau';
import { ladeFotos } from '@/lib/fotos/speicher';
import { datenbankKonfiguriert, dbKopfzeilen } from './db';
import { ladeVorgang } from './vorgang';
import { schreibeProtokoll } from './protokoll';
import { EMAIL_FORMAT } from './email';

export { EMAIL_FORMAT };

export type Treffer = { vorgangsnummer: string; status: string; angelegt: string; geraete: number };

/** All requests whose contact has this e-mail address (exact match, as stored). */
export async function sucheNachEmail(email: string): Promise<Treffer[]> {
  if (devVorschauAktiv()) {
    const gesucht = email.toLowerCase();
    return devEintraege()
      .filter((e) => String((e.payload.kontakt as { email?: string })?.email ?? '').toLowerCase() === gesucht)
      .map((e) => ({
        vorgangsnummer: e.vorgangsnummer,
        status: 'neu',
        angelegt: e.angelegt,
        geraete: ((e.payload.geraete as unknown[]) ?? []).length,
      }));
  }
  const db = datenbankKonfiguriert();
  if (!db) return [];
  const res = await fetch(
    `${db.url}/rest/v1/donation_request?select=vorgangsnummer,status,created_at,donation_device(id),contact!inner(email)&contact.email=ilike.${encodeURIComponent(email.replace(/[\\%_]/g, (m) => '\\' + m))}&order=created_at.desc`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!res.ok) throw new Error(`Suche: ${res.status}`);
  const zeilen = (await res.json()) as Array<{ vorgangsnummer: string; status: string; created_at: string; donation_device: unknown[] }>;
  return zeilen.map((z) => ({ vorgangsnummer: z.vorgangsnummer, status: z.status, angelegt: z.created_at, geraete: z.donation_device.length }));
}

/**
 * Everything stored about one person (Art. 15): contact data, requests and devices, and how many photos exist.
 * Photo files themselves are not part of the export. The access is recorded in the audit log.
 */
export async function auskunftFuer(email: string, nutzerEmail: string, aktion: string) {
  const treffer = await sucheNachEmail(email);
  const eintraege = [];
  for (const t of treffer) {
    const v = await ladeVorgang(t.vorgangsnummer);
    if (!v) continue;
    const fotos = devVorschauAktiv()
      ? (devEintrag(t.vorgangsnummer)?.fotos.length ?? 0)
      : (await ladeFotos(v.id)).length; // a failed read must not turn into "0 photos" in the export
    eintraege.push({
      vorgangsnummer: v.vorgangsnummer,
      status: v.status,
      eingegangen: v.angelegt,
      kontakt: v.kontakt,
      geraete: v.geraete.map((g) => ({ position: g.position, typ: g.typ, marke: g.marke, modell: g.modell, angaben: g.angaben, ergebnis: g.ergebnis, gruende: g.gruende })),
      fotosAnzahl: fotos,
      erklaerungVersion: v.erklaerungVersion,
    });
  }
  if (!devVorschauAktiv()) {
    // Without a record no data is handed out (same rule as the PDF).
    await schreibeProtokoll({ nutzer: nutzerEmail, aktion, vorgang: eintraege.map((e) => e.vorgangsnummer).join(',') || '-', details: { anzahl: eintraege.length } });
  }
  return { erstelltAm: new Date().toISOString(), betroffene: email, anzahl: eintraege.length, vorgaenge: eintraege };
}
