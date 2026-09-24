/* Harte Fakten — alle Angaben von brouwergmbh.de übernommen.
   Was dort nicht belegt ist, steht hier nicht. */

export const betrieb = {
  name: "Rudolf Brouwer GmbH",
  kurz: "Brouwer",
  claim: "Heizung · Sanitär · Schwimmbad",
  strasse: "Oldenburger Straße 209",
  plz: "26203",
  ort: "Wardenburg",
  telefon: "04407 8991",
  telefonRaw: "+49440788991",
  fax: "04407 5873",
  email: "info@brouwer-gmbh.de",
  gegruendet: 1962,
  geschaeftsfuehrer: "Roelf Brouwer, Wolfgang Brouwer",
  register: "Amtsgericht Oldenburg · HRB 3475",
  ustId: "DE288194100",
  ausstellungQm: 500,
  geo: { lat: 53.0655, lng: 8.1966 }, // Näherung Oldenburger Straße 209, Wardenburg
} as const;

/* Öffnungszeiten: Mo–Do 8:30–12:30 und 14:00–17:00, Fr 8:30–12:30 */
export const oeffnungszeiten = [
  { tag: 1, bloecke: [[510, 750], [840, 1020]] },
  { tag: 2, bloecke: [[510, 750], [840, 1020]] },
  { tag: 3, bloecke: [[510, 750], [840, 1020]] },
  { tag: 4, bloecke: [[510, 750], [840, 1020]] },
  { tag: 5, bloecke: [[510, 750]] },
] as const;

export const zeitenText = [
  { tage: "Montag – Donnerstag", zeit: "8.30 – 12.30 Uhr · 14.00 – 17.00 Uhr" },
  { tage: "Freitag", zeit: "8.30 – 12.30 Uhr" },
  { tage: "Samstag, Sonntag", zeit: "geschlossen" },
];

export const leistungen = [
  {
    slug: "bad",
    nummer: "01",
    titel: "Bad",
    zeile: "Das Bad aus einer Hand",
    text: "Von der Planung bis zur Endreinigung ein Ansprechpartner. Fliesen, Elektrik, Malerarbeiten koordinieren wir mit.",
    punkte: ["Badsanierung schlüsselfertig", "Seniorengerechtes Bad", "Planung mit 3D-Badbrille", "Sanierung ohne Staub"],
  },
  {
    slug: "heizung",
    nummer: "02",
    titel: "Heizung",
    zeile: "Modernisierung und Wartung",
    text: "Wärmepumpe, Hybrid, Pellets oder Brennwert — wir rechnen den Wärmebedarf, planen die Anlage und stellen die Förderanträge.",
    punkte: ["Heizungsmodernisierung", "Wärmepumpe und Hybridheizung", "Wartung und Kundendienst", "24-Stunden-Notdienst"],
  },
  {
    slug: "solarenergie",
    nummer: "03",
    titel: "Solarenergie",
    zeile: "Mit der Sonne heizen",
    text: "Solarthermie für Warmwasser und Heizungsunterstützung. Flach- oder Vakuumröhrenkollektor, ausgelegt auf Ihr Dach.",
    punkte: ["Solarthermische Anlagen", "Kollektor und Solarspeicher", "Förderung über BAFA und KfW"],
  },
  {
    slug: "schwimmbad",
    nummer: "04",
    titel: "Schwimmbad",
    zeile: "Pool im Garten oder im Haus",
    text: "Neubau, Technik und Sanierung. Beim Beheizen zahlt sich aus, dass wir seit Jahrzehnten Heizungsbauer sind.",
    punkte: ["Schwimmbecken und Technik", "Poolsanierung und neue Folie", "Überdachung und Abdeckung", "Filtertechnik und Wasserpflege"],
  },
  {
    slug: "wellness",
    nummer: "05",
    titel: "Wellness",
    zeile: "Dampfdusche und Whirlpool",
    text: "Die Wohlfühloase im eigenen Bad — auf der Fläche einer gewöhnlichen Dusche.",
    punkte: ["Dampfdusche", "Whirlpool und Komfortbad", "Massagetechnik"],
  },
] as const;

export const historie = [
  { jahr: "1962", text: "Rudolf Brouwer gründet den Betrieb am 22. Januar in Nordmoslesfehn — in der Garage seines Vaters." },
  { jahr: "1963", text: "Hannelore Brouwer tritt in die Firma ein." },
  { jahr: "1966", text: "Umzug nach Wardenburg, zunächst in das freigewordene alte Rathaus mit Garage als Werkstatt." },
  { jahr: "1973", text: "Der Betrieb verlegt seinen Sitz an den Ortseingang: Oldenburger Straße 209, in eine neu gebaute Halle." },
  { jahr: "1983", text: "Vergrößerung und Erweiterung — die erste Sanitärausstellung entsteht." },
  { jahr: "1990", text: "Roelf Brouwer tritt am 15. März ein und übernimmt den Bereich Schwimmbad." },
  { jahr: "1996", text: "Die Ausstellung wächst am 11. Oktober auf rund 500 Quadratmeter." },
  { jahr: "1997", text: "Wolfgang Brouwer tritt am 1. Januar ein und übernimmt den Bereich Heizung." },
  { jahr: "2012", text: "50 Jahre Rudolf Brouwer GmbH." },
  { jahr: "2020", text: "Neues Logo, neues Erscheinungsbild — und der Umbau der Ausstellung für Sanitär und Pool." },
];

export const partner = [
  { name: "Bosch Thermotechnik GmbH", was: "Heizungsprodukte" },
  { name: "August Brötje GmbH", was: "Großhandel Sanitär und Heizung" },
  { name: "FAMO GmbH & Co. KG", was: "Großhandel Sanitär und Heizung" },
  { name: "Windhager Zentralheizung GmbH", was: "Pelletheizung" },
  { name: "HSK Duschkabinenbau KG", was: "Duschabtrennung" },
  { name: "LAGUNA-Badwelten", was: "Badmöbel" },
  { name: "Michael Hattendorf", was: "Fliesenfachgeschäft und Fliesenleger" },
  { name: "Frieling GmbH", was: "Partnerbetrieb" },
  { name: "TOPRAS", was: "Wasserpflege" },
];
