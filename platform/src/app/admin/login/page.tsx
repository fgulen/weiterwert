import type { Metadata } from 'next';
import Link from 'next/link';
import { FeatureGate } from '@/components/FeatureGate';
import { PasswortFeld } from '@/components/PasswortFeld';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import { aktuelleSprache } from '@/lib/i18n/server';
import { adminTexte } from '@/lib/i18n/admin';
import { pfadFuer } from '@/lib/i18n/sprache';
import { anmelden } from '../actions';

const TITLE = pageTitle('/admin');
export const metadata: Metadata = { title: TITLE, robots: { index: false } };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ fehler?: string; email?: string }> }) {
  gatePage('admin');
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  const { fehler, email } = await searchParams;
  const emailWert = typeof email === 'string' ? email.slice(0, 200) : '';
  return (
    <>
      <h1>{t.login.titel}</h1>
      <FeatureGate feature="admin">
        {fehler && <p role="alert">{t.login.fehler}</p>}
        <form action={anmelden} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            {t.login.email}
            <input name="email" type="email" autoComplete="username" required defaultValue={emailWert} style={{ minHeight: 44, padding: '8px 12px', font: 'inherit' }} />
          </label>
          <PasswortFeld name="passwort" label={t.login.passwort} autoComplete="current-password" anzeigen={t.passwortAnzeigen} verbergen={t.passwortVerbergen} />
          <button type="submit" className="btn btn-primary">{t.login.anmelden}</button>
        </form>
        <p><Link href={pfadFuer(lang, '/admin/passwort-vergessen')}>{t.login.vergessen}</Link></p>
      </FeatureGate>
    </>
  );
}
