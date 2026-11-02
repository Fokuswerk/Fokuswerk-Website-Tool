import { BETRAEGE_2027 } from "./leistungen.ts";

/**
 * Was am Antragstag hängt — und was nicht.
 *
 * Der Punkt, an dem fast jede Darstellung dieses Themas schummelt: **Die
 * Geldbeträge hängen nicht am Antragstag.** Ab Januar 2027 gelten die neuen
 * Sätze für alle. Was am Antragstag hängt, ist allein die Frage, nach welchen
 * Schwellenwerten begutachtet wird — und damit, welcher Pflegegrad
 * herauskommt. Der bleibt dann (§ 142b Abs. 2 des Entwurfs).
 *
 * Daraus folgt die ehrliche Rechnung: Der Unterschied ist die Differenz
 * zwischen zwei Pflegegraden, bewertet mit den Sätzen, die ab 2027 für beide
 * gelten. Nicht die Differenz zwischen altem und neuem Satz.
 */

export type Stichtagslage = {
  /** Pflegegrad bei Antrag bis 31.12.2026 */
  frueh: number;
  /** Pflegegrad bei Antrag ab 1.1.2027 */
  spaet: number;
  /** Ändert der Antragstag überhaupt etwas am Pflegegrad? */
  machtUnterschied: boolean;
  /** Differenz im Pflegegeld je Monat, beide nach den Sätzen ab 2027. */
  proMonat: number;
  /** Dieselbe Differenz über fünf Jahre. */
  fuenfJahre: number;
  /**
   * Wenn der Pflegegrad sich unterscheidet, das Geld aber nicht. Tritt bei
   * Pflegegrad 1 gegen keinen Pflegegrad ein: beide bekommen nach dem Entwurf
   * kein Geld, der Unterschied liegt in den Sachleistungen.
   */
  nurSachleistung: boolean;
};

function pflegegeld2027(grad: number): number {
  if (grad < 1 || grad > 5) return 0;
  return BETRAEGE_2027.pflegegeld[grad - 1];
}

export function stichtagslage(frueh: number, spaet: number): Stichtagslage {
  const machtUnterschied = frueh !== spaet;
  const proMonat = pflegegeld2027(frueh) - pflegegeld2027(spaet);
  return {
    frueh,
    spaet,
    machtUnterschied,
    proMonat,
    fuenfJahre: proMonat * 60,
    nurSachleistung: machtUnterschied && proMonat === 0,
  };
}

/**
 * Was Pflegegrad 1 wert ist, wenn kein Geld fliesst. Steht im Entwurf nicht
 * als Betrag, ist aber der ganze Unterschied zwischen "Pflegegrad 1" und
 * "kein Pflegegrad" — deshalb muss es benannt werden, sonst liest sich eine
 * Null wie "egal".
 */
export const OHNE_GELD_TROTZDEM = [
  "Beratungseinsätze nach § 37 Abs. 3 SGB XI",
  "Pflegehilfsmittel und Hausnotruf",
  "Zuschuss für wohnumfeldverbessernde Maßnahmen, je Maßnahme bis 4.180 Euro",
  "Pflegekurse für Angehörige",
];
