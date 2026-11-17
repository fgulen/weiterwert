/** Hängt den aktuellen Ablaufschritt aus dem Formular an eine Weiterleitung an, damit die Seite im selben Schritt bleibt. */
export function schrittAnhang(form: FormData): string {
  const schritt = String(form.get('schritt') ?? '');
  return /^[a-z]+$/.test(schritt) ? `&schritt=${schritt}` : '';
}
