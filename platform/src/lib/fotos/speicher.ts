import 'server-only';
import { randomUUID } from 'node:crypto';
import { datenbankKonfiguriert, dbKopfzeilen } from '@/lib/admin/db';
import { schreibeProtokoll } from '@/lib/admin/protokoll';
import type { BildTyp } from './bild';

export const FOTO_BUCKET = 'geraete-fotos';
export const FOTO_LOESCHFRIST_TAGE = 14;

export type FotoZeile = { id: string; pfad: string; typ: BildTyp; groesse: number; angelegt: string; loeschen_am: string };

/** Stores one cleaned photo privately and records it. Returns the stored row. */
export async function speichereFoto(requestId: string, typ: BildTyp, daten: Uint8Array): Promise<FotoZeile> {
  const db = datenbankKonfiguriert();
  if (!db) throw new Error('Speichern ist hier nicht verfügbar.');
  const endung = typ === 'jpeg' ? 'jpg' : 'png';
  const pfad = `${requestId}/${randomUUID()}.${endung}`;

  const up = await fetch(`${db.url}/storage/v1/object/${FOTO_BUCKET}/${pfad}`, {
    method: 'POST',
    headers: { apikey: db.key, Authorization: `Bearer ${db.key}`, 'Content-Type': typ === 'jpeg' ? 'image/jpeg' : 'image/png', 'x-upsert': 'false' },
    body: new Blob([new Uint8Array(daten)], { type: typ === 'jpeg' ? 'image/jpeg' : 'image/png' }),
    cache: 'no-store',
  });
  if (!up.ok) throw new Error(`Foto-Upload: ${up.status}`);

  const res = await fetch(`${db.url}/rest/v1/donation_photo`, {
    method: 'POST',
    headers: dbKopfzeilen(db.key, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify({ request_id: requestId, pfad, typ, groesse: daten.length }),
    cache: 'no-store',
  });
  if (!res.ok) {
    // Do not keep a file without a record: remove it again.
    await fetch(`${db.url}/storage/v1/object/${FOTO_BUCKET}/${pfad}`, { method: 'DELETE', headers: dbKopfzeilen(db.key), cache: 'no-store' }).catch(() => undefined);
    throw new Error(`Foto-Eintrag: ${res.status}`);
  }
  const [zeile] = (await res.json()) as FotoZeile[];
  return zeile;
}

/** Photos of one request, newest first. */
export async function ladeFotos(requestId: string): Promise<FotoZeile[]> {
  const db = datenbankKonfiguriert();
  if (!db) return [];
  const res = await fetch(
    `${db.url}/rest/v1/donation_photo?select=id,pfad,typ,groesse,angelegt,loeschen_am&request_id=eq.${requestId}&order=angelegt.desc`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!res.ok) throw new Error(`Fotos lesen: ${res.status}`);
  return (await res.json()) as FotoZeile[];
}

/** A short-lived link (5 minutes) to view one photo. Every view is recorded in the audit log by the caller. */
export async function signierterLink(pfad: string): Promise<string> {
  const db = datenbankKonfiguriert();
  if (!db) throw new Error('Nicht verfügbar.');
  const res = await fetch(`${db.url}/storage/v1/object/sign/${FOTO_BUCKET}/${pfad}`, {
    method: 'POST',
    headers: dbKopfzeilen(db.key, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ expiresIn: 300 }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Link: ${res.status}`);
  const { signedURL } = (await res.json()) as { signedURL: string };
  return `${db.url}/storage/v1${signedURL}`;
}

/** Deletes one photo from storage and from the table, and records who did it. */
export async function loescheFoto(f: { id: string; pfad: string; requestId: string; nutzer: string; vorgang: string }): Promise<void> {
  const db = datenbankKonfiguriert();
  if (!db) throw new Error('Nicht verfügbar.');
  const del = await fetch(`${db.url}/storage/v1/object/${FOTO_BUCKET}/${f.pfad}`, { method: 'DELETE', headers: dbKopfzeilen(db.key), cache: 'no-store' });
  if (!del.ok) throw new Error(`Foto löschen: ${del.status}`);
  const row = await fetch(`${db.url}/rest/v1/donation_photo?id=eq.${f.id}`, { method: 'DELETE', headers: dbKopfzeilen(db.key), cache: 'no-store' });
  if (!row.ok) throw new Error(`Foto-Eintrag löschen: ${row.status}`);
  await schreibeProtokoll({ nutzer: f.nutzer, aktion: 'foto-geloescht', vorgang: f.vorgang, details: { pfad: f.pfad } });
}
