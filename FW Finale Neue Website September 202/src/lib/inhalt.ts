/**
 * Alles Geschaeftliche steht hier. Grundsatz: Es werden keine Referenzen,
 * Kennzahlen oder Zitate erfunden. Was nicht belegt ist, steht nicht auf der
 * Seite — auch dann nicht, wenn das Ergebnis gut war.
 */

export const marke = {
  name: 'Fokuswerk',
  firma: 'Fokuswerk GbR',
  strasse: 'Schramperweg 90',
  plz: '26129',
  ort: 'Oldenburg',
  telefon: '+4917663307587',
  telefonText: '0176 633 075 87',
  mail: 'contact@fokuswerk.de',
  ustId: 'DE456629159',
  vertreter: 'Thees Bodenstab & Julius Abt',
  instagram: 'https://www.instagram.com/fokuswerk.de/',
  linkedin: 'https://www.linkedin.com/company/fokuswerk/',
} as const;

export const cta = {
  text: 'Gespräch vereinbaren',
  notiz: '20 Minuten am Telefon. Danach wissen Sie, ob sich das für Sie rechnet.',
  ziel: '/kontakt',
} as const;

/** Jeder Eintrag trägt eine Zeile, die im Menü beim Überfahren erscheint —
 *  sie sagt, was hinter dem Wort steckt, bevor man klickt. */
export const navigation = [
  { titel: 'Leistungen', pfad: '/#arbeit', zeile: 'Kampagnen, Produktion, Seiten' },
  { titel: 'Vorgehen', pfad: '/#vorgehen', zeile: 'Fünf Schritte, dann monatlich' },
  { titel: 'Fallstudie', pfad: '/fallstudien/wav-westerstede', zeile: '68 Bewerbungen aus 550 €' },
  { titel: 'Kontakt', pfad: '/kontakt', zeile: '20 Minuten am Telefon' },
] as const;

/** Belegt aus den Werbekonten. Jede Zahl ist auf ein Konto zurückführbar. */
export const beleg = {
  budget: 550.27,
  bewerbungen: 68,
  brauchbar: '25–30',
  tage: 14,
  guenstig: 4.92,
  teuer: 218,
  anfragen: 120,
  monate: 2.5,
} as const;

/** Branchenwerte, als solche gekennzeichnet — keine Fokuswerk-Behauptung. */
export const rechnung = {
  stundenJahr: 1275,
  satzStandard: 95,
  quelle:
    'Verrechnete Stunden je Fachkraft und Jahr, multipliziert mit Ihrem Stundenverrechnungssatz. Branchenwerte für freie Werkstätten im ländlichen Raum, Stand 2026. Teile- und Materialumsatz kommt obendrauf.',
} as const;

/** Betriebe, die auf der alten Website bereits öffentlich genannt waren.
 *  Ohne erfundene Kennzahlen — nur Gewerk und Ort. */
export interface Betrieb {
  name: string;
  gewerk: string;
  ort: string;
  /** Gesetzt, wenn eine belegte Fallstudie vorliegt. */
  fall?: string;
}

export const betriebe: Betrieb[] = [
  { name: 'WAV Westerstede', gewerk: 'Kfz-Werkstatt', ort: 'Westerstede', fall: 'wav-westerstede' },
  { name: 'Jan Wandscher', gewerk: 'Steinmetz und Bildhauer', ort: 'Oldenburg' },
  { name: 'Praxis für Zahnheilkunde', gewerk: 'Zahnmedizin', ort: 'Bad Zwischenahn' },
  { name: 'Optik am Haarenufer', gewerk: 'Augenoptik', ort: 'Oldenburg' },
];

/** Was wir konkret liefern. Jede Leistung nennt, was hineingeht und was
 *  herauskommt — sonst ist es eine Überschrift, keine Leistung.
 *  Reihenfolge nach Gewicht: Kampagnen sind das Geschäft, alles andere
 *  liefert ihnen zu. */
export const leistungen = [
  {
    nr: '01',
    titel: 'Kampagnen für Neukunden',
    kurz: 'Meta für die Region, Google für den Bedarf.',
    was: 'Meta macht Sie im Umkreis bekannt, Google fängt die ab, die gerade jetzt suchen. Wir bauen die Zielgruppen, testen mehrere Varianten gegeneinander und legen das Budget auf die um, die liefert. Gemessen wird in Anfragen und Anrufen, nicht in Aufrufen.',
    raus: ['Meta- und Google-Kampagnen, laufend betreut', 'Anfrageseite, auf Abschluss gebaut', 'Kosten je Anfrage, monatlich ausgewiesen'],
    bild: 'schluesseluebergabe',
  },
  {
    nr: '02',
    titel: 'Kampagnen für Mitarbeiter',
    kurz: 'Für die, die gerade nicht suchen.',
    was: 'Dieselbe Mechanik, andere Zielgruppe: ausgespielt dort, wo die Leute wohnen, die zu Ihnen fahren würden. Bewerben ohne Lebenslauf, ohne Anschreiben, direkt vom Handy — jede Bewerbung landet sofort auf Ihrem Telefon.',
    raus: ['Bewerberkampagne auf Meta', 'Karriereseite mit Kurzbewerbung', 'Kosten je Bewerbung, monatlich ausgewiesen'],
    bild: 'mechatroniker-handy',
  },
  {
    nr: '03',
    titel: 'Messung und Auswertung',
    kurz: 'Eine Seite im Monat, keine Dashboards.',
    was: 'Werbekonten, Tracking und Zuordnung richten wir so ein, dass am Monatsende eine Zahl steht, mit der Sie etwas anfangen können. Ohne saubere Messung ist Performance Marketing nur Werbung mit Rechnung.',
    raus: ['Konten und Messung auf Ihren Namen', 'Kosten je Anfrage und je Bewerbung', 'Was wir im nächsten Monat ändern, und warum'],
    bild: 'besprechung-werkbank',
  },
  {
    nr: '04',
    titel: 'Produktion im Betrieb',
    kurz: 'Ein Drehtag im Monat, bei Ihnen.',
    was: 'Kampagnen sind nur so gut wie das Material darin. Wir kommen mit Kamera, Ton und Licht in Ihre Halle und drehen den normalen Betrieb — Ihre Leute, Ihre Maschinen. Vier bis fünf Stunden, daraus der Vorrat für vier Wochen.',
    raus: ['8 bis 12 Clips für den Monat', 'Standbilder für Seiten und Anzeigen', 'Alle Rohaufnahmen, dauerhaft Ihr Eigentum'],
    bild: 'aufbau-stativ',
  },
  {
    nr: '05',
    titel: 'Seiten, die etwas tun',
    kurz: 'Anfrageseite, Karriereseite, Firmenseite.',
    was: 'Eine Kampagne, die auf eine schlechte Seite führt, verbrennt Budget. Deshalb bauen wir beides. Gebaut auf Ihren Namen und Ihr Konto, schnell, auf dem Handy zuerst, ohne Baukasten darunter. Diese Seite hier kommt aus derselben Werkstatt.',
    raus: ['Seiten, die Ihnen gehören', 'Ladezeiten unter einer Sekunde', 'Messung und Einwilligungen sauber aufgesetzt'],
    bild: 'kameramonitor',
  },
] as const;

/** Der Ablauf als Kette. Trägt die Scroll-Sequenz. */
export const schritte = [
  {
    nr: '01',
    marke: 'Der Drehtag',
    titel: 'Wir kommen zu Ihnen.',
    text: 'Keine Models, keine Studiobilder. Ihre Leute an Ihren Maschinen. Sie geben einen halben Tag ab, mehr Vorbereitung braucht es nicht — kein Workshop, keine Konzeptphase.',
    art: 'bild' as const,
    bild: 'aufbau-stativ',
  },
  {
    nr: '02',
    marke: 'Der Schnitt',
    titel: 'Wir schneiden selbst.',
    text: 'Aus einem Drehtag entstehen die Clips für vier Wochen — in zwei Fassungen: eine, die Kunden anspricht, und eine, die Bewerber anspricht. Dasselbe Material, zwei Aussagen, zwei Kampagnen.',
    art: 'bild' as const,
    bild: 'schnitt-vor-ort',
  },
  {
    nr: '03',
    marke: 'Die Anzeige',
    titel: 'Wir schalten im Umkreis.',
    text: 'Meta im Umkreis Ihres Betriebs, Google auf die Suchbegriffe, die Bedarf anzeigen. Nie eine Anzeige, sondern mehrere Varianten gegeneinander — wir wissen vorher nicht, welche trägt.',
    art: 'telefon' as const,
    bild: 'mechatroniker-handy',
  },
  {
    nr: '04',
    marke: 'Die Landung',
    titel: 'Wir bauen, wo es ankommt.',
    text: 'Eine Seite mit genau einer Aufgabe: aus Interesse eine Anfrage oder eine Bewerbung machen. Kein Portal, kein PDF-Upload, keine Pflichtfelder, die niemand ausfüllt.',
    art: 'fenster' as const,
    bild: 'hero-hoch',
  },
  {
    nr: '05',
    marke: 'Die Messung',
    titel: 'Wir legen um, was nicht trägt.',
    text: 'Nach zehn Tagen steht fest, welche Variante liefert. Die teure wird abgeschaltet, das Budget wandert. Genau das ist der Unterschied zwischen Werbung und Performance Marketing.',
    art: 'konto' as const,
    bild: '',
  },
] as const;

/** Warum das Modell trägt. Drei Gründe, jeder mit einem Beleg. */
export const gruende = [
  {
    kopf: 'Das zweite Ergebnis kostet fast nichts',
    text: 'Die Kamera läuft ohnehin. Ob aus dem Drehtag ein Clip entsteht, der einen Kunden anspricht, oder einer, der einen Mechaniker anspricht, kostet uns fast dasselbe — Ihnen bringt es das Doppelte. Genau deshalb laufen bei uns zwei Kampagnen zum Preis von etwa einer.',
  },
  {
    kopf: 'Gemessen, nicht geraten',
    text: 'Bei WAV liefen drei Bewerbungswege gleichzeitig. Einer kostete 4,92 € pro Bewerbung, ein anderer 218 €. Ohne den Test hätten wir geraten — und in zwei von drei Fällen falsch. Dieses Lehrgeld ist bezahlt, beim nächsten Betrieb fangen wir nicht bei null an.',
  },
  {
    kopf: 'Niemand, an den wir weiterreichen',
    text: 'Es gibt keinen Account Manager, der Ihre Frage weitergibt, und keinen Freelancer, der Ihre Halle zum ersten Mal sieht. Wer zum Drehtag kommt, schaut abends auch die Zahlen im Werbekonto an. Deshalb betreuen wir zehn Betriebe und nicht fünfzig.',
  },
] as const;

