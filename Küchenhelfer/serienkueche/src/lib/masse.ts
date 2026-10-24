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
/**
 * Arbeitshöhe eines Küchentyps über Fertigfußboden.
 *
 * K-06 ist als barrierearmer Typ auf 850 mm festgelegt und blockiert dafür
 * sogar eine Freigabe ("Wirkt auf Anschlusshöhen und Nischenmaße"). Gezeichnet
 * und bemaßt wurde er trotzdem mit den 910 mm des Standards. Wer so ein
 * Datenblatt einmal gegen die Zeichnung hält, glaubt dem Werkzeug nichts mehr.
 *
 * Den Unterschied nimmt der Sockel auf: Korpus und Platte bleiben, was sie
 * sind, der Sockel wird niedriger. So baut man das auch.
 */
export function arbeitshoeheVon(typ: { attribute: Record<string, { wert: number }> }): number {
  return typ.attribute.arbeitshoehe?.wert ?? AP_OK;
}

/** Sockelhöhe, die zu einer Arbeitshöhe gehört. */
export function sockelZu(apOk: number): number {
  return apOk - KORPUS - PLATTE;
}

/** Unterkante Dunstesse über dem Kochfeld. Stand zweimal als 1540 im Code
    und einmal als 1460 in den Unterlagen — auf demselben Blatt. */
export const HAUBE_UK = 1540;
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
