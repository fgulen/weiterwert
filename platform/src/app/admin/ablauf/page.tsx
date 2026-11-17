import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FeatureGate } from '@/components/FeatureGate';
import { ablaufSichtbar } from '@/lib/admin/ablauf-sichtbar';
import { ABLAUF_STAND_GRUPPEN } from '@/lib/admin/ablauf-stand';
import { aktuellerNutzer } from '@/lib/admin/session';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import { aktuelleSprache } from '@/lib/i18n/server';
import { ablaufMit, ablaufTexte } from '@/lib/i18n/ablauf';
import { ERLEDIGT_SCHRITTE, GERAET_PROZESS } from '@/lib/admin/geraet-prozess';
import { pfadFuer } from '@/lib/i18n/sprache';
import styles from '../admin.module.css';

export const metadata: Metadata = { title: pageTitle('/admin'), robots: { index: false } };

export default async function AblaufSeite() {
  gatePage('admin');
  if (!ablaufSichtbar()) notFound();
  const { lang } = await aktuelleSprache();
  const t = ablaufTexte(lang);
  const nutzer = await aktuellerNutzer();
  if (!nutzer) redirect(pfadFuer(lang, '/admin/login'));
  if (nutzer.rolle !== 'admin' && nutzer.rolle !== 'mitarbeiter') redirect(pfadFuer(lang, '/admin'));

  // Andere Nutzer sehen nur die offenen Fragen (Entscheidungen von Fatih).
  const fragen = ABLAUF_STAND_GRUPPEN.filter((g) => g.key === 'offen' || g.key === 'vorlaeufig');
  const anzahl = fragen.reduce((n, g) => n + g.punkte.length, 0);

  return (
    <FeatureGate feature="admin">
      <div className={styles.seite}>
        <p className={styles.linkzeile}><Link href={pfadFuer(lang, '/admin')}>{t.zurVorgaenge}</Link></p>
        <header className={styles.topBar}>
          <h1 className={styles.titel}>{t.seitenTitel}</h1>
        </header>
        <p className={styles.meta}>
          {ablaufMit(t.einleitung, { datum: '2026-11-17' })} {ablaufMit(t.offeneFragen, { n: anzahl })}.
        </p>
        {fragen.map((gruppe) => (
          <section key={gruppe.key} className={styles.karte}>
            <h2>{gruppe.titel[lang === 'tr' ? 'tr' : 'de']}</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
              {gruppe.punkte.map((p) => {
                const text = p.text[lang === 'tr' ? 'tr' : 'de'];
                return (
                  <li key={text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <input type="checkbox" checked={p.done} readOnly aria-label={text} style={{ marginTop: 4, width: 18, height: 18, flex: '0 0 auto' }} />
                    <span>{text}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <h2 style={{ marginTop: 28 }}>{t.prozessTitel}</h2>
        {GERAET_PROZESS.map((s) => (
          <section key={s.nr} className={styles.karte}>
            <h3 style={{ margin: '0 0 6px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {s.nr}. {s.titel[lang === 'tr' ? 'tr' : 'de']}
              {ERLEDIGT_SCHRITTE.includes(s.nr) ? (
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e7b4b', border: '1px solid #1e7b4b', borderRadius: 999, padding: '2px 10px' }}>✓ {t.erledigtLabel}</span>
              ) : (
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: 999, padding: '2px 10px' }}>{t.offenLabel}</span>
              )}
            </h3>
            <p className={styles.meta} style={{ margin: '0 0 6px' }}>
              {t.verantwortlich}: {s.wer[lang === 'tr' ? 'tr' : 'de']}
              {s.status.length > 0 && <> · {t.statusLabel}: <code>{s.status.join(', ')}</code></>}
            </p>
            <p style={{ margin: '0 0 6px' }}>{s.text[lang === 'tr' ? 'tr' : 'de']}</p>
            {s.offen.length > 0 && (
              <p className={styles.meta} style={{ margin: 0 }}>
                {t.offenLabel}: {s.offen.map((n) => `${t.punkt} ${n}`).join(', ')}
              </p>
            )}
          </section>
        ))}
      </div>
    </FeatureGate>
  );
}
