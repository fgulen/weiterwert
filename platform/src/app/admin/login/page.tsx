import type { Metadata } from 'next';
import { FeatureGate } from '@/components/FeatureGate';
import { PasswortFeld } from '@/components/PasswortFeld';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import { anmelden } from '../actions';

const TITLE = pageTitle('/admin');
export const metadata: Metadata = { title: TITLE, robots: { index: false } };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ fehler?: string }> }) {
  gatePage('admin');
  const { fehler } = await searchParams;
  return (
    <>
      <h1>Anmeldung Verwaltung</h1>
      <FeatureGate feature="admin">
        {fehler && <p role="alert">E-Mail oder Passwort ist nicht richtig.</p>}
        <form action={anmelden} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            E-Mail
            <input name="email" type="email" autoComplete="username" required style={{ minHeight: 44, padding: '8px 12px', font: 'inherit' }} />
          </label>
          <PasswortFeld name="passwort" label="Passwort" autoComplete="current-password" />
          <button type="submit" className="btn btn-primary">Anmelden</button>
        </form>
      </FeatureGate>
    </>
  );
}
