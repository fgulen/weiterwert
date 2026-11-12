import type { Metadata } from 'next';
import { FeatureGate } from '@/components/FeatureGate';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import NeuesPasswortFormular from './Formular';

const TITLE = pageTitle('/admin');
export const metadata: Metadata = { title: TITLE, robots: { index: false } };

export default function PasswortNeuSeite() {
  gatePage('admin');
  return (
    <>
      <h1>Neues Passwort</h1>
      <FeatureGate feature="admin">
        <NeuesPasswortFormular />
      </FeatureGate>
    </>
  );
}
