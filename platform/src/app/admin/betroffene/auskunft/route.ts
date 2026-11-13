import { aktuellerNutzer } from '@/lib/admin/session';
import { auskunftFuer, EMAIL_FORMAT } from '@/lib/admin/betroffene';

/** Art. 15 export for one e-mail address as a JSON file. Administrators only; never cached. */
export async function GET(req: Request) {
  const nutzer = await aktuellerNutzer();
  if (!nutzer || nutzer.rolle !== 'admin') return new Response('Nicht berechtigt.', { status: 403, headers: { 'Cache-Control': 'no-store' } });
  const email = (new URL(req.url).searchParams.get('email') ?? '').trim();
  if (!EMAIL_FORMAT.test(email)) return new Response('Ungültige E-Mail-Adresse.', { status: 400, headers: { 'Cache-Control': 'no-store' } });
  try {
    const daten = await auskunftFuer(email, nutzer.email, 'auskunft');
    const datei = `Auskunft-${new Date().toISOString().slice(0, 10)}.json`;
    return new Response(JSON.stringify(daten, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${datei}"`,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Die Auskunft konnte nicht erstellt werden. Es wurden keine Daten herausgegeben.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
