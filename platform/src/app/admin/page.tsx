import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FeatureGate } from '@/components/FeatureGate';
import { aktuellerNutzer } from '@/lib/admin/session';
import { ladeSpendenListe } from '@/lib/admin/daten';
import { datumDe, geraeteName, statusKlasse, statusText } from '@/lib/admin/anzeige';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import { aktuelleSprache } from '@/lib/i18n/server';
import { adminTexte, mit } from '@/lib/i18n/admin';
import { pfadFuer } from '@/lib/i18n/sprache';
import { abmelden } from './actions';
import styles from './admin.module.css';

const TITLE = pageTitle('/admin');
export const metadata: Metadata = { title: TITLE, robots: { index: false } };

export default async function AdminPage() {
  gatePage('admin');
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  const p = (rest: string) => pfadFuer(lang, rest);
  const nutzer = await aktuellerNutzer();
  if (!nutzer) redirect(p('/admin/login'));
  const zeilen = await ladeSpendenListe();
  const rolle = nutzer.rolle === 'admin' ? t.rolleAdmin : t.rolleMitarbeiter;

  return (
    <FeatureGate feature="admin">
      <div className={styles.seite}>
        <header className={styles.topBar}>
          <h1 className={styles.titel}>{t.verwaltung}</h1>
          <div className={styles.nutzer}>
            <span>{mit(t.nutzerZeile, { email: nutzer.email, rolle })}</span>
            {nutzer.rolle === 'admin' && <Link href={p('/admin/betroffene')}>{t.betroffene.titel}</Link>}
            <Link href={p('/admin/profil')}>{t.profil}</Link>
            <form action={abmelden}>
              <button type="submit" className={styles.btnZweit}>{t.abmelden}</button>
            </form>
          </div>
        </header>

        <section aria-labelledby="eingaenge">
          <h2 id="eingaenge">{t.liste.eingegangene} ({zeilen.length})</h2>
          {zeilen.length === 0 ? (
            <p className={styles.leer}>{t.liste.keineEingaenge}</p>
          ) : (
            <table className={styles.tabelle}>
              <thead>
                <tr>
                  <th scope="col">{t.liste.spalteVorgang}</th>
                  <th scope="col">{t.liste.spalteStatus}</th>
                  <th scope="col">{t.liste.spalteEingang}</th>
                  <th scope="col">{t.liste.spalteGeraete}</th>
                  <th scope="col">{t.liste.spalteFotos}</th>
                  <th scope="col"><span className={styles.nurLesen}>{t.aktionSpalte}</span></th>
                </tr>
              </thead>
              <tbody>
                {zeilen.map((z) => (
                  <tr key={z.vorgangsnummer} className={styles.zeile}>
                    <td>
                      <Link className={`${styles.zelle} ${styles.ganzeZeile}`} href={p(`/admin/vorgang/${z.vorgangsnummer}`)}>
                        {z.vorgangsnummer}
                      </Link>
                    </td>
                    <td>
                      <span className={`${styles.pill} ${styles[`pill-${statusKlasse(z.status)}`]}`}>{statusText(z.status, lang)}</span>
                    </td>
                    <td>{datumDe(z.angelegt)}</td>
                    <td className={styles.geraeteText}>
                      {z.geraete.length === 0 ? '–' : z.geraete.map((g) => geraeteName(g, lang)).join(', ')}
                    </td>
                    <td className={styles.zahl}>{z.fotos}</td>
                    <td>
                      <Link className={styles.oeffnen} href={p(`/admin/vorgang/${z.vorgangsnummer}`)}>{t.liste.oeffnen}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </FeatureGate>
  );
}
