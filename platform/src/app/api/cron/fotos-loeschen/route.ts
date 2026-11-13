import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getAppEnv } from '@/lib/env';
import { datenbankKonfiguriert, dbKopfzeilen } from '@/lib/admin/db';
import { loescheFoto } from '@/lib/fotos/speicher';

/** Compares two strings in constant time. */
function gleich(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Deletes device photos whose 14-day deadline has passed. Called once a day by Vercel Cron.
 * Protected by CRON_SECRET (Vercel sends it as Bearer token). Each deletion is recorded in the audit log.
 */
export async function GET(req: Request) {
  const geheim = process.env.CRON_SECRET;
  if (!geheim) return NextResponse.json({ ok: false, fehler: 'CRON_SECRET fehlt.' }, { status: 503 });
  if (!gleich(req.headers.get('authorization') ?? '', `Bearer ${geheim}`)) {
    return NextResponse.json({ ok: false, fehler: 'Nicht berechtigt.' }, { status: 401 });
  }
  if (getAppEnv() === 'test') return NextResponse.json({ ok: true, geloescht: 0, hinweis: 'Testumgebung' });

  const db = datenbankKonfiguriert();
  if (!db) return NextResponse.json({ ok: false, fehler: 'Datenbank nicht konfiguriert.' }, { status: 503 });

  const jetzt = new Date().toISOString();
  const res = await fetch(
    `${db.url}/rest/v1/donation_photo?select=id,pfad,request_id,donation_request(vorgangsnummer)&loeschen_am=lt.${encodeURIComponent(jetzt)}&limit=200`,
    { headers: dbKopfzeilen(db.key), cache: 'no-store' },
  );
  if (!res.ok) return NextResponse.json({ ok: false, fehler: `Liste: ${res.status}` }, { status: 503 });
  const zeilen = (await res.json()) as Array<{
    id: string;
    pfad: string;
    request_id: string;
    donation_request: { vorgangsnummer: string } | null;
  }>;

  let geloescht = 0;
  let fehlgeschlagen = 0;
  for (const z of zeilen) {
    try {
      await loescheFoto({
        id: z.id,
        pfad: z.pfad,
        requestId: z.request_id,
        nutzer: 'system:frist',
        vorgang: z.donation_request?.vorgangsnummer ?? '-',
      });
      geloescht++;
    } catch {
      fehlgeschlagen++;
    }
  }
  return NextResponse.json({ ok: fehlgeschlagen === 0, geloescht, fehlgeschlagen, geprueft: zeilen.length });
}
