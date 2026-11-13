'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { resetAnfordern, type ResetErgebnis } from './actions';
import { adminTexte } from '@/lib/i18n/admin';
import { pfadFuer, type Lang } from '@/lib/i18n/sprache';

const START: ResetErgebnis = {};

export default function ResetFormular({ lang }: { lang: Lang }) {
  const t = adminTexte(lang);
  const [stand, aktion, laeuft] = useActionState(resetAnfordern, START);
  return (
    <>
      <h1>{t.reset.vergessenTitel}</h1>
      {stand.gesendet ? (
        <p role="status">{t.reset.vergessenGesendet}</p>
      ) : (
        <form action={aktion} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            {t.login.email}
            <input name="email" type="email" autoComplete="username" required style={{ minHeight: 44, padding: '8px 12px', font: 'inherit' }} />
          </label>
          {stand.fehler && <p role="alert">{stand.fehler}</p>}
          <button type="submit" className="btn btn-primary" disabled={laeuft}>{t.reset.vergessenSenden}</button>
        </form>
      )}
      <p><Link href={pfadFuer(lang, '/admin/login')}>{t.zurAnmeldung}</Link></p>
    </>
  );
}
