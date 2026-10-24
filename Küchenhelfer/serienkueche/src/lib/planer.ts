import { istBekanntesModul, modul } from "@/data/module";
import { geraet, STANDARD_GERAETE, type Geraetewahl } from "@/data/geraete";
import { istHoch, ROLLE_NAME, rolleVon } from "@/lib/masse";
import type { Kuechentyp, Oeffnung, Wandseite, Zeile } from "@/lib/typen";
import type { VarianteRoh } from "@/data/varianten";

/**
 * Planer für frei eingegebene Räume.
 *
 * Der Raum ist ein Rechteck mit vier benannten Wänden. Je Wand wird erfasst,
 * wie viel davon die Küche belegen darf — dadurch können die linke und die
 * rechte Seite einer U-Küche unterschiedlich lang sein, obwohl die Wände im
 * Rechteck gleich lang sind: eine Tür oder ein Durchgang frisst Platz.
 *
 * Hier stecken die Regeln, die ein Laie nicht kennt: Rastermaße, Abstand
 * neben dem Kochfeld, nichts Hohes vor dem Fenster, Spüle nah am Abfluss.
 */

export type Raumform = "eine-wand" | "ecke" | "zwei-waende" | "u-form";
export type WandId = "haupt" | "links" | "rechts" | "gegenueber";

export interface Raumangaben {
  form: Raumform;
  /** Drehung der Küche im Raum, in Vierteln im Uhrzeigersinn (0 bis 3).
      Deckt alles ab: an welcher Wand eine Zeile steht, welche Ecke genutzt
      wird und wohin eine U-Form offen ist. */
  ausrichtung: number;
  /** Länge der Haupt- und der gegenüberliegenden Wand in mm. */
  breite: number;
  /** Länge der beiden Seitenwände in mm. */
  tiefe: number;
  /** Wie viel jeder Wand die Küche belegen darf. */
  nutz: Record<WandId, number>;
  /** Hat der Nutzer die Zeilenlängen selbst gesetzt? Solange nicht, leiten
      wir sie aus Wandlänge und Tür ab — eine Tür frisst Wand. */
  nutzHand: boolean;
  fenster: { wand: WandId; von: number; breite: number } | null;
  tuer: { wand: WandId; von: number; breite: number };
  wasser: { wand: WandId; von: number };
  geraete: Geraetewahl;
  /** Backofen auf Griffhöhe statt unter dem Kochfeld. Kostet 60 cm Wand
      über die ganze Höhe, dafür muss sich niemand bücken. */
  ofenHoch: boolean;
  niveau: "einfach" | "mittel" | "gehoben";
}

export const WANDNAME: Record<WandId, string> = {
  haupt: "Hauptwand",
  links: "linke Wand",
  rechts: "rechte Wand",
  gegenueber: "Wand gegenüber",
};

export const FORMEN: Array<{ id: Raumform; titel: string; erklaerung: string }> = [
  { id: "eine-wand", titel: "Eine Wand", erklaerung: "Alles in einer geraden Zeile. Der häufigste Fall." },
  { id: "ecke", titel: "Über Eck", erklaerung: "Zwei Wände im rechten Winkel. Mehr Arbeitsfläche." },
  { id: "zwei-waende", titel: "Zwei Wände gegenüber", erklaerung: "Zwei Zeilen mit einem Gang dazwischen." },
  { id: "u-form", titel: "U-Form", erklaerung: "Drei Wände. Der meiste Stauraum." },
];

/** Wände im Uhrzeigersinn, für die Drehung. */
const ZYKLUS: WandId[] = ["haupt", "rechts", "gegenueber", "links"];

export function drehe(w: WandId, viertel: number): WandId {
  return ZYKLUS[(ZYKLUS.indexOf(w) + ((viertel % 4) + 4)) % 4];
}

export function kuechenwaende(a: Pick<Raumangaben, "form" | "ausrichtung">): WandId[] {
  const basis: WandId[] =
    a.form === "eine-wand" ? ["haupt"]
    : a.form === "ecke" ? ["haupt", "links"]
    : a.form === "zwei-waende" ? ["haupt", "gegenueber"]
    : ["links", "haupt", "rechts"];
  return basis.map((w) => drehe(w, a.ausrichtung));
}

/** Wie viele Drehungen bei dieser Form unterscheidbar sind. */
export function drehungen(form: Raumform): number {
  return form === "zwei-waende" ? 2 : 4;
}

/** Dieselben Waende im Dativ — "an der linken Wand", nicht "an der linke Wand". */
export const WANDNAME_DAT: Record<WandId, string> = {
  haupt: "Hauptwand",
  links: "linken Wand",
  rechts: "rechten Wand",
  gegenueber: "Wand gegenüber",
};

/** Was die Drehung dem Nutzer sagt. */
export function drehungName(form: Raumform, ausrichtung: number): string {
  const w = kuechenwaende({ form, ausrichtung });
  if (form === "u-form") {
    const offen = ZYKLUS.find((x) => !w.includes(x))!;
    return `offen zur ${WANDNAME_DAT[offen]}`;
  }
  if (form === "ecke") return `Ecke ${WANDNAME[w[0]]} / ${WANDNAME[w[1]]}`;
  if (form === "zwei-waende") return `${WANDNAME[w[0]]} und ${WANDNAME[w[1]]}`;
  return `an der ${WANDNAME_DAT[w[0]]}`;
}

export function wandlaenge(a: Raumangaben, w: WandId): number {
  return w === "haupt" || w === "gegenueber" ? a.breite : a.tiefe;
}

export const STANDARD_RAUM: Raumangaben = {
  form: "eine-wand",
  ausrichtung: 0,
  breite: 3400,
  tiefe: 2800,
  nutz: { haupt: 3400, links: 2800, rechts: 2800, gegenueber: 3400 },
  fenster: { wand: "haupt", von: 2000, breite: 1200 },
  tuer: { wand: "gegenueber", von: 1800, breite: 885 },
  wasser: { wand: "haupt", von: 2500 },
  geraete: { ...STANDARD_GERAETE },
  nutzHand: false,
  ofenHoch: false,
  niveau: "mittel",
};

/** Abstand, der neben einer Tür frei bleiben muss, damit sie aufgeht. */
const TUERLUFT = 150;

/** Nutzlängen an geänderte Wandlängen angleichen. */
export function angleichen(a: Raumangaben): Raumangaben {
  /* Eine gespeicherte Raumform, die es nicht mehr gibt, liess
     `alsKuechentyp` auf `FORMEN.find(...).titel` auflaufen — und damit die
     ganze Fragestrecke weiss werden. Hier einmal geradeziehen. */
  if (!FORMEN.some((f) => f.id === a.form)) a = { ...a, form: STANDARD_RAUM.form };
  const nutz = { ...a.nutz };
  for (const w of ["haupt", "links", "rechts", "gegenueber"] as WandId[]) {
    nutz[w] = Math.min(nutz[w], wandlaenge(a, w));
  }
  const fenster = a.fenster
    ? (() => {
        // Erst die Breite an die Wand klemmen, dann die Lage — sonst passt
        // ein 3,20-m-Fenster in eine 2,40-m-Wand und die Warnung dazu
        // erscheint erst zwei Schritte spaeter.
        const l = wandlaenge(a, a.fenster.wand);
        const breite = Math.max(400, Math.min(a.fenster.breite, l));
        return { ...a.fenster, breite, von: Math.min(a.fenster.von, Math.max(0, l - breite)) };
      })()
    : null;
  const tuer = { ...a.tuer, von: Math.min(a.tuer.von, Math.max(0, wandlaenge(a, a.tuer.wand) - a.tuer.breite)) };
  const wasser = { ...a.wasser, von: Math.min(a.wasser.von, wandlaenge(a, a.wasser.wand)) };
  return { ...a, nutz, fenster, tuer, wasser };
}

/* ---------------------------------------------------------------- */

const SEITE: Record<WandId, Wandseite> = {
  haupt: "nord",
  links: "west",
  rechts: "ost",
  gegenueber: "sued",
};

const KORPUSTIEFE = 600;

/**
 * Wo die Küchenzeile an einer Wand anfängt und wie lang sie ist.
 *
 * An einer Ecke beginnt die anschließende Zeile hinter der Korpustiefe der
 * ersten, sonst stoßen die Schränke zusammen. Und liegt die Tür auf dieser
 * Wand, bleibt nur die längere der beiden freien Seiten übrig — mitsamt der
 * Luft, die die Tür zum Aufschlagen braucht. Vorher wurde die Tür hier gar
 * nicht beachtet, und die Zeile lief mitten durch sie hindurch.
 */
export function zeilenBereich(a: Raumangaben, w: WandId): { start: number; laenge: number } {
  const L = wandlaenge(a, w);
  const waende = kuechenwaende(a);

  // An welchem Ende liegt die gemeinsame Ecke?
  //
  // Die Wände laufen im Uhrzeigersinn: das Ende der einen Wand ist der
  // Anfang der nächsten. Bei "Über Eck" ist die Reihenfolge aber
  // [haupt, links] — links kommt im Uhrzeigersinn VOR haupt. Der Abstand
  // wurde trotzdem immer an den Zeilenanfang gelegt, also an das falsche
  // Ende: beide Bänder lagen in derselben Ecke übereinander, und am
  // anderen Ende blieb ein Streifen leer.
  let vorn = 0;
  let hinten = 0;
  if (a.form !== "zwei-waende" && waende.length > 1) {
    const i = waende.indexOf(w);
    const z = ZYKLUS.indexOf(w);
    const davorImKreis = ZYKLUS[(z + 3) % 4];
    const danachImKreis = ZYKLUS[(z + 1) % 4];
    // Nur eine der beiden Wände an einer Ecke weicht aus — die spätere.
    if (waende.indexOf(davorImKreis) >= 0 && waende.indexOf(davorImKreis) < i) vorn = KORPUSTIEFE;
    if (waende.indexOf(danachImKreis) >= 0 && waende.indexOf(danachImKreis) < i) hinten = KORPUSTIEFE;
  }
  const eckstart = vorn;
  const eckende = L - hinten;

  let von = eckstart;
  let bis = eckende;
  if (a.tuer.wand === w) {
    const davor = { von: eckstart, bis: Math.max(eckstart, Math.min(eckende, a.tuer.von - TUERLUFT)) };
    const dahinter = { von: Math.max(eckstart, a.tuer.von + a.tuer.breite + TUERLUFT), bis: eckende };
    const beste = dahinter.bis - dahinter.von > davor.bis - davor.von ? dahinter : davor;
    von = beste.von;
    bis = beste.bis;
  }
  const frei = Math.max(0, bis - von);
  return { start: von, laenge: a.nutzHand ? Math.min(frei, a.nutz[w]) : frei };
}

export function zeilenStart(a: Raumangaben, w: WandId): number {
  return zeilenBereich(a, w).start;
}

export function alsKuechentyp(a: Raumangaben): Kuechentyp {
  const zeilen: Zeile[] = kuechenwaende(a).map((w) => {
    const { start, laenge } = zeilenBereich(a, w);
    return { id: `Z-${w}`, wand: SEITE[w], start, laenge, bezeichnung: WANDNAME[w] };
  });

  const oeffnungen: Oeffnung[] = [];
  if (a.fenster) {
    oeffnungen.push({
      id: "F1", art: "fenster", wand: SEITE[a.fenster.wand],
      von: a.fenster.von, breite: a.fenster.breite, bruestung: 900, hoehe: 1400,
    });
  }
  oeffnungen.push({
    id: "T1", art: "tuer", wand: SEITE[a.tuer.wand],
    von: a.tuer.von, breite: a.tuer.breite, anschlag: "links", oeffnetNach: "innen",
  });

  return {
    id: "MEINE",
    kurz: "Meine Küche",
    bezeichnung: FORMEN.find((f) => f.id === a.form)!.titel,
    grundform: a.form === "zwei-waende" ? "zweizeilig" : a.form === "eine-wand" ? "einzeilig" : "l-form",
    raum: { breite: a.breite, tiefe: a.tiefe, hoehe: 2600 },
    zeilen,
    oeffnungen,
    zwangspunkte: [
      {
        id: "W1", art: "fallstrang", wand: SEITE[a.wasser.wand],
        von: Math.max(0, a.wasser.von - 200), breite: 400,
        bezeichnung: "Wasseranschluss", herkunft: "erfasst", freigabe: "bestaetigt",
      },
    ],
    attribute: {},
    pruefpunkte: [],
    wohnungen: [],
    gespiegelt: [],
  };
}

/* ---------------------------------------------------------------- */

export type Strategie = "guenstig" | "stauraum" | "arbeiten";

export const STRATEGIEN: Array<{ id: Strategie; titel: string; satz: string }> = [
  { id: "guenstig", titel: "Sparsam", satz: "Wenige teure Teile, kurze Leitungswege." },
  { id: "stauraum", titel: "Viel Stauraum", satz: "Breite Auszüge statt schmaler Schränke." },
  { id: "arbeiten", titel: "Zum Kochen", satz: "Viel freie Fläche zwischen Spüle und Herd." },
];

export interface Vorschlag {
  strategie: Strategie;
  titel: string;
  moeglich: boolean;
  grund?: string;
  belegung: Record<string, string[]>;
  haengeschraenke: number;
  variante: VarianteRoh;
  preis: number;
  arbeitsflaeche: number;
  wegZumWasser: number;
  passblende: number;
  gutPunkte: string[];
  achtungPunkte: string[];
  /** Der Preis in seinen Posten — damit die Stückliste aufgeht. */
  kosten: Kosten;
  /** Führt diese Strategie zum selben Plan wie eine frühere? Dann steht sie
      nicht als eigene Karte da. */
  gleichWie?: Strategie;
  /** Welche anderen Wege hier zum selben Plan führen. */
  auchAls?: string[];
}

/** Die Posten, aus denen sich der Preis zusammensetzt. Alles EUR netto. */
/**
 * Wo ein Hängeschrank hinpasst: über jedem breiten Unterschrank, der kein
 * Hochschrank ist und nicht vor dem Fenster steht. Die Unterlagen brauchen
 * die einzelnen Plätze, der Preis nur ihre Zahl — darum eine Quelle.
 */
/**
 * Hängeschränke nach Breite.
 *
 * Es gab drei Regeln für eine Sache: die Geometrie gab jeden Platz ab 450 mm
 * frei, der Preis rechnete jeden davon als 600er, und die Bestellung nannte
 * ihn auch so. Über einem 450er Unterschrank hängt aber ein 450er Schrank —
 * er kostet 29 EUR weniger und hat eine eigene Artikelnummer.
 */
export function haengemodule(
  typ: Kuechentyp,
  belegung: Record<string, string[]>,
): Array<{ id: string; anzahl: number }> {
  const zahl = new Map<string, number>();
  for (const h of haengeplaetze(typ, belegung)) {
    const id = h.bis - h.von >= 600 ? "HS600" : "HS450";
    zahl.set(id, (zahl.get(id) ?? 0) + 1);
  }
  return [...zahl]
    .sort((a, b) => (modul(b[0]).breite ?? 0) - (modul(a[0]).breite ?? 0))
    .map(([id, anzahl]) => ({ id, anzahl }));
}

export function haengeplaetze(
  typ: Kuechentyp,
  belegung: Record<string, string[]>,
): Array<{ zeileId: string; wand: string; von: number; bis: number }> {
  const aus: Array<{ zeileId: string; wand: string; von: number; bis: number }> = [];
  for (const z of typ.zeilen) {
    const f = typ.oeffnungen.find((o) => o.art === "fenster" && o.wand === z.wand);
    let x = 0;
    for (const id of belegung[z.id] ?? []) {
      const b = modul(id).breite ?? 0;
      const kat = modul(id).kategorie;
      const stoert = f ? x < f.von + f.breite - z.start && x + b > f.von - z.start : false;
      if (kat !== "hochschrank" && kat !== "blende" && b >= 450 && !stoert) {
        aus.push({ zeileId: z.id, wand: z.bezeichnung, von: x, bis: x + b });
      }
      x += b;
    }
  }
  return aus;
}

/**
 * Laufende Millimeter Arbeitsplatte.
 *
 * Über Hoch- und Kühlschränke läuft keine Platte — die gehen bis oben durch.
 * Gerechnet wurde bisher die ganze Zeilenlänge: je Hochschrank waren 600 mm
 * Platte bezahlt, die im Zuschnitt gar nicht auftauchten.
 */
export function platteLaenge(typ: Kuechentyp, belegung: Record<string, string[]>): number {
  let mm = 0;
  for (const z of typ.zeilen) {
    for (const id of belegung[z.id] ?? []) {
      // Nicht "ist das ein Kuehlschrank", sondern "reicht der Schrank bis
      // oben". Ueber einem Kuehlschrank unter der Platte laeuft die Platte
      // durch — das sagt der Geraetetext selbst.
      if (istHoch(id)) continue;
      mm += modul(id).breite ?? 0;
    }
  }
  return mm;
}

/**
 * Freie Arbeitsfläche zwischen Spüle und Kochfeld, über Zeilengrenzen hinweg.
 *
 * Gemessen wurde das vorher nur innerhalb der Hauptzeile. Die Verteilung legt
 * das Kochfeld aber absichtlich an eine andere Wand — bei jeder Eck-, Zwei-
 * Wand- und U-Form stand deshalb "Arbeitsfläche 0 cm", und die Vorschlagskarte
 * behauptete "Spüle und Herd nebeneinander".
 *
 * Die Küche wird als ein durchlaufendes Band gelesen, in der Reihenfolge der
 * Küchenwände. Hochschränke zählen nicht mit: über ihnen liegt keine Platte.
 * Zwischen zwei Zeilen liegt die Ecke, die als Arbeitsfläche taugt.
 */
export function freieFlaeche(
  a: Raumangaben,
  typ: Kuechentyp,
  belegung: Record<string, string[]>,
): number {
  const band: Array<{ id: string; breite: number }> = [];
  const waende = kuechenwaende(a);
  waende.forEach((w, i) => {
    const ids = belegung[`Z-${w}`] ?? [];
    if (i > 0 && ids.length > 0) {
      // Zwei gegenüberliegende Wände stoßen nicht aneinander — dazwischen
      // liegt der Raum, keine Arbeitsfläche.
      const vorher = waende[i - 1];
      const benachbart = Math.abs(ZYKLUS.indexOf(w) - ZYKLUS.indexOf(vorher)) % 2 === 1;
      band.push({ id: benachbart ? "ECKE" : "LUECKE", breite: benachbart ? KORPUSTIEFE : 0 });
    }
    for (const id of ids) band.push({ id, breite: modul(id).breite ?? 0 });
  });
  const iSp = band.findIndex((x) => x.id === "SP600");
  const iKf = band.findIndex((x) => x.id === "KF600");
  if (iSp < 0 || iKf < 0) return 0;
  let mm = 0;
  for (let i = Math.min(iSp, iKf) + 1; i < Math.max(iSp, iKf); i++) {
    if (band[i].id === "LUECKE") return 0;
    if (band[i].id !== "ECKE" && istHoch(band[i].id)) continue;
    mm += band[i].breite;
  }
  return mm;
}

export interface Kosten {
  korpusse: number;
  haenge: number;
  platte: number;
  sockel: number;
  spuele: number;
  montage: number;
  /** Summe vor dem Ausstattungszuschlag. */
  moebel: number;
  zuschlag: number;
  geraete: number;
  gesamt: number;
}

export function pflichtmodule(a: Raumangaben): string[] {
  const g = a.geraete;
  const liste = ["SP600"];
  if (geraet(g.kochfeld).breite > 0) liste.push("KF600");
  const ks = geraet(g.kuehlschrank);
  if (ks.bau === "hoch") liste.push("HK600");
  else if (ks.bau === "unterbau") liste.push("KS600");
  if (a.ofenHoch && geraet(g.backofen).breite > 0) liste.push("HB600");
  const gs = geraet(g.spuelmaschine);
  if (gs.breite === 600) liste.push("GS600");
  else if (gs.breite === 450) liste.push("GS450");
  return liste;
}

/**
 * Welche Pflichtmodule in welche Zeile kommen.
 *
 * Vorher wurde einfach die erste Zeile vollgepackt — dann standen Spüle,
 * Geschirrspüler, Kühlschrank und Kochfeld alle an einer Wand, und die Spüle
 * lag irgendwo, nur nicht am Wasseranschluss. Jetzt entscheidet die Sache
 * selbst: die Spüle will ans Wasser, die Spülmaschine daneben, das Kochfeld
 * möglichst an eine andere Wand, und die Hochschränke dorthin, wo noch Platz
 * ist.
 */
function verteile(
  typ: Kuechentyp,
  a: Raumangaben,
  pflicht: string[],
): { zu: Record<string, string[]>; uebrig: string[] } {
  const zu: Record<string, string[]> = {};
  const frei: Record<string, number> = {};
  for (const z of typ.zeilen) {
    zu[z.id] = [];
    frei[z.id] = z.laenge;
  }
  const offen = [...pflicht];

  const lege = (id: string, zeileId: string) => {
    const b = modul(id).breite ?? 0;
    if ((frei[zeileId] ?? -1) < b) return false;
    zu[zeileId].push(id);
    frei[zeileId] -= b;
    const i = offen.indexOf(id);
    if (i >= 0) offen.splice(i, 1);
    return true;
  };
  /** Die Zeile mit dem meisten freien Platz, wahlweise ohne eine bestimmte. */
  const weiteste = (ausser?: string) => {
    const k = typ.zeilen.filter((z) => z.id !== ausser).sort((x, y) => frei[y.id] - frei[x.id])[0];
    return k?.id;
  };

  // Spüle ans Wasser, sonst dorthin, wo am meisten Platz ist.
  const wasserZeile = typ.zeilen.find((z) => z.wand === SEITE[a.wasser.wand])?.id;
  const spuelZeile =
    (wasserZeile && frei[wasserZeile] >= 600 ? wasserZeile : weiteste()) ?? typ.zeilen[0]?.id;
  if (spuelZeile && offen.includes("SP600")) lege("SP600", spuelZeile);

  // Spülmaschine direkt daneben — dann teilen sich beide den Anschluss.
  for (const id of ["GS600", "GS450"]) {
    if (spuelZeile && offen.includes(id) && lege(id, spuelZeile)) break;
  }

  // Kochfeld lieber an eine andere Wand als die Spüle: das gibt Arbeitsfläche
  // dazwischen, statt beides nebeneinander.
  if (offen.includes("KF600")) {
    const andere = weiteste(spuelZeile);
    const ziel = andere && (frei[andere] ?? 0) >= 600 ? andere : spuelZeile;
    if (ziel) lege("KF600", ziel);
  }

  // Hochschränke dorthin, wo noch am meisten frei ist.
  for (const id of ["HK600", "HB600"]) {
    if (!offen.includes(id)) continue;
    const ziel = weiteste();
    if (ziel) lege(id, ziel);
  }

  // Was übrig ist, kommt in die jeweils freieste Zeile.
  for (const id of [...offen]) {
    const ziel = weiteste();
    if (ziel) lege(id, ziel);
  }
  // Was dann noch offen ist, passt in keine einzelne Zeile. Das stillschweigend
  // liegen zu lassen hiess: der Nutzer waehlt einen Backofen auf Griffhoehe,
  // bekommt keinen Hochschrank dafuer — und zahlt das Geraet trotzdem.
  return { zu, uebrig: offen };
}

function breiteVon(ids: string[]): number {
  return ids.reduce((s, id) => s + (modul(id).breite ?? 0), 0);
}

/**
 * Woraus eine Strategie den Rest der Zeile füllt.
 *
 * Vorher nahmen zwei der drei Strategien denselben Schrank — bei Räumen ohne
 * Spielraum kamen dann zwei identische Vorschläge heraus, und drei gleiche
 * Karten nebeneinander sehen aus wie ein Fehler. Die Schränke unterscheiden
 * sich jetzt so, wie die Karten es versprechen: Tür und Boden ist das
 * günstigste pro Meter, der Apothekerauszug fasst am meisten, Auszüge sind
 * der Mittelweg.
 */
const FUELLER: Record<Strategie, { breit: string; schmal: string; schmaler: string }> = {
  guenstig: { breit: "UT600", schmal: "UT450", schmaler: "US300" },
  stauraum: { breit: "AZ600", schmal: "US450", schmaler: "AZ300" },
  arbeiten: { breit: "US600", schmal: "US450", schmaler: "US300" },
};

function fuellung(rest: number, strategie: Strategie): string[] {
  const { breit, schmal, schmaler } = FUELLER[strategie];
  /* Die 300er Schränke fehlten in der Füllung.
     Blieben 300 mm übrig, wurden sie zur Passleiste — und der Plan warnte
     im selben Atemzug, 300 mm Passleiste seien zu viel und ein Betrieb
     würde "einen Schrank breiter wählen". Den Schrank gab es im Katalog
     (US300, AZ300), die Füllung griff nur nicht danach. */
  const stufen: Array<[number, string]> = [[600, breit], [450, schmal], [300, schmaler]];
  let beste: number[] = [0, 0, 0];
  let bestBelegt = -1;
  let besteTeile = Infinity;
  for (let a = 0; a * 600 <= rest; a++) {
    for (let b = 0; a * 600 + b * 450 <= rest; b++) {
      for (let c = 0; a * 600 + b * 450 + c * 300 <= rest; c++) {
        const belegt = a * 600 + b * 450 + c * 300;
        const teile = a + b + c;
        // Erst so viel Wand nutzen wie möglich, dann mit so wenig Schränken
        // wie möglich — zwei schmale sind teurer und unruhiger als ein breiter.
        if (belegt > bestBelegt || (belegt === bestBelegt && teile < besteTeile)) {
          bestBelegt = belegt; besteTeile = teile; beste = [a, b, c];
        }
      }
    }
  }
  const aus = stufen.flatMap(([, id], i) => Array<string>(beste[i]).fill(id));
  const uebrig = rest - bestBelegt;
  // Auch wenige Millimeter bekommen eine Leiste. Sonst ginge die Zeile nicht
  // auf, und genau das passiert, wenn eine Tür die Wandlänge krumm macht.
  if (uebrig > 0) aus.push(`PBX:${uebrig}`);
  return aus;
}

export function lageIn(ids: string[], index: number) {
  const von = ids.slice(0, index).reduce((s, m) => s + (modul(m).breite ?? 0), 0);
  return { von, bis: von + (modul(ids[index]).breite ?? 0) };
}

/* Die Reihenfolge wird gesucht, nicht geraten.
   Bei hoechstens acht Modulen sind alle unterscheidbaren Anordnungen
   schnell durchgezaehlt. Jede wird gegen die harten Regeln geprueft und
   nach dem Ziel der Strategie bewertet. Das haelt die Fensterregel auch
   dann ein, wenn dafuer mehrere Module tauschen muessen. */

const RESTRIKTIV = ["HK600", "HB600", "KF600"];
const SEITENABSTAND_KOCHFELD = 300;

/**
 * Alle unterscheidbaren Reihenfolgen.
 *
 * Die alte Grenze von 20.000 Kandidaten schnitt nicht quer durch das Feld,
 * sondern am Anfang ab: aufgezählt wird lexikografisch, also blieben bei
 * neun Modulen nur die Reihenfolgen übrig, die mit Spüle oder Spülmaschine
 * beginnen. Dadurch brach der Planer seine eigene Regel "Spülmaschine neben
 * die Spüle" — bei 4,60 m standen sie an den entgegengesetzten Enden.
 *
 * Vollständig aufzählen, prüfen und bewerten kostet gemessen unter 30 ms bis
 * elf Module. Die Grenze liegt jetzt so hoch, dass sie erst jenseits dessen
 * greift, was ein Wohnungsraum hergibt, und sie wird gemeldet.
 */
const HOCH = ["HK600", "HB600"];

function zulaessig(ids: string[], laenge: number, zone: { von: number; bis: number } | null): boolean {
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    // Neben dem Kochfeld darf kein Hochschrank stehen: Hitze neben dem
    // Kuehlschrank, und auf der Seite bleibt keine Flaeche zum Abstellen.
    if (id === "KF600" && (HOCH.includes(ids[i - 1]) || HOCH.includes(ids[i + 1]))) return false;
    if (!RESTRIKTIV.includes(id)) continue;
    const { von, bis } = lageIn(ids, i);
    if (zone && von < zone.bis && bis > zone.von) return false;
    if (id === "KF600" && Math.min(von, laenge - bis) < SEITENABSTAND_KOCHFELD) return false;
  }
  return true;
}

/**
 * Dieselben harten Regeln wie `zulaessig`, aber mit einem Satz dazu.
 *
 * Die Suche braucht nur ja oder nein. Wenn aber eine von Hand gebaute
 * Anordnung an der neuen Geometrie scheitert, will der Nutzer wissen, woran.
 */
export function hartePruefung(
  ids: string[],
  laenge: number,
  zone: { von: number; bis: number } | null,
): string | null {
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (id === "KF600" && (HOCH.includes(ids[i - 1]) || HOCH.includes(ids[i + 1]))) {
      return "neben dem Herd steht jetzt ein hoher Schrank";
    }
    if (!RESTRIKTIV.includes(id)) continue;
    const { von, bis } = lageIn(ids, i);
    if (zone && von < zone.bis && bis > zone.von) {
      return `${ROLLE_NAME[rolleVon(id)] || modul(id).bezeichnung} steht jetzt vor dem Fenster`;
    }
    if (id === "KF600" && Math.min(von, laenge - bis) < SEITENABSTAND_KOCHFELD) {
      return "neben dem Herd bleibt zur Wand hin kein Platz mehr";
    }
  }
  return null;
}

/** Die Fensterzone einer Zeile, in Maßen ab Zeilenanfang. */
export function fensterzone(typ: Kuechentyp, z: Zeile): { von: number; bis: number } | null {
  const f = typ.oeffnungen.find((o) => o.art === "fenster" && o.wand === z.wand);
  return f ? { von: f.von - z.start, bis: f.von + f.breite - z.start } : null;
}

function bewerte(ids: string[], strategie: Strategie, wasserZiel: number | null): number {
  const iSp = ids.indexOf("SP600");
  const iKf = ids.indexOf("KF600");
  let punkte = 0;

  if (iSp >= 0 && iKf >= 0) {
    const a = Math.min(iSp, iKf), b = Math.max(iSp, iKf);
    const abstand = ids.slice(a + 1, b).reduce((s, m) => s + (modul(m).breite ?? 0), 0);
    punkte += strategie === "arbeiten" ? abstand * 2 : -abstand;
  }
  if (iSp >= 0 && wasserZiel !== null) {
    const l = lageIn(ids, iSp);
    // "Kurze Leitungswege" steht auf der sparsamen Karte — dort muss der Weg
    // zum Anschluss auch wirklich schwerer wiegen als sonst.
    punkte -= Math.abs((l.von + l.bis) / 2 - wasserZiel) * (strategie === "guenstig" ? 3 : 1);
  }
  // Spuelmaschine gehoert neben die Spuele. Sparsam heisst: ein Anschluss
  // fuer beide, also zaehlt die Nachbarschaft dort doppelt.
  const iGs = ids.findIndex((x) => x === "GS600" || x === "GS450");
  if (iSp >= 0 && iGs >= 0) punkte -= Math.abs(iSp - iGs) * (strategie === "guenstig" ? 480 : 220);
  // Hochschraenke stehen am liebsten am Rand, Passleiste ebenso
  ids.forEach((id, i) => {
    const amRand = i === 0 || i === ids.length - 1;
    if (modul(id).kategorie === "hochschrank" && amRand) punkte += 620;
    if (modul(id).kategorie === "blende" && amRand) punkte += 400;
  });
  // Kuehlschrank nicht direkt neben dem Backofen
  const iHk = ids.indexOf("HK600"), iHb = ids.indexOf("HB600");
  if (iHk >= 0 && iHb >= 0 && Math.abs(iHk - iHb) === 1) punkte -= 150;
  return punkte;
}

/**
 * Die beste Anordnung einer Zeile.
 *
 * Vorher wurden erst alle Anordnungen in ein Feld geschrieben und danach der
 * Reihe nach bewertet. Bei elf Modulen sind das Hunderttausende Listen — bis
 * zu 75 MB für eine Zeile, von denen genau eine gebraucht wird. Und weil die
 * harten Regeln erst am fertigen Band geprüft wurden, lief die Suche durch
 * jeden Ast, der schon beim zweiten Modul verloren war.
 *
 * Jetzt läuft die Suche durch den Baum und behält nur die beste Anordnung,
 * und jede harte Regel greift, sobald sie entscheidbar ist: wo ein Modul
 * liegt, steht fest, sobald alles davor steht. Ein Hochschrank im Fenster
 * schneidet damit seinen ganzen Teilbaum ab statt ihn auszuzählen.
 *
 * Die Grenze ist eine Reißleine gegen Räume, die es nicht geben sollte, kein
 * Teil der Rechnung: bis 6,40 m Wand wird sie nicht erreicht.
 */
const ARBEITSGRENZE = 300_000;

/** Wie oft die Suche zuletzt an ihre Grenze gestossen ist. Nur zum Messen. */
export let suchlaeufeAbgeschnitten = 0;
export function zaehlerZuruecksetzen() { suchlaeufeAbgeschnitten = 0; }

function besteAnordnung(
  module: string[],
  laenge: number,
  zone: { von: number; bis: number } | null,
  strategie: Strategie,
  wasserZiel: number | null,
): { ids: string[]; moeglich: boolean } {
  const zaehler = new Map<string, number>();
  for (const m of module) zaehler.set(m, (zaehler.get(m) ?? 0) + 1);
  const arten = [...zaehler.keys()];
  const breiten = new Map(arten.map((a) => [a, modul(a).breite ?? 0]));

  /**
   * Schränke, auf die weder die Bewertung noch die harten Regeln schauen.
   *
   * `bewerte` kennt nur Spüle, Herd, Spülmaschine, Hochschränke und Leisten;
   * `erlaubt` nur die drei eingeschränkten. Alles andere ist Stauraum, und
   * ob an einer Stelle ein Auszug oder ein Türschrank derselben Breite steht,
   * ändert an beidem nichts.
   */
  const neutral = (id: string) => {
    if (id === "SP600" || id === "KF600" || id === "GS600" || id === "GS450") return false;
    if (RESTRIKTIV.includes(id)) return false;
    const k = modul(id).kategorie;
    return k !== "hochschrank" && k !== "blende";
  };
  const istNeutral = new Map(arten.map((a) => [a, neutral(a)]));

  /**
   * Stehen mehrere neutrale Schränke nebeneinander, ist ihre Reihenfolge
   * untereinander ohne jede Wirkung — die Gesamtbreite des Blocks bleibt, und
   * was davor und dahinter steht, liegt genauso. Trotzdem hat die Suche
   * sieben gleiche Unterschränke neben zwei schmalen millionenfach
   * umsortiert. Deshalb gilt innerhalb eines solchen Blocks eine feste
   * Ordnung: breit vor schmal, bei gleicher Breite nach Kennung. Damit bleibt
   * von jeder Gruppe genau eine Anordnung übrig, und keine geht verloren.
   */
  const inOrdnung = (id: string, links: string | undefined): boolean => {
    if (links === undefined || !istNeutral.get(links) || !istNeutral.get(id)) return true;
    const bl = breiten.get(links) ?? 0;
    const bi = breiten.get(id) ?? 0;
    return bi < bl || (bi === bl && id >= links);
  };

  /** Darf dieses Modul an dieser Stelle stehen? Dieselben Regeln wie
      `zulaessig`, nur eine Position nach der anderen. */
  const erlaubt = (id: string, von: number, links: string | undefined): boolean => {
    if (id === "KF600" && links !== undefined && HOCH.includes(links)) return false;
    if (links === "KF600" && HOCH.includes(id)) return false;
    if (!RESTRIKTIV.includes(id)) return true;
    const bis = von + (breiten.get(id) ?? 0);
    if (zone && von < zone.bis && bis > zone.von) return false;
    if (id === "KF600" && Math.min(von, laenge - bis) < SEITENABSTAND_KOCHFELD) return false;
    return true;
  };

  const durchlauf = (mitRegeln: boolean): { ids: string[] | null; punkte: number; abgeschnitten: boolean } => {
    const band: string[] = [];
    let beste: string[] | null = null;
    let bestPunkte = -Infinity;
    let blaetter = 0;

    const schritt = (von: number) => {
      if (blaetter >= ARBEITSGRENZE) return;
      if (band.length === module.length) {
        blaetter++;
        const p = bewerte(band, strategie, wasserZiel);
        if (p > bestPunkte) { bestPunkte = p; beste = [...band]; }
        return;
      }
      for (const art of arten) {
        const n = zaehler.get(art)!;
        if (n === 0) continue;
        const links = band[band.length - 1];
        if (!inOrdnung(art, links)) continue;
        if (mitRegeln && !erlaubt(art, von, links)) continue;
        zaehler.set(art, n - 1);
        band.push(art);
        schritt(von + (breiten.get(art) ?? 0));
        band.pop();
        zaehler.set(art, n);
        if (blaetter >= ARBEITSGRENZE) return;
      }
    };
    schritt(0);
    return { ids: beste, punkte: bestPunkte, abgeschnitten: blaetter >= ARBEITSGRENZE };
  };

  const mit = durchlauf(true);
  if (mit.abgeschnitten) suchlaeufeAbgeschnitten++;
  if (mit.ids) return { ids: mit.ids, moeglich: true };
  // Keine zulaessige Anordnung: die am wenigsten schlechte nehmen und melden.
  const ohne = durchlauf(false);
  return { ids: ohne.ids ?? module, moeglich: false };
}

/**
 * Geht in diesem Raum ueberhaupt eine Kueche auf?
 *
 * Beantwortet dieselben zwei Fragen, an denen `rechnePlan` abbricht —
 * reicht die Wand ueberhaupt, und passt jedes Geraet an irgendeine einzelne
 * Wand — aber ohne die Suche nach der Anordnung. Das braucht die Rettung
 * einer umgestellten Kueche, die bisher einen vollstaendigen Plan rechnen
 * liess, um ein Ja oder Nein zu lesen: bei fuenf Metern Wand eine
 * Viertelsekunde, bei jedem Tipp auf die Ausstattungsstufe.
 */
export function passtUeberhaupt(a: Raumangaben): boolean {
  const typ = alsKuechentyp(a);
  const pflicht = pflichtmodule(a);
  if (breiteVon(pflicht) > typ.zeilen.reduce((s, z) => s + z.laenge, 0)) return false;
  return verteile(typ, a, pflicht).uebrig.length === 0;
}

/**
 * Fertige Plaene, die schon gerechnet wurden.
 *
 * Dieselbe Kueche wird an vielen Stellen gebraucht: die Vorschlagsseite
 * rechnet drei Strategien, der Geraeteschritt fuer jedes Modell einen Plan,
 * die Vorschau daneben noch einen, und React ruft all das bei jedem Rendern
 * erneut auf. Gerechnet wurde jedes Mal neu — bei fuenf Metern Wand eine
 * Viertelsekunde pro Tipp, in der die Oberflaeche steht.
 *
 * Der Schluessel ist der Raum selbst: gleiche Angaben, gleicher Plan. Die
 * Ablage bleibt klein, damit sie beim Ziehen am Grundriss nicht volllaeuft.
 */
const PLANSPEICHER = new Map<string, Vorschlag>();
const PLANSPEICHER_MAX = 80;

export function planeKueche(a: Raumangaben, strategie: Strategie): Vorschlag {
  const schluessel = `${strategie}|${JSON.stringify(a)}`;
  const fertig = PLANSPEICHER.get(schluessel);
  if (fertig) return fertig;
  const neu = rechnePlan(a, strategie);
  if (PLANSPEICHER.size >= PLANSPEICHER_MAX) {
    PLANSPEICHER.delete(PLANSPEICHER.keys().next().value!);
  }
  PLANSPEICHER.set(schluessel, neu);
  return neu;
}

function rechnePlan(a: Raumangaben, strategie: Strategie): Vorschlag {
  const typ = alsKuechentyp(a);
  const titel = STRATEGIEN.find((s) => s.id === strategie)!.titel;
  const leer: Vorschlag = {
    strategie, titel, moeglich: false, belegung: {}, haengeschraenke: 0,
    variante: { id: `frei-${strategie}`, typId: "MEINE", kurz: titel, schwerpunkt: "kosten", bezeichnung: titel, belegung: {}, weitere: [], staerken: [], schwaechen: [], begruendung: "" },
    preis: 0, arbeitsflaeche: 0, wegZumWasser: 0, passblende: 0, gutPunkte: [], achtungPunkte: [],
    kosten: { korpusse: 0, haenge: 0, platte: 0, sockel: 0, spuele: 0, montage: 0, moebel: 0, zuschlag: 0, geraete: 0, gesamt: 0 },
  };

  const pflicht = pflichtmodule(a);
  const gesamt = typ.zeilen.reduce((s, z) => s + z.laenge, 0);
  if (breiteVon(pflicht) > gesamt) {
    const fehlt = Math.ceil((breiteVon(pflicht) - gesamt) / 10) * 10;
    return { ...leer, grund: `Es fehlen etwa ${fehlt} mm Wand. Mit einer schmalen Spülmaschine, einem Kühlschrank unter der Platte oder dem Backofen unter dem Kochfeld würde es passen.` };
  }

  const belegung: Record<string, string[]> = {};
  const wasserZeile = `Z-${a.wasser.wand}`;
  let fensterKonflikt = false;
  let kochfeldGerueckt = false;

  const { zu: zuordnung, uebrig } = verteile(typ, a, pflicht);
  if (uebrig.length > 0) {
    const name = (id: string) =>
      ROLLE_NAME[rolleVon(id)] || modul(id).bezeichnung;
    const laengste = Math.max(...typ.zeilen.map((z) => z.laenge));
    return {
      ...leer,
      grund: `${name(uebrig[0])} passt an keine einzelne Wand: die längste Küchenzeile ist ${Math.round(laengste / 10)} cm lang, und darauf müssen Spüle, Geräte und Schränke nebeneinander stehen. Zusammen reicht der Platz, aufgeteilt auf die Wände nicht.`,
    };
  }
  for (const z of typ.zeilen) {
    const nehmen = zuordnung[z.id] ?? [];
    const benutzt = breiteVon(nehmen);
    const module = [...nehmen, ...fuellung(z.laenge - benutzt, strategie)];

    const f = typ.oeffnungen.find((o) => o.art === "fenster" && o.wand === z.wand);
    const zone = f ? { von: f.von - z.start, bis: f.von + f.breite - z.start } : null;
    const ziel = z.id === wasserZeile ? a.wasser.von - z.start : null;

    const r = besteAnordnung(module, z.laenge, zone, strategie, ziel);
    belegung[z.id] = r.ids;
    if (!r.moeglich) fensterKonflikt = true;

    // Steht das Kochfeld jetzt nicht mehr am Rand, war ein Rücken nötig.
    const iKf = r.ids.indexOf("KF600");
    if (iKf > 0 && iKf < r.ids.length - 1) kochfeldGerueckt = true;
  }

  return ausBelegung(a, typ, strategie, belegung);
}

export function alleVorschlaege(a: Raumangaben): Vorschlag[] {
  const alle = STRATEGIEN.map((s) => planeKueche(a, s.id));
  /* In einem knappen Raum gibt es nichts zu variieren: die Pflichtmodule
     stehen fest, für einen Füllschrank bleibt kein Platz. Dann kommen zwei
     Wege beim selben Plan heraus. Das als zwei getrennte Karten mit
     verschiedenen Namen und gleichem Inhalt hinzustellen, ist die
     unangenehmste Art zu zeigen, dass gerade nichts gerechnet wurde. */
  const schluessel = (v: Vorschlag) =>
    JSON.stringify(Object.keys(v.belegung).sort().map((k) => [k, v.belegung[k]]));
  for (let i = 1; i < alle.length; i++) {
    if (!alle[i].moeglich) continue;
    const gleich = alle
      .slice(0, i)
      .find((x) => x.moeglich && !x.gleichWie && schluessel(x) === schluessel(alle[i]));
    if (!gleich) continue;
    alle[i].gleichWie = gleich.strategie;
    gleich.auchAls = [...(gleich.auchAls ?? []), alle[i].titel];
  }
  return alle;
}

export function pruefeAngaben(a: Raumangaben): string[] {
  const h: string[] = [];
  const gesamt = kuechenwaende(a).reduce((s, w) => s + a.nutz[w], 0);
  if (gesamt < 1800) h.push("Unter 1,80 m Küchenwand bekommt man Spüle, Herd und Kühlschrank nicht unter.");
  if (a.tiefe < 2100) h.push("Bei weniger als 2,10 m Raumtiefe wird es vor der Küche eng — man braucht etwa 1,20 m zum Stehen.");
  if (a.form === "zwei-waende" && a.tiefe < 2400) h.push("Für zwei Zeilen gegenüber sollte der Raum mindestens 2,40 m tief sein.");
  if (a.fenster && a.fenster.von + a.fenster.breite > wandlaenge(a, a.fenster.wand)) h.push("Das Fenster liegt rechnerisch außerhalb der Wand.");
  if (a.wasser.von > wandlaenge(a, a.wasser.wand)) h.push("Der Wasseranschluss liegt rechnerisch außerhalb der Wand.");
  return h;
}

/**
 * Alles, was sich aus einer fertigen Belegung ergibt: Preis, Kennzahlen und
 * die Hinweise dazu. Getrennt von der Suche nach der Anordnung, damit eine
 * von Hand umgestellte Küche durch dieselbe Rechnung läuft — sonst stünden
 * beim Umstellen falsche Zahlen und Hinweise da.
 */
/**
 * Wie weit die Spüle vom Wasseranschluss entfernt ist, in mm.
 *
 * Stand die Spüle nicht an der Wand mit dem Anschluss, setzte die Rechnung
 * hier eine feste 1500 ein — eine erfundene Zahl, aus der dann der Satz
 * "etwa 150 cm vom heutigen Anschluss entfernt" wurde, egal wo die Spüle
 * wirklich stand. Die Wände bilden ein Rechteck; damit ist der Weg an der
 * Wand entlang ausrechenbar.
 */
function wasserweg(a: Raumangaben, typ: Kuechentyp, belegung: Record<string, string[]>): number {
  const umfang = 2 * (a.breite + a.tiefe);
  /** Ein Punkt auf einer Wand als Maß im Uhrzeigersinn ab der linken oberen Ecke. */
  const amUmfang = (w: WandId, x: number) =>
    w === "haupt" ? x
    : w === "rechts" ? a.breite + x
    : w === "gegenueber" ? a.breite + a.tiefe + x
    : 2 * a.breite + a.tiefe + x;

  for (const z of typ.zeilen) {
    const i = (belegung[z.id] ?? []).indexOf("SP600");
    if (i < 0) continue;
    const l = lageIn(belegung[z.id], i);
    const w = z.id.slice(2) as WandId;
    const d = Math.abs(amUmfang(w, z.start + (l.von + l.bis) / 2) - amUmfang(a.wasser.wand, a.wasser.von));
    return Math.round(Math.min(d, umfang - d));
  }
  // Ohne Spüle gibt es keinen Weg — nicht 1,5 Meter.
  return 0;
}

export function ausBelegung(
  a: Raumangaben,
  typ: Kuechentyp,
  strategie: Strategie,
  belegung: Record<string, string[]>,
): Vorschlag {
  const titel = STRATEGIEN.find((s) => s.id === strategie)!.titel;

  // Die beiden Befunde stehen in der Anordnung selbst, nicht im Weg dorthin.
  let fensterKonflikt = false;
  let kochfeldGerueckt = false;
  for (const z of typ.zeilen) {
    const ids = belegung[z.id] ?? [];
    const f = typ.oeffnungen.find((o) => o.art === "fenster" && o.wand === z.wand);
    if (f) {
      const von = f.von - z.start;
      const bis = f.von + f.breite - z.start;
      for (let i = 0; i < ids.length; i++) {
        if (modul(ids[i]).kategorie !== "hochschrank") continue;
        const l = lageIn(ids, i);
        if (l.von < bis && l.bis > von) fensterKonflikt = true;
      }
    }
    const iKf = ids.indexOf("KF600");
    if (iKf > 0 && iKf < ids.length - 1) kochfeldGerueckt = true;
  }

  const variante: VarianteRoh = {
    id: `frei-${strategie}`, typId: "MEINE", kurz: titel, schwerpunkt: "kosten",
    bezeichnung: titel, belegung, weitere: [], staerken: [], schwaechen: [], begruendung: "",
  };

  const haengeschraenke = haengeplaetze(typ, belegung).length;

  // Der Preis zerfaellt in Posten, die man einzeln nachrechnen kann.
  // Die Ausstattungsstufe schlaegt auf Moebel und Arbeit, nicht auf Geraete:
  // ein Backofen wird nicht teurer, weil die Fronten besser sind.
  const lfm = typ.zeilen.reduce((su, z) => su + z.laenge, 0) / 1000;
  const aufschlag = niveauFaktor(a.niveau);

  let korpusse = 0;
  for (const z of typ.zeilen) for (const id of belegung[z.id]) korpusse += modul(id).preis;
  const haenge = haengemodule(typ, belegung).reduce((s, h) => s + modul(h.id).preis * h.anzahl, 0);
  const platte = Math.round((modul("AP").preis * platteLaenge(typ, belegung)) / 1000);
  const sockel = Math.round(modul("SO").preis * lfm);
  const spuele = modul("SPA").preis;
  const montage = Math.round(modul("MON").preis * lfm);
  const moebel = korpusse + haenge + platte + sockel + spuele + montage;
  const zuschlag = Math.round(moebel * aufschlag) - moebel;

  // Netto, wie alles andere auch: der Richtpreis eines Geraets ist ein
  // Strassenpreis und damit brutto.
  let geraete = 0;
  for (const art of Object.keys(a.geraete) as Array<keyof Geraetewahl>) {
    geraete += geraet(a.geraete[art]).netto;
  }

  /* Hier stand ein Mindestpreis von 600 EUR. Er griff nie — eine Zeile mit
     Spüle und Platte kostet mehr — konnte aber jederzeit dafür sorgen, dass
     die Summe nicht mehr der Summe ihrer Posten entspricht. Genau das ist
     der Fehler, den niemand findet. */
  const kosten = {
    korpusse, haenge, platte, sockel, spuele, montage,
    moebel, zuschlag, geraete,
    gesamt: moebel + zuschlag + geraete,
  };
  const preis = kosten.gesamt;

  const arbeitsflaeche = freieFlaeche(a, typ, belegung);
  const wegZumWasser = wasserweg(a, typ, belegung);
  const passblende = breiteVon(Object.values(belegung).flat().filter((m) => modul(m).kategorie === "blende"));

  const gut: string[] = [];
  const achtung: string[] = [];
  const alleIds = Object.values(belegung).flat();

  if (arbeitsflaeche >= 900) gut.push(`${Math.round(arbeitsflaeche / 10)} cm freie Fläche zwischen Spüle und Herd — bequem zum Schneiden und Abstellen.`);
  else if (arbeitsflaeche >= 450) gut.push(`${Math.round(arbeitsflaeche / 10)} cm zwischen Spüle und Herd. Reicht, ist aber nicht üppig.`);
  else if (alleIds.includes("SP600") && alleIds.includes("KF600")) {
    const zeileVon = (id: string) => typ.zeilen.find((z) => (belegung[z.id] ?? []).includes(id))?.id;
    if (zeileVon("SP600") !== zeileVon("KF600"))
      achtung.push("Spüle und Herd stehen sich auf gegenüberliegenden Wänden gegenüber — zwischen beiden liegt keine durchgehende Arbeitsfläche.");
    else
      achtung.push("Spüle und Herd stehen direkt nebeneinander — unpraktisch beim Kochen, dafür kurze Leitungswege.");
  }

  if (wegZumWasser <= 600) gut.push("Die Spüle bleibt am vorhandenen Anschluss — kein Installateur nötig.");
  // Aufgerundet, nicht gerundet: bei 64 cm stand hier "60 cm — das muss
  // verlegt werden", waehrend 60 cm eine Zeile darueber als "bleibt am
  // Anschluss" durchgeht. Zweimal dieselbe Zahl, zwei Urteile.
  else achtung.push(`Die Spüle liegt etwa ${Math.ceil(wegZumWasser / 100) * 10} cm vom heutigen Anschluss entfernt. Das muss verlegt werden.`);

  if (passblende > 0 && passblende <= 150) gut.push(`${passblende} mm Rest schließt eine Passleiste — das ist normal und wird vor Ort zugeschnitten.`);
  else if (passblende > 150) achtung.push(`${passblende} mm bleiben als Passleiste übrig. Das ist viel — ein Küchenbetrieb würde eher einen Schrank breiter wählen.`);
  if (kochfeldGerueckt) gut.push("Der Herd steht nicht direkt an der Wand, damit daneben Platz zum Abstellen bleibt.");

  /* Die Befunde der einzelnen Zeilen gehoeren auch hierher. In der
     Umstellen-Ansicht standen sie schon; auf der Ergebnisseite wurde ein
     Verstoss gegen eine harte Regel verschluckt, weil `moeglich` dort fest
     auf true steht und nur der Fensterfall neu geprueft wurde — und der
     gefiltert auf Hochschraenke, waehrend ein Kochfeld vor dem Fenster ein
     Unterschrank ist.

     Zum Wasser steht oben schon der bessere Satz — er nennt die Folge. Und
     steht wirklich etwas vor dem Fenster, sagt die Zeilenpruefung, was: das
     ist mehr als "ein hoher Schrank". */
  const ausZeilen: Befund[] = typ.zeilen.flatMap((z) => befundeZeile(a, typ, z.id, belegung[z.id] ?? []));
  const zumFenster = ausZeilen.some((b) => b.thema === "fenster");
  if (fensterKonflikt && !zumFenster) {
    achtung.push("Vor dem Fenster steht ein hoher Schrank — er nimmt Licht. Verschieb das Fenster oder nutze mehr Wandlänge.");
  }
  for (const b of ausZeilen) {
    if (b.thema === "wasser") continue;
    if (!achtung.includes(b.text)) achtung.push(b.text);
  }
  if (haengeschraenke === 0) achtung.push("Hängeschränke gehen hier nicht — Fenster oder Hochschränke belegen die Wand.");
  if (a.form === "zwei-waende" && a.tiefe - 1200 < 1200) {
    achtung.push(`Zwischen den Zeilen bleiben nur ${a.tiefe - 1200} mm Gang. Empfohlen sind 1.200 mm.`);
  }


  return { strategie, titel, moeglich: true, belegung, haengeschraenke, variante, preis, arbeitsflaeche, wegZumWasser, passblende, gutPunkte: gut, achtungPunkte: achtung, kosten };
}

/**
 * Was an einer von Hand umgestellten Zeile auffällt. Umgestellt wird nur
 * getauscht, deshalb stimmt die Breite immer — was kippen kann, sind die
 * Regeln, die ein Laie nicht kennt.
 */
/**
 * Woran ein Befund hängt.
 *
 * Ohne das Thema liessen sich Doppelungen nur am Wortlaut erkennen: die
 * Gesamtrechnung sagte "Vor dem Fenster steht ein hoher Schrank" und die
 * Zeilenprüfung gleich darunter "Der Kühlschrank steht vor dem Fenster" —
 * zweimal dasselbe, in zwei Sätzen. Dasselbe beim Weg zum Wasser.
 */
export type Befundthema = "fenster" | "herd" | "spuelmaschine" | "wasser";

export interface Befund {
  thema: Befundthema;
  text: string;
}

export function befundeZeile(a: Raumangaben, typ: Kuechentyp, zeileId: string, ids: string[]): Befund[] {
  const z = typ.zeilen.find((x) => x.id === zeileId);
  if (!z) return [];
  const hin: Befund[] = [];
  const f = typ.oeffnungen.find((o) => o.art === "fenster" && o.wand === z.wand);
  const zone = f ? { von: f.von - z.start, bis: f.von + f.breite - z.start } : null;

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const l = lageIn(ids, i);
    const m = modul(id);
    if (zone && m.kategorie === "hochschrank" && l.von < zone.bis && l.bis > zone.von) {
      hin.push({ thema: "fenster", text: `Der ${ROLLE_NAME[rolleVon(id)] || "hohe Schrank"} steht vor dem Fenster und nimmt Licht. Verschieb das Fenster oder nutze mehr Wandlänge.` });
    }
    if (zone && id === "KF600" && l.von < zone.bis && l.bis > zone.von) {
      // Die Suche verbietet das (KF600 steht in RESTRIKTIV), von Hand ging es
      // trotzdem — und niemand sagte ein Wort dazu.
      hin.push({ thema: "fenster", text: "Der Herd steht vor dem Fenster. Darüber lässt sich das Fenster nicht mehr gefahrlos öffnen, und der Vorhang hängt über der Flamme." });
    }
    if (id === "KF600" && (HOCH.includes(ids[i - 1]) || HOCH.includes(ids[i + 1]))) {
      // Die Suche laesst das nie zu, der Nutzer darf es aber von Hand bauen.
      // Gemeldet wurde es bisher nicht — als einzige der harten Regeln.
      hin.push({ thema: "herd", text: "Direkt neben dem Herd steht ein hoher Schrank. Dort wird es heiß, und zum Abstellen bleibt keine Fläche." });
    }
    if (id === "KF600") {
      const abstand = Math.min(l.von, z.laenge - l.bis);
      if (abstand < SEITENABSTAND_KOCHFELD) {
        hin.push({
          thema: "herd",
          text:
            abstand <= 0
              ? "Der Herd steht direkt an der Wand — daneben bleibt kein Platz zum Abstellen."
              : `Neben dem Herd bleiben nur ${Math.round(abstand / 10)} cm bis zur Wand. Empfohlen sind ${SEITENABSTAND_KOCHFELD / 10} cm.`,
        });
      }
    }
  }

  const iSp = ids.indexOf("SP600");
  const iGs = ids.findIndex((x) => x === "GS600" || x === "GS450");
  if (iSp >= 0 && iGs >= 0 && Math.abs(iSp - iGs) > 1) {
    hin.push({ thema: "spuelmaschine", text: "Die Spülmaschine steht nicht mehr neben der Spüle — dann braucht sie eigene Anschlüsse." });
  }
  if (SEITE[a.wasser.wand] === z.wand && iSp >= 0) {
    const l = lageIn(ids, iSp);
    const weg = Math.abs((l.von + l.bis) / 2 - (a.wasser.von - z.start));
    if (weg > 900) hin.push({ thema: "wasser", text: `Die Spüle liegt jetzt rund ${Math.ceil(weg / 100) * 10} cm vom Wasseranschluss entfernt.` });
  }
  return hin;
}

/* ---------------------------------------------------------------- */

const PBX_MIN = 20;
const PBX_MAX = 600;

/** Die Passleiste einer Zeile um delta mm ändern, damit die Summe stimmt. */
export function passeAn(ids: string[], delta: number): string[] | null {
  if (delta === 0) return ids;
  const i = ids.findIndex((m) => m.startsWith("PBX:"));
  if (i < 0) {
    // Ohne Passleiste lässt sich nur Platz abgeben, wenn welcher frei wird.
    if (delta >= PBX_MIN) return [...ids, `PBX:${delta}`];
    return null;
  }
  const neu = (modul(ids[i]).breite ?? 0) + delta;
  if (neu === 0) return ids.filter((_, k) => k !== i);
  if (neu < PBX_MIN || neu > PBX_MAX) return null;
  const aus = [...ids];
  aus[i] = `PBX:${neu}`;
  return aus;
}

const cm = (mm: number) => `${Math.round(mm / 10)} cm`;

/** Was die Ausstattungsstufe auf alle Positionen aufschlaegt. */
export function niveauFaktor(niveau: Raumangaben["niveau"]): number {
  return niveau === "gehoben" ? 1.35 : niveau === "einfach" ? 0.82 : 1;
}

/** Der Wandname im Dativ, für Sätze wie "an der linken Wand". */
function wandDativ(seite: Wandseite): string {
  const w = (Object.keys(SEITE) as WandId[]).find((k) => SEITE[k] === seite);
  return w ? WANDNAME_DAT[w] : "einen Wand";
}

/**
 * Zwei Schränke tauschen — auch über die Wandgrenze hinweg.
 *
 * In einer Zeile geht das immer: die Summe der Breiten bleibt dieselbe.
 * Zwischen zwei Zeilen nur, wenn beide hinterher wieder genau auf ihre
 * Wandlänge kommen. Sind die Schränke unterschiedlich breit, muss die
 * Passleiste der jeweiligen Zeile den Unterschied auffangen.
 */
export function tauschPlan(
  typ: Kuechentyp,
  belegung: Record<string, string[]>,
  a: { zeile: string; index: number },
  b: { zeile: string; index: number },
): { belegung: Record<string, string[]> } | { grund: string } {
  if (a.zeile === b.zeile) {
    const ids = [...(belegung[a.zeile] ?? [])];
    if (!ids[a.index] || !ids[b.index]) return { grund: "Diesen Platz gibt es nicht mehr." };
    [ids[a.index], ids[b.index]] = [ids[b.index], ids[a.index]];
    return { belegung: { [a.zeile]: ids } };
  }

  const idsA = [...(belegung[a.zeile] ?? [])];
  const idsB = [...(belegung[b.zeile] ?? [])];
  const mA = idsA[a.index];
  const mB = idsB[b.index];
  if (!mA || !mB) return { grund: "Diesen Platz gibt es nicht mehr." };

  const wA = modul(mA).breite ?? 0;
  const wB = modul(mB).breite ?? 0;
  idsA[a.index] = mB;
  idsB[b.index] = mA;
  const diff = wB - wA;

  const fertigA = passeAn(idsA, -diff);
  const fertigB = passeAn(idsB, diff);
  if (!fertigA || !fertigB) {
    const seiteA = typ.zeilen.find((z) => z.id === a.zeile)?.wand;
    const seiteB = typ.zeilen.find((z) => z.id === b.zeile)?.wand;
    const eng = !fertigA
      ? seiteA ? wandDativ(seiteA) : "einen Wand"
      : seiteB ? wandDativ(seiteB) : "anderen Wand";
    return {
      grund: `Die beiden sind unterschiedlich breit — ${cm(wA)} und ${cm(wB)}. An der ${eng} lässt sich der Unterschied nicht ausgleichen.`,
    };
  }

  return { belegung: { [a.zeile]: fertigA, [b.zeile]: fertigB } };
}

/** Lässt sich an diesen Platz tauschen? Für die Vorschau der Ziele. */
export function tauschMoeglich(
  typ: Kuechentyp,
  belegung: Record<string, string[]>,
  a: { zeile: string; index: number },
  b: { zeile: string; index: number },
): boolean {
  if (a.zeile === b.zeile && a.index === b.index) return false;
  return !("grund" in tauschPlan(typ, belegung, a, b));
}

/**
 * Befunde, die zwischen zwei Zeilen liegen und deshalb in keiner von beiden
 * auffallen — etwa wenn Spüle und Spülmaschine auf verschiedene Wände
 * geraten sind.
 */
export function befundeGesamt(a: Raumangaben, typ: Kuechentyp, belegung: Record<string, string[]>): string[] {
  const hin: string[] = [];
  const wo = (m: string) => typ.zeilen.find((z) => (belegung[z.id] ?? []).includes(m));
  const zSp = wo("SP600");
  const zGs = typ.zeilen.find((z) => (belegung[z.id] ?? []).some((m) => m === "GS600" || m === "GS450"));

  if (zSp && zGs && zSp.id !== zGs.id) {
    hin.push(`Spüle und Spülmaschine stehen jetzt an verschiedenen Wänden (${zSp.bezeichnung} und ${zGs.bezeichnung}). Beide brauchen dann eigene Anschlüsse.`);
  }
  if (zSp && zSp.wand !== SEITE[a.wasser.wand]) {
    hin.push(`Die Spüle steht nicht mehr an der Wand mit dem Wasseranschluss (${WANDNAME[a.wasser.wand]}). Das muss verlegt werden.`);
  }
  return hin;
}

/** Stauraumschränke, die man gegeneinander tauschen darf. Geräte- und
    Spülenschränke nicht: die folgen der Geräteauswahl. */
const STAURAUM = ["US600", "US450", "US300", "AZ600", "AZ300", "UT600", "UT450", "MU600"];

export function istStauraum(id: string): boolean {
  return STAURAUM.includes(id);
}

/** Welche anderen Typen an dieser Stelle in Frage kommen. */
export function austauschbar(id: string): string[] {
  if (!istStauraum(id)) return [];
  return STAURAUM.filter((x) => x !== id);
}

/**
 * Einen Schrank gegen einen anderen Typ tauschen. Ist der neue schmaler
 * oder breiter, fängt die Passleiste der Zeile den Unterschied auf — wie
 * beim Tausch über die Wandgrenze.
 */
export function ersetzePlan(
  typ: Kuechentyp,
  belegung: Record<string, string[]>,
  platz: { zeile: string; index: number },
  neueId: string,
): { belegung: Record<string, string[]> } | { grund: string } {
  const ids = [...(belegung[platz.zeile] ?? [])];
  const alt = ids[platz.index];
  if (!alt) return { grund: "Diesen Platz gibt es nicht mehr." };

  const diff = (modul(neueId).breite ?? 0) - (modul(alt).breite ?? 0);
  ids[platz.index] = neueId;
  const fertig = passeAn(ids, -diff);
  if (!fertig) {
    const seite = typ.zeilen.find((z) => z.id === platz.zeile)?.wand;
    return {
      grund: `${modul(neueId).bezeichnung} ist ${cm(Math.abs(diff))} ${diff > 0 ? "breiter" : "schmaler"}. An der ${seite ? wandDativ(seite) : "Wand"} geht das nicht auf.`,
    };
  }
  return { belegung: { [platz.zeile]: fertig } };
}

/* ---------------------------------------------------------------- */
/**
 * Eine von Hand umgestellte Küche über eine Änderung retten.
 *
 * Bisher wurde jede Umstellung bei jeder Änderung weggeworfen — auch wenn
 * sich an der Geometrie gar nichts getan hatte. Wer seine Schränke sortiert,
 * zurückgeht und die Tür fünf Zentimeter verschiebt, fand wieder den
 * Vorschlag vor.
 *
 * Der erste Entwurf wollte das zeilenweise retten und die geretteten Zeilen
 * über einen frisch gerechneten Plan legen. Genau diese Mischung ist aber die
 * Fehlerquelle: der frische Plan legt die Spüle woanders hin, die gerettete
 * Zeile bringt ihre eigene mit, und die Küche hat zwei Spülen. Dasselbe in
 * Grün für Kochfeld, Kühlschrank und Geschirrspüler. Deshalb wird hier eine
 * vollständige Anordnung als Ganzes geprüft und als Ganzes übernommen oder
 * verworfen — und wenn verworfen, dann mit einem Satz, der sagt, woran es lag.
 *
 * Was unterwegs repariert wird, statt daran zu scheitern:
 *  - Längenunterschiede, die die Passleiste auffangen kann
 *  - Geräteschränke, die ihren Partner haben: 60er gegen 45er Spülmaschine,
 *    Kühlschrank hoch gegen Kühlschrank unter der Platte
 *  - Geräteschränke, die ganz wegfallen, weil das Gerät abgewählt wurde
 */

/** Schränke, die an einem Gerät hängen — über die wacht `pflichtmodule`. */
const GERAETEMODULE = ["SP600", "KF600", "HK600", "KS600", "HB600", "GS600", "GS450"];

/** Was sich an Ort und Stelle gegeneinander austauschen lässt. */
const PARTNER: Record<string, string> = {
  GS600: "GS450", GS450: "GS600",
  HK600: "KS600", KS600: "HK600",
};

const MODULNAME = (id: string) => ROLLE_NAME[rolleVon(id)] || modul(id).bezeichnung;

export function uebernimmUmstellung(
  neu: Raumangaben,
  belegung: Record<string, string[]>,
): { belegung: Record<string, string[]> } | { grund: string } {
  const typ = alsKuechentyp(neu);

  // Unbekannte Kennungen aus einer älteren Sitzung würden `modul()` werfen
  // lassen — und zwar mitten im Setzen des Zustands.
  for (const ids of Object.values(belegung)) {
    if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string" && istBekanntesModul(id))) {
      return { grund: "Deine Anordnung stammt aus einer älteren Fassung und lässt sich nicht mehr lesen." };
    }
  }

  // Zeilen, die es nicht mehr gibt, und Zeilen, für die es noch nichts gibt.
  for (const z of typ.zeilen) {
    if (!belegung[z.id]) {
      return { grund: `Die ${WANDNAME_DAT[z.id.slice(2) as WandId]} ist neu dazugekommen — dafür gab es in deiner Anordnung noch nichts.` };
    }
  }
  const aus: Record<string, string[]> = {};
  for (const z of typ.zeilen) aus[z.id] = [...belegung[z.id]];

  /* --- Geräteschränke an die neue Gerätewahl angleichen --- */
  const soll = pflichtmodule(neu);
  const zaehle = (liste: string[], id: string) => liste.filter((x) => x === id).length;
  const alleIds = () => Object.values(aus).flat();

  const fehlt: string[] = [];
  const zuviel: string[] = [];
  for (const id of GERAETEMODULE) {
    const d = zaehle(soll, id) - zaehle(alleIds(), id);
    for (let i = 0; i < d; i++) fehlt.push(id);
    for (let i = 0; i < -d; i++) zuviel.push(id);
  }

  // Erst tauschen, wo es einen Partner gibt: die 45er Spülmaschine steht an
  // derselben Stelle wie die 60er, nur schmaler.
  for (const f of [...fehlt]) {
    const partner = PARTNER[f];
    const i = partner ? zuviel.indexOf(partner) : -1;
    if (i < 0) continue;
    for (const z of typ.zeilen) {
      const k = aus[z.id].indexOf(partner);
      if (k < 0) continue;
      aus[z.id] = aus[z.id].map((x, j) => (j === k ? f : x));
      break;
    }
    zuviel.splice(i, 1);
    fehlt.splice(fehlt.indexOf(f), 1);
  }

  // Was übrig bleibt, fällt weg — das Gerät wurde abgewählt.
  for (const z of zuviel) {
    for (const zeile of typ.zeilen) {
      const k = aus[zeile.id].indexOf(z);
      if (k < 0) continue;
      aus[zeile.id] = aus[zeile.id].filter((_, j) => j !== k);
      break;
    }
  }

  // Was jetzt noch fehlt, braucht einen Platz, den niemand vorgesehen hat.
  if (fehlt.length > 0) {
    return {
      grund: `Für ${MODULNAME(fehlt[0])} braucht die Küche jetzt einen eigenen Schrank, und dafür war in deiner Anordnung kein Platz vorgesehen.`,
    };
  }

  /* --- Längen nachziehen: dafür ist die Passleiste da --- */
  for (const z of typ.zeilen) {
    const delta = z.laenge - breiteVon(aus[z.id]);
    const fertig = passeAn(aus[z.id], delta);
    if (!fertig) {
      return {
        grund:
          delta > 0
            ? `An der ${WANDNAME_DAT[z.id.slice(2) as WandId]} sind ${Math.round(delta / 10)} cm mehr Platz, als deine Anordnung füllt — dafür reicht keine Passleiste.`
            : `An der ${WANDNAME_DAT[z.id.slice(2) as WandId]} fehlen deiner Anordnung ${Math.round(-delta / 10)} cm. Dafür müsste ein Schrank weichen.`,
      };
    }
    aus[z.id] = fertig;
  }

  /* Die harten Regeln der Suche werden hier bewusst NICHT erzwungen.
     Sie beschraenken, was der Planer vorschlagen darf — nicht, was der
     Nutzer bauen darf: `tauschPlan` laesst ihn den Hochschrank vors Fenster
     stellen, und `ausBelegung` sagt ihm das als Hinweis. Wer seine Kueche so
     gebaut hat und danach das Fenster verschiebt, soll seinen Hinweis
     bekommen — nicht seine Arbeit verlieren. */

  // Zeilen, die nicht mehr zur Küche gehören, fallen mitsamt ihren Schränken
  // weg. Standen Geräteschränke darin, hat die Pflichtprüfung oben schon
  // abgebrochen; war es Stauraum, bleibt die Anordnung gültig.
  return { belegung: aus };
}
