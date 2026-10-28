import { getAppEnv } from '@/lib/env';
import { aktuelleSprache } from '@/lib/i18n/server';
import { UI } from '@/lib/i18n/ui';

// Shown on every page. The test site says it is a test; the live site says the platform is still being built.
export async function TestBanner() {
  const { lang } = await aktuelleSprache();
  const text = getAppEnv() === 'test' ? UI[lang].bannerTest : UI[lang].bannerLive;
  return (
    <div role="status" style={{ background: 'var(--brand-sun)', color: 'var(--ink)', textAlign: 'center', fontWeight: 700, padding: '6px 16px', fontSize: '0.9rem' }}>
      {text}
    </div>
  );
}
