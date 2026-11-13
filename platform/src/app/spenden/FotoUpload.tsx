'use client';

import { useState } from 'react';
import { FOTO_MAX_ANZAHL, FOTO_MAX_BYTES } from '@/lib/fotos/bild';
import type { CheckTexte } from '@/lib/i18n/check';

/**
 * Photo picker for the summary step. The files are sent together with the request by GeraeteCheck,
 * one file per call. Files over 4 MB are left out and the donor is told why.
 */
export function FotoUpload({ dateien, onChange, t }: { dateien: File[]; onChange: (d: File[]) => void; t: CheckTexte }) {
  const [hinweis, setHinweis] = useState<string | null>(null);

  function waehle(liste: FileList | null) {
    const alle = Array.from(liste ?? []);
    const zuGross = alle.some((f) => f.size > FOTO_MAX_BYTES);
    setHinweis(zuGross ? t.fotoZuGross : null);
    onChange(alle.filter((f) => f.size > 0 && f.size <= FOTO_MAX_BYTES).slice(0, FOTO_MAX_ANZAHL));
  }

  return (
    <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
      <label style={{ display: 'grid', gap: 6, minWidth: 0 }}>
        {t.fotoWaehlen}
        <input type="file" accept="image/jpeg,image/png" multiple onChange={(e) => waehle(e.target.files)} style={{ minHeight: 44, width: '100%', maxWidth: '100%', minWidth: 0 }} />
      </label>
      {dateien.length > 0 && <p>{dateien.map((f) => f.name).join(', ')}</p>}
      {hinweis && <p role="alert">{hinweis}</p>}
    </div>
  );
}
