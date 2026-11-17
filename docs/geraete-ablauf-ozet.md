# Geräte-Ablauf: Offene Fragen / Açık sorular

Stand / Durum: 2026-11-17

---

## Gesamtprozess / Tüm süreç

Offene Punkte sind als **[offen: Punkt N]** bzw. **[açık: madde N]** markiert. Sie sind bewusst nicht festgelegt.

### 1. Eingang / Giriş
- **Status:** `eingegangen`
- **Wer:** Technik / teknik ekip
- **DE:** Das Gerät kommt an. Es wird mit dem Vorgang (WW-JJJJ-NNNNNN) verknüpft. Vorab-Freigabe (2 Admins) ist vorher erfolgt.
- **TR:** Cihaz gelir. Başvuruyla (WW-JJJJ-NNNNNN) eşleştirilir. Ön onay (2 admin) daha önce verilmiştir.
- **Offen:** [offen: Punkt 11] Etikett/QR beim Eingang. [açık: madde 11]

### 2. Zweite Kontrolle / İkinci kontrol
- **Status:** `eingegangen` → `zweite_kontrolle` → `loeschung_offen` oder `quarantaene`
- **Wer:** Admin
- **DE:** Gelieferter Typ, Marke und Modell werden mit dem Antrag verglichen. Stimmen sie überein, geht das Gerät zur Löschung. Sonst kommt es in die Quarantäne. Jeder Schritt wird einzeln protokolliert.
- **TR:** Teslim edilen tür, marka ve model başvuruyla karşılaştırılır. Uyuşursa cihaz silmeye gider, uyuşmazsa karantinaya alınır. Her adım ayrı kaydedilir.

### 3. Quarantäne / Karantina
- **Status:** `quarantaene`
- **Wer:** Admin
- **DE:** Abweichung oder Gerät nicht löschbar. Entweder Übernahme in den Bestand (→ Löschung, Schritt 4) oder Rücksendung (→ Schritt 9).
- **TR:** Uyuşmazlık veya silinemeyen cihaz. Ya envantere alınır (→ silme, adım 4) ya da iade edilir (→ adım 9).
- **Offen:** [offen: Punkt 1] Dauer und Folgen. [açık: madde 1] · [offen: Punkt 2] Rücksendung. [açık: madde 2]

### 4. Löschung / Silme
- **Status:** `loeschung_offen` → `geloescht`
- **Wer:** Technik, Freigabe durch 2 Admins
- **DE:** Daten werden nach der Löschrichtlinie gelöscht. Das Löschprotokoll wird erstellt. Schlägt die Löschung fehl, bleibt das Gerät im Status `loeschung_offen`.
- **TR:** Veriler silme politikasına göre silinir. Silme protokolü oluşturulur. Silme başarısız olursa cihaz `loeschung_offen` durumunda kalır.
- **Offen:** [offen: Punkt 9] Geräte ohne Speicher. [açık: madde 9] · [offen: Punkt 10] Sichtbarkeit des Spendernamens. [açık: madde 10] · Vorlage 20 fehlt [offen: Punkt 12] [açık: madde 12]

### 5. Technische Prüfung / Teknik kontrol
- **Status:** `geloescht` → `technische_pruefung`
- **Wer:** Technik
- **DE:** Das gelöschte Gerät wird geprüft. Ergebnis: Reparatur, frei oder entsorgt.
- **TR:** Silinmiş cihaz kontrol edilir. Sonuç: onarım, serbest veya imha.

### 6. Reparatur / Onarım
- **Status:** `technische_pruefung` → `reparatur` → zurück zu `technische_pruefung`
- **Wer:** Technik
- **DE:** Reparatur. Danach erneute technische Prüfung.
- **TR:** Onarım. Ardından yeniden teknik kontrol.

### 7. Freigabe und Reservierung / Serbest bırakma ve rezervasyon
- **Status:** `frei` → `reserviert`
- **Wer:** Admin
- **DE:** Das freigegebene Gerät wird einem Vorgang zugeordnet.
- **TR:** Serbest bırakılan cihaz bir başvuruya atanır.
- **Offen:** [offen: Punkt 6] Aufbewahrungsdauer. [açık: madde 6]

### 8. Übergabe / Teslim
- **Status:** `reserviert` → `uebergeben` (Endstatus)
- **Wer:** Admin, Technik
- **DE:** Das Gerät wird übergeben. Übergabeprotokoll mit Unterschrift (Vorlage 28 vorhanden).
- **TR:** Cihaz teslim edilir. İmzalı teslim protokolü (şablon 28 mevcut).
- **Offen:** [offen: Punkt 8] Digitale Unterschrift per Link. [açık: madde 8]

### 9. Rückgabe / İade
- **Status:** `quarantaene` → `rueckgabe` (Endstatus)
- **Wer:** Admin
- **DE:** Das Gerät wird an den Spender zurückgesandt. Rückgabeprotokoll wird erstellt.
- **TR:** Cihaz bağışçıya geri gönderilir. İade protokolü oluşturulur.
- **Offen:** [offen: Punkt 2] Versandkosten und Unterschrift. [açık: madde 2]

### 10. Entsorgung / İmha
- **Status:** `technische_pruefung` → `entsorgt` (Endstatus)
- **Wer:** Technik
- **DE:** Das Gerät wird entsorgt. Nachweis wird geführt.
- **TR:** Cihaz imha edilir. Kanıt kaydedilir.
- **Offen:** [offen: Punkt 6] Aufbewahrung des Nachweises. [açık: madde 6] · Entsorgungsnachweis-Form fehlt (Vorlage nicht im Drive) [offen: Punkt 12] [açık: madde 12]

### 11. Vorgangsabschluss / Başvurunun kapanışı
- **Status:** Vorgang `abschlussbereit`, dann manuell geschlossen
- **Wer:** Admin
- **DE:** Sind alle Geräte in einem Endstatus (`uebergeben`, `rueckgabe`, `entsorgt`), zeigt das System „abschlussbereit“. Der Admin schließt den Vorgang manuell, das wird protokolliert.
- **TR:** Tüm cihazlar son durumdaysa (`uebergeben`, `rueckgabe`, `entsorgt`) sistem "kapanışa hazır" gösterir. Admin başvuruyu elle kapatır, bu kaydedilir.
- **Offen:** [offen: Punkt 16] Manuell oder automatisch. [açık: madde 16] · [offen: Punkt 7] Archiv. [açık: madde 7]

### 12. Protokolle und Korrektur / Protokoller ve düzeltme
- **DE:** Protokolle werden nach Abschluss nicht geändert. Eine Korrektur ist ein neues Protokoll mit Verweis auf das alte (Version + 1).
- **TR:** Protokoller kapandıktan sonra değiştirilmez. Düzeltme, eskisine atıf yapan yeni bir protokoldür (sürüm + 1).
- **Offen:** [offen: Punkt 7] Archivort und Unveränderlichkeit. [açık: madde 7] · PDF-Erzeugung und Protokoll-Tabelle sind noch nicht gebaut.

### Übersicht der Status / Durum özeti
| Status | DE | TR | Schritt |
|---|---|---|---|
| eingegangen | eingegangen | girdi | 1 |
| zweite_kontrolle | zweite Kontrolle | ikinci kontrol | 2 |
| quarantaene | Quarantäne | karantina | 3 |
| loeschung_offen | Löschung offen | silme bekliyor | 4 |
| geloescht | gelöscht | silindi | 4 |
| technische_pruefung | technische Prüfung | teknik kontrol | 5 |
| reparatur | Reparatur | onarım | 6 |
| frei | freigegeben | serbest | 7 |
| reserviert | reserviert | rezerve | 7 |
| uebergeben | übergeben | teslim edildi | 8 |
| rueckgabe | zurückgegeben | iade edildi | 9 |
| entsorgt | entsorgt | imha edildi | 10 |

---

## Deutsch

Einwände bitte mit der **Nummer** des Punkts melden (z. B. „Punkt 7: …“).

| Nr | Thema | Entscheider | Status |
|---|---|---|---|
| 1 | Quarantänedauer und was nach Ablauf passiert | Fatih | offen |
| 2 | Rücksendung: Versandkosten und wer unterschreibt das Protokoll | Fatih | offen |
| 3 | SPD-ID: bei Eingang der Spende oder erst bei Annahme | Fatih | offen |
| 4 | Kriterien für die Vorab-Freigabe (müssen auf der Website stehen) | Fatih, Text: Entwickler | offen |
| 5 | Abgelehnte Anträge nach 14 Tagen löschen? | Fatih, rechtlich prüfen | offen |
| 6 | Aufbewahrungsdauer | Fatih, Steuerberater | offen |
| 7 | Archiv: Ort und Unveränderlichkeit | Fatih | offen |
| 8 | Digitale Unterschrift per Link für Spender | Fatih | offen |
| 9 | Geräte ohne Speicher: Löschschritt überspringen? | Fatih | offen |
| 10 | Darf die Technik den Spendernamen sehen? | Fatih | offen |
| 11 | Stack und Hosting, QR-Etiketten, Zubehör | Fatih | offen |
| 12 | Fehlende Vorlagen: 10, 17, 19, 20, 31, 44, 49, 21, 22, 27 | Fatih | offen |
| 13 | Zweite Admin-Prüfung über eigene Sitzung | Entwickler | umgesetzt (Methode a, Code und Regel), Anbindung an Pflichtschritt folgt |
| 14 | Löschkonflikt: Anonymisieren (Vorschlag) oder Löschung verbieten | Fatih, Datenschutz prüfen | offen, Vorschlag A |
| 15 | Migration in einer Testdatenbank prüfen | Fatih (Freigabe) | offen |
| 16 | Vorgang abschließen: manuell (Vorschlag) oder automatisch | Fatih | umgesetzt: Hinweis „abschlussbereit“, Schließen manuell |

---

## Türkçe

İtirazları lütfen madde **numarasıyla** bildirin (ör. „Madde 7: …“).

| No | Konu | Karar veren | Durum |
|---|---|---|---|
| 1 | Karantina süresi ve süre dolunca ne olacak | Fatih | açık |
| 2 | İade: kargo masrafı ve protokolü kim imzalar | Fatih | açık |
| 3 | SPD-ID: bağış girişinde mi, kabulde mi verilecek | Fatih | açık |
| 4 | Ön onay kriterleri (web sitesinde yayımlanmalı) | Fatih; metin: geliştirici | açık |
| 5 | Reddedilen başvurular 14 gün sonra silinsin mi | Fatih; hukuki kontrol | açık |
| 6 | Saklama süresi | Fatih, vergi danışmanı | açık |
| 7 | Arşiv: yeri ve değiştirilemezliği | Fatih | açık |
| 8 | Bağışçı için bağlantıyla dijital imza | Fatih | açık |
| 9 | Hafızası olmayan cihazlarda silme adımı atlansın mı | Fatih | açık |
| 10 | Teknik ekip bağışçının adını görebilir mi | Fatih | açık |
| 11 | Teknoloji yığını ve barındırma, QR etiketler, aksesuarlar | Fatih | açık |
| 12 | Eksik şablonlar: 10, 17, 19, 20, 31, 44, 49, 21, 22, 27 | Fatih | açık |
| 13 | İkinci admin onayı kendi oturumu üzerinden | Geliştirici | uygulandı (yöntem a, kod ve kural), zorunlu adıma bağlanacak |
| 14 | Silme çakışması: anonimleştirme (öneri) veya silmeyi yasaklamak | Fatih; veri koruma kontrolü | açık, öneri A |
| 15 | Migrasyonun test veritabanında doğrulanması | Fatih (onay) | açık |
| 16 | Başvuruyu kapatma: elle (öneri) mi, otomatik mi | Fatih | uygulandı: „kapanışa hazır“ uyarısı, kapatma elle |

### Beklenen cevap / Beklenen yanıt (Deutsch)
Bitte pro Punkt kurz antworten, am besten mit dem Wort aus der Klammer.
1. Quarantänedauer in Tagen (z. B. 14 oder 30) und was nach Ablauf passiert (Bestand oder Rückgabe).
2. Versandkosten: Spender oder Verein. Protokoll-Unterschrift: Technik oder Admin.
3. SPD-ID: „bei Eingang“ oder „bei Annahme“.
4. Mindestkriterien als Liste (z. B. Gerätetyp, Alter, Zustand). Der Text folgt danach.
5. Abgelehnte Anträge löschen: ja oder nein, und nach wie vielen Tagen.
6. Aufbewahrung je Dokumentart in Jahren oder „unbegrenzt“.
7. Archivort und ob unveränderlich: ja oder nein.
8. Unterschrift per Link für Spender: ja oder nein.
9. Geräte ohne Speicher: Löschschritt überspringen, ja oder nein.
10. Spendername für Technik sichtbar: ja oder nein.
11. Stack: bestätigen (Vorschlag: bestehendes `platform/`). QR-Etiketten in der ersten Version: ja oder nein. Zubehör: erfassen oder nicht.
12. Vorlagen hochladen oder den Ablageort nennen.
13. Bestätigen, dass Methode a passt. Zusatz: Wann soll sie an den Pflichtschritt gebunden werden?
14. A (anonymisieren) oder B (Löschung verbieten), nach Rücksprache mit Datenschutz.
15. Freigabe für die Testdatenbank ist erteilt, Ergebnis bestätigt: ja oder nein.
16. Bestätigen: Abschluss manuell (wie umgesetzt) oder automatisch.

### Beklenen yanıt (Türkçe)
Lütfen her madde için kısa cevap verin, mümkünse paranteze yazılan kelimeyle.
1. Karantina süresi gün olarak (ör. 14 veya 30) ve süre dolunca ne olacağı (envanter veya iade).
2. Kargo masrafı: bağışçı mı, dernek mi. Protokol imzası: teknik ekip mi, admin mi.
3. SPD-ID: "girişte" mi, "kabulde" mi.
4. Asgari kriterler liste halinde (ör. cihaz türü, yaş, durum). Metin sonra hazırlanır.
5. Reddedilen başvurular silinsin mi: evet mi hayır mı, kaç gün sonra.
6. Belge türüne göre saklama süresi, yıl olarak ya da "süresiz".
7. Arşiv yeri ve değiştirilemez olup olmayacağı: evet mi hayır mı.
8. Bağışçı için bağlantıyla imza: evet mi hayır mı.
9. Hafızası olmayan cihazlarda silme adımı atlansın mı: evet mi hayır mı.
10. Bağışçı adı teknik ekibe görünsün mü: evet mi hayır mı.
11. Teknoloji yığını: onaylayın (öneri: mevcut `platform/`). İlk sürümde QR etiket: evet mi hayır mı. Aksesuar: kaydedilsin mi.
12. Şablonları yükleyin ya da nerede olduklarını yazın.
13. Yöntem a'nın uygun olduğunu onaylayın. Ek: hangi zorunlu adıma bağlansın?
14. A (anonimleştirme) mi, B (silmeyi yasaklamak) mı; veri koruma ile görüşüldükten sonra.
15. Test veritabanı onayı verildi, sonuç doğrulandı mı: evet mi hayır mı.
16. Onaylayın: kapatma elle mi (uygulandığı gibi) yoksa otomatik mi.

## Vorläufige Entscheidungen / Geçici kararlar (Berater, 2026-11-17)
Bis Fatih entscheidet, gilt der einfachste Weg. Jeder Punkt kann später geändert werden.
- **Annahme unterschreibt:** die angemeldete Person, die das Gerät annimmt (Technik oder Admin). Eine zweite Person ist nicht nötig. / **Annahmeyi imzalayan:** kabul eden oturum sahibi kişi. İkinci kişi gerekmez.
- **Spender-Unterschrift:** zunächst auf Papier, eingescannt hochgeladen. Der Link kommt später (Punkt 8). / **Bağışçı imzası:** önce kâğıt, taranıp yüklenir. Bağlantı sonra gelir (madde 8).
- **Digitale Checkliste und Unterschrift:** zuerst nur für die Annahme (Dok. 18). Danach Übergabe (Dok. 28), dann Löschung (Dok. 07). PDF entsteht nach dem letzten Schritt. / **Dijital kontrol listesi ve imza:** önce yalnızca Annahme (Dok. 18). Sonra Übergabe (Dok. 28), ardından silme (Dok. 07). PDF son adımdan sonra oluşur.
- **Rechtliche Prüfung:** Ob die Unterschrift elektronisch reicht, klärt ein Berater vor dem Livegang. Bis dahin Papier-Original aufbewahren. / **Hukuki kontrol:** Elektronik imzanın yeterli olup olmadığını canlıya almadan önce bir danışman netleştirir. O zamana kadar kâğıt asıl nüsha saklanır.
