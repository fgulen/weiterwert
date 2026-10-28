import { headers } from 'next/headers';
import { istSprache, type Lang } from './sprache';

/** Language and path of the current request, as set by proxy.ts. German when nothing is set. */
export async function aktuelleSprache(): Promise<{ lang: Lang; rest: string }> {
  const kopf = await headers();
  const wert = kopf.get('x-lang');
  return { lang: istSprache(wert) ? wert : 'de', rest: kopf.get('x-pfad') ?? '/' };
}
