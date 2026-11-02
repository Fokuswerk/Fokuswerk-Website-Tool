/**
 * Rechenkern: Begutachtungsinstrument der Pflegeversicherung (NBA).
 *
 * Datengrundlage, Stand 1. November 2026:
 *  - Anlage 1 und Anlage 2 zu § 15 SGB XI in der am 31.12.2026 geltenden Fassung
 *  - Artikel 1 Nr. 89 des Pflegeneuordnungsgesetzes (Kabinettsfassung 30.09.2026):
 *    Anlage 2 wird ersetzt, geaenderte Intervallgrenzen in den Modulen 1, 4 und 6
 *  - § 15 Abs. 3 SGB XI neu: Schwellenwerte 15 / 30 / 50 / 70 / 90
 *
 * Es wird nichts geschaetzt und nichts gerundet, was das Gesetz nicht rundet.
 */

export type Rechtsstand = "2026" | "2027";
export type ModulId = 1 | 2 | 3 | 4 | 5 | 6;

export type Antwort = {
  /** Index der gewaehlten Option */
  wahl: number;
};

export type Kriterium = {
  id: string;
  modul: ModulId;
  titel: string;
  /** Klartext fuer Angehoerige, nicht Gutachtersprache */
  hilfe: string;
  optionen: string[];
  /** Einzelpunkte je Option, Reihenfolge wie optionen */
  punkte: number[];
  /**
   * Nur Modul 5, Kriterien 5.1 bis 5.11: Massnahmen pro Tag, die eine Option
   * bedeutet. Anlage 1 bildet aus der SUMME dieser Zahlen ueber die ganze
   * Gruppe einen einzigen Einzelpunktwert 0 bis 3 - nicht einen je Kriterium.
   */
  massnahmen?: number[];
  /** Nur werten, wenn diese Bedingung erfuellt ist (Kriterien-Id und Mindestwahl) */
  nurWenn?: { id: string; mindestens: number };
};

const SKALA_SELBST = [
  "selbständig",
  "überwiegend selbständig",
  "überwiegend unselbständig",
  "unselbständig",
];
const SKALA_FAEHIG = [
  "Fähigkeit vorhanden",
  "größtenteils vorhanden",
  "in geringem Maße vorhanden",
  "nicht vorhanden",
];
const SKALA_HAEUFIG = [
  "nie oder sehr selten",
  "selten – ein- bis dreimal in zwei Wochen",
  "häufig – zweimal bis mehrmals pro Woche",
  "täglich",
];
const P_SELBST = [0, 1, 2, 3];
const P_HAEUFIG = [0, 1, 3, 5];

/**
 * Modul 5, Gruppe 5.1 bis 5.7: gefragt ist die ANZAHL der Massnahmen, nicht
 * eine Stufe. Anlage 1 summiert diese Anzahl ueber alle sieben Kriterien und
 * uebersetzt erst die Summe in 0 bis 3 Einzelpunkte.
 */
const SKALA_M5_A = [
  "entfällt oder wird allein gemacht",
  "einmal pro Woche",
  "mehrmals pro Woche",
  "einmal täglich",
  "zweimal täglich",
  "dreimal täglich",
  "mehr als dreimal täglich",
];
/** Massnahmen pro Tag je Option. Woche geteilt durch 7, so rechnet Anlage 1. */
const M_A = [0, 1 / 7, 3 / 7, 1, 2, 3, 6];

/** Modul 5, Gruppe 5.8 bis 5.11: ebenfalls Anzahl, ebenfalls Summe. */
const SKALA_M5_B = [
  "entfällt oder wird allein gemacht",
  "einmal pro Monat",
  "einmal pro Woche",
  "mehrmals pro Woche",
  "einmal täglich",
  "mehrmals täglich",
];
/** Massnahmen pro Tag je Option. Monat geteilt durch 30, Woche durch 7. */
const M_B = [0, 1 / 30, 1 / 7, 3 / 7, 1, 3];

/** Diese Kriterien liefern selbst keine Punkte, nur Massnahmenzahlen. */
const OHNE_PUNKTE_A = [0, 0, 0, 0, 0, 0, 0];
const OHNE_PUNKTE_B = [0, 0, 0, 0, 0, 0];

export const KRITERIEN: Kriterium[] = [
  // ---------- Modul 1: Mobilität (Gewichtung 10 %) ----------
  {
    id: "1.1", modul: 1, titel: "Positionswechsel im Bett",
    hilfe: "Sich im Bett auf die Seite drehen, aufsetzen, hinlegen.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "1.2", modul: 1, titel: "Stabile Sitzposition halten",
    hilfe: "Aufrecht sitzen bleiben, etwa am Tisch oder auf der Bettkante.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "1.3", modul: 1, titel: "Umsetzen",
    hilfe: "Vom Bett in den Sessel oder in den Rollstuhl wechseln.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "1.4", modul: 1, titel: "Fortbewegen innerhalb des Wohnbereichs",
    hilfe: "Innerhalb der Wohnung von Raum zu Raum gehen oder rollen.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "1.5", modul: 1, titel: "Treppensteigen",
    hilfe: "Eine Treppe zwischen zwei Etagen hinauf und hinunter.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },

  // ---------- Modul 2: Kognitive und kommunikative Fähigkeiten ----------
  {
    id: "2.1", modul: 2, titel: "Personen aus dem näheren Umfeld erkennen",
    hilfe: "Menschen, die täglich oder regelmäßig da sind, wiedererkennen.",
    optionen: SKALA_FAEHIG, punkte: P_SELBST,
  },
  {
    id: "2.2", modul: 2, titel: "Örtliche Orientierung",
    hilfe: "Weiß, wo sie oder er sich befindet, findet sich in der Wohnung zurecht.",
    optionen: SKALA_FAEHIG, punkte: P_SELBST,
  },
  {
    id: "2.3", modul: 2, titel: "Zeitliche Orientierung",
    hilfe: "Tageszeit, Wochentag, Jahreszeit einordnen.",
    optionen: SKALA_FAEHIG, punkte: P_SELBST,
  },
  {
    id: "2.4", modul: 2, titel: "Erinnern an wesentliche Ereignisse",
    hilfe: "Was heute oder in den letzten Tagen passiert ist, behalten.",
    optionen: SKALA_FAEHIG, punkte: P_SELBST,
  },
  {
    id: "2.5", modul: 2, titel: "Mehrschrittige Alltagshandlungen steuern",
    hilfe: "Zum Beispiel Kaffee kochen: Schritte in der richtigen Reihenfolge.",
    optionen: SKALA_FAEHIG, punkte: P_SELBST,
  },
  {
    id: "2.6", modul: 2, titel: "Entscheidungen im Alltag treffen",
    hilfe: "Kleidung nach Wetter wählen, Essen auswählen.",
    optionen: SKALA_FAEHIG, punkte: P_SELBST,
  },
  {
    id: "2.7", modul: 2, titel: "Sachverhalte und Informationen verstehen",
    hilfe: "Erklärungen aufnehmen und einordnen.",
    optionen: SKALA_FAEHIG, punkte: P_SELBST,
  },
  {
    id: "2.8", modul: 2, titel: "Risiken und Gefahren erkennen",
    hilfe: "Heiße Herdplatte, Stolperkante, offene Haustür.",
    optionen: SKALA_FAEHIG, punkte: P_SELBST,
  },
  {
    id: "2.9", modul: 2, titel: "Elementare Bedürfnisse mitteilen",
    hilfe: "Hunger, Durst, Schmerzen, Toilette ansprechen können.",
    optionen: SKALA_FAEHIG, punkte: P_SELBST,
  },
  {
    id: "2.10", modul: 2, titel: "Aufforderungen verstehen",
    hilfe: "Bitten wie „bitte den Arm heben“ umsetzen.",
    optionen: SKALA_FAEHIG, punkte: P_SELBST,
  },
  {
    id: "2.11", modul: 2, titel: "An einem Gespräch beteiligen",
    hilfe: "Einem Gespräch folgen und etwas beitragen.",
    optionen: SKALA_FAEHIG, punkte: P_SELBST,
  },

  // ---------- Modul 3: Verhaltensweisen und psychische Problemlagen ----------
  {
    id: "3.1", modul: 3, titel: "Motorisch geprägte Verhaltensauffälligkeiten",
    hilfe: "Rastloses Umherlaufen, ständiges Aufstehen, Weglauftendenz.",
    optionen: SKALA_HAEUFIG, punkte: P_HAEUFIG,
  },
  {
    id: "3.2", modul: 3, titel: "Nächtliche Unruhe",
    hilfe: "Nachts wach, aufstehen, umherlaufen, andere wecken.",
    optionen: SKALA_HAEUFIG, punkte: P_HAEUFIG,
  },
  {
    id: "3.3", modul: 3, titel: "Selbstschädigendes Verhalten",
    hilfe: "Sich selbst verletzen, Nahrung verweigern, Dinge verschlucken.",
    optionen: SKALA_HAEUFIG, punkte: P_HAEUFIG,
  },
  {
    id: "3.4", modul: 3, titel: "Beschädigen von Gegenständen",
    hilfe: "Sachen zerstören, werfen, zerreißen.",
    optionen: SKALA_HAEUFIG, punkte: P_HAEUFIG,
  },
  {
    id: "3.5", modul: 3, titel: "Körperlich aggressives Verhalten",
    hilfe: "Schlagen, treten, kratzen gegenüber anderen Menschen.",
    optionen: SKALA_HAEUFIG, punkte: P_HAEUFIG,
  },
  {
    id: "3.6", modul: 3, titel: "Verbale Aggression",
    hilfe: "Beschimpfen, bedrohen, beleidigen.",
    optionen: SKALA_HAEUFIG, punkte: P_HAEUFIG,
  },
  {
    id: "3.7", modul: 3, titel: "Andere auffällige Lautäußerungen",
    hilfe: "Rufen, schreien, stöhnen, ständiges Wiederholen.",
    optionen: SKALA_HAEUFIG, punkte: P_HAEUFIG,
  },
  {
    id: "3.8", modul: 3, titel: "Abwehr pflegerischer Maßnahmen",
    hilfe: "Waschen, Anziehen oder Medikamente werden abgewehrt.",
    optionen: SKALA_HAEUFIG, punkte: P_HAEUFIG,
  },
  {
    id: "3.9", modul: 3, titel: "Wahnvorstellungen",
    hilfe: "Überzeugungen, die nicht der Wirklichkeit entsprechen.",
    optionen: SKALA_HAEUFIG, punkte: P_HAEUFIG,
  },
  {
    id: "3.10", modul: 3, titel: "Ängste",
    hilfe: "Angstzustände, Panik, starke Unruhe aus Angst.",
    optionen: SKALA_HAEUFIG, punkte: P_HAEUFIG,
  },
  {
    id: "3.11", modul: 3, titel: "Antriebslosigkeit bei depressiver Stimmung",
    hilfe: "Kommt nicht in Gang, muss zu allem angestoßen werden.",
    optionen: SKALA_HAEUFIG, punkte: P_HAEUFIG,
  },
  {
    id: "3.12", modul: 3, titel: "Sozial nicht angemessenes Verhalten",
    hilfe: "Distanzlosigkeit, Entkleiden in der Öffentlichkeit.",
    optionen: SKALA_HAEUFIG, punkte: P_HAEUFIG,
  },
  {
    id: "3.13", modul: 3, titel: "Sonstige pflegerelevante Handlungen",
    hilfe: "Zum Beispiel Horten, Verstecken, Umgang mit Ausscheidungen.",
    optionen: SKALA_HAEUFIG, punkte: P_HAEUFIG,
  },

  // ---------- Modul 4: Selbstversorgung (Gewichtung 40 %) ----------
  {
    id: "4.1", modul: 4, titel: "Waschen des vorderen Oberkörpers",
    hilfe: "Gesicht, Hals, Arme, Brust, Bauch am Waschbecken.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "4.2", modul: 4, titel: "Körperpflege im Bereich des Kopfes",
    hilfe: "Kämmen, Zahnpflege oder Prothesenreinigung, Rasieren.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "4.3", modul: 4, titel: "Waschen des Intimbereichs",
    hilfe: "Intimpflege selbst durchführen.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "4.4", modul: 4, titel: "Duschen und Baden samt Haarwäsche",
    hilfe: "In die Dusche oder Wanne kommen, sich waschen, Haare waschen.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "4.5", modul: 4, titel: "An- und Auskleiden des Oberkörpers",
    hilfe: "Hemd, Pullover, BH, Jacke.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "4.6", modul: 4, titel: "An- und Auskleiden des Unterkörpers",
    hilfe: "Unterwäsche, Hose, Strümpfe, Schuhe.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "4.7", modul: 4, titel: "Essen mundgerecht zubereiten, Getränke eingießen",
    hilfe: "Brot schneiden, Fleisch zerteilen, Flasche öffnen, eingießen.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "4.8", modul: 4, titel: "Essen",
    hilfe: "Die Mahlzeit selbst zum Mund führen und essen.",
    optionen: SKALA_SELBST, punkte: [0, 3, 6, 9],
  },
  {
    id: "4.9", modul: 4, titel: "Trinken",
    hilfe: "Aus Tasse oder Glas selbst trinken.",
    optionen: SKALA_SELBST, punkte: [0, 2, 4, 6],
  },
  {
    id: "4.10", modul: 4, titel: "Benutzen einer Toilette oder eines Toilettenstuhls",
    hilfe: "Hinsetzen, Hygiene, Kleidung richten, aufstehen.",
    optionen: SKALA_SELBST, punkte: [0, 2, 4, 6],
  },
  {
    id: "4.inko", modul: 4, titel: "Liegt eine Inkontinenz vor?",
    hilfe: "Wird nur gewertet, wenn überwiegend oder vollständig inkontinent oder künstlich abgeleitet.",
    optionen: [
      "nein oder nur gelegentlich",
      "überwiegend inkontinent",
      "vollständig inkontinent oder künstlich abgeleitet",
    ],
    punkte: [0, 0, 0],
  },
  {
    id: "4.11", modul: 4, titel: "Folgen einer Harninkontinenz bewältigen",
    hilfe: "Vorlagen wechseln, Katheter oder Urostoma versorgen.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
    nurWenn: { id: "4.inko", mindestens: 1 },
  },
  {
    id: "4.12", modul: 4, titel: "Folgen einer Stuhlinkontinenz bewältigen",
    hilfe: "Vorlagen wechseln, Stoma versorgen.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
    nurWenn: { id: "4.inko", mindestens: 1 },
  },
  {
    id: "4.13", modul: 4, titel: "Ernährung über Sonde oder parenteral",
    hilfe: "Achtung, das Gesetz bewertet hier bewusst anders: teilweise zählt höher als vollständig.",
    optionen: [
      "entfällt oder selbständig durchführbar",
      "teilweise über Sonde oder parenteral",
      "vollständig über Sonde oder parenteral",
    ],
    punkte: [0, 6, 3],
  },

  /*
   * Nur fuer Kinder bis 18 Monate. Ersetzt in Modul 4 die Kriterien 4.1 bis
   * 4.13 vollstaendig (Anlage 1 zu § 15 SGB XI, "Einzelpunkte fuer das
   * Kriterium der Ziffer 4.K"). Keine Stufung: trifft es zu, sind es pauschal
   * 20 Einzelpunkte. Der Grund ist einleuchtend - ein Saeugling ist bei der
   * Selbstversorgung ohnehin auf Hilfe angewiesen, das unterscheidet ihn nicht
   * von anderen Saeuglingen. Gefragt wird deshalb nur nach dem, was darueber
   * hinausgeht.
   */
  {
    id: "4.K", modul: 4, titel: "Gravierende Probleme bei der Nahrungsaufnahme",
    hilfe: "Nur bei Kindern bis 18 Monate: ein außergewöhnlich pflegeintensiver Hilfebedarf beim Essen und Trinken, etwa Sondenernährung oder stundenlanges Füttern.",
    optionen: ["nein", "ja"],
    punkte: [0, 20],
  },

  // ---------- Modul 5: krankheits- und therapiebedingte Anforderungen (20 %) ----------
  {
    id: "5.1", modul: 5, titel: "Medikamente einnehmen",
    hilfe: "Jede Gabe zählt einmal. Drei Tabletten zu einem Termin sind eine Maßnahme, dreimal am Tag Tabletten sind drei.",
    optionen: SKALA_M5_A, punkte: OHNE_PUNKTE_A, massnahmen: M_A,
  },
  {
    id: "5.2", modul: 5, titel: "Spritzen (unter die Haut oder in den Muskel)",
    hilfe: "Zum Beispiel Insulin oder Thrombosespritzen. Wie viele am Tag?",
    optionen: SKALA_M5_A, punkte: OHNE_PUNKTE_A, massnahmen: M_A,
  },
  {
    id: "5.3", modul: 5, titel: "Versorgung von Zugängen, Port",
    hilfe: "Intravenöse Zugänge, Portnadel. Wie oft wird versorgt?",
    optionen: SKALA_M5_A, punkte: OHNE_PUNKTE_A, massnahmen: M_A,
  },
  {
    id: "5.4", modul: 5, titel: "Absaugen oder Sauerstoffgabe",
    hilfe: "Sekret absaugen, Sauerstoffgerät bedienen. Wie oft am Tag?",
    optionen: SKALA_M5_A, punkte: OHNE_PUNKTE_A, massnahmen: M_A,
  },
  {
    id: "5.5", modul: 5, titel: "Einreibungen, Kälte- oder Wärmeanwendungen",
    hilfe: "Salben auftragen, Wickel, Kühlpacks. Wie oft am Tag?",
    optionen: SKALA_M5_A, punkte: OHNE_PUNKTE_A, massnahmen: M_A,
  },
  {
    id: "5.6", modul: 5, titel: "Messen und Deuten von Körperzuständen",
    hilfe: "Blutzucker, Blutdruck, Gewicht, Temperatur messen und bewerten. Jede Messung zählt einmal.",
    optionen: SKALA_M5_A, punkte: OHNE_PUNKTE_A, massnahmen: M_A,
  },
  {
    id: "5.7", modul: 5, titel: "Körpernahe Hilfsmittel",
    hilfe: "Prothese, Orthese, Stützstrümpfe, Bandage anlegen. Anlegen und Ablegen sind zwei Maßnahmen.",
    optionen: SKALA_M5_A, punkte: OHNE_PUNKTE_A, massnahmen: M_A,
  },
  {
    id: "5.8", modul: 5, titel: "Verbandswechsel und Wundversorgung",
    hilfe: "Zum Beispiel bei offenen Beinen oder Druckstellen. Wie oft wird gewechselt?",
    optionen: SKALA_M5_B, punkte: OHNE_PUNKTE_B, massnahmen: M_B,
  },
  {
    id: "5.9", modul: 5, titel: "Versorgung bei Stoma",
    hilfe: "Künstlicher Darm- oder Blasenausgang. Wie oft wird versorgt?",
    optionen: SKALA_M5_B, punkte: OHNE_PUNKTE_B, massnahmen: M_B,
  },
  {
    id: "5.10", modul: 5, titel: "Einmalkatheter oder Abführmethoden",
    hilfe: "Regelmäßiges Katheterisieren, Klistier, Darmentleerung. Wie oft?",
    optionen: SKALA_M5_B, punkte: OHNE_PUNKTE_B, massnahmen: M_B,
  },
  {
    id: "5.11", modul: 5, titel: "Therapiemaßnahmen zu Hause",
    hilfe: "Übungen nach Anleitung, Atemtherapie, Lagerung nach Plan. Wie oft?",
    optionen: SKALA_M5_B, punkte: OHNE_PUNKTE_B, massnahmen: M_B,
  },
  {
    id: "5.12", modul: 5, titel: "Zeit- und technikintensive Maßnahmen zu Hause",
    hilfe: "Beatmung, Heimdialyse, Dauerinfusion. Wie oft?",
    optionen: ["nein", "monatlich", "wöchentlich", "täglich"],
    punkte: [0, 0, 0, 0],
  },
  {
    id: "5.13", modul: 5, titel: "Arztbesuche",
    hilfe: "Fahrten zur Ärztin oder zum Arzt, die begleitet werden müssen.",
    optionen: ["seltener", "monatlich", "wöchentlich", "mehrmals wöchentlich"],
    punkte: [0, 0, 0, 0],
  },
  {
    id: "5.14", modul: 5, titel: "Andere Behandlungstermine bis drei Stunden",
    hilfe: "Physiotherapie, Logopädie, Ambulanz.",
    optionen: ["seltener", "monatlich", "wöchentlich", "mehrmals wöchentlich"],
    punkte: [0, 0, 0, 0],
  },
  {
    id: "5.15", modul: 5, titel: "Lange Behandlungstermine über drei Stunden",
    hilfe: "Dialyse, Bestrahlung, Chemotherapie.",
    optionen: ["seltener", "monatlich", "wöchentlich", "mehrmals wöchentlich"],
    punkte: [0, 0, 0, 0],
  },
  {
    id: "5.16", modul: 5, titel: "Diät und Verhaltensvorschriften einhalten",
    hilfe: "Vorgaben wegen Krankheit selbst einhalten können.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },

  /*
   * Nur fuer Kinder bis 18 Monate. Erweitert in Modul 5 die Haeufigkeitsgruppe
   * 5.12 bis 5.15 um die Fruehfoerderung (Anlage 1). Gerechnet wird wie dort:
   * monatlich 1, woechentlich 4,3 - die Summe der Gruppe wird danach in
   * Einzelpunkte uebersetzt.
   */
  {
    id: "5.K", modul: 5, titel: "Besuche von Einrichtungen zur Frühförderung",
    hilfe: "Nur bei Kindern bis 18 Monate: Termine zur Frühförderung, die begleitet werden müssen. Wie oft?",
    optionen: ["entfällt", "monatlich", "wöchentlich"],
    punkte: [0, 0, 0],
  },

  // ---------- Modul 6: Alltagsleben und soziale Kontakte (15 %) ----------
  {
    id: "6.1", modul: 6, titel: "Tagesablauf gestalten und anpassen",
    hilfe: "Den Tag selbst einteilen, auf Veränderungen reagieren.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "6.2", modul: 6, titel: "Ruhen und Schlafen",
    hilfe: "Schlaf-Wach-Rhythmus selbst regeln.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "6.3", modul: 6, titel: "Sich beschäftigen",
    hilfe: "Allein etwas mit sich anfangen können.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "6.4", modul: 6, titel: "Planungen für die Zukunft vornehmen",
    hilfe: "Termine, Besuche, Vorhaben selbst planen.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "6.5", modul: 6, titel: "Kontakt zu Menschen im direkten Umfeld",
    hilfe: "Von sich aus mit Anwesenden in Kontakt treten.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
  {
    id: "6.6", modul: 6, titel: "Kontakt zu Menschen außerhalb",
    hilfe: "Telefonieren, Besuche verabreden, Kontakte halten.",
    optionen: SKALA_SELBST, punkte: P_SELBST,
  },
];

/** Untere Grenzen der Schweregrade 0 bis 4 je Modul, je Rechtsstand. */
const GRENZEN: Record<Rechtsstand, Record<ModulId, number[]>> = {
  // Anlage 2 zu § 15 SGB XI, Fassung bis 31.12.2026
  "2026": {
    1: [0, 2, 4, 6, 10],
    2: [0, 2, 6, 11, 17],
    3: [0, 1, 3, 5, 7],
    4: [0, 3, 8, 19, 37],
    5: [0, 1, 2, 4, 6],
    6: [0, 1, 4, 7, 12],
  },
  // Anlage 2 neu nach Artikel 1 Nr. 89 PNOG: Module 1, 4 und 6 verschoben
  "2027": {
    1: [0, 2, 4, 7, 10],
    2: [0, 2, 6, 11, 17],
    3: [0, 1, 3, 5, 7],
    4: [0, 4, 10, 25, 40],
    5: [0, 1, 2, 4, 6],
    6: [0, 2, 4, 7, 12],
  },
};

/** Gewichtete Punkte je Schweregrad. Module 2 und 3 teilen sich eine Gewichtung. */
const GEWICHTET: Record<"1" | "23" | "4" | "5" | "6", number[]> = {
  "1": [0, 2.5, 5, 7.5, 10],
  "23": [0, 3.75, 7.5, 11.25, 15],
  "4": [0, 10, 20, 30, 40],
  "5": [0, 5, 10, 15, 20],
  "6": [0, 3.75, 7.5, 11.25, 15],
};

/** Schwellenwerte der Pflegegrade 1 bis 5. */
const SCHWELLEN: Record<Rechtsstand, number[]> = {
  "2026": [12.5, 27, 47.5, 70, 90],
  "2027": [15, 30, 50, 70, 90],
};

/**
 * Kinder bis 18 Monate, § 15 Abs. 7 SGB XI. Dieselben Punktzahlen, aber je
 * eine Stufe hoeher - und Pflegegrad 1 gibt es dort nicht. Der Entwurf
 * verschiebt sie im Gleichschritt mit den uebrigen mit (Art. 1 Nr. 16
 * Buchstabe b: 15/30/50/70 statt 12,5/27/47,5/70); die Begruendung nennt das
 * ausdruecklich eine "systematisch bedingte Folgeanpassung".
 */
const SCHWELLEN_KIND: Record<Rechtsstand, number[]> = {
  "2026": [12.5, 27, 47.5, 70],
  "2027": [15, 30, 50, 70],
};
/** Der erste Pflegegrad, den ein Saeugling erreichen kann. */
const ERSTER_GRAD_KIND = 2;

export const MODUL_NAMEN: Record<ModulId, string> = {
  1: "Mobilität",
  2: "Kognitive und kommunikative Fähigkeiten",
  3: "Verhaltensweisen und psychische Problemlagen",
  4: "Selbstversorgung",
  5: "Krankheits- und therapiebedingte Anforderungen",
  6: "Alltagsleben und soziale Kontakte",
};

export type Antworten = Record<string, number>;

export type ModulErgebnis = {
  modul: ModulId;
  einzelpunkte: number;
  schweregrad: number;
  gewichtetePunkte: number;
  /** true, wenn Modul 3 statt Modul 2 den Wert bestimmt hat */
  ausModul3?: boolean;
};

export type Ergebnis = {
  rechtsstand: Rechtsstand;
  module: ModulErgebnis[];
  gesamtpunkte: number;
  pflegegrad: number;
  /** Punkte bis zur naechsten Stufe, null bei Pflegegrad 5 */
  bisNaechsteStufe: number | null;
  naechsteStufe: number | null;
};

function schweregrad(summe: number, grenzen: number[]): number {
  let grad = 0;
  for (let i = 0; i < grenzen.length; i++) {
    if (summe >= grenzen[i]) grad = i;
  }
  return grad;
}

/**
 * Zaehlt die Einzelpunkte eines Moduls aus den Antworten.
 *
 * Bei Kindern bis 18 Monate weicht Anlage 1 an zwei Stellen ab, und zwar
 * unveraendert auch nach dem Entwurf:
 * - Modul 4: die Kriterien 4.1 bis 4.13 werden durch das eine Kriterium 4.K
 *   ersetzt. Ein Saeugling ist bei der Selbstversorgung naturgemaess
 *   unselbstaendig; gefragt wird deshalb nur nach gravierenden Problemen bei
 *   der Nahrungsaufnahme, und die zaehlen pauschal 20 Einzelpunkte.
 * - Modul 5: die Gruppe 5.12 bis 5.15 wird um 5.K erweitert (Frühförderung).
 */
function einzelpunkte(modul: ModulId, a: Antworten, kind = false): number {
  if (modul === 5) return modul5Punkte(a, kind);
  if (modul === 4 && kind) {
    const k = KRITERIEN.find((x) => x.id === "4.K");
    return k?.punkte[a["4.K"] ?? 0] ?? 0;
  }
  let summe = 0;
  for (const k of KRITERIEN) {
    if (k.modul !== modul) continue;
    if (k.id === "4.inko") continue;
    // Die Kinder-Sonderkriterien zaehlen nur im Kinderverfahren mit.
    if (k.id === "4.K" || k.id === "5.K") continue;
    if (k.nurWenn) {
      const tor = a[k.nurWenn.id];
      if (tor === undefined || tor < k.nurWenn.mindestens) continue;
    }
    const wahl = a[k.id];
    if (wahl === undefined) continue;
    summe += k.punkte[wahl] ?? 0;
  }
  return summe;
}

/** Gruppe 5.1 bis 5.7: Massnahmen pro Tag der ganzen Gruppe in Einzelpunkte. */
export function punkteGruppeA(massnahmenProTag: number): number {
  if (massnahmenProTag > 8) return 3; // mehr als achtmal taeglich
  if (massnahmenProTag > 3) return 2; // mehr als dreimal bis achtmal taeglich
  if (massnahmenProTag >= 1) return 1; // einmal bis dreimal taeglich
  return 0; // keine oder seltener als einmal taeglich
}

/** Gruppe 5.8 bis 5.11: Massnahmen pro Tag der ganzen Gruppe in Einzelpunkte. */
export function punkteGruppeB(massnahmenProTag: number): number {
  if (massnahmenProTag >= 3) return 3; // mindestens dreimal taeglich
  if (massnahmenProTag >= 1) return 2; // einmal bis unter dreimal taeglich
  if (massnahmenProTag >= 1 / 7) return 1; // ein- bis mehrmals woechentlich
  return 0; // keine oder seltener als einmal woechentlich
}

/** Addiert die Massnahmen pro Tag ueber eine Gruppe von Kriterien. */
function massnahmenSumme(ids: string[], a: Antworten): number {
  let proTag = 0;
  for (const id of ids) {
    const wahl = a[id];
    if (wahl === undefined) continue;
    const k = KRITERIEN.find((x) => x.id === id);
    proTag += k?.massnahmen?.[wahl] ?? 0;
  }
  return proTag;
}

export const GRUPPE_A = ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7"];
export const GRUPPE_B = ["5.8", "5.9", "5.10", "5.11"];

/**
 * Modul 5 rechnet in vier Bloecken, so steht es in Anlage 1 zu § 15 SGB XI:
 *
 *  - 5.1 bis 5.7:  Anzahl der Massnahmen pro Tag wird ueber die ganze Gruppe
 *                  summiert und ergibt EINEN Wert von 0 bis 3.
 *  - 5.8 bis 5.11: ebenso, eigene Intervallgrenzen, EIN Wert von 0 bis 3.
 *  - 5.12 bis 5.15: Haeufigkeiten werden mit Faktoren multipliziert, addiert
 *                  und erst dann in 0, 1, 2, 3 oder 6 Einzelpunkte uebersetzt.
 *  - 5.16:         eine eigene Stufe von 0 bis 3.
 *
 * Gesetzliches Maximum: 3 + 3 + 6 + 3 = 15 Einzelpunkte.
 */
function modul5Punkte(a: Antworten, kind = false): number {
  const ausA = punkteGruppeA(massnahmenSumme(GRUPPE_A, a));
  const ausB = punkteGruppeB(massnahmenSumme(GRUPPE_B, a));

  // Haeufigkeitswerte: taeglich 60 bzw. woechentlich 4,3 / 8,6, monatlich 1 / 2
  const haeufigkeit =
    [0, 2, 8.6, 60][a["5.12"] ?? 0] +
    [0, 1, 4.3, 8.6][a["5.13"] ?? 0] +
    [0, 1, 4.3, 8.6][a["5.14"] ?? 0] +
    [0, 2, 8.6, 17.2][a["5.15"] ?? 0] +
    // 5.K kommt nur bei Kindern bis 18 Monate dazu: Besuche von Einrichtungen
    // zur Fruehfoerderung, monatlich 1, woechentlich 4,3.
    (kind ? [0, 1, 4.3][a["5.K"] ?? 0] : 0);

  let ausHaeufigkeit = 0;
  if (haeufigkeit >= 60) ausHaeufigkeit = 6;
  else if (haeufigkeit >= 12.9) ausHaeufigkeit = 3;
  else if (haeufigkeit >= 8.6) ausHaeufigkeit = 2;
  else if (haeufigkeit >= 4.3) ausHaeufigkeit = 1;

  const diaet = KRITERIEN.find((x) => x.id === "5.16")?.punkte[a["5.16"] ?? 0] ?? 0;

  return ausA + ausB + ausHaeufigkeit + diaet;
}

export type Rohpunkte = Record<ModulId, number>;

/** Bewertet fertige Einzelpunkt-Summen. Beide Rechenwege laufen hierdurch. */
export function bewerte(p: Rohpunkte, rechtsstand: Rechtsstand, kind = false): Ergebnis {
  const g = GRENZEN[rechtsstand];

  const s1 = schweregrad(p[1], g[1]);
  const s2 = schweregrad(p[2], g[2]);
  const s3 = schweregrad(p[3], g[3]);
  const s4 = schweregrad(p[4], g[4]);
  const s5 = schweregrad(p[5], g[5]);
  const s6 = schweregrad(p[6], g[6]);

  // Hoechster Schweregrad aus Modul 2 oder Modul 3 bestimmt die gemeinsame Gewichtung
  const s23 = Math.max(s2, s3);
  const ausModul3 = s3 > s2;

  const module: ModulErgebnis[] = [
    { modul: 1, einzelpunkte: p[1], schweregrad: s1, gewichtetePunkte: GEWICHTET["1"][s1] },
    { modul: 2, einzelpunkte: p[2], schweregrad: s2, gewichtetePunkte: ausModul3 ? 0 : GEWICHTET["23"][s23], ausModul3 },
    { modul: 3, einzelpunkte: p[3], schweregrad: s3, gewichtetePunkte: ausModul3 ? GEWICHTET["23"][s23] : 0, ausModul3 },
    { modul: 4, einzelpunkte: p[4], schweregrad: s4, gewichtetePunkte: GEWICHTET["4"][s4] },
    { modul: 5, einzelpunkte: p[5], schweregrad: s5, gewichtetePunkte: GEWICHTET["5"][s5] },
    { modul: 6, einzelpunkte: p[6], schweregrad: s6, gewichtetePunkte: GEWICHTET["6"][s6] },
  ];

  const gesamtpunkte =
    GEWICHTET["1"][s1] +
    GEWICHTET["23"][s23] +
    GEWICHTET["4"][s4] +
    GEWICHTET["5"][s5] +
    GEWICHTET["6"][s6];

  const sw = kind ? SCHWELLEN_KIND[rechtsstand] : SCHWELLEN[rechtsstand];
  const ersterGrad = kind ? ERSTER_GRAD_KIND : 1;

  let pflegegrad = 0;
  for (let i = 0; i < sw.length; i++) {
    if (gesamtpunkte >= sw[i]) pflegegrad = i + ersterGrad;
  }

  const naechsteStufe = pflegegrad < 5 ? Math.max(pflegegrad + 1, ersterGrad) : null;
  const bisNaechsteStufe =
    naechsteStufe === null
      ? null
      : Math.round((sw[naechsteStufe - ersterGrad] - gesamtpunkte) * 100) / 100;

  return { rechtsstand, module, gesamtpunkte, pflegegrad, bisNaechsteStufe, naechsteStufe };
}

/** Rechnet aus den Antworten zu allen Kriterien. */
export function berechne(a: Antworten, rechtsstand: Rechtsstand, kind = false): Ergebnis {
  return bewerte(
    {
      1: einzelpunkte(1, a, kind),
      2: einzelpunkte(2, a, kind),
      3: einzelpunkte(3, a, kind),
      4: einzelpunkte(4, a, kind),
      5: einzelpunkte(5, a, kind),
      6: einzelpunkte(6, a, kind),
    },
    rechtsstand,
    kind,
  );
}

/** Schwellenwerte zum Anzeigen. */
export function schwellen(rechtsstand: Rechtsstand): number[] {
  return SCHWELLEN[rechtsstand];
}

/**
 * Welches Modul traegt am wenigsten von seinem moeglichen Gewicht bei?
 * Das ist der Hebel fuer Widerspruch und Vorbereitung.
 */
const MAXIMAL: Record<ModulId, number> = { 1: 10, 2: 15, 3: 15, 4: 40, 5: 20, 6: 15 };

/** Gewichtete Punkte eines Moduls, fuer 2 und 3 der gemeinsame Wert. */
function punkteImModul(e: Ergebnis, m: ModulId): number {
  if (m === 2 || m === 3) {
    const zwei = e.module.find((x) => x.modul === 2)?.gewichtetePunkte ?? 0;
    const drei = e.module.find((x) => x.modul === 3)?.gewichtetePunkte ?? 0;
    return Math.max(zwei, drei);
  }
  return e.module.find((x) => x.modul === m)?.gewichtetePunkte ?? 0;
}

/**
 * Wo rechnerisch die groesste Luecke zum Hoechstwert ist - also wo eine zweite
 * Ueberlegung am ehesten noch Punkte bringt.
 *
 * Die Module 2 und 3 teilen sich einen gewichteten Wert; wer sie einzeln
 * betrachtet, meldet immer eine Luecke von 15 fuer das Modul, das gerade nicht
 * zaehlt - auch bei 100 von 100 Punkten. Deshalb zaehlt hier der gemeinsame
 * Wert, und innerhalb der Gruppe wird das Modul mit den wenigeren
 * Einzelpunkten benannt.
 */
export function schwaechstesModul(e: Ergebnis): ModulId {
  const kandidaten: ModulId[] = [1, 2, 4, 5, 6];
  let beste: ModulId = 4;
  let groessteLuecke = -1;
  for (const m of kandidaten) {
    const luecke = MAXIMAL[m] - punkteImModul(e, m);
    if (luecke > groessteLuecke) {
      groessteLuecke = luecke;
      beste = m;
    }
  }
  if (beste === 2) {
    const zwei = e.module.find((x) => x.modul === 2)?.einzelpunkte ?? 0;
    const drei = e.module.find((x) => x.modul === 3)?.einzelpunkte ?? 0;
    // 33 bzw. 65 moegliche Einzelpunkte: der relative Anteil macht sie vergleichbar
    return zwei / 33 <= drei / 65 ? 2 : 3;
  }
  return beste;
}

/**
 * Das Gegenteil: wo der groesste BEDARF gemessen wurde, also der hoechste
 * Anteil am Hoechstwert. Nur das darf ueber Hilfsmittel- oder
 * Dienstleistungsvorschlaege entscheiden - sonst bekommt jemand, der problemlos
 * Treppen steigt, einen Treppenlift angeboten.
 */
export function groesstesBedarfsmodul(e: Ergebnis): ModulId {
  const kandidaten: ModulId[] = [1, 2, 4, 5, 6];
  let beste: ModulId = 4;
  let hoechsterAnteil = -1;
  for (const m of kandidaten) {
    const anteil = punkteImModul(e, m) / MAXIMAL[m];
    if (anteil > hoechsterAnteil) {
      hoechsterAnteil = anteil;
      beste = m;
    }
  }
  return beste;
}

/**
 * Schnell-Check: sechs Fragen, eine je Modul. Die Optionen liefern
 * Einzelpunkt-Schaetzungen aus der Mitte der jeweiligen Schweregrad-Spanne.
 *
 * WICHTIG, und auf der Seite auch so gesagt: Weil die Schaetzungen mittig
 * liegen, faellt keine von ihnen je in die verschobenen Punktspannen der
 * Module 1, 4 und 6. Der Schnellcheck zeigt deshalb ausschliesslich die
 * Wirkung der hoeheren Schwellenwerte (laut Begruendung knapp 12 Prozent),
 * nie die der verschobenen Intervallgrenzen (zusammen etwa 22 Prozent).
 * Nur der genaue Rechner bildet beides ab. Wer die Rohpunkte hier aendert,
 * muss den Hinweis im Ergebnisblock von Start.tsx mitaendern.
 */
export type SchnellFrage = {
  modul: ModulId;
  frage: string;
  optionen: { text: string; rohpunkte: number }[];
};

export const SCHNELL_FRAGEN: SchnellFrage[] = [
  {
    modul: 1,
    frage: "Wie gut kommt die Person in der Wohnung voran?",
    optionen: [
      { text: "Ohne Hilfe, auch Treppen", rohpunkte: 0 },
      { text: "Etwas unsicher, braucht gelegentlich eine Hand", rohpunkte: 2 },
      { text: "Braucht regelmäßig Hilfe beim Aufstehen und Gehen", rohpunkte: 5 },
      { text: "Kommt nur mit Hilfe aus dem Bett und durch die Wohnung", rohpunkte: 8 },
      { text: "Ist liegend oder im Rollstuhl, Hilfe bei jedem Wechsel", rohpunkte: 12 },
    ],
  },
  {
    modul: 2,
    frage: "Wie ist es mit Gedächtnis, Orientierung und Verstehen?",
    optionen: [
      { text: "Unauffällig", rohpunkte: 0 },
      { text: "Vergisst manches, findet sich aber zurecht", rohpunkte: 3 },
      { text: "Verwechselt Zeiten, braucht Erinnerungen und Anleitung", rohpunkte: 8 },
      { text: "Erkennt Gefahren nicht, braucht ständige Anleitung", rohpunkte: 13 },
      { text: "Versteht kaum etwas, erkennt Angehörige nicht sicher", rohpunkte: 22 },
    ],
  },
  {
    modul: 3,
    frage: "Gibt es auffälliges Verhalten oder psychische Belastungen?",
    optionen: [
      { text: "Nein", rohpunkte: 0 },
      { text: "Selten, etwa Unruhe oder Ängste", rohpunkte: 1 },
      { text: "Mehrmals pro Woche, etwa nachts unruhig oder abwehrend", rohpunkte: 3 },
      { text: "Fast täglich, mehrere Auffälligkeiten", rohpunkte: 5 },
      { text: "Täglich und in mehreren Bereichen", rohpunkte: 12 },
    ],
  },
  {
    modul: 4,
    frage: "Wie viel Hilfe braucht die Person bei Waschen, Anziehen, Essen und Toilette?",
    optionen: [
      { text: "Keine", rohpunkte: 0 },
      { text: "Bei Einzelnem, etwa Duschen oder Strümpfe", rohpunkte: 5 },
      { text: "Bei mehrerem täglich, etwa Waschen und Ankleiden", rohpunkte: 13 },
      { text: "Bei fast allem, auch Toilette oder Inkontinenz", rohpunkte: 27 },
      { text: "Vollständig, auch beim Essen und Trinken", rohpunkte: 45 },
    ],
  },
  {
    modul: 5,
    frage: "Wie aufwendig sind Medikamente, Verbände und Arztbesuche?",
    optionen: [
      { text: "Kommt selbst damit zurecht", rohpunkte: 0 },
      { text: "Medikamente müssen gerichtet werden", rohpunkte: 1 },
      { text: "Täglich mehrere Maßnahmen, regelmäßige Termine", rohpunkte: 3 },
      { text: "Viele Maßnahmen täglich, Wunden oder Spritzen", rohpunkte: 5 },
      { text: "Sehr aufwendig, etwa Dialyse, Absaugen oder Beatmung", rohpunkte: 9 },
    ],
  },
  {
    modul: 6,
    frage: "Wie selbständig gestaltet die Person ihren Tag und ihre Kontakte?",
    optionen: [
      { text: "Völlig selbständig", rohpunkte: 0 },
      { text: "Braucht Anstöße, etwa für Beschäftigung", rohpunkte: 2 },
      { text: "Tagesablauf muss weitgehend vorgegeben werden", rohpunkte: 5 },
      { text: "Kommt allein zu nichts, Kontakte nur durch andere", rohpunkte: 9 },
      { text: "Keine eigene Gestaltung möglich", rohpunkte: 14 },
    ],
  },
];
