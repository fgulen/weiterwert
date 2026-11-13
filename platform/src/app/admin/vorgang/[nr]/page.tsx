import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FeatureGate } from '@/components/FeatureGate';
import { aktuellerNutzer } from '@/lib/admin/session';
import { angabeLabel, angabeText, ANGABE_REIHENFOLGE, ergebnisKurz, type GeraetDaten, ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { datumDe, datumZeitDe, geraeteName, grundText, statusKlasse, statusText } from '@/lib/admin/anzeige';
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

type Props = { params: Promise<{ nr: string }> };

const FRIST_MS = FOTO_LOESCHFRIST_TAGE * 24 * 60 * 60 * 1000;

export default async function VorgangSeite({ params }: Props) {
  gatePage('admin');
  const { nr } = await params;
  if (!VORGANGSNUMMER.test(nr)) notFound();
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
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

        <div className={styles.detailGrid}>
          <div className={styles.spalte}>
            <section className={`${styles.karte} ${styles.ordGeraete}`} aria-labelledby="geraete-titel" style={{ margin: 0 }}>
              <h2 id="geraete-titel">{t.detail.geraeteTitel} ({v.geraete.length})</h2>
              {v.geraete.map((g) => {
                const { beantwortet, ohne } = geraetAntworten(g);
                return (
                  <article key={g.position} className={styles.geraet} aria-label={mit(t.detail.geraetAria, { n: g.position })}>
                    <div className={styles.geraetKopf}>
                      <h3>{g.position}. {geraeteName(g, lang)}</h3>
                      <span className={styles.meta}>{ergebnisKurz(g.ergebnis, lang)}</span>
                    </div>
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
            <section className={`${styles.karte} ${styles.ordStatus}`} aria-labelledby="status-titel" style={{ margin: 0 }}>
              <h2 id="status-titel">{t.detail.statusTitel}</h2>
              <StatusFormular nummer={v.vorgangsnummer} naechste={naechsteStatus(v.status)} t={t} lang={lang} />
            </section>

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
            <section id="loeschen" className={styles.ordLoeschen} aria-labelledby="loeschen-hinweis" style={{ scrollMarginTop: 24 }}>
              <h2 id="loeschen-hinweis" className={styles.nurLesen}>{t.detail.loeschenAufrufen}</h2>
              <LoeschenBereich nummer={v.vorgangsnummer} fotos={fotoAnzahl} t={t} />
            </section>
          )}
        </div>
      </div>
    </FeatureGate>
  );
}
