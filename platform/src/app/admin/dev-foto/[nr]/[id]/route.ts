import { aktuellerNutzer } from '@/lib/admin/session';
import { devFoto, devVorschauAktiv } from '@/lib/dev/vorschau';

/** Dev preview only: one stored photo, for a signed-in admin. Everything else answers 404. */
export async function GET(_req: Request, { params }: { params: Promise<{ nr: string; id: string }> }) {
  const { nr, id } = await params;
  if (!devVorschauAktiv() || !(await aktuellerNutzer())) return new Response(null, { status: 404 });
  const foto = devFoto(nr, id);
  if (!foto) return new Response(null, { status: 404 });
  return new Response(Buffer.from(foto.daten), {
    headers: { 'Content-Type': foto.typ === 'png' ? 'image/png' : 'image/jpeg', 'Cache-Control': 'private, no-store' },
  });
}
