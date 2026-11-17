import { notFound } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/admin/session';
import { VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { holeLetztesSchrittPdf } from '@/lib/admin/schritt-speicher';
import { ablaufSichtbar } from '@/lib/admin/ablauf-sichtbar';
import { gatePage } from '@/lib/page-gate';

type Kontext = { params: Promise<{ nr: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Letztes Schrittprotokoll eines Geräts (PDF). Nur lesen. */
export async function GET(req: Request, { params }: Kontext) {
  gatePage('admin');
  if (!ablaufSichtbar()) notFound();
  const { nr } = await params;
  if (!VORGANGSNUMMER.test(nr)) notFound();
  const nutzer = await aktuellerNutzer();
  if (!nutzer) return new Response('Nicht angemeldet.', { status: 401, headers: { 'Cache-Control': 'no-store' } });

  const device = new URL(req.url).searchParams.get('device') ?? '';
  if (!UUID.test(device)) notFound();

  const bytes = await holeLetztesSchrittPdf(nr, device);
  if (!bytes) notFound();
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Schritt-${nr}.pdf"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
