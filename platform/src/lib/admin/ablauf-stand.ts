// Stand des Geräte-Ablaufs für das Team (Stand 2026-11-17). Jeder Text in Deutsch und Türkisch.
// Offene Punkte haben eine feste Nummer (nr). Einwände bitte mit dieser Nummer melden.
// Quelle: docs/geraete-ablauf-ozet.md. Bei Änderungen beide Dateien gemeinsam aktualisieren.

export type Zweisprachig = { de: string; tr: string };
export type StandPunkt = { nr?: number; text: Zweisprachig; done: boolean };
export type StandGruppe = { key: 'umgesetzt' | 'noch' | 'offen' | 'vorlaeufig'; titel: Zweisprachig; punkte: StandPunkt[] };

export const ABLAUF_STAND_GRUPPEN: StandGruppe[] = [
  {
    key: 'umgesetzt',
    titel: { de: 'Umgesetzt', tr: 'Uygulandı' },
    punkte: [
      { done: true, text: { de: 'Alle sieben Schritte eines Vorgangs im Admin, mit Schrittleiste und Fortschritt', tr: 'Bir başvurunun yedi adımı yönetim panelinde, adım çubuğu ve ilerlemeyle' } },
      { done: true, text: { de: 'Gerätestatus: nur erlaubte Übergänge, in der Datenbank geprüft', tr: 'Cihaz durumu: yalnızca izinli geçişler, veritabanında kontrol edilir' } },
      { done: true, text: { de: 'Protokolle als PDF je Schritt, unveränderlich; Korrektur als neue Version', tr: 'Her adım için PDF protokol, değiştirilemez; düzeltme yeni sürüm olarak' } },
      { done: true, text: { de: 'Löschung und Übergabe setzen den Gerätestatus automatisch (Löschung am 17.11. live getestet; Übergabe nach Fehlerbehebung, Test nach Deploy)', tr: 'Silme ve teslim, cihaz durumunu otomatik değiştirir (silme 17.11. canlıda test edildi; teslim hata düzeltmesinden sonra, deploy sonrası test)' } },
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
      { nr: 14, done: false, text: { de: 'Ablauf bei fehlgeschlagener Löschung klären', tr: 'Silme başarısız olduğunda akışı netleştirmek' } },
      { nr: 17, done: false, text: { de: 'Vorlagen fehlen: Löschprotokoll (Vorlage 20) und Layout Entsorgungsnachweis (Dok. 20)', tr: 'Şablonlar eksik: Silme protokolü (şablon 20) ve Entsorgung belgesi düzeni (Dok. 20)' } },
      { nr: 18, done: false, text: { de: 'Handy-Prüfung aller Schritte bei 320 px, iPhone 13 und Pixel 7', tr: 'Tüm adımların 320 px, iPhone 13 ve Pixel 7 üzerinde mobil kontrolü' } },
      { nr: 19, done: false, text: { de: 'Rollen Technik und Mitarbeiter für die Benutzer im System setzen', tr: 'Teknik ve Çalışan rollerini kullanıcılara sistemde atamak' } },
      { nr: 20, done: false, text: { de: 'Hilfetexte und Prüflisten mit Häkchen je Schritt', tr: 'Her adım için yardım metinleri ve onay kutulu kontrol listeleri' } },
    ],
  },
  {
    key: 'vorlaeufig',
    titel: { de: 'Vorläufig entschieden (Team bestätigt oder ändert)', tr: 'Geçici karar verildi (ekip onaylar veya değiştirir)' },
    punkte: [
      { nr: 21, done: false, text: { de: 'Annahme-Unterschrift: die angemeldete Person, die das Gerät annimmt', tr: 'Kabul imzası: cihazı teslim alan oturum sahibi kişi' } },
      { nr: 22, done: false, text: { de: 'Spender-Unterschrift: zunächst auf Papier, eingescannt hochgeladen', tr: 'Bağışçı imzası: önce kâğıtla, taranıp yüklenir' } },
      { nr: 23, done: false, text: { de: 'Mitarbeiter-Zuordnung bei Annahme und Übergabe: noch nicht bestätigt', tr: 'Kabul ve teslimde çalışan atamaları: henüz onaylanmadı' } },
      { nr: 24, done: false, text: { de: 'Elektronische Unterschrift: rechtliche Prüfung durch einen Berater vor Livegang', tr: 'Elektronik imza: canlıya almadan önce bir danışmanla hukuki kontrol' } },
    ],
  },
  {
    key: 'offen',
    titel: { de: 'Offene Entscheidungen (Fatih)', tr: 'Açık kararlar (Fatih)' },
    punkte: [
      { nr: 1, done: false, text: { de: 'Quarantänedauer und Folgen', tr: 'Karantina süresi ve sonuçları' } },
      { nr: 2, done: false, text: { de: 'Rücksendung: Kosten und Unterschrift', tr: 'İade: masraf ve imza' } },
      { nr: 3, done: false, text: { de: 'SPD-ID: bei Eingang oder bei Annahme', tr: 'SPD-ID: giriş anında mı, kabulde mi' } },
      { nr: 4, done: false, text: { de: 'Kriterien für die Vorab-Freigabe', tr: 'Ön onay kriterleri' } },
      { nr: 5, done: false, text: { de: 'Abgelehnte Anträge: Löschung nach 14 Tagen', tr: 'Reddedilen başvurular: 14 gün sonra silinsin mi' } },
      { nr: 6, done: false, text: { de: 'Aufbewahrungsdauer', tr: 'Saklama süresi' } },
      { nr: 7, done: false, text: { de: 'Archiv: Ort und Unveränderlichkeit', tr: 'Arşiv: yeri ve değiştirilemezlik' } },
      { nr: 8, done: false, text: { de: 'Digitale Unterschrift per Link', tr: 'Bağlantı ile dijital imza' } },
      { nr: 9, done: false, text: { de: 'Geräte ohne Speicher', tr: 'Hafızası olmayan cihazlar' } },
      { nr: 10, done: false, text: { de: 'Sichtbarkeit des Spendernamens für Technik', tr: 'Bağışçı adının teknik ekip tarafından görülmesi' } },
      { nr: 11, done: false, text: { de: 'Stack, QR-Etiketten, Zubehör', tr: 'Teknoloji yığını, QR etiketler, aksesuarlar' } },
      { nr: 12, done: false, text: { de: 'Fehlende Vorlagen beschaffen', tr: 'Eksik şablonları temin etmek' } },
    ],
  },
];
