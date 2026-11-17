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

const GRUEN = '#1e4d2b';

const TEXTE: Record<Sprache, {
  titel: string;
  einordnung: string;
  schritteTitel: string;
  rolle: string;
  schritte: { t: string; r: string; z: string[] }[];
  abzweigeTitel: string;
  abzweige: { t: string; z: string[] }[];
  legendeTitel: string;
  legende: string[];
  offenTitel: string;
}> = {
  de: {
    titel: 'So läuft ein Vorgang im Admin',
    einordnung: 'Ein Vorgang kann mehrere Geräte haben. Jedes Gerät läuft einzeln durch die Schritte. Der Vorgang wird abgeschlossen, wenn alle Geräte am Ende sind.',
    schritteTitel: 'Hauptweg (Schritte 1 bis 7)',
    rolle: 'Wer',
    schritte: [
      { t: 'Eingang', r: 'Technik, Admin', z: ['Gerät erfasst'] },
      { t: 'Zweite Kontrolle', r: 'Admin', z: ['Löschung oder Quarantäne'] },
      { t: 'Annahme', r: 'Mitarbeiter, Admin', z: ['Protokoll mit Unterschrift'] },
      { t: 'Löschung', r: 'Technik, Admin', z: ['Gerät gelöscht', 'Bei Fehler: zweite Person'] },
      { t: 'Technik', r: 'Technik, Admin', z: ['Prüfung: frei, Reparatur', 'oder Entsorgung'] },
      { t: 'Übergabe', r: 'Mitarbeiter, Technik, Admin', z: ['Gerät übergeben', '(Übergabe-Protokoll)'] },
      { t: 'Abschluss', r: 'Admin', z: ['Vorgang abschließen', '(wenn alle Geräte fertig)'] },
    ],
    abzweigeTitel: 'Abzweige (Sonderfälle)',
    abzweige: [
      { t: 'Quarantäne', z: ['Nach Zweiter Kontrolle', 'führt zu Löschung oder Rückgabe'] },
      { t: 'Reparatur', z: ['Aus der Technik-Prüfung', 'zurück zur Technik-Prüfung'] },
      { t: 'Rückgabe', z: ['Endstatus: Gerät geht zurück an den Spender'] },
      { t: 'Entsorgung', z: ['Endstatus: Gerät wird entsorgt'] },
      { t: 'Löschung fehlgeschlagen', z: ['Zweite Person entscheidet', '(Ausnahme oder Vernichtung)'] },
    ],
    legendeTitel: 'Begriffe',
    legende: [
      'Schritt 1 bis 7: Hauptweg eines Vorgangs (Schrittleiste im Admin).',
      'Punkt 1 bis 24: offene Fragen. Einwände bitte mit dieser Punktnummer melden.',
      'Dok. 07, 18, 20, 28: Nummern der Vorlagen und Richtlinien.',
      'Rollen: Admin (alles), Technik (Eingang, Löschung, Technik, Übergabe), Mitarbeiter (Annahme, Übergabe).',
    ],
    offenTitel: 'Offene Punkte mit Nummer',
  },
  tr: {
    titel: 'Yönetim panelinde bir başvuru böyle ilerler',
    einordnung: 'Bir başvuruda birden çok cihaz olabilir. Her cihaz adımlardan ayrı ayrı geçer. Tüm cihazlar son durumda olduğunda başvuru kapanır.',
    schritteTitel: 'Ana yol (adım 1 - 7)',
    rolle: 'Kim',
    schritte: [
      { t: 'Giriş', r: 'Teknik, Admin', z: ['Cihaz kaydedildi'] },
      { t: 'İkinci kontrol', r: 'Admin', z: ['Silme veya karantina'] },
      { t: 'Kabul', r: 'Çalışan, Admin', z: ['İmzalı protokol'] },
      { t: 'Silme', r: 'Teknik, Admin', z: ['Cihaz silindi', 'Hatada: ikinci kişi'] },
      { t: 'Teknik', r: 'Teknik, Admin', z: ['Kontrol: serbest, onarım', 'veya imha'] },
      { t: 'Teslim', r: 'Çalışan, Teknik, Admin', z: ['Cihaz teslim edildi', '(Teslim protokolü)'] },
      { t: 'Kapanış', r: 'Admin', z: ['Başvuruyu kapat', '(tüm cihazlar hazırsa)'] },
    ],
    abzweigeTitel: 'Dallanmalar (özel durumlar)',
    abzweige: [
      { t: 'Karantina', z: ['İkinci kontrolden sonra', 'silme veya iade’ye gider'] },
      { t: 'Onarım', z: ['Teknik kontrolden', 'teknik kontrole geri döner'] },
      { t: 'İade', z: ['Son durum: cihaz bağışçıya döner'] },
      { t: 'İmha', z: ['Son durum: cihaz imha edilir'] },
      { t: 'Silme başarısız', z: ['İkinci kişi karar verir', '(istisna veya imha)'] },
    ],
    legendeTitel: 'Terimler',
    legende: [
      'Adım 1 - 7: başvurunun ana yolu (yönetim panelindeki adım çubuğu).',
      'Madde 1 - 24: açık sorular. İtirazları bu madde numarasıyla bildirin.',
      'Dok. 07, 18, 20, 28: şablon ve yönerge numaraları.',
      'Roller: Admin (her şey), Teknik (Giriş, Silme, Teknik, Teslim), Çalışan (Kabul, Teslim).',
    ],
    offenTitel: 'Numaralı açık maddeler',
  },
};

function Kasten({ nr, titel, zeilen, gestrichelt }: { nr?: number; titel: string; zeilen: string[]; gestrichelt?: boolean }) {
  return (
    <div style={{ border: `2px ${gestrichelt ? 'dashed' : 'solid'} ${GRUEN}`, borderRadius: 12, padding: '12px 14px', background: gestrichelt ? '#fff' : '#f4f8f5', height: '100%' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {nr !== undefined && (
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: GRUEN, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flex: '0 0 auto' }}>{nr}</span>
        )}
        <strong>{titel}</strong>
      </div>
      <div style={{ marginTop: 8, display: 'grid', gap: 2, fontSize: '0.92rem' }}>
        {zeilen.map((z) => <span key={z}>{z}</span>)}
      </div>
    </div>
  );
}

export default async function AblaufSeite() {
  gatePage('admin');
  if (!ablaufSichtbar()) notFound();
  const { lang } = await aktuelleSprache();
  const t = ablaufTexte(lang);
  const k: Sprache = lang === 'tr' ? 'tr' : 'de';
  const x = TEXTE[k];
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
          <h2 id="schema-titel">{x.titel}</h2>
          <p className={styles.meta}>{x.einordnung}</p>

          <h3 style={{ marginTop: 16 }}>{x.schritteTitel}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {x.schritte.map((s, i) => (
              <Kasten key={s.t} nr={i + 1} titel={s.t} zeilen={[`${x.rolle}: ${s.r}`, ...s.z]} />
            ))}
          </div>

          <h3 style={{ marginTop: 20 }}>{x.abzweigeTitel}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {x.abzweige.map((a) => (
              <Kasten key={a.t} titel={a.t} zeilen={a.z} gestrichelt />
            ))}
          </div>

          <h3 style={{ marginTop: 20 }}>{x.legendeTitel}</h3>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4, fontSize: '0.92rem' }}>
            {x.legende.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </section>

        {ABLAUF_STAND_GRUPPEN.map((gruppe) => (
          <section key={gruppe.key} className={styles.karte}>
            <h2>{gruppe.titel[k]}</h2>
            {gruppe.key !== 'umgesetzt' && <p className={styles.meta}>{x.offenTitel}</p>}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
              {gruppe.punkte.map((p) => {
                const text = p.text[k];
                return (
                  <li key={text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    {p.nr !== undefined ? (
                      <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 700, color: GRUEN, border: `1px solid ${GRUEN}`, borderRadius: 999, padding: '1px 6px', flex: '0 0 auto' }}>{p.nr}</span>
                    ) : (
                      <input type="checkbox" checked={p.done} readOnly aria-label={text} style={{ marginTop: 4, width: 18, height: 18, flex: '0 0 auto' }} />
                    )}
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
