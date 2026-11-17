import { notFound } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/admin/session';
import { ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { baueUebergabeFormular } from '@/lib/admin/uebergabe-formular';
import { schreibeProtokoll } from '@/lib/admin/protokoll';
import { gatePage } from '@/lib/page-gate';
import { holeOderErzeuge } from '@/lib/admin/protokoll-pdf';
import { devVorschauAktiv } from '@/lib/dev/vorschau';

type Kontext = { params: Promise<{ nr: string }> };

/** Handover protocol as a PDF download. Administrators and staff; every download is recorded. */
export async function GET(_req: Request, { params }: Kontext) {
  gatePage('admin');
  const { nr } = await params;
  if (!VORGANGSNUMMER.test(nr)) notFound();

  const nutzer = await aktuellerNutzer();
  if (!nutzer) return new Response('Nicht angemeldet.', { status: 401, headers: { 'Cache-Control': 'no-store' } });

  const vorgang = await ladeVorgang(nr);
  if (!vorgang) notFound();

  if (!devVorschauAktiv()) {
    try {
      await schreibeProtokoll({ nutzer: nutzer.email, aktion: 'uebergabe-pdf', vorgang: nr, details: {} });
    } catch {
      return new Response('Der Download konnte nicht protokolliert werden.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
  }

  const ergebnis = await holeOderErzeuge(nr, 'uebergabe-formular', nutzer.email, () => baueUebergabeFormular(vorgang, new Date()));
  if (!ergebnis.ok) return new Response('Das Protokoll konnte nicht gespeichert werden.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  const pdf = ergebnis.bytes;
  return new Response(Buffer.from(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Uebergabeprotokoll-${nr}.pdf"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
