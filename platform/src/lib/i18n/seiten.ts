import type { Lang } from './sprache';
import type { Widen } from './widen';

// Texts of the platform pages /spenden, /annahmekriterien, /geraetepartnerschaft and /beantragen (interim page).
// German is the base text; Turkish and English must have the same keys (enforced by the type and by seiten.test.ts).
const de = {
  badgeSoon: 'demnächst',
  badgeDraft: 'Entwurf – nur Testumgebung',
  spenden: {
    titel: 'Laptop oder Tablet spenden',
    lead: 'Ohne Konto, in wenigen Minuten. Bevor Sie etwas verschicken, sehen Sie, ob Ihr Gerät voraussichtlich passt.',
    weiter: 'Wie geht es nach der Vorprüfung weiter?',
    bisDahinVor: 'Kontaktdaten, Übergabe und Absenden folgen in Kürze. Bis dahin schreiben Sie uns gern an',
    ablauf: 'Ablauf der Spende',
    uebergabe: 'Übergabe',
    schritte: [
      ['Einstieg', 'Welche Geräte wir annehmen, wie es abläuft, Daten sichern und Sperren lösen.'],
      ['Geräte erfassen', 'Laptop oder Tablet, mehrere Geräte möglich. „Weiß ich nicht“ ist immer erlaubt.'],
      ['Vorprüfung', 'Sofortige Einschätzung nach den veröffentlichten Annahmekriterien.'],
      ['Kontakt und Übergabe', 'Name, E-Mail und Postleitzahl. Die Übergabe stimmen wir mit Ihnen ab.'],
      ['Erklärungen', 'Das Gerät gehört Ihnen und ist nicht geleast. Ihre Daten haben Sie gesichert.'],
      ['Zusammenfassung', 'Alle Angaben noch einmal prüfen und ändern.'],
      ['Absenden', 'Sie erhalten eine Vorgangsnummer.'],
      ['Bestätigung', 'Freiwillig: Status-Updates zu Ihrem Gerät, Neuigkeiten oder ein Konto.'],
    ],
    uebergabeOptionen: {
      uebergabeAbsprache: 'Übergabe nach Absprache',
      abholung: 'Abholung',
      paketversand: 'Paketversand',
      sammelstelle: 'Sammelstelle',
    },
  },
  annahme: {
    titel: 'Annahmekriterien',
    entwurf: 'Entwurf',
    lead: 'Diese Werte sind Ziele, keine starren Grenzen. Die Vorprüfung ist eine Einschätzung; endgültig entscheiden wir erst nach der technischen Prüfung des Geräts.',
    fuerAlle: 'Für alle Geräte',
    kriterium: 'Kriterium',
    geeignet: 'Vorläufig geeignet',
    pruefung: 'Manuelle Prüfung',
    nichtGeeignet: 'Voraussichtlich nicht geeignet',
  },
  partner: {
    titel: 'Gerätepartnerschaft',
    lead: 'Für Unternehmen und Organisationen, die regelmäßig Geräte abgeben möchten. Jede Lieferung prüfen wir einzeln; eine automatische Annahme gibt es nicht.',
  },
  beantragen: {
    titel: 'Gerät beantragen',
    lead: 'Für Schulen, Einrichtungen und Privatpersonen mit Bedarf. Wir können nicht jede Anfrage erfüllen; wir melden uns mit dem Stand Ihrer Anfrage.',
    interimTitel: 'Das Online-Formular folgt in Kürze',
    bisDahin: 'Bis dahin senden Sie uns Ihre Anfrage einfach per E-Mail. Bitte nennen Sie:',
    punkte: [
      'Ihren Namen bzw. den Namen Ihrer Einrichtung und eine Kontaktperson,',
      'Ihre Postleitzahl (nur die Region, keine genaue Anschrift),',
      'die Gerätart (Laptop oder Tablet) und die Anzahl,',
      'kurz den Verwendungszweck.',
    ],
    bescheid: 'Privatpersonen legen bitte, sofern vorhanden, einen Bescheid bei, auf dem Sie nur Namen und Bewilligungszeitraum lassen. Alle anderen Angaben schwärzen Sie bitte.',
    mailKnopf: 'Anfrage per E-Mail senden',
  },
};

export type SeitenTexte = Widen<typeof de>;

const tr: SeitenTexte = {
  badgeSoon: 'yakında',
  badgeDraft: 'Taslak – yalnızca test ortamı',
  spenden: {
    titel: 'Laptop veya tablet bağışla',
    lead: 'Hesap gerekmez, birkaç dakikada. Bir şey göndermeden önce cihazınızın büyük olasılıkla uygun olup olmadığını görürsünüz.',
    weiter: 'Ön kontrolden sonra ne olur?',
    bisDahinVor: 'İletişim bilgileri, teslim ve gönderme çok yakında eklenecek. O zamana kadar bize şu adresten yazabilirsiniz:',
    ablauf: 'Bağış adımları',
    uebergabe: 'Teslim',
    schritte: [
      ['Başlangıç', 'Hangi cihazları kabul ediyoruz, süreç nasıl işliyor, verileri yedekleme ve kilitleri kaldırma.'],
      ['Cihazları ekleyin', 'Laptop veya tablet; birden fazla cihaz eklenebilir. „Bilmiyorum“ her zaman seçilebilir.'],
      ['Ön kontrol', 'Yayımlanmış kabul kriterlerine göre anında değerlendirme.'],
      ['İletişim ve teslim', 'Ad, e-posta ve posta kodu. Teslimi sizinle birlikte kararlaştırırız.'],
      ['Beyanlar', 'Cihaz size ait ve kiralık değil. Verilerinizi yedeklediniz.'],
      ['Özet', 'Tüm bilgileri bir kez daha kontrol edin ve gerekirse değiştirin.'],
      ['Gönder', 'Bir işlem numarası alırsınız.'],
      ['Onay', 'İsteğe bağlı: cihazınızla ilgili durum bilgileri, haberler veya bir hesap.'],
    ],
    uebergabeOptionen: {
      uebergabeAbsprache: 'Anlaşmaya göre teslim',
      abholung: 'Evden alma',
      paketversand: 'Kargo ile gönderim',
      sammelstelle: 'Toplama noktası',
    },
  },
  annahme: {
    titel: 'Kabul kriterleri',
    entwurf: 'Taslak',
    lead: 'Bu değerler hedeftir, katı sınırlar değildir. Ön kontrol bir değerlendirmedir; kesin kararı cihazın teknik incelemesinden sonra veririz.',
    fuerAlle: 'Tüm cihazlar için',
    kriterium: 'Ölçüt',
    geeignet: 'Ön değerlendirmeyle uygun',
    pruefung: 'Elle inceleme',
    nichtGeeignet: 'Büyük olasılıkla uygun değil',
  },
  partner: {
    titel: 'Cihaz ortaklığı',
    lead: 'Düzenli olarak cihaz vermek isteyen şirketler ve kuruluşlar için. Her teslimatı tek tek inceleriz; otomatik kabul yoktur.',
  },
  beantragen: {
    titel: 'Cihaz talep et',
    lead: 'İhtiyacı olan okullar, kurumlar ve kişiler için. Her talebi karşılayamayabiliriz; talebinizin durumuyla ilgili size dönüş yaparız.',
    interimTitel: 'Çevrimiçi form çok yakında',
    bisDahin: 'O zamana kadar talebinizi e-posta ile gönderebilirsiniz. Lütfen şunları belirtin:',
    punkte: [
      'adınızı veya kurumunuzun adını ve bir irtibat kişisini,',
      'posta kodunuzu (yalnızca bölge, tam adres değil),',
      'cihaz türünü (laptop veya tablet) ve adedini,',
      'kısaca kullanım amacını.',
    ],
    bescheid: 'Bireysel başvurularda, varsa, üzerinde yalnızca ad ve onay dönemi görünen bir karar belgesi ekleyin. Diğer tüm bilgileri lütfen karartın.',
    mailKnopf: 'Talebi e-posta ile gönder',
  },
};

const en: SeitenTexte = {
  badgeSoon: 'coming soon',
  badgeDraft: 'Draft – test environment only',
  spenden: {
    titel: 'Donate a laptop or tablet',
    lead: 'No account needed, takes a few minutes. Before you send anything, you can see whether your device is likely to fit.',
    weiter: 'What happens after the pre-check?',
    bisDahinVor: 'Contact details, handover and sending will follow soon. Until then, please write to us at',
    ablauf: 'Steps of the donation',
    uebergabe: 'Handover',
    schritte: [
      ['Start', 'Which devices we accept, how it works, backing up data and removing locks.'],
      ['Add devices', 'Laptop or tablet, several devices possible. „I don’t know“ is always allowed.'],
      ['Pre-check', 'Instant assessment based on the published acceptance criteria.'],
      ['Contact and handover', 'Name, e-mail and postcode. We agree the handover with you.'],
      ['Declarations', 'The device belongs to you and is not leased. You have backed up your data.'],
      ['Summary', 'Check all details once more and change them if needed.'],
      ['Send', 'You receive a reference number.'],
      ['Confirmation', 'Optional: status updates about your device, news or an account.'],
    ],
    uebergabeOptionen: {
      uebergabeAbsprache: 'Handover by arrangement',
      abholung: 'Pick-up',
      paketversand: 'Parcel shipping',
      sammelstelle: 'Drop-off point',
    },
  },
  annahme: {
    titel: 'Acceptance criteria',
    entwurf: 'Draft',
    lead: 'These values are targets, not strict limits. The pre-check is an assessment; we only decide for good after the technical check of the device.',
    fuerAlle: 'For all devices',
    kriterium: 'Criterion',
    geeignet: 'Provisionally suitable',
    pruefung: 'Manual check',
    nichtGeeignet: 'Probably not suitable',
  },
  partner: {
    titel: 'Device partnership',
    lead: 'For companies and organisations that want to hand over devices regularly. We check every delivery individually; there is no automatic acceptance.',
  },
  beantragen: {
    titel: 'Request a device',
    lead: 'For schools, institutions and individuals in need. We cannot fulfil every request; we will get back to you with the status of your request.',
    interimTitel: 'The online form is coming soon',
    bisDahin: 'Until then, simply send us your request by e-mail. Please include:',
    punkte: [
      'your name or the name of your institution and a contact person,',
      'your postcode (the region only, no exact address),',
      'the type of device (laptop or tablet) and the number,',
      'a short note on what it will be used for.',
    ],
    bescheid: 'Individuals, please attach a notice of entitlement if you have one, leaving only your name and the approval period visible. Please black out everything else.',
    mailKnopf: 'Send request by e-mail',
  },
};

export const SEITEN: Record<Lang, SeitenTexte> = { de, tr, en };
