import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FeatureGate } from '@/components/FeatureGate';
import { SITZUNG_COOKIE, aktuellerNutzer } from '@/lib/admin/session';
import { ladeKonto } from '@/lib/admin/konto';
import { gatePage } from '@/lib/page-gate';
import { aktuelleSprache } from '@/lib/i18n/server';
import { adminTexte, mit } from '@/lib/i18n/admin';
import { pfadFuer } from '@/lib/i18n/sprache';
import { MfaBereich, PasswortFormular } from './ProfilFormulare';
import styles from '../admin.module.css';

export const metadata: Metadata = { title: 'Mein Profil', robots: { index: false } };

export default async function ProfilPage() {
  gatePage('admin');
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  const nutzer = await aktuellerNutzer(); // verified with Supabase on every request
  if (!nutzer) redirect(pfadFuer(lang, '/admin/login'));
  const token = (await cookies()).get(SITZUNG_COOKIE)?.value;
  const konto = token ? await ladeKonto(token) : null;
  const faktor = konto?.faktoren.find((f) => f.status === 'verified') ?? null;

  return (
    <FeatureGate feature="admin">
      <div className={styles.seite}>
        <header className={styles.topBar}>
          <h1 className={styles.titel}>{t.konto.titel}</h1>
        </header>
        <p className={styles.meta}>
          {mit(t.konto.angemeldetAls, { email: nutzer.email })}{' '}
          <Link href={pfadFuer(lang, '/admin')}>{t.konto.zurueck}</Link>
        </p>
        <section className={styles.karte} aria-labelledby="pw-h">
          <h2 id="pw-h">{t.konto.pwTitel}</h2>
          <PasswortFormular mitCode={!!faktor} t={t} />
        </section>
        <section className={styles.karte} aria-labelledby="mfa-h">
          <h2 id="mfa-h">{t.konto.mfaTitel}</h2>
          <MfaBereich faktorId={faktor?.id ?? null} verifiziert={!!faktor} t={t} />
        </section>
      </div>
    </FeatureGate>
  );
}
