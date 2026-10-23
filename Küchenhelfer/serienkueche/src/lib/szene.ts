import { modul } from "@/data/module";
import { platzierung } from "@/lib/berechnung";
import {
  AP_OK, HOCH_H, KORPUS, OS_H, OS_UK, PLATTE, RAUMHOEHE,
  rolleVon, ROLLE_NAME, SOCKEL, TIEFE_OBEN, TIEFE_UNTEN,
} from "@/lib/masse";
import type { Kuechentyp, Wandseite } from "@/lib/typen";
import type { VarianteRoh } from "@/data/varianten";

/**
 * Baut aus dem Plan die Körper für das räumliche Bild.
 *
 * Es sind dieselben Daten wie in der Ansicht von vorn und im Grundriss —
 * jeder Schrank steht hier an der Stelle, an der er später wirklich steht.
 * Nichts daran ist gezeichnete Deko.
 *
 * Materialien bewusst knapp gehalten: warmes Weiß für die Fronten, heller
 * Stein für die Platte, Eiche auf dem Boden und Graphit für Geräte, Sockel
 * und Griffe. Das ist der Kontrast, der das Bild trägt.
 */

type RGB = [number, number, number];

/** Ein Körper der Szene. Achsenparallel, Maße in Millimetern:
    x nach rechts, y in die Raumtiefe, z nach oben. */
export interface Kasten {
  id: string;
  x: number; y: number; z: number;
  bx: number; by: number; bz: number;
  farbe: RGB;
  /** Welches Material — bestimmt Rauheit und Glanz im Bild. */
  stoff?: Stoff;
  /** Zu welchem Schrank der Körper gehört. Erst damit lässt sich im Raum
      ein Schrank anfassen: alle seine Teile tragen dieselbe Kennung. */
  platz?: { zeile: string; index: number };
}

export type Stoff =
  | "boden" | "wand" | "front" | "korpus" | "platte"
  | "graphit" | "stahl" | "griff" | "glas" | "fenster" | "rahmen" | "tuer";

const MATERIAL = {
  boden: [188, 160, 124] as RGB,
  wand: [221, 215, 204] as RGB,
  front: [250, 249, 246] as RGB,
  korpus: [206, 202, 194] as RGB,
  platte: [171, 164, 152] as RGB,
  graphit: [44, 43, 40] as RGB,
  stahl: [164, 165, 162] as RGB,
  griff: [92, 90, 85] as RGB,
  glas: [22, 22, 20] as RGB,
  fenster: [205, 222, 233] as RGB,
  rahmen: [248, 247, 244] as RGB,
  tuer: [224, 218, 208] as RGB,
};

/** Rückweg von der Farbe zum Material: die Werte oben werden als dieselben
    Objekte weitergereicht, deshalb trägt die Identität die Zuordnung. */
const STOFF = new Map<RGB, Stoff>(
  Object.entries(MATERIAL).map(([k, v]) => [v, k as Stoff]),
);

const WANDDICKE = 120;
const SOCKEL_RUECK = 60;
const GRIFF = 13;

/** Eine Wand mit dem, was in ihr steckt. Die der Kamera zugewandten Wände
    werden weggelassen, sonst sähe man in eine geschlossene Kiste. */
export interface Wandkoerper {
  seite: Wandseite;
  /** Normale, die in den Raum zeigt. */
  innen: [number, number, number];
  kaesten: Kasten[];
}

/** Ein Gerät mit seinem Platz — für die Beschriftung im räumlichen Bild. */
export interface Marke {
  id: string;
  name: string;
  wand: Wandseite;
  /** Punkt, an dem das Schild hängt, in mm. */
  pos: [number, number, number];
  /** Umriss des Geräts, für die Hervorhebung. */
  kasten: { x: number; y: number; z: number; bx: number; by: number; bz: number };
}

export interface Szene {
  kaesten: Kasten[];
  marken: Marke[];
  /** Der Boden wird zuerst gezeichnet, darauf die weichen Schatten. */
  boden: Kasten;
  waende: Wandkoerper[];
  /** Innenmaß des Raums, für die Kamera. */
  mitte: [number, number, number];
}

/** Richtung entlang einer Wand und in den Raum hinein. */
function achsen(wand: Wandseite, breite: number, tiefe: number) {
  if (wand === "nord") return { o: [0, 0], e: [1, 0], n: [0, 1] };
  if (wand === "ost") return { o: [breite, 0], e: [0, 1], n: [-1, 0] };
  if (wand === "sued") return { o: [breite, tiefe], e: [-1, 0], n: [0, -1] };
  return { o: [0, tiefe], e: [0, -1], n: [1, 0] };
}

export function baueSzene(typ: Kuechentyp, variante: VarianteRoh): Szene {
  const { breite, tiefe } = typ.raum;
  const kaesten: Kasten[] = [];
  const marken: Marke[] = [];
  let lauf = 0;

  /** Maße in Wandkoordinaten zu einem Quader im Raum machen:
      s entlang der Wand, d in den Raum, z nach oben. */
  const quader = (wand: Wandseite, s0: number, s1: number, d0: number, d1: number, z0: number, z1: number) => {
    const a = achsen(wand, breite, tiefe);
    const xs = [a.o[0] + a.e[0] * s0 + a.n[0] * d0, a.o[0] + a.e[0] * s1 + a.n[0] * d1];
    const ys = [a.o[1] + a.e[1] * s0 + a.n[1] * d0, a.o[1] + a.e[1] * s1 + a.n[1] * d1];
    return {
      x: Math.min(xs[0], xs[1]),
      y: Math.min(ys[0], ys[1]),
      z: z0,
      bx: Math.max(1, Math.abs(xs[1] - xs[0])),
      by: Math.max(1, Math.abs(ys[1] - ys[0])),
      bz: Math.max(1, z1 - z0),
    };
  };

  /** Punkt in Wandkoordinaten als Weltpunkt. */
  const punkt = (wand: Wandseite, sx: number, d: number, z: number): [number, number, number] => {
    const a = achsen(wand, breite, tiefe);
    return [a.o[0] + a.e[0] * sx + a.n[0] * d, a.o[1] + a.e[1] * sx + a.n[1] * d, z];
  };

  // Welchem Schrank gehören die Körper, die gerade entstehen.
  let platzJetzt: { zeile: string; index: number } | null = null;

  const stelle = (
    wand: Wandseite, s0: number, s1: number, d0: number, d1: number,
    z0: number, z1: number, farbe: RGB,
  ) => {
    kaesten.push({
      id: `k${lauf++}`,
      ...quader(wand, s0, s1, d0, d1, z0, z1),
      farbe,
      stoff: STOFF.get(farbe),
      ...(platzJetzt ? { platz: platzJetzt } : {}),
    });
  };

  /** Schrank mit sichtbarer Fuge: dunklerer Korpus, davor die Frontplatte. */
  const schrank = (
    wand: Wandseite, s0: number, s1: number, tiefe_: number, z0: number, z1: number,
  ) => {
    stelle(wand, s0, s1, 0, tiefe_ - 20, z0, z1, MATERIAL.korpus);
    stelle(wand, s0 + 5, s1 - 5, tiefe_ - 20, tiefe_, z0 + 5, z1 - 5, MATERIAL.front);
  };

  const boden: Kasten = {
    id: "boden", x: 0, y: 0, z: -80, bx: breite, by: tiefe, bz: 80,
    farbe: MATERIAL.boden, stoff: "boden",
  };

  // --- Wände. Welche davon zu sehen sind, entscheidet die Kamera später. ---
  const D = WANDDICKE;
  const waende: Wandkoerper[] = [
    { seite: "nord", innen: [0, 1, 0], kaesten: [{ id: "w-n", x: 0, y: -D, z: 0, bx: breite, by: D, bz: RAUMHOEHE, farbe: MATERIAL.wand, stoff: "wand" }] },
    { seite: "ost", innen: [-1, 0, 0], kaesten: [{ id: "w-o", x: breite, y: 0, z: 0, bx: D, by: tiefe, bz: RAUMHOEHE, farbe: MATERIAL.wand, stoff: "wand" }] },
    { seite: "sued", innen: [0, -1, 0], kaesten: [{ id: "w-s", x: 0, y: tiefe, z: 0, bx: breite, by: D, bz: RAUMHOEHE, farbe: MATERIAL.wand, stoff: "wand" }] },
    { seite: "west", innen: [1, 0, 0], kaesten: [{ id: "w-w", x: -D, y: 0, z: 0, bx: D, by: tiefe, bz: RAUMHOEHE, farbe: MATERIAL.wand, stoff: "wand" }] },
  ];

  // Was in einer Wand steckt, verschwindet mit ihr.
  const anWand = (seite: Wandseite) => {
    const vorher = kaesten.length;
    return () => waende.find((w) => w.seite === seite)!.kaesten.push(...kaesten.splice(vorher));
  };

  // --- Fenster und Türen als Laibung in der Wand ---
  for (const o of typ.oeffnungen) {
    const einsortieren = anWand(o.wand);
    const z0 = o.art === "fenster" ? o.bruestung ?? 900 : 0;
    const z1 = o.art === "fenster" ? z0 + (o.hoehe ?? 1400) : 2010;
    const s0 = o.von;
    const s1 = o.von + o.breite;
    const fuellung = o.art === "fenster" ? MATERIAL.fenster : MATERIAL.tuer;
    // Füllung leicht vor der Wand, damit sie nicht mit ihr um dieselbe Ebene streitet.
    stelle(o.wand, s0 + 70, s1 - 70, 0, 22, z0 + 70, z1 - 70, fuellung);
    // Rahmen ringsum
    stelle(o.wand, s0, s1, 0, 50, z1 - 70, z1, MATERIAL.rahmen);
    stelle(o.wand, s0, s0 + 70, 0, 50, z0, z1, MATERIAL.rahmen);
    stelle(o.wand, s1 - 70, s1, 0, 50, z0, z1, MATERIAL.rahmen);
    if (o.art === "fenster") {
      stelle(o.wand, s0 - 40, s1 + 40, 0, 90, z0, z0 + 70, MATERIAL.rahmen);
      // Sprosse
      stelle(o.wand, (s0 + s1) / 2 - 25, (s0 + s1) / 2 + 25, 0, 30, z0 + 70, z1 - 70, MATERIAL.rahmen);
    }
    einsortieren();
  }

  // Steht der Backofen nicht als Hochschrank in der Zeile, sitzt er unter
  // dem Kochfeld. Dann sieht man ihn sonst gar nicht.
  const ofenHoch = typ.zeilen.some((z) =>
    platzierung(variante, z.id).some((p) => p.modulId === "HB600"),
  );

  // --- Die Küchenzeilen ---
  for (const zeile of typ.zeilen) {
    const plaetze = platzierung(variante, zeile.id);
    if (plaetze.length === 0) continue;
    const fenster = typ.oeffnungen.filter((o) => o.art === "fenster" && o.wand === zeile.wand);
    const ab = zeile.start;
    platzJetzt = null;

    // Arbeitsplatte über die ganze Zeile, 20 mm Überstand nach vorn
    stelle(zeile.wand, ab, ab + zeile.laenge, 0, TIEFE_UNTEN + 20, AP_OK - PLATTE, AP_OK, MATERIAL.platte);


    for (const p of plaetze) {
      const s0 = ab + p.von;
      const s1 = ab + p.bis;
      const m = (s0 + s1) / 2;
      const rolle = rolleVon(p.modulId);
      platzJetzt = { zeile: zeile.id, index: p.index };

      // Geräte bekommen eine Marke: Umriss und Punkt für das Schild.
      const merke = (d0: number, d1: number, z0: number, z1: number, zSchild: number, dSchild: number) => {
        marken.push({
          id: `${zeile.id}-${p.index}`,
          name: ROLLE_NAME[rolle],
          wand: zeile.wand,
          pos: punkt(zeile.wand, m, dSchild, zSchild),
          kasten: quader(zeile.wand, s0, s1, d0, d1, z0, z1),
        });
      };

      if (rolle === "leiste") {
        schrank(zeile.wand, s0, s1, TIEFE_UNTEN, 0, AP_OK - PLATTE);
        continue;
      }

      if (rolle === "kuehlschrank" || rolle === "backofen") {
        schrank(zeile.wand, s0, s1, TIEFE_UNTEN, 0, HOCH_H);
        merke(0, TIEFE_UNTEN, 0, HOCH_H, rolle === "kuehlschrank" ? 1700 : 1560, TIEFE_UNTEN + 40);
        if (rolle === "kuehlschrank") {
          // Fugen zwischen den beiden Türen sichtbar machen
          stelle(zeile.wand, s0 + 18, s1 - 18, TIEFE_UNTEN, TIEFE_UNTEN + 8, 40, 1330, MATERIAL.front);
          stelle(zeile.wand, s0 + 18, s1 - 18, TIEFE_UNTEN, TIEFE_UNTEN + 8, 1360, HOCH_H - 40, MATERIAL.front);
          stelle(zeile.wand, s1 - 86, s1 - 62, TIEFE_UNTEN + 8, TIEFE_UNTEN + GRIFF + 8, 1010, 1290, MATERIAL.griff);
          stelle(zeile.wand, s1 - 86, s1 - 62, TIEFE_UNTEN + 8, TIEFE_UNTEN + GRIFF + 8, 1400, 1680, MATERIAL.griff);
        } else {
          stelle(zeile.wand, s0 + 30, s1 - 30, TIEFE_UNTEN, TIEFE_UNTEN + 14, 1240, 1840, MATERIAL.glas);
          stelle(zeile.wand, s0 + 60, s1 - 60, TIEFE_UNTEN + 14, TIEFE_UNTEN + 30, 1760, 1800, MATERIAL.stahl);
        }
        continue;
      }

      // Unterschrank: zurückgesetzter Sockel, Korpus, Griff
      stelle(zeile.wand, s0, s1, 0, TIEFE_UNTEN - SOCKEL_RUECK, 0, SOCKEL, MATERIAL.graphit);
      schrank(zeile.wand, s0, s1, TIEFE_UNTEN, SOCKEL, SOCKEL + KORPUS);
      stelle(
        zeile.wand, s0 + 70, s1 - 70, TIEFE_UNTEN, TIEFE_UNTEN + GRIFF,
        SOCKEL + KORPUS - 96, SOCKEL + KORPUS - 70, MATERIAL.griff,
      );
      if (rolle === "spuelmaschine") {
        merke(0, TIEFE_UNTEN, SOCKEL, SOCKEL + KORPUS, SOCKEL + KORPUS / 2, TIEFE_UNTEN + 40);
        stelle(zeile.wand, s0 + 20, s1 - 20, TIEFE_UNTEN, TIEFE_UNTEN + 10, SOCKEL + KORPUS - 60, SOCKEL + KORPUS - 10, MATERIAL.graphit);
      }

      if (rolle === "herd") {
        if (!ofenHoch) {
          // Backofentür in der Front darunter, mit Griffleiste.
          stelle(zeile.wand, s0 + 32, s1 - 32, TIEFE_UNTEN, TIEFE_UNTEN + 16, SOCKEL + 30, SOCKEL + KORPUS - 150, MATERIAL.glas);
          stelle(zeile.wand, s0 + 70, s1 - 70, TIEFE_UNTEN + 16, TIEFE_UNTEN + 34, SOCKEL + KORPUS - 205, SOCKEL + KORPUS - 165, MATERIAL.stahl);
          marken.push({
            id: `${zeile.id}-${p.index}-ofen`,
            name: "Backofen",
            wand: zeile.wand,
            pos: punkt(zeile.wand, m, TIEFE_UNTEN + 40, SOCKEL + 260),
            kasten: quader(zeile.wand, s0, s1, 0, TIEFE_UNTEN, SOCKEL, SOCKEL + KORPUS - 140),
          });
        }
        merke(40, 560, AP_OK, AP_OK + 14, AP_OK + 120, 300);
        stelle(zeile.wand, m - 290, m + 290, 40, 560, AP_OK, AP_OK + 14, MATERIAL.glas);
        for (const dx of [-140, 140]) {
          for (const dy of [160, 400]) {
            stelle(zeile.wand, m + dx - 80, m + dx + 80, dy - 80, dy + 80, AP_OK + 14, AP_OK + 17, [62, 61, 57]);
          }
        }
        // Dunstabzug darüber, wenn kein Fenster im Weg ist
        const stoert = fenster.some((f) => s0 < f.von + f.breite && s1 > f.von);
        if (!stoert) {
          stelle(zeile.wand, m - 300, m + 300, 0, 480, 1540, 1620, MATERIAL.stahl);
          stelle(zeile.wand, m - 300, m + 300, 0, 480, 1620, 1700, MATERIAL.front);
          stelle(zeile.wand, m - 140, m + 140, 0, 300, 1700, OS_UK + OS_H, MATERIAL.front);
        }
        continue;
      }

      if (rolle === "spuele") {
        merke(60, 520, AP_OK - 150, AP_OK + 6, AP_OK + 150, 300);
        stelle(zeile.wand, m - 270, m + 270, 60, 520, AP_OK - 8, AP_OK + 6, MATERIAL.stahl);
        stelle(zeile.wand, m - 230, m + 230, 95, 485, AP_OK - 150, AP_OK - 8, [138, 138, 134]);
        stelle(zeile.wand, m - 22, m + 22, 90, 134, AP_OK + 6, AP_OK + 290, MATERIAL.stahl);
        stelle(zeile.wand, m - 22, m + 22, 134, 320, AP_OK + 250, AP_OK + 290, MATERIAL.stahl);
      }

      // Hängeschrank, wo er darf
      const vorFenster = fenster.some((f) => s0 < f.von + f.breite && s1 > f.von);
      if (!vorFenster) {
        schrank(zeile.wand, s0, s1, TIEFE_OBEN, OS_UK, OS_UK + OS_H);
        // Schlagschatten unter dem Hängeschrank auf die Rückwand
        stelle(
          zeile.wand, s0 + 70, s1 - 70, TIEFE_OBEN, TIEFE_OBEN + GRIFF,
          OS_UK + 66, OS_UK + 92, MATERIAL.griff,
        );
      }
    }
  }

  platzJetzt = null;
  return { kaesten, marken, boden, waende, mitte: [breite / 2, tiefe / 2, 1100] };
}

/** Die Rollen, die in dieser Küche vorkommen — für die Bildunterschrift. */
export function gezeigteGeraete(typ: Kuechentyp, variante: VarianteRoh): string[] {
  const dabei = new Set<string>();
  for (const z of typ.zeilen) {
    for (const p of platzierung(variante, z.id)) {
      if (modul(p.modulId).kategorie !== "blende") dabei.add(rolleVon(p.modulId));
    }
  }
  return [...dabei];
}
