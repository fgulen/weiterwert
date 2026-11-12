'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore, useTransition } from 'react';
import { neuesPasswort } from './actions';

/** Reads the recovery token from the URL fragment (the browser never sends it to the server). */
function tokenAusAdresse(): string | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const token = params.get('access_token');
  return params.get('type') === 'recovery' && token ? token : null;
}

const nichtsZuAbonnieren = () => () => {};

export default function NeuesPasswortFormular() {
  // false during server render and hydration, true after mounting; avoids a hydration mismatch.
  const geprueft = useSyncExternalStore(nichtsZuAbonnieren, () => true, () => false);
  const [token] = useState<string | null>(() => (typeof window === 'undefined' ? null : tokenAusAdresse()));
  const [fehler, setFehler] = useState<string | null>(null);
  const [fertig, setFertig] = useState(false);
  const [laeuft, starten] = useTransition();

  useEffect(() => {
    // Remove the token from the address bar once it has been read.
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);
  }, []);

  if (!geprueft) return null;
  if (fertig) {
    return (
      <>
        <p role="status">Das Passwort wurde geändert. Sie können sich jetzt anmelden.</p>
        <p><Link href="/admin/login">Zur Anmeldung</Link></p>
      </>
    );
  }
  if (!token) {
    return (
      <>
        <p role="alert">Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.</p>
        <p><Link href="/admin/passwort-vergessen">Neuen Link anfordern</Link></p>
      </>
    );
  }

  return (
    <form
      style={{ display: 'grid', gap: 12, maxWidth: 420 }}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setFehler(null);
        starten(async () => {
          const r = await neuesPasswort(token, String(fd.get('neu') ?? ''), String(fd.get('wiederholung') ?? ''));
          if (r.ok) setFertig(true);
          else setFehler(r.fehler ?? 'Das hat nicht geklappt.');
        });
      }}
    >
      <label style={{ display: 'grid', gap: 6 }}>
        Neues Passwort
        <input name="neu" type="password" autoComplete="new-password" required minLength={12} style={{ minHeight: 44, padding: '8px 12px', font: 'inherit' }} />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        Passwort wiederholen
        <input name="wiederholung" type="password" autoComplete="new-password" required minLength={12} style={{ minHeight: 44, padding: '8px 12px', font: 'inherit' }} />
      </label>
      <p style={{ margin: 0, color: 'var(--muted)' }}>Mindestens 12 Zeichen, Groß- und Kleinbuchstaben sowie eine Ziffer.</p>
      {fehler && <p role="alert">{fehler}</p>}
      <button type="submit" className="btn btn-primary" disabled={laeuft}>Passwort speichern</button>
    </form>
  );
}
