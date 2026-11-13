import 'server-only';
import { devEntfernen, devEintrag, devVorschauAktiv } from '@/lib/dev/vorschau';
import { datenbankKonfiguriert, dbKopfzeilen } from './db';
import { ladeVorgang } from './vorgang';
import { schreibeProtokoll } from './protokoll';
import { ladeFotos, loescheFoto } from '@/lib/fotos/speicher';
import type { AdminTexte } from '@/lib/i18n/admin';

export type LoeschFehler = { fehler?: string };

/**
 * Deletes one request with its photos and contact. Shared by the single-case delete and the
 * right-to-erasure page. The audit row is written first; photo files go before the rows.
 * `t` supplies the message language.
 */
export async function loescheVorgang(nummer: string, nutzerEmail: string, t: AdminTexte): Promise<LoeschFehler> {
  if (devVorschauAktiv()) {
    const e = devEintrag(nummer);
    if (!e) return { fehler: t.detail.vorgangNichtGefunden };
    devEntfernen(nummer);
    return {};
  }

  const v = await ladeVorgang(nummer);
  if (!v) return { fehler: t.detail.vorgangNichtGefunden };
  const db = datenbankKonfiguriert();
  if (!db) return { fehler: t.loeschenNichtVerfuegbar };

  const fotos = await ladeFotos(v.id).catch(() => null);
  if (fotos === null) return { fehler: t.detail.loeschenFotosLesen };
  try {
    await schreibeProtokoll({ nutzer: nutzerEmail, aktion: 'vorgang-geloescht', vorgang: nummer, details: { fotos: fotos.length } });
  } catch {
    return { fehler: t.detail.loeschenProtokoll };
  }
  for (const f of fotos) {
    try {
      await loescheFoto({ id: f.id, pfad: f.pfad, requestId: v.id, nutzer: nutzerEmail, vorgang: nummer });
    } catch {
      return { fehler: t.detail.loeschenFoto };
    }
  }
  const res = await fetch(`${db.url}/rest/v1/donation_request?vorgangsnummer=eq.${nummer}`, {
    method: 'DELETE',
    headers: dbKopfzeilen(db.key),
    cache: 'no-store',
  });
  if (!res.ok) return { fehler: t.detail.loeschenDb };
  // The contact row is the parent of the request: remove it too, so no personal data stays behind.
  const kontakt = await fetch(`${db.url}/rest/v1/contact?id=eq.${v.kontaktId}`, {
    method: 'DELETE',
    headers: dbKopfzeilen(db.key),
    cache: 'no-store',
  });
  if (!kontakt.ok) return { fehler: t.detail.loeschenDb };
  return {};
}
