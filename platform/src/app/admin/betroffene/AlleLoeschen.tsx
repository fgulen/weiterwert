'use client';

import { useState, useTransition } from 'react';
import type { AdminTexte } from '@/lib/i18n/admin';
import { mit } from '@/lib/i18n/admin';
import styles from '../admin.module.css';
import { alleLoeschen } from './actions';

/** Two steps, no browser dialog. */
export default function AlleLoeschen({ email, anzahl, t }: { email: string; anzahl: number; t: AdminTexte }) {
  const [offen, setOffen] = useState(false);
  const [ergebnis, setErgebnis] = useState<{ ok?: string; fehler?: string }>({});
  const [laeuft, starten] = useTransition();

  if (ergebnis.ok) return <p role="status" className={styles.erfolg}>{ergebnis.ok}</p>;

  if (!offen) {
    return (
      <div className={styles.aktionen}>
        <button type="button" className={styles.btnGefahr} onClick={() => setOffen(true)}>{t.betroffene.loeschenAlle}</button>
      </div>
    );
  }
  return (
    <div className={styles.gefahrKarte} role="group" aria-labelledby="alle-loeschen-titel">
      <h2 id="alle-loeschen-titel">{t.betroffene.loeschenFrage}</h2>
      <p>{mit(t.betroffene.loeschenText, { n: anzahl })}</p>
      {ergebnis.fehler && <p role="alert" className={styles.fehlerBox}>{ergebnis.fehler}</p>}
      <div className={styles.aktionen}>
        <button
          type="button"
          className={styles.btnGefahrFest}
          disabled={laeuft}
          onClick={() => starten(async () => setErgebnis(await alleLoeschen(email)))}
        >
          {laeuft ? t.detail.loeschenLaeuft : t.betroffene.loeschenBestaetigen}
        </button>
        <button type="button" className={styles.btnZweit} disabled={laeuft} onClick={() => setOffen(false)}>{t.abbrechen}</button>
      </div>
    </div>
  );
}
