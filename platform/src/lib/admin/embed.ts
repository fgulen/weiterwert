/**
 * PostgREST liefert eine eins-zu-eins-Beziehung (device_record ist je Gerät eindeutig) als Objekt,
 * eine Beziehung mit mehreren Zeilen als Liste. Diese Funktion liest beides gleich.
 */
export function ersterDatensatz<T>(wert: T[] | T | null | undefined): T | null {
  if (Array.isArray(wert)) return wert[0] ?? null;
  return wert ?? null;
}
