/** Gemeinsame Typen für Erfassung und Auswertung. */

export type EreignisArt =
  | "seite"
  | "check_start"
  | "check_frage"
  | "check_fertig"
  | "lead"
  | "klick";

export type Ereignis = {
  id?: string;
  zeit: string;
  art: EreignisArt;
  /** Pfad der Seite, auf der es passiert ist */
  pfad: string;
  /** Anonyme Sitzungskennung, nur im Browser erzeugt */
  sitzung: string;
  /** Freie Kennzahlen je Art, niemals Gesundheitsangaben */
  werte?: Record<string, string | number | null>;
};

export type Lead = {
  id?: string;
  zeit: string;
  anlass: string;
  mail: string;
  name: string;
  befund: Record<string, string | number | null>;
  quelle: string | null;
  sitzung?: string | null;
  /** false, bis die Bestaetigungsmail beantwortet ist (Double Opt-in) */
  bestaetigt?: boolean;
  /** Zufallswert aus dem Bestaetigungslink. Nach der Bestaetigung geloescht. */
  bestaetigungToken?: string | null;
  tokenGueltigBis?: string | null;
  bestaetigtAm?: string | null;
  /**
   * Nachweis der Einwilligung nach Art. 7 Abs. 1 DSGVO: ohne Zeitpunkt und
   * Herkunft beider Schritte laesst sich im Streitfall nichts belegen.
   */
  anmeldeIp?: string | null;
  bestaetigtIp?: string | null;
};

export type Kennzahlen = {
  besucher: number;
  seitenaufrufe: number;
  checksGestartet: number;
  checksBeendet: number;
  leads: number;
  klicks: number;
  /** Anteil der Besucher, die den Check starten */
  startquote: number;
  /** Anteil der Starter, die ihn beenden */
  abschlussquote: number;
  /** Anteil der Besucher, die einen Lead hinterlassen */
  leadquote: number;
};

export type Tageswert = { tag: string; besucher: number; leads: number };

export type AnlassWert = { anlass: string; anzahl: number };

export type Auswertung = {
  /** true, wenn keine Datenbank hinterlegt ist und Demo-Daten gezeigt werden */
  demo: boolean;
  stand: string;
  kennzahlen: Kennzahlen;
  verlauf: Tageswert[];
  anlaesse: AnlassWert[];
  leads: Lead[];
  /** Wie oft welche Frage des Schnellchecks zuletzt erreicht wurde */
  trichter: { schritt: string; anzahl: number }[];
};
