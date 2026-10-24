/**
 * Datenmodell der Demo.
 *
 * Grundsätze, die auch für die spätere echte Anwendung gelten:
 *  - Alle technischen Maße sind Millimeter als Integer. Keine Fließkommazahlen.
 *  - Koordinatenkonvention je Raum: Ursprung ist die linke obere Innenecke,
 *    x läuft nach rechts, y nach unten. Wandbezug immer ab Raumursprung.
 *  - Jedes technische Attribut trägt Wert, Einheit, Herkunft und Freigabe.
 *    Herkunft (woher stammt die Zahl) und Freigabe (hat ein Mensch sie bestätigt)
 *    sind bewusst getrennt und dürfen nicht verwechselt werden.
 *  - Geldbeträge in EUR netto als Integer-Cent-freie Ganzzahl.
 */

export type Herkunft = "gelesen" | "gerechnet" | "erfasst" | "angenommen";
export type Freigabe = "offen" | "bestaetigt";

export interface Attribut {
  wert: number;
  einheit: "mm" | "m2" | "EUR" | "stk";
  herkunft: Herkunft;
  freigabe: Freigabe;
  /** Woher genau — Layername, Maßkette, Planbezeichnung. */
  quelle: string;
  /** Warum der Wert geprüft werden muss, falls offen. */
  hinweis?: string;
}

export type Wandseite = "nord" | "ost" | "sued" | "west";

export interface Oeffnung {
  id: string;
  art: "tuer" | "fenster";
  wand: Wandseite;
  /** mm entlang der Wand, von der im Uhrzeigersinn ersten Ecke aus. */
  von: number;
  breite: number;
  /** Nur Fenster: Brüstungshöhe über Oberkante Fertigfußboden. */
  bruestung?: number;
  /** Nur Fenster: Höhe der Öffnung. */
  hoehe?: number;
  /** Nur Türen. */
  anschlag?: "links" | "rechts";
  oeffnetNach?: "innen" | "aussen";
}

export type ZwangspunktArt =
  | "fallstrang"
  | "schacht"
  | "heizkoerper"
  | "elektro";

export interface Zwangspunkt {
  id: string;
  art: ZwangspunktArt;
  wand: Wandseite;
  von: number;
  breite: number;
  bezeichnung: string;
  herkunft: Herkunft;
  freigabe: Freigabe;
}

/** Eine Küchenzeile: der Wandabschnitt, auf dem Module stehen. */
export interface Zeile {
  id: string;
  wand: Wandseite;
  /** mm entlang der Wand, ab Raumursprung. */
  start: number;
  laenge: number;
  bezeichnung: string;
}

export interface Pruefpunkt {
  id: string;
  titel: string;
  beschreibung: string;
  freigabe: Freigabe;
  /** Attribut, das ohne Bestätigung die Generierung blockiert. */
  blockierend: boolean;
}

export interface Kuechentyp {
  id: string;
  kurz: string;
  bezeichnung: string;
  grundform: "einzeilig" | "l-form" | "zweizeilig";
  /** Innenmaße des Küchenraums. */
  raum: { breite: number; tiefe: number; hoehe: number };
  zeilen: Zeile[];
  oeffnungen: Oeffnung[];
  zwangspunkte: Zwangspunkt[];
  attribute: Record<string, Attribut>;
  pruefpunkte: Pruefpunkt[];
  /** Wohnungsnummern, die diesen Typ erhalten. */
  wohnungen: string[];
  /** Wohnungen, die gespiegelt ausgeführt werden. */
  gespiegelt: string[];
  hinweis?: string;
}

export type ModulKategorie =
  | "unterschrank"
  | "hochschrank"
  | "haengeschrank"
  | "blende"
  | "arbeitsplatte"
  | "sockel"
  | "geraet"
  | "spuele"
  | "montage"
  | "zuschlag";

export interface NeutralesModul {
  id: string;
  bezeichnung: string;
  kategorie: ModulKategorie;
  /** Korpusbreite in mm. null bei laufenden Metern und Pauschalen. */
  breite: number | null;
  /** Korpushöhe in mm, für die Ansicht. */
  hoehe: number | null;
  einheit: "stk" | "lfm" | "psch";
  /** EUR netto je Einheit, Preisstand siehe PREISSTAND. */
  preis: number;
  /** Demo-Zuordnung auf das Programm des Partnerlieferanten. */
  artikel: string;
}

/** Eine Position in der Stückliste einer Variante. */
export interface Position {
  modulId: string;
  menge: number;
  /** Nur für Module in einer Zeile: auf welcher und an welcher Stelle. */
  zeileId?: string;
}

export type Optimierung = "kosten" | "stauraum" | "ergonomie";

export interface Kennzahlen {
  arbeitsflaeche: number;
  stauraum: number;
  installationsaufwand: number;
  bewegungsflaeche: number;
  bewertung: number;
}

export interface Variante {
  id: string;
  typId: string;
  kurz: string;
  schwerpunkt: Optimierung;
  bezeichnung: string;
  /** Belegung je Zeile, in Reihenfolge von links. */
  belegung: Record<string, string[]>;
  /** Positionen ausserhalb der Zeilen: Hängeschränke, Platte, Geräte, Montage. */
  weitere: Position[];
  kennzahlen: Kennzahlen;
  staerken: string[];
  schwaechen: string[];
  begruendung: string;
}

export type AnschlussArt =
  | "kaltwasser"
  | "warmwasser"
  | "abwasser"
  | "steckdose"
  | "herd"
  | "geschirrspueler"
  | "dunstabzug"
  | "kuehlschrank";

export interface Anschluss {
  id: string;
  art: AnschlussArt;
  bezeichnung: string;
  /** mm ab Zeilenanfang. */
  x: number;
  /** mm über Oberkante Fertigfußboden. */
  hoehe: number;
  zeileId: string;
  ausfuehrung: string;
  freigabe: Freigabe;
  hinweis?: string;
}

export type AufmassStatus =
  | "offen"
  | "laeuft"
  | "abweichung"
  | "bestaetigt";

export interface Messpunkt {
  id: string;
  bezeichnung: string;
  planmass: number;
  istmass: number | null;
}

export interface Wohnung {
  nr: string;
  haus: "A" | "B";
  geschoss: string;
  wohnflaeche: number;
  typId: string;
  gespiegelt: boolean;
  /** Nischenlänge der Hauptzeile nach Architektenplan, je Einheit. */
  nischenlaenge: number;
  /** Abstand zum Nennmaß des Typs. Diese Differenz nimmt die Passblende auf. */
  abweichung: number;
  messpunkte: Messpunkt[];
}

export type DokumentStatus =
  | "verarbeitet"
  | "pruefung"
  | "nicht-lesbar"
  | "neu";

export interface Dokument {
  id: string;
  name: string;
  format: string;
  groesse: string;
  datum: string;
  urheber: string;
  status: DokumentStatus;
  zuordnung: string;
  hinweis?: string;
}

export interface Regel {
  id: string;
  kategorie: "K1" | "K2" | "K3";
  titel: string;
  beschreibung: string;
  quelle: string;
  /** Harte Nebenbedingung oder Bewertungskriterium. */
  art: "hart" | "bewertet";
}

export interface SpezifikationSnapshot {
  version: string;
  datum: string;
  preisstand: string;
  gesamt: number;
  einheiten: number;
  auswahl: Record<string, string>;
  freigegeben: string;
  nichtFreigegeben: string;
}
