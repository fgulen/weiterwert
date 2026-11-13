import { NextResponse } from 'next/server';
import { FEATURES, resolveVisibility } from '@/lib/features';
import { getAppEnv } from '@/lib/env';
import { datenbankKonfiguriert, dbKopfzeilen } from '@/lib/admin/db';
import { bereinigeFoto, FOTO_MAX_ANZAHL } from '@/lib/fotos/bild';
import { speichereFoto } from '@/lib/fotos/speicher';
import { devFotosHinzu } from '@/lib/dev/vorschau';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Device photos, sent right after a donation request was saved (one file per call). The donor proves ownership with the idempotency key
 * of their request (a random UUID that only the browser that submitted the request knows).
 */
export async function POST(req: Request) {
  if (resolveVisibility(FEATURES.geraetFoto.status, getAppEnv()) === 'hide') {
    return NextResponse.json({ ok: false, fehler: 'Nicht verfügbar.' }, { status: 404 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, fehler: 'Die Angaben sind unvollständig.' }, { status: 400 });
  }
  const schluessel = String(form.get('idempotencyKey') ?? '');
  const dateien = form.getAll('foto').filter((f): f is File => f instanceof File && f.size > 0);
  if (!UUID.test(schluessel) || dateien.length === 0) {
    return NextResponse.json({ ok: false, fehler: 'Bitte wählen Sie mindestens ein Foto.' }, { status: 400 });
  }
  if (dateien.length > FOTO_MAX_ANZAHL) {
    return NextResponse.json({ ok: false, fehler: `Höchstens ${FOTO_MAX_ANZAHL} Fotos möglich.` }, { status: 400 });
  }

  // Test environment: the files are checked like in production, but nothing is stored.
  if (getAppEnv() === 'test') {
    const bilder: ReturnType<typeof bereinigeFoto>[] = [];
    for (const datei of dateien) {
      try {
        bilder.push(bereinigeFoto(new Uint8Array(await datei.arrayBuffer())));
      } catch (e) {
        return NextResponse.json({ ok: false, fehler: e instanceof Error ? e.message : 'Die Datei ist nicht erlaubt.' }, { status: 400 });
      }
    }
    devFotosHinzu(schluessel, bilder);
    return NextResponse.json({ ok: true, gespeichert: dateien.length });
  }

  const db = datenbankKonfiguriert();
  if (!db) return NextResponse.json({ ok: false, fehler: 'Speichern ist hier nicht verfügbar.' }, { status: 503 });

  // Find the request by its key and count the photos it already has.
  const r = await fetch(
    `${db.url}/rest/v1/donation_request?select=id,donation_photo(id)&idempotency_key=eq.${schluessel.toLowerCase()}`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!r.ok) return NextResponse.json({ ok: false, fehler: 'Das hat nicht geklappt.' }, { status: 500 });
  const [anfrage] = (await r.json()) as Array<{ id: string; donation_photo: Array<{ id: string }> }>;
  if (!anfrage) return NextResponse.json({ ok: false, fehler: 'Diese Anfrage wurde nicht gefunden.' }, { status: 404 });
  if (anfrage.donation_photo.length + dateien.length > FOTO_MAX_ANZAHL) {
    return NextResponse.json({ ok: false, fehler: `Zu dieser Anfrage sind höchstens ${FOTO_MAX_ANZAHL} Fotos möglich.` }, { status: 400 });
  }

  // Check every file first, so a bad second file does not leave a half-saved upload.
  const bereit: ReturnType<typeof bereinigeFoto>[] = [];
  for (const datei of dateien) {
    try {
      bereit.push(bereinigeFoto(new Uint8Array(await datei.arrayBuffer())));
    } catch (e) {
      // bereinigeFoto only throws messages written for the donor.
      return NextResponse.json({ ok: false, fehler: e instanceof Error ? e.message : 'Die Datei ist nicht erlaubt.' }, { status: 400 });
    }
  }

  let gespeichert = 0;
  for (const bild of bereit) {
    try {
      await speichereFoto(anfrage.id, bild.typ, bild.daten);
      gespeichert++;
    } catch (e) {
      console.error('Foto speichern', e);
      return NextResponse.json({ ok: false, fehler: 'Ein Foto konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.', gespeichert }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true, gespeichert });
}
