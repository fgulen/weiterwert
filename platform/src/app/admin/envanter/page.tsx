import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FeatureGate } from '@/components/FeatureGate';
import { aktuellerNutzer } from '@/lib/admin/session';
import { ladeAlleVorgaenge } from '@/lib/admin/daten';
import { geraeteName } from '@/lib/admin/anzeige';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import { aktuelleSprache } from '@/lib/i18n/server';
import { adminTexte } from '@/lib/i18n/admin';
import { pfadFuer } from '@/lib/i18n/sprache';
import styles from '../admin.module.css';

export const metadata: Metadata = { title: pageTitle('/admin'), robots: { index: false } };

export default async function EnvanterSeite() {
  gatePage('admin');
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  const p = (rest: string) => pfadFuer(lang, rest);
  const nutzer = await aktuellerNutzer();
  if (!nutzer) redirect(p('/admin/login'));
  if (nutzer.rolle !== 'admin' && nutzer.rolle !== 'mitarbeiter') redirect(p('/admin'));
  const vorgaenge = await ladeAlleVorgaenge();
  const zeilen = vorgaenge.flatMap((v) => v.geraete.map((g) => ({ v, g })));

  return (
    <FeatureGate feature="admin">
      <div className={styles.seite}>
        <p className={styles.linkzeile}><Link href={p('/admin')}>{t.zurUebersicht}</Link></p>
        <header className={styles.topBar}>
          <h1 className={styles.titel}>{t.akte.envanter}</h1>
          <div className={styles.aktionen}>
            <a className={styles.btnZweit} href={`${p('/admin/envanter/csv')}`} download>{t.akte.envanterCsv}</a>
          </div>
        </header>
        <p className={styles.meta}>{t.akte.envanterText}</p>
        {zeilen.length === 0 ? (
          <p className={styles.leer}>{t.akte.leer}</p>
        ) : (
          <table className={styles.tabelle}>
            <thead>
              <tr>
                <th scope="col">{t.liste.spalteVorgang}</th>
                <th scope="col">{t.akte.seriennummer}</th>
                <th scope="col">{t.akte.zustand}</th>
                <th scope="col">{t.akte.lagerort}</th>
                <th scope="col">{t.akte.loeschverfahren}</th>
              </tr>
            </thead>
            <tbody>
              {zeilen.map(({ v, g }) => (
                <tr key={`${v.vorgangsnummer}-${g.position}`}>
                  <td><Link href={p(`/admin/vorgang/${v.vorgangsnummer}`)}>{v.vorgangsnummer}</Link> · {geraeteName(g, lang)}</td>
                  <td>{g.akte.seriennummer ?? '–'}</td>
                  <td>{g.akte.zustand ?? '–'}</td>
                  <td>{g.akte.lagerort ?? '–'}</td>
                  <td>{g.akte.loeschverfahren ?? '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </FeatureGate>
  );
}
