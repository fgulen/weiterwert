'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore, useTransition } from 'react';
import { neuesPasswort } from './actions';
import { adminTexte } from '@/lib/i18n/admin';
import { pfadFuer, type Lang } from '@/lib/i18n/sprache';

/** Reads the recovery token from the URL fragment (the browser never sends it to the server). */
function tokenAusAdresse(): string | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const token = params.get('access_token');
  return params.get('type') === 'recovery' && token ? token : null;
}

const nichtsZuAbonnieren = () => () => {};

export default function NeuesPasswortFormular({ lang }: { lang: Lang }) {
  const t = adminTexte(lang);
  const p = (rest: string) => pfadFuer(lang, rest);
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
        <p role="status">{t.reset.fertig}</p>
        <p><Link href={p('/admin/login')}>{t.reset.zurAnmeldung}</Link></p>
      </>
    );
  }
  if (!token) {
    return (
      <>
        <p role="alert">{t.reset.linkUngueltig}</p>
        <p><Link href={p('/admin/passwort-vergessen')}>{t.reset.linkAnfordern}</Link></p>
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
          else setFehler(r.fehler ?? t.fehlerAllgemein);
        });
      }}
    >
      <label style={{ display: 'grid', gap: 6 }}>
        {t.reset.feldNeu}
        <input name="neu" type="password" autoComplete="new-password" required minLength={12} style={{ minHeight: 44, padding: '8px 12px', font: 'inherit' }} />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        {t.reset.feldWiederholung}
        <input name="wiederholung" type="password" autoComplete="new-password" required minLength={12} style={{ minHeight: 44, padding: '8px 12px', font: 'inherit' }} />
      </label>
      <p style={{ margin: 0, color: 'var(--muted)' }}>{t.reset.regel}</p>
      {fehler && <p role="alert">{fehler}</p>}
      <button type="submit" className="btn btn-primary" disabled={laeuft}>{t.reset.speichern}</button>
    </form>
  );
}
