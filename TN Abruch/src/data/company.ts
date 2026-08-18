/**
 * Einzige Quelle für alle Unternehmensdaten.
 * Jeder Wert hier ist von tn-abbruch.de oder aus dem Impressum belegt.
 * Nichts wird geschätzt, gerundet oder ergänzt.
 *
 * Pflegehinweis: Änderungen nur hier vornehmen — Header, Footer, Kontaktseite,
 * Impressum und die strukturierten Daten lesen alle aus dieser Datei.
 */

export const company = {
  name: 'TN Abbruch',
  legalName: 'TN-Abbruchunternehmen eGbR',
  brandName: 'TN Abbruch eGbR',
  foundedYear: 1997,
  foundedIn: 'Bremen',
  relocatedYear: 2000,
  partners: ['Tobias Nowak', 'Thorsten Martens'],
  founders: ['Thomas Nowak', 'Thorsten Martens'],
  teamSize: 10,

  address: {
    street: 'Mackenstedter Str. 21',
    postalCode: '27755',
    city: 'Delmenhorst',
    country: 'DE',
    // Koordinaten des Gewerbegebiets Stickgras/Annenriede, Delmenhorst
    lat: 53.0355,
    lon: 8.6903,
  },

  phone: '04221 80 25 61',
  phoneHref: 'tel:+494221802561',
  phoneE164: '+494221802561',
  fax: '04221 80 25 62',
  email: 'info@tn-abbruch.de',

  register: { court: 'Amtsgericht Oldenburg', number: 'GsR 319' },
  vatId: 'DE196938258',
  insurer: {
    name: 'R+V Allgemeine Versicherung AG',
    address: 'Raiffeisenplatz 1, 65189 Wiesbaden',
    scope: 'Deutschland',
  },
} as const;

/** Das Gründungsjahr ist fix — die Jahresangabe rechnet sich selbst fort. */
export const yearsActive = new Date().getFullYear() - company.foundedYear;

/**
 * Qualifikationsnachweise. Reihenfolge = Gewichtung für Auftraggeber.
 * `proof` ist der prüfbare Beleg, nicht ein Werbeversprechen.
 */
export const credentials = [
  {
    id: 'trgs519',
    short: 'TRGS 519',
    title: 'Zulassung nach TRGS 519, Ziffer 2.7 Anlage 3',
    proof: 'einschließlich weichgebundener Asbestprodukte',
    body:
      'Die anspruchsvollste Zulassungsstufe im deutschen Asbestrecht. Sie berechtigt ' +
      'auch zum Ausbau weichgebundener Asbestprodukte — Spritzasbest, Leichtbauplatten, ' +
      'Asbestpappen. Betriebe ohne diese Ziffer müssen bei solchen Funden abgeben.',
  },
  {
    id: 'pq',
    short: 'Präqualifikation',
    title: 'Präqualifiziert seit 2013',
    proof: 'PQ-Nr. 010.053470',
    body:
      'Eingetragen in der Präqualifikationsliste für den Bereich Abbruch und ' +
      'Asbestsanierung. Öffentliche Auftraggeber können ohne Einzelnachweise vergeben.',
  },
  {
    id: 'trgs521',
    short: 'TRGS 521',
    title: 'Sachkunde nach TRGS 521',
    proof: 'künstliche Mineralfasern (KMF)',
    body:
      'Sachkundenachweis für Abbruch-, Sanierungs- und Instandhaltungsarbeiten an alten ' +
      'Mineralwolle-Dämmungen. Betrifft nahezu jeden Bestandsbau vor 2000.',
  },
  {
    id: 'avn',
    short: 'AVN',
    title: 'Mitglied im Abbruchverband Nord',
    proof: 'AVN',
    body: 'Fachverband der norddeutschen Abbruchunternehmen.',
  },
  {
    id: 'nav',
    short: 'NAV',
    title: 'Mitglied im Asbest- und Gefahrstoffsanierungsverband Nord e.V.',
    proof: 'NAV',
    body: 'Norddeutscher Fachverband für Schadstoffsanierung.',
  },
] as const;

/** Gerätebestand — Wortlaut aus den Leistungsseiten der Bestandswebsite. */
export const fleet = {
  excavators: ['1 t', '2 t', '3 t', '5 t', '15,5 t', '18,5 t'],
  loaders: ['1,5 t', '2,0 t', '6,0 t'],
  containerVehicles: 2,
  containerRange: '2 bis 36 cbm',
  airlocks: '1- bis 4-Kammerschleusen',
  uhg: '500 bis 12.500 cbm',
} as const;

/** Entsorgungsfraktionen, wörtlich von der Seite Abbrucharbeiten. */
export const wasteStreams = [
  'Bauschutt und Baustellenabfälle',
  'Bodenaushub',
  'Holz',
  'Gips und Gipskartonplatten',
  'Sperrmüll',
  'Grün- und Gartenabfall',
] as const;

export const nav = [
  { href: '/leistungen/', label: 'Leistungen', children: [
    { href: '/leistungen/schadstoffsanierung/', label: 'Schadstoffsanierung', note: 'Asbest & KMF' },
    { href: '/leistungen/rueckbau-entkernung/', label: 'Rückbau & Entkernung', note: 'bis Industriegröße' },
    { href: '/leistungen/beton-bohren-saegen/', label: 'Beton, Bohren & Sägen', note: 'Kernbohrung, Balkonabbruch' },
    { href: '/leistungen/entsorgung-container/', label: 'Entsorgung & Container', note: '2–36 cbm' },
  ]},
  { href: '/referenzen/', label: 'Referenzen' },
  { href: '/unternehmen/', label: 'Unternehmen' },
  { href: '/karriere/', label: 'Karriere' },
] as const;
