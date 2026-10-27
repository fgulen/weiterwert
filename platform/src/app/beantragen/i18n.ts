// Texts of the request form in German, Turkish and English. German is the base; the other two must have the same keys.
export const SPRACHEN = ['de', 'tr', 'en'] as const;
export type Sprache = (typeof SPRACHEN)[number];

export const SPRACHNAMEN: Record<Sprache, string> = { de: 'Deutsch', tr: 'Türkçe', en: 'English' };

export type Texte = {
  titel: string;
  lead: string;
  wer: string;
  kurum: string;
  privat: string;
  organisation: string;
  ansprechperson: string;
  vorname: string;
  email: string;
  plz: string;
  plzHinweis: string;
  geraeteart: string;
  laptop: string;
  tablet: string;
  beides: string;
  anzahl: string;
  zweck: string;
  nachweis: string;
  nachweisHinweis: string;
  nachweisOptionen: Record<'buergergeld' | 'sozialhilfe' | 'wohngeld' | 'bvg_bkgg', string>;
  datenschutz: string;
  senden: string;
  sendet: string;
  danke: string;
  antragsnummer: string;
  aufbewahren: string;
  meldung: string;
  keineZusage: string;
  pruefen: string;
  sprache: string;
};

export const TEXTE: Record<Sprache, Texte> = {
  de: {
    titel: 'Gerät beantragen',
    lead: 'Für Schulen, Einrichtungen und Privatpersonen mit Bedarf. Wir können nicht jede Anfrage erfüllen; wir melden uns mit dem Stand Ihrer Anfrage.',
    wer: 'Wer stellt den Antrag?',
    kurum: 'Einrichtung (Schule, Sozialdienst, Verein)',
    privat: 'Privatperson',
    organisation: 'Name der Einrichtung',
    ansprechperson: 'Ansprechperson',
    vorname: 'Vorname (oder Kürzel)',
    email: 'E-Mail-Adresse',
    plz: 'Postleitzahl (für die Region, keine genaue Anschrift)',
    plzHinweis: 'Fünf Ziffern',
    geraeteart: 'Gerätart',
    laptop: 'Laptop',
    tablet: 'Tablet',
    beides: 'Beides',
    anzahl: 'Anzahl (1 bis 10)',
    zweck: 'Verwendungszweck (ein Satz)',
    nachweis: 'Nachweis (einer, nur der erste Bescheid-Teil mit Name und Zeitraum)',
    nachweisHinweis: 'Eine Datei können Sie hier noch nicht hochladen. Wir melden uns, sobald der Upload verfügbar ist. Bitte schwärzen Sie vorher alle Angaben außer Ihrem Namen und dem Zeitraum.',
    nachweisOptionen: {
      buergergeld: 'Bürgergeld (SGB II): Leistungsbescheid oder Kurzbescheinigung',
      sozialhilfe: 'Sozialhilfe (SGB XII): Leistungsbescheid',
      wohngeld: 'Wohngeld: Wohngeldbescheid',
      bvg_bkgg: 'BVG (§ 27a) oder BKGG (§ 6a): Bescheid',
    },
    datenschutz: 'Ich habe den Datenschutzhinweis zu dieser Anfrage gelesen.',
    senden: 'Antrag senden',
    sendet: 'Wird gesendet …',
    danke: 'Vielen Dank.',
    antragsnummer: 'Ihre Antragsnummer ist',
    aufbewahren: 'Bitte bewahren Sie sie auf.',
    meldung: 'Wir melden uns per E-Mail.',
    keineZusage: 'Eine Zusage können wir nicht garantieren.',
    pruefen: 'Bitte prüfen Sie das Formular.',
    sprache: 'Sprache',
  },
  tr: {
    titel: 'Cihaz başvurusu',
    lead: 'İhtiyacı olan okullar, kurumlar ve bireyler içindir. Her başvuruyu karşılayamayabiliriz; başvurunuzun durumu hakkında sizi bilgilendiririz.',
    wer: 'Başvuruyu kim yapıyor?',
    kurum: 'Kurum (okul, sosyal hizmet, dernek)',
    privat: 'Bireysel başvuru',
    organisation: 'Kurumun adı',
    ansprechperson: 'İletişim kişisi',
    vorname: 'Ad (veya kısaltma)',
    email: 'E-posta adresi',
    plz: 'Posta kodu (bölge için, tam adres değil)',
    plzHinweis: 'Beş rakam',
    geraeteart: 'Cihaz türü',
    laptop: 'Laptop',
    tablet: 'Tablet',
    beides: 'İkisi de',
    anzahl: 'Adet (1 ile 10 arası)',
    zweck: 'Kullanım amacı (tek cümle)',
    nachweis: 'Belge (bir tane; yalnızca ad ve dönemin yazılı olduğu ilk sayfa)',
    nachweisHinweis: 'Şimdilik dosya yükleyemezsiniz. Yükleme açıldığında size haber veririz. Lütfen adınız ve dönem dışındaki tüm bilgileri karartın.',
    nachweisOptionen: {
      buergergeld: 'Bürgergeld (SGB II): Yardım kararı (Leistungsbescheid) veya kısa belge',
      sozialhilfe: 'Sosyal yardım (SGB XII): Yardım kararı',
      wohngeld: 'Konut yardımı (Wohngeld): Wohngeld kararı',
      bvg_bkgg: 'BVG (§ 27a) veya BKGG (§ 6a): Karar',
    },
    datenschutz: 'Bu başvuruyla ilgili veri koruma bilgisini okudum.',
    senden: 'Başvuruyu gönder',
    sendet: 'Gönderiliyor …',
    danke: 'Teşekkür ederiz.',
    antragsnummer: 'Başvuru numaranız:',
    aufbewahren: 'Lütfen saklayın.',
    meldung: 'Size e-posta ile dönüş yaparız.',
    keineZusage: 'Kesin bir cihaz garantisi veremeyiz.',
    pruefen: 'Lütfen formu kontrol edin.',
    sprache: 'Dil',
  },
  en: {
    titel: 'Request a device',
    lead: 'For schools, institutions and private individuals in need. We cannot fulfil every request; we will inform you about the status of your request.',
    wer: 'Who is applying?',
    kurum: 'Institution (school, social service, association)',
    privat: 'Private person',
    organisation: 'Name of the institution',
    ansprechperson: 'Contact person',
    vorname: 'First name (or initials)',
    email: 'E-mail address',
    plz: 'Postcode (for the region, not the exact address)',
    plzHinweis: 'Five digits',
    geraeteart: 'Device type',
    laptop: 'Laptop',
    tablet: 'Tablet',
    beides: 'Both',
    anzahl: 'Number (1 to 10)',
    zweck: 'Purpose (one sentence)',
    nachweis: 'Proof (one document, only the first page with name and period)',
    nachweisHinweis: 'You cannot upload a file here yet. We will contact you when uploads are available. Please black out everything except your name and the period.',
    nachweisOptionen: {
      buergergeld: 'Bürgergeld (SGB II): benefit notice or short confirmation',
      sozialhilfe: 'Social assistance (SGB XII): benefit notice',
      wohngeld: 'Housing benefit (Wohngeld): notice',
      bvg_bkgg: 'BVG (§ 27a) or BKGG (§ 6a): notice',
    },
    datenschutz: 'I have read the privacy notice for this request.',
    senden: 'Send request',
    sendet: 'Sending …',
    danke: 'Thank you.',
    antragsnummer: 'Your request number is',
    aufbewahren: 'Please keep it.',
    meldung: 'We will contact you by e-mail.',
    keineZusage: 'We cannot guarantee a device.',
    pruefen: 'Please check the form.',
    sprache: 'Language',
  },
};
