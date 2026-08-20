/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MOCK-DATEN — FREI ERFUNDEN, NUR FÜR DIE VORFÜHRUNG
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Kein Eintrag hier ist eine echte Anfrage, ein echter Auftraggeber oder eine
 * echte Person. Firmen-, Personen- und Objektangaben sind erfunden; die
 * Telefonnummern liegen im Rufnummernblock 0152-2xxxxxxx, der von der
 * Bundesnetzagentur nicht vergeben wird.
 *
 * Zweck: das Anfrage- und Bewerbungs-Dashboard mit realistischer Belegung
 * zeigen, ohne echte Daten zu verwenden. Vor einem Produktivbetrieb wird diese
 * Datei durch die Datenbankanbindung ersetzt — die Feldstruktur unten ist
 * bereits die, die dafür gebraucht wird.
 */

export const LEAD_STATUS = [
  'neu',
  'kontaktiert',
  'besichtigung',
  'angebot',
  'gewonnen',
  'verloren',
] as const;

export type LeadStatus = (typeof LEAD_STATUS)[number];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  neu: 'Neu',
  kontaktiert: 'Kontaktiert',
  besichtigung: 'Besichtigung',
  angebot: 'Angebot',
  gewonnen: 'Gewonnen',
  verloren: 'Verloren',
};

export interface Lead {
  id: string;
  eingang: string;          // ISO-Datum
  status: LeadStatus;
  name: string;
  firma?: string;
  telefon?: string;
  email?: string;
  leistung: string[];
  objektart: string;
  ort: string;
  baujahr?: string;
  menge?: string;
  zeitraum?: string;
  schadstoff: 'Ja, bekannt' | 'Vermutlich' | 'Nein' | 'Unklar';
  gutachten: 'Ja' | 'Nein' | 'In Auftrag';
  nachricht?: string;
  dateien: { name: string; groesse: string }[];
  verlauf: { datum: string; text: string }[];
}

export const demoLeads: Lead[] = [
  {
    id: 'A-2026-0147',
    eingang: '2026-08-18',
    status: 'neu',
    name: 'Martin Hövelmann',
    firma: 'Hövelmann Projektbau GmbH',
    telefon: '0152 21180043',
    email: 'm.hoevelmann@example.de',
    leistung: ['Schadstoffsanierung', 'Rückbau und Entkernung'],
    objektart: 'Gewerbe- oder Bürogebäude',
    ort: '28195 Bremen',
    baujahr: '1971',
    menge: 'ca. 4.200 qm Geschossfläche',
    zeitraum: 'ab KW 4/2027',
    schadstoff: 'Ja, bekannt',
    gutachten: 'Ja',
    nachricht:
      'Bürogebäude aus den Siebzigern, Umnutzung zu Wohnraum. Gutachten weist Spritzasbest an den Unterzügen im 2. und 3. OG aus. Nachbargebäude bleibt in Nutzung. Wir brauchen ein Angebot für Sanierung plus Entkernung bis auf den Rohbau.',
    dateien: [
      { name: 'Schadstoffgutachten_Contrescarpe.pdf', groesse: '6,1 MB' },
      { name: 'Grundrisse_EG-4OG.pdf', groesse: '2,4 MB' },
    ],
    verlauf: [{ datum: '2026-08-18', text: 'Anfrage über das Formular eingegangen.' }],
  },
  {
    id: 'A-2026-0146',
    eingang: '2026-08-17',
    status: 'neu',
    name: 'Sabine Wendt',
    telefon: '0152 21455907',
    leistung: ['Entsorgung und Container'],
    objektart: 'Wohngebäude',
    ort: '27755 Delmenhorst',
    menge: '1 Container, Bauschutt',
    zeitraum: 'nächste Woche',
    schadstoff: 'Nein',
    gutachten: 'Nein',
    nachricht: 'Badsanierung im Einfamilienhaus, Fliesen und Estrich müssen weg. Welche Containergröße passt?',
    dateien: [],
    verlauf: [{ datum: '2026-08-17', text: 'Anfrage über das Formular eingegangen.' }],
  },
  {
    id: 'A-2026-0143',
    eingang: '2026-08-12',
    status: 'kontaktiert',
    name: 'Dipl.-Ing. Frauke Osterloh',
    firma: 'Osterloh + Partner, Architekten',
    telefon: '0152 21308866',
    email: 'osterloh@example.de',
    leistung: ['Schadstoffsanierung'],
    objektart: 'Öffentliches Gebäude',
    ort: '26123 Oldenburg',
    baujahr: '1968',
    menge: 'ca. 900 qm Deckenfläche',
    zeitraum: 'Sommerferien 2027',
    schadstoff: 'Vermutlich',
    gutachten: 'In Auftrag',
    nachricht:
      'Schulgebäude, Verdacht auf KMF in den abgehängten Decken und Asbestpappe hinter den Heizkörpernischen. Probenahme läuft. Wir müssen im Vergabeverfahren wissen, ob Sie die Zulassung für weichgebundene Produkte haben.',
    dateien: [{ name: 'Bestandsplaene_Schule.pdf', groesse: '4,8 MB' }],
    verlauf: [
      { datum: '2026-08-12', text: 'Anfrage über das Formular eingegangen.' },
      { datum: '2026-08-13', text: 'Rückruf. Zulassung nach TRGS 519 Ziffer 2.7 Anlage 3 und PQ-Nr. per Mail bestätigt. Wartet auf Gutachten.' },
    ],
  },
  {
    id: 'A-2026-0139',
    eingang: '2026-08-04',
    status: 'besichtigung',
    name: 'Torsten Brahms',
    firma: 'Weserkontor Immobilien GmbH & Co. KG',
    telefon: '0152 21772140',
    email: 't.brahms@example.de',
    leistung: ['Rückbau und Entkernung'],
    objektart: 'Gewerbe- oder Bürogebäude',
    ort: '28309 Bremen',
    baujahr: '1984',
    menge: 'ca. 11.000 cbm',
    zeitraum: 'Q1 2027',
    schadstoff: 'Unklar',
    gutachten: 'Nein',
    nachricht: 'Verwaltungsgebäude soll entkernt und neu ausgebaut werden. Zugang nur über den Innenhof.',
    dateien: [{ name: 'Lageplan.pdf', groesse: '1,1 MB' }],
    verlauf: [
      { datum: '2026-08-04', text: 'Anfrage über das Formular eingegangen.' },
      { datum: '2026-08-05', text: 'Telefonat. Zufahrt und Kranstellfläche zu klären.' },
      { datum: '2026-08-19', text: 'Ortstermin vereinbart für 26.08., 9:00 Uhr.' },
    ],
  },
  {
    id: 'A-2026-0131',
    eingang: '2026-07-21',
    status: 'angebot',
    name: 'Kerstin Ahlers',
    firma: 'Bauamt Gemeinde Ganderkesee',
    telefon: '0152 21669012',
    email: 'ahlers@example.de',
    leistung: ['Schadstoffsanierung', 'Rückbau und Entkernung'],
    objektart: 'Öffentliches Gebäude',
    ort: '27777 Ganderkesee',
    baujahr: '1975',
    menge: '2.600 qm',
    zeitraum: 'ab 03/2027',
    schadstoff: 'Ja, bekannt',
    gutachten: 'Ja',
    nachricht: 'Beschränkte Ausschreibung, Angebotsfrist 12.09. Präqualifikation wird vorausgesetzt.',
    dateien: [
      { name: 'Leistungsverzeichnis.pdf', groesse: '3,3 MB' },
      { name: 'Gutachten_Asbest_KMF.pdf', groesse: '7,9 MB' },
    ],
    verlauf: [
      { datum: '2026-07-21', text: 'Anfrage über das Formular eingegangen.' },
      { datum: '2026-07-23', text: 'Ortstermin durchgeführt.' },
      { datum: '2026-08-11', text: 'Angebot versandt. Nachweise TRGS 519 und PQ-Nr. beigefügt.' },
    ],
  },
  {
    id: 'A-2026-0124',
    eingang: '2026-07-02',
    status: 'gewonnen',
    name: 'Henning Rüter',
    firma: 'Rüter Hochbau GmbH',
    telefon: '0152 21203377',
    email: 'h.rueter@example.de',
    leistung: ['Rückbau und Entkernung', 'Entsorgung und Container'],
    objektart: 'Industrie- oder Hallenbau',
    ort: '27793 Wildeshausen',
    menge: 'ca. 6.400 cbm',
    zeitraum: '09/2026',
    schadstoff: 'Nein',
    gutachten: 'Nein',
    nachricht: 'Nachunternehmerleistung Entkernung. Termin ist eng, Halle muss Ende Oktober frei sein.',
    dateien: [],
    verlauf: [
      { datum: '2026-07-02', text: 'Anfrage über das Formular eingegangen.' },
      { datum: '2026-07-08', text: 'Angebot versandt.' },
      { datum: '2026-07-29', text: 'Auftrag erteilt. Baubeginn 07.09.2026.' },
    ],
  },
  {
    id: 'A-2026-0118',
    eingang: '2026-06-16',
    status: 'verloren',
    name: 'Andrea Siemers',
    firma: 'Siemers Wohnbau GmbH',
    telefon: '0152 21990455',
    leistung: ['Beton, Bohren und Sägen'],
    objektart: 'Einzelnes Bauteil',
    ort: '26135 Oldenburg',
    menge: '14 Balkone',
    zeitraum: 'so früh wie möglich',
    schadstoff: 'Nein',
    gutachten: 'Nein',
    nachricht: 'Balkonabbruch an einem bewohnten Mehrfamilienhaus.',
    dateien: [],
    verlauf: [
      { datum: '2026-06-16', text: 'Anfrage über das Formular eingegangen.' },
      { datum: '2026-06-18', text: 'Angebot versandt.' },
      { datum: '2026-07-06', text: 'Absage. Auftrag an einen Anbieter mit früherem Termin vergeben.' },
    ],
  },
];

/* ── Bewerbungen ───────────────────────────────────────────────────────────
   Ebenfalls frei erfunden. Gleiche Struktur wie das Bewerbungsformular. */

export const BEWERBUNG_STATUS = ['neu', 'gesprech', 'zusage', 'absage'] as const;
export type BewerbungStatus = (typeof BEWERBUNG_STATUS)[number];

export const BEWERBUNG_LABEL: Record<BewerbungStatus, string> = {
  neu: 'Neu',
  gesprech: 'Gespräch',
  zusage: 'Zusage',
  absage: 'Absage',
};

export interface Bewerbung {
  id: string;
  eingang: string;
  status: BewerbungStatus;
  name: string;
  position: string;
  erfahrung: string;
  fuehrerschein: string[];
  wohnort: string;
  verfuegbar: string;
  telefon: string;
  lebenslauf?: string;
}

export const demoBewerbungen: Bewerbung[] = [
  {
    id: 'B-2026-0042',
    eingang: '2026-08-18',
    status: 'neu',
    name: 'Marek Wisniewski',
    position: 'Baufacharbeiter Schadstoffsanierung',
    erfahrung: 'Mehrere Jahre',
    fuehrerschein: ['Klasse B', 'Klasse C / CE'],
    wohnort: '28259 Bremen',
    verfuegbar: 'ab 01.10.',
    telefon: '0152 21447781',
    lebenslauf: 'Lebenslauf_Wisniewski.pdf',
  },
  {
    id: 'B-2026-0041',
    eingang: '2026-08-15',
    status: 'neu',
    name: 'Kevin Ostermann',
    position: 'Bauhelfer',
    erfahrung: 'Quereinsteiger',
    fuehrerschein: ['Klasse B'],
    wohnort: '27755 Delmenhorst',
    verfuegbar: 'sofort',
    telefon: '0152 21332608',
  },
  {
    id: 'B-2026-0039',
    eingang: '2026-08-06',
    status: 'gesprech',
    name: 'Dennis Kruse',
    position: 'LKW-Fahrer für unser Containerfahrzeug',
    erfahrung: 'Mehrere Jahre',
    fuehrerschein: ['Klasse B', 'Klasse C / CE'],
    wohnort: '27751 Delmenhorst',
    verfuegbar: 'ab 01.11.',
    telefon: '0152 21875530',
    lebenslauf: 'CV_Kruse.pdf',
  },
  {
    id: 'B-2026-0036',
    eingang: '2026-07-28',
    status: 'zusage',
    name: 'Ahmet Yildirim',
    position: 'Baufacharbeiter Abbruch',
    erfahrung: 'Mehrere Jahre',
    fuehrerschein: ['Klasse B', 'Baumaschinenschein'],
    wohnort: '28237 Bremen',
    verfuegbar: 'ab 01.09.',
    telefon: '0152 21556914',
    lebenslauf: 'Bewerbung_Yildirim.pdf',
  },
];
