import type {
  Dokument,
  Kuechentyp,
  Regel,
  Wohnung,
} from "@/lib/typen";

/**
 * Demo-Projekt. Alle Zahlen sind erfunden, aber über die gesamte Anwendung
 * hinweg konsistent: Kosten und Mengen werden aus dem Modulkatalog und den
 * Variantenbelegungen gerechnet, nirgends fest eingetragen.
 *
 * Wandbezug: "von" ist der Abstand in mm vom Beginn der jeweiligen Wand.
 * nord und sued laufen von links nach rechts, west und ost von oben nach unten.
 */

export const PROJEKT = {
  id: "demo",
  name: "Wohnquartier Am Stadtpark",
  ort: "Oldenburg",
  art: "Mehrfamilienhaus, Mietwohnungsbau",
  bauherr: "Stadtpark Wohnbau GmbH",
  einheiten: 40,
  gebaeude: 2,
  kuechen: 40,
  ausstattung: "Standard Plus",
  budgetVon: 4000,
  budgetBis: 6500,
  status: "Vorplanung",
  architekt: "Hestermann Architekten, Oldenburg",
  tga: "Brinkmann TGA",
};

export const KUECHENTYPEN: Kuechentyp[] = [
  {
    id: "K-01",
    kurz: "K-01",
    bezeichnung: "Einzeilig, kompakt",
    grundform: "einzeilig",
    raum: { breite: 3000, tiefe: 2700, hoehe: 2600 },
    zeilen: [{ id: "Z1", wand: "nord", start: 0, laenge: 3000, bezeichnung: "Hauptzeile Nordwand" }],
    oeffnungen: [
      { id: "F1", art: "fenster", wand: "nord", von: 1800, breite: 1200, bruestung: 900, hoehe: 1400 },
      { id: "T1", art: "tuer", wand: "sued", von: 2100, breite: 885, anschlag: "links", oeffnetNach: "innen" },
    ],
    zwangspunkte: [
      { id: "FS1", art: "fallstrang", wand: "ost", von: 0, breite: 450, bezeichnung: "Abwasserfallstrang DN 100", herkunft: "angenommen", freigabe: "bestaetigt" },
      { id: "HZ1", art: "heizkoerper", wand: "west", von: 900, breite: 1000, bezeichnung: "Heizkörper 1.000 mm", herkunft: "gelesen", freigabe: "bestaetigt" },
    ],
    attribute: {
      nischenlaenge: { wert: 3000, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS, Haus A EG" },
      raumtiefe: { wert: 2700, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS" },
      raumhoehe: { wert: 2600, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Schnitt A-A" },
      bruestungshoehe: { wert: 900, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Schnitt A-A" },
      tuerbreite: { wert: 885, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Block TUER-885" },
      wasseranschluss: { wert: 1950, einheit: "mm", herkunft: "gerechnet", freigabe: "bestaetigt", quelle: "aus Spülenposition" },
      flaeche: { wert: 81, einheit: "m2", herkunft: "gerechnet", freigabe: "bestaetigt", quelle: "aus Raumpolygon, Wert in dm²" },
    },
    pruefpunkte: [
      { id: "P1", titel: "Maßstab 1:50 bestätigt", beschreibung: "Maßkette nennt 3.000 mm, aus der Geometrie gerechnet 3.000 mm. Abweichung 0 mm.", freigabe: "bestaetigt", blockierend: true },
      { id: "P2", titel: "Türanschlag Küche zum Flur", beschreibung: "Aus der Bogengeometrie links angeschlagen, öffnet in den Raum. Blockiert kein Modul.", freigabe: "bestaetigt", blockierend: true },
      { id: "P3", titel: "Lage Abwasserfallstrang", beschreibung: "Aus dem Sanitärplan EG übertragen und für die Obergeschosse angenommen.", freigabe: "bestaetigt", blockierend: true },
      { id: "P4", titel: "Brüstungshöhe 900 mm", beschreibung: "Aus Schnitt A-A gelesen. Arbeitsplatte liegt bei 910 mm, das Fenster öffnet darüber.", freigabe: "bestaetigt", blockierend: false },
    ],
    wohnungen: [],
    gespiegelt: ["WE 04", "WE 06", "WE 09"],
  },
  {
    id: "K-02",
    kurz: "K-02",
    bezeichnung: "L-Form, kompakt",
    grundform: "l-form",
    raum: { breite: 2900, tiefe: 3200, hoehe: 2600 },
    zeilen: [
      { id: "Z1", wand: "nord", start: 0, laenge: 2700, bezeichnung: "Hauptzeile Nordwand" },
      { id: "Z2", wand: "west", start: 700, laenge: 1800, bezeichnung: "Kurze Zeile Westwand" },
    ],
    oeffnungen: [
      { id: "F1", art: "fenster", wand: "ost", von: 600, breite: 1200, bruestung: 900, hoehe: 1400 },
      { id: "T1", art: "tuer", wand: "sued", von: 1600, breite: 885, anschlag: "rechts", oeffnetNach: "innen" },
    ],
    zwangspunkte: [
      { id: "FS1", art: "fallstrang", wand: "west", von: 2500, breite: 450, bezeichnung: "Abwasserfallstrang DN 100", herkunft: "gelesen", freigabe: "bestaetigt" },
    ],
    attribute: {
      nischenlaenge: { wert: 2700, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS, Haus A 1. OG" },
      nischenlaenge2: { wert: 1800, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS" },
      raumtiefe: { wert: 3200, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS" },
      raumhoehe: { wert: 2600, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Schnitt A-A" },
      bruestungshoehe: { wert: 900, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Schnitt A-A" },
      eckausbildung: { wert: 100, einheit: "mm", herkunft: "gerechnet", freigabe: "bestaetigt", quelle: "Eckabstand für Schubladenfreigang" },
    },
    pruefpunkte: [
      { id: "P1", titel: "Maßstab 1:50 bestätigt", beschreibung: "Maßkette und gerechnete Geometrie stimmen überein.", freigabe: "bestaetigt", blockierend: true },
      { id: "P2", titel: "Eckausbildung geprüft", beschreibung: "100 mm Eckabstand, damit Auszüge der angrenzenden Zeile frei laufen.", freigabe: "bestaetigt", blockierend: true },
      { id: "P3", titel: "Türanschlag rechts", beschreibung: "Öffnet in den Raum, kreuzt die kurze Zeile nicht.", freigabe: "bestaetigt", blockierend: true },
    ],
    wohnungen: [],
    gespiegelt: ["WE 13", "WE 15", "WE 17"],
  },
  {
    id: "K-03",
    kurz: "K-03",
    bezeichnung: "Einzeilig, großzügig",
    grundform: "einzeilig",
    raum: { breite: 3600, tiefe: 3000, hoehe: 2600 },
    zeilen: [{ id: "Z1", wand: "nord", start: 0, laenge: 3600, bezeichnung: "Hauptzeile Nordwand" }],
    oeffnungen: [
      { id: "F1", art: "fenster", wand: "nord", von: 2200, breite: 1400, bruestung: 900, hoehe: 1400 },
      { id: "T1", art: "tuer", wand: "sued", von: 2600, breite: 885, anschlag: "links", oeffnetNach: "innen" },
    ],
    zwangspunkte: [
      { id: "FS1", art: "fallstrang", wand: "ost", von: 0, breite: 450, bezeichnung: "Abwasserfallstrang DN 100", herkunft: "gelesen", freigabe: "bestaetigt" },
      { id: "HZ1", art: "heizkoerper", wand: "sued", von: 400, breite: 1200, bezeichnung: "Heizkörper 1.200 mm", herkunft: "gelesen", freigabe: "bestaetigt" },
    ],
    attribute: {
      nischenlaenge: { wert: 3600, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS, Haus A 2. OG" },
      raumtiefe: { wert: 3000, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS" },
      raumhoehe: { wert: 2600, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Schnitt A-A" },
      bruestungshoehe: { wert: 900, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Schnitt A-A" },
    },
    pruefpunkte: [
      { id: "P1", titel: "Maßstab 1:50 bestätigt", beschreibung: "Maßkette 3.600 mm, gerechnet 3.600 mm.", freigabe: "bestaetigt", blockierend: true },
      { id: "P2", titel: "Fensterbreite 1.400 mm", beschreibung: "Oberschränke enden vor der Laibung bei 2.200 mm.", freigabe: "bestaetigt", blockierend: true },
      { id: "P3", titel: "Lage Abwasserfallstrang", beschreibung: "Direkt aus dem Sanitärplan des Geschosses gelesen.", freigabe: "bestaetigt", blockierend: true },
    ],
    wohnungen: [],
    gespiegelt: ["WE 21", "WE 24"],
  },
  {
    id: "K-04",
    kurz: "K-04",
    bezeichnung: "Zweizeilig",
    grundform: "zweizeilig",
    raum: { breite: 3000, tiefe: 3840, hoehe: 2600 },
    zeilen: [
      { id: "Z1", wand: "nord", start: 0, laenge: 3000, bezeichnung: "Zeile Nordwand" },
      { id: "Z2", wand: "sued", start: 0, laenge: 2400, bezeichnung: "Zeile Südwand" },
    ],
    oeffnungen: [
      { id: "F1", art: "fenster", wand: "ost", von: 1200, breite: 1200, bruestung: 900, hoehe: 1400 },
      { id: "T1", art: "tuer", wand: "west", von: 2500, breite: 885, anschlag: "links", oeffnetNach: "aussen" },
    ],
    zwangspunkte: [
      { id: "FS1", art: "fallstrang", wand: "west", von: 0, breite: 450, bezeichnung: "Abwasserfallstrang DN 100", herkunft: "angenommen", freigabe: "offen" },
    ],
    attribute: {
      nischenlaenge: { wert: 3000, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS, Haus B EG" },
      nischenlaenge2: { wert: 2400, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS" },
      gangbreite: { wert: 1240, einheit: "mm", herkunft: "gerechnet", freigabe: "offen", quelle: "Raumtiefe abzüglich zweier Korpustiefen", hinweis: "Liegt über den empfohlenen 1.200 mm, muss aber gegen die Raumtiefe bestätigt werden." },
      raumtiefe: { wert: 3840, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS" },
      raumhoehe: { wert: 2600, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Schnitt B-B" },
      bruestungshoehe: { wert: 900, einheit: "mm", herkunft: "angenommen", freigabe: "offen", quelle: "aus Haus A übernommen", hinweis: "Für Haus B liegt kein Schnitt vor. Wert aus Haus A angenommen." },
    },
    pruefpunkte: [
      { id: "P1", titel: "Maßstab 1:50 bestätigt", beschreibung: "Maßkette und Geometrie stimmen überein.", freigabe: "bestaetigt", blockierend: true },
      { id: "P2", titel: "Brüstungshöhe Haus B", beschreibung: "Für Haus B liegt kein Schnitt vor. Die Brüstungshöhe ist aus Haus A übernommen und muss belegt werden, bevor Oberschränke und Arbeitsplatte festgelegt werden.", freigabe: "offen", blockierend: true },
      { id: "P3", titel: "Lage Abwasserfallstrang", beschreibung: "Im Sanitärplan für Haus B nicht eindeutig. Der Fallstrang ist Zwangspunkt für die Spüle.", freigabe: "offen", blockierend: true },
      { id: "P4", titel: "Gangbreite 1.240 mm", beschreibung: "Gerechnet aus Raumtiefe abzüglich zweier Korpustiefen. Gegen die Örtlichkeit zu bestätigen.", freigabe: "offen", blockierend: false },
    ],
    wohnungen: [],
    gespiegelt: ["WE 29", "WE 31"],
  },
  {
    id: "K-05",
    kurz: "K-05",
    bezeichnung: "L-Form, großzügig",
    grundform: "l-form",
    raum: { breite: 3800, tiefe: 3400, hoehe: 2600 },
    zeilen: [
      { id: "Z1", wand: "nord", start: 0, laenge: 3600, bezeichnung: "Hauptzeile Nordwand" },
      { id: "Z2", wand: "west", start: 700, laenge: 2400, bezeichnung: "Kurze Zeile Westwand" },
    ],
    oeffnungen: [
      { id: "F1", art: "fenster", wand: "ost", von: 800, breite: 1400, bruestung: 900, hoehe: 1400 },
      { id: "T1", art: "tuer", wand: "sued", von: 2400, breite: 885, anschlag: "rechts", oeffnetNach: "innen" },
    ],
    zwangspunkte: [
      { id: "FS1", art: "fallstrang", wand: "west", von: 3000, breite: 450, bezeichnung: "Abwasserfallstrang DN 100", herkunft: "gelesen", freigabe: "bestaetigt" },
    ],
    attribute: {
      nischenlaenge: { wert: 3600, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS, Haus A 3. OG" },
      nischenlaenge2: { wert: 2400, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS" },
      raumtiefe: { wert: 3400, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS" },
      raumhoehe: { wert: 2600, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Schnitt A-A" },
      bruestungshoehe: { wert: 900, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Schnitt A-A" },
      eckausbildung: { wert: 100, einheit: "mm", herkunft: "gerechnet", freigabe: "bestaetigt", quelle: "Eckabstand für Schubladenfreigang" },
    },
    pruefpunkte: [
      { id: "P1", titel: "Maßstab 1:50 bestätigt", beschreibung: "Maßkette und Geometrie stimmen überein.", freigabe: "bestaetigt", blockierend: true },
      { id: "P2", titel: "Eckausbildung geprüft", beschreibung: "100 mm Eckabstand eingeplant.", freigabe: "bestaetigt", blockierend: true },
      { id: "P3", titel: "Lage Abwasserfallstrang", beschreibung: "Aus dem Sanitärplan des Geschosses gelesen.", freigabe: "bestaetigt", blockierend: true },
    ],
    wohnungen: [],
    gespiegelt: ["WE 35"],
  },
  {
    id: "K-06",
    kurz: "K-06",
    bezeichnung: "Einzeilig, barrierearm vorbereitet",
    grundform: "einzeilig",
    raum: { breite: 3000, tiefe: 3300, hoehe: 2600 },
    zeilen: [{ id: "Z1", wand: "nord", start: 0, laenge: 3000, bezeichnung: "Hauptzeile Nordwand" }],
    oeffnungen: [
      { id: "F1", art: "fenster", wand: "nord", von: 1800, breite: 1200, bruestung: 900, hoehe: 1400 },
      { id: "T1", art: "tuer", wand: "sued", von: 1900, breite: 985, anschlag: "links", oeffnetNach: "aussen" },
    ],
    zwangspunkte: [
      { id: "FS1", art: "fallstrang", wand: "ost", von: 0, breite: 450, bezeichnung: "Abwasserfallstrang DN 100", herkunft: "gelesen", freigabe: "bestaetigt" },
    ],
    attribute: {
      nischenlaenge: { wert: 3000, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS, Haus B 1. OG" },
      raumtiefe: { wert: 3300, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Maßkette A-MASS" },
      raumhoehe: { wert: 2600, einheit: "mm", herkunft: "gelesen", freigabe: "bestaetigt", quelle: "Schnitt B-B" },
      bewegungsflaeche: { wert: 1500, einheit: "mm", herkunft: "gerechnet", freigabe: "offen", quelle: "Raumtiefe abzüglich Korpustiefe", hinweis: "1.500 mm sind für Rollstuhlnutzung vorgesehen. Ob das Projekt diese Anforderung verbindlich stellt, ist nicht belegt." },
      arbeitshoehe: { wert: 850, einheit: "mm", herkunft: "angenommen", freigabe: "offen", quelle: "abgesenkt gegenüber Standard 910 mm", hinweis: "Abgesenkte Arbeitshöhe ist eine Projektfestlegung und muss bestätigt werden." },
    },
    pruefpunkte: [
      { id: "P1", titel: "Maßstab 1:50 bestätigt", beschreibung: "Maßkette und Geometrie stimmen überein.", freigabe: "bestaetigt", blockierend: true },
      { id: "P2", titel: "Anforderungsniveau Barrierefreiheit", beschreibung: "Der Typ ist barrierearm vorbereitet. Ob das Projekt eine verbindliche Anforderung stellt, ist aus den Unterlagen nicht belegt. Ohne Festlegung keine Freigabe.", freigabe: "offen", blockierend: true },
      { id: "P3", titel: "Abgesenkte Arbeitshöhe 850 mm", beschreibung: "Weicht vom Projektstandard 910 mm ab. Wirkt auf Anschlusshöhen und Nischenmaße der Geräte.", freigabe: "offen", blockierend: true },
    ],
    wohnungen: [],
    gespiegelt: ["WE 39"],
    hinweis: "Barrierearm ist in dieser Demo eine Projekteigenschaft und keine geprüfte Konformitätszusage.",
  },
];

/** Zuordnung Wohnungen zu Typen. Verbindlich, alle Ansichten rechnen damit. */
const ZUORDNUNG: Array<{ typId: string; von: number; bis: number }> = [
  { typId: "K-01", von: 1, bis: 10 },
  { typId: "K-02", von: 11, bis: 18 },
  { typId: "K-03", von: 19, bis: 26 },
  { typId: "K-04", von: 27, bis: 32 },
  { typId: "K-05", von: 33, bis: 36 },
  { typId: "K-06", von: 37, bis: 40 },
];

const WOHNFLAECHE: Record<string, number> = {
  "K-01": 584,
  "K-02": 781,
  "K-03": 724,
  "K-04": 963,
  "K-05": 1012,
  "K-06": 668,
};

function nr(i: number): string {
  return `WE ${String(i).padStart(2, "0")}`;
}

function geschossFuer(i: number): string {
  const g = Math.floor((i - 1) / 8);
  return g === 0 ? "EG" : `${g}. OG`;
}

export const WOHNUNGEN: Wohnung[] = (() => {
  const liste: Wohnung[] = [];
  for (const z of ZUORDNUNG) {
    const typ = KUECHENTYPEN.find((t) => t.id === z.typId)!;
    for (let i = z.von; i <= z.bis; i++) {
      const name = nr(i);
      typ.wohnungen.push(name);
      // Zwei Raeume derselben Bauzeile sind nie auf den Millimeter gleich.
      // Die Abweichung zum Nennmass des Typs bleibt im Toleranzband und
      // wird spaeter von der Passblende aufgenommen — das ist der Kern der
      // Typisierung und steht deshalb an der Einheit, nicht nur im Text.
      const abw = (((i * 37) % 27) - 13) * 5;
      const nische = typ.attribute.nischenlaenge.wert + abw;
      liste.push({
        nr: name,
        haus: i <= 20 ? "A" : "B",
        geschoss: geschossFuer(i),
        wohnflaeche: WOHNFLAECHE[z.typId] + ((i * 3) % 7) * 10,
        typId: z.typId,
        gespiegelt: typ.gespiegelt.includes(name),
        nischenlaenge: nische,
        abweichung: abw,
        messpunkte: [
          { id: "M1", bezeichnung: "Nischenlänge Hauptzeile", planmass: nische, istmass: null },
          { id: "M2", bezeichnung: "Raumtiefe", planmass: typ.attribute.raumtiefe.wert, istmass: null },
          { id: "M3", bezeichnung: "Raumhöhe", planmass: typ.attribute.raumhoehe.wert, istmass: null },
          { id: "M4", bezeichnung: "Wandversatz linke Ecke", planmass: 0, istmass: null },
          ...(typ.attribute.nischenlaenge2
            ? [{ id: "M5", bezeichnung: "Nischenlänge zweite Zeile", planmass: typ.attribute.nischenlaenge2.wert, istmass: null }]
            : []),
        ],
      });
    }
  }
  return liste;
})();

/**
 * Wie weit die Nischenlänge einer Einheit vom Nennmaß ihres Typs abweichen
 * darf, ohne dass sie einen eigenen Typ braucht. Alles darunter nimmt die
 * Passblende auf.
 */
export const TOLERANZBAND = 80;

/** Spanne der Nischenlängen innerhalb eines Typs. */
export function nischenspanne(typId: string): { von: number; bis: number; groesste: number } {
  const werte = WOHNUNGEN.filter((w) => w.typId === typId);
  if (werte.length === 0) return { von: 0, bis: 0, groesste: 0 };
  return {
    von: Math.min(...werte.map((w) => w.nischenlaenge)),
    bis: Math.max(...werte.map((w) => w.nischenlaenge)),
    groesste: Math.max(...werte.map((w) => Math.abs(w.abweichung))),
  };
}

export function typFuer(typId: string): Kuechentyp {
  const t = KUECHENTYPEN.find((x) => x.id === typId);
  if (!t) throw new Error(`Unbekannter Typ: ${typId}`);
  return t;
}

export function istFreigegeben(typ: Kuechentyp): boolean {
  return typ.pruefpunkte.filter((p) => p.blockierend).every((p) => p.freigabe === "bestaetigt");
}

export const DOKUMENTE: Dokument[] = [
  { id: "D1", name: "Haus_A_EG_Grundriss.pdf", format: "Vektor-PDF", groesse: "1,8 MB", datum: "12.08.2026", urheber: "Hestermann Architekten", status: "verarbeitet", zuordnung: "Haus A, EG — WE 01–08", hinweis: "Vektorebene gelesen, 8 Einheiten zugeordnet" },
  { id: "D2", name: "Haus_A_OG_Grundriss.pdf", format: "Vektor-PDF", groesse: "2,1 MB", datum: "12.08.2026", urheber: "Hestermann Architekten", status: "verarbeitet", zuordnung: "Haus A, 1.–3. OG — WE 09–20", hinweis: "Vektorebene gelesen, 12 Einheiten zugeordnet" },
  { id: "D3", name: "Haus_B_Grundrisse.pdf", format: "Vektor-PDF", groesse: "2,4 MB", datum: "14.08.2026", urheber: "Hestermann Architekten", status: "pruefung", zuordnung: "Haus B — WE 21–40", hinweis: "Gelesen, aber ohne zugehörigen Schnitt. Brüstungshöhen fehlen." },
  { id: "D4", name: "Kuechenanschluesse_A.dxf", format: "DXF R2018", groesse: "640 KB", datum: "19.08.2026", urheber: "Brinkmann TGA", status: "verarbeitet", zuordnung: "Haus A — Fallstränge, Elektro", hinweis: "Objekte gelesen, Fallstränge übernommen" },
  { id: "D5", name: "Schnitt_A-A.pdf", format: "Vektor-PDF", groesse: "820 KB", datum: "12.08.2026", urheber: "Hestermann Architekten", status: "verarbeitet", zuordnung: "Haus A — Brüstungs- und Raumhöhen", hinweis: "Brüstungshöhe 900 mm, Raumhöhe 2.600 mm" },
  { id: "D6", name: "Baubeschreibung.pdf", format: "PDF, Text", groesse: "310 KB", datum: "02.08.2026", urheber: "Stadtpark Wohnbau GmbH", status: "verarbeitet", zuordnung: "Projekt", hinweis: "Ausstattungsniveau und Budgetrahmen entnommen" },
  { id: "D7", name: "Bestand_Altbau_Scan.jpg", format: "Rasterbild", groesse: "4,2 MB", datum: "20.08.2026", urheber: "unbekannt", status: "nicht-lesbar", zuordnung: "keine", hinweis: "Keine Vektorebene. Rasterpläne sind nicht Teil des definierten Funktionsumfangs." },
];

export const REGELN: Regel[] = [
  { id: "K1-01", kategorie: "K1", titel: "Schutzbereich Elektro an der Spüle", beschreibung: "Steckdosen halten den geforderten seitlichen Abstand zum Spülbecken ein.", quelle: "VDE-Regelwerk, im Prototyp nicht fachlich geprüft", art: "hart" },
  { id: "K1-02", kategorie: "K1", titel: "Abstand Kochfeld zur Dunstesse", beschreibung: "Mindestabstand nach Herstellerangabe des jeweiligen Geräts.", quelle: "Gerätedokumentation", art: "hart" },
  { id: "K1-03", kategorie: "K1", titel: "Kochfeld nicht direkt an der Seitenwand", beschreibung: "Seitlicher Mindestabstand zu angrenzenden Bauteilen.", quelle: "Gerätedokumentation", art: "hart" },
  { id: "K1-04", kategorie: "K1", titel: "Abluftführung nachweisbar", beschreibung: "Abluftbetrieb nur bei nachgewiesener Schachtnutzung, sonst Umluft.", quelle: "Lüftungskonzept des Projekts", art: "hart" },
  { id: "K2-01", kategorie: "K2", titel: "Korpusraster eingehalten", beschreibung: "Modulbreiten folgen dem Raster 600 / 450 / 150 mm.", quelle: "Koordinationsmaße, DIN EN 1116 in der Fassung von 2018", art: "hart" },
  { id: "K2-02", kategorie: "K2", titel: "Summe der Modulbreiten gleich Nischenlänge", beschreibung: "Belegung plus Passblende ergibt exakt die Nischenlänge.", quelle: "Koordinationsmaße", art: "hart" },
  { id: "K2-03", kategorie: "K2", titel: "Gerätenischenmaße eingehalten", beschreibung: "Einbaugeräte passen in die vorgesehenen Korpusse.", quelle: "Programmunterlagen des Partnerlieferanten", art: "hart" },
  { id: "K2-04", kategorie: "K2", titel: "Passblende über Mindestmaß", beschreibung: "Restmaße unterhalb des kleinsten Fertigungsmaßes sind unbaubar.", quelle: "Programmunterlagen des Partnerlieferanten", art: "hart" },
  { id: "K2-05", kategorie: "K2", titel: "Hängeschrank nicht vor Fensteröffnung", beschreibung: "Oberschränke enden vor der Fensterlaibung.", quelle: "Koordinationsmaße und Projektfestlegung", art: "hart" },
  { id: "K3-01", kategorie: "K3", titel: "Arbeitsfläche zwischen Spüle und Kochfeld", beschreibung: "Je länger die zusammenhängende Fläche, desto besser die Bewertung.", quelle: "Ergonomieempfehlung der Branche", art: "bewertet" },
  { id: "K3-02", kategorie: "K3", titel: "Bewegungsfläche vor der Zeile", beschreibung: "Mindestens 1.200 mm, darüber Bonus.", quelle: "Ergonomieempfehlung der Branche", art: "bewertet" },
  { id: "K3-03", kategorie: "K3", titel: "Weg von der Spüle zum Fallstrang", beschreibung: "Kurze Wege senken den Installationsaufwand.", quelle: "Praxisregel", art: "bewertet" },
  { id: "K3-04", kategorie: "K3", titel: "Kühlschrank nicht direkt neben dem Backofen", beschreibung: "Klimazonen trennen.", quelle: "Ergonomieempfehlung der Branche", art: "bewertet" },
  { id: "K3-05", kategorie: "K3", titel: "Wiederverwendung eines Projekttyps", beschreibung: "Eine Variante, die einem bereits verwendeten Typ entspricht, erhält einen Bonus.", quelle: "Projektlogik", art: "bewertet" },
];
