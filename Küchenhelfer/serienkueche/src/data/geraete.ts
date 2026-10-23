/**
 * Geräte, die man einzeln auswählt. Bewusst wenige Optionen je Art — wer
 * zum ersten Mal plant, soll entscheiden können, nicht vergleichen müssen.
 * Preise sind Aufschläge gegenüber der einfachsten Variante, in EUR netto.
 */

export interface Geraet {
  id: string;
  art: GeraeteArt;
  name: string;
  satz: string;
  aufpreis: number;
  /** Breite des Korpus, den das Gerät belegt. 0 = belegt keinen eigenen Platz. */
  breite: number;
}

export type GeraeteArt = "kuehlschrank" | "kochfeld" | "backofen" | "spuelmaschine" | "dunstabzug";

export const GERAETE: Geraet[] = [
  // Kühlschrank
  { id: "kuehl-gross", art: "kuehlschrank", name: "Großer Einbaukühlschrank", satz: "178 cm hoch, mit Gefrierfach. Nimmt 60 cm Wand über die ganze Höhe.", aufpreis: 180, breite: 600 },
  { id: "kuehl-klein", art: "kuehlschrank", name: "Kühlschrank unter der Platte", satz: "88 cm hoch. Die Arbeitsfläche läuft durch.", aufpreis: 0, breite: 600 },
  { id: "kuehl-keiner", art: "kuehlschrank", name: "Keiner", satz: "Du bringst deinen eigenen mit.", aufpreis: -240, breite: 0 },

  // Kochfeld
  { id: "kf-ceran", art: "kochfeld", name: "Ceranfeld", satz: "Der Klassiker. Günstig, gut zu reinigen.", aufpreis: 0, breite: 600 },
  { id: "kf-induktion", art: "kochfeld", name: "Induktion", satz: "Schneller heiß, spart Strom, kühlt rasch ab.", aufpreis: 290, breite: 600 },
  { id: "kf-gas", art: "kochfeld", name: "Gas", satz: "Nur wenn ein Gasanschluss vorhanden ist.", aufpreis: 150, breite: 600 },

  // Backofen
  { id: "ofen-unten", art: "backofen", name: "Backofen unter dem Kochfeld", satz: "Der übliche Weg. Spart 60 cm Wand.", aufpreis: 0, breite: 0 },
  { id: "ofen-hoch", art: "backofen", name: "Backofen auf Griffhöhe", satz: "Rückenschonend. Braucht 60 cm Wand über die ganze Höhe.", aufpreis: 160, breite: 600 },
  { id: "ofen-dampf", art: "backofen", name: "Backofen mit Dampf, auf Griffhöhe", satz: "Dampfgaren zusätzlich. Braucht ebenfalls 60 cm.", aufpreis: 540, breite: 600 },

  // Spülmaschine
  { id: "gs-60", art: "spuelmaschine", name: "Spülmaschine 60 cm", satz: "Die normale Größe, 13 bis 14 Gedecke.", aufpreis: 0, breite: 600 },
  { id: "gs-45", art: "spuelmaschine", name: "Schmale Spülmaschine 45 cm", satz: "Spart 15 cm Wand, fasst etwa 9 Gedecke.", aufpreis: -40, breite: 450 },
  { id: "gs-keine", art: "spuelmaschine", name: "Keine", satz: "Dafür 60 cm mehr Stauraum.", aufpreis: -290, breite: 0 },

  // Dunstabzug
  { id: "da-esse", art: "dunstabzug", name: "Dunstesse über dem Herd", satz: "Sichtbar an der Wand, kräftig.", aufpreis: 0, breite: 0 },
  { id: "da-flach", art: "dunstabzug", name: "Flachschirm im Hängeschrank", satz: "Verschwindet im Schrank, leiser.", aufpreis: 170, breite: 0 },
  { id: "da-keiner", art: "dunstabzug", name: "Keiner", satz: "Nur sinnvoll, wenn gut gelüftet werden kann.", aufpreis: -210, breite: 0 },
];

export const ARTEN: Array<{ art: GeraeteArt; frage: string; hilfe: string }> = [
  { art: "kuehlschrank", frage: "Welchen Kühlschrank?", hilfe: "Ein hoher Kühlschrank nimmt 60 cm Wand über die ganze Höhe — dort gibt es dann keine Arbeitsfläche." },
  { art: "kochfeld", frage: "Worauf kochst du?", hilfe: "Alle drei brauchen gleich viel Platz, der Unterschied liegt in Technik und Preis." },
  { art: "backofen", frage: "Wo soll der Backofen hin?", hilfe: "Auf Griffhöhe musst du dich nicht bücken, das kostet aber 60 cm Wand." },
  { art: "spuelmaschine", frage: "Spülmaschine?", hilfe: "Sie steht am besten direkt neben der Spüle — dann teilen sich beide den Anschluss." },
  { art: "dunstabzug", frage: "Und der Dunstabzug?", hilfe: "Er hängt über dem Herd und braucht keinen eigenen Platz an der Wand." },
];

const INDEX = new Map(GERAETE.map((g) => [g.id, g]));

export function geraet(id: string): Geraet {
  const g = INDEX.get(id);
  if (!g) throw new Error(`Unbekanntes Gerät: ${id}`);
  return g;
}

export function geraeteFuer(art: GeraeteArt): Geraet[] {
  return GERAETE.filter((g) => g.art === art);
}

export type Geraetewahl = Record<GeraeteArt, string>;

export const STANDARD_GERAETE: Geraetewahl = {
  kuehlschrank: "kuehl-gross",
  kochfeld: "kf-ceran",
  backofen: "ofen-unten",
  spuelmaschine: "gs-60",
  dunstabzug: "da-esse",
};
