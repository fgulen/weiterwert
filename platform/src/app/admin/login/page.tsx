import type { Metadata } from 'next';
import { FeatureGate } from '@/components/FeatureGate';
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
          <label>
            E-Mail
            <input name="email" type="email" autoComplete="username" required style={{ display: 'block', width: '100%', minHeight: 44 }} />
          </label>
          <label>
            Passwort
            <input name="passwort" type="password" autoComplete="current-password" required style={{ display: 'block', width: '100%', minHeight: 44 }} />
          </label>
          <button type="submit" className="btn btn-primary">Anmelden</button>
        </form>
      </FeatureGate>
    </>
  );
}
