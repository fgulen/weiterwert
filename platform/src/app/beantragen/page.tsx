import type { Metadata } from 'next';
import { getAppEnv } from '@/lib/env';
import { aktuelleSprache } from '@/lib/i18n/server';
import { gatePage } from '@/lib/page-gate';
import { SEITEN } from '@/lib/i18n/seiten';
import { BeantragenForm } from './BeantragenForm';
import styles from './beantragen.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await aktuelleSprache();
  return { title: SEITEN[lang].beantragen.titel };
}

const MAIL = 'mailto:weiterwert@gmail.com?subject=Ger%C3%A4t%20beantragen';

export default async function BeantragenPage() {
  const { lang } = await aktuelleSprache();
  gatePage('geraetBeantragen');
  // Until the flag is switched to "aktiv" (plan §7), the form is only shown in the test environment.
  const formOffen = getAppEnv() === 'test';
  if (formOffen) return <BeantragenForm sprache={lang} />;
  const t = SEITEN[lang].beantragen;
  return (
    <>
      <h1>{t.titel}</h1>
      <p className="lead">{t.lead}</p>
      <section className={styles.interim} aria-labelledby="interim-titel">
        <h2 id="interim-titel">{t.interimTitel}</h2>
        <p>{t.bisDahin}</p>
        <ul>
          {t.punkte.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <p>{t.bescheid}</p>
        <a className={styles.mailKnopf} href={MAIL}>{t.mailKnopf}</a>
      </section>
    </>
  );
}
