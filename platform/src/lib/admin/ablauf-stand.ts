// Stand des Geräte-Ablaufs für das Team (Stand 2026-11-17). Jeder Text in Deutsch und Türkisch.
// Quelle: docs/geraete-ablauf-ozet.md. Bei Änderungen beide Dateien gemeinsam aktualisieren.

export type Zweisprachig = { de: string; tr: string };
export type StandPunkt = { text: Zweisprachig; done: boolean };
export type StandGruppe = { key: 'umgesetzt' | 'noch' | 'offen' | 'vorlaeufig'; titel: Zweisprachig; punkte: StandPunkt[] };

export const ABLAUF_STAND_GRUPPEN: StandGruppe[] = [
  {
    key: 'umgesetzt',
    titel: { de: 'Umgesetzt', tr: 'Uygulandı' },
    punkte: [
      { done: true, text: { de: 'Alle sieben Schritte eines Vorgangs im Admin, mit Schrittleiste und Fortschritt', tr: 'Bir başvurunun yedi adımı yönetim panelinde, adım çubuğu ve ilerlemeyle' } },
      { done: true, text: { de: 'Gerätestatus: nur erlaubte Übergänge, in der Datenbank geprüft', tr: 'Cihaz durumu: yalnızca izinli geçişler, veritabanında kontrol edilir' } },
      { done: true, text: { de: 'Protokolle als PDF je Schritt, unveränderlich; Korrektur als neue Version', tr: 'Her adım için PDF protokol, değiştirilemez; düzeltme yeni sürüm olarak' } },
      { done: true, text: { de: 'Löschung und Übergabe setzen den Gerätestatus automatisch (am 17.11. live getestet)', tr: 'Silme ve teslim, cihaz durumunu otomatik değiştirir (17.11. canlıda test edildi)' } },
      { done: true, text: { de: 'Vorgang abschließen: ein Klick, nur wenn alle Geräte am Ende sind; wird protokolliert', tr: 'Başvuruyu kapat: tek tıkla, yalnızca tüm cihazlar son durumdayken; kayda geçer' } },
      { done: true, text: { de: 'Rollen je Schritt: Admin, Technik, Mitarbeiter', tr: 'Her adımda roller: Admin, Teknik, Çalışan' } },
      { done: true, text: { de: 'Zweite Person bei Ausnahmen: Anmeldung ohne die Sitzung des ersten Admins zu ändern', tr: 'İstisnalarda ikinci kişi: ilk adminin oturumunu değiştirmeden giriş' } },
      { done: true, text: { de: 'Eingangsliste zeigt den aktuellen Schritt statt nur "Neu"', tr: 'Giriş listesi yalnızca "Neu" yerine mevcut adımı gösterir' } },
      { done: true, text: { de: 'Datenbank-Migrationen 20261117 bis 20261123 eingespielt; 221 automatische Tests grün', tr: 'Veritabanı migrasyonları 20261117–20261123 uygulandı; 221 otomatik test geçti' } },
    ],
  },
  {
    key: 'noch',
    titel: { de: 'Noch offen (Technik)', tr: 'Hâlâ açık (Teknik)' },
    punkte: [
      { done: false, text: { de: 'Ablauf bei fehlgeschlagener Löschung klären (Punkt 14)', tr: 'Silme başarısız olduğunda akışı netleştirmek (madde 14)' } },
      { done: false, text: { de: 'Fehlende Vorlagen: Löschprotokoll (Vorlage 20), Layout Entsorgungsnachweis (Dok. 20)', tr: 'Eksik şablonlar: Silme protokolü (şablon 20), Entsorgung belgesi düzeni (Dok. 20)' } },
      { done: false, text: { de: 'Handy-Prüfung aller Schritte bei 320 px, iPhone 13 und Pixel 7', tr: 'Tüm adımların 320 px, iPhone 13 ve Pixel 7 üzerinde mobil kontrolü' } },
      { done: false, text: { de: 'Rollen Technik und Mitarbeiter für die Benutzer im System setzen', tr: 'Teknik ve Çalışan rollerini kullanıcılara sistemde atamak' } },
      { done: false, text: { de: 'Hilfetexte und Prüflisten mit Häkchen je Schritt', tr: 'Her adım için yardım metinleri ve onay kutulu kontrol listeleri' } },
    ],
  },
  {
    key: 'vorlaeufig',
    titel: { de: 'Vorläufig entschieden (Team bestätigt oder ändert)', tr: 'Geçici karar verildi (ekip onaylar veya değiştirir)' },
    punkte: [
      { done: false, text: { de: 'Annahme-Unterschrift: die angemeldete Person, die das Gerät annimmt', tr: 'Kabul imzası: cihazı teslim alan oturum sahibi kişi' } },
      { done: false, text: { de: 'Spender-Unterschrift: zunächst auf Papier, eingescannt hochgeladen', tr: 'Bağışçı imzası: önce kâğıtla, taranıp yüklenir' } },
      { done: false, text: { de: 'Mitarbeiter-Zuordnung bei Annahme und Übergabe: noch nicht bestätigt', tr: 'Kabul ve teslimde çalışan atamaları: henüz onaylanmadı' } },
      { done: false, text: { de: 'Elektronische Unterschrift: rechtliche Prüfung durch einen Berater vor Livegang', tr: 'Elektronik imza: canlıya almadan önce bir danışmanla hukuki kontrol' } },
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
    ],
  },
];
