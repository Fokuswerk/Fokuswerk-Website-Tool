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

export const navigation = [
  { titel: 'Leistungen', pfad: '/#arbeit' },
  { titel: 'Vorgehen', pfad: '/#vorgehen' },
  { titel: 'Fälle', pfad: '/fallstudien/wav-westerstede' },
  { titel: 'Kontakt', pfad: '/kontakt' },
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
 *  herauskommt — sonst ist es eine Überschrift, keine Leistung. */
export const leistungen = [
  {
    nr: '01',
    titel: 'Produktion im Betrieb',
    kurz: 'Ein Drehtag im Monat, bei Ihnen.',
    was: 'Wir kommen mit Kamera, Ton und Licht in Ihre Halle und drehen den normalen Betrieb — Ihre Leute, Ihre Maschinen, Ihre Arbeit. Vier bis fünf Stunden, dann sind wir wieder weg.',
    raus: ['8 bis 12 Clips für den Monat', 'Standbilder für Seiten und Anzeigen', 'Alle Rohaufnahmen, dauerhaft Ihr Eigentum'],
    bild: 'aufbau-stativ',
  },
  {
    nr: '02',
    titel: 'Bewerberkampagnen',
    kurz: 'Für die, die gerade nicht suchen.',
    was: 'Ausgespielt im Umkreis Ihres Betriebs, dort wo die Leute wohnen, die zu Ihnen fahren würden. Bewerben ohne Lebenslauf, ohne Anschreiben, direkt vom Handy — jede Bewerbung landet sofort auf Ihrem Telefon.',
    raus: ['Kampagne auf Meta, laufend betreut', 'Karriereseite mit Kurzbewerbung', 'Bewerbungen als Push, nicht als Postfach'],
    bild: 'mechatroniker-handy',
  },
  {
    nr: '03',
    titel: 'Neukundenkampagnen',
    kurz: 'Meta für die Region, Google für den Bedarf.',
    was: 'Dasselbe Material, andere Aussage. Meta macht Sie im Umkreis bekannt, Google fängt die ab, die gerade jetzt suchen. Gemessen wird in Anfragen, nicht in Aufrufen.',
    raus: ['Meta- und Google-Kampagnen', 'Anfrageseite, auf Abschluss gebaut', 'Anrufe und Formularanfragen, zugeordnet'],
    bild: 'schluesseluebergabe',
  },
  {
    nr: '04',
    titel: 'Seiten, die etwas tun',
    kurz: 'Karriereseite, Anfrageseite, Firmenseite.',
    was: 'Gebaut auf Ihren Namen und Ihr Konto, nicht auf unseres. Schnell, auf dem Handy zuerst, ohne Baukasten darunter. Diese Seite hier kommt aus derselben Werkstatt.',
    raus: ['Seiten, die Ihnen gehören', 'Ladezeiten unter einer Sekunde', 'Messung und Einwilligungen sauber aufgesetzt'],
    bild: 'kameramonitor',
  },
  {
    nr: '05',
    titel: 'Messung und Auswertung',
    kurz: 'Eine Seite im Monat, keine Dashboards.',
    was: 'Werbekonten, Tracking und Zuordnung richten wir so ein, dass am Monatsende eine Zahl steht, mit der Sie etwas anfangen können: was eine Bewerbung gekostet hat und was eine Anfrage.',
    raus: ['Konten auf Ihren Namen', 'Kosten je Bewerbung und je Anfrage', 'Was wir im nächsten Monat ändern, und warum'],
    bild: 'besprechung-werkbank',
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
    text: 'Aus einem Drehtag entstehen die Clips für vier Wochen — in zwei Fassungen: eine, die Bewerber anspricht, und eine, die Kunden anspricht. Dasselbe Material, zwei Aussagen.',
    art: 'bild' as const,
    bild: 'schnitt-vor-ort',
  },
  {
    nr: '03',
    marke: 'Die Anzeige',
    titel: 'Wir schalten im Umkreis.',
    text: 'Ausgespielt dort, wo die Leute wohnen, die zu Ihnen fahren würden. Nicht eine Anzeige, sondern mehrere Varianten gleichzeitig — wir wissen vorher nicht, welche trägt.',
    art: 'telefon' as const,
    bild: 'mechatroniker-handy',
  },
  {
    nr: '04',
    marke: 'Die Landung',
    titel: 'Wir bauen, wo es ankommt.',
    text: 'Eine Seite mit genau einer Aufgabe: aus Interesse eine Bewerbung oder eine Anfrage machen. Kein Portal, kein PDF-Upload, keine Pflichtfelder, die niemand ausfüllt.',
    art: 'fenster' as const,
    bild: 'hero-hoch',
  },
  {
    nr: '05',
    marke: 'Die Messung',
    titel: 'Wir legen um, was nicht trägt.',
    text: 'Nach zehn Tagen steht fest, welche Variante liefert. Die teure wird abgeschaltet, das Budget wandert. Das ist der Unterschied zwischen Werbung und Kampagne.',
    art: 'konto' as const,
    bild: '',
  },
] as const;

/** Warum das Modell trägt. Drei Gründe, jeder mit einem Beleg. */
export const gruende = [
  {
    kopf: 'Das zweite Ergebnis kostet fast nichts',
    text: 'Die Kamera läuft ohnehin. Ob aus dem Drehtag ein Clip entsteht, der einen Mechaniker anspricht, oder einer, der einen Kunden anspricht, kostet uns fast dasselbe — Ihnen bringt es das Doppelte. Genau deshalb bekommen Sie zwei Kampagnen zum Preis von etwa einer.',
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

export const disziplinen = [
  {
    kennung: 'Bewegtbild',
    titel: 'Wir drehen im Betrieb',
    text: 'Keine Models, keine Studiobilder. Ihre Leute an Ihren Maschinen. Ein halber Tag im Monat, daraus der Vorrat für vier Wochen.',
  },
  {
    kennung: 'Performance',
    titel: 'Wir fahren die Kampagnen',
    text: 'Meta und Google, mit Messung, die trägt. Varianten laufen gegeneinander, bis eine gewinnt — und die andere wird abgeschaltet.',
  },
  {
    kennung: 'Web',
    titel: 'Wir bauen, wo es landet',
    text: 'Karriereseite, Anfrageseite, Firmenseite. Auf Ihrem Konto, auf Ihren Namen. Diese Seite hier ist aus derselben Werkstatt.',
  },
] as const;
