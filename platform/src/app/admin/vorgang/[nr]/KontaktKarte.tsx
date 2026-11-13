'use client';

import { useState, useTransition } from 'react';
import type { Kontakt, KontaktFehler } from '@/lib/absenden/anfrage';
import type { AdminTexte } from '@/lib/i18n/admin';
import type { Lang } from '@/lib/i18n/sprache';
import styles from '../../admin.module.css';
import { kontaktAendern } from './actions';

/** Contact details with a view and an edit mode. Device answers and declarations are not editable here. */
export default function KontaktKarte({ nummer, kontakt, t }: { nummer: string; kontakt: Kontakt; t: AdminTexte; lang: Lang }) {
  const FELDER: { key: keyof Kontakt; label: string; pflicht: boolean }[] = [
    { key: 'name', label: t.detail.kontaktName, pflicht: true },
    { key: 'email', label: t.detail.kontaktEmail, pflicht: true },
    { key: 'plz', label: t.detail.kontaktPlz, pflicht: true },
    { key: 'telefon', label: t.detail.kontaktTelefon, pflicht: false },
    { key: 'organisation', label: t.detail.kontaktOrganisation, pflicht: false },
  ];
  const [bearbeiten, setBearbeiten] = useState(false);
  const [werte, setWerte] = useState<Kontakt>(kontakt);
  const [fehler, setFehler] = useState<string | null>(null);
  const [feldFehler, setFeldFehler] = useState<KontaktFehler>({});
  const [gespeichert, setGespeichert] = useState(false);
  const [laeuft, starten] = useTransition();

  if (!bearbeiten) {
    return (
      <>
        <dl className={styles.angaben}>
          <dt>{t.detail.kontaktName}</dt><dd>{kontakt.name}</dd>
          <dt>{t.detail.kontaktEmail}</dt><dd>{kontakt.email}</dd>
          <dt>{t.detail.kontaktPlz}</dt><dd>{kontakt.plz}</dd>
          <dt>{t.detail.kontaktTelefon}</dt><dd>{kontakt.telefon || t.kontakt.keineAngabe}</dd>
          <dt>{t.detail.kontaktOrganisation}</dt><dd>{kontakt.organisation || t.kontakt.keineAngabe}</dd>
        </dl>
        {gespeichert && <p className={styles.erfolg} role="status">{t.detail.kontaktGespeichert}</p>}
        <div className={styles.aktionen} style={{ marginTop: 12 }}>
          <button type="button" className={styles.btnZweit} onClick={() => { setWerte(kontakt); setGespeichert(false); setBearbeiten(true); }}>
            {t.detail.kontaktBearbeiten}
          </button>
        </div>
      </>
    );
  }

  return (
    <form
      className={styles.formular}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setFehler(null);
        setFeldFehler({});
        starten(async () => {
          const r = await kontaktAendern(nummer, werte);
          if (r.ok) {
            setGespeichert(true);
            setBearbeiten(false);
            return;
          }
          setFehler(r.fehler ?? t.fehlerAllgemein);
          setFeldFehler(r.feldFehler ?? {});
        });
      }}
    >
      <div className={styles.zeilenPaar}>
        {FELDER.map((f) => (
          <div key={f.key} className={styles.feld}>
            <label htmlFor={`kontakt-${f.key}`}>{f.pflicht ? f.label : `${f.label} (${t.optional})`}</label>
            <input
              id={`kontakt-${f.key}`}
              className={styles.eingabe}
              value={werte[f.key]}
              required={f.pflicht}
              autoComplete="off"
              aria-invalid={feldFehler[f.key] ? true : undefined}
              onChange={(e) => setWerte((w) => ({ ...w, [f.key]: e.target.value }))}
            />
            {feldFehler[f.key] && <span className={styles.fehler}>{feldFehler[f.key]}</span>}
          </div>
        ))}
      </div>
      {fehler && <p role="alert" className={styles.fehlerBox}>{fehler}</p>}
      <div className={styles.aktionen}>
        <button type="submit" className="btn btn-primary" disabled={laeuft}>{laeuft ? t.wirdGespeichert : t.speichern}</button>
        <button type="button" className={styles.btnZweit} disabled={laeuft} onClick={() => { setBearbeiten(false); setFehler(null); setFeldFehler({}); }}>
          {t.abbrechen}
        </button>
      </div>
    </form>
  );
}
