import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FeatureGate } from '@/components/FeatureGate';
import { SITZUNG_COOKIE, aktuellerNutzer } from '@/lib/admin/session';
import { ladeKonto } from '@/lib/admin/konto';
import { gatePage } from '@/lib/page-gate';
import { MfaBereich, PasswortFormular } from './ProfilFormulare';
import styles from '../admin.module.css';

const TITLE = 'Mein Profil';
export const metadata: Metadata = { title: TITLE, robots: { index: false } };

export default async function ProfilPage() {
  gatePage('admin');
  const nutzer = await aktuellerNutzer(); // verified with Supabase on every request
  if (!nutzer) redirect('/admin/login');
  const token = (await cookies()).get(SITZUNG_COOKIE)?.value;
  const konto = token ? await ladeKonto(token) : null;
  const faktor = konto?.faktoren.find((f) => f.status === 'verified') ?? null;

  return (
    <>
      <h1>{TITLE}</h1>
      <FeatureGate feature="admin">
        <p className={styles.meta}>
          Angemeldet als {nutzer.email}. <Link href="/admin">Zurück zur Verwaltung</Link>
        </p>
        <section className={styles.karte} aria-labelledby="pw-h">
          <h2 id="pw-h">Passwort ändern</h2>
          <PasswortFormular mitCode={!!faktor} />
        </section>
        <section className={styles.karte} aria-labelledby="mfa-h">
          <h2 id="mfa-h">Zwei-Faktor-Anmeldung (Authenticator-App)</h2>
          <MfaBereich faktorId={faktor?.id ?? null} verifiziert={!!faktor} />
        </section>
      </FeatureGate>
    </>
  );
}
