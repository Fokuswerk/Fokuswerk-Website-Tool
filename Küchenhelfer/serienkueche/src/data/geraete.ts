/**
 * Geräte, die man einzeln auswählt.
 *
 * Es sind echte, in Deutschland gängige Einbaugeräte mit ihrer
 * Modellbezeichnung. Die Preise sind recherchierte Straßenpreise — also
 * Endkundenpreise und damit **brutto**, während die Modulpreise netto sind.
 * Damit nicht zwei Grundlagen in einer Summe landen, trägt jedes Gerät
 * zusätzlich seinen Nettowert; gerechnet wird in der ganzen Anwendung netto.
 * Die Preise sind
 * Momentaufnahmen, keine Einkaufskonditionen — Stand siehe PREISSTAND_GERAETE,
 * Quellen in QUELLEN. Für ein echtes Angebot ersetzt die Preisliste des
 * Lieferanten diese Tabelle; am Aufbau ändert das nichts.
 *
 * Technische Daten stehen nur dort, wo sie belegt sind. Lieber eine Zeile
 * weniger als eine erfundene.
 *
 * Die Produktbilder sind die Herstellerfotos der jeweiligen Modelle, geholt
 * vom Medienserver der BSH (Bosch, Siemens) und hier abgelegt. Für den Betrieb
 * als Händler kommen sie aus dem Lieferantenkatalog — dann mit Freigabe.
 * Deshalb stehen im Katalog nur Marken, deren Bilder wirklich zum Modell
 * gehören: lieber zwei Hersteller mit echten Fotos als drei mit Platzhaltern.
 */

export const PREISSTAND_GERAETE = "Oktober 2026";

/** Umsatzsteuersatz für Küchen als Lieferung mit Montage. */
export const MWST = 0.19;
export const QUELLEN = "geizhals.de, testbericht.de, vergleich.org, otto.de, ebay.de";
export const FOTO_QUELLE = "Produktfotos: Bosch und Siemens (BSH Hausgeräte)";
/**
 * Liegt für die Produktfotos eine Lizenz vor?
 *
 * Nein — sie sind aus Handelsdarstellungen zusammengetragen. Für einen
 * Prototyp, den man einem Interessenten zeigt, ist das vertretbar; für den
 * öffentlichen Betrieb und erst recht für einen Verkauf des Werkzeugs nicht.
 * Solange dieser Schalter auf false steht, sagt die Anwendung das an jeder
 * Stelle, an der Produktfotos vorkommen, statt es im Ordner zu verstecken.
 *
 * Die Wege aus dem offenen Stand stehen in Dokumente/Bildrechte.md.
 */
export const FOTOS_LIZENZIERT = false;
export const GERAETEFOTO_HINWEIS =
  "Herstellerfotos ohne Lizenz, nur zur Ansicht im Prototyp — für den Betrieb werden sie durch eigene Aufnahmen oder Zeichnungen ersetzt.";

export type GeraeteArt = "kuehlschrank" | "kochfeld" | "backofen" | "spuelmaschine" | "dunstabzug";

export interface Geraet {
  id: string;
  art: GeraeteArt;
  /** Hersteller. "—" bei der Option, gar keines zu nehmen. */
  marke: string;
  /** Baureihe des Herstellers, soweit bekannt. */
  serie?: string;
  /** Modellbezeichnung des Herstellers. */
  modell?: string;
  /** Was es ist, in einem Wort oder zweien. */
  name: string;
  satz: string;
  /** Belegte technische Daten. */
  daten?: Array<[string, string]>;
  /** Recherchierter Straßenpreis in EUR, brutto. 0 = kein Gerät. */
  richtpreis: number;
  /** Derselbe Preis netto — damit gerechnet wird. */
  netto: number;
  /** Breite des Korpus, den das Gerät belegt. 0 = belegt keinen eigenen Platz. */
  breite: number;
  /** Herstellerfoto des Modells, unter /public/geraete. */
  foto?: string;
  /** Nur Kühlschrank: wie er eingebaut wird. */
  bau?: "hoch" | "unterbau" | "keiner";
  /** Wird beim Laden aus dem Richtpreis gerechnet. */
  aufpreis: number;
}

const ROH: Array<Omit<Geraet, "aufpreis" | "netto">> = [
  /* ---------------- Kühlschrank ---------------- */
  {
    id: "ks-keiner", art: "kuehlschrank", marke: "—", name: "Keiner",
    satz: "Du bringst deinen eigenen mit oder stellst ihn woanders hin.",
    richtpreis: 0, breite: 0, bau: "keiner",
  },
  {
    id: "ks-bosch-kur21", art: "kuehlschrank", marke: "Bosch", serie: "Serie 4", modell: "KUR21VFE0",
    name: "Unterbau-Kühlschrank", satz: "Passt unter die Arbeitsplatte, 82 cm Nische. Die Platte läuft durch.",
    daten: [["Nutzinhalt", "134 l"], ["Verbrauch", "93 kWh/Jahr"], ["Geräusch", "35 dB"], ["Energie", "E"]],
    foto: "/geraete/ks-bosch-kur21.webp",
    richtpreis: 512, breite: 600, bau: "unterbau",
  },
  {
    id: "ks-siemens-ki81", art: "kuehlschrank", marke: "Siemens", serie: "iQ500", modell: "KI81RADD0",
    name: "Einbaukühlschrank, volle Höhe", satz: "Nimmt 60 cm Wand über die ganze Höhe — dort gibt es keine Arbeitsfläche.",
    daten: [["Nutzinhalt", "310 l"]],
    foto: "/geraete/ks-siemens-ki81.webp",
    richtpreis: 989, breite: 600, bau: "hoch",
  },
  {
    id: "ks-bosch-kif82", art: "kuehlschrank", marke: "Bosch", serie: "Serie 8", modell: "KIF82PFE0",
    name: "Einbaukühlschrank, volle Höhe", satz: "Die gehobene Baureihe, ebenfalls über die ganze Höhe.",
    daten: [["Nutzinhalt", "269 l"]],
    foto: "/geraete/ks-bosch-kif82.webp",
    richtpreis: 1149, breite: 600, bau: "hoch",
  },

  /* ---------------- Kochfeld ---------------- */
  {
    id: "kf-bosch-pke645", art: "kochfeld", marke: "Bosch", serie: "Serie 4", modell: "PKE645BA2E",
    name: "Glaskeramik", satz: "Der Klassiker. Günstig und gut zu reinigen.",
    daten: [["Kochzonen", "4"], ["Anschlusswert", "6,6 kW"], ["Breite", "60 cm"]],
    foto: "/geraete/kf-bosch-pke645.webp",
    richtpreis: 291, breite: 600,
  },
  {
    id: "kf-bosch-pug611", art: "kochfeld", marke: "Bosch", serie: "Serie 6", modell: "PUG611AA5E",
    name: "Induktion", satz: "Schneller heiß, spart Strom, kühlt rasch ab.",
    daten: [["Breite", "60 cm"], ["Technik", "Induktion"]],
    foto: "/geraete/kf-bosch-pug611.webp",
    richtpreis: 299, breite: 600,
  },
  {
    id: "kf-siemens-ex645", art: "kochfeld", marke: "Siemens", serie: "iQ700", modell: "EX645HXC1E",
    name: "Induktion", satz: "Die gehobene Baureihe, autark bedienbar.",
    daten: [["Breite", "60 cm"], ["Technik", "Induktion"]],
    foto: "/geraete/kf-siemens-ex645.webp",
    richtpreis: 549, breite: 600,
  },

  /* ---------------- Backofen ---------------- */
  {
    id: "bo-keiner", art: "backofen", marke: "—", name: "Keiner",
    satz: "Nur ein Kochfeld, kein Ofen.",
    richtpreis: 0, breite: 0,
  },
  {
    id: "bo-bosch-hba571", art: "backofen", marke: "Bosch", serie: "Serie 2", modell: "HBA571BB4",
    name: "Einbaubackofen", satz: "Der günstige Einstieg.",
    daten: [["Breite", "60 cm"]],
    foto: "/geraete/bo-bosch-hba571.webp",
    richtpreis: 369, breite: 600,
  },
  {
    id: "bo-bosch-hbg578", art: "backofen", marke: "Bosch", serie: "Serie 6", modell: "HBG578BB3",
    name: "Einbaubackofen mit 3D-Heißluft", satz: "Mit Air Fry — frittieren ohne Fett.",
    daten: [["Garraum", "71 l"], ["Beheizung", "3D-Heißluft"], ["Air Fry", "ja"]],
    foto: "/geraete/bo-bosch-hbg578.webp",
    richtpreis: 506, breite: 600,
  },
  {
    id: "bo-siemens-hb774", art: "backofen", marke: "Siemens", serie: "iQ700", modell: "HB774G1B1",
    name: "Einbaubackofen mit Pyrolyse", satz: "Reinigt sich selbst durch Ausbrennen.",
    daten: [["Breite", "60 cm"], ["Reinigung", "Pyrolyse"]],
    foto: "/geraete/bo-siemens-hb774.webp",
    richtpreis: 697, breite: 600,
  },

  /* ---------------- Spülmaschine ---------------- */
  {
    id: "gs-keine", art: "spuelmaschine", marke: "—", name: "Keine",
    satz: "Dafür 60 cm mehr Stauraum.",
    richtpreis: 0, breite: 0,
  },
  {
    id: "gs-siemens-sr61", art: "spuelmaschine", marke: "Siemens", serie: "iQ100", modell: "SR61IX05KE",
    name: "Spülmaschine 45 cm", satz: "Spart 15 cm Wand. Für ein bis zwei Personen.",
    daten: [["Breite", "45 cm"], ["Energie", "F"], ["Einbau", "vollintegriert"]],
    foto: "/geraete/gs-siemens-sr61.webp",
    richtpreis: 418, breite: 450,
  },
  {
    id: "gs-bosch-smv4", art: "spuelmaschine", marke: "Bosch", serie: "Serie 4", modell: "SMV4HCX48E",
    name: "Spülmaschine 60 cm", satz: "Die normale Größe für einen Haushalt.",
    daten: [["Breite", "60 cm"], ["Energie", "D"], ["Einbau", "vollintegriert"]],
    foto: "/geraete/gs-bosch-smv4.webp",
    richtpreis: 504, breite: 600,
  },
  {
    id: "gs-siemens-sx63", art: "spuelmaschine", marke: "Siemens", modell: "SX63EX04BE",
    name: "Spülmaschine 60 cm, hoch", satz: "Höhere Bauform, mehr Platz im Korb.",
    daten: [["Breite", "60 cm"], ["Einbau", "vollintegriert"]],
    foto: "/geraete/gs-siemens-sx63.webp",
    richtpreis: 748, breite: 600,
  },
  {
    id: "gs-siemens-sn87", art: "spuelmaschine", marke: "Siemens", serie: "iQ700", modell: "SN87TX00CE",
    name: "Spülmaschine 60 cm, leise", satz: "43 dB — leise genug für den offenen Wohnraum. Die leiseste im Katalog.",
    daten: [["Breite", "60 cm"], ["Geräusch", "43 dB"], ["Energie", "A"]],
    foto: "/geraete/gs-siemens-sn87.webp",
    richtpreis: 879, breite: 600,
  },

  /* ---------------- Dunstabzug ---------------- */
  {
    id: "da-keiner", art: "dunstabzug", marke: "—", name: "Keiner",
    satz: "Nur sinnvoll, wenn gut gelüftet werden kann.",
    richtpreis: 0, breite: 0,
  },
  {
    id: "da-bosch-dft63", art: "dunstabzug", marke: "Bosch", serie: "Serie 2", modell: "DFT63AC50",
    name: "Flachschirmhaube 60 cm", satz: "Verschwindet im Hängeschrank, zum Kochen wird sie herausgezogen.",
    daten: [["Breite", "60 cm"], ["Geräusch", "68 dB"]],
    foto: "/geraete/da-bosch-dft63.webp",
    richtpreis: 165, breite: 0,
  },
  {
    id: "da-bosch-dfl064", art: "dunstabzug", marke: "Bosch", serie: "Serie 4", modell: "DFL064A52",
    name: "Flachschirmhaube 60 cm", satz: "Die mittlere Baureihe.",
    daten: [["Breite", "60 cm"]],
    foto: "/geraete/da-bosch-dfl064.webp",
    richtpreis: 303, breite: 0,
  },
  {
    id: "da-siemens-li67", art: "dunstabzug", marke: "Siemens", modell: "LI67RA561",
    name: "Flachschirmhaube 60 cm", satz: "Edelstahl, für den Einbau in den Hängeschrank.",
    daten: [["Breite", "59,8 cm"], ["Material", "Edelstahl"]],
    foto: "/geraete/da-siemens-li67.webp",
    richtpreis: 401, breite: 0,
  },
];

/** Der Aufschlag ist der Abstand zum günstigsten echten Gerät seiner Art.
    Die Option "keins" zaehlt dabei nicht als Nullpunkt — sonst saehe jedes
    Geraet teuer aus, statt dass das Weglassen etwas spart. */
export const GERAETE: Geraet[] = (() => {
  const basis = new Map<GeraeteArt, number>();
  for (const g of ROH) {
    if (g.richtpreis <= 0) continue;
    const b = basis.get(g.art);
    if (b === undefined || g.richtpreis < b) basis.set(g.art, g.richtpreis);
  }
  return ROH.map((g) => ({
    ...g,
    netto: Math.round(g.richtpreis / (1 + MWST)),
    aufpreis: g.richtpreis - (basis.get(g.art) ?? 0),
  }));
})();

export interface Geraetewahl {
  kuehlschrank: string;
  kochfeld: string;
  backofen: string;
  spuelmaschine: string;
  dunstabzug: string;
}

export const ARTEN: Array<{ art: GeraeteArt; frage: string; hilfe: string }> = [
  { art: "kuehlschrank", frage: "Welchen Kühlschrank?", hilfe: "Ein Gerät über die volle Höhe nimmt 60 cm Wand — dort gibt es dann keine Arbeitsfläche." },
  { art: "kochfeld", frage: "Worauf kochst du?", hilfe: "Alle brauchen gleich viel Platz, der Unterschied liegt in Technik und Preis." },
  { art: "backofen", frage: "Welchen Backofen?", hilfe: "Wo er steht, entscheidest du gleich darunter." },
  { art: "spuelmaschine", frage: "Spülmaschine?", hilfe: "Sie steht am besten direkt neben der Spüle — dann teilen sich beide den Anschluss." },
  { art: "dunstabzug", frage: "Und der Dunstabzug?", hilfe: "Er hängt über dem Herd und braucht keinen eigenen Platz an der Wand." },
];

const INDEX = new Map(GERAETE.map((g) => [g.id, g]));

/** Notnagel, falls eine Kennung gar nicht aufzulösen ist. */
const UNBEKANNT: Geraet = {
  id: "unbekannt", art: "kuehlschrank", marke: "—", name: "Gerät", satz: "",
  richtpreis: 0, netto: 0, aufpreis: 0, breite: 600,
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

/** Ein Gerät je Art, mit Foto, für die Schau auf der Startseite: nicht das
    billigste und nicht das teuerste, sondern das in der Mitte. So entsteht
    weder der Eindruck von Billigware noch von Luxus. */
export function schaustueck(art: GeraeteArt): Geraet | null {
  const echte = geraeteFuer(art).filter((g) => g.richtpreis > 0 && g.foto);
  if (echte.length === 0) return null;
  const sortiert = [...echte].sort((x, y) => x.richtpreis - y.richtpreis);
  return sortiert[Math.floor((sortiert.length - 1) / 2)];
}

/** Wie viele echte Modelle es in dieser Art gibt. */
export function anzahlModelle(art: GeraeteArt): number {
  return geraeteFuer(art).filter((g) => g.richtpreis > 0).length;
}

/** Die Marken, die es in dieser Art gibt — für den Filter. */
export function markenFuer(art: GeraeteArt): string[] {
  const aus: string[] = [];
  for (const g of geraeteFuer(art)) if (g.marke !== "—" && !aus.includes(g.marke)) aus.push(g.marke);
  return aus.sort();
}

export const STANDARD_GERAETE: Geraetewahl = {
  kuehlschrank: "ks-siemens-ki81",
  kochfeld: "kf-bosch-pke645",
  backofen: "bo-bosch-hbg578",
  spuelmaschine: "gs-bosch-smv4",
  dunstabzug: "da-bosch-dfl064",
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
