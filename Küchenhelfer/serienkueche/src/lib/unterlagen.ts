import { belegungsbreite, modul, PREISSTAND, PREIS_GUELTIG_BIS, LIEFERANT } from "@/data/module";
import { geraet, PREISSTAND_GERAETE, type Geraetewahl } from "@/data/geraete";
import { platzierung } from "@/lib/berechnung";
import { AP_OK, HOCH_H, OS_UK, PLATTE, rolleVon, ROLLE_NAME, SOCKEL, TIEFE_UNTEN } from "@/lib/masse";
import { lageIn, WANDNAME, type Raumangaben, type Vorschlag } from "@/lib/planer";
import type { Kuechentyp } from "@/lib/typen";

/**
 * Die Unterlagen, die mit einer Angebotsanfrage rausgehen.
 *
 * Alles darin ist aus dem Plan abgeleitet, nichts zusätzlich erfasst: die
 * Positionsnummern sind dieselben wie in der Zeichnung, die Maßkette ergibt
 * die Wandlänge, und die Summe der Stückliste ist der angezeigte Preis.
 *
 * Wo Werte Konvention sind und nicht aus dem Plan kommen — Höhe einer
 * Steckdose, Größe eines Kochfeldausschnitts — steht das dabei.
 */

/* ------------------------------ Maßkette ------------------------------ */

export interface Massposition {
  nr: number;
  modulId: string;
  name: string;
  /** mm ab Anfang der Zeile. */
  von: number;
  bis: number;
  breite: number;
}

export interface Masskette {
  zeileId: string;
  wand: string;
  /** Abstand des Zeilenanfangs von der Raumecke. */
  start: number;
  laenge: number;
  positionen: Massposition[];
  /** Stimmt die Summe mit der Zeilenlänge überein? */
  geht_auf: boolean;
}

function modulName(id: string): string {
  const r = ROLLE_NAME[rolleVon(id)];
  if (r) return r;
  if (id.startsWith("PBX:")) return "Passleiste, vor Ort zugeschnitten";
  return modul(id).bezeichnung;
}

/* ----------------------------- Stückliste ----------------------------- */

export interface Listenzeile {
  pos: string;
  bezeichnung: string;
  artikel: string;
  menge: number;
  einheit: string;
  einzel: number;
  summe: number;
}

/* ----------------------------- Anschlüsse ----------------------------- */

export interface Anschlusspunkt {
  art: string;
  /** An welcher Wand und wie weit vom Zeilenanfang. */
  wand: string;
  abZeilenanfang: number;
  /** Höhe über Fertigfußboden in mm. */
  hoehe: number;
  hinweis: string;
}

/* ------------------------------ Zuschnitt ----------------------------- */

export interface Ausschnitt {
  was: string;
  /** mm ab linker Kante des Plattenstücks. */
  abKante: number;
  breite: number;
  tiefe: number;
}

export interface Plattenstueck {
  wand: string;
  laenge: number;
  tiefe: number;
  staerke: number;
  ausschnitte: Ausschnitt[];
}

export interface Zuschnitt {
  platten: Plattenstueck[];
  leisten: Array<{ wand: string; breite: number; hoehe: number }>;
  sockelLfm: number;
}

/* ------------------------------ Das Ganze ----------------------------- */

export interface Unterlagen {
  kopf: {
    erstellt: string;
    preisstand: string;
    gueltigBis: string;
    lieferant: string;
    preisstandGeraete: string;
    form: string;
    niveau: string;
  };
  raum: Array<[string, string]>;
  massketten: Masskette[];
  liste: Listenzeile[];
  summen: Array<[string, number]>;
  gesamt: number;
  anschluesse: Anschlusspunkt[];
  zuschnitt: Zuschnitt;
  pruefen: string[];
}

const NIVEAU_NAME: Record<Raumangaben["niveau"], string> = {
  einfach: "einfach",
  mittel: "mittel",
  gehoben: "gehoben",
};

/** Konventionswerte, die nicht aus dem Plan kommen. */
const KOCHFELD_AUSSCHNITT = { breite: 560, tiefe: 490 };
const SPUELE_AUSSCHNITT = { breite: 490, tiefe: 400 };
const PLATTE_TIEFE = TIEFE_UNTEN + 20;
const H_UNTEN = 450;
const H_HOCH = 1800;
const H_PLATTE = 1150;
const H_HAUBE = 2000;

export function baueUnterlagen(a: Raumangaben, typ: Kuechentyp, v: Vorschlag): Unterlagen {
  const heute = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

  /* --- Maßketten, zugleich die Quelle der Positionsnummern --- */
  const massketten: Masskette[] = [];
  let nr = 1;
  for (const z of typ.zeilen) {
    const ids = v.belegung[z.id] ?? [];
    const positionen: Massposition[] = ids.map((id, i) => {
      const l = lageIn(ids, i);
      return { nr: nr + i, modulId: id, name: modulName(id), von: l.von, bis: l.bis, breite: l.bis - l.von };
    });
    massketten.push({
      zeileId: z.id,
      wand: z.bezeichnung,
      start: z.start,
      laenge: z.laenge,
      positionen,
      geht_auf: belegungsbreite(ids) === z.laenge,
    });
    nr += ids.length;
  }

  /* --- Stückliste: gleiche Module zusammengefasst, Positionsnummern dabei --- */
  const liste: Listenzeile[] = [];
  const sammler = new Map<string, { nrn: number[]; menge: number }>();
  for (const k of massketten) {
    for (const p of k.positionen) {
      const e = sammler.get(p.modulId) ?? { nrn: [], menge: 0 };
      e.nrn.push(p.nr);
      e.menge += 1;
      sammler.set(p.modulId, e);
    }
  }
  for (const [id, e] of sammler) {
    const m = modul(id);
    liste.push({
      pos: e.nrn.join(", "),
      bezeichnung: m.bezeichnung,
      artikel: m.artikel,
      menge: e.menge,
      einheit: "Stk",
      einzel: m.preis,
      summe: m.preis * e.menge,
    });
  }

  const lfm = typ.zeilen.reduce((s, z) => s + z.laenge, 0) / 1000;
  const runden = (x: number) => Math.round(x * 100) / 100;

  if (v.haengeschraenke > 0) {
    const m = modul("HS600");
    liste.push({ pos: "—", bezeichnung: m.bezeichnung, artikel: m.artikel, menge: v.haengeschraenke, einheit: "Stk", einzel: m.preis, summe: v.kosten.haenge });
  }
  for (const [id, menge, summe] of [
    ["AP", runden(lfm), v.kosten.platte],
    ["SO", runden(lfm), v.kosten.sockel],
    ["MON", runden(lfm), v.kosten.montage],
  ] as Array<[string, number, number]>) {
    const m = modul(id);
    liste.push({ pos: "—", bezeichnung: m.bezeichnung, artikel: m.artikel, menge, einheit: m.einheit === "lfm" ? "lfm" : "Stk", einzel: m.preis, summe });
  }
  {
    const m = modul("SPA");
    liste.push({ pos: "—", bezeichnung: m.bezeichnung, artikel: m.artikel, menge: 1, einheit: "Stk", einzel: m.preis, summe: v.kosten.spuele });
  }

  for (const art of Object.keys(a.geraete) as Array<keyof Geraetewahl>) {
    const g = geraet(a.geraete[art]);
    if (g.richtpreis <= 0) continue;
    liste.push({
      pos: "—",
      bezeichnung: `${g.marke}${g.serie ? ` ${g.serie}` : ""} ${g.modell ?? g.name}`,
      artikel: g.modell ?? g.id,
      menge: 1,
      einheit: "Stk",
      einzel: g.richtpreis,
      summe: g.richtpreis,
    });
  }

  const summen: Array<[string, number]> = [
    ["Möbel, Platte, Sockel, Montage", v.kosten.moebel],
    [`Ausstattung ${NIVEAU_NAME[a.niveau]}`, v.kosten.zuschlag],
    ["Geräte", v.kosten.geraete],
  ];

  /* --- Anschlüsse --- */
  const anschluesse: Anschlusspunkt[] = [];
  const findeModul = (modulId: string) => {
    for (const k of massketten) {
      const p = k.positionen.find((x) => x.modulId === modulId);
      if (p) return { kette: k, pos: p };
    }
    return null;
  };
  const mitte = (p: Massposition) => Math.round((p.von + p.bis) / 2);

  const sp = findeModul("SP600");
  if (sp) {
    anschluesse.push({ art: "Kaltwasser und Warmwasser", wand: sp.kette.wand, abZeilenanfang: mitte(sp.pos), hoehe: H_UNTEN, hinweis: "im Spülenunterschrank, hinter dem Auszug" });
    anschluesse.push({ art: "Abwasser DN 50", wand: sp.kette.wand, abZeilenanfang: mitte(sp.pos), hoehe: 400, hinweis: "Siphon im Unterschrank" });
    anschluesse.push({ art: "Steckdose", wand: sp.kette.wand, abZeilenanfang: mitte(sp.pos), hoehe: H_UNTEN, hinweis: "für Untertischgerät oder Spülmaschine" });
  }
  const gs = findeModul("GS600");
  if (gs) {
    anschluesse.push({ art: "Wasser und Abwasser", wand: gs.kette.wand, abZeilenanfang: mitte(gs.pos), hoehe: H_UNTEN, hinweis: "kann mit der Spüle geteilt werden, wenn sie daneben steht" });
    anschluesse.push({ art: "Steckdose", wand: gs.kette.wand, abZeilenanfang: mitte(gs.pos), hoehe: H_UNTEN, hinweis: "eigener Stromkreis empfohlen" });
  }
  const kf = findeModul("KF600");
  if (kf) {
    anschluesse.push({ art: "Herdanschluss 400 V", wand: kf.kette.wand, abZeilenanfang: mitte(kf.pos), hoehe: H_UNTEN, hinweis: "Anschlussdose im Unterschrank, nicht hinter dem Gerät" });
  }
  const hb = findeModul("HB600");
  if (hb) {
    anschluesse.push({ art: "Steckdose Backofen", wand: hb.kette.wand, abZeilenanfang: mitte(hb.pos), hoehe: H_HOCH, hinweis: "im Hochschrank, über dem Gerät" });
  } else if (kf && geraet(a.geraete.backofen).richtpreis > 0) {
    anschluesse.push({ art: "Anschluss Backofen", wand: kf.kette.wand, abZeilenanfang: mitte(kf.pos), hoehe: H_UNTEN, hinweis: "Ofen sitzt unter dem Kochfeld, gemeinsamer Anschluss" });
  }
  const hk = findeModul("HK600");
  if (hk) {
    anschluesse.push({ art: "Steckdose Kühlschrank", wand: hk.kette.wand, abZeilenanfang: mitte(hk.pos), hoehe: H_HOCH, hinweis: "im Hochschrank, oben" });
  }
  if (kf && geraet(a.geraete.dunstabzug).richtpreis > 0) {
    anschluesse.push({ art: "Steckdose Dunstabzug", wand: kf.kette.wand, abZeilenanfang: mitte(kf.pos), hoehe: H_HAUBE, hinweis: "über dem Kochfeld, im Hängeschrank" });
  }
  const laengste = [...massketten].sort((x, y) => y.laenge - x.laenge)[0];
  if (laengste) {
    for (const t of [0.3, 0.7]) {
      anschluesse.push({
        art: "Steckdose über der Arbeitsplatte",
        wand: laengste.wand,
        abZeilenanfang: Math.round(laengste.laenge * t),
        hoehe: H_PLATTE,
        hinweis: "Richtwert, genaue Lage beim Aufmaß",
      });
    }
  }

  /* --- Zuschnitt --- */
  const platten: Plattenstueck[] = [];
  const leisten: Zuschnitt["leisten"] = [];
  for (const k of massketten) {
    // Die Platte läuft über alles außer Hochschränke.
    let lauf: { von: number; bis: number } | null = null;
    const stuecke: Array<{ von: number; bis: number }> = [];
    for (const p of k.positionen) {
      const r = rolleVon(p.modulId);
      if (r === "kuehlschrank" || r === "backofen") { lauf = null; continue; }
      if (lauf && lauf.bis === p.von) lauf.bis = p.bis;
      else { lauf = { von: p.von, bis: p.bis }; stuecke.push(lauf); }
      if (p.modulId.startsWith("PBX:") || modul(p.modulId).kategorie === "blende") {
        leisten.push({ wand: k.wand, breite: p.breite, hoehe: 720 });
      }
    }
    for (const st of stuecke) {
      const ausschnitte: Ausschnitt[] = [];
      for (const p of k.positionen) {
        if (p.von < st.von || p.bis > st.bis) continue;
        const m = mitte(p) - st.von;
        if (p.modulId === "KF600") {
          ausschnitte.push({ was: "Kochfeld", abKante: Math.round(m - KOCHFELD_AUSSCHNITT.breite / 2), ...KOCHFELD_AUSSCHNITT });
        }
        if (p.modulId === "SP600") {
          ausschnitte.push({ was: "Spüle", abKante: Math.round(m - SPUELE_AUSSCHNITT.breite / 2), ...SPUELE_AUSSCHNITT });
        }
      }
      platten.push({ wand: k.wand, laenge: st.bis - st.von, tiefe: PLATTE_TIEFE, staerke: PLATTE, ausschnitte });
    }
  }

  /* --- Was vor Ort geprüft werden muss --- */
  const pruefen = [
    "Wandlängen am fertigen Rohbau nachmessen — Wände sind selten rechtwinklig.",
    "Lage von Wasser, Abwasser und Elektro gegen diese Liste halten.",
    `Höhe der Arbeitsplatte: ${AP_OK} mm über Fertigfußboden. Bei anderer Wunschhöhe Sockel anpassen.`,
    `Unterkante Hängeschränke: ${OS_UK} mm, Oberkante Hoch- und Hängeschränke: ${HOCH_H} mm.`,
    "Fenstergriff prüfen: er darf beim Öffnen nicht gegen die Armatur schlagen.",
  ];
  if (!massketten.every((k) => k.geht_auf)) {
    pruefen.unshift("Achtung: mindestens eine Zeile geht rechnerisch nicht auf — vor dem Bestellen klären.");
  }

  return {
    kopf: {
      erstellt: heute,
      preisstand: PREISSTAND,
      gueltigBis: PREIS_GUELTIG_BIS,
      lieferant: LIEFERANT,
      preisstandGeraete: PREISSTAND_GERAETE,
      form: typ.bezeichnung,
      niveau: NIVEAU_NAME[a.niveau],
    },
    raum: [
      ["Raumbreite", `${a.breite} mm`],
      ["Raumtiefe", `${a.tiefe} mm`],
      ["Raumhöhe", `${typ.raum.hoehe} mm`],
      ["Küche an", typ.zeilen.map((z) => z.bezeichnung).join(", ")],
      ["Fenster", a.fenster ? `${WANDNAME[a.fenster.wand]}, ab ${a.fenster.von} mm, ${a.fenster.breite} mm breit, Brüstung 900 mm` : "keins"],
      ["Tür", `${WANDNAME[a.tuer.wand]}, ab ${a.tuer.von} mm, ${a.tuer.breite} mm breit`],
      ["Wasseranschluss", `${WANDNAME[a.wasser.wand]}, ${a.wasser.von} mm ab Ecke`],
      ["Sockelhöhe", `${SOCKEL} mm`],
    ],
    massketten,
    liste,
    summen,
    gesamt: v.kosten.gesamt,
    anschluesse,
    zuschnitt: { platten, leisten, sockelLfm: runden(lfm) },
    pruefen,
  };
}
