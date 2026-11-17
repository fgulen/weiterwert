import { notFound } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/admin/session';
import { ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { baueVorgangsblatt } from '@/lib/admin/vorgangsblatt';
import { schreibeProtokoll } from '@/lib/admin/protokoll';
import { holeOderErzeuge } from '@/lib/admin/protokoll-pdf';
import { gatePage } from '@/lib/page-gate';
import { devVorschauAktiv } from '@/lib/dev/vorschau';

type Kontext = { params: Promise<{ nr: string }> };

/** Vorgangsblatt as a PDF download. Same sign-in check as the admin pages; personal data, so never cached. */
export async function GET(_req: Request, { params }: Kontext) {
  gatePage('admin');
  const { nr } = await params;
  if (!VORGANGSNUMMER.test(nr)) notFound();

  const nutzer = await aktuellerNutzer();
  if (!nutzer) return new Response('Nicht angemeldet.', { status: 401, headers: { 'Cache-Control': 'no-store' } });

  const vorgang = await ladeVorgang(nr);
  if (!vorgang) notFound();

  // Every download is recorded first (Plan §11). If the record cannot be written, no file is handed out.
  // Dev preview has no database: the record is skipped there only.
  if (!devVorschauAktiv()) {
    try {
      await schreibeProtokoll({ nutzer: nutzer.email, aktion: 'pdf', vorgang: nr, details: {} });
    } catch {
      return new Response('Der Download konnte nicht protokolliert werden.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
  }

  const ergebnis = await holeOderErzeuge(nr, 'vorgangsblatt', nutzer.email, () => baueVorgangsblatt(vorgang, new Date()));
  if (!ergebnis.ok) return new Response('Das Protokoll konnte nicht gespeichert werden.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  const pdf = ergebnis.bytes;
  return new Response(Buffer.from(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Vorgangsblatt-${nr}.pdf"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
