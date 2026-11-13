'use client';

import { useState, useTransition } from 'react';
import { statusAendern } from './actions';
import { statusText } from '@/lib/admin/anzeige';
import { mit, type AdminTexte } from '@/lib/i18n/admin';
import type { Lang } from '@/lib/i18n/sprache';
import styles from '../../admin.module.css';

export default function StatusFormular({ nummer, naechste, t, lang }: { nummer: string; naechste: string[]; t: AdminTexte; lang: Lang }) {
  const [fehler, setFehler] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState(false);
  const [laeuft, starten] = useTransition();
  const [gewaehlt, setGewaehlt] = useState(naechste[0] ?? '');

  if (naechste.length === 0) {
    return <p className={styles.meta}>{t.detail.statusAbgeschlossen}</p>;
  }

  const senden = (nach: string) => {
    setFehler(null);
    setErfolg(false);
    starten(async () => {
      const r = await statusAendern(nummer, nach);
      if (r.ok) setErfolg(true);
      else setFehler(r.fehler ?? t.fehlerAllgemein);
    });
  };

  // One possible next step: one button. Several: a choice first.
  if (naechste.length === 1) {
    return (
      <div className={styles.formular}>
        <button type="button" className="btn btn-primary" disabled={laeuft} onClick={() => senden(naechste[0])}>
          {laeuft ? t.wirdGespeichert : mit(t.detail.statusMarkieren, { status: statusText(naechste[0], lang) })}
        </button>
        {fehler && <p role="alert" className={styles.fehlerBox}>{fehler}</p>}
        {erfolg && <p role="status" className={styles.erfolg}>{t.detail.statusGeaendert}</p>}
      </div>
    );
  }

  return (
    <form className={styles.formular} onSubmit={(e) => { e.preventDefault(); senden(gewaehlt); }}>
      <label className={styles.feld}>
        {t.detail.naechsterStatus}
        <select className={styles.eingabe} value={gewaehlt} onChange={(e) => setGewaehlt(e.target.value)}>
          {naechste.map((s) => (
            <option key={s} value={s}>{statusText(s, lang)}</option>
          ))}
        </select>
      </label>
      {fehler && <p role="alert" className={styles.fehlerBox}>{fehler}</p>}
      {erfolg && <p role="status" className={styles.erfolg}>{t.detail.statusGeaendert}</p>}
      <button type="submit" className="btn btn-primary" disabled={laeuft}>{t.detail.statusAendern}</button>
    </form>
  );
}
