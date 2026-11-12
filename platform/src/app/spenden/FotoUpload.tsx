'use client';

import { useId, useState } from 'react';
import type { CheckTexte } from '@/lib/i18n/check';

/** Optional photos after the request was saved. Sent to the API route; the server checks and cleans every file. */
export function FotoUpload({ idempotencyKey, t }: { idempotencyKey: string; t: CheckTexte }) {
  const id = useId();
  const [dateien, setDateien] = useState<File[]>([]);
  const [status, setStatus] = useState<'bereit' | 'sendet' | 'fertig' | 'fehler'>('bereit');
  const [meldung, setMeldung] = useState<string | null>(null);

  async function senden() {
    if (dateien.length === 0) return;
    setStatus('sendet');
    setMeldung(null);
    const fd = new FormData();
    fd.set('idempotencyKey', idempotencyKey);
    for (const f of dateien) fd.append('foto', f);
    try {
      const res = await fetch('/api/spenden/foto', { method: 'POST', body: fd });
      const data = (await res.json()) as { ok?: boolean; fehler?: string };
      if (res.ok && data.ok) {
        setStatus('fertig');
        setDateien([]);
      } else {
        setStatus('fehler');
        setMeldung(data.fehler ?? t.fotoFehler);
      }
    } catch {
      setStatus('fehler');
      setMeldung(t.fotoFehler);
    }
  }

  if (status === 'fertig') return <p role="status">{t.fotoFertig}</p>;

  return (
    <section aria-labelledby={`${id}-titel`} style={{ marginTop: 16 }}>
      <h3 id={`${id}-titel`}>{t.fotoTitel}</h3>
      <p>{t.fotoText}</p>
      <label style={{ display: 'grid', gap: 6, maxWidth: 420 }}>
        {t.fotoWaehlen}
        <input
          type="file"
          accept="image/jpeg,image/png"
          multiple
          onChange={(e) => setDateien(Array.from(e.target.files ?? []).slice(0, 3))}
          style={{ minHeight: 44 }}
        />
      </label>
      {dateien.length > 0 && <p>{dateien.map((f) => f.name).join(', ')}</p>}
      {meldung && <p role="alert">{meldung}</p>}
      <button type="button" className="btn" onClick={senden} disabled={dateien.length === 0 || status === 'sendet'} style={{ marginTop: 8 }}>
        {t.fotoSenden}
      </button>
    </section>
  );
}
