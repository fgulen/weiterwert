# Plan: Tek site ve çok dilli yapı

> **Durum:** Taslak. Henüz kod değişmedi.
> **Amaç:** Ana site (weiterwert.de) ve platform (spenden.weiterwert.de) tek bir site olsun. Tek üst menü, tek dil seçimi, tek yayın.

## Neden

Şu an iki ayrı site var, iki ayrı sözlük ve iki ayrı yayın. Kullanıcı bu yüzden kayboluyor. Ayrıca biri her zaman geride kalıyor: platform yerel diskten, ana sayfa sadece `master` push'undan güncelleniyor.

Eski planda bu geçiş zaten vardı (spec §9b, Faz 8). Şimdi öne alıyoruz.

## Dil yapısı

- **Dil URL'de olur:** `/tr/...`, `/en/...`. Almanca bugünkü adreslerde kalır (`/spenden`, `/`). Çerez veya `?lang=` kullanılmaz, çünkü çerez „keine Cookies“ vaadini bozar.
- **Almanca değişmez:** Canlı bağış sayfası ve ana sayfa bağlantıları kırılmaz.
- **Tek sözlük:** `index.html` içindeki Türkçe ve Almanca metinler plataforma taşınır. Formun dil dosyası da birleşir.
- **İngilizce:** Yalnızca sözlük testi tüm anahtarlar için geçerse dil seçeneğinde gösterilir.
- **Yasal sayfalar Almanca kalır.** Üstte kısa bir Türkçe ve İngilizce not olur.

## Aşamalar

**Aşama 1 (sen „evet“ dersen başlar): Platformda çok dilli yapı.**
Üst menü, alt bilgi, banner, form ve mevcut tüm sayfalar. Sadece `localhost:3000`'de görünür, canlıya bir şey gitmez.

**Aşama 2: Ana sayfa platforma taşınır (test ortamında).**
Aynı görünüm. Hero animasyonu bir React bileşeni olur ve sözlüğü kullanır. Ekran görüntüsü karşılaştırması: 320 px, iPhone 13, Pixel 7 ve 1280 px.

**Aşama 3: Testler taşınır.**
Ana sitedeki 8 statik test kaybolmaz. Sözlük testleri vitest'te, sayfa testleri Playwright'ta yazılır. Bu testler Datenschutz, bağış bağlantıları ve yasal vaatleri korur.

**Aşama 4: Canlıya geçiş (ayrıca onay gerekir).**
- weiterwert.de alan adı platforma bağlanır.
- Eski adresler yönlendirilir: `/impressum.html` → `/impressum`, `spenden.weiterwert.de/*` → `weiterwert.de/*`.
- Platform Git'e bağlanır. Böylece canlı her zaman `master` ile aynı olur.
- Önce yerel olarak değiştirilmiş `platform/.vercelignore` dosyasına bakılır. Git bağlantısından sonra o dosya yüklenmez.

## Senden üç karar

1. **Üç dil: Almanca, Türkçe, İngilizce mi?** İngilizce metinleri ben yazarım. Sen veya bir arkadaş kontrol eder.
2. **Yasal sayfalar Almanca kalsın mı?** Üstte kısa Türkçe ve İngilizce not olur.
3. **Ana sayfada da sarı banner olsun mu?** Taşındıktan sonra her sayfada görünür.

## Önerilen sıra

Aşama 1 hemen başlayabilir. Aşama 4 ayrı bir onay ister. Alan adını taşımak istemezsen Aşama 1 tek başına yeterli. O zaman sadece platform çok dilli olur, ana site aynı kalır.

## Fatih'in kararları (2026-10-28)

1. **Üç dil:** Almanca, Türkçe, İngilizce. Evet.
2. **Yasal sayfalar Almanca kalır.** Üstte kısa Türkçe ve İngilizce not olur.
3. **Ana sayfada sarı banner olur.** Evet.

**Şimdilik sadece kayıt.** Aşama 1'e henüz başlanmadı. Fatih „hepsini yapma“ dedi. Bir sonraki adım ayrıca istenecek.
