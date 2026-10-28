'use client';

import { useEffect, useId, useRef, useState, useTransition, type ReactNode } from 'react';
import { ERKLAERUNGEN, LEERER_KONTAKT, MAX_GERAETE, pruefeKontakt, type Kontakt, type KontaktFehler } from '@/lib/absenden/anfrage';
import { CHECK, type CheckTexte } from '@/lib/i18n/check';
import type { Lang } from '@/lib/i18n/sprache';
import { pruefe } from '@/lib/vorpruefung/pruefe';
import type { Ergebnis, GeraetEingabe, Geraetetyp, Pruefergebnis } from '@/lib/vorpruefung/types';
import { sendeAnfrage } from './actions';
import styles from './check.module.css';

type Option<V extends string> = { value: V; label: string };
type Art = 'laptop' | 'tablet';
type FrageKey = Exclude<keyof GeraetEingabe, 'marke' | 'modell'>;
type Eintrag = { eingabe: GeraetEingabe; r: Pruefergebnis };

const LEER: GeraetEingabe = {
  typ: 'unbekannt', marke: '', modell: '', alter: 'unbekannt', startet: 'unbekannt', display: 'unbekannt',
  akku: 'unbekannt', sperren: 'unbekannt', eigentum: 'unbekannt', ram: 'unbekannt',
};

const ergebnisText = (t: CheckTexte, e: Ergebnis) =>
  ({ geeignet: t.ergebnisGeeignet, angaben: t.ergebnisAngaben, manuell: t.ergebnisManuell, nichtGeeignet: t.ergebnisNichtGeeignet })[e];

// The toggle decides which device types and questions are shown.
const artDaten = (t: CheckTexte): Record<Art, { label: string; typen: Option<Geraetetyp>[]; marke: string; modell: string }> => ({
  laptop: {
    label: t.laptop,
    typen: [
      { value: 'laptop', label: t.typLaptop }, { value: 'macbook', label: t.typMacbook },
      { value: 'chromebook', label: t.typChromebook }, { value: 'unbekannt', label: t.weissNicht },
    ],
    marke: t.markeLaptop, modell: t.modellLaptop,
  },
  tablet: {
    label: t.tablet,
    typen: [
      { value: 'ipad', label: t.typIpad }, { value: 'android', label: t.typAndroid }, { value: 'unbekannt', label: t.weissNicht },
    ],
    marke: t.markeTablet, modell: t.modellTablet,
  },
});

type Frage = { key: FrageKey; schritt: number; legend: string; nurLaptop?: boolean; options: Option<string>[] };
const fragen = (t: CheckTexte): Frage[] => {
  const unbekannt = { value: 'unbekannt', label: t.weissNicht };
  return [
    { key: 'alter', schritt: 1, legend: t.qAlter, options: [
      { value: '0-3', label: t.alter03 }, { value: '4-6', label: t.alter46 },
      { value: '7-9', label: t.alter79 }, { value: '10+', label: t.alter10 }, unbekannt,
    ] },
    { key: 'startet', schritt: 1, legend: t.qStartet, options: [{ value: 'ja', label: t.ja }, { value: 'nein', label: t.nein }, unbekannt] },
    { key: 'display', schritt: 1, legend: t.qDisplay, options: [{ value: 'ok', label: t.inOrdnung }, { value: 'schaden', label: t.displaySchaden }, unbekannt] },
    { key: 'akku', schritt: 1, legend: t.qAkku, options: [
      { value: 'ok', label: t.inOrdnung }, { value: 'schwach', label: t.akkuSchwach }, { value: 'gebläht', label: t.akkuGeblaeht }, unbekannt,
    ] },
    { key: 'ram', schritt: 1, nurLaptop: true, legend: t.qRam, options: [{ value: '8+', label: t.ram8 }, { value: '4', label: t.ram4 }, unbekannt] },
    { key: 'sperren', schritt: 2, legend: t.qSperren, options: [
      { value: 'keine', label: t.sperrenKeine }, { value: 'konto', label: t.sperrenKonto }, { value: 'firma', label: t.sperrenFirma }, unbekannt,
    ] },
    { key: 'eigentum', schritt: 2, legend: t.qEigentum, options: [
      { value: 'ja', label: t.eigentumJa }, { value: 'leasing', label: t.eigentumLeasing }, unbekannt,
    ] },
  ];
};

const schrittePruefung = (t: CheckTexte) => [t.schrittGeraet, t.schrittZustand, t.schrittKonten, t.schrittErgebnis];
const schritteAnfrage = (t: CheckTexte) => [...schrittePruefung(t), t.schrittKontakt, t.schrittAbsenden];
const ERGEBNIS = 3;
const KONTAKT = 4;
const ABSENDEN = 5;

const kontaktFelder = (t: CheckTexte): { key: keyof Kontakt; label: string; type: string; autoComplete: string; pflicht: boolean; inputMode?: 'numeric' }[] => [
  { key: 'name', label: t.feldName, type: 'text', autoComplete: 'name', pflicht: true },
  { key: 'email', label: t.feldEmail, type: 'email', autoComplete: 'email', pflicht: true },
  { key: 'plz', label: t.feldPlz, type: 'text', autoComplete: 'postal-code', pflicht: true, inputMode: 'numeric' },
  { key: 'telefon', label: t.feldTelefon, type: 'tel', autoComplete: 'tel', pflicht: false },
  { key: 'organisation', label: t.feldOrganisation, type: 'text', autoComplete: 'organization', pflicht: false },
];

const mit = (text: string, werte: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, k: string) => String(werte[k] ?? `{${k}}`));

// crypto.randomUUID is missing on older iPads (Safari before 15.4), which donors often use.
function neueId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const geraetName = (t: CheckTexte, g: GeraetEingabe, i: number) => [g.marke, g.modell].filter(Boolean).join(' ') || mit(t.geraetN, { n: i + 1 });

function Ergebnisbox({ r, t }: { r: Pruefergebnis; t: CheckTexte }) {
  return (
    <div role="status" aria-live="polite" aria-label={t.vorpruefung} className={`${styles.result} ${styles[r.ergebnis]}`}>
      <strong>{ergebnisText(t, r.ergebnis)}</strong>
      {r.codes.length > 0 && <ul>{r.codes.map((c) => <li key={c}>{t.gruende[c]}</li>)}</ul>}
      <small>{mit(t.einschaetzung, { v: r.regelVersion })}</small>
    </div>
  );
}

function Icon({ art }: { art: Art }) {
  return art === 'laptop' ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19h20" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2" /><path d="M11 18.5h2" /></svg>
  );
}

function Fortschritt({ schritte, schritt, t }: { schritte: string[]; schritt: number; t: CheckTexte }) {
  return (
    <div className={styles.progress}>
      <p className={styles.progressText}>{mit(t.schrittVon, { n: schritt + 1, m: schritte.length })} <strong>{schritte[schritt]}</strong></p>
      <ol aria-label={t.fortschritt} className={styles.progressList} style={{ gridTemplateColumns: `repeat(${schritte.length},1fr)` }}>
        {schritte.map((s, i) => (
          <li key={s} aria-current={i === schritt ? 'step' : undefined}
            className={i < schritt ? styles.done : i === schritt ? styles.current : undefined}>
            <span className={styles.label}>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Pre-check wizard. With `absenden` the donor can send the request (contact + submit steps);
 * without it the flow ends at the result and `abschluss` explains how to continue.
 */
export function GeraeteCheck({ abschluss, absenden = false, lang = 'de' }: { abschluss?: ReactNode; absenden?: boolean; lang?: Lang }) {
  const t = CHECK[lang];
  const ART = artDaten(t);
  const FRAGEN = fragen(t);
  const KONTAKT_FELDER = kontaktFelder(t);
  const SCHRITTE_PRUEFUNG = schrittePruefung(t);
  const schritte = absenden ? schritteAnfrage(t) : SCHRITTE_PRUEFUNG;
  const [art, setArt] = useState<Art>('laptop');
  const [geraet, setGeraet] = useState<GeraetEingabe>(LEER);
  const [schritt, setSchritt] = useState(0);
  const [liste, setListe] = useState<Eintrag[]>([]);
  // False once the current device has been put on the list (e.g. after "Weiter zu Kontakt").
  const [entwurf, setEntwurf] = useState(true);
  const [kontakt, setKontakt] = useState<Kontakt>(LEERER_KONTAKT);
  const [kontaktFehler, setKontaktFehler] = useState<KontaktFehler>({});
  const [erkl, setErkl] = useState({ eigentum: false, daten: false });
  const [erklFehler, setErklFehler] = useState(false);
  const [website, setWebsite] = useState('');
  // Same content keeps the same key (safe retry); any change to devices or contact gets a new one.
  const [schluessel, setSchluessel] = useState<{ key: string; inhalt: string } | null>(null);
  const [sendFehler, setSendFehler] = useState<string | null>(null);
  const [vorgangsnummer, setVorgangsnummer] = useState<string | null>(null);
  const [sendet, startSenden] = useTransition();
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const r = pruefe(geraet);
  const set = <K extends keyof GeraetEingabe>(k: K, v: GeraetEingabe[K]) => setGeraet((g) => ({ ...g, [k]: v }));
  const letzterPruefschritt = SCHRITTE_PRUEFUNG.length - 1;

  // After a step change, put focus and view on the new step (not on first render).
  useEffect(() => {
    if (!moved.current) return;
    heading.current?.focus();
    heading.current?.closest('section, form')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [schritt, vorgangsnummer]);
  const gehe = (s: number) => { moved.current = true; setSchritt(s); };

  // Answers that do not exist for the new device kind must not keep influencing the result.
  const waehleArt = (a: Art) => {
    setArt(a);
    setGeraet((g) => ({
      ...g,
      typ: ART[a].typen.some((t) => t.value === g.typ) ? g.typ : 'unbekannt',
      ram: a === 'tablet' ? 'unbekannt' : g.ram,
    }));
  };

  // Puts the current device on the list unless it is rated not suitable; either way the draft ends.
  const uebernehmeEntwurf = () => {
    if (entwurf && r.ergebnis !== 'nichtGeeignet') setListe((l) => (l.length < MAX_GERAETE ? [...l, { eingabe: geraet, r }] : l));
    setGeraet(LEER);
    setEntwurf(false);
  };
  const neuesGeraet = () => { uebernehmeEntwurf(); setEntwurf(true); gehe(0); };
  const anzahlNachUebernahme = Math.min(MAX_GERAETE, liste.length + (entwurf && r.ergebnis !== 'nichtGeeignet' ? 1 : 0));

  const zuAbsenden = () => {
    const f = pruefeKontakt(kontakt, t.kontaktFehler);
    setKontaktFehler(f);
    const erster = KONTAKT_FELDER.find((k) => f[k.key]);
    if (erster) { document.getElementById(`${id}-${erster.key}`)?.focus(); return; }
    const inhalt = JSON.stringify([liste.map((d) => d.eingabe), kontakt]);
    setSchluessel((s) => (s && s.inhalt === inhalt ? s : { key: neueId(), inhalt }));
    gehe(ABSENDEN);
  };

  const senden = () => {
    if (!erkl.eigentum || !erkl.daten) { setErklFehler(true); document.getElementById(`${id}-erkl`)?.focus(); return; }
    setErklFehler(false);
    setSendFehler(null);
    startSenden(async () => {
      try {
        const antwort = await sendeAnfrage({
          idempotencyKey: schluessel?.key, geraete: liste.map((d) => d.eingabe), kontakt, erklaerungen: erkl, website,
        });
        if (antwort.ok) { moved.current = true; setVorgangsnummer(antwort.vorgangsnummer); }
        else setSendFehler(antwort.code === 'zuViele' ? mit(t.fehler.zuViele, { max: MAX_GERAETE }) : t.fehler[antwort.code] ?? antwort.fehler);
      } catch {
        // Lost connection or an outdated page after a deploy; the same key makes a retry safe.
        setSendFehler(t.verbindung);
      }
    });
  };

  const frage = (f: Frage) => (
    <fieldset key={f.key} className={styles.q}>
      <legend>{f.legend}</legend>
      <div className={styles.opts}>
        {f.options.map((o) => (
          <label key={o.value} className={styles.opt}>
            <input type="radio" name={`${id}-${f.key}`} value={o.value}
              checked={geraet[f.key] === o.value}
              onChange={() => set(f.key, o.value as never)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  if (vorgangsnummer) {
    return (
      <section className={`${styles.form} ${styles.danke}`} aria-labelledby={`${id}-danke`}>
        <h2 id={`${id}-danke`} ref={heading} tabIndex={-1} className={styles.stepHeading}>{t.dankeTitel}</h2>
        <p>{t.dankeAngekommen}</p>
        <p className={styles.nummer}>{vorgangsnummer}</p>
        <p>{t.dankeMelden}</p>
        <p className={styles.hint}>{t.dankeNochNichts}</p>
      </section>
    );
  }

  return (
    <div className={styles.wrap}>
      {liste.length > 0 && schritt !== ABSENDEN && (
        <section className={styles.listBox}>
          <h2>{t.ihreGeraete} ({liste.length})</h2>
          <ul aria-label={t.ihreGeraete} className={styles.list}>
            {liste.map((d, i) => (
              <li key={i} className={styles.item}>
                <span>{geraetName(t, d.eingabe, i)}</span>
                <span className={`${styles.chip} ${styles[d.r.ergebnis]}`}>{ergebnisText(t, d.r.ergebnis)}</span>
                <button type="button" className={styles.linkBtn} onClick={() => setListe((l) => l.filter((_, j) => j !== i))}>{t.entfernen}</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form className={styles.form} noValidate onSubmit={(ev) => {
        ev.preventDefault();
        if (schritt < letzterPruefschritt) { gehe(schritt + 1); return; }
        if (!absenden) {
          if (r.ergebnis === 'nichtGeeignet') return;
          setListe((l) => [...l, { eingabe: geraet, r }]);
          setGeraet(LEER);
          gehe(0);
          return;
        }
        if (schritt === ERGEBNIS) { if (anzahlNachUebernahme > 0) { uebernehmeEntwurf(); gehe(KONTAKT); } return; }
        if (schritt === KONTAKT) { zuAbsenden(); return; }
        senden();
      }}>
        <Fortschritt schritte={schritte} schritt={schritt} t={t} />
        <h2 ref={heading} tabIndex={-1} className={styles.stepHeading}>
          {schritt === 0 ? (liste.length === 0 ? t.ihrGeraet : t.weiteresGeraet) : schritte[schritt]}
        </h2>

        {schritt === 0 && (
          <>
            <fieldset className={styles.q}>
              <legend>{t.wasSpenden}</legend>
              <div className={styles.toggle}>
                {(Object.keys(ART) as Art[]).map((a) => (
                  <label key={a} className={styles.toggleOpt}>
                    <input type="radio" name={`${id}-art`} value={a} checked={art === a} onChange={() => waehleArt(a)} />
                    <Icon art={a} />
                    <span>{ART[a].label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className={styles.hint}>{t.freiwillig}</p>
            {frage({ key: 'typ', schritt: 0, legend: t.geraetetyp, options: ART[art].typen })}
            <div className={styles.row}>
              <label htmlFor={`${id}-marke`}>{t.marke}</label>
              <input id={`${id}-marke`} value={geraet.marke} onChange={(e) => set('marke', e.target.value)} placeholder={ART[art].marke} autoComplete="off" maxLength={100} />
              <label htmlFor={`${id}-modell`}>{t.modellOptional}</label>
              <input id={`${id}-modell`} value={geraet.modell} onChange={(e) => set('modell', e.target.value)} placeholder={ART[art].modell} autoComplete="off" maxLength={100} />
            </div>
          </>
        )}

        {FRAGEN.filter((f) => f.schritt === schritt && !(f.nurLaptop && art === 'tablet')).map(frage)}

        {/* Safety notes (swollen battery, leasing) must not wait until the last step. */}
        {schritt <= ERGEBNIS && entwurf && (schritt === ERGEBNIS || r.ergebnis === 'nichtGeeignet') && <Ergebnisbox r={r} t={t} />}

        {absenden && schritt === ERGEBNIS && (
          <p className={styles.hint}>
            {!entwurf ? t.hinweisListe
              : r.ergebnis === 'nichtGeeignet'
                ? (liste.length > 0 ? t.hinweisNichtAufnehmen : t.hinweisNichtAnnehmen)
                : anzahlNachUebernahme >= MAX_GERAETE
                  ? mit(t.hinweisMax, { max: MAX_GERAETE })
                  : t.hinweisNoch}
          </p>
        )}

        {schritt === KONTAKT && (
          <>
            <p className={styles.hint}>{t.hinweisKontakt}</p>
            <div className={styles.row}>
              {KONTAKT_FELDER.map((f) => (
                <div key={f.key} className={styles.field}>
                  <label htmlFor={`${id}-${f.key}`}>{f.label}</label>
                  <input id={`${id}-${f.key}`} type={f.type} autoComplete={f.autoComplete} inputMode={f.inputMode}
                    value={kontakt[f.key]} maxLength={f.key === 'plz' ? 5 : 100} required={f.pflicht}
                    aria-invalid={kontaktFehler[f.key] ? true : undefined}
                    aria-describedby={kontaktFehler[f.key] ? `${id}-${f.key}-fehler` : undefined}
                    onChange={(e) => setKontakt((k) => ({ ...k, [f.key]: e.target.value }))} />
                  {kontaktFehler[f.key] && <span id={`${id}-${f.key}-fehler`} className={styles.fehler}>{kontaktFehler[f.key]}</span>}
                </div>
              ))}
            </div>
            <div className={styles.infoBox}>
              <strong>{t.uebergabeTitel}</strong>
              <span>{t.uebergabeText}</span>
            </div>
          </>
        )}

        {schritt === ABSENDEN && (
          <>
            <p className={styles.hint}>{t.bitteAngabenPruefen}</p>
            <div className={styles.summary}>
              <div className={styles.summaryHead}><h3>{t.geraete} ({liste.length})</h3><button type="button" className={styles.linkBtn} onClick={() => gehe(ERGEBNIS)}>{t.aendern}</button></div>
              {liste.length === 0
                ? <p className={styles.fehler}>{t.mindestensEins}</p>
                : <ul className={styles.summaryList}>{liste.map((d, i) => <li key={i}>{geraetName(t, d.eingabe, i)} – {ergebnisText(t, d.r.ergebnis)}</li>)}</ul>}
            </div>
            <div className={styles.summary}>
              <div className={styles.summaryHead}><h3>{t.kontakt}</h3><button type="button" className={styles.linkBtn} onClick={() => gehe(KONTAKT)}>{t.aendern}</button></div>
              <p className={styles.summaryText}>
                {kontakt.name}<br />{kontakt.email}<br />{t.plzKurz} {kontakt.plz}
                {kontakt.telefon && <><br />{kontakt.telefon}</>}
                {kontakt.organisation && <><br />{kontakt.organisation}</>}
              </p>
            </div>
            <fieldset className={styles.q} id={`${id}-erkl`} tabIndex={-1} aria-describedby={erklFehler ? `${id}-erkl-fehler` : undefined}>
              <legend>{t.erklaerungen}</legend>
              {lang !== 'de' && <p className={styles.hint}>{t.erklaerungenDeutsch}</p>}
              <label className={styles.check}>
                <input type="checkbox" checked={erkl.eigentum} onChange={(e) => setErkl((x) => ({ ...x, eigentum: e.target.checked }))} />
                <span lang="de">{ERKLAERUNGEN.eigentum}</span>
              </label>
              <label className={styles.check}>
                <input type="checkbox" checked={erkl.daten} onChange={(e) => setErkl((x) => ({ ...x, daten: e.target.checked }))} />
                <span lang="de">{ERKLAERUNGEN.daten}</span>
              </label>
              {erklFehler && <span id={`${id}-erkl-fehler`} className={styles.fehler}>{t.erklaerungenBeide}</span>}
            </fieldset>
            <p className={styles.hint}>
              {t.datenschutzVor}{' '}
              <a href="/datenschutz.html" hrefLang="de">{t.datenschutzLink}</a>{t.datenschutzNach}
            </p>
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor={`${id}-website`}>Website</label>
              <input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            {sendFehler && <p role="alert" className={styles.fehlerBox}>{sendFehler}</p>}
          </>
        )}

        <div className={styles.nav}>
          {schritt > 0 && !(schritt === ERGEBNIS && absenden && !entwurf) && (
            <button type="button" className={styles.back} onClick={() => gehe(schritt - 1)}>{t.zurueck}</button>
          )}
          {schritt < letzterPruefschritt && <button type="submit" className="btn">{t.weiter}</button>}
          {schritt === ERGEBNIS && !absenden && (
            <button type="submit" className="btn" disabled={r.ergebnis === 'nichtGeeignet'}>{t.zurListe}</button>
          )}
          {schritt === ERGEBNIS && absenden && (
            <>
              <button type="button" className={styles.back} onClick={neuesGeraet} disabled={anzahlNachUebernahme >= MAX_GERAETE}>{t.weiteresErfassen}</button>
              <button type="submit" className="btn" disabled={anzahlNachUebernahme === 0}>{t.weiterKontakt}</button>
            </>
          )}
          {schritt === KONTAKT && <button type="submit" className="btn">{t.weiter}</button>}
          {schritt === ABSENDEN && (
            <button type="submit" className="btn" disabled={sendet || liste.length === 0}>{sendet ? t.wirdGesendet : t.senden}</button>
          )}
        </div>

        {schritt === ERGEBNIS && abschluss}
      </form>
    </div>
  );
}
