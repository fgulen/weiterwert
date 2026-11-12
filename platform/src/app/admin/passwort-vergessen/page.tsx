import type { Metadata } from 'next';
import { FeatureGate } from '@/components/FeatureGate';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import ResetFormular from './Formular';

const TITLE = pageTitle('/admin');
export const metadata: Metadata = { title: TITLE, robots: { index: false } };

export default function PasswortVergessenSeite() {
  gatePage('admin');
  return (
    <FeatureGate feature="admin">
      <ResetFormular />
    </FeatureGate>
  );
}
