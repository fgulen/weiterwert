'use client';

import { useState, useTransition } from 'react';
import styles from '../../admin.module.css';
import { mit, type AdminTexte } from '@/lib/i18n/admin';
import { vorgangLoeschen } from './actions';

/** Two steps, no browser dialog: first the warning, then the explicit delete button. */
export default function LoeschenBereich({ nummer, fotos, t }: { nummer: string; fotos: number; t: AdminTexte }) {
  const [offen, setOffen] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, starten] = useTransition();

  if (!offen) {
    return (
      <div className={styles.aktionen}>
        <button type="button" className={styles.btnGefahr} onClick={() => setOffen(true)}>{t.detail.loeschenAufrufen}</button>
      </div>
    );
  }

  const fotoZusatz = fotos === 0 ? '' : fotos === 1 ? t.detail.loeschenFotoEins : mit(t.detail.loeschenFotoMehr, { n: fotos });

  return (
    <div className={styles.gefahrKarte} role="group" aria-labelledby="loeschen-titel">
      <h2 id="loeschen-titel">{t.detail.loeschenFrage}</h2>
      <p>{mit(t.detail.loeschenText, { fotos: fotoZusatz })}</p>
      {fehler && <p role="alert" className={styles.fehlerBox}>{fehler}</p>}
      <div className={styles.aktionen}>
        <button
          type="button"
          className={styles.btnGefahrFest}
          disabled={laeuft}
          onClick={() => {
            setFehler(null);
            starten(async () => {
              const r = await vorgangLoeschen(nummer);
              // On success the action redirects to the list; only errors come back here.
              if (r?.fehler) setFehler(r.fehler);
            });
          }}
        >
          {laeuft ? t.detail.loeschenLaeuft : t.detail.loeschenBestaetigen}
        </button>
        <button type="button" className={styles.btnZweit} disabled={laeuft} onClick={() => setOffen(false)}>{t.abbrechen}</button>
      </div>
    </div>
  );
}
