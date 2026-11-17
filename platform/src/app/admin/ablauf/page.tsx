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
  bild: { t: string; r: string; z: string[] }[];
  bildTitel: string;
}> = {
  de: {
    titel: 'So läuft ein Vorgang im Admin',
    bild: [
      { t: 'Eingang', r: 'Technik, Admin', z: ['Gerät erfasst'] },
      { t: 'Zweite Kontrolle', r: 'Admin', z: ['Löschung oder Quarantäne'] },
      { t: 'Annahme', r: 'Mitarbeiter, Admin', z: ['Protokoll mit Unterschrift'] },
      { t: 'Löschung', r: 'Technik, Admin', z: ['Gerät gelöscht', 'Fehler: zweite Person'] },
      { t: 'Technik', r: 'Technik, Admin', z: ['Prüfung: frei, Reparatur', 'oder Entsorgung'] },
      { t: 'Übergabe', r: 'Mitarbeiter, Technik, Admin', z: ['Gerät übergeben'] },
      { t: 'Abschluss', r: 'Admin', z: ['Vorgang abgeschlossen'] },
    ],
    bildTitel: 'Ablauf auf einen Blick',
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
    bild: [
      { t: 'Giriş', r: 'Teknik, Admin', z: ['Cihaz kaydedildi'] },
      { t: 'İkinci kontrol', r: 'Admin', z: ['Silme veya karantina'] },
      { t: 'Kabul', r: 'Çalışan, Admin', z: ['Protokol ve imza'] },
      { t: 'Silme', r: 'Teknik, Admin', z: ['Cihaz silindi', 'Hata: ikinci kişi'] },
      { t: 'Teknik', r: 'Teknik, Admin', z: ['Kontrol: serbest, onarım', 'veya imha'] },
      { t: 'Teslim', r: 'Çalışan, Teknik, Admin', z: ['Cihaz teslim edildi'] },
      { t: 'Kapanış', r: 'Admin', z: ['Başvuru kapatıldı'] },
    ],
    bildTitel: 'Akış bir bakışta',
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


// Ablaufdiagramm: 7 Kästen in zwei Reihen (1-4 oben, 5-7 unten, rückwärts), mit Pfeilen.
function Flussbild({ bild, titel }: { bild: { t: string; r: string; z: string[] }[]; titel: string }) {
  const pos = [[20, 40], [280, 40], [540, 40], [800, 40], [800, 230], [540, 230], [280, 230]];
  const B = 220, H = 150;
  return (
    <svg viewBox="0 0 1040 420" role="img" aria-label={titel} style={{ width: '100%', height: 'auto', maxWidth: 1040, display: 'block' }}>
      <defs>
        <marker id="pfeil" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#1e4d2b" />
        </marker>
      </defs>
      {bild.map((b, i) => {
        const [x, y] = pos[i];
        return (
          <g key={b.t}>
            <rect x={x} y={y} width={B} height={H} rx={12} fill="#f4f8f5" stroke="#1e4d2b" strokeWidth={2} />
            <circle cx={x + 26} cy={y + 26} r={16} fill="#1e4d2b" />
            <text x={x + 26} y={y + 32} textAnchor="middle" fontSize={16} fontWeight={700} fill="#fff">{i + 1}</text>
            <text x={x + 52} y={y + 32} fontSize={17} fontWeight={700} fill="#1b1b1b">{b.t}</text>
            <text x={x + 14} y={y + 66} fontSize={13} fill="#555">{b.r}</text>
            {b.z.map((zeile, j) => (
              <text key={zeile} x={x + 14} y={y + 96 + j * 20} fontSize={14} fill="#1b1b1b">{zeile}</text>
            ))}
          </g>
        );
      })}
      <line x1={240} y1={115} x2={278} y2={115} stroke="#1e4d2b" strokeWidth={2.5} markerEnd="url(#pfeil)" />
      <line x1={500} y1={115} x2={538} y2={115} stroke="#1e4d2b" strokeWidth={2.5} markerEnd="url(#pfeil)" />
      <line x1={760} y1={115} x2={798} y2={115} stroke="#1e4d2b" strokeWidth={2.5} markerEnd="url(#pfeil)" />
      <line x1={910} y1={190} x2={910} y2={228} stroke="#1e4d2b" strokeWidth={2.5} markerEnd="url(#pfeil)" />
      <line x1={800} y1={305} x2={762} y2={305} stroke="#1e4d2b" strokeWidth={2.5} markerEnd="url(#pfeil)" />
      <line x1={540} y1={305} x2={502} y2={305} stroke="#1e4d2b" strokeWidth={2.5} markerEnd="url(#pfeil)" />
    </svg>
  );
}

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
          <div style={{ margin: '12px 0' }}>
            <Flussbild bild={s.bild} titel={s.bildTitel} />
          </div>
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
