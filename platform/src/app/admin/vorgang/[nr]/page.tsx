import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FeatureGate } from '@/components/FeatureGate';
import { aktuellerNutzer } from '@/lib/admin/session';
import { angabeLabel, angabeText, ANGABE_REIHENFOLGE, ergebnisKurz, type GeraetDaten, ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { datumDe, datumZeitDe, geraetTitel, grundText, statusKlasse, statusText } from '@/lib/admin/anzeige';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import { ladeProtokoll, schreibeProtokoll, type ProtokollEintrag } from '@/lib/admin/protokoll';
import { naechsteStatus } from '@/lib/admin/status';
import { FOTO_LOESCHFRIST_TAGE, ladeFotos, signierterLink } from '@/lib/fotos/speicher';
import { devEintrag, devVorschauAktiv } from '@/lib/dev/vorschau';
import { aktuelleSprache } from '@/lib/i18n/server';
import { adminTexte, mit, type AdminTexte } from '@/lib/i18n/admin';
import { pfadFuer, type Lang } from '@/lib/i18n/sprache';
import StatusFormular from './StatusFormular';
import KontaktKarte from './KontaktKarte';
import LoeschenBereich from './LoeschenBereich';
import { fotoLoeschen } from './actions';
import { ablaufSichtbar } from '@/lib/admin/ablauf-sichtbar';
import { ablaufMit, ablaufTexte } from '@/lib/i18n/ablauf';
import { ladeGeraeteStatus } from '@/lib/admin/geraete-status';
import { vorgangFertig } from '@/lib/admin/geraet-ablauf';
import { pruefeZweiteKontrolle } from '../../ablauf/zweite-kontrolle/actions';
import { speichereAnnahmeAktion } from './annahme-actions';
import { speichereUebergabeAktion, speichereLoeschungAktion } from './nachweis-actions';
import { setzeStatusAktion } from './status-actions';
import { ladeGeraetStatusListe, ladeGeraetEreignisse } from '@/lib/admin/geraet-verlauf';
import { geraetNaechsteStatus, brauchtZweiAdmins, geraetFertig } from '@/lib/admin/geraet-ablauf';
import { schrittErlaubt, schrittFuerStatus } from '@/lib/admin/rollen';
import UnterschriftFeld from './UnterschriftFeld';
import styles from '../../admin.module.css';

function protokollText(p: ProtokollEintrag, t: AdminTexte, lang: Lang): string {
  const d = p.details as { von?: string; nach?: string; felder?: string[]; anzahl?: number; fotos?: number };
  const namen: Record<string, string> = { name: t.detail.kontaktName, email: t.detail.kontaktEmail, plz: t.detail.kontaktPlz, telefon: t.detail.kontaktTelefon, organisation: t.detail.kontaktOrganisation };
  const feldNamen = (d.felder ?? []).map((f) => namen[f] ?? f).join(', ') || '–';
  if (p.aktion === 'status') return mit(t.detail.protoStatus, { von: statusText(d.von ?? '', lang), nach: statusText(d.nach ?? '', lang) });
  if (p.aktion === 'status-fehlgeschlagen') return mit(t.detail.protoStatusFehl, { von: statusText(d.von ?? '', lang), nach: statusText(d.nach ?? '', lang) });
  if (p.aktion === 'kontakt-geaendert') return mit(t.detail.protoKontakt, { felder: feldNamen });
  if (p.aktion === 'foto-geloescht') return t.detail.protoFotoGeloescht;
  if (p.aktion === 'fotos-angesehen') return mit(t.detail.protoFotosAngesehen, { n: d.anzahl ?? 0 });
  if (p.aktion === 'vorgang-geloescht') return mit(t.detail.protoVorgangGeloescht, { n: d.fotos ?? 0 });
  if (p.aktion === 'pdf') return t.detail.protoPdf;
  return p.aktion;
}

/** Only the answers the donor gave. Unknown ones are folded into one muted line. */
function geraetAntworten(g: GeraetDaten) {
  const wertVon = (feld: (typeof ANGABE_REIHENFOLGE)[number]) => (feld === 'typ' ? g.typ : g.angaben[feld]);
  const beantwortet = ANGABE_REIHENFOLGE.filter((f) => {
    const w = wertVon(f);
    return w && w !== 'unbekannt';
  });
  const ohne = ANGABE_REIHENFOLGE.filter((f) => {
    const w = wertVon(f);
    return !w || w === 'unbekannt';
  });
  return { beantwortet, ohne };
}

export const metadata: Metadata = { title: pageTitle('/admin'), robots: { index: false } };

type Props = { params: Promise<{ nr: string }>; searchParams: Promise<{ zk?: string; test?: string; an?: string; na?: string; grund?: string; st?: string; schritt?: string; dev?: string }> };

/** Ablaufschritte in Reihenfolge. Die Schlüssel sind die Werte des Parameters "schritt". */
const SCHRITTE = ['eingang', 'zweite', 'annahme', 'loeschung', 'technik', 'uebergabe', 'abschluss'] as const;

const FRIST_MS = FOTO_LOESCHFRIST_TAGE * 24 * 60 * 60 * 1000;

export default async function VorgangSeite({ params, searchParams }: Props) {
  gatePage('admin');
  const { nr } = await params;
  const { zk, test, an, na, grund, st, dev, schritt: schrittParam } = await searchParams;
  const aktiv = (SCHRITTE as readonly string[]).includes(schrittParam ?? '') ? (schrittParam as (typeof SCHRITTE)[number]) : 'eingang';
  if (!VORGANGSNUMMER.test(nr)) notFound();
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  const zkT = ablaufTexte(lang);
  const geraeteStatus = ablaufSichtbar() ? await ladeGeraeteStatus(nr) : null;
  const abschlussbereit = geraeteStatus !== null && vorgangFertig(geraeteStatus);
  const statusListe = ablaufSichtbar() ? await ladeGeraetStatusListe(nr) : null;
  const fertigeGeraete = statusListe ? statusListe.filter((z) => geraetFertig(z.status)).length : null;
  const verlauf = statusListe
    ? await Promise.all(statusListe.map(async (z) => ({ ...z, ereignisse: await ladeGeraetEreignisse(z.deviceId) })))
    : null;
  const p = (rest: string) => pfadFuer(lang, rest);
  const nutzer = await aktuellerNutzer();
  if (!nutzer) redirect(p('/admin/login'));
  const v = await ladeVorgang(nr);
  if (!v) notFound();
  const protokoll = await ladeProtokoll(nr).catch(() => []);

  // Photos: stored in the database and Supabase storage in production; in the dev preview they live in server memory.
  let fotoZeilen: Array<{ id: string; angelegt: string; loeschen: string; link: string | null }>;
  if (devVorschauAktiv()) {
    fotoZeilen = (devEintrag(nr)?.fotos ?? []).map((f) => ({
      id: f.id,
      angelegt: f.angelegt,
      loeschen: new Date(new Date(f.angelegt).getTime() + FRIST_MS).toISOString(),
      link: `/admin/dev-foto/${nr}/${f.id}`,
    }));
  } else {
    const fotos = await ladeFotos(v.id).catch(() => []);
    fotoZeilen = await Promise.all(
      fotos.map(async (f) => ({
        id: f.id,
        angelegt: f.angelegt,
        loeschen: f.loeschen_am,
        link: await signierterLink(f.pfad).catch(() => null),
      })),
    );
    if (fotoZeilen.length > 0) {
      // Viewing personal data is recorded (Plan §11).
      await schreibeProtokoll({ nutzer: nutzer.email, aktion: 'fotos-angesehen', vorgang: nr, details: { anzahl: fotoZeilen.length } }).catch(() => undefined);
    }
  }

  const fotoAnzahl = fotoZeilen.length;
  const fotoLoeschenMitId = (id: string) => fotoLoeschen.bind(null, nr, id);

  return (
    <FeatureGate feature="admin">
      <div className={styles.seite}>
        <p className={styles.linkzeile}><Link href={p('/admin')}>{t.zurUebersicht}</Link></p>

        <header className={styles.topBar}>
          <div>
            <h1 className={styles.titel}>{v.vorgangsnummer}</h1>
            <p className={styles.meta} style={{ margin: '6px 0 0' }}>
              <span className={`${styles.pill} ${styles[`pill-${statusKlasse(v.status)}`]}`}>{statusText(v.status, lang)}</span>{' '}
              {mit(t.detail.eingang, { datum: datumZeitDe(v.angelegt) })}
            </p>
          </div>
          <div className={styles.aktionen}>
            <a className={styles.btnZweit} href={`/admin/vorgang/${v.vorgangsnummer}/pdf`} download>{t.detail.pdf}</a>
            <a className={styles.btnZweit} href={`/admin/vorgang/${v.vorgangsnummer}/uebergabe`} download>{t.detail.uebergabePdf}</a>
            <a className={styles.btnZweit} href={`/admin/vorgang/${v.vorgangsnummer}/loeschprotokoll`} download>{t.akte.belegLoeschprotokoll}</a>
            <a className={styles.btnZweit} href={`/admin/vorgang/${v.vorgangsnummer}/entsorgung`} download>{t.akte.belegEntsorgung}</a>
            <Link className={styles.btnZweit} href={p(`/admin/vorgang/${v.vorgangsnummer}/akte`)}>{t.akte.titel}</Link>
            <a className={styles.btnZweit} href="#kontakt">{t.detail.bearbeiten}</a>
            {nutzer.rolle === 'admin' && <a className={styles.btnGefahr} href="#loeschen">{t.detail.loeschenKopf}</a>}
          </div>
        </header>

        {ablaufSichtbar() && (
          <nav aria-label={zkT.schrittNav} style={{ margin: '0 0 16px' }}>
            <p className={styles.meta} style={{ margin: '0 0 6px' }}>
              {zkT.schrittVon.replace('{n}', String(SCHRITTE.indexOf(aktiv) + 1)).replace('{m}', String(SCHRITTE.length))}: <strong>{zkT.schritte[aktiv]}</strong>
              {fertigeGeraete !== null && statusListe && (
                <> · {ablaufMit(zkT.geraeteFertig, { n: fertigeGeraete, m: statusListe.length })}</>
              )}
            </p>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
              {SCHRITTE.map((s, i) => (
                <li key={s} style={{ flex: '0 0 auto' }}>
                  <a
                    href={`?schritt=${s}`}
                    aria-current={s === aktiv ? 'step' : undefined}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 44, padding: '8px 12px', borderRadius: 999,
                      border: '1px solid var(--line)', textDecoration: 'none', color: 'inherit', whiteSpace: 'nowrap',
                      fontWeight: s === aktiv ? 700 : 400, background: s === aktiv ? 'var(--surface-alt)' : 'transparent',
                    }}
                  >
                    <span aria-hidden="true">{i + 1}.</span> {zkT.schritte[s]}
                  </a>
                </li>
              ))}
            </ol>
            <p className={styles.meta} style={{ margin: '6px 0 0' }}>{zkT.schrittAbzweig}</p>
          </nav>
        )}

        {ablaufSichtbar() && aktiv === 'annahme' && schrittErlaubt(nutzer.rolle, 'annahme') && (
          <section className={styles.karte} aria-labelledby="annahme-titel">
            <h2 id="annahme-titel">{zkT.annahmeTitel}</h2>
            <p className={styles.meta}>{zkT.annahmeText}</p>
            {an === 'ok' && <p role="status"><strong>{zkT.annahmeOk}</strong></p>}
            {an === 'test' && <p role="status"><strong>{zkT.annahmeTest}</strong></p>}
            {an === 'fehler' && (
              <p role="alert"><strong>{({
                eingabe: zkT.fehlerAnnahme,
                nachweis: zkT.fehlerAnnahmeNachweis,
                pdf: zkT.fehlerAnnahmePdf,
                lesen: zkT.fehlerAnnahmeSpeichern,
                kette: zkT.fehlerAnnahmeSpeichern,
                vorgang: zkT.fehlerAnnahmeSpeichern,
              } as Record<string, string>)[grund ?? ''] ?? zkT.fehlerAnnahme}</strong></p>
            )}
            <form action={speichereAnnahmeAktion} style={{ display: 'grid', gap: 18 }}>
              <input type="hidden" name="vorgangsnummer" value={nr} />
              <input type="hidden" name="schritt" value={aktiv} />

              {v.geraete.map((g) => (
                <fieldset key={`geraet-${g.position}`} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, display: 'grid', gap: 10 }}>
                  <legend>{g.position}. {geraetTitel(g, lang)}</legend>
                  <div role="radiogroup" aria-label={`${zkT.zustandLabel} ${g.position}`} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <span className={styles.meta}>{zkT.zustandLabel}:</span>
                    {['gut', 'spuren', 'defekt'].map((z, i) => (
                      <label key={z} style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <input type="radio" name={`zustand_${g.position}`} value={z} /> {zkT.zustandOpt[i]}
                      </label>
                    ))}
                  </div>
                  <div role="radiogroup" aria-label={`${zkT.datentraegerLabel} ${g.position}`} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <span className={styles.meta}>{zkT.datentraegerLabel}:</span>
                    {['ja', 'nein', 'unklar'].map((d, i) => (
                      <label key={d} style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <input type="radio" name={`datentraeger_${g.position}`} value={d} /> {zkT.datentraegerOpt[i]}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

              <fieldset style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, display: 'grid', gap: 10 }}>
                <legend>{zkT.sicherheitTitel}</legend>
                {zkT.sicherheitPunkte.map((punkt, i) => (
                  <div key={`sicherheit-${i}`} role="radiogroup" aria-label={punkt} style={{ display: 'grid', gap: 4 }}>
                    <span>{i + 1}. {punkt}</span>
                    <span style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      <label style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <input type="radio" name={`sicherheit_${i}`} value="ja" /> {zkT.sicherheitOpt[0]}
                      </label>
                      <label style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <input type="radio" name={`sicherheit_${i}`} value="nein" /> {zkT.sicherheitOpt[1]}
                      </label>
                    </span>
                  </div>
                ))}
              </fieldset>

              <fieldset style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, display: 'grid', gap: 10 }}>
                <legend>{zkT.entscheidungTitel}</legend>
                {['vollstaendig', 'teilweise', 'ablehnung'].map((e, i) => (
                  <label key={e} style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <input type="radio" name="entscheidung" value={e} /> {zkT.entscheidungOpt[i]}
                  </label>
                ))}
                <label style={{ display: 'grid', gap: 4 }}>
                  {zkT.grundLabel}
                  <input name="grund" style={{ width: '100%', minHeight: 44, padding: 8 }} />
                </label>
              </fieldset>

              <UnterschriftFeld label={zkT.unterschriftLabel} leer={zkT.unterschriftLeer} loeschen={zkT.loeschenLabel} />

              <button type="submit" className={styles.btnZweit}>{zkT.speichernAnnahme}</button>
            </form>
          </section>
        )}

        {ablaufSichtbar() && aktiv === 'uebergabe' && schrittErlaubt(nutzer.rolle, 'uebergabe') && (
          <section className={styles.karte} aria-labelledby="uebergabe-titel">
            <h2 id="uebergabe-titel">{zkT.uebergabeTitel}</h2>
            <p className={styles.meta}>{zkT.uebergabeText}</p>
            {na === 'ok' && <p role="status"><strong>{zkT.naOk}</strong></p>}
            {na === 'test' && <p role="status"><strong>{zkT.naTest}</strong></p>}
            {na === 'fehler' && <p role="alert"><strong>{grund === 'kette' ? zkT.fehlerKette : grund?.startsWith('zweiter') ? zkT.fehlerZweiter : zkT.fehlerNachweis}</strong></p>}
            <form action={speichereUebergabeAktion} style={{ display: 'grid', gap: 14 }}>
              <input type="hidden" name="vorgangsnummer" value={nr} />
              <input type="hidden" name="schritt" value={aktiv} />
              <fieldset style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, display: 'grid', gap: 10 }}>
                {zkT.uebergabePunkte.map((punkt, i) => (
                  <div key={`uebergabe-${i}`} role="radiogroup" aria-label={punkt} style={{ display: 'grid', gap: 4 }}>
                    <span>{i + 1}. {punkt}</span>
                    <span style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      <label style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <input type="radio" name={`kontrolle_${i}`} value="ja" /> {zkT.sicherheitOpt[0]}
                      </label>
                      <label style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <input type="radio" name={`kontrolle_${i}`} value="nein" /> {zkT.sicherheitOpt[1]}
                      </label>
                    </span>
                  </div>
                ))}
              </fieldset>
              <label style={{ display: 'grid', gap: 4 }}>
                {zkT.empfaengerLabel}
                <input name="empfaenger" required style={{ width: '100%', minHeight: 44, padding: 8 }} />
              </label>
              <UnterschriftFeld label={zkT.unterschriftLabel} leer={zkT.unterschriftLeer} loeschen={zkT.loeschenLabel} />
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="submit" className={styles.btnZweit}>{zkT.uebergabeSpeichern}</button>
              </div>
            </form>
          </section>
        )}

        {ablaufSichtbar() && aktiv === 'loeschung' && schrittErlaubt(nutzer.rolle, 'loeschung') && (
          <section className={styles.karte} aria-labelledby="loeschung-titel">
            <h2 id="loeschung-titel">{zkT.loeschungTitel}</h2>
            <p className={styles.meta}>{zkT.loeschungText}</p>
            {na === 'ok' && <p role="status"><strong>{zkT.naOk}</strong></p>}
            {na === 'test' && <p role="status"><strong>{zkT.naTest}</strong></p>}
            {na === 'fehler' && <p role="alert"><strong>{grund === 'kette' ? zkT.fehlerKette : grund?.startsWith('zweiter') ? zkT.fehlerZweiter : zkT.fehlerNachweis}</strong></p>}
            <form action={speichereLoeschungAktion} style={{ display: 'grid', gap: 18 }}>
              <input type="hidden" name="vorgangsnummer" value={nr} />
              <input type="hidden" name="schritt" value={aktiv} />
              {v.geraete.map((g) => (
                <fieldset key={`loeschung-${g.position}`} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, display: 'grid', gap: 10 }}>
                  <legend>{g.position}. {geraetTitel(g, lang)}</legend>
                  <div role="radiogroup" aria-label={`${zkT.verfahrenLabel} ${g.position}`} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <span className={styles.meta}>{zkT.verfahrenLabel}:</span>
                    {['hdd', 'ssd', 'nvme', 'emmc', 'smartphone', 'usb', 'keines'].map((val, i) => (
                      <label key={val} style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <input type="radio" name={`verfahren_${g.position}`} value={val} /> {zkT.verfahrenOpt[i]}
                      </label>
                    ))}
                  </div>
                  <div role="radiogroup" aria-label={`${zkT.verifiziertLabel} ${g.position}`} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <span className={styles.meta}>{zkT.verifiziertLabel}:</span>
                    <label style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <input type="radio" name={`verifiziert_${g.position}`} value="ja" /> {zkT.sicherheitOpt[0]}
                    </label>
                    <label style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <input type="radio" name={`verifiziert_${g.position}`} value="nein" /> {zkT.sicherheitOpt[1]}
                    </label>
                  </div>
                  <label style={{ display: 'grid', gap: 4 }}>
                    {zkT.werkzeugLabel}
                    <input name={`werkzeug_${g.position}`} style={{ width: '100%', minHeight: 44, padding: 8 }} />
                  </label>
                  <div role="radiogroup" aria-label={`${zkT.ergebnisLabel} ${g.position}`} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <span className={styles.meta}>{zkT.ergebnisLabel}:</span>
                    {['erfolgreich', 'fehlgeschlagen', 'ausnahme'].map((val, i) => (
                      <label key={val} style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <input type="radio" name={`ergebnis_${g.position}`} value={val} /> {zkT.ergebnisOpt[i]}
                      </label>
                    ))}
                  </div>
                  <label style={{ display: 'grid', gap: 4 }}>
                    {zkT.bemerkungLabel}
                    <input name={`bemerkung_${g.position}`} style={{ width: '100%', minHeight: 44, padding: 8 }} />
                  </label>
                </fieldset>
              ))}
              <fieldset style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, display: 'grid', gap: 10 }}>
                <legend>{zkT.zweiterTitel}</legend>
                <span className={styles.meta}>{zkT.zweiterText}</span>
                <label style={{ display: 'grid', gap: 4 }}>
                  {zkT.zweiterEmail}
                  <input name="zweiter_email" type="email" autoComplete="off" style={{ width: '100%', minHeight: 44, padding: 8 }} />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                  {zkT.zweiterPasswort}
                  <input name="zweiter_passwort" type="password" autoComplete="off" style={{ width: '100%', minHeight: 44, padding: 8 }} />
                </label>
              </fieldset>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="submit" className={styles.btnZweit}>{zkT.loeschungSpeichern}</button>
              </div>
            </form>
          </section>
        )}

        {verlauf && (
          <section className={styles.karte} aria-labelledby="status-verlauf-titel">
            <h2 id="status-verlauf-titel">{zkT.statusTitel}</h2>
            {st === 'ok' && <p role="status"><strong>{zkT.statusOk}</strong></p>}
            {st === 'fehler' && <p role="alert"><strong>{zkT.fehlerStatusSchritt}</strong></p>}
            {st === 'pdf' && <p role="alert"><strong>{zkT.fehlerStatusPdf}</strong></p>}
            {st === 'ok' && dev && (
              <p role="status">
                <strong>{zkT.schrittBereit}</strong>{' '}
                <a className={styles.btnZweit} href={`/admin/vorgang/${nr}/schritt-pdf?device=${dev}`} download>{zkT.dokSchritt} (PDF)</a>
              </p>
            )}
            {verlauf.map((z) => {
              const geraet = v.geraete.find((g) => g.id === z.deviceId);
              const label = (s: string) => zkT.statusLabels[s] ?? s;
              const weiter = geraetNaechsteStatus(z.status).filter((n) => !brauchtZweiAdmins(n) && schrittErlaubt(nutzer.rolle, schrittFuerStatus(n)));
              return (
                <article key={z.deviceId} className={styles.geraet} style={{ marginTop: 14 }}>
                  <div className={styles.geraetKopf}>
                    <h3>{geraet ? `${geraet.position}. ${geraetTitel(geraet, lang)}` : z.deviceId}</h3>
                    <span className={styles.meta}>{zkT.statusAktuell}: <strong>{label(z.status)}</strong></span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                    {aktiv === 'technik' && z.status === 'eingegangen' && (
                      <span className={styles.meta}>{zkT.hinweisZweiteZuerst}</span>
                    )}
                    {weiter.length === 0 && <span className={styles.meta}>{zkT.statusKeinerWeiter}</span>}
                    {weiter.map((n) => (
                      <form key={n} action={setzeStatusAktion}>
                        <input type="hidden" name="vorgangsnummer" value={nr} />
                        <input type="hidden" name="device_id" value={z.deviceId} />
                        <input type="hidden" name="nach" value={n} />
                        <input type="hidden" name="schritt" value={aktiv} />
                        <button type="submit" className={styles.btnZweit}>
                          {zkT.statusButtonVorlage.replace('{ziel}', label(n))}
                        </button>
                      </form>
                    ))}
                  </div>
                  <p style={{ marginTop: 10 }}>
                    <a className={styles.btnZweit} href={`/admin/vorgang/${nr}/schritt-pdf?device=${z.deviceId}`} download>{zkT.schrittPdf}</a>
                  </p>
                  <p className={styles.meta} style={{ marginTop: 10, marginBottom: 4 }}>{zkT.statusVerlauf}</p>
                  {z.ereignisse.length === 0 ? (
                    <p className={styles.meta}>{zkT.statusKeinVerlauf}</p>
                  ) : (
                    <ol style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 4 }}>
                      {z.ereignisse.map((e, i) => (
                        <li key={`${z.deviceId}-${i}`} className={styles.meta}>
                          {datumZeitDe(e.zeit)}: {label(e.von)} → {label(e.nach)} · {e.nutzer}
                          {e.zweiter_nutzer ? ` · ${e.zweiter_nutzer}` : ''}
                        </li>
                      ))}
                    </ol>
                  )}
                </article>
              );
            })}
          </section>
        )}

        {abschlussbereit && (
          <section className={styles.karte} role="status">
            <p><strong>{zkT.abschlussbereit}</strong></p>
          </section>
        )}

        {zk && (
          <section className={styles.karte} role={zk === 'passt' || zk === 'abweichung' ? 'status' : 'alert'}>
            {zk === 'passt' && <p><strong>{zkT.ergebnisPasst}</strong></p>}
            {zk === 'abweichung' && <p><strong>{zkT.ergebnisAbweichung}</strong></p>}
            {zk !== 'passt' && zk !== 'abweichung' && (
              <p><strong>{({
                eingabe: zkT.fehlerEingabe,
                geraet: zkT.fehlerGeraet,
                geraet_unbekannt: zkT.fehlerGeraetUnbekannt,
                status_veraltet: zkT.fehlerStatusVeraltet,
                wechsel_nicht_erlaubt: zkT.fehlerWechsel,
                datenbank_nicht_konfiguriert: zkT.fehlerKeineDb,
              } as Record<string, string>)[zk] ?? zkT.fehlerUnbekannt}</strong></p>
            )}
            {test === '1' && <p className={styles.meta}>{zkT.testHinweis}</p>}
          </section>
        )}

        <div className={styles.detailGrid}>
          <div className={styles.spalte}>
            <section className={`${styles.karte} ${styles.ordGeraete}`} aria-labelledby="geraete-titel" style={{ margin: 0 }}>
              <h2 id="geraete-titel">{t.detail.geraeteTitel} ({v.geraete.length})</h2>
              {v.geraete.map((g) => {
                const { beantwortet, ohne } = geraetAntworten(g);
                return (
                  <article key={g.position} className={styles.geraet} aria-label={mit(t.detail.geraetAria, { n: g.position })}>
                    <div className={styles.geraetKopf}>
                      <h3>{g.position}. {geraetTitel(g, lang)}</h3>
                      <span className={styles.meta}>{ergebnisKurz(g.ergebnis, lang)}</span>
                    </div>
                    <details open={aktiv === 'zweite'} style={{ marginTop: 8 }}>
                      <summary>{zkT.geraetDaten}</summary>
                    {beantwortet.length > 0 ? (
                      <dl className={styles.angaben}>
                        {beantwortet.map((feld) => (
                          <div key={feld} style={{ display: 'contents' }}>
                            <dt>{angabeLabel(feld, lang)}</dt>
                            <dd>{angabeText(feld, String(feld === 'typ' ? g.typ : g.angaben[feld]), lang)}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className={styles.meta}>{t.detail.keineAngabenSpender}</p>
                    )}
                    {ohne.length > 0 && <p className={styles.keineAngabe}>{mit(t.detail.ohneAngabe, { liste: ohne.map((f) => angabeLabel(f, lang)).join(', ') })}</p>}
                    {g.gruende.length > 0 && (
                      <ul className={styles.meta} style={{ paddingLeft: 18, margin: '10px 0 0' }}>
                        {g.gruende.map((tx) => (
                          <li key={tx}>{grundText(tx, lang)}</li>
                        ))}
                      </ul>
                    )}
                    </details>
                    {ablaufSichtbar() && aktiv === 'zweite' && schrittErlaubt(nutzer.rolle, 'zweite') && (
                      <form action={pruefeZweiteKontrolle} style={{ display: 'grid', gap: 12, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                        <h4 style={{ margin: 0 }}>{zkT.zweiteKontrolleTitel}</h4>
                        <p className={styles.meta} style={{ margin: 0 }}>{zkT.zweiteKontrolleText}</p>
                        <input type="hidden" name="vorgangsnummer" value={v.vorgangsnummer} />
                        <input type="hidden" name="schritt" value={aktiv} />
                        <input type="hidden" name="device_id" value={g.id} />
                        <p className={styles.meta} style={{ margin: 0 }}>
                          {zkT.antrag}: {g.typ}{g.marke ? `, ${g.marke}` : ''}{g.modell ? `, ${g.modell}` : ''}
                        </p>
                        <label style={{ display: 'grid', gap: 4 }}>
                          {zkT.geliefertTyp}
                          <input name="typ" required style={{ width: '100%', minHeight: 44, padding: 8 }} />
                        </label>
                        <label style={{ display: 'grid', gap: 4 }}>
                          {zkT.geliefertMarke}
                          <input name="marke" style={{ width: '100%', minHeight: 44, padding: 8 }} />
                        </label>
                        <label style={{ display: 'grid', gap: 4 }}>
                          {zkT.geliefertModell}
                          <input name="modell" style={{ width: '100%', minHeight: 44, padding: 8 }} />
                        </label>
                        <button type="submit" className={styles.btnZweit}>{zkT.pruefen}</button>
                      </form>
                    )}
                  </article>
                );
              })}
            </section>

            <section className={`${styles.karte} ${styles.ordFotos}`} aria-labelledby="fotos-titel" style={{ margin: 0 }}>
              <h2 id="fotos-titel">{t.detail.fotosTitel} ({fotoAnzahl})</h2>
              {fotoZeilen.length === 0 ? (
                <p className={styles.meta}>{t.detail.keineFotos}</p>
              ) : (
                <ul className={styles.fotos}>
                  {fotoZeilen.map((f, i) => (
                    <li key={f.id} className={styles.foto}>
                      {f.link ? (
                        <a href={f.link} target="_blank" rel="noopener noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={f.link} alt={mit(t.detail.fotoAlt, { n: i + 1, nr: v.vorgangsnummer })} loading="lazy" className={styles.fotoBild} />
                        </a>
                      ) : (
                        <p className={styles.meta}>{t.detail.fotoNichtVerfuegbar}</p>
                      )}
                      <p className={styles.meta}>{mit(t.detail.fotoHochgeladen, { datum: datumDe(f.angelegt), bis: datumDe(f.loeschen) })}</p>
                      {nutzer.rolle === 'admin' && (
                        <form action={fotoLoeschenMitId(f.id)}>
                          <button type="submit" className={styles.btnGefahr}>{t.detail.fotoLoeschen}</button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className={styles.spalte}>
            {(!ablaufSichtbar() || aktiv === 'abschluss') && (
            <section className={`${styles.karte} ${styles.ordStatus}`} aria-labelledby="status-titel" style={{ margin: 0 }}>
              <h2 id="status-titel">{t.detail.statusTitel}</h2>
              <StatusFormular nummer={v.vorgangsnummer} naechste={naechsteStatus(v.status)} t={t} lang={lang} />
            </section>
            )}

            <section id="kontakt" className={`${styles.karte} ${styles.ordKontakt}`} aria-labelledby="kontakt-titel" style={{ margin: 0 }}>
              <h2 id="kontakt-titel">{t.detail.kontaktTitel}</h2>
              <KontaktKarte
                nummer={v.vorgangsnummer}
                kontakt={{ name: v.kontakt.name, email: v.kontakt.email, plz: v.kontakt.plz, telefon: v.kontakt.telefon ?? '', organisation: v.kontakt.organisation ?? '' }}
                t={t}
                lang={lang}
              />
            </section>
          </div>

          <section className={`${styles.karte} ${styles.ordProtokoll}`} aria-labelledby="protokoll-titel" style={{ margin: 0 }}>
            <h2 id="protokoll-titel">{t.detail.protokollTitel}</h2>
            {protokoll.length === 0 ? (
              <p className={styles.meta}>{t.detail.protokollLeer}</p>
            ) : (
              <table className={styles.tabelle}>
                <thead>
                  <tr>
                    <th scope="col">{t.detail.spalteZeit}</th>
                    <th scope="col">{t.detail.spalteWer}</th>
                    <th scope="col">{t.detail.spalteWas}</th>
                  </tr>
                </thead>
                <tbody>
                  {protokoll.map((e, i) => (
                    <tr key={`${e.zeit}-${i}`}>
                      <td>{datumZeitDe(e.zeit)}</td>
                      <td>{e.nutzer}</td>
                      <td>{protokollText(e, t, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <details style={{ marginTop: 16 }}>
              <summary>{t.detail.technischTitel}</summary>
              <dl className={styles.angaben} style={{ marginTop: 12 }}>
                <dt>{t.detail.textversion}</dt><dd>{v.erklaerungVersion}</dd>
                <dt>{t.detail.pruefsumme}</dt><dd>{v.erklaerungHash}</dd>
                <dt>{t.detail.regelversion}</dt><dd>{v.regelVersion}</dd>
              </dl>
            </details>
          </section>

          {nutzer.rolle === 'admin' && (
            <>
            <section className={styles.karte} aria-labelledby="dokumente-titel" style={{ margin: 0 }}>
              <h2 id="dokumente-titel">{zkT.dokumenteTitel}</h2>
              <p className={styles.meta}>{zkT.dokumenteText}</p>
              <ul style={{ paddingLeft: 18, display: 'grid', gap: 8, margin: '10px 0 0' }}>
                {ablaufSichtbar() && (
                  <li><a href={`/admin/vorgang/${v.vorgangsnummer}/annahme`} download>{zkT.dokAnnahme}</a></li>
                )}
                {ablaufSichtbar() && (
                  <li><a href={`/admin/vorgang/${v.vorgangsnummer}/nachweis-pdf?art=uebergabe`} download>{zkT.dokUebergabe}</a></li>
                )}
                {ablaufSichtbar() && (
                  <li><a href={`/admin/vorgang/${v.vorgangsnummer}/nachweis-pdf?art=loeschung`} download>{zkT.dokLoeschung}</a></li>
                )}
                {verlauf && verlauf.map((z) => {
                  const g = v.geraete.find((x) => x.id === z.deviceId);
                  return (
                    <li key={`dok-${z.deviceId}`}>
                      <a href={`/admin/vorgang/${v.vorgangsnummer}/schritt-pdf?device=${z.deviceId}`} download>
                        {zkT.dokSchritt}: {g ? `${g.position}. ${geraetTitel(g, lang)}` : z.deviceId}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section id="loeschen" className={styles.ordLoeschen} aria-labelledby="loeschen-hinweis" style={{ scrollMarginTop: 24 }}>
              <h2 id="loeschen-hinweis" className={styles.nurLesen}>{t.detail.loeschenAufrufen}</h2>
              <LoeschenBereich nummer={v.vorgangsnummer} fotos={fotoAnzahl} t={t} />
            </section>
            </>
          )}
        </div>
      </div>
    </FeatureGate>
  );
}
