import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FeatureGate } from '@/components/FeatureGate';
import { aktuellerNutzer } from '@/lib/admin/session';
import { EMAIL_FORMAT, sucheNachEmail, type Treffer } from '@/lib/admin/betroffene';
import { datumDe, statusText } from '@/lib/admin/anzeige';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import { aktuelleSprache } from '@/lib/i18n/server';
import { adminTexte, mit } from '@/lib/i18n/admin';
import { pfadFuer } from '@/lib/i18n/sprache';
import styles from '../admin.module.css';
import AlleLoeschen from './AlleLoeschen';

export const metadata: Metadata = { title: pageTitle('/admin'), robots: { index: false } };

type Props = { searchParams: Promise<{ email?: string }> };

export default async function BetroffenePage({ searchParams }: Props) {
  gatePage('admin');
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  const p = (rest: string) => pfadFuer(lang, rest);
  const nutzer = await aktuellerNutzer();
  if (!nutzer) redirect(p('/admin/login'));
  if (nutzer.rolle !== 'admin') redirect(p('/admin'));

  const { email: roh } = await searchParams;
  const email = (roh ?? '').trim();
  let fehler: string | null = null;
  let treffer: Treffer[] = [];
  if (email) {
    if (!EMAIL_FORMAT.test(email)) fehler = t.betroffene.emailUngueltig;
    else treffer = await sucheNachEmail(email).catch(() => { fehler = t.fehlerAllgemein; return []; });
  }

  return (
    <FeatureGate feature="admin">
      <div className={styles.seite}>
        <p className={styles.linkzeile}><Link href={p('/admin')}>{t.zurUebersicht}</Link></p>
        <header className={styles.topBar}>
          <h1 className={styles.titel}>{t.betroffene.titel}</h1>
        </header>
        <p className={styles.meta}>{t.betroffene.text}</p>

        <section className={styles.karte} aria-labelledby="suche">
          <h2 id="suche">{t.betroffene.suchen}</h2>
          <form method="get" action={p('/admin/betroffene')} className={styles.formular}>
            <label className={styles.feld}>
              {t.betroffene.email}
              <input className={styles.eingabe} type="email" name="email" defaultValue={email} required autoComplete="off" />
            </label>
            <div className={styles.aktionen}>
              <button type="submit" className="btn btn-primary">{t.betroffene.suchen}</button>
            </div>
          </form>
          {fehler && <p role="alert" className={styles.fehlerBox}>{fehler}</p>}
        </section>

        {email && !fehler && (
          <section className={styles.karte} aria-labelledby="treffer">
            <h2 id="treffer">{mit(t.betroffene.treffer, { n: treffer.length })}</h2>
            {treffer.length === 0 ? (
              <p className={styles.meta}>{t.betroffene.keineTreffer}</p>
            ) : (
              <>
                <ul className={styles.schritte}>
                  {treffer.map((x) => (
                    <li key={x.vorgangsnummer}>
                      <Link href={p(`/admin/vorgang/${x.vorgangsnummer}`)}>{x.vorgangsnummer}</Link>
                      {` · ${statusText(x.status, lang)} · ${datumDe(x.angelegt)} · ${x.geraete}`}
                    </li>
                  ))}
                </ul>
                <div className={styles.aktionen} style={{ marginTop: 12 }}>
                  <a className={styles.btnZweit} href={`${p('/admin/betroffene/auskunft')}?email=${encodeURIComponent(email)}`}>{t.betroffene.auskunft}</a>
                </div>
                <div style={{ marginTop: 16 }}>
                  <AlleLoeschen email={email} anzahl={treffer.length} t={t} />
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </FeatureGate>
  );
}
