// Stand des Geräte-Ablaufs für das Team. Jeder Text in Deutsch und Türkisch.
// Quelle: docs/geraete-ablauf-ozet.md. Bei Änderungen beide Dateien gemeinsam aktualisieren.

export type Zweisprachig = { de: string; tr: string };
export type StandPunkt = { text: Zweisprachig; done: boolean };
export type StandGruppe = { key: 'umgesetzt' | 'noch' | 'offen' | 'vorlaeufig'; titel: Zweisprachig; punkte: StandPunkt[] };

export const ABLAUF_STAND_GRUPPEN: StandGruppe[] = [
  {
    key: 'umgesetzt',
    titel: { de: 'Umgesetzt', tr: 'Uygulandı' },
    punkte: [
      { done: true, text: { de: 'Geräte-Regeln: erlaubte Schritte, zweite Kontrolle, Quarantäne, Vorgang-Abschluss', tr: 'Cihaz kuralları: izinli adımlar, ikinci kontrol, karantina, başvurunun kapanması' } },
      { done: true, text: { de: 'Zwei-Admin-Regel nach Dok. 07: nur bei fehlgeschlagener Löschung, Ausnahme oder Vernichtung', tr: 'İki admin kuralı, Dok. 07 uyarınca: yalnızca silme başarısız, istisna veya imha olduğunda' } },
      { done: true, text: { de: 'Protokoll-PDFs nach Vorlage 28 (Übergabe) und gespeichert, unveränderlich', tr: 'Dok. 28 şablonuna göre Teslim PDF\'i, kaydedilmiş ve değiştirilemez' } },
      { done: true, text: { de: 'Korrektur von Protokollen als neue Version mit Verweis', tr: 'Protokol düzeltmesi: bağlantılı yeni sürüm olarak' } },
      { done: true, text: { de: 'Automatische Tests für die Regeln (17 Tests)', tr: 'Kurallar için otomatik testler (17 test)' } },
      { done: true, text: { de: 'Datenbank: Statusfeld, Ereignisprotokoll (nur anhängen), Statusfunktion (geschrieben, nicht angewendet)', tr: 'Veritabanı: durum alanı, olay kaydı (yalnızca ekleme), durum fonksiyonu (yazıldı, henüz uygulanmadı)' } },
      { done: true, text: { de: 'Team-Dokument mit Ablauf und offenen Punkten', tr: 'Ekip için süreç ve açık noktalar belgesi' } },
    ],
  },
  {
    key: 'noch',
    titel: { de: 'Noch nicht umgesetzt', tr: 'Henüz uygulanmadı' },
    punkte: [
      { done: false, text: { de: 'Migration in einer Testdatenbank prüfen (Punkt 15)', tr: 'Migrasyonu test veritabanında doğrulamak (madde 15)' } },
      { done: false, text: { de: 'Protokoll-Tabelle und PDF-Erzeugung', tr: 'Protokol tablosu ve PDF üretimi' } },
      { done: false, text: { de: 'Oberfläche: Cihaz-Status und Schaltflächen je Gerät', tr: 'Arayüz: her cihaz için durum ve düğmeler' } },
      { done: false, text: { de: 'Zweite Admin-Prüfung über eigene Sitzung (Punkt 13)', tr: 'İkinci admin onayı kendi oturumu üzerinden (madde 13)' } },
      { done: false, text: { de: 'Löschkonflikt entscheiden (Punkt 14)', tr: 'Silme çakışmasına karar vermek (madde 14)' } },
      { done: false, text: { de: 'Anbindung an den Vorgang (abschlussbereit-Hinweis)', tr: 'Başvuruya bağlantı (kapanışa hazır uyarısı)' } },
    ],
  },
  {
    key: 'vorlaeufig',
    titel: { de: 'Vorläufig entschieden (Team bestätigt oder ändert)', tr: 'Geçici karar verildi (ekip onaylar veya değiştirir)' },
    punkte: [
      { done: false, text: { de: 'Annahme unterschreibt: die angemeldete Person, die das Gerät annimmt', tr: 'Annahmeyi imzalayan: cihazı teslim alan oturum sahibi kişi' } },
      { done: false, text: { de: 'Spender-Unterschrift: zunächst auf Papier, eingescannt hochgeladen', tr: 'Bağışçı imzası: önce kâğıtla, taranıp yüklenir' } },
      { done: false, text: { de: 'Reihenfolge: zuerst Annahme (Dok. 18), dann Übergabe (Dok. 28), dann Löschung (Dok. 07)', tr: 'Sıra: önce Annahme (Dok. 18), sonra Übergabe (Dok. 28), sonra silme (Dok. 07)' } },
      { done: false, text: { de: 'Rechtliche Prüfung: elektronische Unterschrift vor Livegang durch einen Berater klären', tr: 'Hukuki kontrol: canlıya almadan önce elektronik imzayı bir danışman netleştirir' } },
    ],
  },
  {
    key: 'offen',
    titel: { de: 'Offene Entscheidungen (Fatih)', tr: 'Açık kararlar (Fatih)' },
    punkte: [
      { done: false, text: { de: 'Quarantänedauer und Folgen (Punkt 1)', tr: 'Karantina süresi ve sonuçları (madde 1)' } },
      { done: false, text: { de: 'Rücksendung: Kosten und Unterschrift (Punkt 2)', tr: 'İade: masraf ve imza (madde 2)' } },
      { done: false, text: { de: 'SPD-ID: bei Eingang oder bei Annahme (Punkt 3)', tr: 'SPD-ID: giriş anında mı, kabulde mi (madde 3)' } },
      { done: false, text: { de: 'Kriterien für die Vorab-Freigabe (Punkt 4)', tr: 'Ön onay kriterleri (madde 4)' } },
      { done: false, text: { de: 'Abgelehnte Anträge: Löschung nach 14 Tagen (Punkt 5)', tr: 'Reddedilen başvurular: 14 gün sonra silinsin mi (madde 5)' } },
      { done: false, text: { de: 'Aufbewahrungsdauer (Punkt 6)', tr: 'Saklama süresi (madde 6)' } },
      { done: false, text: { de: 'Archiv: Ort und Unveränderlichkeit (Punkt 7)', tr: 'Arşiv: yeri ve değiştirilemezlik (madde 7)' } },
      { done: false, text: { de: 'Digitale Unterschrift per Link (Punkt 8)', tr: 'Bağlantı ile dijital imza (madde 8)' } },
      { done: false, text: { de: 'Geräte ohne Speicher (Punkt 9)', tr: 'Hafızası olmayan cihazlar (madde 9)' } },
      { done: false, text: { de: 'Sichtbarkeit des Spendernamens für Technik (Punkt 10)', tr: 'Bağışçı adının teknik ekip tarafından görülmesi (madde 10)' } },
      { done: false, text: { de: 'Stack, QR-Etiketten, Zubehör (Punkt 11)', tr: 'Teknoloji yığını, QR etiketler, aksesuarlar (madde 11)' } },
      { done: false, text: { de: 'Fehlende Vorlagen beschaffen (Punkt 12)', tr: 'Eksik şablonları temin etmek (madde 12)' } },
      { done: false, text: { de: 'Vorgang abschließen: manuell oder automatisch (Punkt 16)', tr: 'Başvuruyu kapatma: elle mi, otomatik mi (madde 16)' } },
    ],
  },
];
