import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FeatureGate } from '@/components/FeatureGate';
import { aktuellerNutzer } from '@/lib/admin/session';
import { ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { geraeteName } from '@/lib/admin/anzeige';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import { aktuelleSprache } from '@/lib/i18n/server';
import { adminTexte, mit } from '@/lib/i18n/admin';
import { pfadFuer } from '@/lib/i18n/sprache';
import styles from '../../../admin.module.css';
import AkteFormular from './AkteFormular';

export const metadata: Metadata = { title: pageTitle('/admin'), robots: { index: false } };

type Props = { params: Promise<{ nr: string }> };

export default async function AktePage({ params }: Props) {
  gatePage('admin');
  const { nr } = await params;
  if (!VORGANGSNUMMER.test(nr)) notFound();
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  const p = (rest: string) => pfadFuer(lang, rest);
  const nutzer = await aktuellerNutzer();
  if (!nutzer) redirect(p('/admin/login'));
  const v = await ladeVorgang(nr);
  if (!v) notFound();
  const darfAendern = nutzer.rolle === 'admin' || nutzer.rolle === 'mitarbeiter';

  return (
    <FeatureGate feature="admin">
      <div className={styles.seite}>
        <p className={styles.linkzeile}><Link href={p(`/admin/vorgang/${v.vorgangsnummer}`)}>{t.zurUebersicht}</Link></p>
        <header className={styles.topBar}>
          <div>
            <h1 className={styles.titel}>{t.akte.titel}</h1>
            <p className={styles.meta} style={{ margin: '6px 0 0' }}>{v.vorgangsnummer}</p>
          </div>
        </header>
        <p className={styles.meta}>{t.akte.text}</p>
        {!darfAendern && <p role="note" className={styles.fehlerBox}>{t.akte.nurLesen}</p>}
        {v.geraete.length === 0 && <p className={styles.leer}>{t.akte.keinGeraet}</p>}
        {v.geraete.map((g) => (
          <section key={g.position} className={`${styles.karte}`} aria-labelledby={`akte-${g.position}`}>
            <h2 id={`akte-${g.position}`}>{mit(t.akte.geraetAria, { n: g.position })}: {geraeteName(g, lang)}</h2>
            {darfAendern ? (
              <AkteFormular nummer={v.vorgangsnummer} position={g.position} akte={g.akte} t={t} />
            ) : (
              <dl className={styles.angaben}>
                <dt>{t.akte.seriennummer}</dt><dd>{g.akte.seriennummer ?? '–'}</dd>
                <dt>{t.akte.lagerort}</dt><dd>{g.akte.lagerort ?? '–'}</dd>
                <dt>{t.akte.zustand}</dt><dd>{g.akte.zustand ?? '–'}</dd>
                <dt>{t.akte.loeschverfahren}</dt><dd>{g.akte.loeschverfahren ?? '–'}</dd>
                <dt>{t.akte.loeschdatum}</dt><dd>{g.akte.loeschdatum ?? '–'}</dd>
                <dt>{t.akte.entsorgungsweg}</dt><dd>{g.akte.entsorgungsweg ?? '–'}</dd>
                <dt>{t.akte.nachweisnummer}</dt><dd>{g.akte.nachweisnummer ?? '–'}</dd>
              </dl>
            )}
          </section>
        ))}
      </div>
    </FeatureGate>
  );
}
