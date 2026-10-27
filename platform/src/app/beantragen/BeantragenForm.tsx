'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { MAX_ANTRAG_GERAETE, NACHWEISE, type Antragsart, type Nachweis } from '@/lib/antrag/antrag';
import { sendeAntrag, type AntragAntwort } from './actions';
import styles from './beantragen.module.css';

const NACHWEIS_TEXT: Record<Exclude<Nachweis, 'einrichtung'>, string> = {
  buergergeld: 'Bürgergeld (SGB II): Leistungsbescheid oder Kurzbescheinigung',
  sozialhilfe: 'Sozialhilfe (SGB XII): Leistungsbescheid',
  wohngeld: 'Wohngeld: Wohngeldbescheid',
  bvg_bkgg: 'BVG (§ 27a) oder BKGG (§ 6a): Bescheid',
};

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
  const [art, setArt] = useState<Antragsart>('kurum');
  const [sending, setSending] = useState(false);
  const [antwort, setAntwort] = useState<AntragAntwort | null>(null);

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

  if (antwort?.ok) {
    return (
      <div className={styles.danke} role="status">
        <h2>Vielen Dank.</h2>
        <p>Ihre Antragsnummer ist <strong>{antwort.antragsnummer}</strong>. Bitte bewahren Sie sie auf.</p>
        <p>Wir melden uns per E-Mail. Eine Zusage können wir nicht garantieren.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <fieldset className={styles.fieldset}>
        <legend>Wer stellt den Antrag?</legend>
        <label className={styles.option}>
          <input type="radio" name="art" value="kurum" checked={art === 'kurum'} onChange={() => setArt('kurum')} />
          Einrichtung (Schule, Sozialdienst, Verein)
        </label>
        <label className={styles.option}>
          <input type="radio" name="art" value="privat" checked={art === 'privat'} onChange={() => setArt('privat')} />
          Privatperson
        </label>
      </fieldset>

      {art === 'kurum' ? (
        <label className={styles.feld}>
          Name der Einrichtung
          <input name="organisation" required minLength={2} maxLength={100} autoComplete="organization" />
        </label>
      ) : null}

      <label className={styles.feld}>
        {art === 'kurum' ? 'Ansprechperson' : 'Vorname (oder Kürzel)'}
        <input name="name" required minLength={2} maxLength={100} autoComplete="name" />
      </label>

      <label className={styles.feld}>
        E-Mail-Adresse
        <input name="email" type="email" required maxLength={100} autoComplete="email" />
      </label>

      <label className={styles.feld}>
        Postleitzahl (für die Region, keine genaue Anschrift)
        <input name="plz" inputMode="numeric" required pattern="\d{5}" maxLength={5} autoComplete="postal-code" />
      </label>

      <label className={styles.feld}>
        Gerätart
        <select name="geraeteart" required defaultValue="laptop">
          <option value="laptop">Laptop</option>
          <option value="tablet">Tablet</option>
          <option value="beides">Beides</option>
        </select>
      </label>

      <label className={styles.feld}>
        Anzahl (1 bis {MAX_ANTRAG_GERAETE})
        <input name="anzahl" type="number" min={1} max={MAX_ANTRAG_GERAETE} defaultValue={1} required />
      </label>

      <label className={styles.feld}>
        Verwendungszweck (ein Satz)
        <textarea name="zweck" required minLength={10} maxLength={300} rows={3} />
      </label>

      {art === 'privat' ? (
        <fieldset className={styles.fieldset}>
          <legend>Nachweis (einer, nur der erste Bescheid-Teil mit Name und Zeitraum)</legend>
          {NACHWEISE.filter((n): n is Exclude<Nachweis, 'einrichtung'> => n !== 'einrichtung').map((n) => (
            <label key={n} className={styles.option}>
              <input type="radio" name="nachweis" value={n} required />
              {NACHWEIS_TEXT[n]}
            </label>
          ))}
          <p className={styles.hinweis}>
            Eine Datei können Sie hier noch nicht hochladen. Wir melden uns, sobald der Upload verfügbar ist. Bitte schwärzen Sie vorher alle Angaben außer Ihrem Namen und dem Zeitraum.
          </p>
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
        Ich habe den Datenschutzhinweis zu dieser Anfrage gelesen.
      </label>

      {antwort && !antwort.ok ? (
        <p role="alert" className={styles.fehler}>{antwort.fehler}</p>
      ) : null}

      <button type="submit" className={styles.senden} disabled={sending || !key}>
        {sending ? 'Wird gesendet …' : 'Antrag senden'}
      </button>
    </form>
  );
}
