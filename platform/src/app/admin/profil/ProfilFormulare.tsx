'use client';

import { useActionState, useState, useTransition } from 'react';
import { PasswortFeld } from '@/components/PasswortFeld';
import { mfaBestaetigen, mfaEntfernen, mfaStarten, passwortAendern, type Ergebnis } from './actions';
import styles from '../admin.module.css';

const LEER: Ergebnis = {};

function Meldung({ e }: { e: Ergebnis }) {
  if (e.fehler) return <p role="alert" className={styles.fehler}>{e.fehler}</p>;
  if (e.ok) return <p role="status" className={styles.erfolg}>{e.ok}</p>;
  return null;
}

function CodeFeld({ id }: { id: string }) {
  return (
    <label className={styles.feld} htmlFor={id}>
      Code aus der Authenticator-App
      <input id={id} name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]*" maxLength={7} required className={styles.eingabe} />
    </label>
  );
}

export function PasswortFormular({ mitCode }: { mitCode: boolean }) {
  const [e, aktion, laeuft] = useActionState(passwortAendern, LEER);
  return (
    <form action={aktion} className={styles.formular}>
      <PasswortFeld name="aktuell" label="Aktuelles Passwort" autoComplete="current-password" />
      <PasswortFeld name="neu" label="Neues Passwort (mindestens 12 Zeichen)" autoComplete="new-password" />
      <PasswortFeld name="wiederholung" label="Neues Passwort wiederholen" autoComplete="new-password" />
      {mitCode && <CodeFeld id="pw-code" />}
      <Meldung e={e} />
      <button type="submit" className="btn btn-primary" disabled={laeuft}>Passwort ändern</button>
    </form>
  );
}

export function MfaBereich({ faktorId, verifiziert }: { faktorId: string | null; verifiziert: boolean }) {
  const [start, setStart] = useState<Ergebnis>(LEER);
  const [wartet, starte] = useTransition();
  const [bestaetigt, bestaetigeAktion, laeuftB] = useActionState(mfaBestaetigen, LEER);
  const [entfernt, entferneAktion, laeuftE] = useActionState(mfaEntfernen, LEER);

  if (verifiziert && faktorId) {
    if (entfernt.ok) return <Meldung e={entfernt} />;
    return (
      <>
        <p><strong>Eingerichtet.</strong> Eine Authenticator-App ist mit diesem Konto verbunden.</p>
        <p className={styles.meta}>Zum Entfernen bitte einen aktuellen Code eingeben.</p>
        <form action={entferneAktion} className={styles.formular}>
          <input type="hidden" name="faktor" value={faktorId} />
          <CodeFeld id="mfa-entf" />
          <Meldung e={entfernt} />
          <button type="submit" className="btn" disabled={laeuftE}>Zwei-Faktor-Anmeldung entfernen</button>
        </form>
      </>
    );
  }

  const ein = start.einrichtung;
  if (bestaetigt.ok) return <Meldung e={bestaetigt} />;

  if (!ein) {
    return (
      <>
        <p>Noch nicht eingerichtet. Die Anmeldung ist vorerst auch ohne zweiten Faktor möglich.</p>
        <Meldung e={start} />
        <button type="button" className="btn btn-primary" disabled={wartet} onClick={() => starte(async () => setStart(await mfaStarten()))}>
          Zwei-Faktor-Anmeldung einrichten
        </button>
      </>
    );
  }

  return (
    <>
      <ol className={styles.schritte}>
        <li>Authenticator-App öffnen (z. B. Google Authenticator, Aegis, 2FAS).</li>
        <li>QR-Code scannen oder den Schlüssel von Hand eingeben.</li>
        <li>Den 6-stelligen Code unten eingeben.</li>
      </ol>
      {ein.qr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ein.qr} alt="QR-Code zum Einrichten der Authenticator-App" width={200} height={200} className={styles.qr} />
      )}
      <p className={styles.meta}>Schlüssel zur Handeingabe:</p>
      <code className={styles.schluessel}>{ein.secret}</code>
      <form action={bestaetigeAktion} className={styles.formular}>
        <input type="hidden" name="faktor" value={ein.faktorId} />
        <CodeFeld id="mfa-neu" />
        <Meldung e={bestaetigt} />
        <button type="submit" className="btn btn-primary" disabled={laeuftB}>Code bestätigen</button>
      </form>
    </>
  );
}
