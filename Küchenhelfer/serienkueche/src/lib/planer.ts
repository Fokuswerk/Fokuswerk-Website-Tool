import { modul } from "@/data/module";
import type { Kuechentyp, Oeffnung, Wandseite, Zeile } from "@/lib/typen";
import type { VarianteRoh } from "@/data/varianten";

/**
 * Planer für frei eingegebene Räume.
 *
 * Anders als die vorberechneten Projektvarianten rechnet das hier wirklich:
 * aus Wandlängen, Öffnungen, Wasseranschluss und Wünschen entsteht eine
 * Modulfolge. Die Regeln, die ein Laie nicht kennt, stecken hier drin —
 * Rastermaße, Abstand Spüle zu Kochfeld, kein Kochfeld in der Ecke, kein
 * Oberschrank vor dem Fenster, Spüle nah am Abfluss.
 *
 * Kein Solver, sondern regelgeleitetes Bauen mit anschließender Prüfung.
 * Findet sich keine zulässige Lösung, sagt der Planer warum.
 */

export type Raumform = "eine-wand" | "ecke" | "zwei-waende" | "u-form";

export interface Wunschliste {
  geschirrspueler: boolean;
  backofenHoch: boolean;
  grosserKuehlschrank: boolean;
  niveau: "einfach" | "mittel" | "gehoben";
}

export interface Raumangaben {
  form: Raumform;
  /** Länge der Hauptwand in mm. */
  wandA: number;
  /** Zweite Wand, je nach Form. */
  wandB: number;
  /** Raumtiefe in mm, also der Abstand zur gegenüberliegenden Wand. */
  tiefe: number;
  fenster: { wand: "A" | "B"; von: number; breite: number } | null;
  tuer: { wand: "A" | "B" | "gegenueber"; von: number; breite: number } | null;
  /** Wo kommt heute das Wasser aus der Wand. */
  anschlussWand: "A" | "B";
  anschlussVon: number;
  wuensche: Wunschliste;
}

export const STANDARD_RAUM: Raumangaben = {
  form: "eine-wand",
  wandA: 3200,
  wandB: 1800,
  tiefe: 2800,
  fenster: { wand: "A", von: 1900, breite: 1200 },
  tuer: { wand: "gegenueber", von: 2000, breite: 885 },
  anschlussWand: "A",
  anschlussVon: 2400,
  wuensche: {
    geschirrspueler: true,
    backofenHoch: false,
    grosserKuehlschrank: true,
    niveau: "mittel",
  },
};

export const FORMEN: Array<{ id: Raumform; titel: string; erklaerung: string; zeilen: number }> = [
  { id: "eine-wand", titel: "Alles an einer Wand", erklaerung: "Die Küche steht in einer geraden Zeile. Der häufigste Fall in kleineren Wohnungen.", zeilen: 1 },
  { id: "ecke", titel: "Über Eck", erklaerung: "Zwei Wände im rechten Winkel. Gibt mehr Arbeitsfläche als eine gerade Zeile.", zeilen: 2 },
  { id: "zwei-waende", titel: "Zwei Wände gegenüber", erklaerung: "Zwei Zeilen mit einem Gang dazwischen. Braucht mindestens 1,20 m Platz in der Mitte.", zeilen: 2 },
  { id: "u-form", titel: "U-Form", erklaerung: "Drei Wände. Viel Stauraum, braucht aber einen entsprechend großen Raum.", zeilen: 3 },
];

export function zeilenzahl(form: Raumform): number {
  return FORMEN.find((f) => f.id === form)!.zeilen;
}

/* ------------------------------------------------------------------ */
/* Umwandlung in die Geometrie, mit der die Zeichnungen schon arbeiten */
/* ------------------------------------------------------------------ */

function wandSeite(w: "A" | "B" | "gegenueber"): Wandseite {
  if (w === "A") return "nord";
  if (w === "B") return "west";
  return "sued";
}

export function alsKuechentyp(a: Raumangaben): Kuechentyp {
  const zeilen: Zeile[] = [{ id: "Z1", wand: "nord", start: 0, laenge: a.wandA, bezeichnung: "Hauptwand" }];
  if (a.form === "ecke" || a.form === "u-form") {
    zeilen.push({ id: "Z2", wand: "west", start: 700, laenge: a.wandB, bezeichnung: "Zweite Wand" });
  }
  if (a.form === "zwei-waende") {
    zeilen.push({ id: "Z2", wand: "sued", start: 0, laenge: a.wandB, bezeichnung: "Gegenüberliegende Wand" });
  }
  if (a.form === "u-form") {
    zeilen.push({ id: "Z3", wand: "ost", start: 700, laenge: a.wandB, bezeichnung: "Dritte Wand" });
  }

  const oeffnungen: Oeffnung[] = [];
  if (a.fenster) {
    oeffnungen.push({
      id: "F1", art: "fenster", wand: wandSeite(a.fenster.wand),
      von: a.fenster.von, breite: a.fenster.breite, bruestung: 900, hoehe: 1400,
    });
  }
  if (a.tuer) {
    oeffnungen.push({
      id: "T1", art: "tuer", wand: wandSeite(a.tuer.wand),
      von: a.tuer.von, breite: a.tuer.breite, anschlag: "links", oeffnetNach: "innen",
    });
  }

  const breite = a.form === "u-form" ? Math.max(a.wandA, 2400) : a.wandA;

  return {
    id: "MEINE",
    kurz: "Meine Küche",
    bezeichnung: FORMEN.find((f) => f.id === a.form)!.titel,
    grundform: a.form === "zwei-waende" ? "zweizeilig" : a.form === "eine-wand" ? "einzeilig" : "l-form",
    raum: { breite, tiefe: a.tiefe, hoehe: 2600 },
    zeilen,
    oeffnungen,
    zwangspunkte: [
      {
        id: "W1", art: "fallstrang", wand: wandSeite(a.anschlussWand),
        von: Math.max(0, a.anschlussVon - 200), breite: 400,
        bezeichnung: "Wasser- und Abwasseranschluss",
        herkunft: "erfasst", freigabe: "bestaetigt",
      },
    ],
    attribute: {},
    pruefpunkte: [],
    wohnungen: [],
    gespiegelt: [],
  };
}

/* ------------------------------------------------------------------ */
/* Der eigentliche Planer                                              */
/* ------------------------------------------------------------------ */

export type Strategie = "guenstig" | "stauraum" | "arbeiten";

export const STRATEGIEN: Array<{ id: Strategie; titel: string; satz: string }> = [
  { id: "guenstig", titel: "Günstig", satz: "So wenig teure Teile wie möglich." },
  { id: "stauraum", titel: "Viel Stauraum", satz: "Breite Auszüge statt schmaler Schränke, Hängeschränke wo möglich." },
  { id: "arbeiten", titel: "Gut zum Arbeiten", satz: "Möglichst viel freie Fläche zwischen Spüle und Herd." },
];

export interface Vorschlag {
  strategie: Strategie;
  titel: string;
  moeglich: boolean;
  /** Wenn nicht möglich: was fehlt, in Alltagssprache. */
  grund?: string;
  belegung: Record<string, string[]>;
  haengeschraenke: number;
  /** Nur Zeilenmodule, für die Zeichnung. */
  variante: VarianteRoh;
  preis: number;
  arbeitsflaeche: number;
  wegZumWasser: number;
  passblende: number;
  gutPunkte: string[];
  achtungPunkte: string[];
}

/** Welche Module der Nutzer bestellt haben will. */
function pflichtmodule(w: Wunschliste): string[] {
  const liste = ["SP600", "KF600"];
  liste.push(w.grosserKuehlschrank ? "HK600" : "US600");
  if (w.geschirrspueler) liste.push("GS600");
  if (w.backofenHoch) liste.push("HB600");
  return liste;
}

function breiteVon(ids: string[]): number {
  return ids.reduce((s, id) => s + (modul(id).breite ?? 0), 0);
}

/** Füllt die Restlänge mit Schränken, am Ende bleibt eine Passblende. */
function fuellung(rest: number, strategie: Strategie): string[] {
  // Die Kombination aus 600ern und 450ern suchen, die den kleinsten Rest
  // laesst. Stur 600er zu nehmen erzeugt unnoetig breite Passleisten:
  // 1.600 mm werden sonst 600+600 mit 400 mm Rest statt 600+450+450 mit 100.
  const breit = strategie === "stauraum" ? "AZ600" : "US600";
  let besteA = 0;
  let besteB = 0;
  let bestBelegt = -1;
  for (let a = 0; a * 600 <= rest; a++) {
    for (let b = 0; a * 600 + b * 450 <= rest; b++) {
      const belegt = a * 600 + b * 450;
      // Bei gleichem Rest die breiteren Schraenke bevorzugen.
      if (belegt > bestBelegt || (belegt === bestBelegt && a > besteA)) {
        bestBelegt = belegt;
        besteA = a;
        besteB = b;
      }
    }
  }
  const aus: string[] = [
    ...Array<string>(besteA).fill(breit),
    ...Array<string>(besteB).fill("US450"),
  ];
  const uebrig = rest - bestBelegt;
  // Der Rest wird zur zugeschnittenen Passleiste. Unter 20 mm faellt er weg,
  // das liegt innerhalb der Bautoleranz.
  if (uebrig >= 20) aus.push(`PBX:${uebrig}`);
  return aus;
}

/** Steht an dieser Stelle ein Fenster? */
function vorFenster(typ: Kuechentyp, zeile: Zeile, von: number, bis: number): boolean {
  return typ.oeffnungen.some((o) => {
    if (o.art !== "fenster" || o.wand !== zeile.wand) return false;
    const fv = o.von - zeile.start;
    return von < fv + o.breite && bis > fv;
  });
}

function ordne(module: string[], strategie: Strategie, w: Wunschliste): string[] {
  const hat = (id: string) => module.includes(id);
  const ohne = (ids: string[]) => module.filter((m) => !ids.includes(m));

  const hoch = module.filter((m) => m === "HK600" || m === "HB600");
  const spuele = hat("SP600") ? ["SP600"] : [];
  const gs = hat("GS600") ? ["GS600"] : [];
  const kochfeld = hat("KF600") ? ["KF600"] : [];
  const fueller = ohne(["HK600", "HB600", "SP600", "GS600", "KF600"]);
  const blende = fueller.filter((f) => modul(f).kategorie === "blende");
  const echteFueller = fueller.filter((f) => modul(f).kategorie !== "blende");

  void w;
  if (strategie === "arbeiten") {
    // Alle Schränke zwischen Kochfeld und Spüle: das ergibt die längste
    // zusammenhängende Arbeitsfläche, auf der man wirklich schneiden kann.
    return [...hoch, ...kochfeld, ...echteFueller, ...spuele, ...gs, ...blende];
  }
  // Günstig und Stauraum: Kochfeld und Nassbereich beieinander. Das hält die
  // Leitungswege kurz und kostet weniger, geht aber auf Kosten der
  // Arbeitsfläche zwischen beiden.
  return [...hoch, ...kochfeld, ...spuele, ...gs, ...echteFueller, ...blende];
}

function spuelenMitte(belegung: string[], index: number): number {
  let x = 0;
  for (let i = 0; i < index; i++) x += modul(belegung[i]).breite ?? 0;
  return x + (modul(belegung[index]).breite ?? 0) / 2;
}


/**
 * Neben einem Kochfeld muss seitlich Platz bleiben — direkt an der Wand oder
 * nur mit einer schmalen Leiste daneben darf es nicht stehen. Sitzt es zu
 * dicht am Ende, tauscht es mit dem naechsten Schrank nach innen.
 */
const SEITENABSTAND_KOCHFELD = 300;

function haltAbstand(ids: string[], laenge: number): { ids: string[]; gerueckt: boolean } {
  const i = ids.indexOf("KF600");
  if (i < 0) return { ids, gerueckt: false };
  const freiBei = (liste: string[], idx: number) => {
    const von = liste.slice(0, idx).reduce((s, m) => s + (modul(m).breite ?? 0), 0);
    const bis = von + (modul(liste[idx]).breite ?? 0);
    return Math.min(von, laenge - bis);
  };
  if (freiBei(ids, i) >= SEITENABSTAND_KOCHFELD) return { ids, gerueckt: false };

  const richtung = i < ids.length / 2 ? 1 : -1;
  for (let j = i + richtung; j >= 0 && j < ids.length; j += richtung) {
    if (modul(ids[j]).kategorie !== "unterschrank") continue;
    const kopie = [...ids];
    const merk = kopie[i];
    kopie[i] = kopie[j];
    kopie[j] = merk;
    if (freiBei(kopie, kopie.indexOf("KF600")) >= SEITENABSTAND_KOCHFELD) {
      return { ids: kopie, gerueckt: true };
    }
  }
  return { ids, gerueckt: false };
}

export function planeKueche(a: Raumangaben, strategie: Strategie): Vorschlag {
  const typ = alsKuechentyp(a);
  const titel = STRATEGIEN.find((s) => s.id === strategie)!.titel;
  const leer: Vorschlag = {
    strategie, titel, moeglich: false, belegung: {}, haengeschraenke: 0,
    variante: { id: `frei-${strategie}`, typId: "MEINE", kurz: titel, schwerpunkt: "kosten", bezeichnung: titel, belegung: {}, weitere: [], staerken: [], schwaechen: [], begruendung: "" },
    preis: 0, arbeitsflaeche: 0, wegZumWasser: 0, passblende: 0, gutPunkte: [], achtungPunkte: [],
  };

  const pflicht = pflichtmodule(a.wuensche);
  const pflichtBreite = breiteVon(pflicht);
  const hauptzeile = typ.zeilen[0];
  const gesamtLaenge = typ.zeilen.reduce((s, z) => s + z.laenge, 0);

  if (pflichtBreite > gesamtLaenge) {
    const fehlt = pflichtBreite - gesamtLaenge;
    return {
      ...leer,
      grund: `Für alles zusammen fehlen etwa ${Math.ceil(fehlt / 10) * 10} mm Wand. Ohne Geschirrspüler oder mit einem Kühlschrank unter der Arbeitsplatte würde es passen.`,
    };
  }

  // Module auf die Zeilen verteilen: Hauptzeile zuerst füllen
  const belegung: Record<string, string[]> = {};
  let offenePflicht = [...pflicht];

  for (const z of typ.zeilen) {
    const platz = z.laenge;
    const nehmen: string[] = [];
    let benutzt = 0;
    for (let i = 0; i < offenePflicht.length; ) {
      const m = offenePflicht[i];
      const b = modul(m).breite ?? 0;
      if (benutzt + b <= platz) {
        nehmen.push(m);
        benutzt += b;
        offenePflicht.splice(i, 1);
      } else {
        i += 1;
      }
    }
    const rest = platz - benutzt;
    const voll = [...nehmen, ...fuellung(rest, strategie)];
    belegung[z.id] = ordne(voll, strategie, a.wuensche);
  }

  // Spüle möglichst nah an den Anschluss: notfalls die Zeile spiegeln
  for (const z of typ.zeilen) {
    const idx = belegung[z.id].indexOf("SP600");
    if (idx < 0) continue;
    const anschlussLokal = a.anschlussVon - z.start;
    const jetzt = Math.abs(spuelenMitte(belegung[z.id], idx) - anschlussLokal);
    const gedreht = [...belegung[z.id]].reverse();
    const idxG = gedreht.indexOf("SP600");
    const dann = Math.abs(spuelenMitte(gedreht, idxG) - anschlussLokal);
    if (dann < jetzt) belegung[z.id] = gedreht;
  }

  let kochfeldGerueckt = false;
  for (const z of typ.zeilen) {
    const r = haltAbstand(belegung[z.id] ?? [], z.laenge);
    belegung[z.id] = r.ids;
    if (r.gerueckt) kochfeldGerueckt = true;
  }

  const variante: VarianteRoh = {
    id: `frei-${strategie}`, typId: "MEINE", kurz: titel, schwerpunkt: "kosten",
    bezeichnung: titel, belegung, weitere: [], staerken: [], schwaechen: [], begruendung: "",
  };

  // Hängeschränke: überall wo kein Hochschrank steht und kein Fenster stört
  let haengeschraenke = 0;
  for (const z of typ.zeilen) {
    let x = 0;
    for (const id of belegung[z.id]) {
      const b = modul(id).breite ?? 0;
      const kat = modul(id).kategorie;
      if (kat !== "hochschrank" && kat !== "blende" && b >= 450 && !vorFenster(typ, z, x, x + b)) {
        haengeschraenke += 1;
      }
      x += b;
    }
  }

  // Preis aus Modulkatalog, Flächen und Geräten
  const lfm = gesamtLaenge / 1000;
  const geraetepaket = a.wuensche.geschirrspueler ? "GP2" : "GP1";
  const aufschlag = a.wuensche.niveau === "gehoben" ? 1.35 : a.wuensche.niveau === "einfach" ? 0.82 : 1;
  let preis = 0;
  for (const z of typ.zeilen) for (const id of belegung[z.id]) preis += modul(id).preis;
  preis += haengeschraenke * modul("HS600").preis;
  preis += Math.round(modul("AP").preis * lfm);
  preis += Math.round(modul("SO").preis * lfm);
  preis += modul(geraetepaket).preis;
  preis += modul("SPA").preis;
  preis += Math.round(modul("MON").preis * lfm);
  preis = Math.round(preis * aufschlag);

  // Kennzahlen und Hinweise
  const z1 = belegung[hauptzeile.id] ?? [];
  const iSp = z1.indexOf("SP600");
  const iKf = z1.indexOf("KF600");
  let arbeitsflaeche = 0;
  if (iSp >= 0 && iKf >= 0) {
    const von = Math.min(iSp, iKf);
    const bis = Math.max(iSp, iKf);
    arbeitsflaeche = breiteVon(z1.slice(von + 1, bis));
  }
  const wegZumWasser =
    iSp >= 0 ? Math.round(Math.abs(spuelenMitte(z1, iSp) - (a.anschlussVon - hauptzeile.start))) : 0;
  const passblende = breiteVon(
    Object.values(belegung).flat().filter((m) => modul(m).kategorie === "blende"),
  );

  const gut: string[] = [];
  const achtung: string[] = [];

  if (arbeitsflaeche >= 900) gut.push(`${arbeitsflaeche} mm freie Fläche zwischen Spüle und Herd — bequem zum Schneiden und Abstellen.`);
  else if (arbeitsflaeche >= 450) gut.push(`${arbeitsflaeche} mm zwischen Spüle und Herd. Reicht, ist aber nicht üppig.`);
  else if (iSp >= 0 && iKf >= 0) achtung.push("Spüle und Herd stehen direkt nebeneinander. Zum Arbeiten unpraktisch, dafür kurze Leitungswege.");

  if (wegZumWasser <= 600) gut.push("Die Spüle bleibt nah am vorhandenen Anschluss — kein neuer Leitungsweg nötig.");
  else achtung.push(`Die Spüle liegt etwa ${Math.round(wegZumWasser / 100) * 10} cm vom heutigen Anschluss entfernt. Das muss der Installateur verlegen.`);

  if (passblende > 0 && passblende <= 150) gut.push(`${passblende} mm Rest werden mit einer Passleiste geschlossen — das ist normal, die wird vor Ort zugeschnitten.`);
  else if (passblende > 150) achtung.push(`${passblende} mm bleiben als Passleiste übrig. Das ist viel. Ein Küchenbetrieb würde dafür eher einen Schrank breiter wählen — fragen Sie danach.`);
  if (kochfeldGerueckt) gut.push("Das Kochfeld ist von der Wand weggerückt, damit seitlich Platz zum Abstellen bleibt.");
  if (haengeschraenke === 0) achtung.push("Oberschränke gehen hier nicht, weil Fenster oder Hochschränke die Wand belegen.");

  if (a.form === "zwei-waende" && a.tiefe - 1200 < 1200) {
    achtung.push(`Zwischen den beiden Zeilen bleiben nur ${a.tiefe - 1200} mm Gang. Empfohlen sind mindestens 1.200 mm, sonst lassen sich gegenüberliegende Schränke nicht gleichzeitig öffnen.`);
  }
  if (!a.wuensche.geschirrspueler) achtung.push("Ohne Geschirrspüler geplant. Nachträglich einbauen geht nur, wenn ein 600er Schrank neben der Spüle weicht.");

  return {
    strategie, titel, moeglich: true, belegung, haengeschraenke, variante,
    preis, arbeitsflaeche, wegZumWasser, passblende,
    gutPunkte: gut, achtungPunkte: achtung,
  };
}

export function alleVorschlaege(a: Raumangaben): Vorschlag[] {
  return STRATEGIEN.map((s) => planeKueche(a, s.id));
}

/** Warnungen zu den Eingaben selbst, noch vor der Planung. */
export function pruefeAngaben(a: Raumangaben): string[] {
  const hinweise: string[] = [];
  if (a.wandA < 1800) hinweise.push("Unter 1,80 m Wandlänge bekommt man Spüle, Herd und Kühlschrank nicht unter.");
  if (a.tiefe < 2100) hinweise.push("Bei weniger als 2,10 m Raumtiefe wird es vor der Küche eng — man braucht etwa 1,20 m zum Stehen und Bücken.");
  if (a.form === "zwei-waende" && a.tiefe < 2400) hinweise.push("Für zwei Zeilen gegenüber sollte der Raum mindestens 2,40 m tief sein.");
  if (a.fenster && a.fenster.von + a.fenster.breite > a.wandA) hinweise.push("Das Fenster liegt rechnerisch außerhalb der Wand. Bitte die Angaben prüfen.");
  if (a.anschlussVon > a.wandA) hinweise.push("Der Wasseranschluss liegt rechnerisch außerhalb der Wand.");
  return hinweise;
}
