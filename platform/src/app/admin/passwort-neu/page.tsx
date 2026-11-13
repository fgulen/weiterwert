import type { Metadata } from 'next';
import { FeatureGate } from '@/components/FeatureGate';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import { aktuelleSprache } from '@/lib/i18n/server';
import { adminTexte } from '@/lib/i18n/admin';
import NeuesPasswortFormular from './Formular';

const TITLE = pageTitle('/admin');
export const metadata: Metadata = { title: TITLE, robots: { index: false } };

export default async function PasswortNeuSeite() {
  gatePage('admin');
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  return (
    <>
      <h1>{t.reset.neuTitel}</h1>
      <FeatureGate feature="admin">
        <NeuesPasswortFormular lang={lang} />
      </FeatureGate>
    </>
  );
}
