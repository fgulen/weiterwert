# WeiterWert – çalışma günlüğü

## HATIRLATMALAR (en üstte, 2026-10-29)

- [ ] Admin production'da açık (geçici). Test bitince `features.ts` içinde `admin` → `verborgen`, üç "TEMPORARY" testi geri al, yeniden yayınla.
- [ ] Admin test parolalarını yenile (Supabase → Authentication → Users → kullanıcı → Send password recovery; mail adresine erişim gerekir).
- [ ] MFA (TOTP) zorunlu hale getir: `docs/admin-mfa-plan.md`.
- [ ] Vercel AVV / Supabase DPA ve Datenschutz boşlukları.
- [x] Ana menüde "Team-Anmeldung" eklendi (668db89).


## 2026-10-30 (Gerät-Formu: RAM, seçim, özet tablosu)

**Değişiklikler:**
- RAM soruları: "8 GB oder mehr", "4 bis 6 GB" (değer `4`, eski kayıtlar uyumlu), "Weniger als 4 GB" (yeni `unter4`). `pruefe.ts`: 4 GB altı → "manuell", yeni neden kodu `ramNiedrig`.
- Seçim: Başta hiçbir seçenek seçili gelmiyor. Yalnızca bağışçının verdiği cevaplar seçili görünüyor (`beantwortet` listesi). Cevapsız sorular yine "unbekannt" sayılıyor, sonuç değişmiyor.
- Sonuç adımında "Ihre Angaben" tablosu (salt okunur, "Ändern" ile ilgili adıma dönüş). Cevapsız satır "Keine Angabe". Yalnızca taslak cihaz varken görünüyor (Kontakt → Zurück sonrası kaybolur).
- Hatalar düzeltildi: özet, taslak yokken de görünüyordu; sadece "absenden" olmayan kullanımda cevaplar sonraki cihaza taşınıyordu.
- Erişilebilirlik: "Ändern" düğmelerinde soru adı (aria-label), tablo rolleri açık.

**Kontrol:** `tsc` temiz. Vitest 113/113, Playwright 70/70, `test:static` 20/20. Mobil: 320/390/412 px, yerel sunucuda iframe ile (gerçek telefon değil): RAM seçenekleri, sonuç kutusu ve özet tablosu taşmadan görünüyor. Kod incelemesi: kendi diff okuması; `/code-review` skill'i çalıştırılmadı. Yeni uç nokta ya da kimlik değişikliği yok; sunucuya giden doğrulama (`anfrage.ts`) `unter4` değerini ekleyerek güncellendi.

**Bilerek bırakılanlar:**
- Cevapsız sorular göndermeyi engellemiyor (sayfa "freiwillig" diyor, spesifikasyon "Weiß ich nicht" her zaman seçilebilir).
- 4–6 GB cihazlar hâlâ "manuell" incelemeye düşüyor. Politika kararı Fatih'te.

**Açık kararlar (Fatih):**
1. Durum fotoğrafları: önerilen sıra gönderimden sonra, isteğe bağlı, yalnızca ekran/açılmama/sınırda durumlarda. İlk adım sıfır kodlu test (onay e-postasında istemek). Yükleme için EXIF temizliği, depolama, Datenschutz ve AVV gerekir.
2. Cevapsızları zorunlu seçtirmek mi, "Keine Angabe" ile açık bırakmak mı (şu an açık bırakma).

**Commit:** Yalnızca bu işin dosyaları (`platform/src/...`, `platform/e2e/...`, `docs/GUNLUK.md`). `platform/tsconfig.json`, `.claude/`, `.next-local*`, `node_modules/` ve iki mp4 bilerek dışarıda.

**Açık işler:** Push ve deploy onayı Fatih'te. Canlı spenden değişikliklerinin deploy'u onay bekliyor.

## 2026-10-22

**Planlama**
- `MASTER_PROMPT.md` ve `KURZANLEITUNG.md` tasarım belgesine aktarıldı (`docs/superpowers/specs/2026-10-22-weiterwert-plattform-design.md`, ek A), sonra silindi.
- Fatih'in kararları:
  - Proje adı: „WeiterWert – n.e.V. Gründungs- und Betriebsbereitschaft“; başvuru 2027'de.
  - Hesap zorunlu değil; status bildirimi ve newsletter ayrı ayrı sorulur, işaretsiz gelir.
  - Teslim: sadece „Übergabe nach Absprache“ aktif, diğerleri „demnächst“.
  - Admin-MVP Faz 3'te.
  - Bağış akışı ve hukuk metinleri sadece Almanca.
  - Yedekleme şimdilik yok; Faz 8 öncesi tekrar konuşulacak.
  - Motto: „Technik weitergeben. Chancen eröffnen.“
  - Bağış sitesinde „test“ adı ya da bandı olmayacak.
- Uygulama planı: `docs/superpowers/plans/2026-10-22-faz0-faz1-hukuk-ve-iskelet.md`. Kısaltılarak uygulandı; Task 7 (i18n) ve 10. adımın bir kısmı kaldı.

**Canlı site (weiterwert.de, `index.html`)**
- Yeni motto başlıkta. Spendenbeleg metni: „Eintragung geplant 2027 – Zuwendungsbestätigungen erst nach Anerkennung durch das Finanzamt“.
- Kaldırılan vaatler: taşıma, „unwiederbringlich löschen + dokumentieren“, LOGO yer tutucuları.
- Inter fontu artık kendi sunucumuzdan geliyor (latin + latin-ext); Google Fonts'a bağlantı yok.
- `impressum.html` ve `datenschutz.html` hazır ama ⟦FEHLT⟧ alanları var. Bu yüzden ne linkleniyor ne yayınlanıyor; bunu test zorunlu kılıyor.
- `.vercelignore` sadece `index.html` ve `assets/` dosyalarını yayınlıyor.
- Üç bağış butonu → https://spenden.weiterwert.de/spenden

**Bağış uygulaması (`platform/`, Next.js 16)**
- https://spenden.weiterwert.de: Vercel projesi `weiterwert-platform`, fra1 bölgesi, `NEXT_PUBLIC_APP_ENV=production`, şifresiz. Git'e bağlı değil; CLI ile `vercel deploy --prod`.
- Supabase projesi `weiterwert` (eu-central-1). `/api/health` → `db: up`.
- `/spenden`: cihaz ön kontrolü (kurallar `src/lib/vorpruefung/pruefe.ts`, Annahmekriterien v0.1). 🔴 sadece şişmiş batarya ve leasing durumunda verilir; diğer şüpheli durumlar 🟡. Hiçbir veri kaydedilmiyor.
- Basic Auth sadece Vercel önizlemelerinde ve kimlik bilgisi ayarlı ortamlarda.

**Testler:** kök `npm run test:static` (18), `platform/` içinde `npx vitest run` (29) ve `npx playwright test` (20).

**Review:**
- Faz 0/1 dalı bağımsız incelendi (opus). 2 önemli bulgu düzeltildi.
- Sonraki 7 commit `/code-review` ile incelendi (aşağıda).

**Açık işler (Fatih)**
1. Impressum bilgileri: ad, adres, telefon.
2. Vercel AVV: Hobby planında DPA yok gibi görünüyor. Seçenekler: Pro'ya geçmek ya da Alman bir hosting firması.
3. Ana sitede „Computer, Tablet oder Telefon“ metni bağış sayfasıyla çelişiyor (telefon kabul edilmiyor). Karar bekliyor.
4. Supabase AVV'si dashboard'dan imzalanacak; kayıt ve veri saklama başlamadan önce gerekli.

**Sıradaki:** iletişim + gönderme adımı (Faz 2 devamı). Ön koşul: Impressum/Datenschutz tamam ve AVV'ler imzalı.

**Kapanış review'ı (`/code-review 4c7d1a7..HEAD`, medium):** 10 aday bulgu.
- Düzeltilenler:
  - Bilinmeyen batarya, ekran ve kilit durumu artık „uygun“ sayılmıyor.
  - 🔴 cihaz listeye eklenemiyor.
  - Yaş kuralları cihaz türüne göre ayrıldı: Windows 11 sadece laptoplarda, Chromebook'ta AUE kontrolü 4 yıldan itibaren.
  - Boş hukuk sayfaları üretimde 404.
  - `.btn` sıfırlaması sadece `button`'a uygulanıyor.
- Bilerek bırakılanlar:
  - İki sitede de Impressum/Datenschutz yok (Fatih'in bilgileri bekleniyor).
  - Gönderme adımı yok; sayfada e-posta yolu var.
  - Test ortamı taslakları açıkta (test alan adı kaldırıldı).
  - `requiresAuth` sadece kullanıcı adına bakıyor.
  - Health endpoint'te cache yok ve URL sonundaki `/` sorun çıkarabilir.
  - `mailSpendSubject` ve footer `.nav` kullanılmayan kod olarak duruyor.

## 2026-10-23 / 24

**Hukuk sayfaları (weiterwert.de)**
- Fatih'in kararı: hukuk sayfaları eksik alanlarla yayına alınacak. Eksik alanlar mavi „… – wird ausgefüllt“ (`<span class="tbd">`) ile gösteriliyor.
- `impressum.html`, `datenschutz.html` ve yeni `barrierefreiheit.html` yayında. Footer'da „Rechtliches“ sütunu var; spenden.weiterwert.de footer'ı da bu sayfalara link veriyor.
- Cookie-Einstellungen ve KI sayfası **yok**: sitelerde cookie de KI de yok. Datenschutz bunu açıkça söylüyor.
- `npm run test:deploy-gate` açık alanları listeler (bilerek kırmızı).
- Supabase DPA kullanım koşullarına dahil, ayrıca imza gerekmiyor; SCC 2021/914 içeriyor. Bu Datenschutz'a yazıldı.
- opencode'un `…Compliance_Paket_V1.docx.md` dosyasında yaptığı düzenlemeler Haiku ile kontrol edildi. Fatih dokümanın düzeltilmesini istemedi; dosya git dışında.

**Ana sayfa:** „Computer, Tablets und Telefone“ → „Laptops und Tablets“ (DE+TR, meta açıklama dahil). Hero butonu „Laptop oder Tablet spenden“ (tek buton, Fatih'in kararı).

**Bağış sihirbazı (`/spenden`)**
- En üstte Laptop | Tablet toggle'ı var; seçili olan lacivert. Tablet seçilince sadece iPad/Android gösteriliyor ve RAM sorusu gizleniyor. Toggle değişince uyumsuz cevaplar sıfırlanıyor.
- Adımlar „Schritt X von 6“ ilerleme çubuğuyla gösteriliyor: Gerät · Zustand · Konten und Eigentum · Ergebnis · Kontakt · Absenden. Sonra Danke ekranında Vorgangsnummer `WW-YYYY-NNNNNN`.
- Gönderme yalnızca sunucuda `SUPABASE_SECRET_KEY` varsa açık. Yoksa üretim 4 adımda kalıyor ve e-posta yolunu gösteriyor. Test ortamı her zaman bellek içi deposu kullanıyor, gerçek veritabanına yazmıyor.
- Sunucu tarafında yapılanlar:
  - Tüm alanlar tekrar doğrulanıyor ve `pruefe` yeniden çalışıyor (🔴 reddediliyor).
  - En fazla 10 cihaz kabul ediliyor.
  - Honeypot alanı var.
  - Idempotency anahtarı kullanılıyor; içerik değişirse yeni anahtar üretiliyor.
  - Kayıt `submit_donation` security-definer fonksiyonu ile yapılıyor. RLS açık; anon ve authenticated için erişim kapalı (401 ile doğrulandı).
- SQL dosyası: `platform/supabase/migrations/20261024_spendenanfrage.sql`. 2026-10-24'te Chrome üzerinden çalıştırıldı.
- Supabase'de `spenden_vercel` adlı secret key oluşturuldu ve Vercel'e sadece Production için eklendi. Değer panodan aktarıldı, sohbete yazılmadı.
- Canlı test: WW-2026-404642 kaydedildi, doğrulandı, silindi.
- E-posta: Gmail SMTP (`MAIL_*`) kodda hazır ama ayarlanmadı. Outbox satırları `pending` kalıyor. **Not (Fatih):** mail bağlantısı için **Resend** düşünülecek (Vercel Marketplace). Değişen tek dosya `platform/src/lib/absenden/mail.ts` olur; Datenschutz'a da eklenmesi gerekir.

**Testler:** kök `npm run test:static` (20), `platform/`: vitest 42, playwright 35. Mobil kontrol 320 px, iPhone 13 ve Pixel 7'de her adım için yapıldı; hata, özet, Danke ve 10-cihaz ekranları dahil.

**Kapanış review'ı (`/code-review 47a457a..HEAD`, medium):** 10 bulgu.
- Düzeltilenler:
  - Kayıp yanıttan sonra düzeltilip tekrar gönderilen istek eski numarayı alıyor ve düzeltme kayboluyordu. Artık anahtar içeriğe bağlı.
  - Eski iPad'lerde `crypto.randomUUID` yok; yedek UUID üretimi eklendi.
  - 10 cihaz sınırı artık sayfada görünüyor ve buton pasif oluyor.
  - Gönderilmiş mail, outbox güncellemesi hata verirse „failed“ işaretlenmiyor.
  - UUID kalıbı sıkılaştırıldı.
  - Eski JWT anahtarı için Bearer başlığı ekleniyor.
  - Kullanılmayan `.dot` CSS'i silindi.
- Bilerek bırakılanlar:
  - **Hız sınırı yok.** Form duyurulmadan önce Vercel Firewall'da `/spenden` POST için sınır konmalı.
  - Vorgangsnummer çakışması (1/1.000.000, aynı anda) teknik hata verir; SQL tekrar çalıştırılmadan düzeltilmedi.
  - Gönderme modu build anında sabitleniyor: anahtar değişince redeploy gerekir.
  - Outbox'ı tekrar deneyen bir iş yok.
  - `WERTE` listesi types/FRAGEN ile ikinci kez tanımlı.

**Açık işler (Fatih)**
1. Impressum: adres, temsilci adı, telefon (sayfada mavi).
2. E-posta bildirimi: Gmail uygulama şifresi ya da Resend. O zamana kadar yeni bağışlar sadece Supabase → `donation_request` tablosunda görünüyor.
3. Vercel AVV (Hobby planı) hâlâ açık.
4. test.weiterwert.de proje domain listesinden silinmeli (`vercel api -X DELETE … --dangerously-skip-permissions`).
5. Duyurmadan önce Vercel Firewall'da hız sınırı.

**Sıradaki:** e-posta bağlantısı (Resend), ardından Faz 3 Admin-MVP (gelen bağışların listesi).

## 2026-10-27 (ana sayfa ve talep planı)

- Ana sayfaya „Wer wir sind“ bölümü eklendi; hero'da HTML animasyon (`assets/intro/`), MP4 ana sayfadan kaldırıldı. Hepsi yerel, commit/push yok.
- Yazılım adımı metni taslak: Windows lisansı hizmete dahil değil; fiyat kararı bekleniyor.
- „Cihaz talep et“ için plan taslağı: `docs/plan-cihaz-talep.md` (kurum öneri, veri minimizasyonu, Datenschutz önkoşulu, Vorgangsnummer önek `WW-A-` önerisi). Karar bekleniyor, kod yok.
- Plan güncellendi: hem kurum hem privat başvuru. Privat başvuruda tek asgari belge yüklenir (özel depo, 14 gün sonra silinir, sadece özet kaydı kalır). Upload için DSFA ve silme testi canlıya çıkmadan şart.
- Kararlar: privat belge listesi Fatih'in tablosuna göre, reddedilen başvuru 14 gün sonra silinir, bir kişi bir kez başvurur. Diğer saklama süreleri sonra. Plan: `docs/plan-cihaz-talep.md` §9–10.
- Admin girişi planı (§11): Supabase Auth + zorunlu TOTP-MFA, roller admin/mitarbeiter, erişim tablosu eklendi.
- Datenschutz-taslağı (Gerät beantragen) yazıldı: docs/taslak-datenschutz-beantragen.md. Açık: upload hukuki dayanağı, saklama süreleri, sunucu bölgesi, e-posta sağlayıcısı, avukat kontrolü. Canlıya alınmadı.
- Gerät beantragen: Seite /beantragen (Test-Modus, Flag aus) mit Kurum- und Privat-Ablauf; Tests 61/61; Upload yok.
- Tek site planı: docs/plan-tek-site.md (4 aşama; Fatih'in 3 kararı bekleniyor: EN dili, yasal sayfalar Almanca, ana sayfada banner).
- 2026-10-28: Tek site kararları kaydedildi (3 dil, yasal Almanca, ana sayfada banner). Kod değişmedi; 'hepsini yapma' kararı.

## 2026-10-27 / 28 (kapanış)

**Yayında (canlı):**
- weiterwert.de: yeni hero animasyonu, „Wer wir sind“, platform butonları (`master` 57c914d).
- spenden.weiterwert.de: sarı banner („Im Aufbau – wir prüfen jede Anfrage von Hand.“), iki üst menü butonu, logo weiterwert.de'ye gider, „Gerät beantragen“ geçici sayfası ve e-posta düğmesi.

**Yerelde hazır, canlı değil:**
- Başvuru formu, üç dil (Deutsch, Türkçe, English), port 3000. Commit 4ff0e19, branch `feature/beantragen-mehrsprachig`. Canlıda kayıt yok, bu yüzden canlıda sadece geçici sayfa kalır.
- Tek site planı: `docs/plan-tek-site.md`. Kararlar: üç dil, yasal sayfalar Almanca, ana sayfada banner.

**Testler (son durum):** statik 20/20, Vitest 63/63, Playwright 36/36 (üretim build'i), tsc temiz.

**Güvenlik kontrolü (kapanış):** Gizli anahtar, `dangerouslySetInnerHTML`, `eval` bulunmadı. Form endpoint'inde hız sınırı yok (açık madde). Hata günlüğü (`console.error`) kişisel veri içermiyor; test deposu kullanılıyor.

**Açık işler (Fatih):**
1. Tek site Aşama 1'i başlatılsın mı (sadece yerel)?
2. Formu canlıya almak için: veritabanı tablosu, veri koruma metni, istek sınırı.
3. Branch'i `master`'a alıp yayınlamak için ayrı onay.

**Not (2026-10-28):** Bugünkü iş tamamlandı. Sonraki tüm işler `feature/beantragen-mehrsprachig` dalında yapılacak; `master` yalnızca Fatih onaylayınca güncellenir.

## 2026-10-29 (kapanış)

**Canlıda (master, Git bağlı `weiterwert` projesi):**
- weiterwert.de artık platform (`weiterwert` projesi). Eski statik `techverband` projesi silindi; `spenden`/`test` alt alanları aynı projede.
- Ana sayfa platformda (DE/TR/EN), animasyon çalışıyor. Yasal sayfalar (Impressum, Datenschutz, Barrierefreiheit) `platform/public` altında statik dosyalar olarak.
- Admin (`/admin/login`, `/admin`) production'da **geçici olarak açık** (`admin` = `aktiv`, commit ed931c6). Test bitince gizlenecek.
- Son canlı commit `1d54b1c` (`.vercelignore` düzeltmesi; Git build'i bu yüzden hata vermişti).

**Commit'li, canlıya gönderilmedi (master'a push bekliyor):**
- `37ffad0` parola göz simgesi, `85bd8be`, `3d1672c` (yerel derleme klasörü git dışı).
- `07056e8` mobil başlık: dil seçici logonun karşısında, butonlar altta; animasyon çerçevesi hero ile aynı.
- `2ba2a62` buton boşluğu, alt bilgide "Team-Anmeldung / Ekip girişi / Team sign-in", canlı banner "Beta – …".
- Push, `weiterwert.de`'yi hemen günceller. Önce onay gerekiyor.

**Admin (MVP, salt okuma):** giriş e-posta+parola, token HTTP-only çerezle `/admin` yolunda, her istekte Supabase'de doğrulama, rol `app_metadata.role` (admin / mitarbeiter). Liste: vorgang, durum, tarih, cihaz türü; ad/e-posta/adres yok. Test hesapları `admin@weiterwert.de` (admin) ve `mitarbeiter@weiterwert.com` (mitarbeiter) Supabase'de; kayıt kapalı (test: 422). MFA (TOTP) projede açık; zorunlu kılma plan: `docs/admin-mfa-plan.md`.

**Güvenlik kontrolü (kapanış, manuel):** Commit geçmişinde `sbp_` (erişim anahtarı), test parolaları ve servis anahtarı yok (git grep ile doğrulandı). Bulunan: `platform/playwright.config.ts` içinde test ortamı temel-kimlik parolası `e2e-geheim` (yalnız test sunucusu; üretim değil). Admin girişinde uygulama düzeyinde hız sınırı yok; Supabase'in kendi sınırına güveniliyor (açık madde). `dangerouslySetInnerHTML` üç yerde; hepsi sabit şablon veya kaçışlı sözlük değerleri. `/code-review` skill'i bu oturumda çalıştırılmadı (maliyet); yapılan tam kapsamlı kod incelemesi değil, güvenlik odaklı elle kontrol.

**Testler (son durum, 2ba2a62):** Vitest 75/75, Playwright 46/46, `tsc` temiz, statik 20/20. Mobil ölçüm: 320, 390, 412, 1280 px; DE/TR/EN/Spenden; yatay taşma yok.

**Açık işler (Fatih):**
1. Push onayı: `master`'a gönderilsin mi (weiterwert.de canlı güncellenir)?
2. Admin production'da kapatılacak mı, yoksa MFA zorunlu olana kadar açık mı kalacak? (Şu an açık.)
3. Admin test parolalarını yenile: parolalar sohbette ve yerel girişte kullanıldı.
4. Banner metni: "Beta" (önerilen) mi, "Beta-Version" mi?
5. Ana sayfaya ayrıca giriş düğmesi istenirse eklenecek (şu an sadece alt bilgide).
6. Vercel AVV / Supabase DPA ve Datenschutz boşlukları (önceki oturumdan) hâlâ açık.

**Sonraki adım:** Onay gelince push + canlı kontrol; sonra admin'i kapatma/MFA kararı.

## 2026-10-29 (ikinci kapanış)

**Canlıda (`master` 668db89, derleme tamamlandı):**
- Banner (live): "Die Seite befindet sich derzeit in der Testphase." (TR "Site şu an test aşamasında.", EN "The site is currently in its test phase."). Fatih seçti (a).
- Ana menüde "Team-Anmeldung" (TR "Ekip girişi", EN "Team sign-in") → `/admin/login`. Mobilde tam genişlik, masaüstünde sakin kenarlıklı düğme. Alt bilgideki bağlantı da duruyor.

**Commit'li, canlıda (önceki):** `7fe4912` ana sayfa stil dosyası kök düzende (buton titremesi giderildi; canlıda doğrulanmadı).

**Kontrol:** Statik 20/20, Vitest 75/75, Playwright 46/46, `tsc` temiz. Başlık 320/390/412/1280 px'te taşmıyor. Canlı: banner ve menü düğmesi `weiterwert.de` HTML'inde görünüyor.

**Güvenlik kontrolü (ikinci):** `git grep` ile HEAD'de gerçek erişim anahtarı, test parolaları ve servis anahtarı yok (yalnızca bu günlükteki açıklama metni `sbp_` kalıbını içeriyor). Yeni giriş bağlantısı düz `href`; kimlik doğrulama değişmedi. `/code-review` skill'i çalıştırılmadı.

**Açık işler (Fatih):**
1. Admin production'da açık (geçici). Kapatma/MFA kararı bekleniyor (yukarıdaki hatırlatmalara bak).
2. Test parolalarını yenile (Supabase → Authentication → Users → Send password recovery).
3. Vercel AVV / Supabase DPA ve Datenschutz boşlukları.
4. Titreme düzeltmesini canlıda gözle kontrol et (buton geçişleri).

**Sonraki adım:** Admin kararı ve parola yenilemesi; ardından MFA zorunlu hale getirme planı.

## 2026-10-28 (profil parola kararı)

**Fatih kararları (kaydedildi, uygulanmadı; sonra devam edilecek):**
- Parola en az 12 karakter, ayrıca büyük harf, küçük harf ve rakam içermeli (şu an kodda yalnız 12 karakter kontrolü var: `platform/src/lib/admin/profil.ts`).
- Parola değişince diğer oturumlar kapatılacak (şu an değişmedi; açık not).

**Sonraki adım:** Kararı `profil.ts` ve testlere uygula, sonra Supabase tarafında diğer oturumları kapatma çağrısını ekle; mobil kontrol (320/390/412 px) ve test.

**Kapanış (2026-10-28):** Statik 20/20, tsc temiz, Vitest 113/113 (18 dosya), Playwright 69/69. Güvenlik bakışı: `konto.ts` ve `profil/actions.ts` elle okundu; her işlem token ve rolü Supabase'de yeniden doğruluyor, service key tarayıcıya gitmiyor. Bulgu yok; bilinen açıklar: parola değişince oturumlar kapanmıyor, uygulama düzeyinde hız sınırı yok. `/code-review` skill'i bu kapanışta çalıştırılmadı (haftalık kullanım sınırı). Parola kuralı (12+, büyük/küçük/rakam) henüz kodda yok; commit mesajında açık.
Commit yerelde; push ve deploy yok. `tsconfig.json`, `.claude/`, `.next-local*` ve iki mp4 bilerek commit'e girmedi.

## 2026-10-28 (canlı deploy ve Gerät beantragen kararı)

**Deploy:** spenden.weiterwert.de (Vercel `weiterwert`, Root Directory `platform` → `.`, Fatih panelden değiştirdi) `vercel deploy --prod` ile yayınlandı; hedef production, `/`, `/tr`, `/en`, `/spenden`, `/annahmekriterien`, `/admin/login` 200. Canlıda mobil kontrol ve gerçek Supabase ile profil denemesi yapılmadı.

**Git:** `feature/beantragen-mehrsprachig` origin'e push edildi (commit `d57a550`). `master` ve weiterwert.de değişmedi.

**Kararlar:**
- Vercel proje ayarı (Root Directory) değişikliği otomatik güvenlik kontrolüne takıldı; Claude bunu API ya da tarayıcıdan denemedi, Fatih elle yaptı. Kalıcı izin kuralı eklenmedi.
- "Gerät beantragen" formu açılmadı. Üretimde kayıt yeri yok (`waehleAntragSpeicher()` yalnız test ortamında dönüyor), belge yükleme yapılmadı, cihaz sınırı (kodda 10) ve Kurum/Privat kararı açık. Canlıda bekleme sayfası kalıyor.

**Açık işler (Fatih):**
1. Gerät beantragen için seçenek: (1) bekleme sayfası kalsın (önerilen), (2) belgesiz ön başvuru, (3) belge yüklemeli tam sürüm. Karar gelmeden kod yazılmaz.
2. Profil: parola kuralı (12+, büyük/küçük harf, rakam) ve diğer oturumları kapatma henüz uygulanmadı.
3. Canlı mobil kontrol (320/390/412 px) spenden ve profil için.

## 2026-11-12 (Admin: Status, Protokoll, Fotos, Parola-Kuralı, Canlı-Hazırlık)

**Yapılan (yerel, bu commit):**
- Vorgang-Detail: Statusablauf Neu → Geprüft → Zugeordnet → Übergeben → Abgeschlossen (nur nächster Schritt). Protokoll zuerst, dann Änderung.
- `admin_audit`: Statuswechsel, PDF-Downloads, Fotoansicht, Fotolöschung. Migration `20261112_admin_audit.sql` in Supabase ausgeführt.
- Passwortregel (12+, Groß-/Kleinbuchstaben, Ziffer) in Profil und Passwort-Zurücksetzen.
- Gerät-Foto nach der Anfrage: JPEG/PNG, bis 3 Fotos, je 4 MB, EXIF/XMP/Text-Metadaten entfernt (7 Tests), 14 Tage Löschfrist. Feature `geraetFoto` ist in der Produktion **verborgen**. Migration `20261112_donation_photo.sql` ist **noch nicht** ausgeführt.
- Plan für Admin-Module: `docs/plan-admin-aufgaben.md`.

**Tests:** tsc, 128 Vitest, 20 Statik, 70 Playwright, `next build` grün.

**Bekannt:** `BeantragenForm.tsx` hat einen ESLint-Fehler (setState im Effekt), nicht aus dieser Änderung.

**Offen (Fatih):**
1. Supabase: Site URL steht auf `http://localhost:3000` (Sicherheitsprüfung hat die Änderung blockiert). Canlı-Mailbağlantıları için `https://weiterwert.de` setzen und Redirect-URL `…/admin/passwort-neu` für die Produktion hinzufügen.
2. `test-admin@weiterwert.de`: gesperrt (ban), später löschen.
3. Foto-Migration im SQL-Editor ausführen, dann Foto-Funktion prüfen. Vor Live-Schaltung: Datenschutztext, DSFA, Löschtest.

## 2026-11-13 (Spenden-Foto Pflicht, Admin-Ausbau, Admin Türkisch, PDF-Fix)

**Spenden (`/spenden`):**
- Fotos sind Pflicht, wenn das Feature aktiv ist: mindestens 1, höchstens 3. Auswahl im Schritt "Absenden", ohne Foto ist "Anfrage absenden" gesperrt.
- Upload erst nach dem Speichern der Anfrage, eine Datei pro Aufruf (Vercel-Limit 4,5 MB). Bei Fehler bleibt die Vorgangsnummer, "Fotos erneut senden" setzt fort.
- Gerekçe-Text (DE/TR/EN): Fotos zuerst für die Erstprüfung, Gerät erst nach Rückmeldung senden (CO₂, Versand, Aufwand).
- Feature `geraetFoto` bleibt **verborgen**. Canlıda foto alanı yok, zorunluluk da yok.

**Admin (`/admin`, `/tr/admin`):**
- Liste: Marke/Modell, Status-Pille, Datum, Fotozahl, ganze Zeile klickbar, Mobil als Karten.
- Detail: Reihenfolge Status, Geräte, Fotos, Kontakt, Protokoll (eingeklappt), Löschen. Nur beantwortete Angaben, Rest als "Keine Angabe".
- Kontakt bearbeiten (Admin und Mitarbeiter). Geräteantworten und Erklärungen bleiben schreibgeschützt. Protokoll enthält geänderte Feldnamen, keine Werte.
- Vorgang löschen (nur Admin): Zweistufig, ohne Browser-Dialog. Protokoll zuerst, dann Fotodateien, dann Zeile (Kaskade löscht Kontakt, Geräte, Foto-Zeilen).
- Türkische Oberfläche über `src/lib/i18n/admin.ts`. Englisch fällt auf Deutsch zurück. PDF bleibt Deutsch.
- Sitzungs-Cookie-Pfad von `/admin` auf `/` geändert, weil der Browser sonst unter `/tr/admin` kein Cookie sendet. Abwägung: Cookie wird nun bei allen Seiten mitgeschickt (httpOnly, sameSite=lax).

**Dev-Vorschau (nur `next dev` + `APP_ENV=test`):** Anfragen und bereinigte Fotos im Serverspeicher (`src/lib/dev/vorschau.ts`), Liste/Detail/Fotos/PDF/Löschen funktionieren damit lokal. Verloren beim Neustart. Canlıda ve test build'te kapalı.

**Sonstiges:**
- PDF-Schrift: Inter Latin und Latin-Ext waren getrennt; die Datei mit nur Latin-Ext ließ alle Buchstaben als "V/W" erscheinen. Jetzt eine zusammengeführte TTF (`public/fonts/inter-merged-{400,700}.ttf`), Subsetting an.
- PDF-Download lokal ohne Protokolleintrag (nur Dev-Vorschau), Produktion unverändert.
- `<html lang>` mit `suppressHydrationWarning`: Sprachskript setzt `lang` vor der Hydration; sonst Hydration-Warnung auf allen `/tr`- und `/en`-Seiten.
- Admin-Seiten nicht mehr als "nur Deutsch" markiert.

**Tests:** tsc sauber, vitest 128, Playwright 71, `test:static` 20. Gegen die Live-Datenbank nicht getestet: Kontakt bearbeiten, Löschen, Foto-Löschen im Produktionszweig. Keine neue SQL-Migration nötig.

**Nicht deployt.** Branch lokal, nicht gepusht.

**Offen (Fatih):**
1. Foto-Feature: Live-Schaltung erst nach Datenschutztext, AVV und DSFA. Entscheidung, ob das Flag aktiviert wird.
2. Foto-Obergrenze 4 MB: Telefonfotos werden abgelehnt. Im Browser verkleinern?
3. Supabase Redirect URLs: `…/tr/admin/passwort-neu` (und `/en/…`) eintragen, sonst funktioniert der Reset-Link auf Türkisch nicht.
4. Admin auf Englisch übersetzen?
5. Begründungen in der Datenbank bleiben deutsch gespeichert. Nur bekannte Sätze werden übersetzt.

## 2026-11-13 (Betroffenenanfragen, Foto-Frist-Cron)

**Neu:**
- `/admin/betroffene` (nur Admin): Suche nach E-Mail, Auskunft als JSON (Art. 15) und Löschung aller Vorgänge einer Person (Art. 17), zweistufig. Die Auskunft wird im Protokoll festgehalten; ohne Protokolleintrag wird nichts herausgegeben.
- `/admin/betroffene/auskunft?email=…`: JSON-Datei. Fotos sind nur als Anzahl enthalten, nicht als Dateien.
- `/api/cron/fotos-loeschen`: löscht Fotos nach Fristablauf (14 Tage). Geschützt durch `CRON_SECRET`, ohne Geheimnis 503. `vercel.json`: täglich 03:30 UTC.
- Lösch-Logik in `src/lib/admin/loeschen.ts`, von Einzel- und Sammellöschung gemeinsam genutzt.

**Tests:** tsc, vitest 130, Playwright 71, test:static 20, Lint sauber. Dev-Browsertest: Suche, Auskunft (200, attachment), Löschung, danach leer.

**Nicht erledigt / offen:**
1. Vor dem Cron-Lauf in Vercel `CRON_SECRET` setzen (Fatih). Ohne das bleibt der Cron wirkungslos (503).
2. Der 401-Pfad mit gesetztem Geheimnis ist nur per Code gelesen, nicht getestet.
3. Betroffenenseite gegen die Live-Datenbank nicht getestet. E-Mail-Suche in der Datenbank ist exakt (Groß-/Kleinschreibung zählt).
4. Dokumentation: Datenschutztext muss Auskunft und Löschung auf Wunsch nennen.

## 2026-11-13 (Übergabeprotokoll, Erinnerungen)

**Neu:** Übergabeprotokoll als PDF (`/admin/vorgang/[nr]/uebergabe`): gleiche Vorgangsdaten wie das Vorgangsblatt, dazu Abschnitt „Übergabe“ mit Übergabeort, Datum, Seriennummern je Gerät und zwei Unterschriftszeilen. Hinweis: keine Weiterveräußerung. Download wird protokolliert (außer lokaler Vorschau). Text im PDF bleibt Deutsch.

**Tests:** tsc, vitest 131, Playwright 71, test:static 20, Lint sauber. Lokal: PDF erzeugt und als Bild geprüft.

**Erinnerungen (Fatih):**
1. DNS: Beim Domain-Anbieter den Eintrag für `spenden` prüfen und ggf. löschen.
2. Vercel: Alte Deployments aufräumen (Liste gemeinsam auswählen, Löschen ist endgültig).
3. `CRON_SECRET` in Vercel setzen (Foto-Frist-Cron).
4. Migration `20261112_donation_photo.sql` im Supabase SQL-Editor ausführen, falls noch nicht geschehen.
5. Supabase Redirect-URLs für `/tr/admin/passwort-neu` ergänzen.

**Deploy-Hinweis:** `platform/.vercel` zeigt auf das Projekt `weiterwert`, das `weiterwert.de` besitzt. Jeder `vercel deploy --prod` ändert deshalb die Hauptdomain. Vor dem nächsten Deploy klären.

## 2026-11-13 (Geräteakte, Löschprotokoll, Entsorgungsnachweis, Envanter)

**Neu:**
- Geräteakte je Gerät (`/admin/vorgang/[nr]/akte`): Seriennummer, Lagerort, Zustand, Löschverfahren, Löschdatum, Gelöscht von, Entsorgungsweg, Entsorgungsfachbetrieb, Nachweisnummer, Entsorgungsdatum. Auswahlfelder mit fester Liste. Admin und Mitarbeiter. Änderungen werden protokolliert (nur geänderte Feldnamen).
- Löschprotokoll-PDF und Entsorgungsnachweis-PDF je Vorgang (nur Geräte mit eingetragener Löschung bzw. Entsorgung). Downloads werden protokolliert (außer lokale Vorschau). Inhalt bleibt deutsch, wie bei den amtlichen Belegen.
- Envanter (`/admin/envanter`): alle Geräte mit Seriennummer, Zustand, Lagerort, Löschverfahren. CSV-Download (Semikolon, UTF-8 mit BOM).

**Datenbank (noch nicht angewendet):** `supabase/migrations/20261113_device_record.sql`. Bis zur Anwendung: Die Geräteakte kann in Produktion nicht gespeichert werden (Meldung wird angezeigt). Die Vorgangsseite lädt trotzdem, weil die Abfrage bei fehlender Tabelle ohne Geräteakte wiederholt wird.

**Tests:** tsc, vitest 139, Playwright 71, test:static 20, Lint sauber. Lokal: Anfrage angelegt, Akte gespeichert, beide PDFs und CSV geprüft (als Bild).

**Offen (Fatih):**
1. Migration `20261113_device_record.sql` im Supabase-SQL-Editor ausführen.
2. Vor dem Deploy: `platform/.vercel` zeigt auf das Projekt `weiterwert` (Hauptdomain). Klären.
3. Erinnerungen aus dem letzten Log (DNS-Eintrag `spenden`, alte Deployments, `CRON_SECRET`, Supabase-Redirect-URLs).

**Review (medium) vor Deploy, Befunde behoben:**
- Vorgangsabfrage fällt nur noch bei HTTP 400 auf den Rückfall zurück. Vorher hätte ein vorübergehender Fehler die Geräteakte leer erscheinen lassen, und ein Speichern hätte Nachweise überschrieben.
- Foto-Abfrage im Envanter/Liste: gleiche Regel (nur 400).
- CSV: Zellen mit `=`, `+`, `-`, `@` werden mit Apostroph entschärft (Formelinjektion).
- Vorgang löschen: Kontakt zuerst (Kaskade entfernt Anfrage, Geräte, Akte). Schlägt das fehl, bleibt kein verwaister Kontakt zurück.
- Auskunft: Fotofehler bricht ab, statt 0 auszugeben.
- Betroffenen-Suche: E-Mail ohne Groß-/Kleinschreibung (ilike mit Escaping).
- Sammellöschung: Ausnahmen werden als Teilerfolg gemeldet.

**Bekannte Grenzen (nicht behoben):** Vorgangsliste und Envanter sind auf 200 Vorgänge begrenzt; Envanter lädt je Vorgang eine Abfrage. Cron: Protokollfehler nach dem Löschen wird als fehlgeschlagen gezählt.

## 2026-11-17 (Geräte-Ablauf, Admin, Nachweise)

**Ne değişti:**
- Geräte-Ablauf: Regeln (`platform/src/lib/admin/geraet-ablauf.ts`), Gesamtprozess als Daten (`geraet-prozess.ts`), Durumsanzeige je Schritt. Admin-Seite `/admin/ablauf` (nur Test/Entwicklung, `ablauf-sichtbar.ts`).
- Vorgang-Seite: Zweite Kontrolle je Gerät, Annahme (Dok. 18), Übergabe (Dok. 28), Löschung (Dok. 07). Jeweils dijital mit Häkchen, Unterschrift (Zeichnung), Kettenprüfsumme und gespeichertem PDF.
- Zweite Person (Punkt 13): eigene Anmeldung, Passwort nur geprüft, nicht gespeichert (`zweite-freigabe.ts`).
- Zwei-Admin-Regel jetzt nach Dok. 07: nur bei fehlgeschlagener Löschung, Ausnahme oder Vernichtung.
- PDFs: `protokoll`-Tabelle, unveränderlich, eine Version je Vorgang und Art. Übergabe und Löschprotokoll werden beim ersten Download gespeichert.
- Texte DE + TR (`src/lib/i18n/ablauf.ts`).

**Migrationen (Supabase, test projesi):** 20261117, 20261118, 20261119, 20261120, 20261121 ausgeführt. 20261122 ausstehend.

**Entscheidungen (Berater, vorläufig, Team bestätigt):** Annahme unterschreibt angemeldete Person; Spender-Unterschrift zunächst Papier; Reihenfolge Annahme, Übergabe, Löschung. Rechtliche Prüfung der elektronischen Unterschrift vor Livegang offen.

**Dok. 07, 18, 28 aus Drive gelesen** (Repo-Kopie fehlt). Löschprotokoll Dok. 20 fehlt in Drive.

**Offen:**
- Migration 20261122 in Testdatenbank ausführen.
- Übergabe/Löschung Status an Gerät koppeln (uebergeben, geloescht).
- Entsorgung digital; Dok. 28 "Inventar vergeben" intern.
- Gerçek veritabanı testi, mobil 320 px, Playwright e2e (Build hängt an Next.js-Sicherheitshinweis).
- Saklama: Dok. 13/18/28 nennen 10 Jahre, Punkt 6 bitte bestätigen.
- Hukuki prüfung elektronische Unterschrift.
