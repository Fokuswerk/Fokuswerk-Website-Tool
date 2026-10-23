import { modul } from "@/data/module";
import { geraet, STANDARD_GERAETE, type Geraetewahl } from "@/data/geraete";
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
  /** Bei "ecke": liegt die zweite Zeile links oder rechts. */
  seite: "links" | "rechts";
  /** Länge der Haupt- und der gegenüberliegenden Wand in mm. */
  breite: number;
  /** Länge der beiden Seitenwände in mm. */
  tiefe: number;
  /** Wie viel jeder Wand die Küche belegen darf. */
  nutz: Record<WandId, number>;
  fenster: { wand: WandId; von: number; breite: number } | null;
  tuer: { wand: WandId; von: number; breite: number };
  wasser: { wand: WandId; von: number };
  geraete: Geraetewahl;
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

export function kuechenwaende(a: Pick<Raumangaben, "form" | "seite">): WandId[] {
  if (a.form === "eine-wand") return ["haupt"];
  if (a.form === "ecke") return ["haupt", a.seite];
  if (a.form === "zwei-waende") return ["haupt", "gegenueber"];
  return ["links", "haupt", "rechts"];
}

export function wandlaenge(a: Raumangaben, w: WandId): number {
  return w === "haupt" || w === "gegenueber" ? a.breite : a.tiefe;
}

export const STANDARD_RAUM: Raumangaben = {
  form: "eine-wand",
  seite: "links",
  breite: 3400,
  tiefe: 2800,
  nutz: { haupt: 3400, links: 2800, rechts: 2800, gegenueber: 3400 },
  fenster: { wand: "haupt", von: 2000, breite: 1200 },
  tuer: { wand: "gegenueber", von: 1800, breite: 885 },
  wasser: { wand: "haupt", von: 2500 },
  geraete: { ...STANDARD_GERAETE },
  niveau: "mittel",
};

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

export function zeilenStart(a: Raumangaben, w: WandId): number {
  return w !== "haupt" && a.form !== "zwei-waende" ? KORPUSTIEFE : 0;
}

export function alsKuechentyp(a: Raumangaben): Kuechentyp {
  const zeilen: Zeile[] = kuechenwaende(a).map((w) => {
    const start = zeilenStart(a, w);
    const platz = Math.max(0, Math.min(a.nutz[w], wandlaenge(a, w) - start));
    return { id: `Z-${w}`, wand: SEITE[w], start, laenge: platz, bezeichnung: WANDNAME[w] };
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
}

function pflichtmodule(g: Geraetewahl): string[] {
  const liste = ["SP600"];
  if (geraet(g.kochfeld).breite > 0) liste.push("KF600");
  const ks = geraet(g.kuehlschrank);
  if (ks.id === "kuehl-gross") liste.push("HK600");
  else if (ks.id === "kuehl-klein") liste.push("US600");
  if (geraet(g.backofen).breite === 600) liste.push("HB600");
  const gs = geraet(g.spuelmaschine);
  if (gs.breite === 600) liste.push("GS600");
  else if (gs.breite === 450) liste.push("US450");
  return liste;
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
  if (uebrig >= 20) aus.push(`PBX:${uebrig}`);
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

function zulaessig(ids: string[], laenge: number, zone: { von: number; bis: number } | null): boolean {
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
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
  };

  const pflicht = pflichtmodule(a.geraete);
  const gesamt = typ.zeilen.reduce((s, z) => s + z.laenge, 0);
  if (breiteVon(pflicht) > gesamt) {
    const fehlt = Math.ceil((breiteVon(pflicht) - gesamt) / 10) * 10;
    return { ...leer, grund: `Es fehlen etwa ${fehlt} mm Wand. Mit einer schmalen Spülmaschine, einem Kühlschrank unter der Platte oder dem Backofen unter dem Kochfeld würde es passen.` };
  }

  const belegung: Record<string, string[]> = {};
  const offen = [...pflicht];
  const wasserZeile = `Z-${a.wasser.wand}`;
  let fensterKonflikt = false;
  let kochfeldGerueckt = false;

  for (const z of typ.zeilen) {
    // Pflichtmodule auf die Zeilen verteilen, Hauptzeile zuerst
    const nehmen: string[] = [];
    let benutzt = 0;
    for (let i = 0; i < offen.length; ) {
      const b = modul(offen[i]).breite ?? 0;
      if (benutzt + b <= z.laenge) { nehmen.push(offen[i]); benutzt += b; offen.splice(i, 1); }
      else i += 1;
    }
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

  const variante: VarianteRoh = {
    id: `frei-${strategie}`, typId: "MEINE", kurz: titel, schwerpunkt: "kosten",
    bezeichnung: titel, belegung, weitere: [], staerken: [], schwaechen: [], begruendung: "",
  };

  let haengeschraenke = 0;
  for (const z of typ.zeilen) {
    const f = typ.oeffnungen.find((o) => o.art === "fenster" && o.wand === z.wand);
    let x = 0;
    for (const id of belegung[z.id]) {
      const b = modul(id).breite ?? 0;
      const kat = modul(id).kategorie;
      const stoert = f ? x < f.von + f.breite - z.start && x + b > f.von - z.start : false;
      if (kat !== "hochschrank" && kat !== "blende" && b >= 450 && !stoert) haengeschraenke += 1;
      x += b;
    }
  }

  const lfm = gesamt / 1000;
  const aufschlag = a.niveau === "gehoben" ? 1.35 : a.niveau === "einfach" ? 0.82 : 1;
  let preis = 0;
  for (const z of typ.zeilen) for (const id of belegung[z.id]) preis += modul(id).preis;
  preis += haengeschraenke * modul("HS600").preis;
  preis += Math.round(modul("AP").preis * lfm);
  preis += Math.round(modul("SO").preis * lfm);
  preis += modul("GP1").preis + modul("SPA").preis;
  preis += Math.round(modul("MON").preis * lfm);
  for (const art of Object.keys(a.geraete) as Array<keyof Geraetewahl>) preis += geraet(a.geraete[art]).aufpreis;
  preis = Math.max(600, Math.round(preis * aufschlag));

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

  return { strategie, titel, moeglich: true, belegung, haengeschraenke, variante, preis, arbeitsflaeche, wegZumWasser, passblende, gutPunkte: gut, achtungPunkte: achtung };
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
