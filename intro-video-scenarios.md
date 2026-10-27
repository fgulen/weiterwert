# WeiterWert — Tanıtım Videosu: Ana Senaryo, 5 Senaryo ve Alternatifler

> **Amaç:** `index.html` ana sayfasında yaptığımız işi anlatan kısa ve görsel zenginlikte bir intro / tanıtım videosu. Videolar **LTX 2.5** ile üretilir, hareket **HyperFrames** ile canlandırılır; sahneler arası geçişler, animasyonlar, hareket ve metinler bu senaryolarda tanımlıdır.
>
> **Video konsepti:** „Ein Gerät, ein Weg, eine Chance.“ — Ein gespendeter Laptop / Tablet: **Sammeln → Sicher löschen → Reparieren & Reinigen → Software installieren → Ausliefern → Übergabe**.
>
> **Format:** 16:9 · 1920×1080 · Ana video ~24 sn · Sahneler 3–8 sn · Geçişler ~0,8–1,5 sn · Metinler Almanca (DE, site dilinin temeli).

---

## 1. Video Brief — ANA SENEARYO

### 1.1 Konsept

- **Başlık:** „Technik weitergeben. Chancen eröffnen.“
- **Hikâye akışı:** Bozuk / kullanılmayan bir laptop → Sammelbox → (güvenli silme) → tamir → yazılım kurulumu → öğrenci / öğretmene teslim → yeni fırsat.
- **Ton:** Sıcak ama teknik; pazarlama değil, dürüstlük hissi veren, el yapımı hissettiren minimal animasyon.

### 1.2 Süre dağılımı (ana video)

| Saat | Sahne | Süre | İçerik / Kaynak bölümü |
|---|---|---|---|
| 0:00–0:05 | Sahne 1 | 5 sn | Hero: Gerätsweg + Motto |
| 0:05–0:10 | Sahne 2 | 5 sn | Mitmachen: Vier Wege |
| 0:10–0:15 | Sahne 3 | 5 sn | Prozess: Fünf Schritte |
| 0:15–0:19 | Sahne 4 | 4 sn | Vertrauen: Belegbare Geschichten |
| 0:19–0:24 | Sahne 5 | 5 sn | Ansatz & CTA: Outro |

Toplam: **24 sn**.

### 1.3 Stil ve teknik

- **Zemin:** `--bg:#F4F7F8` (saydam, koyu mürekkep `#16242C`).
- **Marka renkleri:** navy `#064E67`, green `#1E7451`, lime `#52973C`, blue `#238EB2`, sun `#FBC131`.
- **Font:** Inter, 800 (başlık) / 600 (metin) — self-hosted, web fontu.
- **Müzik:** Ambient / chill-upbeat, ~90–110 BPM; sonunda CTA enerjisi.
- **Ses:** Ambient + efektler (kutu kapağı, düğme sesi, el dokunuşu).
- **Kamera:** Yavaş push-in; sahneler arası ileri kayma.

---

## 2. Ana Senaryo — TAM STORYBOARD (5 SAHNE)

### Sahne 1 — Hero: Gerätsweg (0:00–0:05) → **Senaryo 1**

- **Görsel:** Hero SVG yolculuğu: Sammeln (kutu) → Reparieren (laptop + wrench) → Software (laptop + gear) → Ausliefern (el teslimi). Oklar accent rengi.
- **Animasyon:** Yolculuk çizgisi draw-on; node’lar renkli yanıp sönsün; oklarda hareketli nokta; kutudan cihaz çıkışı.
- **Overlay metin:** „Sammeln → Reparieren → Software → Ausliefern“ (staggered); sonda: „Technik weitergeben. Chancen eröffnen.“
- **Kamera:** Yavaş push-in.

### Sahne 2 — Mitmachen: Vier Wege (0:05–0:10) → **Senaryo 2**

- **Görsel:** 2×2 grid: Gerät spenden / Gerät beantragen / Geräte im Bestand spenden / Freiwillig transportieren.
- **Animasyon:** Grid stagger; kartlar tek tek belirir; vurgu pulse.
- **Overlay metin:** „Vier Wege, Teil des Netzwerks zu werden.“
- **Kamera:** Grid → odaklı kart kamera pan.

### Sahne 3 — Prozess: Fünf Schritte (0:10–0:15) → **Senaryo 3**

- **Görsel:** 5 adım numaralı (Sammeln, Sicher löschen, Reinigen & Reparieren, Software installieren, Ausliefern) + bağlantı çizgileri.
- **Animasyon:** 1→5 sırayla glow + number pop.
- **Overlay metin:** `howEyebrow` / `howH2` / `howP` anahtarlarından (site ile birebir).
- **Kamera:** Merkezde yavaş pan.

### Sahne 4 — Vertrauen: Belegbare Geschichten (0:15–0:19) → **Senaryo 4**

- **Görsel:** Story card (medya placeholder) + shield/check animasyonu; Freiwillige roller (Technik / Logistik / Koordination).
- **Animasyon:** Shield glow; kart vurgu.
- **Overlay metin:** „Belegbare Geschichten statt Marketing.“
- **Kamera:** Story kartına yakın çekim.

### Sahne 5 — Ansatz & CTA: Outro (0:19–0:24) → **Senaryo 5**

- **Görsel:** Logo mark + motto; CTA butonu „Laptop oder Tablet spenden“ + „Gerät beantragen“; ok animasyonu.
- **Animasyon:** Logo parlama → CTA glow → ok.
- **Overlay metin:** „Kein Gerät soll im Müll landen — stattdessen soll es einer Person neue Möglichkeiten eröffnen.“ + CTA / `spenden.weiterwert.de/spenden`.
- **Kamera:** Yavaş dolly out.

---

## 3. Ana Sayfa Bölümleri → 5 SENARYO

### Senaryo 1 — Hero: Der Gerätsweg

- **Kapsam:** `index.html` → Hero (`#top`) — „Technik weitergeben. Chancen eröffnen.“
- **Sahne süresi:** 5 sn (ana video Sahne 1 ile birebir aynı).
- **Görsel:** Soft bg, kutu → ok → laptop+wrench → ok → laptop+gear → ok → el → laptop → öğrenci.
- **Animasyon:** Draw-on çizgi, renkli node yanıp sönme, hareketli ok, hareketli cihaz.
- **Overlay metinler:** Adım etiketleri + final motto.
- **Ses:** Ambient + çizgi sesi efekti.
- **Kamera:** Slow push-in.
- **LTX 2.5 prompt:** `flat illustration of a donation journey: cardboard box, dashed arrow, laptop with wrench, dashed arrow, laptop with gear, dashed arrow, hand delivering laptop, soft light gray background, brand colors navy green blue sun, gentle continuous motion, no text`
- **Hedef geçiş:** Sahne 2 — „renkli ok, dört kapıya (Vier Wege) çarpıyor“.

### Senaryo 2 — Mitmachen: Vier Wege

- **Kapsam:** `index.html` → `#mitmachen` — „Vier Wege, Teil des Netzwerks zu werden“
- **Sahne süresi:** 5 sn (ana video Sahne 2 ile aynı).
- **Görsel:** 2×2 kart grid (privatperson / schule+familie / unternehmen / aktiv).
- **Animasyon:** Grid stagger (her kart 0,6 sn arayla), hover-lift, vurgu pulse.
- **Overlay metinler:** Başlık + kart başlıkları tek tek: „Gerät spenden“, „Gerät beantragen“, „Geräte im Bestand spenden“, „Freiwillig transportieren“.
- **Kamera:** Grid → odaklı kart.
- **LTX 2.5 prompt:** `four cards with icons appearing on soft background, gentle stagger animation, minimal style, brand colors, no text`
- **Hedef geçiş:** Sahne 3 — „kart, adım halkasına dönüşüyor“.

### Senaryo 3 — Wie funktioniert's?: Fünf Schritte

- **Kapsam:** `index.html` → `#so-funktionierts` — „Vom Spenden bis zur Übergabe durchläuft jedes Gerät dieselben fünf Schritte.“
- **Sahne süresi:** 5 sn (ana video Sahne 3 ile aynı).
- **Görsel:** 5 adım numaralı + çizgi.
- **Animasyon:** 1→5 sırayla glow, number pop.
- **Overlay metinler:** Eyebrow „Prozess“, H2 „Wie funktioniert es?“, alt metin.
- **Kamera:** Merkez pan.
- **LTX 2.5 prompt:** `five step circles numbered one to five glowing sequentially, connected by lines, clean minimal design, brand colors, no text`
- **Hedef geçiş:** Sahne 4 — „adım glow’i kalkan (shield) glow’ine evriliyor“.

### Senaryo 4 — Vertrauen: Belegbare Geschichten

- **Kapsam:** `index.html` → `#vertrauen` — „Belegbare Geschichten statt Marketing“
- **Sahne süresi:** 4 sn (ana video Sahne 4 ile aynı).
- **Görsel:** Story card + shield/check, Freiwillige roller kartları.
- **Animasyon:** Shield glow; kart vurgu.
- **Overlay metinler:** „Belegbare Geschichten statt Marketing.“ + alt: „Nach unseren ersten Gerätelieferungen veröffentlichen wir hier echte Übergaben…“
- **Kamera:** Story kartına yakın çekim.
- **LTX 2.5 prompt:** `story card with shield icon and checkmark, trust theme, soft background, gentle animation, no text`
- **Hedef geçiş:** Sahne 5 — „kalkan → motto + CTA“.

### Senaryo 5 — Ansatz & CTA: Outro

- **Kapsam:** `index.html` → `#unser-ansatz` + Footer CTA — „Wir starten klein und bleiben transparent“; CTA: „Laptop oder Tablet spenden“ / `spenden.weiterwert.de/spenden`.
- **Sahne süresi:** 5 sn (ana video Sahne 5 ile aynı).
- **Görsel:** Logo mark + motto, CTA butonu, ok animasyonu.
- **Animasyon:** Logo parlama → CTA glow → ok.
- **Overlay metinler:** `approachH2` („Wir starten klein und bleiben transparent“) + `heroCtaPrimary` + URL. (Eski uzun cümle „Kein Gerät soll im Müll landen…“ 5 sn'ye sığmadığı için kaldırıldı.)
- **Kamera:** Yavaş dolly out.
- **LTX 2.5 prompt:** `brand logo animation, glowing call to action button, arrow, clean minimal design, brand colors, no text`
- **Son geçiş:** Video kapanış / tekrar logo.

---

## 4. Geçiş Senaryoları (LTX 2.5 → HyperFrames)

| # | Gidiş | Animasyon | Süre | Metin davranışı |
|---|---|---|---|---|
| 1 | Sahne 1 → 2 | Renkli ok, dört kapıya çarpışma | 1,0 sn | Ok → 4 kart ikonuna dönüşür; kartlar staggers başlar |
| 2 | Sahne 2 → 3 | Kart → adım halkası | 0,9 sn | Seçili kartın ikonu → adım numarasına (1) dönüşür |
| 3 | Sahne 3 → 4 | Adım glow → shield glow | 1,0 sn | Glow merkezi shield’e evrilir; check çarpışması |
| 4 | Sahne 4 → 5 | Shield → motto + CTA | 1,2 sn | Shield silinir, motto ve CTA belirir |

**Her geçiş için üretim notu:**
- **LTX 2.5 prompt (EN):** `morphing motion from [A] to [B], smooth transition, soft background, brand colors, gentle easing, no text`
- **HyperFrames:** Frame interpolation ile geçiş animasyonunu yumuşat; overlay metinler geçişte opacity/blur ile belirir (0,8 sn gecikmeli başlat).
- **Ses:** Geçişlerde hafif „sweep“ sesi; metin değişimlerinde tick.

---

## 5. Alternatif Senaryolar

### Alternatif 0 — Ana video için: „15 sn Hızlı Tanıtım / Teaser“
- **Amaç:** LTX 2.5 üretim maliyetini düşür, daha hızlı tanıtım.
- **İçerik:** Sahne 1 (Gerätsweg) kısmen + Sahne 5 (CTA) + mottoda vurgu.
- **Süre:** 15 sn.

### Alternatif 1 — Senaryo 1: El çizimi / sketch stili
- **Değişiklik:** Koyu kahve çizgiler, kağıt dokusu hissi; node’lar elle çizili görünüm.
- **LTX 2.5 prompt:** `hand-drawn sketch style, warm brown lines, paper texture background, donation journey illustration, gentle motion, no text`
- **Metin:** Daha kalın, yuvarlak font uyumu.

### Alternatif 2 — Senaryo 2: Isometric 3D
- **Değişiklik:** Kartlar iso 3D kutu gibi yükselir; grid 3D.
- **LTX 2.5 prompt:** `isometric 3D animation of four door cards floating, soft studio light, brand colors, gentle motion, no text`

### Alternatif 3 — Senaryo 3: Tek cihaz hikâyesi / kinetic typography
- **Değişiklik:** Tek laptop hikâyesi + 5 adımda metin hareketi (kinetic type) yerine görsel node’lar.
- **LTX 2.5 prompt:** `single laptop story, five scenes shown as kinetic typography steps, bold modern font, soft background, motion, no text`

### Alternatif 4 — Senaryo 4: Gerçek teslimat fotoğrafı (YALNIZCA gerçek çekimle)
- **Değişiklik:** Story card yerine gerçek bir teslimatın gerçek fotoğrafı/kaydı.
- **Kural:** LTX ile üretilen „gerçek foto“ KULLANILMAZ. Site „Belegbare Geschichten statt Marketing“ diyor; yapay görüntü bu vaadi çiğner. Bu alternatif ancak ilk gerçek teslimattan sonra, gerçek görüntüyle mümkün.
- **Şu an:** Story card + „Foto folgt“ etiketi (PoC'de bu şekilde).

### Alternatif 5 — Senaryo 5: Dark + lime tema, enerjik CTA
- **Değişiklik:** Koyu bg (`#0E1B20`), lime accent; CTA renkli.
- **LTX 2.5 prompt:** `dark background, lime green accent, glowing call to action, brand logo animation, energetic motion, no text`

---

## 6. Overlay Metinleri (On-Screen Copy — Almanca)

| Saat | Sahne | Metin | Tipografi | Animasyon |
|---|---|---|---|---|
> **Düzeltme (2026-10-27):** Metinler site anahtarlarından (`data-i18n`) alınır, elle yazılmaz. H1 en az 2,5 sn ekranda kalmalı; sahne 5'te uzun cümle yerine site başlığı + CTA kullanılır.

| Saat | Sahne | Metin (site anahtarı) | Tipografi | Animasyon |
|---|---|---|---|---|
| 0:00–0:02,5 | 1 | Etiketler: `svgLabel1–4` (Sammeln / Reparieren / Software / Ausliefern) | Label, 600 | Düğüm pop + etiket fade |
| 0:03,6–0:05 | 1 | `heroH1` „Technik weitergeben. Chancen eröffnen.“ | H1, 800 | Staggered blur in |
| 0:05–0:10 | 2 | `pathsH2` + kart başlıkları `path1Title–path4Title` | H2 + kart | Staggered rise |
| 0:10–0:15 | 3 | `howEyebrow`, `howH2`, adım adları `step1Title–step5Title`, `howP` | Eyebrow / H2 / body | Pop + sıralı ray |
| 0:15–0:19 | 4 | `trustH2` „Belegbare Geschichten statt Marketing“ + „Foto folgt“ | H2, 800 | Fade up |
| 0:19–0:24 | 5 | `approachH2` „Wir starten klein und bleiben transparent“, `heroCtaPrimary`, `spenden.weiterwert.de/spenden` | H2 / CTA | Logo pop → CTA glow |

Not: `howP` cümlesi ve `approachH2` site ile birebir aynıdır; video ile site arasında kopya çıkmaz.

---

## 7. Üretim Notları

### 7.0 Düşük bakım şablonu ilkesi (PoC'nin temeli)

- **Metin koda girmez:** Overlay metinleri `docs/video-poc/copy.js` dosyasından gelir. Bu dosya `docs/video-poc/extract-copy.mjs` ile `index.html` içindeki DE/TR sözlüğünden üretilir. Site metni değişince yalnızca bu script yeniden çalışır; video dosyası düzenlenmez.
- **Marka tokenları:** Renkler site ile aynı (`--brand-navy` vb.). Renk değişirse tek yerden değişir.
- **LTX çıktısında yazı yok, renk yok:** LTX yalnızca doku/B-roll için (ör. kart arka planı). Yazı ve marka renkleri şablonda kalır.
- **Dil:** `?lang=tr` ile aynı şablon TR sürümünü üretir; ikinci bir video yapılmaz.
- **Yeniden üretim:** Tasarım veya metin değişince sadece yeniden render edilir; sahneler yeniden çizilmez.
- **Ses:** XTTS-v2 ticari kullanıma kapalı → seslendirme kullanılmaz. Varsayılan: müzik + efekt + metin.

### 7.1 Ana sayfadaki animasyon (2026-10-27 güncellemesi)

- **Yerleşim:** Hero'daki statik çizimin yerine HTML animasyonu geçti (760 px ve üstü, reduced-motion kapalıyken). Telefonlarda ve reduced-motion'da statik SVG kalır.
- **Dosyalar:** `assets/intro/intro-anim.css`, `assets/intro/intro-anim.js`; işaretleme `index.html` içinde `.ia-wrap`.
- **Duraklat/Oynat:** Düğme var; animasyon ancak çerçeve ekranda göründüğünde başlar, bir kez oynar ve son karede kalır.
- **MP4:** Ana sayfadan kaldırıldı. Arkadaşlara paylaşmak için `docs/video-poc/intro-poc-*.mp4` kalır.
- **Eski not (geçersiz):** Aşağıdaki MP4 slot kuralları yalnızca paylaşılan dosya için geçerli.
- **Şimdilik yalnızca yer ayrılır:** Dosya yokken boş oynatıcı eklenmez.
- **Kendi sunucumuzdan:** YouTube/Vimeo gömülmez. Datenschutz „Wir setzen keine Cookies und verwenden keine Analyse- oder Marketingdienste.“ diyor. Bir YouTube/Vimeo gömmesi yeni bir üçüncü taraf ekler ve cookie getirebilir; bu da Datenschutz'la çelişir. (Bugün işleyen tek dış hizmetler Vercel, Supabase ve Gmail; hepsi Datenschutz'da adıyla geçiyor.)
- **`preload="none"`**, poster görseli, sesli otomatik oynatma yok.
- **`prefers-reduced-motion`:** Hareketsiz son kare gösterilir.
- **Altyazı veya metin alternatifi zorunlu** (`barrierefreiheit.html` ile tutarlı).

### 7.2 Doğruluk sınırları (video ve metin için)

- Sayı, teslimat adedi, „online takip“ canlı özelliği olarak gösterilmez. Bugün var olan: bağışta verilen Vorgangsnummer `WW-YYYY-NNNNNN`. Durum sorgulama „geplant“.
- „Sicher löschen“: Silme belgelendirme yöntemi henüz belirlenmedi; videoda „zertifiziert“ veya „dokumentiert“ denmez.
- **Software (Schritt 4):** Varsayılan: ücretsiz yazılım (ör. Linux + eğitim programları). Windows lisansı hizmete dahil değil; sitede ve videoda „Windows inklusive“ denmez. Windows için alıcıdan ek ücret alınıp alınmayacağı henüz karar değil; fiyat belli olana kadar metin TASLAK. Fiyat eklenirse site metni (`step4Desc`, DE+TR) ve bu not birlikte güncellenir.
- „Gerät beantragen“ bugün mailto; „Bedarf melden“ gibi bir süreç olarak anlatılır.
- Hukuki durum: „nicht eingetragener Verein in Gründung“ (Impressum/Footer ile aynı). Videoda „e.V.“, „eingetragener Verein“, „gemeinnützig“ veya vergi avantajı yazılmaz. Makbuz ancak Finanzamt onayından sonra.

### 7.3 Ana sayfadaki yeni bölüm: „Wer wir sind“ (2026-10-27)

- **Yer:** Hero'nun hemen altı (`#wer-wir-sind`). Üç kart: Wer wir sind / Unser Ziel / Nachvollziehbar.
- **Videoda karşılığı:** Yok. 24 sn'lik ana videoya yeni sahne eklenmez; sahne 4 („Vertrauen“) bu boşluğu zaten kapatıyor. Gerekirse 15 sn teaser'a eklenebilir.
- **Tekrar kontrolü:** „Unser Ansatz“ bölümündeki üç kart hero ile örtüşüyor; bu tur dokunulmadı, sonraki turda sadeleştirilebilir.


- **LTX 2.5 prompt şablonu (EN):** `[scene subject], [style], [background], [motion], no text`
- **Metin üretimi:** LTX 2.5 çıktısında hareket/illüstrasyon bırakılır; yazılar post / HyperFrames render adımında bindirilir.
- **HyperFrames:** Frame interpolation ile hareket yumuşatma; geceşikler metinle senkronize.
- **Test:** Çekim sonrası 2 alt çözünürlük (1080p / 720p) ile metin okunabilirliği kontrolü.
- **Entegrasyon:** Ana video → `index.html` hero başlığı / alt metinlerle uyumlu; CTA → `https://spenden.weiterwert.de/spenden`.

---

*Bu dosya kök klasörde tutulur: `intro-video-scenarios.md`.*
