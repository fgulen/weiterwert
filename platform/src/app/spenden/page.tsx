import type { Metadata } from 'next';
import { FeatureGate } from '@/components/FeatureGate';
import { StatusBadge } from '@/components/StatusBadge';
import { FEATURES, type FeatureKey } from '@/lib/features';
import { aktuelleSprache } from '@/lib/i18n/server';
import { SEITEN } from '@/lib/i18n/seiten';
import { gatePage, isUsable } from '@/lib/page-gate';
import styles from './spenden.module.css';
import { absendenMoeglich } from '@/lib/absenden/speicher';
import { GeraeteCheck } from './GeraeteCheck';

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await aktuelleSprache();
  return { title: SEITEN[lang].spenden.titel };
}

const UEBERGABE = ['uebergabeAbsprache', 'abholung', 'paketversand', 'sammelstelle'] as const satisfies readonly FeatureKey[];

export default async function SpendenPage() {
  const { lang } = await aktuelleSprache();
  const t = SEITEN[lang];
  gatePage('spenden');
  return (
    <>
      <h1>{t.spenden.titel}</h1>
      <p className="lead">{t.spenden.lead}</p>
      <FeatureGate feature="spenden">
        {absendenMoeglich() ? <GeraeteCheck absenden lang={lang} /> : <GeraeteCheck lang={lang} abschluss={
          <details className={styles.more}>
            <summary>{t.spenden.weiter}</summary>
            <p>{t.spenden.bisDahinVor} <a href="mailto:weiterwert@gmail.com">weiterwert@gmail.com</a>.</p>
            <ol className={styles.steps} aria-label={t.spenden.ablauf}>
              {t.spenden.schritte.map(([titel, text]) => (
                <li key={titel} className={styles.step}>
                  <strong>{titel}</strong>
                  <span>{text}</span>
                </li>
              ))}
            </ol>

            <fieldset className={styles.handover}>
              <legend>{t.spenden.uebergabe}</legend>
              {UEBERGABE.map((key) => {
                const usable = isUsable(key);
                return (
                  <label key={key} className={styles.option}>
                    <input type="radio" name="uebergabe" value={key} disabled={!usable} />
                    <span>{lang === 'de' ? FEATURES[key].label : t.spenden.uebergabeOptionen[key]}</span>
                    {!usable && <StatusBadge kind="demnaechst" lang={lang} />}
                  </label>
                );
              })}
            </fieldset>
          </details>
        } />}
      </FeatureGate>
    </>
  );
}
