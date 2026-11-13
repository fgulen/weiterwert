import { notFound } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/admin/session';
import { ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { baueLoeschprotokoll } from '@/lib/admin/belege';
import { schreibeProtokoll } from '@/lib/admin/protokoll';
import { devVorschauAktiv } from '@/lib/dev/vorschau';
import { gatePage } from '@/lib/page-gate';

/** Deletion log as a PDF download. Administrators and staff; each download is recorded. */
export async function GET(_req: Request, { params }: { params: Promise<{ nr: string }> }) {
  gatePage('admin');
  const { nr } = await params;
  if (!VORGANGSNUMMER.test(nr)) notFound();
  const nutzer = await aktuellerNutzer();
  if (!nutzer) return new Response('Nicht angemeldet.', { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const vorgang = await ladeVorgang(nr);
  if (!vorgang) notFound();
  if (!devVorschauAktiv()) {
    try {
      await schreibeProtokoll({ nutzer: nutzer.email, aktion: 'loeschprotokoll-pdf', vorgang: nr, details: {} });
    } catch {
      return new Response('Der Download konnte nicht protokolliert werden.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
  }
  const pdf = await baueLoeschprotokoll(vorgang, new Date());
  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Loeschprotokoll-${nr}.pdf"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
