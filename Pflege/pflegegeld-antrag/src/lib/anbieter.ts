/**
 * Die Anbieterdaten. Eine Stelle für Impressum, Datenschutzerklärung und
 * jede andere Nennung — damit sie nirgends auseinanderlaufen können.
 *
 * ACHTUNG: Solange hier Platzhalter stehen, darf die Seite nicht öffentlich
 * erreichbar sein. Eine fehlende oder falsche Anbieterkennzeichnung nach
 * § 5 DDG ist abmahnfähig, und ohne sie fehlt auch der Verantwortliche in der
 * Datenschutzerklärung. `npm run anbieter` schlägt Alarm, solange etwas fehlt;
 * die Prüfung läuft in `npm run pruefen` mit.
 */

export const ANBIETER = {
  /** Vollständiger Name inklusive Rechtsform, so wie er im Register steht. */
  name: "BITTE EINTRAGEN",
  /** Falls abweichend vom Namen — sonst leer lassen. */
  vertreten: "",
  strasse: "BITTE EINTRAGEN",
  plz: "BITTE EINTRAGEN",
  ort: "BITTE EINTRAGEN",
  land: "Deutschland",
  telefon: "BITTE EINTRAGEN",
  mail: "BITTE EINTRAGEN",
  /** Umsatzsteuer-Identifikationsnummer nach § 27a UStG, falls vorhanden. */
  ustId: "",
  /** Registergericht und -nummer, falls eingetragen. */
  register: "",
  /**
   * Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV. Pflicht, sobald eine
   * Seite journalistisch-redaktionelle Inhalte hat — die Erklärtexte hier
   * gehen in diese Richtung, deshalb vorsichtshalber angeben.
   */
  inhaltlichVerantwortlich: "BITTE EINTRAGEN",
} as const;

/**
 * Wo die Daten liegen. Steht in der Datenschutzerklärung als Auftragsverarbeiter
 * und entscheidet, ob ein Drittlandtransfer offengelegt werden muss.
 */
export const VERARBEITER = {
  /** Hosting. */
  hosting: {
    name: "Vercel Inc.",
    sitz: "440 N Barranca Ave #4133, Covina, CA 91723, USA",
    zweck: "Auslieferung der Seite, Server-Protokolle",
    drittland: true,
  },
  /** Datenbank. Region beim Anlegen gewählt. */
  datenbank: {
    name: "Supabase",
    sitz: "Supabase Inc., 970 Toa Payoh North, Singapur",
    /** BITTE PRÜFEN: Die Region ist beim Anlegen festgelegt worden. */
    region: "Frankfurt, Deutschland (eu-central-1)",
    zweck: "Speicherung der Anmeldungen und der Nutzungszahlen",
    drittland: false,
  },
} as const;

/** Stehen noch Platzhalter drin? */
export function anbieterUnvollstaendig(): string[] {
  const pflicht: Array<[string, string]> = [
    ["name", ANBIETER.name],
    ["strasse", ANBIETER.strasse],
    ["plz", ANBIETER.plz],
    ["ort", ANBIETER.ort],
    ["telefon", ANBIETER.telefon],
    ["mail", ANBIETER.mail],
    ["inhaltlichVerantwortlich", ANBIETER.inhaltlichVerantwortlich],
  ];
  return pflicht.filter(([, wert]) => !wert || wert.includes("BITTE EINTRAGEN")).map(([feld]) => feld);
}

export const ANSCHRIFT = [
  ANBIETER.name,
  ANBIETER.vertreten ? `vertreten durch ${ANBIETER.vertreten}` : null,
  ANBIETER.strasse,
  `${ANBIETER.plz} ${ANBIETER.ort}`,
  ANBIETER.land,
].filter(Boolean) as string[];
