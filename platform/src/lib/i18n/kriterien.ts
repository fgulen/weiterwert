import { FUER_ALLE_GERAETE, KRITERIEN, type KriterienTabelle } from '@/lib/annahmekriterien';
import type { Lang } from './sprache';

// The acceptance criteria tables in three languages. German is the data in lib/annahmekriterien.ts.
// Turkish and English follow it row by row (same order, same numbers); kriterien.test.ts checks the shape.
export type KriterienTexte = { fuerAlle: string[]; tabellen: KriterienTabelle[] };

const tr: KriterienTexte = {
  fuerAlle: [
    'Şişmiş, hasarlı veya aşırı ısınan piller: lütfen göndermeyin ve getirmeyin.',
    'Hesaplar, kurumsal yönetim (örneğin Autopilot, Intune, Apple Business Manager) ve BIOS parolaları teslimden önce kaldırılmalıdır.',
    'Kiralık (leasing) cihazları kabul edemeyiz. Cihaz size ait olmalıdır.',
    'Şarj cihazı yoksa cihazı yine de memnuniyetle kabul ederiz.',
    'Bir şeyi bilmiyorsanız sizin için biz kontrol ederiz. Eksik bilgi hiçbir zaman reddedilme nedeni olmaz.',
  ],
  tabellen: [
    {
      geraet: 'Laptop (Windows/Linux)',
      zeilen: [
        { kriterium: 'İşlemci', geeignet: 'Windows 11 için uygun (yaklaşık Intel Core 8. nesil ve üzeri, AMD Ryzen 2000 ve üzeri)', pruefung: 'Eski veya düşük performanslı işlemciler (Celeron, Pentium N, Atom)' },
        { kriterium: 'Bellek (RAM)', geeignet: 'en az 8 GB', pruefung: '4 GB, yükseltilebiliyorsa', nichtGeeignet: '4 GB, anakarta lehimli (model kontrolünden sonra)' },
        { kriterium: 'Depolama', geeignet: 'en az 256 GB SSD', pruefung: '128 GB SSD veya sabit disk sökülmüş', nichtGeeignet: '64 GB veya daha küçük eMMC' },
        { kriterium: 'İşletim sistemi', geeignet: 'Desteklenen, güvenli sistem (Windows 11 uyumlu)', pruefung: 'Yükseltme veya başka bir sistem gerekli' },
        { kriterium: 'Ekran', geeignet: '13 inç ve üzeri, çalışıyor', pruefung: 'küçük çatlak, onarılabilir' },
        { kriterium: 'Pil', geeignet: 'şarjı tutuyor, şişmemiş (hedef: en az %70 kapasite)', pruefung: 'düşük kapasite', nichtGeeignet: 'şişmiş, hasarlı veya aşırı ısınıyor' },
        { kriterium: 'Bağlantılar, kamera, mikrofon', geeignet: 'Wi-Fi, USB, şarj, kamera ve mikrofon çalışıyor', pruefung: 'onarılabilir arıza' },
      ],
    },
    {
      geraet: 'Chromebook',
      zeilen: [
        { kriterium: 'Güncelleme bitişi (AUE)', geeignet: 'gelecekte en az 2 yıl', pruefung: '2 yıldan az', nichtGeeignet: 'zaten dolmuş' },
        { kriterium: 'Yönetim', geeignet: 'bir kuruluşa kayıtlı değil', pruefung: 'Kayıt henüz kaldırılmamış' },
      ],
    },
    {
      geraet: 'MacBook',
      zeilen: [
        { kriterium: 'macOS', geeignet: 'Model güncel macOS alıyor', pruefung: 'yalnızca eski güvenlik güncellemeleri' },
        { kriterium: 'Kilitler', geeignet: 'Etkinleştirme Kilidi kaldırılabilir', pruefung: 'Üretici yazılımı parolası belirsiz', nichtGeeignet: 'Etkinleştirme Kilidi kaldırılamıyor' },
      ],
    },
    {
      geraet: 'Android tablet',
      zeilen: [
        { kriterium: 'Bellek (RAM) / Depolama', geeignet: 'en az 4 GB / 64 GB', pruefung: '3 GB / 32 GB' },
        { kriterium: 'Güncellemeler', geeignet: 'güvenlik güncellemesi alıyor, 64 bit', pruefung: 'Destek yakında bitiyor' },
        { kriterium: 'Ekran', geeignet: '9 inç ve üzeri', pruefung: 'daha küçük ama çalışıyor' },
        { kriterium: 'Kilitler', geeignet: 'Google hesabı kaldırılmış', pruefung: 'SIM veya şebeke kilidi', nichtGeeignet: 'Google hesap kilidi (FRP) veya cihaz yönetimi kaldırılamıyor' },
      ],
    },
    {
      geraet: 'iPad',
      zeilen: [
        { kriterium: 'iPadOS', geeignet: 'Model güncel iPadOS alıyor (kabulde yeniden kontrol edilir)', pruefung: 'yalnızca eski güvenlik sürümü' },
        { kriterium: 'Depolama', geeignet: 'en az 64 GB', pruefung: '32 GB' },
        { kriterium: 'Kilitler', geeignet: 'Etkinleştirme Kilidi kaldırılabilir', pruefung: 'Durum belirsiz', nichtGeeignet: 'Etkinleştirme Kilidi kaldırılamıyor' },
      ],
    },
  ],
};

const en: KriterienTexte = {
  fuerAlle: [
    'Swollen, damaged or overheating batteries: please do not send or bring them.',
    'Accounts, company management (for example Autopilot, Intune, Apple Business Manager) and BIOS passwords must be removed before handover.',
    'We cannot accept leased devices. The device must belong to you.',
    'If the charger is missing, we are still happy to accept the device.',
    'If you do not know something, we will check it for you. Missing information never leads to a rejection.',
  ],
  tabellen: [
    {
      geraet: 'Laptop (Windows/Linux)',
      zeilen: [
        { kriterium: 'Processor', geeignet: 'Supported by Windows 11 (roughly Intel Core 8th generation or newer, AMD Ryzen 2000 or newer)', pruefung: 'Older or low-power processors (Celeron, Pentium N, Atom)' },
        { kriterium: 'Memory (RAM)', geeignet: 'at least 8 GB', pruefung: '4 GB, if upgradable', nichtGeeignet: '4 GB soldered on (after checking the model)' },
        { kriterium: 'Storage', geeignet: 'at least 256 GB SSD', pruefung: '128 GB SSD or hard drive removed', nichtGeeignet: 'eMMC with 64 GB or less' },
        { kriterium: 'Operating system', geeignet: 'Supported, secure system (Windows 11 compatible)', pruefung: 'Upgrade or another system needed' },
        { kriterium: 'Display', geeignet: '13 inches or larger, working', pruefung: 'small crack, repairable' },
        { kriterium: 'Battery', geeignet: 'holds a charge, not swollen (target: at least 70 % capacity)', pruefung: 'low capacity', nichtGeeignet: 'swollen, damaged or overheating' },
        { kriterium: 'Ports, camera, microphone', geeignet: 'Wi-Fi, USB, charging, camera and microphone work', pruefung: 'repairable defect' },
      ],
    },
    {
      geraet: 'Chromebook',
      zeilen: [
        { kriterium: 'End of updates (AUE)', geeignet: 'at least 2 years in the future', pruefung: 'less than 2 years', nichtGeeignet: 'already expired' },
        { kriterium: 'Management', geeignet: 'not enrolled in an organisation', pruefung: 'Enrolment not yet removed' },
      ],
    },
    {
      geraet: 'MacBook',
      zeilen: [
        { kriterium: 'macOS', geeignet: 'Model receives the current macOS', pruefung: 'only older security updates' },
        { kriterium: 'Locks', geeignet: 'Activation Lock can be removed', pruefung: 'Firmware password unclear', nichtGeeignet: 'Activation Lock cannot be removed' },
      ],
    },
    {
      geraet: 'Android tablet',
      zeilen: [
        { kriterium: 'Memory (RAM) / Storage', geeignet: 'at least 4 GB / 64 GB', pruefung: '3 GB / 32 GB' },
        { kriterium: 'Updates', geeignet: 'receives security updates, 64-bit', pruefung: 'Support ends soon' },
        { kriterium: 'Display', geeignet: '9 inches or larger', pruefung: 'smaller, but working' },
        { kriterium: 'Locks', geeignet: 'Google account removed', pruefung: 'SIM or network lock', nichtGeeignet: 'Google account lock (FRP) or device management cannot be removed' },
      ],
    },
    {
      geraet: 'iPad',
      zeilen: [
        { kriterium: 'iPadOS', geeignet: 'Model receives the current iPadOS (checked again on acceptance)', pruefung: 'only an older security version' },
        { kriterium: 'Storage', geeignet: 'at least 64 GB', pruefung: '32 GB' },
        { kriterium: 'Locks', geeignet: 'Activation Lock can be removed', pruefung: 'Status unclear', nichtGeeignet: 'Activation Lock cannot be removed' },
      ],
    },
  ],
};

export const KRITERIEN_TEXTE: Record<Lang, KriterienTexte> = {
  de: { fuerAlle: FUER_ALLE_GERAETE, tabellen: KRITERIEN },
  tr,
  en,
};
