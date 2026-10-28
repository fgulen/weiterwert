import type { Metadata } from 'next';
import { FeatureGate } from '@/components/FeatureGate';
import { aktuelleSprache } from '@/lib/i18n/server';
import { SEITEN } from '@/lib/i18n/seiten';
import { gatePage } from '@/lib/page-gate';

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await aktuelleSprache();
  return { title: SEITEN[lang].partner.titel };
}

export default async function GeraetepartnerschaftPage() {
  const { lang } = await aktuelleSprache();
  const t = SEITEN[lang].partner;
  gatePage('geraetepartnerschaft');
  return (
    <>
      <h1>{t.titel}</h1>
      <FeatureGate feature="geraetepartnerschaft">
        <p className="lead">{t.lead}</p>
      </FeatureGate>
    </>
  );
}
