// Gesamtprozess Gerät vom Eingang bis zum Abschluss, als Daten. Quelle: docs/geraete-ablauf-ozet.md (Abschnitt Gesamtprozess).
// Die erlaubten Übergänge stehen in geraet-ablauf.ts (GERAET_FOLGE). Ein Test prüft, dass beides zusammenpasst.
// Offene Punkte verweisen auf die Nummern in der Liste der offenen Fragen (Punkt N).
import type { Zweisprachig } from './ablauf-stand';

export type ProzessSchritt = {
  nr: number;
  titel: Zweisprachig;
  /** Status, die in diesem Schritt vorkommen. */
  status: string[];
  wer: Zweisprachig;
  text: Zweisprachig;
  /** Offene Punkte, die diesen Schritt betreffen. */
  offen: number[];
};

/**
 * Schritte, die schon umgesetzt sind (Oberfläche und/oder Regeln).
 * Schritt 2 (Zweite Kontrolle) ist im Vorgang umgesetzt, bisher nur in der Testumgebung.
 */
export const ERLEDIGT_SCHRITTE: number[] = [2];

export const GERAET_PROZESS: ProzessSchritt[] = [
  {
    nr: 1,
    titel: { de: 'Eingang', tr: 'Giriş' },
    status: ['eingegangen'],
    wer: { de: 'Technik', tr: 'Teknik ekip' },
    text: {
      de: 'Das Gerät kommt an und wird mit dem Vorgang verknüpft. Die Vorab-Freigabe (2 Admins) ist vorher erfolgt.',
      tr: 'Cihaz gelir ve başvuruyla eşleştirilir. Ön onay (2 admin) daha önce verilmiştir.',
    },
    offen: [11],
  },
  {
    nr: 2,
    titel: { de: 'Zweite Kontrolle', tr: 'İkinci kontrol' },
    status: ['zweite_kontrolle'],
    wer: { de: 'Admin', tr: 'Admin' },
    text: {
      de: 'Gelieferter Typ, Marke und Modell werden mit dem Antrag verglichen. Stimmen sie überein, geht das Gerät zur Löschung. Sonst kommt es in die Quarantäne.',
      tr: 'Teslim edilen tür, marka ve model başvuruyla karşılaştırılır. Uyuşursa cihaz silmeye gider, uyuşmazsa karantinaya alınır.',
    },
    offen: [],
  },
  {
    nr: 3,
    titel: { de: 'Quarantäne', tr: 'Karantina' },
    status: ['quarantaene'],
    wer: { de: 'Admin', tr: 'Admin' },
    text: {
      de: 'Abweichung oder Gerät nicht löschbar. Entweder Übernahme in den Bestand (weiter mit Löschung) oder Rücksendung.',
      tr: 'Uyuşmazlık veya silinemeyen cihaz. Ya envantere alınır (silmeye devam) ya da iade edilir.',
    },
    offen: [1, 2],
  },
  {
    nr: 4,
    titel: { de: 'Löschung', tr: 'Silme' },
    status: ['loeschung_offen', 'geloescht'],
    wer: { de: 'Technik; 2 Admins nur bei Fehlschlag, Ausnahme oder Vernichtung (Dok. 07)', tr: 'Teknik ekip; yalnızca başarısızlık, istisna veya imhada 2 admin (Dok. 07)' },
    text: {
      de: 'Daten werden nach der Löschrichtlinie gelöscht. Das Löschprotokoll wird erstellt. Schlägt die Löschung fehl, bleibt das Gerät im Status „Löschung offen“.',
      tr: 'Veriler silme politikasına göre silinir. Silme protokolü oluşturulur. Silme başarısız olursa cihaz "silme bekliyor" durumunda kalır.',
    },
    offen: [9, 10, 12],
  },
  {
    nr: 5,
    titel: { de: 'Technische Prüfung', tr: 'Teknik kontrol' },
    status: ['technische_pruefung'],
    wer: { de: 'Technik', tr: 'Teknik ekip' },
    text: {
      de: 'Das gelöschte Gerät wird geprüft. Ergebnis: Reparatur, freigegeben oder entsorgt.',
      tr: 'Silinmiş cihaz kontrol edilir. Sonuç: onarım, serbest veya imha.',
    },
    offen: [],
  },
  {
    nr: 6,
    titel: { de: 'Reparatur', tr: 'Onarım' },
    status: ['reparatur'],
    wer: { de: 'Technik', tr: 'Teknik ekip' },
    text: {
      de: 'Reparatur. Danach erneute technische Prüfung.',
      tr: 'Onarım. Ardından yeniden teknik kontrol.',
    },
    offen: [],
  },
  {
    nr: 7,
    titel: { de: 'Freigabe und Reservierung', tr: 'Serbest bırakma ve rezervasyon' },
    status: ['frei', 'reserviert'],
    wer: { de: 'Admin', tr: 'Admin' },
    text: {
      de: 'Das freigegebene Gerät wird einem Vorgang zugeordnet.',
      tr: 'Serbest bırakılan cihaz bir başvuruya atanır.',
    },
    offen: [6],
  },
  {
    nr: 8,
    titel: { de: 'Übergabe', tr: 'Teslim' },
    status: ['uebergeben'],
    wer: { de: 'Admin, Technik', tr: 'Admin, teknik ekip' },
    text: {
      de: 'Das Gerät wird übergeben. Das Übergabeprotokoll wird mit Unterschrift erstellt.',
      tr: 'Cihaz teslim edilir. İmzalı teslim protokolü oluşturulur.',
    },
    offen: [8],
  },
  {
    nr: 9,
    titel: { de: 'Rückgabe', tr: 'İade' },
    status: ['rueckgabe'],
    wer: { de: 'Admin', tr: 'Admin' },
    text: {
      de: 'Das Gerät wird an den Spender zurückgesandt. Ein Rückgabeprotokoll wird erstellt.',
      tr: 'Cihaz bağışçıya geri gönderilir. İade protokolü oluşturulur.',
    },
    offen: [2],
  },
  {
    nr: 10,
    titel: { de: 'Entsorgung', tr: 'İmha' },
    status: ['entsorgt'],
    wer: { de: 'Technik', tr: 'Teknik ekip' },
    text: {
      de: 'Das Gerät wird entsorgt. Der Nachweis wird geführt.',
      tr: 'Cihaz imha edilir. Kanıt kaydedilir.',
    },
    offen: [6, 12],
  },
  {
    nr: 11,
    titel: { de: 'Vorgangsabschluss', tr: 'Başvurunun kapanışı' },
    status: [],
    wer: { de: 'Admin', tr: 'Admin' },
    text: {
      de: 'Sind alle Geräte in einem Endstatus (übergeben, zurückgegeben, entsorgt), zeigt das System „abschlussbereit“. Der Admin schließt den Vorgang manuell. Das wird protokolliert.',
      tr: 'Tüm cihazlar son durumdaysa (teslim edildi, iade edildi, imha edildi) sistem "kapanışa hazır" gösterir. Admin başvuruyu elle kapatır. Bu kaydedilir.',
    },
    offen: [7],
  },
  {
    nr: 12,
    titel: { de: 'Protokolle und Korrektur', tr: 'Protokoller ve düzeltme' },
    status: [],
    wer: { de: 'System', tr: 'Sistem' },
    text: {
      de: 'Protokolle werden nach dem Abschluss nicht geändert. Eine Korrektur ist ein neues Protokoll mit Verweis auf das alte (Version + 1).',
      tr: 'Protokoller kapandıktan sonra değiştirilmez. Düzeltme, eskisine atıf yapan yeni bir protokoldür (sürüm + 1).',
    },
    offen: [7],
  },
];
