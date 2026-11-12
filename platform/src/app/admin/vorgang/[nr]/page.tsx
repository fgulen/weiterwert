import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FeatureGate } from '@/components/FeatureGate';
import { aktuellerNutzer } from '@/lib/admin/session';
import { angabeLabel, angabeText, ANGABE_REIHENFOLGE, ERGEBNIS_KURZ, ladeVorgang, VORGANGSNUMMER } from '@/lib/admin/vorgang';
import { geraeteText, statusText } from '@/lib/admin/anzeige';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import { ladeProtokoll, type ProtokollEintrag } from '@/lib/admin/protokoll';
import { naechsteStatus } from '@/lib/admin/status';
import StatusFormular from './StatusFormular';
import { ladeFotos, signierterLink } from '@/lib/fotos/speicher';
import { schreibeProtokoll } from '@/lib/admin/protokoll';
import { fotoLoeschen } from './actions';
import styles from '../../admin.module.css';

function protokollText(p: ProtokollEintrag): string {
  const d = p.details as { von?: string; nach?: string };
  if (p.aktion === 'status') return `Status: ${statusText(d.von ?? '')} → ${statusText(d.nach ?? '')}`;
  if (p.aktion === 'status-fehlgeschlagen') return `Statuswechsel fehlgeschlagen (${statusText(d.von ?? '')} → ${statusText(d.nach ?? '')})`;
  if (p.aktion === 'pdf') return 'PDF heruntergeladen';
  return p.aktion;
}

export const metadata: Metadata = { title: pageTitle('/admin'), robots: { index: false } };

type Props = { params: Promise<{ nr: string }> };

export default async function VorgangSeite({ params }: Props) {
  gatePage('admin');
  const { nr } = await params;
  if (!VORGANGSNUMMER.test(nr)) notFound();
  const nutzer = await aktuellerNutzer();
  if (!nutzer) redirect('/admin/login');
  const v = await ladeVorgang(nr);
  if (!v) notFound();
  const protokoll = await ladeProtokoll(nr);
  const fotos = await ladeFotos(v.id).catch(() => []);
  const fotoLinks = await Promise.all(fotos.map(async (f) => ({ ...f, link: await signierterLink(f.pfad).catch(() => null) })));
  if (fotoLinks.length > 0) {
    // Viewing personal data is recorded (Plan §11).
    await schreibeProtokoll({ nutzer: nutzer.email, aktion: 'fotos-angesehen', vorgang: nr, details: { anzahl: fotoLinks.length } }).catch(() => undefined);
  }

  return (
    <>
      <FeatureGate feature="admin">
        <p className={styles.linkzeile}><Link href="/admin">← Zur Liste</Link></p>
        <div className={styles.kopf}>
          <h1>{v.vorgangsnummer}</h1>
          <a className="btn" href={`/admin/vorgang/${v.vorgangsnummer}/pdf`} download>
            PDF herunterladen
          </a>
        </div>
        <p className={styles.meta}>Status: {statusText(v.status)} · Eingegangen am {v.angelegt}</p>

        <h2>Status</h2>
        <StatusFormular nummer={v.vorgangsnummer} naechste={naechsteStatus(v.status)} />

        <h2>Kontakt</h2>
        <dl className={styles.angaben}>
          <dt>Name</dt><dd>{v.kontakt.name}</dd>
          <dt>E-Mail</dt><dd>{v.kontakt.email}</dd>
          <dt>PLZ</dt><dd>{v.kontakt.plz}</dd>
          <dt>Telefon</dt><dd>{v.kontakt.telefon || '–'}</dd>
          <dt>Organisation</dt><dd>{v.kontakt.organisation || '–'}</dd>
        </dl>

        <h2>Geräte ({v.geraete.length})</h2>
        {v.geraete.map((g) => (
          <section key={g.position} className={styles.geraet} aria-labelledby={`g-${g.position}`}>
            <h3 id={`g-${g.position}`}>
              {g.position}. {[g.marke, g.modell].filter(Boolean).join(' ') || geraeteText(g.typ)}
            </h3>
            <dl className={styles.angaben}>
              {ANGABE_REIHENFOLGE.map((feld) => {
                const wert = feld === 'typ' ? g.typ : g.angaben[feld];
                if (wert === undefined || wert === null || wert === '') return null;
                return (
                  <div key={feld} style={{ display: 'contents' }}>
                    <dt>{angabeLabel(feld)}</dt>
                    <dd>{angabeText(feld, String(wert))}</dd>
                  </div>
                );
              })}
              <dt>Vorprüfung</dt>
              <dd>{ERGEBNIS_KURZ[g.ergebnis] ?? g.ergebnis}</dd>
              {g.gruende.length > 0 && (
                <>
                  <dt>Gründe</dt>
                  <dd>
                    <ul>
                      {g.gruende.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </dd>
                </>
              )}
            </dl>
          </section>
        ))}

        <h2>Erklärungen</h2>
        <dl className={styles.angaben}>
          <dt>Textversion</dt><dd>{v.erklaerungVersion}</dd>
          <dt>Prüfsumme</dt><dd>{v.erklaerungHash}</dd>
          <dt>Regelversion</dt><dd>{v.regelVersion}</dd>
        </dl>
        <h2>Fotos</h2>
        {fotoLinks.length === 0 ? (
          <p className={styles.meta}>Keine Fotos vorhanden.</p>
        ) : (
          <ul className={styles.fotos}>
            {fotoLinks.map((f, i) => (
              <li key={f.id} className={styles.foto}>
                {f.link ? (
                  <a href={f.link} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.link} alt={`Gerätefoto ${i + 1} zu ${v.vorgangsnummer}`} loading="lazy" className={styles.fotoBild} />
                  </a>
                ) : (
                  <p className={styles.meta}>Foto nicht verfügbar.</p>
                )}
                <p className={styles.meta}>Hochgeladen am {f.angelegt.slice(0, 10)} · löschen bis {f.loeschen_am.slice(0, 10)}</p>
                {nutzer?.rolle === 'admin' && (
                  <form action={fotoLoeschen.bind(null, nr, f.id)}>
                    <button type="submit" className="btn">Foto löschen</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}

        <h2>Protokoll</h2>
        {protokoll.length === 0 ? (
          <p className={styles.meta}>Noch keine Einträge.</p>
        ) : (
          <table className={styles.tabelle}>
            <thead>
              <tr>
                <th scope="col">Zeit</th>
                <th scope="col">Wer</th>
                <th scope="col">Was</th>
              </tr>
            </thead>
            <tbody>
              {protokoll.map((p, i) => (
                <tr key={`${p.zeit}-${i}`}>
                  <td>{p.zeit.slice(0, 16).replace('T', ' ')}</td>
                  <td>{p.nutzer}</td>
                  <td>{protokollText(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </FeatureGate>
    </>
  );
}
