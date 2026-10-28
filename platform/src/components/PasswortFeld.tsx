'use client';

import { useState } from 'react';

/** Password field with a button to show or hide the typed password. */
export function PasswortFeld({ name, label, autoComplete }: { name: string; label: string; autoComplete: string }) {
  const [sichtbar, setSichtbar] = useState(false);
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      {label}
      <span style={{ display: 'flex', gap: 8 }}>
        <input
          name={name}
          type={sichtbar ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          style={{ flex: 1, minHeight: 44, padding: '8px 12px', font: 'inherit' }}
        />
        <button
          type="button"
          aria-pressed={sichtbar}
          onClick={() => setSichtbar((v) => !v)}
          className="btn"
          style={{ minHeight: 44, padding: '8px 14px' }}
        >
          {sichtbar ? 'Verbergen' : 'Anzeigen'}
        </button>
      </span>
    </label>
  );
}
