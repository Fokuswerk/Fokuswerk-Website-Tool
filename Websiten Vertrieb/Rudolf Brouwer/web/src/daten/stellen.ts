/**
 * Stellen und Arbeitgeberleistungen — wörtlich aus der Seite „Stellenangebote"
 * von brouwer-gmbh.de übernommen und nur sprachlich geglättet.
 * Nichts ergänzt, nichts ausgeschmückt.
 */

export type Stelle = {
  weg: string;
  titel: string;
  art: "Fachkraft" | "Ausbildung";
  beschaeftigung: string;
  anriss: string;
  aufgaben: string[];
  profil: string[];
};

export const stellen: Stelle[] = [
  {
    weg: "anlagenmechaniker-shk",
    titel: "Anlagenmechaniker SHK (m/w/d)",
    art: "Fachkraft",
    beschaeftigung: "Vollzeit · unbefristet",
    anriss:
      "Für die Bereiche Sanitär, Heizung, Klima und Schwimmbad. Sie bauen ein, was hier geplant wurde — vom Heizungstausch über die Fertigmontage im Bad bis zur Schwimmbadtechnik.",
    aufgaben: [
      "Installation und Modernisierung von Heizungsanlagen",
      "Badsanierung mit Fertigmontage",
      "Schwimmbadbau und Schwimmbadtechnik",
    ],
    profil: [
      "Abgeschlossene Berufsausbildung zum Anlagenmechaniker SHK",
      "Führerschein Klasse B",
      "Berufserfahrung in Heizung und Sanitär ist von Vorteil — Berufseinsteiger sind ausdrücklich willkommen",
      "Freude am Beruf, Kommunikationsfähigkeit und Kundenorientierung",
    ],
  },
  {
    weg: "kundendiensttechniker",
    titel: "Kundendiensttechniker (m/w/d)",
    art: "Fachkraft",
    beschaeftigung: "Vollzeit · unbefristet",
    anriss:
      "Sie fahren zu Anlagen, die laufen sollen. Wartung, Reparatur, Störungsbeseitigung — und die Einweisung der Kundschaft in die neue Anlage.",
    aufgaben: [
      "Wartung und Instandhaltung von Heizungsanlagen",
      "Reparatur und Störungsbeseitigung",
      "Einweisung der Kundinnen und Kunden in Funktion und Bedienung der neuen Heizungsanlage",
    ],
    profil: [
      "Abgeschlossene Berufsausbildung zum Anlagenmechaniker SHK",
      "Führerschein Klasse B",
      "Berufserfahrung im Heizungskundendienst ist von Vorteil",
      "Freude am Beruf, Kommunikationsfähigkeit und Kundenorientierung",
    ],
  },
  {
    weg: "ausbildung-anlagenmechaniker",
    titel: "Ausbildung Anlagenmechaniker SHK (m/w/d)",
    art: "Ausbildung",
    /* TODO: vom Kunden bestätigen — die alte Website nennt den 01.08.2026.
       Dieser Termin ist verstrichen; der nächste Ausbildungsbeginn ist offen. */
    beschaeftigung: "Ausbildung · Sanitär-, Heizungs- und Klimatechnik",
    anriss:
      "Ein Beruf, in dem man am Abend sieht, was man am Morgen angefangen hat. Vorab ist ein Praktikum möglich, damit Sie wissen, worauf Sie sich einlassen.",
    aufgaben: [
      "Heizungsanlagen einbauen und in Betrieb nehmen",
      "Bäder installieren — von der Rohleitung bis zur fertigen Armatur",
      "Schwimmbadtechnik aufbauen und anschließen",
    ],
    profil: [
      "Interesse an einem abwechslungsreichen, zukunftssicheren Beruf",
      "Spaß am Umgang mit Kundinnen und Kunden",
      "Teamfähigkeit",
    ],
  },
];

/** Arbeitgeberleistungen — die Liste steht so auf der Seite „Stellenangebote". */
export const leistungenArbeitgeber = [
  { punkt: "Unbefristeter Arbeitsvertrag", art: "Vertrag" },
  { punkt: "Übertarifliche Bezahlung", art: "Geld" },
  { punkt: "Sondergratifikation", art: "Geld" },
  { punkt: "Betriebliche Altersvorsorge", art: "Geld" },
  { punkt: "30 Tage Urlaub", art: "Zeit" },
  { punkt: "Freizeitausgleich von Überstunden", art: "Zeit" },
  { punkt: "Mit dem Firmenwagen zur Arbeit", art: "Alltag" },
  { punkt: "Kollegiales und freundschaftliches Arbeitsumfeld", art: "Team" },
  { punkt: "Flache Hierarchien und kurze Entscheidungswege", art: "Team" },
  { punkt: "Abwechslungsreiche Aufgaben, eigenverantwortliches Arbeiten", art: "Arbeit" },
];

/** Was die Ausbildung beantworten muss. */
export const ausbildungFragen = [
  {
    frage: "Was lerne ich?",
    antwort:
      "Anlagenmechaniker für Sanitär-, Heizungs- und Klimatechnik. Sie lernen, Heizungsanlagen einzubauen und in Betrieb zu nehmen, Bäder zu installieren und Schwimmbadtechnik anzuschließen. Rohre biegen und löten gehört genauso dazu wie das Lesen einer Anlagenzeichnung.",
  },
  {
    frage: "Wie sieht der Alltag aus?",
    antwort:
      "Nicht am Schreibtisch. Sie sind mit dem Team auf Baustellen und bei Kundinnen und Kunden im Haus, dazwischen in der Werkstatt und in der Ausstellung. Kein Tag ist wie der andere, weil kein Gebäude wie das andere ist.",
  },
  {
    frage: "Wer begleitet mich?",
    antwort:
      "Sie arbeiten von Anfang an im Team mit — bei einem Betrieb dieser Größe kennt man sich. Die Geschäftsführung ist im Haus und nicht in einer Zentrale.",
  },
  {
    frage: "Kann ich vorher ein Praktikum machen?",
    antwort:
      "Ja, ausdrücklich. Brouwer bietet ein Praktikum vorab an, damit Sie einen Einblick in den Beruf bekommen, bevor Sie sich für drei Jahre entscheiden. Melden Sie sich einfach telefonisch.",
  },
  {
    frage: "Was kommt nach der Ausbildung?",
    antwort:
      "Brouwer bietet die Chance auf Übernahme nach erfolgreichem Abschluss der Ausbildung.",
  },
];
