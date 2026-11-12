# Admin-Aufgaben: Liste und Reihenfolge

Stand: 2026-11-12. Nur Namen und grobe Schritte; Details werden beim Start jedes Punkts festgelegt.

## Erledigt (lokal)

- Vorgangsliste, Detailseite, PDF-Vorgangsblatt (Download wird protokolliert)
- Status-Ablauf: Neu → Geprüft → Zugeordnet → Übergeben → Abgeschlossen (nur nächster Schritt)
- Protokoll (`admin_audit`): Statuswechsel, PDF-Downloads, Fotoansicht, Fotolöschung
- Passwortregel (12+, Groß-, Kleinbuchstaben, Ziffer) in Profil und Passwort-Zurücksetzen
- Passwort vergessen: Anforderung und neues Passwort über Mail-Link (Resend-Domain verifiziert)
- Gerät-Foto (Gönderim sonrası, isteğe bağlı): JPEG/PNG, bis 3 Fotos, je 4 MB, Metadaten werden entfernt, Löschfrist 14 Tage. Standardmäßig in der Produktion **verborgen** (Feature `geraetFoto`).

## Offen: Foto (vor Live-Schaltung zwingend)

1. **Migration ausführen:** `platform/supabase/migrations/20261112_donation_photo.sql` im Supabase SQL-Editor.
2. **Datenschutz-Text** (Datenschutzerklärung): Fotos, Metadatenentfernung, 14 Tage Löschfrist, Rechtsgrundlage.
3. **DSFA** und **Lösch-Test** (Fotos nach 14 Tagen tatsächlich weg).
4. **Automatische Löschung nach 14 Tagen** (Cron/Job). Heute nur manuell über „Foto löschen“ im Admin.
5. **Rate-Limit** für den Upload-Endpunkt.
6. **Funktionstest mit echtem Foto** im lokalen Admin, dann Mobil-Check (320/390/412 px).

## Offen: Admin-Module (Namen)

- **Löschprotokoll** (pro Gerät: Seriennummer, Verfahren, Datum, Person)
- **Übernahmeprotokoll** (Spender, unterschrieben, druckbar)
- **Ausgabeprotokoll** (Empfänger, unterschrieben, druckbar)
- **Envanter** (Seriennummer, Zustand, Lagerort)
- **Entsorgungsnachweis** (ElektroG, für nicht verwertbare Geräte)
- **Zuwendungsbestätigung**: nur nach Gemeinnützigkeitsbescheid (Steuerberater)

## Offen: Admin-Module (zerlegt, später festlegen)

- **DSGVO-Werkzeuge**
  - Saklama süreleri (Speicherfristen) je Datentyp
  - Otomatik silme/anonimleştirme
  - Auskunft (Art. 15): Datenexport je Person
  - Löschung auf Wunsch (Art. 17)
- **Mail-Vorlagen**
  - Eingangsbestätigung
  - Absage mit Begründung
  - Übergabe-/Abholtermin
  - Abschluss mit Dank
- **Berichte**
  - Jahresübersicht (eingegangen, übergeben, entsorgt)
  - CSV-Export je Zeitraum

## Vor Live-Schaltung (gemeinsam)

- Admin in der Produktion wieder verbergen (`admin`: `aktiv` → `verborgen`) oder MFA verpflichtend machen
- Supabase Site URL in der Produktion prüfen (aktuell `http://localhost:3000`)
- Test-Konto `test-admin@weiterwert.de` löschen oder Passwort ändern
- Testdaten im Protokoll (`WW-2026-062324`) bewusst lassen oder entfernen
