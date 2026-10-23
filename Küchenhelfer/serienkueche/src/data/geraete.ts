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
  /** Ausstattungsklasse, nach der im Katalog sortiert wird. */
  klasse?: "Basis" | "Komfort" | "Premium";
  /** Technische Daten, Bezeichnung und Wert. Stehen am Gerät selbst. */
  daten?: Array<[string, string]>;
}

export type GeraeteArt = "kuehlschrank" | "kochfeld" | "backofen" | "spuelmaschine" | "dunstabzug";

export const GERAETE: Geraet[] = [
  // Kühlschrank
  { id: "kuehl-klein", art: "kuehlschrank", name: "Unterbaukühlschrank", klasse: "Basis",
    satz: "88 cm hoch, die Arbeitsfläche läuft darüber durch.",
    daten: [["Nutzinhalt", "134 l"], ["Gefrierfach", "15 l"], ["Energie", "E"], ["Geräusch", "38 dB"]],
    aufpreis: 0, breite: 600 },
  { id: "kuehl-gross", art: "kuehlschrank", name: "Einbaukühlschrank 178 cm", klasse: "Komfort",
    satz: "Voller Schrank mit getrenntem Gefrierteil.",
    daten: [["Nutzinhalt", "254 l"], ["Gefrierteil", "75 l"], ["Energie", "D"], ["Geräusch", "35 dB"]],
    aufpreis: 180, breite: 600 },
  { id: "kuehl-nofrost", art: "kuehlschrank", name: "Einbaukühlschrank mit NoFrost", klasse: "Premium",
    satz: "Taut sich selbst ab, Frischefach mit eigener Klimazone.",
    daten: [["Nutzinhalt", "248 l"], ["Gefrierteil", "72 l"], ["Energie", "C"], ["Geräusch", "33 dB"]],
    aufpreis: 540, breite: 600 },
  { id: "kuehl-keiner", art: "kuehlschrank", name: "Keiner", satz: "Du bringst deinen eigenen mit.", aufpreis: -240, breite: 0 },

  // Kochfeld
  { id: "kf-ceran", art: "kochfeld", name: "Ceranfeld", klasse: "Basis",
    satz: "Der Klassiker. Günstig und gut zu reinigen.",
    daten: [["Kochzonen", "4"], ["Zweikreiszone", "ja"], ["Anschluss", "400 V"], ["Restwärme", "Anzeige"]],
    aufpreis: 0, breite: 600 },
  { id: "kf-induktion", art: "kochfeld", name: "Induktion", klasse: "Komfort",
    satz: "Schneller heiß, spart Strom, kühlt rasch ab.",
    daten: [["Kochzonen", "4"], ["Ankochautomatik", "ja"], ["Anschluss", "400 V"], ["Kindersicherung", "ja"]],
    aufpreis: 290, breite: 600 },
  { id: "kf-flex", art: "kochfeld", name: "Induktion mit Flächenzone", klasse: "Premium",
    satz: "Zwei Zonen lassen sich zu einer großen verbinden — für Bräter und Grillplatte.",
    daten: [["Kochzonen", "4, 2 koppelbar"], ["Bratsensor", "ja"], ["Anschluss", "400 V"], ["Timer", "je Zone"]],
    aufpreis: 620, breite: 600 },
  { id: "kf-gas", art: "kochfeld", name: "Gas", klasse: "Komfort",
    satz: "Nur wenn ein Gasanschluss vorhanden ist.",
    daten: [["Brenner", "4"], ["Wok-Brenner", "ja"], ["Zündsicherung", "ja"], ["Rost", "Gusseisen"]],
    aufpreis: 150, breite: 600 },

  // Backofen
  { id: "ofen-unten", art: "backofen", name: "Backofen unter dem Kochfeld", klasse: "Basis",
    satz: "Der übliche Weg. Spart 60 cm Wand.",
    daten: [["Garraum", "71 l"], ["Beheizung", "Umluft, O/U"], ["Reinigung", "Emaille"], ["Energie", "A"]],
    aufpreis: 0, breite: 0 },
  { id: "ofen-hoch", art: "backofen", name: "Backofen auf Griffhöhe", klasse: "Komfort",
    satz: "Rückenschonend. Braucht 60 cm Wand über die ganze Höhe.",
    daten: [["Garraum", "71 l"], ["Beheizung", "Umluft, Grill"], ["Reinigung", "Pyrolyse"], ["Energie", "A+"]],
    aufpreis: 160, breite: 600 },
  { id: "ofen-dampf", art: "backofen", name: "Backofen mit Dampf", klasse: "Premium",
    satz: "Dampfgaren zusätzlich, auf Griffhöhe. Braucht ebenfalls 60 cm.",
    daten: [["Garraum", "71 l"], ["Dampf", "zuschaltbar"], ["Reinigung", "Pyrolyse"], ["Kerntemperatur", "Fühler"]],
    aufpreis: 540, breite: 600 },
  { id: "ofen-keiner", art: "backofen", name: "Keiner", satz: "Nur Kochfeld, kein Ofen.", aufpreis: -380, breite: 0 },

  // Spülmaschine
  { id: "gs-45", art: "spuelmaschine", name: "Spülmaschine 45 cm", klasse: "Basis",
    satz: "Spart 15 cm Wand. Für ein bis zwei Personen.",
    daten: [["Gedecke", "9"], ["Geräusch", "47 dB"], ["Energie", "E"], ["Programme", "5"]],
    aufpreis: -40, breite: 450 },
  { id: "gs-60", art: "spuelmaschine", name: "Spülmaschine 60 cm", klasse: "Komfort",
    satz: "Die normale Größe für einen Haushalt.",
    daten: [["Gedecke", "13"], ["Geräusch", "44 dB"], ["Energie", "D"], ["Besteckschublade", "ja"]],
    aufpreis: 0, breite: 600 },
  { id: "gs-leise", art: "spuelmaschine", name: "Spülmaschine 60 cm, leise", klasse: "Premium",
    satz: "Läuft so leise, dass sie im offenen Wohnraum nicht stört.",
    daten: [["Gedecke", "14"], ["Geräusch", "39 dB"], ["Energie", "B"], ["Trocknen", "Zeolith"]],
    aufpreis: 430, breite: 600 },
  { id: "gs-keine", art: "spuelmaschine", name: "Keine", satz: "Dafür 60 cm mehr Stauraum.", aufpreis: -290, breite: 0 },

  // Dunstabzug
  { id: "da-esse", art: "dunstabzug", name: "Dunstesse über dem Herd", klasse: "Basis",
    satz: "Sichtbar an der Wand, kräftig.",
    daten: [["Leistung", "620 m³/h"], ["Geräusch", "62 dB"], ["Stufen", "3"], ["Beleuchtung", "LED"]],
    aufpreis: 0, breite: 0 },
  { id: "da-flach", art: "dunstabzug", name: "Flachschirm im Hängeschrank", klasse: "Komfort",
    satz: "Verschwindet im Schrank, zum Kochen wird er herausgezogen.",
    daten: [["Leistung", "420 m³/h"], ["Geräusch", "56 dB"], ["Stufen", "3 + Intensiv"], ["Filter", "spülbar"]],
    aufpreis: 170, breite: 0 },
  { id: "da-mulde", art: "dunstabzug", name: "Abzug im Kochfeld", klasse: "Premium",
    satz: "Zieht den Dunst nach unten ab. Nichts hängt über dem Herd.",
    daten: [["Leistung", "580 m³/h"], ["Geräusch", "54 dB"], ["Umluft", "möglich"], ["Bedienung", "am Kochfeld"]],
    aufpreis: 980, breite: 0 },
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

/** Notnagel, falls eine Kennung gar nicht aufzulösen ist. */
const UNBEKANNT: Geraet = {
  id: "unbekannt", art: "kuehlschrank", name: "Gerät", satz: "", aufpreis: 0, breite: 600,
};

export function geraet(id: string): Geraet {
  const g = INDEX.get(id);
  if (g) return g;
  // Ein gespeicherter Plan kann ein Gerät nennen, das der Katalog nicht mehr
  // führt. Dann lieber weiterrechnen als die ganze Seite stehen lassen — die
  // Wahl wird beim Laden ohnehin bereinigt.
  if (typeof console !== "undefined") console.warn(`Unbekanntes Gerät: ${id}`);
  return UNBEKANNT;
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

/** Eine gespeicherte Gerätewahl auf den heutigen Katalog ziehen. */
export function bereinigeGeraete(wahl: Partial<Geraetewahl> | undefined): Geraetewahl {
  const sauber = { ...STANDARD_GERAETE };
  for (const art of Object.keys(STANDARD_GERAETE) as GeraeteArt[]) {
    const id = wahl?.[art];
    if (id && INDEX.get(id)?.art === art) sauber[art] = id;
  }
  return sauber;
}
