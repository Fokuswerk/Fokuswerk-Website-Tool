import type { Optimierung, Position } from "@/lib/typen";

/**
 * Vorberechnete Planungsvarianten je Küchentyp.
 *
 * In der späteren echten Anwendung erzeugt ein Constraint-Solver diese
 * Belegungen. Hier sind sie hinterlegt — die Unterschiede sind aber echt:
 * jede Variante hat eine andere Modulfolge, daraus ergeben sich andere
 * Kennzahlen, andere Anschlusspositionen und ein anderer Preis.
 *
 * Die Summe der Korpusbreiten jeder Belegung ergibt exakt die Zeilenlänge.
 * Das prüft die Anwendung beim Start (siehe lib/berechnung.ts).
 */

export interface VarianteRoh {
  id: string;
  typId: string;
  kurz: string;
  schwerpunkt: Optimierung;
  bezeichnung: string;
  belegung: Record<string, string[]>;
  weitere: Position[];
  staerken: string[];
  schwaechen: string[];
  begruendung: string;
}

/** Laufende Meter je Typ: Summe aller Zeilenlängen. */
const LFM: Record<string, number> = {
  "K-01": 3.0,
  "K-02": 4.5,
  "K-03": 3.6,
  "K-04": 5.4,
  "K-05": 6.0,
  "K-06": 3.0,
};

function flaechen(typId: string, geraetepaket: "GP1" | "GP2", extra: Position[] = []): Position[] {
  const m = LFM[typId];
  return [
    { modulId: "AP", menge: m },
    { modulId: "SO", menge: m },
    { modulId: geraetepaket, menge: 1 },
    { modulId: "SPA", menge: 1 },
    { modulId: "MON", menge: m },
    ...extra,
  ];
}

export const VARIANTEN: VarianteRoh[] = [
  // ---------------------------------------------------------------- K-01
  {
    id: "K-01-A", typId: "K-01", kurz: "A", schwerpunkt: "kosten",
    bezeichnung: "Kostenoptimiert",
    belegung: { Z1: ["HK600", "KF600", "US600", "SP600", "US450", "PB150"] },
    weitere: [{ modulId: "HS600", menge: 1 }, ...flaechen("K-01", "GP1")],
    staerken: ["Günstigste Modulfolge im Raster", "Spüle 1.800 mm vom Fallstrang"],
    schwaechen: ["Nur ein Hängeschrank, da das Fenster bei 1.800 mm beginnt", "Passblende 150 mm am rechten Ende"],
    begruendung: "Kühlschrank als Hochschrank an die geschlossene Wandseite, damit er die Fensterlaibung nicht verdeckt. Spüle rechts, nah am Fallstrang. Günstigste zulässige Kombination.",
  },
  {
    id: "K-01-B", typId: "K-01", kurz: "B", schwerpunkt: "stauraum",
    bezeichnung: "Stauraumoptimiert",
    belegung: { Z1: ["HK600", "KF600", "AZ600", "SP600", "US600"] },
    weitere: [{ modulId: "HS600", menge: 1 }, ...flaechen("K-01", "GP1")],
    staerken: ["Keine Passblende, volle Rasterbelegung", "Apothekerauszug statt Standardunterschrank"],
    schwaechen: ["Höherer Preis", "Weiterhin nur ein Hängeschrank"],
    begruendung: "Fünf Module à 600 mm belegen die Nische ohne Rest. Der Apothekerauszug ersetzt den schmalen Unterschrank und hebt den nutzbaren Stauraum deutlich.",
  },
  {
    id: "K-01-C", typId: "K-01", kurz: "C", schwerpunkt: "ergonomie",
    bezeichnung: "Ergonomieoptimiert",
    belegung: { Z1: ["HK600", "SP600", "US600", "US450", "KF600", "PB150"] },
    weitere: [{ modulId: "HS600", menge: 2 }, ...flaechen("K-01", "GP1")],
    staerken: ["1.050 mm zusammenhängende Arbeitsfläche zwischen Spüle und Kochfeld"],
    schwaechen: ["Spüle weit vom Fallstrang, höherer Installationsaufwand", "Kochfeld unter dem Fenster"],
    begruendung: "Spüle und Kochfeld an die Enden der Zeile, dazwischen die längste mögliche Arbeitsfläche. Erkauft wird das mit einem längeren Abwasserweg.",
  },

  // ---------------------------------------------------------------- K-02
  {
    id: "K-02-A", typId: "K-02", kurz: "A", schwerpunkt: "kosten",
    bezeichnung: "Kostenoptimiert",
    belegung: { Z1: ["HK600", "KF600", "US600", "US450", "US450"], Z2: ["SP600", "GS600", "AZ600"] },
    weitere: [{ modulId: "HS600", menge: 2 }, { modulId: "HS450", menge: 1 }, ...flaechen("K-02", "GP2")],
    staerken: ["Spüle und Geschirrspüler nebeneinander am Fallstrang", "Keine Passblende nötig"],
    schwaechen: ["Zwei schmale Unterschränke statt eines Auszugsschranks"],
    begruendung: "Nassbereich vollständig auf der kurzen Zeile an der Westwand, direkt am Fallstrang. Die lange Zeile bleibt als zusammenhängende Arbeitsfläche frei.",
  },
  {
    id: "K-02-B", typId: "K-02", kurz: "B", schwerpunkt: "stauraum",
    bezeichnung: "Stauraumoptimiert",
    belegung: { Z1: ["HK600", "KF600", "AZ600", "US450", "US450"], Z2: ["SP600", "GS600", "US600"] },
    weitere: [{ modulId: "HS600", menge: 3 }, ...flaechen("K-02", "GP2")],
    staerken: ["Apothekerauszug auf der Hauptzeile", "Drei volle Hängeschränke"],
    schwaechen: ["Höherer Preis", "Weniger durchgehende Arbeitsfläche"],
    begruendung: "Der Apothekerauszug sitzt neben dem Kochfeld, wo Vorräte gebraucht werden. Die Hängeschränke sind auf eine Breite vereinheitlicht, was die Bestellung vereinfacht.",
  },
  {
    id: "K-02-C", typId: "K-02", kurz: "C", schwerpunkt: "ergonomie",
    bezeichnung: "Ergonomieoptimiert",
    belegung: { Z1: ["HK600", "US600", "KF600", "US450", "US450"], Z2: ["SP600", "GS600", "AZ600"] },
    weitere: [{ modulId: "HS600", menge: 2 }, { modulId: "HS450", menge: 1 }, ...flaechen("K-02", "GP2")],
    staerken: ["Kochfeld mittig auf der Hauptzeile, beidseitig Abstellfläche", "Kühlschrank und Kochfeld getrennt"],
    schwaechen: ["Weg zwischen Spüle und Kochfeld führt um die Ecke"],
    begruendung: "Das Kochfeld rückt in die Mitte der langen Zeile, sodass links und rechts abgestellt werden kann. Der Kühlschrank bleibt am Zeilenanfang, getrennt vom Kochbereich.",
  },

  // ---------------------------------------------------------------- K-03
  {
    id: "K-03-A", typId: "K-03", kurz: "A", schwerpunkt: "kosten",
    bezeichnung: "Kostenoptimiert",
    belegung: { Z1: ["HK600", "KF600", "US450", "SP600", "GS600", "US600", "PB150"] },
    weitere: [{ modulId: "HS600", menge: 2 }, ...flaechen("K-03", "GP2")],
    staerken: ["Backofen im Unterschrank, kein zweiter Hochschrank nötig", "Spüle und Geschirrspüler am Fallstrang"],
    schwaechen: ["Passblende 150 mm", "Backofen in Bückhöhe"],
    begruendung: "Der Backofen bleibt im Kochfeld-Unterschrank. Das spart den teuersten Korpus der Zeile und hält den Preis unter dem Budgetmittel.",
  },
  {
    id: "K-03-B", typId: "K-03", kurz: "B", schwerpunkt: "stauraum",
    bezeichnung: "Stauraumoptimiert",
    belegung: { Z1: ["HK600", "HB600", "KF600", "AZ600", "SP600", "GS600"] },
    weitere: [{ modulId: "HS600", menge: 2 }, ...flaechen("K-03", "GP2")],
    staerken: ["Zwei Hochschränke, hoher Stauraum", "Backofen auf Griffhöhe", "Keine Passblende"],
    schwaechen: ["Teuerste Variante dieses Typs", "Weniger freie Arbeitsfläche"],
    begruendung: "Kühlschrank und Backofen als Hochschrankblock am Zeilenanfang. Das bringt den meisten Stauraum und den Backofen auf eine rückenschonende Höhe.",
  },
  {
    id: "K-03-C", typId: "K-03", kurz: "C", schwerpunkt: "ergonomie",
    bezeichnung: "Ergonomieoptimiert",
    belegung: { Z1: ["HK600", "US600", "KF600", "US600", "SP600", "GS600"] },
    weitere: [{ modulId: "HS600", menge: 2 }, ...flaechen("K-03", "GP2")],
    staerken: ["600 mm Arbeitsfläche beidseitig des Kochfelds", "Klarer Ablauf von links nach rechts"],
    schwaechen: ["Kein Apothekerauszug", "Spüle am äußeren Ende"],
    begruendung: "Die Zeile folgt dem Arbeitsablauf: Vorratsschrank, Vorbereiten, Kochen, Abstellen, Spülen. Beidseitig des Kochfelds steht je ein voller Unterschrank als Abstellfläche.",
  },

  // ---------------------------------------------------------------- K-04
  {
    id: "K-04-A", typId: "K-04", kurz: "A", schwerpunkt: "kosten",
    bezeichnung: "Kostenoptimiert",
    belegung: { Z1: ["HK600", "HB600", "US600", "US600", "US450", "PB150"], Z2: ["SP600", "GS600", "KF600", "US600"] },
    weitere: [{ modulId: "HS600", menge: 3 }, { modulId: "HS450", menge: 1 }, ...flaechen("K-04", "GP2")],
    staerken: ["Nassbereich und Kochen auf einer Zeile", "Gerade Wege im Gang"],
    schwaechen: ["Passblende auf der Nordzeile", "Kochfeld nah an der Spüle"],
    begruendung: "Geräte auf der Südzeile gebündelt, Stauraum auf der Nordzeile. Das hält die Installationswege kurz und die Anschlüsse auf einer Wandseite.",
  },
  {
    id: "K-04-B", typId: "K-04", kurz: "B", schwerpunkt: "stauraum",
    bezeichnung: "Stauraumoptimiert",
    belegung: { Z1: ["HK600", "HB600", "AZ600", "US600", "US600"], Z2: ["SP600", "GS600", "KF600", "AZ600"] },
    weitere: [{ modulId: "HS600", menge: 4 }, ...flaechen("K-04", "GP2")],
    staerken: ["Zwei Apothekerauszüge", "Vier volle Hängeschränke", "Keine Passblende"],
    schwaechen: ["Teuerste Variante des Projekts in dieser Größe"],
    begruendung: "Beide Zeilen vollständig im 600er-Raster belegt. Zwei Apothekerauszüge nehmen Vorräte auf, die sonst Hängeschränke belegen würden.",
  },
  {
    id: "K-04-C", typId: "K-04", kurz: "C", schwerpunkt: "ergonomie",
    bezeichnung: "Ergonomieoptimiert",
    belegung: { Z1: ["HK600", "US600", "US600", "US600", "US600"], Z2: ["SP600", "US450", "KF600", "GS600", "PB150"] },
    weitere: [{ modulId: "HS600", menge: 4 }, ...flaechen("K-04", "GP2")],
    staerken: ["450 mm Arbeitsfläche zwischen Spüle und Kochfeld", "Backofen im Unterschrank hält die Nordzeile frei"],
    schwaechen: ["Backofen in Bückhöhe", "Passblende auf der Südzeile"],
    begruendung: "Zwischen Spüle und Kochfeld liegt ein eigener Unterschrank als Arbeitszone. Die Nordzeile bleibt durchgehend Stauraum und Abstellfläche.",
  },

  // ---------------------------------------------------------------- K-05
  {
    id: "K-05-A", typId: "K-05", kurz: "A", schwerpunkt: "kosten",
    bezeichnung: "Kostenoptimiert",
    belegung: { Z1: ["HK600", "HB600", "KF600", "US600", "US600", "US450", "PB150"], Z2: ["SP600", "GS600", "US600", "US600"] },
    weitere: [{ modulId: "HS600", menge: 3 }, { modulId: "HS450", menge: 2 }, ...flaechen("K-05", "GP2")],
    staerken: ["Hochschrankblock am Zeilenanfang", "Nassbereich am Fallstrang"],
    schwaechen: ["Passblende auf der Hauptzeile"],
    begruendung: "Geräte und Stauraum am Anfang der langen Zeile, Nassbereich auf der kurzen Zeile direkt am Fallstrang. Günstigste zulässige Belegung für diese Nischenlängen.",
  },
  {
    id: "K-05-B", typId: "K-05", kurz: "B", schwerpunkt: "stauraum",
    bezeichnung: "Stauraumoptimiert",
    belegung: { Z1: ["HK600", "HB600", "KF600", "AZ600", "AZ600", "US600"], Z2: ["SP600", "GS600", "AZ600", "US600"] },
    weitere: [{ modulId: "HS600", menge: 5 }, ...flaechen("K-05", "GP2")],
    staerken: ["Drei Apothekerauszüge", "Fünf volle Hängeschränke", "Keine Passblende"],
    schwaechen: ["Deutlich über dem Budgetmittel des Projekts"],
    begruendung: "Beide Zeilen vollständig im 600er-Raster. Für die größte Wohnung des Projekts, in der Stauraum wichtiger ist als der Einzelpreis.",
  },
  {
    id: "K-05-C", typId: "K-05", kurz: "C", schwerpunkt: "ergonomie",
    bezeichnung: "Ergonomieoptimiert",
    belegung: { Z1: ["HK600", "US600", "KF600", "US600", "US600", "US450", "PB150"], Z2: ["SP600", "GS600", "US600", "US450", "PB150"] },
    weitere: [{ modulId: "HS600", menge: 4 }, { modulId: "HS450", menge: 1 }, ...flaechen("K-05", "GP2")],
    staerken: ["Kochfeld mittig mit Abstellfläche auf beiden Seiten", "Backofen im Unterschrank hält den Block schlank"],
    schwaechen: ["Zwei Passblenden", "Backofen in Bückhöhe"],
    begruendung: "Das Kochfeld rückt in die Mitte der langen Zeile. Links und rechts steht je ein voller Unterschrank, sodass beim Kochen beidseitig abgestellt werden kann.",
  },

  // ---------------------------------------------------------------- K-06
  {
    id: "K-06-A", typId: "K-06", kurz: "A", schwerpunkt: "kosten",
    bezeichnung: "Kostenoptimiert",
    belegung: { Z1: ["HK600", "KF600", "SP600", "GS600", "US450", "PB150"] },
    weitere: [{ modulId: "HS600", menge: 1 }, ...flaechen("K-06", "GP2", [{ modulId: "BARR", menge: 1 }])],
    staerken: ["Spüle und Geschirrspüler nebeneinander", "Günstigste barrierearme Belegung"],
    schwaechen: ["Kochfeld direkt neben der Spüle", "Passblende 150 mm"],
    begruendung: "Nassbereich zusammengefasst, damit die unterfahrbare Spüle und der Geschirrspüler einen gemeinsamen Anschlussbereich teilen.",
  },
  {
    id: "K-06-B", typId: "K-06", kurz: "B", schwerpunkt: "stauraum",
    bezeichnung: "Stauraumoptimiert",
    belegung: { Z1: ["HK600", "KF600", "SP600", "GS600", "AZ600"] },
    weitere: [{ modulId: "HS600", menge: 1 }, ...flaechen("K-06", "GP2", [{ modulId: "BARR", menge: 1 }])],
    staerken: ["Keine Passblende", "Apothekerauszug aus dem Sitzen erreichbar"],
    schwaechen: ["Höherer Preis", "Kochfeld weiterhin neben der Spüle"],
    begruendung: "Der Apothekerauszug ersetzt den schmalen Unterschrank. Aus sitzender Position ist ein Vollauszug deutlich besser erreichbar als ein Drehtürschrank.",
  },
  {
    id: "K-06-C", typId: "K-06", kurz: "C", schwerpunkt: "ergonomie",
    bezeichnung: "Ergonomieoptimiert",
    belegung: { Z1: ["HK600", "KF600", "US450", "SP600", "GS600", "PB150"] },
    weitere: [{ modulId: "HS600", menge: 1 }, ...flaechen("K-06", "GP2", [{ modulId: "BARR", menge: 1 }])],
    staerken: ["450 mm Arbeitsfläche zwischen Spüle und Kochfeld", "Kochfeld am Zeilenende frei anfahrbar"],
    schwaechen: ["Längerer Weg zum Fallstrang", "Passblende 150 mm"],
    begruendung: "Zwischen Nassbereich und Kochfeld liegt ein Unterschrank als Arbeitszone. Das Kochfeld am Zeilenende lässt sich seitlich anfahren, was aus sitzender Position wichtig ist.",
  },
];

export const STANDARDWAHL: Record<string, string> = {
  "K-01": "K-01-A",
  "K-02": "K-02-A",
  "K-03": "K-03-B",
  "K-04": "K-04-A",
  "K-05": "K-05-A",
  "K-06": "K-06-C",
};
