/**
 * Datierte Rechtsfakten. Eine Quelle fuer Logik und Text, damit im Produkt
 * nichts behauptet wird, was nicht belegt ist.
 *
 * Grundlage der mit "wortlaut: true" gekennzeichneten Saetze ist der
 * Kabinettsentwurf des Pflegeneuordnungsgesetzes vom 30. September 2026
 * (BMG, "Kabinett-GE_Pflegeneuordnungsgesetz_PNOG.pdf"), Artikel 1 Nummer 86.
 * Die Saetze sind daraus unveraendert uebernommen, nur Trennstriche des
 * Satzspiegels wurden entfernt. Alles ohne "wortlaut" ist Zusammenfassung.
 */

export const STICHTAG = "2026-12-31";
export const INKRAFTTRETEN = "2027-01-01";

export type Faktum = {
  satz: string;
  fundstelle: string;
  /** true nur, wenn der Satz woertlich so im Entwurf steht. */
  wortlaut?: true;
};

export const FAKTEN: Record<string, Faktum> = {
  antragstagEntscheidet: {
    satz:
      "Die Feststellung des Vorliegens von Pflegebedürftigkeit erfolgt jeweils auf der " +
      "Grundlage des zum Zeitpunkt der Antragstellung geltenden Rechts; im Fall von " +
      "Wiederholungsbegutachtungen ist der Tag der Begutachtung maßgeblich.",
    fundstelle: "§ 142b Abs. 1 SGB XI in der Fassung des Kabinettsentwurfs (PNOG)",
    wortlaut: true,
  },
  bestandsschutz: {
    satz:
      "Die Zuordnung zu den Pflegegraden nach dem bis zum 31. Dezember 2026 geltenden " +
      "Recht bleibt bis zur Vornahme einer Neubegutachtung und der nachfolgenden " +
      "Einstufung durch die Pflegekasse bestehen; diese Einstufung kann nicht zu dem " +
      "Verlust des bestehenden Pflegegrades allein aufgrund der Anpassung der " +
      "Schwellenwerte nach § 15 Absatz 3 Satz 4 und Absatz 7 und der " +
      "Bewertungssystematik in Anlage 2 führen.",
    fundstelle: "§ 142b Abs. 2 SGB XI in der Fassung des Kabinettsentwurfs",
    wortlaut: true,
  },
  fristAusgesetzt: {
    satz:
      "Die Frist nach § 18c Absatz 1 Satz 1 ist vom 1. Januar 2027 bis zum 30. April 2027 " +
      "unbeachtlich. Abweichend davon ist denjenigen Antragstellerinnen und Antragstellern, " +
      "bei denen ein besonders dringlicher Entscheidungsbedarf vorliegt, spätestens " +
      "25 Arbeitstage nach Eingang des Antrags bei der zuständigen Pflegekasse die " +
      "Entscheidung der Pflegekasse schriftlich mitzuteilen.",
    fundstelle: "§ 142b Abs. 3 SGB XI in der Fassung des Kabinettsentwurfs",
    wortlaut: true,
  },

  // --- Zusammenfassungen, kein Wortlaut ---
  wiederholung: {
    satz:
      "Wer schon einen Pflegegrad hat und zur Wiederholungsbegutachtung geladen wird, " +
      "wird nach dem Recht vom Tag der Begutachtung bewertet. Für diese Gruppe nützt " +
      "ein früherer Antrag nichts – sie schützt stattdessen Absatz 2.",
    fundstelle: "§ 142b Abs. 1 Halbsatz 2 SGB XI in der Fassung des Kabinettsentwurfs",
  },
  schwellen: {
    satz:
      "Die Schwellenwerte steigen für die Pflegegrade 1 bis 3 von 12,5, 27 und 47,5 auf " +
      "15, 30 und 50 Punkte. Für die Pflegegrade 4 und 5 bleiben 70 und 90 Punkte.",
    fundstelle: "§ 15 Abs. 3 SGB XI in der Fassung des Kabinettsentwurfs, Artikel 1 Nr. 16",
  },
  intervalle: {
    satz:
      "In den Modulen 1, 4 und 6 verschieben sich zusätzlich die Punktspannen der " +
      "Schweregrade. Dieselben Einzelpunkte ergeben dort künftig eine niedrigere Stufe.",
    fundstelle: "Anlage 2 zu § 15 SGB XI in der Fassung des Kabinettsentwurfs",
  },
  wirkung: {
    satz:
      "Wendet man die neuen Werte auf das heutige Versichertenkollektiv an, sinkt die Zahl " +
      "der anerkannten Erstbegutachtungen um etwa 22 Prozent – bei den Schwellenwerten " +
      "allein um knapp 12 Prozent, mit den verschobenen Intervallgrenzen in den Modulen 1, " +
      "4 und 6 um etwa 22 Prozent. Beides setzt das Gesetz um, deshalb gilt die größere Zahl.",
    fundstelle:
      "Begründung zum Kabinettsentwurf, zu Nummer 16 (§ 15), nach dem Abschlussbericht " +
      "des IGES-Instituts vom April 2026",
  },
  ablehnungen: {
    satz:
      "2024 führten rund 18 Prozent der Erstbegutachtungen zu keiner Pflegebedürftigkeit.",
    fundstelle:
      "Begründung zum Kabinettsentwurf, zu Nummer 18 (§ 18), nach Auswertungen des " +
      "Medizinischen Dienst Bund",
  },
  entlastungsbetrag: {
    satz:
      "Der Entlastungsbetrag für Pflegegrad 1 wird gestrichen. An seine Stelle tritt keine " +
      "Geldleistung: Pflegegrad 1 behält den Anspruch auf Beratungseinsätze nach § 37 Abs. 3, " +
      "die neue Pflegebegleitung nach § 7c kommt erst zum 1. Januar 2029. Wer den Zuschuss " +
      "bei vollstationärer Pflege heute schon bezieht, behält ihn (Besitzstandsschutz).",
    fundstelle: "Begründung zum Kabinettsentwurf, Abschnitt zur Streichung des Entlastungsbetrags",
  },
  pflegegrad1Zahl: {
    satz: "860.877 Menschen beziehen ambulante Leistungen in Pflegegrad 1.",
    fundstelle: "Begründung zum Kabinettsentwurf, Kostenabschnitt zu § 37 Abs. 3",
  },
  ueberbrueckung: {
    satz:
      "Die Verhinderungspflege nach § 39 wird durch ein Überbrückungsbudget ersetzt: " +
      "bis zu 2.285 Euro im Kalenderjahr für Pflegegrade 2 bis 5, zweckgebunden für einen " +
      "ambulanten Notdienst oder Kurzzeitpflege. Eine Ersatzpflege durch Angehörige wird " +
      "daraus nicht mehr bezahlt.",
    fundstelle: "§ 39 SGB XI in der Fassung des Kabinettsentwurfs, Artikel 1 Nr. 32",
  },
  verhinderungHeute: {
    satz:
      "Heute zahlt die Kasse für eine Ersatzpflege durch nahe Angehörige, die nicht " +
      "erwerbsmäßig pflegen, regelmäßig höchstens das Pflegegeld für zwei Monate, auf " +
      "Nachweis zusätzlich deren Aufwendungen. Den vollen gemeinsamen Jahresbetrag von " +
      "3.539 Euro gibt es nur bei einem Pflegedienst oder einer fremden Ersatzpflegeperson.",
    fundstelle: "§ 39 Abs. 2 und 3 SGB XI, geltende Fassung",
  },
  verfahren: {
    satz:
      "Das Kabinett hat den Entwurf am 30. September 2026 beschlossen. Bundestag und " +
      "Bundesrat haben noch nicht entschieden, Schwellenwerte und Stichtag können sich " +
      "im Verfahren noch ändern.",
    fundstelle: "Stand 2. November 2026",
  },
};

/**
 * Volle Kalendertage bis zum Stichtag. Der Stichtag selbst zaehlt noch mit,
 * deshalb ist das Ergebnis am 31. Dezember 2026 null und nicht negativ - und
 * stichtagVorbei() ist an diesem Tag noch false.
 */
export function tageBisStichtag(heute: Date = new Date()): number {
  const [j, m, t] = STICHTAG.split("-").map(Number);
  const ziel = new Date(j, m - 1, t);
  const start = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate());
  return Math.max(0, Math.round((ziel.getTime() - start.getTime()) / 86_400_000));
}

/** Erst ab dem 1. Januar 2027 ist der Stichtag vorbei. */
export function stichtagVorbei(heute: Date = new Date()): boolean {
  const [j, m, t] = STICHTAG.split("-").map(Number);
  const ziel = new Date(j, m - 1, t);
  const start = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate());
  return start.getTime() > ziel.getTime();
}
