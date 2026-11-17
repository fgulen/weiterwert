import { notFound } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/admin/session';
import { VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { holeLetzteVersion } from '@/lib/admin/protokoll-pdf';
import { schreibeProtokoll } from '@/lib/admin/protokoll';
import { ablaufSichtbar } from '@/lib/admin/ablauf-sichtbar';
import { devVorschauAktiv } from '@/lib/dev/vorschau';
import { gatePage } from '@/lib/page-gate';

type Kontext = { params: Promise<{ nr: string }> };

const ARTEN = { uebergabe: 'uebergabe-digital', loeschung: 'loeschung-digital' } as const;

/** Gespeichertes digitales Protokoll (Übergabe oder Löschung) als PDF. Nur lesen. */
export async function GET(req: Request, { params }: Kontext) {
  gatePage('admin');
  if (!ablaufSichtbar()) notFound();
  const { nr } = await params;
  if (!VORGANGSNUMMER.test(nr)) notFound();
  const nutzer = await aktuellerNutzer();
  if (!nutzer) return new Response('Nicht angemeldet.', { status: 401, headers: { 'Cache-Control': 'no-store' } });

  const art = new URL(req.url).searchParams.get('art') as keyof typeof ARTEN | null;
  if (!art || !(art in ARTEN)) notFound();

  const bytes = await holeLetzteVersion(nr, ARTEN[art!]);
  if (!bytes) notFound();

  // Personenbezogene Nachweise mit Unterschrift: jeder Download wird protokolliert (wie bei den anderen PDFs).
  if (!devVorschauAktiv()) {
    try {
      await schreibeProtokoll({ nutzer: nutzer.email, aktion: `${art}-nachweis-pdf`, vorgang: nr, details: {} });
    } catch {
      return new Response('Der Download konnte nicht protokolliert werden.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
  }

  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${art}-${nr}.pdf"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
