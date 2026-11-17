# Admin Workflow — Kararlar ve Açık Sorular (2026-11-14)

Kaynak: `WeiterWert_Moduler_Admin_Workflow_MVP_TR.docx.md` + `WeiterWert_ID_Standard_FINAL_TR.docx.md` incelemesi.
(Bu oturum yanlışlıkla turkceokulu-yeni klasöründe yapıldı, buraya taşındı.)

## Fatih'in hedef akışı
Her adım: web formu → onay → PDF indirilebilir → arşivde kalıcı. Teslime kadar her işlem protokollü.
Ön onay (fotoğrafla) → cihaz gelir, kabul → veri silme (atanan teknik personel, kontrol listesi, dijital imza) → … → teslim.

## Netleşen kararlar
| Konu | Karar |
|---|---|
| Ön onay | Cihaz gelmeden önce, **bağışçının yüklediği fotoğraflarla** ön onay. Kriterleri karşılamazsa gelmeden ret. |
| Ön onay kriterleri | Minimum teknik düzey vb. — kriterler **sitede de yayımlanmalı** ki bağışçı ret nedenini bilsin. Kriter listesi henüz yazılmadı. |
| E-posta | Şablonlar olacak; admin şablon seçip gönderir veya özel metin yazar. |
| Onay yetkisi | Admin hesabı olan herkes görür. **Onay için 2 admin** gerekir (dört göz, başkası review eder). |
| Kabul formu/PDF | **Bağış başına** bir tane. |
| İmza | Kâğıt, tablet ve dijital seçenekleri. |
| Karantina | Her cihaz için değil — **silinemeyen / sorunlu cihazlar** için istisna durumu. |
| Roller | Admin + Teknik personel. İş ilgili admine/kişiye aktarılır. |
| Veri silme | Teknik personel işi kendine alır. Formda silmeyi başlatan kişi otomatik gelir. Silme adımları/kriterleri **standart** kontrol listesi. Silen kişi dijital imzalar; PDF indirilebilir. |
| SPD-ID | Bağış kaydı oluşturulunca verilir (ID Standard satır 35) — reddedilen teklif de ID alır. MVP dok. satır 215 bununla çelişiyor, düzeltilmeli. |
| GRT-ID | Cihaz fiziksel teslim alındıktan sonra. QR/barkoda uygun. |

## Açık sorular
### Kabul
1. Fotoğrafla ön onaydan sonra cihaz gelince ikinci (fiziksel) kontrol var mı? Uyuşmazsa ret mümkün mü?
2. Bağışçının fotoğraf yüklediği dış form → MVP'ye giriyor (dokümanda Faz 2 idi). Bağışçı hesap mı açacak, token'lı link mi?
3. "Dijital imza" = bağışçıya e-postayla link gidip uzaktan imza mı? (dış erişim token'ı gerekir)
4. 2 admin onayı: hangi adımlarda? (ön onay, kabul, silme, teslim — hepsi mi?)

### Veri silme
5. Silme kontrol listesi maddeleri (07_Datenloeschrichtlinie, 20_Datenloeschprotokoll şablonları gerekli). Cihaz türüne göre farklı mı?
6. Teknik personelin imzasından sonra admin onayı da gerekiyor mu (2 admin kuralı burada da geçerli mi)?
7. Başarısız silme → kaç deneme, ne zaman fiziksel imha? İmha kanıtı formu?
8. Depolaması olmayan cihaz (monitör, klavye) silme adımını atlar mı?
9. Teknik personel bağışçı adı/iletişimini görebilir mi?

### Onay / PDF / Arşiv
10. Onaydan sonra PDF dondurulur mu (değişmez)?
11. Onaylı formda hata → yeni sürüm mü, yeniden açma mı? Kim yapar?
12. Arşiv süresi: Fatih "hep saklanacak" diyor; doküman belge türüne göre saklama süresi öngörüyor (GDPR). Kim netleştirecek?
13. Arşiv nerede, değiştirilemez olmalı mı?

### Sonraki adımlar
14. Teknik kontrol, onarım, başvuru, karar, tahsis, teslim de aynı desende mi (form → onay → PDF → arşiv)? Şablonlar: 21, 22, 26, 27, 28.
15. Bağış kaydı ne zaman kapanır?
16. Aksesuarlar nasıl kaydedilir (ID yok)?

### Proje
17. İlk sürüm kapsamı: sadece ön onay + kabul + silme + PDF + arşiv mi, yoksa tüm akış mı?
18. Stack/hosting (AB içi?), arayüz/PDF dili (şablonlar Almanca). `platform/` klasörü ile ilişkisi?
19. QR etiket basımı ilk sürümde mi?
20. Orijinal şablonlar (07, 18, 19, 20, 21, 22, 49) gerekli.

## Fatih'in kararları (2026-11-14, ikinci tur)
- **17 — İlk sürüm kapsamı:** ön onay + kabul + silme + PDF + arşiv.
- **4 ve 6 — 2 admin onayı:** ön onay, kabul ve silme adımlarında.
- **10, 11 — PDF değişmezliği ve hata düzeltme:** cevapsız, açıklama bekleniyor.
- **18 — Stack/barındırma:** cevapsız, açıklama bekleniyor (mevcut `platform/` mu, ayrı uygulama mı).

## Fatih'in vermesi gerekenler
1. **Orijinal şablonlar** (repo'da yok, sadece MVP'deki özetleri var; format ve son sürüm bilinmiyor).
   - İlk sürüm grubu: 06, 07, 10, 13, 14, 15, 16, 17, 18, 19, 20, 31, 32, 44, 49.
   - Sonraki aşamalar: 21, 22, 26, 27, 28.
2. **Ön onay kriterleri:** henüz yazılmadı; sitede de yayımlanacak. Kriterleri Fatih belirler, metin ben hazırlarım.
3. **Stack kararı** (soru 18).

## Açık, Fatih'e bağlı kararlar
- Saklama süresi (12) — 13 Aufbewahrungskonzept'e bağlı.
- Uzaktan dijital imza için bağışçı linki mi (2, 3).
- Teknik personelin bağışçı adını görüp görmeyeceği (9).
- QR etiket basımı (19).
- Aksesuar kaydı (16).

## Fatih'in üçüncü tur kararları (2026-11-17)
- **Cihaz gelince ikinci kontrol var:** fotoğraftaki cihaz ile gelen cihaz karşılaştırılır.
- **Uyuşmazsa:** cihaz karantinaya alınır. Sorun çözülürse envantere girer; çözülemezse iade edilir ve protokolle kanıtlanır. Ret ve iade yapılabilir.
- **PDF donma / hata düzeltme (10, 11):** Onaylanan PDF düzenlenmez (audit gereği). Düzeltme ikinci bir protokolle yapılır ve eski belgeye referans verir.

## Akış (özet)
```
Bağışçı fotoğraf yükler
  → Ön onay (2 admin) — ret → bağışçıya bildirim
  → Cihaz gelir
  → 2. kontrol: fotoğraf = gelen cihaz mı?
      uyuşur → kabul protokolü → silme → teknik kontrol → serbest / imha
      uyuşmaz → karantina → çözüldü: envanter | çözülemedi: iade + protokol
```

## Hâlâ açık (Fatih'e bağlı)
1. Karantina süresi ve süre dolunca ne olacak?
2. İade: kargo masrafı kimde, iade protokolünü kim imzalar?
3. SPD-ID zamanı: kayıt açılınca mı, kabulde mi? (MVP satır 215 ile çelişiyor)
4. Ön onay kriterleri (sitede yayımlanacak; metni yazılmadı)
5. Reddedilen başvurunun silinmesi: 14 gün mü?
6. Saklama süresi: "hep saklanacak" mı, yoksa GDPR'a göre süre mi?
7. Arşiv: yeri ve değiştirilemezlik
8. Bağışçıya uzaktan imza linki (2, 3)
9. Depolaması olmayan cihazlar silme adımını atlar mı (8)
10. Teknik personel bağışçı adını görür mü (9)
11. Stack/barındırma (18), QR etiket (19), aksesuar kaydı (16)
12. Eksik şablonlar: 10, 17, 19, 20, 31, 44, 49, 21, 22, 27 (Drive'da yok)
- Fiziksel ikinci kontrol ve uyuşmazlıkta ret (1).

## Ben yapabilirim
- MVP dokümanındaki SPD-ID çelişkisini düzeltmek (satır 215). Karar: ID bağış kaydı oluşturulunca verilir.
