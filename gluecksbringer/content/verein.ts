/**
 * Stammdaten des Vereins.
 *
 * Alle Angaben stammen unverändert von der bisherigen Website
 * (gluecksbringer-am-meer.de, Stand der Übernahme: 2026).
 * Bitte Bankverbindung, Adressen und Registerdaten nur nach Rücksprache ändern.
 */

export const verein = {
  name: "Glücksbringer am Meer e.V.",
  kurzname: "Glücksbringer am Meer",
  ort: "Bad Zwischenahn",
  gegruendet: 2011,

  /** Kurzbeschreibung – wird u. a. für Meta-Description und Footer genutzt. */
  beschreibung:
    "Gemeinnütziger Verein aus Bad Zwischenahn. Seit 2011 setzen wir uns ehrenamtlich für wirtschaftlich benachteiligte Kinder in unserer Gemeinde ein.",

  anschrift: {
    strasse: "Rankenhof 11",
    plz: "26160",
    ort: "Bad Zwischenahn",
    land: "Deutschland",
  },

  /** Beide Adressen stehen so auf der bisherigen Kontaktseite. */
  email: "info@gluecksbringer-am-meer.de",
  emailWunschbaum: "info@wunschbaum-bz.de",

  register: "Amtsgericht Oldenburg VR 201178",
  registergericht: "Amtsgericht Oldenburg",
  registernummer: "VR 201178",

  /** Vertretungsberechtigt laut Kontaktseite der bisherigen Website. */
  vorsitzende: "Anja Schulte-Rogge",

  social: {
    facebook:
      "https://www.facebook.com/pages/Gl%C3%BCcksbringer-am-Meer-eV/298029483630086",
    instagram: "https://instagram.com/glucksbringerammeer/",
  },

  /**
   * Der digitale Wunschbaum läuft unter einer eigenen Domain.
   * Achtung: Für wunschbaum-bz.de ist derzeit kein SSL-Zertifikat hinterlegt,
   * über https lässt sich die Seite nicht aufrufen. Deshalb – wie bisher – http.
   * Sobald dort ein Zertifikat eingerichtet ist, bitte auf https umstellen.
   */
  wunschbaumUrl: "http://wunschbaum-bz.de",
  wunschbaumLabel: "wunschbaum-bz.de",

  spende: {
    kontoinhaber: "Glücksbringer am Meer e.V.",
    iban: "DE63 2806 1822 1244 184800",
    bic: "GENODEF 1OL2",
    bank: "Raiffeisenbank Oldenburg",
    verwendungszweck: "Wunschbaum am Meer",
    paypal: "https://www.paypal.com/paypalme/gluecksbringerammeer",
  },

  /** Zentrale Aussage der bisherigen Website – wörtlich übernommen. */
  finanzierungshinweis:
    "Alle unsere Aktionen sind nur durch Spenden möglich – wir erhalten keine öffentlichen Fördermittel.",
} as const;

export const ansprechpartner = [
  {
    name: "Anja Schulte-Rogge",
    rolle: "1. Vorsitzende",
    ort: "26160 Bad Zwischenahn",
  },
  {
    name: "Tanja Pfeiffer-Pahmeier",
    rolle: null,
    ort: "26160 Bad Zwischenahn",
  },
] as const;

/**
 * Die Namen, mit denen die bisherige Über-uns-Seite unterschreibt.
 * Reihenfolge unverändert übernommen.
 */
export const team = [
  "Jutta Drieling",
  "Anja Schulte-Rogge",
  "Menal Challal",
  "Ilka Lipskoch",
  "Margit Neumann",
  "Tanja Pfeiffer-Pahmeier",
  "Chris Terlunen",
] as const;

export const navigation = [
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/aktuelles", label: "Aktuelles" },
  { href: "/galerie", label: "Galerie" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gluecksbringer-am-meer.de";
