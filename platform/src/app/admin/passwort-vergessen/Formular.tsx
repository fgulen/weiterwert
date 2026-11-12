'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { resetAnfordern, type ResetErgebnis } from './actions';

const START: ResetErgebnis = {};

export default function ResetFormular() {
  const [stand, aktion, laeuft] = useActionState(resetAnfordern, START);
  return (
    <>
      <h1>Passwort vergessen</h1>
      {stand.gesendet ? (
        <p role="status">
          Wenn die Adresse zu einem Konto gehört, haben wir einen Link zum Zurücksetzen gesendet. Bitte prüfen Sie auch den Spam-Ordner.
        </p>
      ) : (
        <form action={aktion} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            E-Mail
            <input name="email" type="email" autoComplete="username" required style={{ minHeight: 44, padding: '8px 12px', font: 'inherit' }} />
          </label>
          {stand.fehler && <p role="alert">{stand.fehler}</p>}
          <button type="submit" className="btn btn-primary" disabled={laeuft}>Link senden</button>
        </form>
      )}
      <p><Link href="/admin/login">Zurück zur Anmeldung</Link></p>
    </>
  );
}
