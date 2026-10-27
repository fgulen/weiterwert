import { getAppEnv } from '@/lib/env';

// Shown on every page. The test site says it is a test; the live site says the platform is still being built.
const TEXT = {
  test: 'Testumgebung – keine echten Spenden',
  production: 'Im Aufbau – wir prüfen jede Anfrage von Hand.',
} as const;

export function TestBanner() {
  const text = TEXT[getAppEnv()];
  return (
    <div role="status" style={{ background: 'var(--brand-sun)', color: 'var(--ink)', textAlign: 'center', fontWeight: 700, padding: '6px 16px', fontSize: '0.9rem' }}>
      {text}
    </div>
  );
}
