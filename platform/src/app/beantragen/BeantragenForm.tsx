'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { MAX_ANTRAG_GERAETE, NACHWEISE, type Antragsart, type Nachweis } from '@/lib/antrag/antrag';
import { sendeAntrag, type AntragAntwort } from './actions';
import { SPRACHEN, SPRACHNAMEN, TEXTE, type Sprache } from './i18n';
import styles from './beantragen.module.css';

function neueSchluessel(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  // Older tablets have no randomUUID; any unique RFC4122-shaped value works as the idempotency key.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function BeantragenForm() {
  // Created in the browser only: crypto.randomUUID cannot run during prerendering.
  const [key, setKey] = useState<string | null>(null);
  useEffect(() => setKey(neueSchluessel()), []);
  const [sprache, setSprache] = useState<Sprache>('de');
  const [art, setArt] = useState<Antragsart>('kurum');
  const [sending, setSending] = useState(false);
  const [antwort, setAntwort] = useState<AntragAntwort | null>(null);
  const t = TEXTE[sprache];

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!key) return;
    const f = new FormData(e.currentTarget);
    const eingabe = {
      idempotencyKey: key,
      art,
      geraeteart: f.get('geraeteart'),
      anzahl: Number(f.get('anzahl')),
      zweck: f.get('zweck'),
      name: f.get('name'),
      email: f.get('email'),
      plz: f.get('plz'),
      organisation: f.get('organisation') ?? '',
      nachweis: f.get('nachweis') ?? undefined,
      datenschutzGelesen: f.get('datenschutz') === 'on',
      website: f.get('website'),
    };
    setSending(true);
    setAntwort(await sendeAntrag(eingabe));
    setSending(false);
  }

  // Server messages are German. Outside German we show the translated generic text instead.
  const fehlerText = (a: AntragAntwort & { ok: false }) => (sprache === 'de' ? a.fehler : t.pruefen);

  const kopf = (
    <>
      <h1>{t.titel}</h1>
      <p className="lead">{t.lead}</p>
    </>
  );

  const sprachWahl = (
    <label className={styles.sprache}>
      {t.sprache}
      <select value={sprache} onChange={(e) => setSprache(e.target.value as Sprache)}>
        {SPRACHEN.map((s) => (
          <option key={s} value={s}>{SPRACHNAMEN[s]}</option>
        ))}
      </select>
    </label>
  );

  if (antwort?.ok) {
    return (
      <>
        {kopf}
        {sprachWahl}
        <div className={styles.danke} role="status">
          <h2>{t.danke}</h2>
          <p>{t.antragsnummer} <strong>{antwort.antragsnummer}</strong>. {t.aufbewahren}</p>
          <p>{t.meldung} {t.keineZusage}</p>
        </div>
      </>
    );
  }

  return (
    <>
      {kopf}
      {sprachWahl}
      <form className={styles.form} onSubmit={onSubmit} noValidate lang={sprache}>
        <fieldset className={styles.fieldset}>
          <legend>{t.wer}</legend>
          <label className={styles.option}>
            <input type="radio" name="art" value="kurum" checked={art === 'kurum'} onChange={() => setArt('kurum')} />
            {t.kurum}
          </label>
          <label className={styles.option}>
            <input type="radio" name="art" value="privat" checked={art === 'privat'} onChange={() => setArt('privat')} />
            {t.privat}
          </label>
        </fieldset>

        {art === 'kurum' ? (
          <label className={styles.feld}>
            {t.organisation}
            <input name="organisation" required minLength={2} maxLength={100} autoComplete="organization" />
          </label>
        ) : null}

        <label className={styles.feld}>
          {art === 'kurum' ? t.ansprechperson : t.vorname}
          <input name="name" required minLength={2} maxLength={100} autoComplete="name" />
        </label>

        <label className={styles.feld}>
          {t.email}
          <input name="email" type="email" required maxLength={100} autoComplete="email" />
        </label>

        <label className={styles.feld}>
          {t.plz}
          <input name="plz" inputMode="numeric" required pattern="\d{5}" maxLength={5} autoComplete="postal-code" placeholder={t.plzHinweis} />
        </label>

        <label className={styles.feld}>
          {t.geraeteart}
          <select name="geraeteart" required defaultValue="laptop">
            <option value="laptop">{t.laptop}</option>
            <option value="tablet">{t.tablet}</option>
            <option value="beides">{t.beides}</option>
          </select>
        </label>

        <label className={styles.feld}>
          {t.anzahl}
          <input name="anzahl" type="number" min={1} max={MAX_ANTRAG_GERAETE} defaultValue={1} required />
        </label>

        <label className={styles.feld}>
          {t.zweck}
          <textarea name="zweck" required minLength={10} maxLength={300} rows={3} />
        </label>

        {art === 'privat' ? (
          <fieldset className={styles.fieldset}>
            <legend>{t.nachweis}</legend>
            {NACHWEISE.filter((n): n is Exclude<Nachweis, 'einrichtung'> => n !== 'einrichtung').map((n) => (
              <label key={n} className={styles.option}>
                <input type="radio" name="nachweis" value={n} required />
                {t.nachweisOptionen[n]}
              </label>
            ))}
            <p className={styles.hinweis}>{t.nachweisHinweis}</p>
          </fieldset>
        ) : null}

        {/* Honeypot: hidden from people and screen readers, bots fill it. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <label className={styles.option}>
          <input type="checkbox" name="datenschutz" required />
          {t.datenschutz}
        </label>

        {antwort && !antwort.ok ? (
          <p role="alert" className={styles.fehler}>{fehlerText(antwort)}</p>
        ) : null}

        <button type="submit" className={styles.senden} disabled={sending || !key}>
          {sending ? t.sendet : t.senden}
        </button>
      </form>
    </>
  );
}
