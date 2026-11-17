import { notFound } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/admin/session';
import { ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { baueAnnahmeFormular } from '@/lib/admin/annahme-formular';
import { schreibeProtokoll } from '@/lib/admin/protokoll';
import { holeLetzteVersion, holeOderErzeuge } from '@/lib/admin/protokoll-pdf';
import { gatePage } from '@/lib/page-gate';
import { devVorschauAktiv } from '@/lib/dev/vorschau';
import { ablaufSichtbar } from '@/lib/admin/ablauf-sichtbar';

type Kontext = { params: Promise<{ nr: string }> };

/** Geräteannahmeprotokoll (Vorlage 18) als PDF. Admins und Mitarbeiter; jeder Download wird protokolliert. */
export async function GET(_req: Request, { params }: Kontext) {
  gatePage('admin');
  if (!ablaufSichtbar()) notFound();
  const { nr } = await params;
  if (!VORGANGSNUMMER.test(nr)) notFound();

  const nutzer = await aktuellerNutzer();
  if (!nutzer) return new Response('Nicht angemeldet.', { status: 401, headers: { 'Cache-Control': 'no-store' } });

  const vorgang = await ladeVorgang(nr);
  if (!vorgang) notFound();

  if (!devVorschauAktiv()) {
    try {
      await schreibeProtokoll({ nutzer: nutzer.email, aktion: 'annahme-pdf', vorgang: nr, details: {} });
    } catch {
      return new Response('Der Download konnte nicht protokolliert werden.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
  }

  // Zuerst das gespeicherte digitale Protokoll. Gibt es keines, das leere Formular nach Vorlage 18 zum Ausdrucken.
  const gespeichert = await holeLetzteVersion(nr, 'annahme-digital');
  let bytes: Uint8Array;
  if (gespeichert) {
    bytes = gespeichert;
  } else {
    const ergebnis = await holeOderErzeuge(nr, 'annahme-formular', nutzer.email, () => baueAnnahmeFormular(vorgang, new Date()));
    if (!ergebnis.ok) return new Response('Das Protokoll konnte nicht gespeichert werden.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    bytes = ergebnis.bytes;
  }

  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Geraeteannahme-${nr}.pdf"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
