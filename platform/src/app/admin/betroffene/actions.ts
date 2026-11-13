'use server';

import { revalidatePath } from 'next/cache';
import { aktuellerNutzer } from '@/lib/admin/session';
import { EMAIL_FORMAT, sucheNachEmail } from '@/lib/admin/betroffene';
import { loescheVorgang } from '@/lib/admin/loeschen';
import { aktuelleSprache } from '@/lib/i18n/server';
import { adminTexte, mit } from '@/lib/i18n/admin';

export type LoeschAlleErgebnis = { ok?: string; fehler?: string };

/** Art. 17 for one e-mail address: every request of that person is deleted, one after the other. Admins only. */
export async function alleLoeschen(email: string): Promise<LoeschAlleErgebnis> {
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  const nutzer = await aktuellerNutzer();
  if (!nutzer || nutzer.rolle !== 'admin') return { fehler: t.detail.loeschenNurAdmin };
  const adresse = email.trim();
  if (!EMAIL_FORMAT.test(adresse)) return { fehler: t.betroffene.emailUngueltig };

  const treffer = await sucheNachEmail(adresse);
  let geloescht = 0;
  for (const x of treffer) {
    const r = await loescheVorgang(x.vorgangsnummer, nutzer.email, t);
    if (r.fehler) {
      revalidatePath('/admin');
      return { fehler: mit(t.betroffene.teilweise, { n: geloescht }) };
    }
    geloescht++;
  }
  revalidatePath('/admin');
  return { ok: mit(t.betroffene.geloescht, { n: geloescht }) };
}
