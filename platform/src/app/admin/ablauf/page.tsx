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
import { pfadFuer } from '@/lib/i18n/sprache';
import styles from '../admin.module.css';

export const metadata: Metadata = { title: pageTitle('/admin'), robots: { index: false } };

type Sprache = 'de' | 'tr';

// Schema: die sieben Schritte eines Vorgangs, wer sie macht und was mit dem Gerät passiert.
const SCHEMA: Record<Sprache, {
  titel: string; einordnung: string; abzweige: string;
  rolle: string; geraet: string;
  schritte: { name: string; rolle: string; geraet: string }[];
}> = {
  de: {
    titel: 'So läuft ein Vorgang im Admin',
    einordnung: 'Ein Vorgang kann mehrere Geräte haben. Jedes Gerät läuft einzeln durch die Geräte-Schritte. Der Vorgang wird abgeschlossen, wenn alle Geräte am Ende sind.',
    abzweige: 'Abzweige: Quarantäne (führt zu Löschung oder Rückgabe), Reparatur (zurück zur Technik-Prüfung). Endstatus: übergeben, Rückgabe, entsorgt.',
    rolle: 'Wer', geraet: 'Gerätestatus',
    schritte: [
      { name: 'Eingang', rolle: 'Technik, Admin', geraet: 'eingegangen → Gerät erfasst' },
      { name: 'Zweite Kontrolle', rolle: 'Admin', geraet: 'zweite_kontrolle → Löschung oder Quarantäne' },
      { name: 'Annahme', rolle: 'Mitarbeiter, Admin', geraet: 'Annahme-Protokoll (PDF) mit Unterschrift' },
      { name: 'Löschung', rolle: 'Technik, Admin', geraet: 'loeschung_offen → geloescht (bei Fehler: zweite Person)' },
      { name: 'Technik', rolle: 'Technik, Admin', geraet: 'technische_pruefung → reparatur, frei oder entsorgt' },
      { name: 'Übergabe', rolle: 'Mitarbeiter, Technik, Admin', geraet: 'reserviert → uebergeben (Übergabe-Protokoll)' },
      { name: 'Abschluss', rolle: 'Admin', geraet: 'alle Geräte am Ende → "Vorgang abschließen" (protokolliert)' },
    ],
  },
  tr: {
    titel: 'Yönetim panelinde bir başvuru böyle ilerler',
    einordnung: 'Bir başvuruda birden çok cihaz olabilir. Her cihaz cihaz adımlarından ayrı ayrı geçer. Tüm cihazlar son durumda olduğunda başvuru kapanır.',
    abzweige: 'Dallanmalar: Karantina (silme veya iade’ye gider), Onarım (teknik kontrole geri döner). Son durumlar: teslim edildi, iade, imha.',
    rolle: 'Kim', geraet: 'Cihaz durumu',
    schritte: [
      { name: 'Giriş', rolle: 'Teknik, Admin', geraet: 'eingegangen → cihaz kaydedildi' },
      { name: 'İkinci kontrol', rolle: 'Admin', geraet: 'zweite_kontrolle → silme veya karantina' },
      { name: 'Kabul', rolle: 'Çalışan, Admin', geraet: 'Kabul protokolü (PDF), imzalı' },
      { name: 'Silme', rolle: 'Teknik, Admin', geraet: 'loeschung_offen → geloescht (hata olursa ikinci kişi)' },
      { name: 'Teknik', rolle: 'Teknik, Admin', geraet: 'technische_pruefung → reparatur, frei veya entsorgt' },
      { name: 'Teslim', rolle: 'Çalışan, Teknik, Admin', geraet: 'reserviert → uebergeben (Teslim protokolü)' },
      { name: 'Kapanış', rolle: 'Admin', geraet: 'tüm cihazlar son durumda → "Başvuruyu kapat" (kayda geçer)' },
    ],
  },
};

export default async function AblaufSeite() {
  gatePage('admin');
  if (!ablaufSichtbar()) notFound();
  const { lang } = await aktuelleSprache();
  const t = ablaufTexte(lang);
  const k: Sprache = lang === 'tr' ? 'tr' : 'de';
  const s = SCHEMA[k];
  const nutzer = await aktuellerNutzer();
  if (!nutzer) redirect(pfadFuer(lang, '/admin/login'));
  if (nutzer.rolle !== 'admin' && nutzer.rolle !== 'mitarbeiter') redirect(pfadFuer(lang, '/admin'));

  const offen = ABLAUF_STAND_GRUPPEN.filter((g) => g.key !== 'umgesetzt');
  const anzahl = offen.reduce((n, g) => n + g.punkte.filter((p) => !p.done).length, 0);

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

        <section className={styles.karte} aria-labelledby="schema-titel">
          <h2 id="schema-titel">{s.titel}</h2>
          <p className={styles.meta}>{s.einordnung}</p>
          <ol style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
            {s.schritte.map((st, i) => (
              <li key={st.name} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px' }}>
                <strong>{i + 1}. {st.name}</strong>
                <div className={styles.meta} style={{ margin: '4px 0' }}>{s.rolle}: {st.rolle}</div>
                <div style={{ fontSize: '0.9rem' }}><span className={styles.meta}>{s.geraet}:</span> <code>{st.geraet}</code></div>
              </li>
            ))}
          </ol>
          <p className={styles.meta} style={{ marginTop: 10 }}>{s.abzweige}</p>
        </section>

        {ABLAUF_STAND_GRUPPEN.map((gruppe) => (
          <section key={gruppe.key} className={styles.karte}>
            <h2>{gruppe.titel[k]}</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
              {gruppe.punkte.map((p) => {
                const text = p.text[k];
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
      </div>
    </FeatureGate>
  );
}
