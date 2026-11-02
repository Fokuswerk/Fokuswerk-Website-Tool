import { KRITERIEN, MODUL_NAMEN, berechne, type Antworten, type Ergebnis, type Rechtsstand } from "./nba.ts";

/**
 * Macht aus einem Ergebnis einen Plan.
 *
 * Der Unterschied zu einer Zahl: Das Ergebnis sagt, wo jemand steht. Der Plan
 * sagt, was das heisst und was als Naechstes zu tun ist — und zwar für diesen
 * Fall, nicht allgemein.
 */

export type Hebel = {
  id: string;
  modul: number;
  modulName: string;
  titel: string;
  hilfe: string;
  /** Was heute angekreuzt ist. */
  jetzt: string;
  /** Was eine Stufe darueber stuende. */
  naechste: string;
  /** Wie viele gewichtete Gesamtpunkte das brächte. */
  gewinn: number;
  /**
   * Ob hier eine Einschätzung geprüft wird oder eine Tatsache.
   *
   * Der Unterschied ist für den Leser wesentlich: "Hilfe beim Aufstehen" kann
   * man für selbstverständlich gehalten und deshalb zu niedrig angegeben
   * haben. Ob jemand über eine Sonde ernährt wird, weiss man dagegen. Beide
   * sind Hebel, aber die Aufforderung dazu muss eine andere sein.
   */
  art: "einschaetzung" | "tatsache";
};

/**
 * Kriterien, deren Antwortskala eine medizinische Gegebenheit beschreibt und
 * keinen Grad an Selbständigkeit. In Anlage 1 ist das genau eines — 4.13,
 * Ernährung über Sonde. Eine allgemeine Regel fuer einen Einzelfall waere
 * mehr Mechanik als Nutzen, deshalb steht es hier namentlich.
 */
const TATSACHEN = new Set(["4.13"]);

/**
 * Welche einzelnen Kriterien das Gesamtergebnis überhaupt bewegen.
 *
 * Das ist der Punkt, an dem die meisten Rechner schweigen: Zwischen
 * Einzelpunkten und gewichteten Punkten liegen zwei Übersetzungstabellen, und
 * durch die fällt der grösste Teil einer Änderung heraus. Bei welchem Kriterium
 * eine Stufe mehr tatsächlich etwas ändert, lässt sich nicht erraten — es muss
 * durchgerechnet werden. Genau das passiert hier, einmal je Kriterium.
 *
 * Wichtig für die Darstellung: Das ist **keine** Aufforderung, höher
 * anzukreuzen. Es ist die Liste der Stellen, an denen sich ein genauer
 * Hinsehen lohnt, weil dort überhaupt etwas davon abhängt.
 */
export function hebel(a: Antworten, rechtsstand: Rechtsstand, hoechstens = 4): Hebel[] {
  const basis = berechne(a, rechtsstand).gesamtpunkte;
  const gefunden: Hebel[] = [];

  for (const k of KRITERIEN) {
    // Das interne Tor zur Inkontinenz ist kein Kriterium der Anlage 1.
    if (!/^[1-6]\.\d+$/.test(k.id)) continue;

    const jetzt = a[k.id];
    if (jetzt === undefined) continue;
    if (jetzt >= k.optionen.length - 1) continue;

    const probe = { ...a, [k.id]: jetzt + 1 };
    const gewinn = berechne(probe, rechtsstand).gesamtpunkte - basis;
    if (gewinn <= 0) continue;

    gefunden.push({
      id: k.id,
      modul: k.modul,
      modulName: MODUL_NAMEN[k.modul as 1 | 2 | 3 | 4 | 5 | 6],
      titel: k.titel,
      hilfe: k.hilfe,
      jetzt: k.optionen[jetzt],
      naechste: k.optionen[jetzt + 1],
      gewinn,
      art: TATSACHEN.has(k.id) ? "tatsache" : "einschaetzung",
    });
  }

  // Einschaetzungen zuerst - das sind die Stellen, an denen ein zweiter Blick
  // etwas finden kann. Tatsachen danach, auch wenn ihr Hebel groesser ist:
  // "Haben Sie die Sondenernaehrung vergessen?" ist keine sinnvolle erste
  // Frage. Innerhalb beider Gruppen der groesste Hebel zuerst, bei Gleichstand
  // das niedrigere Modul, damit die Reihenfolge stabil bleibt.
  const rang = (h: Hebel) => (h.art === "einschaetzung" ? 0 : 1);
  gefunden.sort(
    (x, y) => rang(x) - rang(y) || y.gewinn - x.gewinn || x.modul - y.modul || (x.id < y.id ? -1 : 1),
  );
  return gefunden.slice(0, hoechstens);
}

export type Schritt = {
  nummer: number;
  titel: string;
  text: string;
  wann: string;
  ziel?: { text: string; pfad: string };
};

/**
 * Die Schritte, in der Reihenfolge, in der sie zu tun sind.
 *
 * Der Antrag steht bewusst vorn und nicht hinten: Massgeblich ist das Recht am
 * Tag, an dem er bei der Kasse eingeht (§ 142b des Entwurfs). Alles andere —
 * Unterlagen, Begründung, Vorbereitung — kann danach kommen. Wer erst alles
 * sammelt und dann beantragt, verschenkt genau das.
 */
export function schritte(
  ergebnis: Ergebnis,
  offeneHebel: Hebel[],
  tageBisStichtag: number,
): Schritt[] {
  const liste: Schritt[] = [];
  let n = 0;

  liste.push({
    nummer: ++n,
    titel: "Antrag stellen — heute",
    text:
      "Ein Satz an die Pflegekasse genügt, Begründung und Unterlagen kommen später. " +
      "Gezählt wird das Recht am Tag des Eingangs, nicht am Tag des Bescheids. " +
      (tageBisStichtag > 0
        ? `Bis zum 31. Dezember gelten die heutigen Punktgrenzen — das sind noch ${tageBisStichtag} Tage.`
        : "Seit dem 1. Januar gelten die neuen Punktgrenzen."),
    wann: "sofort",
    ziel: { text: "Antragstext zum Kopieren", pfad: "/antrag" },
  });

  if (offeneHebel.length > 0) {
    liste.push({
      nummer: ++n,
      titel: "Diese Kriterien noch einmal in Ruhe durchgehen",
      text:
        `Bei ${offeneHebel.length === 1 ? "diesem Punkt" : `diesen ${offeneHebel.length} Punkten`} ` +
        "hängt am Ergebnis wirklich etwas. Überall sonst ändert eine Stufe mehr oder weniger " +
        "nichts an der Gesamtpunktzahl. Es geht nicht darum, mehr anzukreuzen — sondern " +
        "darum, genau hinzusehen, wo es zählt.",
      wann: "vor dem Termin",
    });
  }

  liste.push({
    nummer: ++n,
    titel: "Eine Woche mitschreiben",
    text:
      "Notieren Sie eine Woche lang, wobei Sie helfen und wie oft. Diese Liste ist im " +
      "Begutachtungsgespräch mehr wert als jede Erinnerung — besonders bei allem, was " +
      "mehrmals täglich vorkommt.",
    wann: "vor dem Termin",
    ziel: { text: "Begutachtungsmappe ansehen", pfad: "/mappe" },
  });

  liste.push({
    nummer: ++n,
    titel: "Beim Termin dabei sein",
    text:
      "Die Begutachtung dauert etwa eine Stunde. Was dort nicht zur Sprache kommt, steht " +
      "später nicht im Bescheid. Schildern Sie einen durchschnittlichen Tag, nicht einen guten.",
    wann: "am Termin",
  });

  liste.push({
    nummer: ++n,
    titel: "Den Bescheid nachrechnen",
    text:
      "Im Bescheid stehen die Punkte je Modul. Tragen Sie sie ein — dann sehen Sie, wo das " +
      "Gutachten von Ihrer eigenen Einschätzung abweicht und ob ein Widerspruch lohnt. " +
      "Die Frist dafür beträgt einen Monat ab Bekanntgabe.",
    wann: "wenn der Bescheid kommt",
    ziel: { text: "Bescheid prüfen", pfad: "/bescheid" },
  });

  return liste;
}

/** Wie viele Punkte bis zur nächsten Stufe fehlen, als lesbarer Satz. */
export function abstandSatz(e: Ergebnis): string | null {
  if (e.bisNaechsteStufe === null || e.naechsteStufe === null) return null;
  const p = e.bisNaechsteStufe.toLocaleString("de-DE", { maximumFractionDigits: 2 });
  return `Es fehlen ${p} Punkte bis Pflegegrad ${e.naechsteStufe}.`;
}
