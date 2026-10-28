import type { Metadata } from 'next';
import { KRITERIEN_VERSION } from '@/lib/annahmekriterien';
import { KRITERIEN_TEXTE } from '@/lib/i18n/kriterien';
import { aktuelleSprache } from '@/lib/i18n/server';
import { SEITEN } from '@/lib/i18n/seiten';
import styles from './kriterien.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await aktuelleSprache();
  return { title: SEITEN[lang].annahme.titel };
}

export default async function AnnahmekriterienPage() {
  const { lang } = await aktuelleSprache();
  const t = SEITEN[lang].annahme;
  const k = KRITERIEN_TEXTE[lang];
  return (
    <>
      <h1>{t.titel}</h1>
      <p><span className={styles.version}>{t.entwurf} {KRITERIEN_VERSION}</span></p>
      <p className="lead">{t.lead}</p>
      <h2>{t.fuerAlle}</h2>
      <ul>{k.fuerAlle.map((x) => <li key={x}>{x}</li>)}</ul>
      {k.tabellen.map((tab) => (
        <section key={tab.geraet}>
          <h2>{tab.geraet}</h2>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">{t.kriterium}</th>
                  <th scope="col">{t.geeignet}</th>
                  <th scope="col">{t.pruefung}</th>
                  <th scope="col">{t.nichtGeeignet}</th>
                </tr>
              </thead>
              <tbody>
                {tab.zeilen.map((z) => (
                  <tr key={z.kriterium}>
                    <th scope="row">{z.kriterium}</th>
                    <td>{z.geeignet}</td>
                    <td>{z.pruefung}</td>
                    <td>{z.nichtGeeignet ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
