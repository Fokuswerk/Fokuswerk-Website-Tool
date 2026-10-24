import { modul } from "@/data/module";
import { geraet, STANDARD_GERAETE, type Geraetewahl } from "@/data/geraete";
import { ROLLE_NAME, rolleVon } from "@/lib/masse";
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
const WANDNAME_DAT: Record<WandId, string> = {
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
  const nutz = { ...a.nutz };
  for (const w of ["haupt", "links", "rechts", "gegenueber"] as WandId[]) {
    nutz[w] = Math.min(nutz[w], wandlaenge(a, w));
  }
  const fenster = a.fenster
    ? { ...a.fenster, von: Math.min(a.fenster.von, Math.max(0, wandlaenge(a, a.fenster.wand) - a.fenster.breite)) }
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
  const eckstart = w !== waende[0] && a.form !== "zwei-waende" ? KORPUSTIEFE : 0;

  let von = eckstart;
  let bis = L;
  if (a.tuer.wand === w) {
    const davor = { von: eckstart, bis: Math.max(eckstart, a.tuer.von - TUERLUFT) };
    const dahinter = { von: Math.max(eckstart, a.tuer.von + a.tuer.breite + TUERLUFT), bis: L };
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
}

/** Die Posten, aus denen sich der Preis zusammensetzt. Alles EUR netto. */
/**
 * Wo ein Hängeschrank hinpasst: über jedem breiten Unterschrank, der kein
 * Hochschrank ist und nicht vor dem Fenster steht. Die Unterlagen brauchen
 * die einzelnen Plätze, der Preis nur ihre Zahl — darum eine Quelle.
 */
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

function pflichtmodule(a: Raumangaben): string[] {
  const g = a.geraete;
  const liste = ["SP600"];
  if (geraet(g.kochfeld).breite > 0) liste.push("KF600");
  const ks = geraet(g.kuehlschrank);
  if (ks.bau === "hoch") liste.push("HK600");
  else if (ks.bau === "unterbau") liste.push("US600");
  if (a.ofenHoch && geraet(g.backofen).breite > 0) liste.push("HB600");
  const gs = geraet(g.spuelmaschine);
  if (gs.breite === 600) liste.push("GS600");
  else if (gs.breite === 450) liste.push("US450");
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
function verteile(typ: Kuechentyp, a: Raumangaben, pflicht: string[]): Record<string, string[]> {
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
  for (const id of ["GS600", "US450"]) {
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
  return zu;
}

function breiteVon(ids: string[]): number {
  return ids.reduce((s, id) => s + (modul(id).breite ?? 0), 0);
}

function fuellung(rest: number, strategie: Strategie): string[] {
  const breit = strategie === "stauraum" ? "AZ600" : "US600";
  let besteA = 0, besteB = 0, bestBelegt = -1;
  for (let a = 0; a * 600 <= rest; a++) {
    for (let b = 0; a * 600 + b * 450 <= rest; b++) {
      const belegt = a * 600 + b * 450;
      if (belegt > bestBelegt || (belegt === bestBelegt && a > besteA)) {
        bestBelegt = belegt; besteA = a; besteB = b;
      }
    }
  }
  const aus = [...Array<string>(besteA).fill(breit), ...Array<string>(besteB).fill("US450")];
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

function anordnungen(module: string[], grenze = 20000): string[][] {
  const zaehler = new Map<string, number>();
  for (const m of module) zaehler.set(m, (zaehler.get(m) ?? 0) + 1);
  const arten = [...zaehler.keys()];
  const aus: string[][] = [];
  const aktuell: string[] = [];

  const schritt = () => {
    if (aus.length >= grenze) return;
    if (aktuell.length === module.length) { aus.push([...aktuell]); return; }
    for (const art of arten) {
      const n = zaehler.get(art)!;
      if (n === 0) continue;
      zaehler.set(art, n - 1);
      aktuell.push(art);
      schritt();
      aktuell.pop();
      zaehler.set(art, n);
      if (aus.length >= grenze) return;
    }
  };
  schritt();
  return aus;
}

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
    punkte -= Math.abs((l.von + l.bis) / 2 - wasserZiel);
  }
  // Spuelmaschine gehoert neben die Spuele
  const iGs = ids.indexOf("GS600");
  if (iSp >= 0 && iGs >= 0) punkte -= Math.abs(iSp - iGs) * 220;
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

function besteAnordnung(
  module: string[],
  laenge: number,
  zone: { von: number; bis: number } | null,
  strategie: Strategie,
  wasserZiel: number | null,
): { ids: string[]; moeglich: boolean } {
  const kandidaten = anordnungen(module);
  let beste: string[] | null = null;
  let bestPunkte = -Infinity;
  for (const k of kandidaten) {
    if (!zulaessig(k, laenge, zone)) continue;
    const p = bewerte(k, strategie, wasserZiel);
    if (p > bestPunkte) { bestPunkte = p; beste = k; }
  }
  if (beste) return { ids: beste, moeglich: true };
  // Keine zulaessige Anordnung: die am wenigsten schlechte nehmen und melden.
  let ersatz = kandidaten[0] ?? module;
  let best2 = -Infinity;
  for (const k of kandidaten) {
    const p = bewerte(k, strategie, wasserZiel);
    if (p > best2) { best2 = p; ersatz = k; }
  }
  return { ids: ersatz, moeglich: false };
}

export function planeKueche(a: Raumangaben, strategie: Strategie): Vorschlag {
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

  const zuordnung = verteile(typ, a, pflicht);
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
  return STRATEGIEN.map((s) => planeKueche(a, s.id));
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
export function ausBelegung(
  a: Raumangaben,
  typ: Kuechentyp,
  strategie: Strategie,
  belegung: Record<string, string[]>,
): Vorschlag {
  const titel = STRATEGIEN.find((s) => s.id === strategie)!.titel;
  const wasserZeile = `Z-${a.wasser.wand}`;

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
  const haenge = haengeschraenke * modul("HS600").preis;
  const platte = Math.round(modul("AP").preis * lfm);
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

  const kosten = {
    korpusse, haenge, platte, sockel, spuele, montage,
    moebel, zuschlag, geraete,
    gesamt: Math.max(600, moebel + zuschlag + geraete),
  };
  const preis = kosten.gesamt;

  const hauptId = `Z-${kuechenwaende(a)[0]}`;
  const z1 = belegung[hauptId] ?? [];
  const iSp = z1.indexOf("SP600");
  const iKf = z1.indexOf("KF600");
  let arbeitsflaeche = 0;
  if (iSp >= 0 && iKf >= 0) {
    arbeitsflaeche = breiteVon(z1.slice(Math.min(iSp, iKf) + 1, Math.max(iSp, iKf)));
  }
  const wZeile = typ.zeilen.find((z) => z.id === wasserZeile);
  const spIdx = wZeile ? (belegung[wZeile.id] ?? []).indexOf("SP600") : -1;
  const wegZumWasser =
    wZeile && spIdx >= 0
      ? Math.round(Math.abs((lageIn(belegung[wZeile.id], spIdx).von + lageIn(belegung[wZeile.id], spIdx).bis) / 2 - (a.wasser.von - wZeile.start)))
      : 1500;
  const passblende = breiteVon(Object.values(belegung).flat().filter((m) => modul(m).kategorie === "blende"));

  const gut: string[] = [];
  const achtung: string[] = [];

  if (arbeitsflaeche >= 900) gut.push(`${Math.round(arbeitsflaeche / 10)} cm freie Fläche zwischen Spüle und Herd — bequem zum Schneiden und Abstellen.`);
  else if (arbeitsflaeche >= 450) gut.push(`${Math.round(arbeitsflaeche / 10)} cm zwischen Spüle und Herd. Reicht, ist aber nicht üppig.`);
  else if (iSp >= 0 && iKf >= 0) achtung.push("Spüle und Herd stehen direkt nebeneinander — unpraktisch beim Kochen, dafür kurze Leitungswege.");

  if (wegZumWasser <= 600) gut.push("Die Spüle bleibt am vorhandenen Anschluss — kein Installateur nötig.");
  else achtung.push(`Die Spüle liegt etwa ${Math.round(wegZumWasser / 100) * 10} cm vom heutigen Anschluss entfernt. Das muss verlegt werden.`);

  if (passblende > 0 && passblende <= 150) gut.push(`${passblende} mm Rest schließt eine Passleiste — das ist normal und wird vor Ort zugeschnitten.`);
  else if (passblende > 150) achtung.push(`${passblende} mm bleiben als Passleiste übrig. Das ist viel — ein Küchenbetrieb würde eher einen Schrank breiter wählen.`);
  if (kochfeldGerueckt) gut.push("Der Herd steht nicht direkt an der Wand, damit daneben Platz zum Abstellen bleibt.");
  if (fensterKonflikt) achtung.push("Vor dem Fenster steht ein hoher Schrank — er nimmt Licht. Verschieb das Fenster oder nutze mehr Wandlänge.");
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
export function befundeZeile(a: Raumangaben, typ: Kuechentyp, zeileId: string, ids: string[]): string[] {
  const z = typ.zeilen.find((x) => x.id === zeileId);
  if (!z) return [];
  const hin: string[] = [];
  const f = typ.oeffnungen.find((o) => o.art === "fenster" && o.wand === z.wand);
  const zone = f ? { von: f.von - z.start, bis: f.von + f.breite - z.start } : null;

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const l = lageIn(ids, i);
    const m = modul(id);
    if (zone && m.kategorie === "hochschrank" && l.von < zone.bis && l.bis > zone.von) {
      hin.push(`Der ${ROLLE_NAME[rolleVon(id)] || "hohe Schrank"} steht vor dem Fenster und nimmt Licht.`);
    }
    if (id === "KF600") {
      const abstand = Math.min(l.von, z.laenge - l.bis);
      if (abstand < SEITENABSTAND_KOCHFELD) {
        hin.push(
          abstand <= 0
            ? "Der Herd steht direkt an der Wand — daneben bleibt kein Platz zum Abstellen."
            : `Neben dem Herd bleiben nur ${Math.round(abstand / 10)} cm bis zur Wand. Empfohlen sind ${SEITENABSTAND_KOCHFELD / 10} cm.`,
        );
      }
    }
  }

  const iSp = ids.indexOf("SP600");
  const iGs = ids.indexOf("GS600");
  if (iSp >= 0 && iGs >= 0 && Math.abs(iSp - iGs) > 1) {
    hin.push("Die Spülmaschine steht nicht mehr neben der Spüle — dann braucht sie eigene Anschlüsse.");
  }
  if (SEITE[a.wasser.wand] === z.wand && iSp >= 0) {
    const l = lageIn(ids, iSp);
    const weg = Math.abs((l.von + l.bis) / 2 - (a.wasser.von - z.start));
    if (weg > 900) hin.push(`Die Spüle liegt jetzt rund ${Math.round(weg / 100) * 10} cm vom Wasseranschluss entfernt.`);
  }
  return hin;
}

/* ---------------------------------------------------------------- */

const PBX_MIN = 20;
const PBX_MAX = 600;

/** Die Passleiste einer Zeile um delta mm ändern, damit die Summe stimmt. */
function passeAn(ids: string[], delta: number): string[] | null {
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
  const zGs = wo("GS600");

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
