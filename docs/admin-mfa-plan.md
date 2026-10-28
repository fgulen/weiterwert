# Admin-Zugang und MFA (Entwurf, noch nicht aktiv)

> Stand: 2026-10-29. Dieser Entwurf beschreibt den späteren Stand. Die Admin-Seite bleibt bis dahin verborgen (`admin` = „verborgen“ in `platform/src/lib/features.ts`).

## Bereits erledigt (Supabase, Projekt `weiterwert`)

- Öffentliche Registrierung ist aus (`disable_signup: true`). Test: `POST /auth/v1/signup` wird mit 422 abgelehnt.
- TOTP-MFA ist im Projekt aktiviert (`mfa_totp_enroll_enabled`, `mfa_totp_verify_enabled`).
- Testkonten (noch ohne MFA-Pflicht):
  - `admin@weiterwert.de`, Rolle `admin`
  - `mitarbeiter@weiterwert.com`, Rolle `mitarbeiter`
- Die Rolle steht in `app_metadata.role` des Benutzers. Nur der Server schreibt sie; Benutzer können sie nicht selbst ändern.

## Rollen

| Rolle | Rechte |
|---|---|
| `admin` | alles: Benutzer einladen, Rollen vergeben, Audit-Log, Einstellungen |
| `mitarbeiter` | Anfragen bearbeiten, zuordnen, Übergabe dokumentieren; keine Benutzerverwaltung |

Ein Benutzer ohne Rolle hat keinen Zugriff. Rolle wird serverseitig geprüft, nie nur im Browser.

## Anmeldung mit MFA (später)

1. Anmeldung mit E-Mail und Passwort.
2. Hat der Benutzer noch keinen TOTP-Faktor: Einrichtung mit QR-Code (Authenticator-App), danach Bestätigung mit einem Code.
3. Bei jeder Anmeldung: Code aus der App. Ohne bestätigten Faktor kein Zugriff auf `/admin`.
4. Session-Zeit kurz halten; bei Inaktivität abmelden.
5. Fehlgeschlagene Anmeldungen werden von Supabase begrenzt; zusätzlich Hinweis im Audit-Log.

Umsetzung (Reihenfolge, wenn freigegeben):
- Middleware/Proxy: `/admin` nur mit Session, Rolle und Assurance-Level `aal2`.
- Server-Komponenten lesen die Rolle aus der Session und prüfen sie vor jeder Datenabfrage.
- Datenbankzugriff für Admin-Daten nur über Row-Level-Security mit Rollenprüfung oder über Server-Funktionen mit Service-Schlüssel (nie im Browser).

## Audit-Log (später)

Jede Leseaktion auf Anfragen und Dokumente sowie jede Änderung wird protokolliert: wer, wann, welche Anfrage, welche Aktion. Das Protokoll ist nur für `admin` lesbar und wird nicht gelöscht.

## Offene Entscheidungen

- Ob `mitarbeiter` auch Dokumente (Nachweise) sehen darf. Plan sagt: nein, nur mit Zeitlimit-Link und Protokoll.
- Reihenfolge: zuerst Liste nur lesen, danach Zuordnung, danach Dokumente.
- E-Mail-Versand (Resend) muss vor dem Admin-Start eingerichtet sein.

## Sicherheit

- Der Supabase-Zugriffsschlüssel, der für diese Einrichtung verwendet wurde, sollte nach Abschluss widerrufen werden.
- Testpasswörter nicht im Repo speichern; Passwort-Manager verwenden.
