# WeiterWert – çalışma günlüğü

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
