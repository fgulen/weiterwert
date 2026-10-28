import type { Lang } from './sprache';

// Texts of the homepage (platform/src/components/home/homeHtml.ts). Keys match the data-i18n names of index.html.
// 'de' comes from index.html (the German text the page shows), 'tr' from its Turkish dictionary, 'en' is written for this port.
// Plain '&' is kept as it is here; homeHtml escapes it when it builds the HTML.
export type HomeTexte = {
  heroEyebrow: string;
  heroH1: string;
  heroLead: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroArtTitle: string;
  heroFigcaption: string;
  svgLabel1: string;
  svgLabel2: string;
  svgLabel3: string;
  svgLabel4: string;
  introPause: string;
  introPlay: string;
  introReplay: string;
  whoEyebrow: string;
  whoH2: string;
  whoP: string;
  who1Title: string;
  who1Desc: string;
  who2Title: string;
  who2Desc: string;
  who3Title: string;
  who3Desc: string;
  pathsEyebrow: string;
  pathsH2: string;
  pathsP: string;
  path1Label: string;
  path1Title: string;
  path1Desc: string;
  path1Btn: string;
  path2Label: string;
  path2Title: string;
  path2Desc: string;
  path2Btn: string;
  path3Label: string;
  path3Title: string;
  path3Desc: string;
  path3Btn: string;
  path4Label: string;
  path4Title: string;
  path4Desc: string;
  path4Btn: string;
  mailCorpSubject: string;
  mailVolunteerSubject: string;
  howEyebrow: string;
  howH2: string;
  howP: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  step5Title: string;
  step5Desc: string;
  corpTitle: string;
  corpDesc: string;
  corpBtn: string;
  trustEyebrow: string;
  trustH2: string;
  trustP: string;
  mediaTag: string;
  story1Title: string;
  story1Desc: string;
  story2Title: string;
  story2Desc: string;
  story3Title: string;
  story3Desc: string;
  storiesNoteTitle: string;
  storiesNote: string;
  volTitle: string;
  volP: string;
  receiptTitle: string;
  receiptDesc: string;
  vol1Name: string;
  vol1Role: string;
  vol2Name: string;
  vol2Role: string;
  vol3Name: string;
  vol3Role: string;
  partnerTitle: string;
  partnerP: string;
  approachEyebrow: string;
  approachH2: string;
  approachP: string;
  approach1Title: string;
  approach1Desc: string;
  approach2Title: string;
  approach2Desc: string;
  approach3Title: string;
  approach3Desc: string;
  noteStrong: string;
  noteRest: string;
};

export const HOME: Record<Lang, HomeTexte> = {
  de: {
    heroEyebrow: 'Gemeinschaftsbasierte Technologieinitiative',
    heroH1: 'Technik weitergeben. Chancen eröffnen.',
    heroLead: 'Wir sammeln ungenutzte Laptops und Tablets, reparieren sie und bringen sie zu Schüler:innen und Lehrkräften, die sie brauchen. Kein Gerät soll im Müll landen — stattdessen soll es einer Person neue Möglichkeiten eröffnen.',
    heroCtaPrimary: 'Laptop oder Tablet spenden',
    heroCtaSecondary: 'Gerät beantragen',
    heroArtTitle: 'Illustration des Weges eines gespendeten Laptops: Sammlung, Reparatur und Übergabe an eine Schülerin oder einen Schüler',
    heroFigcaption: 'Der Weg eines Geräts: sammeln → reparieren → Software installieren → ausliefern',
    svgLabel1: 'Sammeln',
    svgLabel2: 'Reparieren',
    svgLabel3: 'Software',
    svgLabel4: 'Ausliefern',
    introPause: 'Pause',
    introPlay: 'Abspielen',
    introReplay: 'Erneut ansehen',
    whoEyebrow: 'Wer wir sind',
    whoH2: 'Eine Initiative von Freiwilligen, mit einem klaren Ziel',
    whoP: 'Wir sind noch jung. Wir verbinden Menschen, die ein Gerät abgeben möchten, mit Menschen, die es brauchen — und werden auf dieser Seite zeigen, was dabei passiert.',
    who1Title: 'Wer wir sind',
    who1Desc: 'WeiterWert ist eine neu gegründete Initiative von Freiwilligen. Die Vereinsgründung ist in Vorbereitung, die Eintragung ist für 2027 geplant.',
    who2Title: 'Unser Ziel',
    who2Desc: 'Spender:innen und Menschen mit Bedarf transparent zusammenbringen. Wir wollen nachvollziehbar machen, wohin jedes Gerät geht — von der Abgabe bis zur Übergabe.',
    who3Title: 'Nachvollziehbar',
    who3Desc: 'Jede Spende über das Online-Formular erhält eine Vorgangsnummer (WW-JJJJ-NNNNNN). Eine Online-Statusabfrage ist geplant.',
    pathsEyebrow: 'Mitmachen',
    pathsH2: 'Vier Wege, Teil des Netzwerks zu werden',
    pathsP: 'Ob Gerät, Anfrage, Unternehmen oder Zeit — jeder Weg zählt.',
    path1Label: 'Für Privatpersonen',
    path1Title: 'Gerät spenden',
    path1Desc: 'Spende deinen ungenutzten Laptop oder dein Tablet — wir reparieren es und bringen es zu einer Schülerin oder einem Schüler.',
    path1Btn: 'Gerät spenden',
    path2Label: 'Für Schulen & Familien',
    path2Title: 'Gerät beantragen',
    path2Desc: 'Kennst du eine Schule, eine Schülerin, einen Schüler oder eine Gemeinschaft mit Bedarf? Schlag uns dein Projekt vor — wir suchen das passende Gerät.',
    path2Btn: 'Gerät beantragen',
    path3Label: 'Für Unternehmen',
    path3Title: 'Geräte im Bestand spenden',
    path3Desc: 'Auch größere Mengen nehmen wir gern entgegen. Wir stimmen die Übergabe mit dir ab, prüfen jedes Gerät und löschen die Daten, bevor es weitergegeben wird.',
    path3Btn: 'Anfrage senden',
    path4Label: 'Für Aktive',
    path4Title: 'Freiwillig transportieren',
    path4Desc: 'Unterstütze uns dabei, gespendete Geräte zu unseren Sammelstellen und weiter zu den Schulen zu bringen — mit Fahrzeug oder Zeit.',
    path4Btn: 'Freiwillig helfen',
    mailCorpSubject: 'Kooperation für Unternehmen',
    mailVolunteerSubject: 'Freiwillige Hilfe',
    howEyebrow: 'Prozess',
    howH2: 'Wie funktioniert es?',
    howP: 'Vom Spenden bis zur Übergabe durchläuft jedes Gerät dieselben fünf Schritte.',
    step1Title: 'Sammeln',
    step1Desc: 'Wir nehmen ungenutzte Laptops und Tablets von Privatpersonen, Schulen und Organisationen entgegen.',
    step2Title: 'Sicher löschen',
    step2Desc: 'Bevor ein Gerät weitergegeben wird, löschen wir alle Daten darauf. Wie wir jede Löschung nachvollziehbar dokumentieren, legen wir gerade fest.',
    step3Title: 'Reinigen & Reparieren',
    step3Desc: 'Unser technisches Team prüft jedes Gerät, behebt Defekte und macht es wieder einsatzbereit.',
    step4Title: 'Software installieren',
    step4Desc: 'Wir richten jedes Gerät mit kostenloser Software ein, etwa mit einem Linux-System und Lernprogrammen. Windows-Lizenzen sind nicht Teil unserer Leistung.',
    step5Title: 'Ausliefern',
    step5Desc: 'Über unser Freiwilligennetzwerk übergeben wir die Geräte an Schüler:innen und Lehrkräfte, die sie benötigen.',
    corpTitle: 'Für Unternehmen und Organisationen',
    corpDesc: 'Auch größere Spendenmengen nehmen wir gern entgegen. Wir stimmen die Übergabe mit Ihnen ab, prüfen jedes Gerät und löschen die Daten, bevor es weitergegeben wird.',
    corpBtn: 'Kooperation anfragen',
    trustEyebrow: 'Vertrauen',
    trustH2: 'Belegbare Geschichten statt Marketing',
    trustP: 'Nach unseren ersten Gerätelieferungen veröffentlichen wir hier echte Übergaben, unsere Freiwilligen und unsere Unterstützer.',
    mediaTag: 'Foto folgt',
    story1Title: 'Eine Übergabe',
    story1Desc: 'Wie ein Gerät von der Reparatur bis in die Hände seiner neuen Besitzerin geht — mit einem Interview.',
    story2Title: 'Aus der Werkstatt',
    story2Desc: 'Was unsere Techniker:innen am häufigsten reparieren und wie sie es lösen.',
    story3Title: 'Eine Partnerschaft',
    story3Desc: 'Wie wir mit Schulen und Unternehmen gemeinsam Projekte umsetzen.',
    storiesNoteTitle: 'Geschichten folgen.',
    storiesNote: 'Wir veröffentlichen die ersten Geschichten nach unserer ersten Gerätelieferung. Wir schreiben lieber eine echte Geschichte als eine erfundene.',
    volTitle: 'Unsere Freiwilligen',
    volP: 'Jedes Gerät erreicht jemanden durch ein Team. Das Netzwerk hat drei Kernrollen — technisch, logistisch und koordinierend. Wer Zeit hat, gehört dazu.',
    receiptTitle: 'Spendenbeleg',
    receiptDesc: 'Eintragung geplant 2027 – Zuwendungsbestätigungen erst nach Anerkennung durch das Finanzamt.',
    vol1Name: 'Technik',
    vol1Role: 'Geräte prüfen, Fehler beheben und Daten sicher löschen.',
    vol2Name: 'Logistik',
    vol2Role: 'Geräte von Sammelstellen zu Schulen und zu den Menschen bringen, die sie brauchen.',
    vol3Name: 'Koordination',
    vol3Role: 'Bringt Spender:innen, Bedürftige und Freiwillige in einem Plan zusammen.',
    partnerTitle: 'Unsere Unterstützer',
    partnerP: 'Sobald uns Organisationen unterstützen, nennen wir sie hier – mit ihrer Zustimmung.',
    approachEyebrow: 'Unser Ansatz',
    approachH2: 'Wir starten klein und bleiben transparent',
    approachP: 'Als junge Initiative setzen wir auf konkrete, nachprüfbare Schritte statt große Versprechen.',
    approach1Title: 'Wir reduzieren Elektroschrott',
    approach1Desc: 'Jedes Gerät, das sonst im Müll gelandet wäre, dient nach der Reparatur wieder einem Zweck.',
    approach2Title: 'Wir erweitern den Zugang zu Bildung',
    approach2Desc: 'Ein Computer bedeutet für eine Schülerin oder einen Schüler, am Unterricht teilnehmen und Hausaufgaben erledigen zu können.',
    approach3Title: 'Wir bauen ein lokales Freiwilligennetzwerk auf',
    approach3Desc: 'Wir bringen Spender:innen, Techniker:innen und Transport-Freiwillige rund um dasselbe Ziel zusammen.',
    noteStrong: 'Transparenzhinweis:',
    noteRest: 'WeiterWert ist eine neu gegründete Initiative. Wir bereiten unsere ersten Gerätelieferungen vor und werden jeden Schritt mit echten Zahlen auf dieser Seite teilen.',
  },
  tr: {
    heroEyebrow: 'Topluluk Odaklı Teknoloji Girişimi',
    heroH1: 'Teknolojiyi aktar. Fırsatların kapısını aç.',
    heroLead: 'Kullanılmayan laptop ve tabletleri topluyor, onarıyor ve ihtiyacı olan öğrenci ile eğitimcilere ulaştırıyoruz. Bir cihazın çöpe gitmesini değil, bir öğrencinin önünün açılmasını sağlıyoruz.',
    heroCtaPrimary: 'Laptop veya Tablet Bağışla',
    heroCtaSecondary: 'Cihaz Talep Et',
    heroArtTitle: 'Bağışlanan bir dizüstü bilgisayarın toplanma, onarım ve bir öğrenciye teslim edilme sürecini gösteren çizim',
    heroFigcaption: 'Bir cihazın yolculuğu: topla → onar → yazılım yükle → ulaştır',
    svgLabel1: 'Topla',
    svgLabel2: 'Onar',
    svgLabel3: 'Yazılım Yükle',
    svgLabel4: 'Ulaştır',
    introPause: 'Duraklat',
    introPlay: 'Oynat',
    introReplay: 'Tekrar izle',
    whoEyebrow: 'Biz kimiz',
    whoH2: 'Gönüllülerden oluşan bir girişim, net bir hedefle',
    whoP: 'Henüz genç bir girişimiz. Cihaz bağışlamak isteyenleri ihtiyacı olanlarla buluşturmayı hedefliyoruz; sürecin nasıl işlediğini bu sayfada paylaşacağız.',
    who1Title: 'Biz kimiz',
    who1Desc: "WeiterWert, gönüllülerden oluşan yeni kurulmuş bir girişim. Dernek kuruluşu hazırlık aşamasında; tescilin 2027'de yapılması planlanıyor.",
    who2Title: 'Hedefimiz',
    who2Desc: 'Bağışçıları ve ihtiyacı olanları şeffaf biçimde buluşturmak. Her cihazın bağıştan teslimata kadar nereye gittiğini takip edilebilir kılmak istiyoruz.',
    who3Title: 'Takip edilebilir',
    who3Desc: 'Online formla yapılan her bağışa bir işlem numarası (WW-YYYY-NNNNNN) veriliyor. Çevrimiçi durum sorgulama planlanıyor.',
    pathsEyebrow: 'Katılma Yolları',
    pathsH2: 'Ağın bir parçası olmanın dört yolu',
    pathsP: 'Cihaz, talep, kurum ya da zaman — her yol sayılır.',
    path1Label: 'Bireyler için',
    path1Title: 'Cihaz Bağışla',
    path1Desc: 'Kullanmadığın laptopu ya da tabletini bağışla; onarıp ihtiyaç sahibi bir öğrenciye ulaştıralım.',
    path1Btn: 'Cihaz Bağışla',
    path2Label: 'Okullar ve aileler için',
    path2Title: 'Cihaz Talep Et',
    path2Desc: 'İhtiyacı olan bir okulu, öğrenciyi ya da topluluğu biliyor musun? Bize bildir, birlikte uygun cihazı bulalım.',
    path2Btn: 'Talep Bildir',
    path3Label: 'Kurumlar için',
    path3Title: 'Stoktaki Cihazları Bağışla',
    path3Desc: 'Daha büyük miktarları da memnuniyetle kabul ediyoruz. Teslimi seninle birlikte planlıyor, her cihazı kontrol ediyor ve yeniden kullanılmadan önce verilerini siliyoruz.',
    path3Btn: 'İş Birliği Sor',
    path4Label: 'Aktif olmak için',
    path4Title: 'Gönüllü Olarak Taşı',
    path4Desc: 'Bağışlanan cihazları toplama noktalarından okullara taşımak için aracın ya da zamanınla destek ol.',
    path4Btn: 'Gönüllü Ol',
    mailCorpSubject: 'Kurum iş birliği',
    mailVolunteerSubject: 'Gönüllü destek',
    howEyebrow: 'Süreç',
    howH2: 'Nasıl çalışıyoruz?',
    howP: 'Bağıştan teslimata kadar her cihaz aynı beş adımdan geçer.',
    step1Title: 'Topla',
    step1Desc: 'Bireylerden, okullardan ve kurumlardan kullanılmayan laptop ve tabletleri teslim alıyoruz.',
    step2Title: 'Verileri Güvenle Sil',
    step2Desc: 'Bir cihaz yeni sahibine verilmeden önce üzerindeki tüm verileri siliyoruz. Her silme işlemini nasıl belgeleyeceğimizi şu anda belirliyoruz.',
    step3Title: 'Temizle & Onar',
    step3Desc: 'Teknik ekibimiz her cihazı kontrol ediyor, arızaları gideriyor ve yeniden kullanılabilir hale getiriyor.',
    step4Title: 'Yazılım Yükle',
    step4Desc: 'Her cihazı ücretsiz yazılımlarla kuruyoruz; örneğin Linux tabanlı bir sistem ve eğitim programlarıyla. Windows lisansları hizmetimize dahil değil.',
    step5Title: 'Teslim Et',
    step5Desc: 'Gönüllü ağımız aracılığıyla cihazları ihtiyaç sahibi öğrenci ve eğitimcilere teslim ediyoruz.',
    corpTitle: 'Şirketler ve kurumlar için',
    corpDesc: 'Daha büyük bağış miktarlarını da memnuniyetle kabul ediyoruz. Teslimi sizinle birlikte planlıyor, her cihazı kontrol ediyor ve yeniden kullanılmadan önce verilerini siliyoruz.',
    corpBtn: 'İş Birliği Sor',
    trustEyebrow: 'Güven',
    trustH2: 'Pazarlama yerine belgelenebilir hikâyeler',
    trustP: 'İlk cihaz teslimatlarımızdan sonra burada gerçek teslimleri, gönüllülerimizi ve destekçilerimizi yayınlayacağız.',
    mediaTag: 'Foto geliyor',
    story1Title: 'Bir Teslimat',
    story1Desc: 'Bir cihazın onarımdan yeni sahibinin eline uzanan yolculuğu — bir söyleşiyle birlikte.',
    story2Title: 'Atölyeden',
    story2Desc: 'Teknik ekibimizin en sık karşılaştığı onarımlar ve bunları nasıl çözdükleri.',
    story3Title: 'Bir İş Birliği',
    story3Desc: 'Okullar ve kurumlarla birlikte yürüttüğümüz projelerin hikâyesi.',
    storiesNoteTitle: 'Hikâyeler geliyor.',
    storiesNote: 'İlk hikâyelerimizi ilk cihaz teslimatlarımızdan sonra yayınlayacağız. Uydurma bir hikâyeye değil, gerçek bir hikâyeye tercih veriyoruz.',
    volTitle: 'Gönüllülerimiz',
    volP: 'Her cihaz bir ekiple ulaşır. Ağın üç temel rolü var — teknik, lojistik ve koordinasyon. Zamanı olan herkes bu ağın parçasıdır.',
    receiptTitle: 'Bağış Makbuzu',
    receiptDesc: "Tescil 2027'de planlanıyor. Bağış makbuzu ancak Finanzamt onayından sonra verilebilir.",
    vol1Name: 'Teknik',
    vol1Role: 'Cihazları kontrol eder, arızaları giderir ve verileri güvenle siler.',
    vol2Name: 'Lojistik',
    vol2Role: 'Cihazları toplama noktalarından okullara ve ihtiyaç sahiplerine taşır.',
    vol3Name: 'Koordinasyon',
    vol3Role: 'Bağışçıları, ihtiyaç sahiplerini ve gönüllüleri aynı plan altında buluşturur.',
    partnerTitle: 'Destekçilerimiz',
    partnerP: 'Bizi destekleyen kurumları, onayları alınarak burada paylaşacağız.',
    approachEyebrow: 'Yaklaşımımız',
    approachH2: 'Küçük başlıyoruz, şeffaf ilerliyoruz',
    approachP: 'Yeni kurulan bir girişim olarak büyük vaatler yerine somut, doğrulanabilir adımlarla ilerlemeyi tercih ediyoruz.',
    approach1Title: 'Elektronik atığı azaltıyoruz',
    approach1Desc: 'Çöpe gitmek üzere olan her cihaz, onarılarak yeniden bir amaca hizmet ediyor.',
    approach2Title: 'Eğitime erişimi büyütüyoruz',
    approach2Desc: 'Bir bilgisayar, bir öğrenci için derse girebilmek ve ödevini tamamlayabilmek demek.',
    approach3Title: 'Yerel bir gönüllü ağı kuruyoruz',
    approach3Desc: 'Bağışçıları, tamircileri ve taşıma gönüllülerini aynı amaç etrafında bir araya getiriyoruz.',
    noteStrong: 'Şeffaflık notu:',
    noteRest: 'WeiterWert yeni kurulan bir girişimdir. İlk cihaz teslimatlarımıza hazırlanıyoruz ve sürecin her adımını, gerçek sayılarla birlikte bu sayfada paylaşacağız.',
  },
  en: {
    heroEyebrow: 'Community-based technology initiative',
    heroH1: 'Pass on technology. Open up opportunities.',
    heroLead: 'We collect unused laptops and tablets, repair them and bring them to students and teachers who need them. No device should end up in the bin — instead, it should open up new possibilities for a person.',
    heroCtaPrimary: 'Donate a laptop or tablet',
    heroCtaSecondary: 'Request a device',
    heroArtTitle: 'Illustration of the journey of a donated laptop: collection, repair and handover to a student',
    heroFigcaption: 'The journey of a device: collect → repair → install software → deliver',
    svgLabel1: 'Collect',
    svgLabel2: 'Repair',
    svgLabel3: 'Software',
    svgLabel4: 'Deliver',
    introPause: 'Pause',
    introPlay: 'Play',
    introReplay: 'Watch again',
    whoEyebrow: 'Who we are',
    whoH2: 'A volunteer initiative with a clear goal',
    whoP: 'We are still young. We connect people who want to donate a device with people who need one — and on this page we will show what happens along the way.',
    who1Title: 'Who we are',
    who1Desc: 'WeiterWert is a newly founded volunteer initiative. The association is being prepared; its registration is planned for 2027.',
    who2Title: 'Our goal',
    who2Desc: 'Bring donors and people in need together in a transparent way. We want to make it traceable where every device goes — from drop-off to handover.',
    who3Title: 'Traceable',
    who3Desc: 'Every donation made through the online form receives a case number (WW-YYYY-NNNNNN). An online status lookup is planned.',
    pathsEyebrow: 'Get involved',
    pathsH2: 'Four ways to become part of the network',
    pathsP: 'Whether a device, a request, a company or your time — every way counts.',
    path1Label: 'For individuals',
    path1Title: 'Donate a device',
    path1Desc: 'Donate your unused laptop or tablet — we repair it and bring it to a student.',
    path1Btn: 'Donate a device',
    path2Label: 'For schools & families',
    path2Title: 'Request a device',
    path2Desc: 'Do you know a school, a student or a community in need? Suggest your project to us — together we will find a suitable device.',
    path2Btn: 'Submit a request',
    path3Label: 'For companies',
    path3Title: 'Donate devices from stock',
    path3Desc: 'We also gladly accept larger quantities. We agree the handover with you, check every device and delete the data before it is passed on.',
    path3Btn: 'Send an enquiry',
    path4Label: 'For active helpers',
    path4Title: 'Volunteer to transport',
    path4Desc: 'Help us move donated devices from collection points on to schools — with a vehicle or with your time.',
    path4Btn: 'Volunteer',
    mailCorpSubject: 'Cooperation for companies',
    mailVolunteerSubject: 'Volunteer help',
    howEyebrow: 'Process',
    howH2: 'How does it work?',
    howP: 'From donation to handover, every device goes through the same five steps.',
    step1Title: 'Collect',
    step1Desc: 'We accept unused laptops and tablets from individuals, schools and organisations.',
    step2Title: 'Securely erase',
    step2Desc: 'Before a device is passed on, we delete all data on it. We are currently working out how we will document every deletion in a traceable way.',
    step3Title: 'Clean & repair',
    step3Desc: 'Our technical team checks every device, fixes faults and makes it ready to use again.',
    step4Title: 'Install software',
    step4Desc: 'We set up every device with free software, for example a Linux system and learning programmes. Windows licences are not part of our service.',
    step5Title: 'Deliver',
    step5Desc: 'Through our volunteer network, we hand the devices over to students and teachers who need them.',
    corpTitle: 'For companies and organisations',
    corpDesc: 'We also gladly accept larger donations. We agree the handover with you, check every device and delete the data before it is passed on.',
    corpBtn: 'Request cooperation',
    trustEyebrow: 'Trust',
    trustH2: 'Verifiable stories instead of marketing',
    trustP: 'After our first device deliveries, we will publish real handovers, our volunteers and our supporters here.',
    mediaTag: 'Photo to follow',
    story1Title: 'A handover',
    story1Desc: 'How a device travels from repair into the hands of its new owner — with an interview.',
    story2Title: 'From the workshop',
    story2Desc: 'The repairs our technicians encounter most often, and how they solve them.',
    story3Title: 'A partnership',
    story3Desc: 'How we carry out projects together with schools and companies.',
    storiesNoteTitle: 'Stories to follow.',
    storiesNote: 'We will publish the first stories after our first device delivery. We would rather write one real story than an invented one.',
    volTitle: 'Our volunteers',
    volP: 'Every device reaches someone through a team. The network has three core roles — technical, logistical and coordinating. Anyone with time is part of it.',
    receiptTitle: 'Donation receipt',
    receiptDesc: 'Registration planned for 2027 – donation receipts can only be issued after recognition by the Finanzamt (German tax office).',
    vol1Name: 'Technical',
    vol1Role: 'Checks devices, fixes faults and deletes data securely.',
    vol2Name: 'Logistics',
    vol2Role: 'Brings devices from collection points to schools and to the people who need them.',
    vol3Name: 'Coordination',
    vol3Role: 'Brings donors, people in need and volunteers together under one plan.',
    partnerTitle: 'Our supporters',
    partnerP: 'Once organisations support us, we will name them here — with their consent.',
    approachEyebrow: 'Our approach',
    approachH2: 'We start small and stay transparent',
    approachP: 'As a young initiative, we rely on concrete, verifiable steps rather than big promises.',
    approach1Title: 'We reduce e-waste',
    approach1Desc: 'Every device that would otherwise have ended up in the bin serves a purpose again after repair.',
    approach2Title: 'We widen access to education',
    approach2Desc: 'For a student, a computer means being able to take part in lessons and complete homework.',
    approach3Title: 'We are building a local volunteer network',
    approach3Desc: 'We bring donors, technicians and transport volunteers together around the same goal.',
    noteStrong: 'Transparency note:',
    noteRest: 'WeiterWert is a newly founded initiative. We are preparing our first device deliveries and will share every step on this page, with real figures.',
  },
};
