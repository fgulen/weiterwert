/** Hängt den aktuellen Ablaufschritt aus dem Formular an eine Weiterleitung an, damit die Seite im selben Schritt bleibt. */
export function schrittAnhang(form: FormData): string {
  const schritt = String(form.get('schritt') ?? '');
  return /^[a-z]+$/.test(schritt) ? `&schritt=${schritt}` : '';
}

/** Anker auf den Abschnitt des Schritts, damit die Seite nach dem Speichern nicht nach oben springt. */
export function schrittAnker(form: FormData): string {
  const ziel: Record<string, string> = {
    annahme: 'annahme-titel',
    uebergabe: 'uebergabe-titel',
    loeschung: 'loeschung-titel',
    zweite: 'status-verlauf-titel',
    technik: 'status-verlauf-titel',
    eingang: 'status-verlauf-titel',
  };
  const schritt = String(form.get('schritt') ?? '');
  return ziel[schritt] ? `#${ziel[schritt]}` : '';
}
