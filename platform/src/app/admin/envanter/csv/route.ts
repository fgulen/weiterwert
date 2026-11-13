import { aktuellerNutzer } from '@/lib/admin/session';
import { ladeAlleVorgaenge } from '@/lib/admin/daten';
import { envanterCsv } from '@/lib/admin/belege';
import { schreibeProtokoll } from '@/lib/admin/protokoll';
import { devVorschauAktiv } from '@/lib/dev/vorschau';
import { gatePage } from '@/lib/page-gate';

/** Inventory as a CSV download. Administrators and staff; each download is recorded. */
export async function GET() {
  gatePage('admin');
  const nutzer = await aktuellerNutzer();
  if (!nutzer || (nutzer.rolle !== 'admin' && nutzer.rolle !== 'mitarbeiter')) {
    return new Response('Nicht berechtigt.', { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  if (!devVorschauAktiv()) {
    try {
      await schreibeProtokoll({ nutzer: nutzer.email, aktion: 'envanter-csv', vorgang: '-', details: {} });
    } catch {
      return new Response('Der Download konnte nicht protokolliert werden.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
  }
  const csv = envanterCsv(await ladeAlleVorgaenge());
  const datum = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="Envanter-${datum}.csv"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
