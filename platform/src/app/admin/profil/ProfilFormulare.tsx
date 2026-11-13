'use client';

import { useActionState, useState, useTransition } from 'react';
import { PasswortFeld } from '@/components/PasswortFeld';
import type { AdminTexte } from '@/lib/i18n/admin';
import { mfaBestaetigen, mfaEntfernen, mfaStarten, passwortAendern, type Ergebnis } from './actions';
import styles from '../admin.module.css';

const LEER: Ergebnis = {};

function Meldung({ e }: { e: Ergebnis }) {
  if (e.fehler) return <p role="alert" className={styles.fehler}>{e.fehler}</p>;
  if (e.ok) return <p role="status" className={styles.erfolg}>{e.ok}</p>;
  return null;
}

function CodeFeld({ id, t }: { id: string; t: AdminTexte }) {
  return (
    <label className={styles.feld} htmlFor={id}>
      {t.konto.pwCode}
      <input id={id} name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]*" maxLength={7} required className={styles.eingabe} />
    </label>
  );
}

export function PasswortFormular({ mitCode, t }: { mitCode: boolean; t: AdminTexte }) {
  const [e, aktion, laeuft] = useActionState(passwortAendern, LEER);
  return (
    <form action={aktion} className={styles.formular}>
      <PasswortFeld name="aktuell" label={t.konto.pwAktuell} autoComplete="current-password" anzeigen={t.passwortAnzeigen} verbergen={t.passwortVerbergen} />
      <PasswortFeld name="neu" label={t.konto.pwNeu} autoComplete="new-password" anzeigen={t.passwortAnzeigen} verbergen={t.passwortVerbergen} />
      <PasswortFeld name="wiederholung" label={t.konto.pwWiederholung} autoComplete="new-password" anzeigen={t.passwortAnzeigen} verbergen={t.passwortVerbergen} />
      {mitCode && <CodeFeld id="pw-code" t={t} />}
      <Meldung e={e} />
      <button type="submit" className="btn btn-primary" disabled={laeuft}>{t.konto.pwAendern}</button>
    </form>
  );
}

export function MfaBereich({ faktorId, verifiziert, t }: { faktorId: string | null; verifiziert: boolean; t: AdminTexte }) {
  const [start, setStart] = useState<Ergebnis>(LEER);
  const [wartet, starte] = useTransition();
  const [bestaetigt, bestaetigeAktion, laeuftB] = useActionState(mfaBestaetigen, LEER);
  const [entfernt, entferneAktion, laeuftE] = useActionState(mfaEntfernen, LEER);

  if (verifiziert && faktorId) {
    if (entfernt.ok) return <Meldung e={entfernt} />;
    return (
      <>
        <p><strong>{t.konto.mfaEingerichtet}</strong> {t.konto.mfaVerbunden}</p>
        <p className={styles.meta}>{t.konto.mfaEntfernenHinweis}</p>
        <form action={entferneAktion} className={styles.formular}>
          <input type="hidden" name="faktor" value={faktorId} />
          <CodeFeld id="mfa-entf" t={t} />
          <Meldung e={entfernt} />
          <button type="submit" className="btn" disabled={laeuftE}>{t.konto.mfaEntfernen}</button>
        </form>
      </>
    );
  }

  const ein = start.einrichtung;
  if (bestaetigt.ok) return <Meldung e={bestaetigt} />;

  if (!ein) {
    return (
      <>
        <p>{t.konto.mfaNichtEingerichtet}</p>
        <Meldung e={start} />
        <button type="button" className="btn btn-primary" disabled={wartet} onClick={() => starte(async () => setStart(await mfaStarten()))}>
          {t.konto.mfaEinrichten}
        </button>
      </>
    );
  }

  return (
    <>
      <ol className={styles.schritte}>
        <li>{t.konto.mfaSchritt1}</li>
        <li>{t.konto.mfaSchritt2}</li>
        <li>{t.konto.mfaSchritt3}</li>
      </ol>
      {ein.qr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ein.qr} alt={t.konto.mfaQrAlt} width={200} height={200} className={styles.qr} />
      )}
      <p className={styles.meta}>{t.konto.mfaSchluessel}</p>
      <code className={styles.schluessel}>{ein.secret}</code>
      <form action={bestaetigeAktion} className={styles.formular}>
        <input type="hidden" name="faktor" value={ein.faktorId} />
        <CodeFeld id="mfa-neu" t={t} />
        <Meldung e={bestaetigt} />
        <button type="submit" className="btn btn-primary" disabled={laeuftB}>{t.konto.mfaBestaetigen}</button>
      </form>
    </>
  );
}
