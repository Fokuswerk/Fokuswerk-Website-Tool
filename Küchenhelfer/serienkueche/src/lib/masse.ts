import { modul } from "@/data/module";

/**
 * Die Höhen und Tiefen einer Küche an einer Stelle.
 *
 * Die Ansicht von vorn und das räumliche Bild zeigen dieselbe Küche. Stünden
 * die Maße zweimal im Code, würden sie irgendwann auseinanderlaufen und die
 * beiden Bilder sich widersprechen.
 */

export const SOCKEL = 150;
export const KORPUS = 720;
/** Plattenstärke. Muss zum Artikel "Arbeitsplatte Schichtstoff 40 mm"
    im Katalog passen — sonst steht in der Stückliste 40 und im Zuschnitt 45. */
export const PLATTE = 40;
/** Oberkante Arbeitsplatte über Fertigfußboden. */
export const AP_OK = SOCKEL + KORPUS + PLATTE;
/** Unterkante Hängeschrank. */
export const OS_UK = 1460;
export const OS_H = 700;
/** Hochschränke schließen oben mit den Hängeschränken ab. */
export const HOCH_H = OS_UK + OS_H;
export const TIEFE_UNTEN = 600;
export const TIEFE_OBEN = 350;
export const RAUMHOEHE = 2600;

export type Rolle = "kuehlschrank" | "backofen" | "spuele" | "herd" | "spuelmaschine" | "schrank" | "leiste";

/**
 * Reicht der Schrank bis unter die Hängeschränke?
 *
 * Das war vorher als `rolle === "kuehlschrank" || rolle === "backofen"`
 * geschrieben — an vier Stellen, und jede davon meinte eigentlich "hoch".
 * Seit es einen Kühlschrank unter der Arbeitsplatte gibt, ist das falsch:
 * über dem liegt eine Platte und darüber hängt ein Schrank.
 */
export function istHoch(id: string): boolean {
  return modul(id).kategorie === "hochschrank";
}

export function rolleVon(id: string): Rolle {
  if (id === "HK600") return "kuehlschrank";
  if (id === "HB600") return "backofen";
  if (id === "SP600") return "spuele";
  if (id === "KF600") return "herd";
  if (id === "GS600" || id === "GS450") return "spuelmaschine";
  if (id === "KS600") return "kuehlschrank";
  if (modul(id).kategorie === "blende") return "leiste";
  return "schrank";
}

export const ROLLE_NAME: Record<Rolle, string> = {
  kuehlschrank: "Kühlschrank",
  backofen: "Backofen",
  spuele: "Spüle",
  herd: "Herd",
  spuelmaschine: "Spülmaschine",
  schrank: "Schrank",
  leiste: "",
};
