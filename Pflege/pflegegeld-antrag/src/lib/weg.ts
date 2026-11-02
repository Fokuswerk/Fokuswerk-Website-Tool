/**
 * Der Weg durch das Verfahren.
 *
 * Die Seite hat dreizehn Unterseiten und fühlte sich trotzdem wie eine an:
 * eine lange Scrollseite, die Werkzeuge im Fuß, und nirgends stand, wo man
 * gerade steht. Hier ist das Verfahren einmal als Kette von Stationen
 * aufgeschrieben — mit der Stelle, an der jemand gerade ist, dem, was hinter
 * ihm liegt, und dem einen nächsten Schritt.
 */

export type StationId =
  | "antrag"
  | "rechnen"
  | "vorbereiten"
  | "termin"
  | "bescheid"
  | "widerspruch";

export type Station = {
  id: StationId;
  titel: string;
  /** Was an dieser Station zu tun ist, in einem Satz. */
  text: string;
  /** Wie lange es dauert oder wie lange man wartet. */
  dauer: string;
  ziel?: { text: string; pfad: string };
};

export const STATIONEN: Station[] = [
  {
    id: "antrag",
    titel: "Antrag stellen",
    text:
      "Ein Satz an die Pflegekasse genügt. Maßgeblich ist das Recht an dem Tag, an dem er " +
      "eingeht – nicht am Tag des Bescheids. Begründung und Unterlagen kommen später.",
    dauer: "fünf Minuten",
    ziel: { text: "Antragstext zum Kopieren", pfad: "/antrag" },
  },
  {
    id: "rechnen",
    titel: "Punkte selbst ausrechnen",
    text:
      "Alle 64 Kriterien durchgehen, nach heutigem Recht und nach dem Entwurf. Danach wissen " +
      "Sie, womit zu rechnen ist – und an welchen Stellen bei Ihnen überhaupt etwas hängt.",
    dauer: "zehn bis fünfzehn Minuten",
    ziel: { text: "Punkterechner öffnen", pfad: "/check" },
  },
  {
    id: "vorbereiten",
    titel: "Begutachtung vorbereiten",
    text:
      "Eine Woche mitschreiben, wobei Sie helfen und wie oft. Was im Gespräch nicht zur " +
      "Sprache kommt, steht später nicht im Bescheid.",
    dauer: "eine Woche nebenher",
    ziel: { text: "Begutachtungsmappe", pfad: "/mappe" },
  },
  {
    id: "termin",
    titel: "Der Begutachtungstermin",
    text:
      "Etwa eine Stunde am Küchentisch. Schildern Sie einen durchschnittlichen Tag, nicht " +
      "einen guten. Seien Sie dabei, wenn Sie können.",
    dauer: "eine Stunde",
  },
  {
    id: "bescheid",
    titel: "Bescheid prüfen",
    text:
      "Im Bescheid stehen die Punkte je Modul. Tragen Sie sie ein – dann sehen Sie, wo das " +
      "Gutachten von Ihrer eigenen Einschätzung abweicht.",
    dauer: "fünf Minuten",
    ziel: { text: "Bescheid prüfen", pfad: "/bescheid" },
  },
  {
    id: "widerspruch",
    titel: "Widerspruch – falls nötig",
    text:
      "Nur wenn die Punkte nicht stimmen. Die Frist beträgt einen Monat ab Bekanntgabe des " +
      "Bescheids, und sie läuft, auch wenn Sie noch auf das Gutachten warten.",
    dauer: "ein Monat Frist",
    ziel: { text: "Was dabei gilt", pfad: "/widerspruch" },
  },
];

export type LageId = "noch-nichts" | "antrag-laeuft" | "termin-war" | "bescheid-da" | "hoeherstufung";

export type Lage = {
  id: LageId;
  frage: string;
  /** Bei welcher Station steht jemand in dieser Lage. */
  steht: StationId;
  /**
   * Was in dieser Lage am meisten drängt — steht über dem Weg, bevor die
   * Stationen kommen.
   */
  dringend: string;
  /** Stationen, die in dieser Lage übersprungen werden. */
  entfaellt?: StationId[];
};

export const LAGEN: Lage[] = [
  {
    id: "noch-nichts",
    frage: "Wir haben noch keinen Antrag gestellt",
    steht: "antrag",
    dringend:
      "Dann ist der Antrag das Dringendste, nicht die Vorbereitung. Er legt fest, nach welchem " +
      "Recht bewertet wird, und das lässt sich später nicht nachholen.",
  },
  {
    id: "antrag-laeuft",
    frage: "Der Antrag ist raus, der Termin steht noch aus",
    steht: "rechnen",
    dringend:
      "Das Wichtigste ist getan. Jetzt zählt, dass im Gespräch nichts untergeht – rechnen Sie " +
      "vorher aus, womit zu rechnen ist, und schreiben Sie eine Woche mit.",
    entfaellt: ["antrag"],
  },
  {
    id: "termin-war",
    frage: "Die Begutachtung war, wir warten auf den Bescheid",
    steht: "bescheid",
    dringend:
      "Rechnen Sie jetzt selbst nach, solange Sie den Tag noch im Kopf haben. Dann können Sie " +
      "den Bescheid sofort einordnen, wenn er kommt – und die Widerspruchsfrist läuft ab " +
      "Bekanntgabe, nicht ab Ihrem Lesen.",
    entfaellt: ["antrag", "vorbereiten", "termin"],
  },
  {
    id: "bescheid-da",
    frage: "Der Bescheid ist da",
    steht: "bescheid",
    dringend:
      "Zuerst das Datum der Bekanntgabe notieren: Ab da läuft ein Monat für den Widerspruch. " +
      "Dann die Punkte aus dem Bescheid eintragen und mit Ihrer eigenen Rechnung vergleichen.",
    entfaellt: ["antrag", "vorbereiten", "termin"],
  },
  {
    id: "hoeherstufung",
    frage: "Es gibt schon einen Pflegegrad, aber der Zustand hat sich verschlechtert",
    steht: "antrag",
    dringend:
      "Eine Höherstufung ist ein neuer Antrag und folgt demselben Weg. Auch hier zählt der Tag " +
      "des Eingangs – und bei einer Wiederholungsbegutachtung ab 2027 sogar der Tag des Termins.",
  },
];

export type Abschnitt = {
  station: Station;
  /** erledigt, hier, kommt noch */
  stand: "erledigt" | "hier" | "offen";
};

/** Der Weg für eine Lage: welche Station erledigt ist, wo es steht, was folgt. */
export function wegFuer(lage: Lage): Abschnitt[] {
  const entfaellt = new Set(lage.entfaellt ?? []);
  const hierIndex = STATIONEN.findIndex((s) => s.id === lage.steht);

  return STATIONEN.map((station, i) => ({
    station,
    stand: entfaellt.has(station.id) || i < hierIndex ? "erledigt" : i === hierIndex ? "hier" : "offen",
  }));
}

/** Die eine Station, auf die es gerade ankommt. */
export function naechsteStation(lage: Lage): Station {
  return STATIONEN.find((s) => s.id === lage.steht) ?? STATIONEN[0];
}

export function lageFinden(id: string | null | undefined): Lage | null {
  return LAGEN.find((l) => l.id === id) ?? null;
}
