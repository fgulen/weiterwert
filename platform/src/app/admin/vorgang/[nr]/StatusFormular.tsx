'use client';

import { useState, useTransition } from 'react';
import { statusAendern } from './actions';
import { statusText } from '@/lib/admin/anzeige';

export default function StatusFormular({ nummer, naechste }: { nummer: string; naechste: string[] }) {
  const [fehler, setFehler] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState(false);
  const [laeuft, starten] = useTransition();

  if (naechste.length === 0) {
    return <p>Dieser Vorgang ist abgeschlossen. Ein Statuswechsel ist nicht mehr möglich.</p>;
  }

  return (
    <form
      style={{ display: 'grid', gap: 12, maxWidth: 420 }}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const nach = String(fd.get('nach') ?? '');
        setFehler(null);
        setErfolg(false);
        starten(async () => {
          const r = await statusAendern(nummer, nach);
          if (r.ok) setErfolg(true);
          else setFehler(r.fehler ?? 'Das hat nicht geklappt.');
        });
      }}
    >
      <label style={{ display: 'grid', gap: 6 }}>
        Nächster Status
        <select name="nach" defaultValue={naechste[0]} style={{ minHeight: 44, padding: '8px 12px', font: 'inherit' }}>
          {naechste.map((s) => (
            <option key={s} value={s}>{statusText(s)}</option>
          ))}
        </select>
      </label>
      {fehler && <p role="alert">{fehler}</p>}
      {erfolg && <p role="status">Der Status wurde geändert. Bitte Seite neu laden, um die Anzeige zu aktualisieren.</p>}
      <button type="submit" className="btn btn-primary" disabled={laeuft}>Status ändern</button>
    </form>
  );
}
