/**
 * Geräte-Ablauf und die digitalen Nachweise sind für alle Umgebungen sichtbar.
 * Entscheidung Fatih 2026-11-17: alles, was lokal entwickelt wurde, geht live.
 * Der Zugang bleibt durch die Admin-Anmeldung geschützt (Rolle admin oder mitarbeiter).
 */
export function ablaufSichtbar(): boolean {
  return true;
}
