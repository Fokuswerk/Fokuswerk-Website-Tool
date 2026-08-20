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
  /* Titel im Klartext, amtliche Bezeichnung daneben. Wer die Kuerzel kennt,
     findet sie; wer sie nicht kennt, versteht trotzdem, worum es geht. */
  {
    id: 'trgs519',
    short: 'TRGS 519',
    title: 'Auch den kritischsten Asbest dürfen wir anfassen',
    proof: 'TRGS 519, Ziffer 2.7 Anlage 3',
    body:
      'Asbest ist nicht gleich Asbest. Das lockere, faserige Material — Spritzasbest, ' +
      'Leichtbauplatten, Asbestpappe — gilt als das gefährlichste, und dafür braucht ein ' +
      'Betrieb die höchste Zulassungsstufe. Wir haben sie. Die meisten müssen bei einem ' +
      'solchen Fund abgeben und jemand anderen holen.',
  },
  {
    id: 'pq',
    short: 'Präqualifikation',
    title: 'Für öffentliche Aufträge freigegeben',
    proof: 'PQ-Nr. 010.053470, seit 2013',
    body:
      'Städte, Ämter, Schulen und Hochschulen dürfen nur an geprüfte Betriebe vergeben. ' +
      'Wir stehen seit 2013 in der amtlichen Liste — das erspart bei jeder Ausschreibung ' +
      'den Papierkrieg mit Einzelnachweisen.',
  },
  {
    id: 'trgs521',
    short: 'TRGS 521',
    title: 'Alte Mineralwolle ist unser zweites Thema',
    proof: 'Sachkunde nach TRGS 521',
    body:
      'Dämmwolle, die vor dem Jahr 2000 eingebaut wurde, setzt beim Ausbau Fasern frei ' +
      'und muss wie ein Gefahrstoff behandelt werden. Das betrifft fast jedes Gebäude aus ' +
      'dieser Zeit — vom Dachboden bis zur Heizungsverkleidung.',
  },
  {
    id: 'avn',
    short: 'AVN',
    title: 'Mitglied im Abbruchverband Nord',
    proof: 'AVN',
    body: 'Der Fachverband der norddeutschen Abbruchunternehmen.',
  },
  {
    id: 'nav',
    short: 'NAV',
    title: 'Mitglied im Fachverband für Schadstoffsanierung',
    proof: 'NAV Nord e.V.',
    body: 'Norddeutscher Asbest- und Gefahrstoffsanierungsverband e.V.',
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
