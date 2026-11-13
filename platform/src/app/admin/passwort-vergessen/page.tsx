import type { Metadata } from 'next';
import { FeatureGate } from '@/components/FeatureGate';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import { aktuelleSprache } from '@/lib/i18n/server';
import ResetFormular from './Formular';

const TITLE = pageTitle('/admin');
export const metadata: Metadata = { title: TITLE, robots: { index: false } };

export default async function PasswortVergessenSeite() {
  gatePage('admin');
  const { lang } = await aktuelleSprache();
  return (
    <FeatureGate feature="admin">
      <ResetFormular lang={lang} />
    </FeatureGate>
  );
}
