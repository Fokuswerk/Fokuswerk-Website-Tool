// Zentrale Stammdaten. Jede Zahl auf dieser Website stammt aus dieser Datei
// oder aus src/content/fallstudien — nirgends aus dem Fließtext eines Templates.

export const firma = {
  name: 'Fokuswerk',
  rechtsform: 'Fokuswerk GbR',
  langname: 'Fokuswerk — Marketing für Betriebe mit eigener Werkstatt',
  strasse: 'Schramperweg 90',
  plz: '26129',
  ort: 'Oldenburg',
  land: 'Deutschland',
  telefon: '+49 176 63307587',
  telefonAnzeige: '0176 63307587',
  mail: 'contact@fokuswerk.de',
  ustId: 'DE456629159',
  vertreter: 'Thees Bodenstab & Julius Abt',
  domain: 'https://fokuswerk.de',
  instagram: 'https://www.instagram.com/fokuswerk.de/',
  linkedin: 'https://www.linkedin.com/company/fokuswerk/',
} as const;

// Genau ein primäres Handlungslabel auf der gesamten Website.
export const cta = {
  primaer: 'Gespräch vereinbaren',
  notiz: '20 Minuten, am Telefon. Danach wissen Sie, ob es sich für Ihren Betrieb rechnet.',
  ziel: '/kontakt/',
} as const;

export const navigation = [
  { titel: 'Leistung',    pfad: '/leistung/',    zeile: 'Ein Drehtag, zwei Kampagnen' },
  { titel: 'Fallstudien', pfad: '/fallstudien/', zeile: 'Zahlen aus echten Werbekonten' },
  { titel: 'Über uns',    pfad: '/ueber-uns/',   zeile: 'Wer zum Drehtag kommt' },
  { titel: 'Kontakt',     pfad: '/kontakt/',     zeile: 'Direkt, ohne Umweg' },
] as const;

// Wirtschaftliche Bezugsgrößen aus dem Angebot. Branchenwerte, als solche
// gekennzeichnet — keine Fokuswerk-Behauptung.
export const rechnung = {
  stunden: 1275,
  satz: 95,
  jahresumsatz: 121125,
  monatsverlust: 10100,
  quelle:
    'Branchenwerte für freie Werkstätten im ländlichen Raum, Stand 2026. Verrechnete Stunden je Mechatroniker und Jahr, multipliziert mit dem Stundenverrechnungssatz. Teile- und Materialumsatz kommt obendrauf.',
} as const;

export const preis = {
  monat: 2990,
  einrichtungswert: 5270,
  einzelJahr: 49310,
  budget: 600,
  laufzeit: 12,
  kuendbar: 3,
} as const;
