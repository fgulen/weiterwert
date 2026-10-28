/** Turns the literal texts of a dictionary into a type with plain strings, so tr and en must have the same keys as de. */
export type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T;

/** All key paths of a dictionary (arrays by index and length), used by the tests to compare languages. */
export function pfade(wert: unknown, vorne = ''): string[] {
  if (typeof wert === 'string') return [vorne];
  if (Array.isArray(wert)) return [`${vorne}[${wert.length}]`, ...wert.flatMap((w, i) => pfade(w, `${vorne}[${i}]`))];
  if (wert && typeof wert === 'object') {
    return Object.entries(wert).flatMap(([k, w]) => pfade(w, vorne ? `${vorne}.${k}` : k));
  }
  return [vorne];
}

/** All strings of a dictionary. */
export function texte(wert: unknown): string[] {
  if (typeof wert === 'string') return [wert];
  if (Array.isArray(wert)) return wert.flatMap(texte);
  if (wert && typeof wert === 'object') return Object.values(wert).flatMap(texte);
  return [];
}
