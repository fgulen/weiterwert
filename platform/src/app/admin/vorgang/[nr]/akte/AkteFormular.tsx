'use client';

import { useActionState } from 'react';
import type { AdminTexte } from '@/lib/i18n/admin';
import { LOESCHVERFAHREN, ZUSTAND, ENTSORGUNGSWEG, type GeraetAkte } from '@/lib/admin/akte';
import styles from '../../../admin.module.css';
import { akteSpeichern, type AkteErgebnis } from './actions';

const LEER: AkteErgebnis = {};

function Auswahl({ name, label, werte, wert }: { name: string; label: string; werte: readonly string[]; wert: string | null }) {
  return (
    <label className={styles.feld}>
      {label}
      <select name={name} defaultValue={wert ?? ''} className={styles.eingabe}>
        <option value="">–</option>
        {werte.map((w) => <option key={w} value={w}>{w}</option>)}
      </select>
    </label>
  );
}

export default function AkteFormular({ nummer, position, akte, t }: { nummer: string; position: number; akte: GeraetAkte; t: AdminTexte }) {
  const [e, aktion, laeuft] = useActionState(akteSpeichern.bind(null, nummer, position), LEER);
  const f = t.akte;
  return (
    <form action={aktion} className={styles.formular}>
      <div className={styles.zeilenPaar}>
        <label className={styles.feld}>{f.seriennummer}<input name="seriennummer" defaultValue={akte.seriennummer ?? ''} className={styles.eingabe} maxLength={100} /></label>
        <label className={styles.feld}>{f.lagerort}<input name="lagerort" defaultValue={akte.lagerort ?? ''} className={styles.eingabe} maxLength={100} /></label>
        <Auswahl name="zustand" label={f.zustand} werte={ZUSTAND} wert={akte.zustand} />
        <Auswahl name="loeschverfahren" label={f.loeschverfahren} werte={LOESCHVERFAHREN} wert={akte.loeschverfahren} />
        <label className={styles.feld}>{f.loeschdatum}<input name="loeschdatum" defaultValue={akte.loeschdatum ?? ''} className={styles.eingabe} placeholder="2026-11-13" /></label>
        <label className={styles.feld}>{f.loeschperson}<input name="loeschperson" defaultValue={akte.loeschperson ?? ''} className={styles.eingabe} maxLength={100} /></label>
        <Auswahl name="entsorgungsweg" label={f.entsorgungsweg} werte={ENTSORGUNGSWEG} wert={akte.entsorgungsweg} />
        <label className={styles.feld}>{f.entsorger}<input name="entsorger" defaultValue={akte.entsorger ?? ''} className={styles.eingabe} maxLength={150} /></label>
        <label className={styles.feld}>{f.nachweisnummer}<input name="nachweisnummer" defaultValue={akte.nachweisnummer ?? ''} className={styles.eingabe} maxLength={60} /></label>
        <label className={styles.feld}>{f.entsorgungsdatum}<input name="entsorgungsdatum" defaultValue={akte.entsorgungsdatum ?? ''} className={styles.eingabe} placeholder="2026-11-13" /></label>
      </div>
      {e.fehler && <p role="alert" className={styles.fehlerBox}>{e.fehler}</p>}
      {e.ok && <p role="status" className={styles.erfolg}>{e.ok}</p>}
      <div className={styles.aktionen}>
        <button type="submit" className="btn btn-primary" disabled={laeuft}>{f.speichern}</button>
      </div>
    </form>
  );
}
