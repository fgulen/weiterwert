// Language of the site. German has no URL prefix (/spenden), Turkish and English do (/tr/spenden, /en/spenden).
export const SPRACHEN = ['de', 'tr', 'en'] as const;
export type Lang = (typeof SPRACHEN)[number];

export function istSprache(wert: unknown): wert is Lang {
  return typeof wert === 'string' && (SPRACHEN as readonly string[]).includes(wert);
}

/** Splits "/tr/spenden" into { lang: 'tr', rest: '/spenden' }. Anything else is German. */
export function trenneSprache(pfad: string): { lang: Lang; rest: string } {
  const treffer = pfad.match(/^\/(tr|en)(?=\/|$)/);
  if (!treffer) return { lang: 'de', rest: pfad || '/' };
  return { lang: treffer[1] as Lang, rest: pfad.slice(treffer[0].length) || '/' };
}

/** Builds the public path for a language, e.g. ('en', '/spenden') -> '/en/spenden'. */
export function pfadFuer(lang: Lang, rest: string): string {
  const r = rest || '/';
  if (lang === 'de') return r;
  return r === '/' ? `/${lang}` : `/${lang}${r}`;
}
