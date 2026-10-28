import type { Lang } from './sprache';

// Texts of the shared parts (header, footer, banner, home page). Pages in the platform are still German.
export type UiTexte = {
  navSpenden: string;
  navBeantragen: string;
  sprachwahl: string;
  weitere: string;
  rechtliches: string;
  copyright: string;
  annahme: string;
  partner: string;
  impressum: string;
  datenschutz: string;
  barrierefrei: string;
  bannerTest: string;
  bannerLive: string;
  teamAnmeldung: string;
  nurDeutsch: string;
  homeH1: string;
  homeLead: string;
  homeCta: string;
};

export const UI: Record<Lang, UiTexte> = {
  de: {
    navSpenden: 'Gerät spenden',
    navBeantragen: 'Gerät beantragen',
    sprachwahl: 'Sprache',
    weitere: 'Weitere Seiten',
    rechtliches: 'Rechtliches',
    copyright: '© WeiterWert – nicht eingetragener Verein in Gründung',
    annahme: 'Annahmekriterien',
    partner: 'Gerätepartnerschaft',
    impressum: 'Impressum',
    datenschutz: 'Datenschutzerklärung',
    barrierefrei: 'Barrierefreiheit',
    bannerTest: 'Testumgebung – keine echten Spenden',
    bannerLive: 'Beta – wir prüfen jede Anfrage von Hand.',
    teamAnmeldung: 'Team-Anmeldung',
    nurDeutsch: '',
    homeH1: 'Technik weitergeben. Chancen eröffnen.',
    homeLead:
      'Gebrauchte Laptops und Tablets werden geprüft, sicher gelöscht und an Schüler:innen weitergegeben. Prüfen Sie in wenigen Schritten, ob Ihr Gerät passt.',
    homeCta: 'Laptop oder Tablet spenden',
  },
  tr: {
    navSpenden: 'Cihaz bağışla',
    navBeantragen: 'Cihaz talep et',
    sprachwahl: 'Dil',
    weitere: 'Diğer sayfalar',
    rechtliches: 'Yasal bilgiler',
    copyright: '© WeiterWert – kayıtlı dernek değil, kuruluş aşamasında',
    annahme: 'Kabul kriterleri',
    partner: 'Cihaz ortaklığı',
    impressum: 'Künye (Impressum)',
    datenschutz: 'Gizlilik bildirimi',
    barrierefrei: 'Erişilebilirlik',
    bannerTest: 'Test ortamı – gerçek bağış yapılmaz',
    bannerLive: 'Beta – her başvuruyu elle kontrol ediyoruz.',
    teamAnmeldung: 'Ekip girişi',
    nurDeutsch: 'Bu sayfa şimdilik yalnızca Almanca.',
    homeH1: 'Teknolojiyi aktar. Fırsatların kapısını aç.',
    homeLead:
      'Kullanılmayan laptop ve tabletler kontrol edilir, güvenli şekilde silinir ve öğrencilere ulaştırılır. Birkaç adımda cihazınızın uygun olup olmadığını öğrenin.',
    homeCta: 'Laptop veya tablet bağışla',
  },
  en: {
    navSpenden: 'Donate a device',
    navBeantragen: 'Request a device',
    sprachwahl: 'Language',
    weitere: 'More pages',
    rechtliches: 'Legal',
    copyright: '© WeiterWert – not yet a registered association',
    annahme: 'Acceptance criteria',
    partner: 'Device partnership',
    impressum: 'Legal notice (Impressum)',
    datenschutz: 'Privacy policy',
    barrierefrei: 'Accessibility',
    bannerTest: 'Test environment – no real donations',
    bannerLive: 'Beta – we check every request by hand.',
    teamAnmeldung: 'Team sign-in',
    nurDeutsch: 'This page is currently available in German only.',
    homeH1: 'Pass on technology. Open doors to opportunities.',
    homeLead:
      'Used laptops and tablets are checked, securely wiped and passed on to students. Find out in a few steps whether your device fits.',
    homeCta: 'Donate a laptop or tablet',
  },
};
