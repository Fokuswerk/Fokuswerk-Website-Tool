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
    bild: 'neuer-mitarbeiter',
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
    bild: 'drehtag-hebebuehne',
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
    text: 'Es gibt keinen Account Manager, der Ihre Frage weitergibt, und keinen Freelancer, der Ihre Halle zum ersten Mal sieht. Wer zum Drehtag kommt, schaut abends auch die Zahlen im Werbekonto an. Deshalb betreuen wir wenige Betriebe und nicht fünfzig.',
  },
] as const;


/* =========================================================================
   STARTSEITE — Aufbau 1 zu 1 nach der Gartenzwerg-Präsentation.
   Jede Aussage hier stammt aus dieser Datei, aus dem Zielkundenprofil
   (Strategie Fokuswerk/ICP.md) oder aus den Angebotsdokumenten
   (ANGEBOT_GRAND_SLAM.md, ANGEBOT_KFZ_INHALT.md). Die dort als Platzhalter
   markierten WAV-Werte (neun Monate, vier Bewerbungen) stehen hier nicht.
   ========================================================================= */

/** Vertrauensband unter dem Titelbild. Die vier Werte bekommen unter
 *  „Warum wir" je einen Beleg — oben behauptet, unten eingelöst. */
export const vertrauen = {
  satz: 'Aus Oldenburg, für Betriebe im Nordwesten. Dreh, Schnitt, Kampagne und Seite machen wir selbst — ohne Freelancer dazwischen.',
  werte: ['Gemessen', 'Selbst gedreht', 'Direkt', 'Auf Ihren Namen'],
} as const;

/** Das Problem in den Worten des Inhabers (Hindernisliste im Angebot). */
export const schmerzen = [
  { zeichen: 'uhr', zitat: 'Die Stellenanzeige läuft seit Monaten.', text: 'Ein Portal erreicht nur, wer aktiv sucht. Die guten Leute suchen nicht — sie haben einen Job.' },
  { zeichen: 'schleife', zitat: 'Das hatten wir schon mal.', text: 'Zwei Wochen lief etwas, dann kam der Alltag. Anfangen ist leicht, dranbleiben nicht.' },
  { zeichen: 'werkzeug', zitat: 'Dafür hat hier keiner Zeit.', text: 'Anzeigen texten, Budgets steuern, Bilder aussuchen. Neben dem Betrieb macht das niemand dauerhaft.' },
  { zeichen: 'kamera', zitat: 'Wir haben nichts zum Zeigen.', text: 'Keine Fotos, keine Videos. Wer anfragt oder sich bewirbt, sieht nicht, wo er landet.' },
] as const;

/** Ein Monat mit Fokuswerk, als gepinnte Scroll-Sequenz. */
export const monat = [
  {
    id: 'dreh', woche: 'Woche 1', phase: 'Der Drehtag', titel: 'Wir kommen zu Ihnen.',
    notiz: 'Kamera, Ton und Licht in Ihrer Halle. Vier bis fünf Stunden — danach ist der Vorrat für vier Wochen im Kasten.',
    arbeit: ['Dreh im laufenden Betrieb', 'Ihre Leute an Ihren Maschinen', 'Standbilder für Seiten und Anzeigen', 'Alle Rohaufnahmen gehören Ihnen'],
    bild: 'aufbau-stativ',
  },
  {
    id: 'schnitt', woche: 'Woche 2', phase: 'Schnitt und Start', titel: 'Aus einem Tag werden zwei Kampagnen.',
    notiz: 'Aus dem Drehtag entstehen 8 bis 12 Clips in zwei Fassungen: eine spricht Kunden an, eine Bewerber.',
    arbeit: ['8 bis 12 Clips für den Monat', 'Eine Fassung für Kunden, eine für Bewerber', 'Mehrere Anzeigenvarianten je Kampagne', 'Start auf Meta und Google'],
    bild: 'schnitt-vor-ort',
  },
  {
    id: 'messen', woche: 'Woche 3', phase: 'Messen', titel: 'Wir wissen vorher nicht, welche trägt.',
    notiz: 'Deshalb laufen mehrere Varianten gegeneinander. Nach zehn Tagen steht fest, welche liefert.',
    arbeit: ['Varianten laufen gegeneinander', 'Kosten je Anfrage und je Bewerbung', 'Die teure Variante wird abgeschaltet', 'Das Budget wandert zur besseren'],
    bild: 'mechatroniker-handy',
  },
  {
    id: 'bericht', woche: 'Woche 4', phase: 'Auswertung', titel: 'Eine Seite, eine Zahl.',
    notiz: 'Was eine Anfrage gekostet hat, was eine Bewerbung — und was wir im nächsten Monat ändern.',
    arbeit: ['Kosten je Anfrage und je Bewerbung', 'Was wir ändern, und warum', 'Konten und Messung auf Ihren Namen', 'Danach: der nächste Drehtag'],
    bild: 'besprechung-werkbank',
  },
] as const;

/** Das Prinzip: Anfragen statt Reichweite. */
export const prinzip = [
  { titel: 'Gezählt wird, was ankommt.', text: 'Anfragen, Anrufe, Bewerbungen. Am Monatsende steht eine Zahl, mit der Sie etwas anfangen können. Ohne saubere Messung ist Performance Marketing nur Werbung mit Rechnung.' },
  { titel: 'Die teure Variante fliegt raus.', text: 'Nie eine Anzeige, sondern mehrere gegeneinander. Die, die nicht trägt, wird abgeschaltet, und das Budget wandert zu der, die liefert.' },
  { titel: 'Ein Drehtag, zwei Ergebnisse.', text: 'Die Kamera läuft ohnehin. Ob daraus ein Clip für einen Kunden entsteht oder für einen Mechaniker, kostet uns fast dasselbe — Ihnen bringt es das Doppelte.' },
] as const;

/** So beginnt es. Zeitangaben aus dem Werkstattangebot. */
export const einstieg = [
  { nr: '01', titel: 'Das Gespräch', dauer: '20 Minuten, am Telefon', text: 'Wir gehen Ihre Zahlen durch. Danach wissen Sie, ob sich das für Ihren Betrieb rechnet — und wenn nicht, sagen wir Ihnen das im selben Gespräch.' },
  { nr: '02', titel: 'Konten und Seiten', dauer: 'einmalig', text: 'Wir richten Werbekonten, Messung und Zielgruppen auf Ihren Namen ein und bauen die Seite, auf der Anfragen und Bewerbungen ankommen.' },
  { nr: '03', titel: 'Der erste Drehtag', dauer: 'ein halber Tag', text: 'Keine Models, keine Studiobilder. Ihre Leute an Ihren Maschinen — mehr Vorbereitung braucht es nicht.' },
  { nr: '04', titel: 'Die Kampagnen laufen', dauer: 'nach zehn Tagen gemessen', text: 'Mehrere Varianten gegeneinander, die teure wird abgeschaltet. Ihr Teil: Anfragen und Bewerbungen innerhalb von zwei Tagen beantworten.' },
  { nr: '05', titel: 'Einmal im Monat reden wir', dauer: 'monatlich', text: 'Eine Seite: was eine Anfrage gekostet hat, was eine Bewerbung, was wir ändern und warum. Danach kommt der nächste Drehtag.' },
] as const;

/** Drei Stufen. Bewusst ohne Preise — der Monatspreis fällt im Gespräch. */
export const stufen = [
  {
    ordnung: 'I', name: 'Mitarbeiter', versprechen: 'Für die, die gerade nicht suchen.',
    text: 'Ausgespielt dort, wo die Leute wohnen, die zu Ihnen fahren würden. Bewerben ohne Lebenslauf, direkt vom Handy.',
    punkte: ['Bewerberkampagne auf Meta', 'Karriereseite mit Kurzbewerbung', 'Jede Bewerbung sofort auf Ihrem Handy'],
    mass: 'Bewerbungen', empfohlen: false,
  },
  {
    ordnung: 'II', name: 'Neukunden', versprechen: 'Meta für die Region, Google für den Bedarf.',
    text: 'Meta macht Sie im Umkreis bekannt, Google fängt die ab, die gerade jetzt suchen.',
    punkte: ['Meta- und Google-Kampagnen, laufend betreut', 'Anfrageseite, auf Abschluss gebaut', 'Kosten je Anfrage, monatlich ausgewiesen'],
    mass: 'Anfragen', empfohlen: false,
  },
  {
    ordnung: 'III', name: 'Beides', versprechen: 'Ein Drehtag, zwei Kampagnen.',
    text: 'Aus demselben Drehtag entstehen die Clips für Bewerber und für Kunden. Zwei Kampagnen, ein Ansprechpartner, eine Rechnung.',
    punkte: ['Bewerber- und Neukundenkampagne', 'Karriereseite und Anfrageseite', 'Ein Drehtag im Monat, Material für beides'],
    mass: 'Bewerbungen und Anfragen', empfohlen: true,
  },
] as const;

/** Warum wir: jeder Wert aus dem Vertrauensband mit einem Beleg. */
export const belegpunkte = [
  { wert: 'Gemessen', titel: 'Gemessen, nicht geraten.', text: 'Bei WAV liefen drei Bewerbungswege gleichzeitig. Einer kostete 4,92 € pro Bewerbung, ein anderer 218 €. Ohne den Test hätten wir geraten — und in zwei von drei Fällen falsch.' },
  { wert: 'Direkt', titel: 'Niemand, an den wir weiterreichen.', text: 'Es gibt keinen Account Manager, der Ihre Frage weitergibt, und keinen Freelancer, der Ihre Halle zum ersten Mal sieht. Wer zum Drehtag kommt, schaut abends auch die Zahlen an.' },
  { wert: 'Selbst gedreht', titel: 'Ihre Leute, Ihre Maschinen.', text: 'Keine Models, keine Studiobilder. Wer sich bewirbt oder anfragt, soll sehen, wo er landet. Vier bis fünf Stunden Dreh, daraus der Vorrat für vier Wochen.' },
  { wert: 'Auf Ihren Namen', titel: 'Alles gehört Ihnen.', text: 'Werbekonten und Messung laufen auf Ihren Namen, die Seiten auf Ihr Konto. Alle Rohaufnahmen sind dauerhaft Ihr Eigentum.' },
  { wert: 'Direkt', titel: 'Ein halber Tag im Monat.', text: 'Einen halben Tag für den Dreh, Anfragen und Bewerbungen innerhalb von zwei Tagen beantworten. Mehr brauchen wir von Ihnen nicht.' },
] as const;

/** Für wen — aus dem Zielkundenprofil, ohne interne Umsatzzahlen. */
export const fuerWen = [
  { titel: 'Handwerk und Technik', status: 'Unser Kern', stark: true, liste: 'Kfz-Werkstätten · Dach, SHK und Ausbau · Elektro und Photovoltaik · Steinmetz', notiz: 'Hier kommen wir her. Unser belegter Fall ist eine Kfz-Werkstatt.' },
  { titel: 'Praxen und Fachgeschäfte', status: 'Passt', stark: true, liste: 'Zahnmedizin · Augenoptik · Hörakustik', notiz: 'Leistungen, bei denen ein einzelner Kunde viel wert ist. Zwei unserer Betriebe kommen von hier.' },
  { titel: 'Was vorausgesetzt ist', status: 'Voraussetzung', stark: false, liste: 'Wachstumsabsicht · ein halber Tag im Monat · Antwort auf Anfragen in zwei Tagen', notiz: 'Ohne diese drei hilft keine Kampagne. Dann sagen wir das im ersten Gespräch.' },
] as const;

/** Kaufeinwände. Laufzeit, Kündigung und Garantie fehlen bewusst — sie sind
 *  im Angebot noch nicht entschieden und werden hier nicht vorweggenommen. */
export const fragen = [
  { frage: 'Was kostet das bei mir?', antwort: 'Das hängt davon ab, ob Sie Mitarbeiter, Kunden oder beides suchen. Die Einrichtung ist einmalig, danach zahlen Sie einen festen Monatsbetrag. Die Zahl nennen wir Ihnen im ersten Gespräch — für Ihren Betrieb, nicht als Spanne.' },
  { frage: 'Wie viel Zeit kostet mich das?', antwort: 'Einen halben Tag im Monat für den Drehtag. Und Anfragen und Bewerbungen innerhalb von zwei Tagen beantworten. Mehr nicht — Anzeigen, Budgets, Seiten und Messung übernehmen wir.' },
  { frage: 'Wem gehören Konten, Seiten und Aufnahmen?', antwort: 'Ihnen. Werbekonten und Messung laufen auf Ihren Namen, die Seiten auf Ihr Konto, alle Rohaufnahmen sind dauerhaft Ihr Eigentum.' },
  { frage: 'Wie schnell sehe ich ein Ergebnis?', antwort: 'Nach zehn Tagen steht fest, welche Anzeigenvariante liefert. Bei WAV Westerstede war der Vertrag mit dem neuen Mitarbeiter nach 14 Tagen unterschrieben. Das ist ein Fall, kein Versprechen.' },
  { frage: 'Wir hatten schon mal eine Agentur. Warum sollte es jetzt klappen?', antwort: 'Weil gemessen wird statt geraten: mehrere Varianten gegeneinander, die teure fliegt raus. Und weil niemand weiterreicht — wer dreht, schaut abends auch die Zahlen an.' },
  { frage: 'Findet man über Social Media wirklich Fachkräfte?', antwort: 'Bei WAV kamen aus 550,27 € Budget 68 Bewerbungen, 25 bis 30 davon fachlich brauchbar. Die günstigste Variante kostete 4,92 € je Bewerbung.' },
  { frage: 'Wie fängt das Ganze an?', antwort: 'Mit einem Gespräch, 20 Minuten am Telefon. Danach wissen Sie, ob sich das für Sie rechnet — und wenn nicht, sagen wir Ihnen das im selben Gespräch.' },
] as const;
