# Plan taslağı: „Cihaz Talep Et“ formu

> **Durum:** TASLAK. Kod yok, canlı siteye değişiklik yok. Sitedeki „Gerät beantragen“ şu an mailto bağlantısı.
> **Öneriler** karar değildir; Fatih onaylayınca karar olur.
> **Bağlam:** Spec §8/§8b ve roadmap: „Gerät beantragen“ Faz 3 (Admin-MVP) sonrasına kalmış. Spec risk tablosu (satır 164): alıcının sosyal durumu hassas veri, sıkı veri minimizasyonu ve DSFA gerekir.

---

## 1. Kim başvurabilir? (ana karar)

**Fatih'in yeni isteği (2026-10-27):** Hem kurum hem privat başvuru olsun. Privat başvuruda gerekli asgari belgeler başvuru sırasında yüklenebilsin.

İki yol, aynı form, başlangıçta seçim:

- **Kurum (Schule, Sozialdienst, Verein):** Kurum ihtiyacı teyit eder. Yararlanıcı için belge istenmez. Yararlanıcı bizde takma adla veya dosya numarasıyla görünür.
- **Privat (ailenin kendisi):** İhtiyaç için **asgari bir belge** yüklenir. Bu belgeler hassas sosyal veridir ve en çok risk taşıyan kısım.

**Öneri, privat yol için şartlar:**
- Kabul edilen belgeler (Fatih'in listesi, 2026-10-27): Bürgergeld/SGB II → Leistungsbescheid oder Kurzbescheinigung; Sozialhilfe/SGB XII → Leistungsbescheid; Wohngeld → Wohngeldbescheid; § 27a BVG oder § 6a BKGG → Bescheid. Hepsi ilgili dönem için geçerli olmalı. Kurum teyidi de kabul edilir.
- Alttaki „Schulbescheinigung“ önerisi listeden çıkarıldı; bu liste dışında belge kabul edilmez.
- Yüklemeden önce form kullanıcıya şunu gösterir: „Bitte schwärzen Sie alle Angaben außer Name und Bewilligungszeitraum.“ Gelir tutarı, adres, sağlık ve aile bilgisi okunmamalı.
- Dosya **özel depoda** tutulur (herkese açık değil, süreli erişim linki). Sadece admin ve MFA ile girilen kullanıcı görür.
- **Dosya kısa sürede silinir**: öneri, Prüfung bittikten sonra en geç 14 gün. Kalıcı olarak yalnızca tek satırlık kayıt kalır: „Nachweis geprüft am TT.MM.JJJJ, Art: Bürgergeld-Bescheid“.
- Dosya türü PDF/JPG/PNG, boyut sınırı öneri 5 MB. Metadata (EXIF) silinir.
- Yüklemek isteğe bağlı değil: belge yoksa kurum yoluna yönlendirilir (bu da bir seçenek olarak yazılır).
- Admin tarafında indirme ve kopyalama işlemi audit log'a yazılır.

**Risk ve sınır:** Bu yol, Datenschutz'da ayrı bir Verarbeitung ve DSFA (Art. 35) gerektirir. Upload altyapısı, silme işlemi ve erişim kontrolü test edilmeden canlıya çıkmaz. Yüklenen belgenin gerçek olduğunu biz bağımsız doğrulayamayız; bu da form metninde açıkça yazılır.

## 2. Ne kaydedilir? (veri minimizasyonu)

| Alan | Zorunlu mu | Not |
|---|---|---|
| Kurum adı, tür (Schule / Verein / Sozialdienst / Sonstige) | Evet | |
| Ansprechperson: ad, e-posta, telefon (isteğe bağlı) | Evet | Yalnızca iletişim için |
| Cihaz sayısı (1–10, sınır Fatih'in kararı) | Evet | |
| Cihaz türü: Laptop / Tablet / Beides | Evet | Spendenformular ile aynı kurallar |
| Kullanım amacı (serbest metin, kısa) | Evet | Kişisel durum yazılmaz uyarısıyla |
| Yararlanıcı bilgisi | **Hayır** | Ad/yaş yok. Gerekirse kurum kendi içinde eşleştirir |
| Sağlık, sosyal zorluk detayı, belge yükleme | **Hayır** | Kesinlikle toplanmaz |

Yararlanıcı için tek bir sayı yeterli: „Kaç öğrenci/kişi“ (ör. 3). Kişi bazlı kayıt yok.

**Privat başvuru ek alanları:**

| Alan | Zorunlu mu | Not |
|---|---|---|
| Vorname (veya takma ad) | Evet | Sadece eşleştirme için |
| E-posta | Evet | Durum bildirimi |
| PLZ (ilk 2 hane veya bölge) | Evet | Teslim bölgesi için, tam adres değil |
| Asgari belge (1 dosya) | Evet, seçilen seçenekten | Bkz. Abschnitt 1 |
| Tam adres, telefon | Hayır | Teslim yeri Sammelstelle/Treffpunkt, ev adresi istenmez |

## 3. Veri koruma (formdan önce şart)

- **Datenschutz:** Yeni bölüm „Gerät beantragen“: amaç, hukuki dayanak (Art. 6 Abs. 1 lit. b/f, kurum talebi ön hazırlığı), alıcılar (Supabase, e-posta sağlayıcısı), saklama süresi: veri türüne göre, §9'da (reddedilen başvuru 14 gün; diğerleri sonra).
- **Form başında Art. 13 bilgisi:** Kim sorumlu, neden toplanıyor, ne kadar tutuluyor, haklar.
- **Fotoğraf/hikâye onayı:** Ayrı, isteğe bağlı kutu. Asla zorunlu değil, başka onaylarla birleştirilmez.
- **Testler:** `datenschutz.html` için statik testler güncellenir (ilgili amaç ve saklama süresi metinde olmalı).

## 4. Teknik tasarım (bağış sihirbazını kopyalar)

- Rota: `/beantragen`, adım adım form (bağış sihirbazı gibi).
- Sunucu tarafı doğrulama: `leseAnfrage`-benzeri okuma, honeypot, idempotency anahtarı.
- Tablo: RLS kapalı, yazma yalnızca security-definer fonksiyonu ile (`submit_request`), `submit_donation` deseni.
- Test ortamı: bellek içi depo (gerçek veritabanına yazmaz), mevcut `speicher.ts` deseni.
- **Vorgangsnummer:** Bağıştan farklı önek. **Öneri:** `WW-A-YYYY-NNNNNN` (A = Antrag). Envanter `WW-G-` ile karışmaz. Önek seçimi Fatih'te.
- E-posta: Resend veya Gmail (roadmap'te açık). Başvuru bildirimi kişisel veri içermez.

## 5. Koordinasyon (adım adım takip)

**Durumlar:** eingegangen → geprüft → zugeordnet → in Vorbereitung → übergeben → abgeschlossen.

| Adım | Sorumlu rol | Not |
|---|---|---|
| Eingang und Prüfung | Koordination | Kurum gerçek mi, talep tutarlı mı |
| Zuordnung | Koordination + Technik | Başvuru ile bağışlanmış cihaz eşleşir |
| Vorbereitung | Technik | Cihaz hazırlanır, Löschprotokoll |
| Übergabe | Logistik + Koordination | Übergabeprotokoll imzalanır |
| Abschluss | Koordination | Kurum bilgilendirilir |

**Eşleştirme kuralı (taslak):** Başvuru tarihine göre sıra; cihaz türü ve sayı uyuyorsa eşleşir. Kayıt admin panelinde tutulur (spec §8b bölüm 2 ve 6).

**Teslim belgesi:** Übergabeprotokoll (spec §8b bölüm 4'te zaten var).

## 6. Adillik ve dürüstlük

- **Bekleme listesi:** Cihaz yoksa başvuru listeye girer. Sıra tarihe göre.
- **Öncelik kuralları:** Öneri, ama Fatih karar verir (ör. okul yoksul bölgede, sayı, çocuk sayısı). Puanlama kodda değil, sürümlü dokümanda olur.
- **Kişi başına sınır:** Öneri: kurum başına en fazla 2 teslim/yıl. Kesin rakam Fatih'te.
- **Garanti yok mesajı:** „Eine Zusage können wir nicht garantieren; wir melden uns mit dem Stand Ihrer Anfrage.“
- **Yeniden satış yasağı:** Teslim alan kurum cihazı satamaz; Übergabe belgesinde yazar.
- **Hız sınırı:** Form, Vercel Firewall'da sınırlanmadan duyurulmaz (zaten açık madde).

## 7. Sıralama (öneri)

1. **Önce:** E-posta sağlayıcısı (Resend) ve Faz 3 Admin listesi. Admin olmadan başvurular yalnızca Supabase'de bekler; bağış için bugün de böyle.
2. **Sonra:** Başvuru formu, Admin listesiyle birlikte veya hemen ardından.
3. **Sonra:** Datenschutz metni ve form birlikte yayınlanır (form yayına çıkmadan metin yok olmaz).

Form, admin olmadan canlıya alınmaz.

## 8. Fatih'in kararları (kısa liste)

1. ~~Kim başvurabilir?~~ **Karar:** Kurum ve privat. Privat için kabul edilen belgeler Abschnitt 1'de.
1b. ~~Upload saklama süresi~~ **Karar (Fatih):** Her bilgi/belge türü için ayrı süre. Reddedilen başvurunun verisi 14 gün içinde silinir ve silindiği belgelenir. Diğer süreler sonra belirlenecek (Abschnitt 9).
1c. ~~Privat başvuru sınırı~~ **Karar (Fatih):** Bir kişi bir kez başvurur.
2. **Bölge:** Sadece yerel mi (Almanya'nın hangi bölgesi), yoksa tüm Almanya?
3. **Kanıt (kurum):** Kurum teyidi yeterli mi? Privat için belge listesi kararlaştırıldı (§1). Kurum başvurusunda ek belge istenmez önerisi açık.
4. **Öncelik kriterleri:** Hangi sıralama geçerli?
5. **Cihaz sınırı:** Kurum başına kaç cihaz? (Öneri: 10 talep, teslimde 2/yıl.)
6. **Windows fiyatı:** Hâlâ taslak (önceki karar).
7. **Vorgangsnummer önek:** Öneri `WW-A-`.
8. ~~Saklama süresi~~ **Sonra:** Veri türüne göre karar verilecek (§9). Steuerberater görüşü beklenir.

---

*Bu plan sadece taslaktır. Commit veya push yok. Onay sonrası ayrı adımlar başlar.*

## 9. Veri kategorileri ve saklama (2026-10-27, Fatih'in kararı)

Fatih: „Her bilgi ve belgenin içeriğine göre saklama süreleri farklı. Reddedilen başvurunun verisini 14 gün içinde silip bunu belgeleyebiliriz; diğerlerine sonra karar veririz.“

| Veri | Süre | Durum |
|---|---|---|
| Reddedilen privat başvuru (ad, belge, iletişim) | 14 gün, sonra silinir + silme kaydı | **Karar** |
| Privat başvuru, kabul edilmiş, Bescheid-Kopie | Sonra | Karar bekliyor (Steuerberater, Art. 5 Abs. 1 lit. e) |
| Kurum başvurusu ve karar kaydı | Sonra | Karar bekliyor |
| Teslim kaydı (Geräte-ID, Übergabedatum, Empfangsbestätigung) | Sonra | Karar bekliyor; Buchungsbelege için AO-Fristleri kontrol edilecek |
| Envanter / Löschprotokoll (cihaz verisi) | Sonra | Karar bekliyor |
| Spenderin iletişimi, Spendenbeleg | Sonra | Karar bekliyor |

**Kurallar (planın tamamı):**
- Kayıt ilk oluşturulurken silme tarihi de yazılır. Tarih boş kayıt olmaz.
- Silme işlemi audit log'a yazılır: kim, ne zaman, hangi kayıt.
- Gesundheitsdaten (§ 53 Nr. 1 AO) toplanmaz. Art. 9 DSGVO kontrol edilir.
- Ausweiskopie, Geburtsdatum, Namenlisten der Endnutzer: toplanmaz.

## 10. Kanıt yöntemi (§ 53 AO, Privat)

Kabul edilen belgeler Abschnitt 1'deki listeden gelir. Eigene Erklärung allein yetmez; bu nedenle yalnızca bu listedeki bescheid veya kurum teyidi kabul edilir.

**Açık nokta (Steuerberater):** Kurum başvurularında „steuerbegünstigte Eigenschaft / JöR-Status“ şartı, derneğin henüz tescilli olmaması nedeniyle 2027'ye kadar karşılanamaz. Bu süreç için Steuerberater'dan görüş alınmadan kurum başvurusu canlıya çıkmaz.

## 8b. Güncel kararlar

- Kurum + privat: **karar**.
- Privat belge listesi: **karar** (Abschnitt 1, Fatih'in listesi).
- Reddedilen başvuru 14 gün sonra silinir: **karar**.
- Diğer saklama süreleri: **sonra** (Abschnitt 9).
- Bir kişi bir kez başvurur: **karar**.

## 11. Admin-Giriş ve roller

**Kaynak:** Spec §8b (2026-10-22, benim önerim). Bu plan turunda Fatih'in onayı bekleniyor.

**Giriş**
- Supabase Auth, e-posta + şifre, **TOTP-MFA zorunlu** (ilk girişte kurulum).
- **Gerekçe:** Admin, Bedürftigkeitsnachweise görür. Hesap ele geçerse bu en hassas veri. Admin sayısı az, Supabase'de TOTP yerleşik: düşük maliyet.
- Açık kayıt yok. Hesaplar davetle açılır, admin devre dışı bırakabilir.

**Uygulama rolleri**
- `admin`: her şey, kullanıcı yönetimi, silme onayı, audit log, ayarlar.
- `mitarbeiter`: başvuruları işler, eşleştirir, teslim kaydı tutar. Ayar ve kullanıcı yönetimi yok.

**Ekip rolleri (işlem sorumluluğu, uygulama rolü değil)**
- Koordination, Technik, Logistik (Abschnitt 5).

**Erişim kuralları**

| Veri | admin | mitarbeiter (Koordination) | Technik | Logistik |
|---|---|---|---|---|
| Privat Nachweis (Bescheid) | Evet | Evet, sadece Prüfung için | Hayır | Hayır |
| Kurum / Anfrage kaydı | Evet | Evet | Sadece cihaz eşleşmesi | Sadece teslim adresi (kurum adı) |
| Takma ad / Fall-ID ile cihaz | Evet | Evet | Evet | Evet |
| Löschprotokoll, Inventar | Evet | Okur | Yazar | Okur |
| Silme (14-Gün-Kuralı) | Evet (onay) | Hayır | Hayır | Hayır |
| Audit log | Evet | Hayır | Hayır | Hayır |
| Ayarlar, kullanıcılar | Evet | Hayır | Hayır | Hayır |

**Kurallar**
- Bu tablo RLS ile zorlanır, sadece arayüzde gizlenmez.
- Her indirme, kopyalama ve silme audit log'a yazılır.
- Yeni kullanıcı: admin davet eder, rol atar, MFA kurulumu zorunludur.

**Açık soru:** Koordination ayrı bir uygulama rolü mü (`koordination`), yoksa `mitarbeiter` mi? Öneri: yalnızca `admin` ve `mitarbeiter` ile başlamak, sorun çıkarsa ayırmak.
