'use client';

import { useId, useState } from 'react';

// Small eye icon; the open eye means "password is shown". Name and state are given to screen readers.
function Auge({ offen }: { offen: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {!offen && <path d="M3 3l18 18" />}
    </svg>
  );
}

/** Password field with an eye button to show or hide the typed password. */
export function PasswortFeld({ name, label, autoComplete }: { name: string; label: string; autoComplete: string }) {
  const [sichtbar, setSichtbar] = useState(false);
  const id = useId();
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <label htmlFor={id}>{label}</label>
      <span style={{ display: 'flex', gap: 8 }}>
        <input
          id={id}
          name={name}
          type={sichtbar ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          style={{ flex: 1, minHeight: 44, padding: '8px 12px', font: 'inherit' }}
        />
        <button
          type="button"
          aria-label={sichtbar ? 'Passwort verbergen' : 'Passwort anzeigen'}
          aria-pressed={sichtbar}
          title={sichtbar ? 'Passwort verbergen' : 'Passwort anzeigen'}
          onClick={() => setSichtbar((v) => !v)}
          style={{ minWidth: 44, minHeight: 44, display: 'grid', placeItems: 'center', border: '1px solid var(--line-strong)', borderRadius: 10, background: 'var(--surface)', color: 'var(--muted)', cursor: 'pointer' }}
        >
          <Auge offen={sichtbar} />
        </button>
      </span>
    </div>
  );
}
