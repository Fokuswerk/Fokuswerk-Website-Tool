/**
 * Alle harten Angaben zum Betrieb an einer Stelle.
 * Quelle jeder Angabe: brouwer-gmbh.de (Stand 24.09.2026), Impressum,
 * Seite „über uns", Seite „Service & Kontakt", Seite „Stellenangebote".
 * Was hier nicht steht, steht auch nicht auf der Website.
 */

export const betrieb = {
  name: "Rudolf Brouwer GmbH",
  kurz: "Brouwer",
  wortmarke: "BROUWER",
  unterzeile: "Heizung · Sanitär · Schwimmbad",

  strasse: "Oldenburger Straße 209",
  plz: "26203",
  ort: "Wardenburg",
  land: "DE",

  // Geoposition laut OpenStreetMap, wo der Betrieb selbst verzeichnet ist
  // (way 368669677, craft=plumber, „Rudolf Brouwer")
  breite: 53.06636,
  laenge: 8.19219,

  telefon: "04407 8991",
  telefonRoh: "+4944078991",
  fax: "04407 5873",
  mail: "info@brouwer-gmbh.de",

  gruendung: 1962,
  gruender: "Rudolf Brouwer",
  geschaeftsfuehrung: ["Roelf Brouwer", "Wolfgang Brouwer"],
  registergericht: "Amtsgericht Oldenburg",
  handelsregister: "HRB 3475",
  ustId: "DE288194100",

  ausstellungQm: 500,
  adresseSeit: 1973,

  /* Öffnungszeiten laut Seite „Service & Kontakt".
     TODO: vom Kunden bestätigen — auf der alten Website stehen an anderer
     Stelle abweichende Zeiten. */
  zeiten: [
    { tage: "Montag bis Donnerstag", zeit: "8.30 – 12.30 Uhr und 14.00 – 17.00 Uhr" },
    { tage: "Freitag", zeit: "8.30 – 12.30 Uhr" },
  ],
  zeitenHinweis: "Für die Ausstellung und jede Beratung bitten wir um eine vorherige Terminabsprache.",

  /* Schema.org-Form derselben Zeiten */
  zeitenSchema: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday"], opens: "08:30", closes: "12:30" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday"], opens: "14:00", closes: "17:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Friday"], opens: "08:30", closes: "12:30" },
  ],

  /* Der Pool-Zweig ist eine eigene Gesellschaft an derselben Adresse.
     Die alte Website verweist für Schwimmbad ausdrücklich dorthin. */
  pool: {
    name: "Brouwer Pool & Wellness GmbH",
    ansprech: "Roelf und Nicole Brouwer",
    mail: "info@pool-gmbh.de",
    web: "https://www.pool-gmbh.de",
    webKurz: "pool-gmbh.de",
  },
} as const;

export const basisUrl = "https://brouwer-wardenburg.vercel.app";

/**
 * Livegang-Schalter.
 * Solange dieser Entwurf unaufgefordert an Roelf und Wolfgang Brouwer geht,
 * darf er nicht in der Suche auftauchen und der echten Seite brouwer-gmbh.de
 * Konkurrenz machen. Auf `true` stellen, sobald der Kunde zustimmt —
 * damit schalten Metadaten, robots.txt und sitemap.xml gemeinsam um.
 */
export const indexierbar = false;

/** Chronik — ausschließlich Daten von der Seite „über uns". */
export const chronik = [
  { jahr: "1962", text: "Am 22. Januar gründet Rudolf Brouwer den Betrieb in Nordmoslesfehn — in der Garage seines Vaters.", bild: "chronik-gruender.webp", alt: "Firmengründer Rudolf Brouwer 1962 und seine Nachfolger Wolfgang und Roelf Brouwer 2002, Zeitungsausschnitt" },
  { jahr: "1963", text: "Ehefrau Hannelore Brouwer tritt in die Firma ein." },
  { jahr: "1966", text: "Umzug nach Wardenburg, zunächst in das freigewordene alte Rathaus mit Garage für die Werkstatt.", bild: "chronik-werkstatt.webp", alt: "Historische Aufnahme aus der frühen Werkstatt des Betriebs" },
  { jahr: "1973", text: "Der Betrieb verlegt seinen Sitz an den Ortseingang: Oldenburger Straße 209, in eine neu gebaute Halle. Dieselbe Adresse bis heute.", bild: "chronik-schild.webp", alt: "Firmenwagen von 1971 und das Firmenschild von 1962" },
  { jahr: "1983", text: "Vergrößerung und Erweiterung mit der ersten Sanitärausstellung." },
  { jahr: "1990", text: "Am 15. März tritt Roelf Brouwer ein und übernimmt den Bereich Schwimmbad." },
  { jahr: "1996", text: "Am 11. Oktober wird die Ausstellung auf rund 500 Quadratmeter aufgestockt." },
  { jahr: "1997", text: "Zum 1. Januar tritt Wolfgang Brouwer ein und übernimmt den Bereich Heizung." },
  { jahr: "2012", text: "Am 22. Januar besteht die Rudolf Brouwer GmbH 50 Jahre." },
  { jahr: "2020", text: "Redesign des Logos, neues Erscheinungsbild — und Umbau der Ausstellung in Sanitär- und Poolbereich." },
] as const;

/** Herstellerpartner laut Seite „Partner & Links". */
export const partner = [
  { name: "Bosch Thermotechnik", rolle: "Heizungstechnik, Marke Buderus", bild: "partner-buderus.webp" },
  { name: "August Brötje", rolle: "Heizungstechnik", bild: "partner-brotje.webp" },
  { name: "Windhager", rolle: "Pelletsheizung", bild: "partner-windhager.webp" },
  { name: "HSK", rolle: "Duschabtrennung", bild: "partner-hsk.webp" },
  { name: "Laguna Badwelten", rolle: "Badmöbel", bild: "partner-laguna.webp" },
  { name: "Topras", rolle: "Wellness", bild: "partner-topras_wellness.webp" },
  { name: "Famo", rolle: "Großhandel Sanitär und Heizung", bild: "partner-famo.webp" },
  { name: "Frieling", rolle: "Großhandel", bild: "partner-frieling.webp" },
  { name: "Michael Hattendorf", rolle: "Fliesenfachgeschäft und Fliesenleger", bild: "partner-kurt_hattendorf.webp" },
] as const;
