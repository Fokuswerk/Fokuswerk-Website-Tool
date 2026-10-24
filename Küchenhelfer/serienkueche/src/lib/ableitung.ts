import { modul } from "@/data/module";
import { platzierung } from "@/lib/berechnung";
import { austauschbar, istStauraum } from "@/lib/planer";
import type { VarianteRoh } from "@/data/varianten";
import type { Anschluss, Kuechentyp, Pruefpunkt } from "@/lib/typen";
import { arbeitshoeheVon } from "@/lib/masse";

/**
 * Aus der gewählten Variante abgeleitete Angaben: Anschlusspositionen und
 * Freigabestand. Beides wird gerechnet, nicht hinterlegt — ändert sich die
 * Variante, ändern sich die Anschlüsse mit.
 */

// Arbeitshoehe kommt aus masse.ts, nicht aus einer zweiten Kopie — und bei
// einem abgesenkten Typ aus seinen eigenen Attributen.

function suche(v: VarianteRoh, typ: Kuechentyp, modulId: string) {
  for (const z of typ.zeilen) {
    const p = platzierung(v, z.id).find((x) => x.modulId === modulId);
    if (p) return { zeileId: z.id, mitte: Math.round((p.von + p.bis) / 2), von: p.von, bis: p.bis };
  }
  return null;
}

export function anschluesse(v: VarianteRoh, typ: Kuechentyp): Anschluss[] {
  const liste: Anschluss[] = [];
  const abluftOffen = typ.pruefpunkte.some(
    (p) => p.freigabe === "offen" && /abluft|schacht/i.test(p.titel + p.beschreibung),
  );

  const sp = suche(v, typ, "SP600");
  if (sp) {
    liste.push(
      { id: "A-KW", art: "kaltwasser", bezeichnung: "Kaltwasser", x: sp.mitte - 60, hoehe: 550, zeileId: sp.zeileId, ausfuehrung: "Eckventil, Unterputz", freigabe: "bestaetigt" },
      { id: "A-WW", art: "warmwasser", bezeichnung: "Warmwasser", x: sp.mitte + 60, hoehe: 550, zeileId: sp.zeileId, ausfuehrung: "Eckventil, Unterputz", freigabe: "bestaetigt" },
      { id: "A-AW", art: "abwasser", bezeichnung: "Abwasser", x: sp.mitte + 30, hoehe: 450, zeileId: sp.zeileId, ausfuehrung: "DN 50, Gefälle zum Fallstrang", freigabe: "bestaetigt" },
    );
  }

  const kf = suche(v, typ, "KF600");
  if (kf) {
    liste.push(
      { id: "A-HERD", art: "herd", bezeichnung: "Kochfeld", x: kf.mitte, hoehe: 350, zeileId: kf.zeileId, ausfuehrung: "400 V, 5 × 2,5 mm², eigener Stromkreis", freigabe: "bestaetigt" },
      { id: "A-DA", art: "dunstabzug", bezeichnung: "Dunstesse", x: kf.mitte, hoehe: 2100, zeileId: kf.zeileId, ausfuehrung: abluftOffen ? "Abluft DN 150 oder Umluft, abhängig vom Schachtnachweis" : "Schuko, Abluft DN 150 zum Schacht", freigabe: abluftOffen ? "offen" : "bestaetigt", hinweis: abluftOffen ? "Hängt an der offenen Prüfung zur Schachtnutzung." : undefined },
    );
  }

  const gs = suche(v, typ, "GS600");
  if (gs) {
    liste.push({
      id: "A-GS", art: "geschirrspueler", bezeichnung: "Geschirrspüler", x: gs.mitte, hoehe: 550, zeileId: gs.zeileId,
      ausfuehrung: "Kaltwasser, Abwasser, Schuko auf eigenem Kreis", freigabe: "bestaetigt",
    });
  }

  const hk = suche(v, typ, "HK600");
  if (hk) {
    liste.push({
      id: "A-KS", art: "kuehlschrank", bezeichnung: "Kühlschrank", x: hk.mitte, hoehe: 1800, zeileId: hk.zeileId,
      ausfuehrung: "Schuko, oberhalb des Gerätekorpus", freigabe: "bestaetigt",
    });
  }

  // Arbeitsplattensteckdosen: gleichmäßig verteilt, ausserhalb des Spülbereichs
  const hauptzeile = typ.zeilen[0];
  const apOk = arbeitshoeheVon(typ);
  const schritt = Math.round(hauptzeile.laenge / 4);
  for (let i = 1; i <= 3; i++) {
    const x = schritt * i;
    const imSpuelbereich = sp && sp.zeileId === hauptzeile.id && x > sp.von - 200 && x < sp.bis + 200;
    if (imSpuelbereich) continue;
    liste.push({
      id: `A-SD${i}`, art: "steckdose", bezeichnung: `Steckdose Arbeitsplatte ${i}`, x, hoehe: apOk + 240,
      zeileId: hauptzeile.id, ausfuehrung: "Schuko, ausserhalb des Schutzbereichs der Spüle", freigabe: "bestaetigt",
    });
  }

  return liste.sort((a, b) => a.x - b.x);
}

/** Prüfpunkte mit den Bestätigungen des Nutzers überlagert. */
export function pruefpunkte(
  typ: Kuechentyp,
  freigaben: Record<string, Record<string, boolean>>,
): Pruefpunkt[] {
  const eigene = freigaben[typ.id] ?? {};
  return typ.pruefpunkte.map((p) =>
    p.id in eigene ? { ...p, freigabe: eigene[p.id] ? "bestaetigt" : "offen" } : p,
  );
}

export function istFreigegeben(
  typ: Kuechentyp,
  freigaben: Record<string, Record<string, boolean>>,
): boolean {
  return pruefpunkte(typ, freigaben)
    .filter((p) => p.blockierend)
    .every((p) => p.freigabe === "bestaetigt");
}

/**
 * Attribute und Zwangspunkte mit den Bestätigungen des Nutzers überlagert.
 *
 * Vorher stand nach dem Bestätigen auf einem Bildschirm beides: oben "Alle
 * Pflichtattribute sind bestätigt. Die Planung ist freigegeben", daneben
 * dieselben Attribute weiter rot als "geschätzt" und "gerechnet". Zwei
 * Aussagen, die sich widersprechen — und der Nutzer hat keine Möglichkeit
 * herauszufinden, welche gilt.
 *
 * Die Prüfpunkte sind genau die Fragen zu diesen Werten. Sind alle beantwortet,
 * sind die Werte bestätigt. Bleibt einer offen — auch ein nicht blockierender,
 * etwa "Gangbreite gegen die Örtlichkeit bestätigen" — bleiben sie offen.
 */
export function alleBestaetigt(
  typ: Kuechentyp,
  freigaben: Record<string, Record<string, boolean>>,
): boolean {
  return offeneFreigaben(typ, freigaben).length === 0;
}

export function attributeMitFreigabe(
  typ: Kuechentyp,
  freigaben: Record<string, Record<string, boolean>>,
): Kuechentyp["attribute"] {
  if (!alleBestaetigt(typ, freigaben)) return typ.attribute;
  const aus: Kuechentyp["attribute"] = {};
  for (const [k, a] of Object.entries(typ.attribute)) {
    /* Der Hinweis ist laut seiner eigenen Beschreibung der Grund, warum ein
       Wert geprüft werden muss, "falls offen". Nach der Bestätigung daneben
       weiter "gegen die Örtlichkeit zu bestätigen" zu lesen, ist genau der
       Widerspruch, den wir hier abstellen — die Quelle bleibt stehen. */
    aus[k] =
      a.freigabe === "offen" ? { ...a, freigabe: "bestaetigt", hinweis: undefined } : a;
  }
  return aus;
}

export function zwangspunkteMitFreigabe(
  typ: Kuechentyp,
  freigaben: Record<string, Record<string, boolean>>,
): Kuechentyp["zwangspunkte"] {
  if (!alleBestaetigt(typ, freigaben)) return typ.zwangspunkte;
  return typ.zwangspunkte.map((z) => (z.freigabe === "offen" ? { ...z, freigabe: "bestaetigt" } : z));
}

export function offeneFreigaben(
  typ: Kuechentyp,
  freigaben: Record<string, Record<string, boolean>>,
): Pruefpunkt[] {
  return pruefpunkte(typ, freigaben).filter((p) => p.freigabe === "offen");
}

/** Abweichung zwischen Plan- und Aufmaß, in mm. */
export function abweichung(plan: number, ist: number | null): number | null {
  if (ist === null || Number.isNaN(ist)) return null;
  return ist - plan;
}

export type AufmassLage = "offen" | "laeuft" | "abweichung" | "bestaetigt";

export function aufmassLage(
  messpunkte: Array<{ id: string; planmass: number }>,
  werte: Record<string, number | null> | undefined,
): AufmassLage {
  if (!werte) return "offen";
  const eingetragen = messpunkte.filter((m) => typeof werte[m.id] === "number");
  if (eingetragen.length === 0) return "offen";
  if (eingetragen.length < messpunkte.length) return "laeuft";
  const grosseAbweichung = eingetragen.some((m) => {
    const d = abweichung(m.planmass, werte[m.id] ?? null);
    return d !== null && Math.abs(d) > 15;
  });
  return grosseAbweichung ? "abweichung" : "bestaetigt";
}

/* ---------------------------------------------------------------- */
/**
 * Fertigungsmaße aus dem Aufmaß.
 *
 * Vorher stand in der Spalte "nach Aufmaß" für die Arbeitsplatte einfach die
 * gemessene Nischenlänge — als liefe die Platte über die Hochschränke hinweg.
 * Daneben stand als Planwert die Nennlänge des Typs, während das Istmaß von
 * der Einheit kam: zwei Zahlen aus zwei Quellen, als wären sie vergleichbar.
 * Von den fünf Messpunkten wirkte nur einer überhaupt.
 *
 * Hier gilt eine Kette: gemessene Nische minus Wandversatz ist das nutzbare
 * Maß. Davon gehen die festen Korpusbreiten ab, der Rest ist die Passblende.
 * Die Platte läuft über alles außer den Hochschränken.
 */

/**
 * In welchem Bereich eine Passblende noch eine Passblende ist.
 *
 * Unten begrenzt es die Befestigung: unter 20 mm ist kein Streifen mehr zu
 * verschrauben. Oben begrenzt es die Steifigkeit: eine 720 mm hohe Blende
 * ohne Korpus dahinter steht ab etwa 200 mm Breite nicht mehr ruhig, und ein
 * 300er Unterschrank ist dann ohnehin billiger und bringt Stauraum mit. Beide
 * Grenzen sind Erfahrungswerte des Prototyps, keine Norm — sie stehen hier an
 * einer Stelle, damit sie der Lieferantenadapter überschreiben kann.
 */
export const BLENDE_MIN = 20;
export const BLENDE_MAX = 200;

export interface Fertigungszeile {
  bezeichnung: string;
  plan: number;
  ist: number;
  /** Was dieses Maß für die Fertigung bedeutet. */
  folge: string;
  kritisch?: boolean;
}

export interface Fertigung {
  zeilen: Fertigungszeile[];
  /** Liegt die Passblende außerhalb ihres Bereichs: was dann zu tun ist. */
  weg: { titel: string; text: string } | null;
  /** Sind alle Maße eingetragen, die in die Kette eingehen? */
  vollstaendig: boolean;
}

export function fertigungsmasse(
  typ: Kuechentyp,
  v: VarianteRoh,
  werte: Record<string, number | null> | undefined,
  messpunkte: Array<{ id: string; bezeichnung: string; planmass: number }>,
): Fertigung | null {
  const w = werte ?? {};
  const mp = (id: string) => messpunkte.find((m) => m.id === id);
  const m1 = mp("M1");
  if (!m1) return null;
  const istM1 = typeof w.M1 === "number" ? w.M1 : null;
  if (istM1 === null) return null;

  const versatzPlan = mp("M4")?.planmass ?? 0;
  const versatzIst = typeof w.M4 === "number" ? w.M4 : versatzPlan;

  const plaetze = platzierung(v, typ.zeilen[0].id);
  const istBlende = (id: string) => modul(id).kategorie === "blende";
  const istHochschrank = (id: string) => modul(id).kategorie === "hochschrank";
  const korpusse = plaetze.filter((p) => !istBlende(p.modulId)).reduce((s, p) => s + p.breite, 0);
  const hoch = plaetze.filter((p) => istHochschrank(p.modulId)).reduce((s, p) => s + p.breite, 0);
  const blendePlan = plaetze.filter((p) => istBlende(p.modulId)).reduce((s, p) => s + p.breite, 0);

  const nutzbarPlan = m1.planmass - versatzPlan;
  const nutzbarIst = istM1 - versatzIst;
  const blendeIst = nutzbarIst - korpusse;

  const zeilen: Fertigungszeile[] = [
    {
      bezeichnung: "Nischenlänge Hauptzeile",
      plan: m1.planmass,
      ist: istM1,
      folge: "Gemessen an der fertigen Wand. Grundlage aller folgenden Maße.",
    },
    {
      bezeichnung: "Wandversatz linke Ecke",
      plan: versatzPlan,
      ist: versatzIst,
      folge:
        versatzIst > 0
          ? "Geht von der nutzbaren Länge ab — die Korpusse können nicht in den Versatz hinein."
          : "Kein Versatz gemessen.",
    },
    {
      bezeichnung: "Nutzbare Länge",
      plan: nutzbarPlan,
      ist: nutzbarIst,
      folge: "Nischenlänge abzüglich Wandversatz.",
    },
    {
      bezeichnung: "Korpusse, Summe",
      plan: korpusse,
      ist: korpusse,
      folge: "Feste Industriemaße. Ändern sich nur, wenn Module getauscht werden.",
    },
    {
      bezeichnung: "Passblende, Zuschnitt",
      plan: blendePlan,
      ist: blendeIst,
      folge:
        blendeIst >= BLENDE_MIN && blendeIst <= BLENDE_MAX
          ? `Auf ${blendeIst} mm zugeschnitten, vor Ort. Modulauswahl unverändert.`
          : blendeIst < BLENDE_MIN
            ? "Zu schmal zum Befestigen — die Modulauswahl muss schmaler werden."
            : `Breiter als ${BLENDE_MAX} mm — die Modulauswahl muss breiter werden.`,
      kritisch: blendeIst < BLENDE_MIN || blendeIst > BLENDE_MAX,
    },
    {
      bezeichnung: "Arbeitsplatte, Zuschnitt",
      plan: nutzbarPlan - hoch,
      ist: nutzbarIst - hoch,
      folge: hoch > 0
        ? `Nutzbare Länge abzüglich ${hoch} mm Hochschrank — darüber liegt keine Platte.`
        : "Über die ganze Zeile, kein Hochschrank im Weg.",
    },
  ];

  /* Der Weg aus einer Abweichung: welcher Modultausch die Passblende
     zurück in ihren Bereich bringt. Nur zu melden, dass es nicht passt,
     ist genau die Stelle, an der ein Werkzeug den Nutzer stehen lässt. */
  let weg: Fertigung["weg"] = null;
  if (blendeIst < BLENDE_MIN || blendeIst > BLENDE_MAX) {
    /* Welcher Tausch aus dem Katalog bringt die Blende zurück in ihren
       Bereich? Vorher wurden zwei Stufen geraten (150 und 300 mm) und gegen
       die erste halbwegs passende Stelle gehalten — bei 166 mm Blende kam
       deshalb "mit einem Modultausch nicht zu lösen" heraus, obwohl ein
       einziger Schrank es löst. Jetzt wird wirklich gesucht. */
    const moeglich: Array<{ platz: typeof plaetze[number]; neueId: string; blende: number }> = [];
    for (const p of plaetze) {
      if (!istStauraum(p.modulId)) continue;
      for (const neueId of austauschbar(p.modulId)) {
        const neueBreite = modul(neueId).breite ?? 0;
        const blende = blendeIst + (p.breite - neueBreite);
        if (blende >= BLENDE_MIN && blende <= BLENDE_MAX) moeglich.push({ platz: p, neueId, blende });
      }
    }
    // Der kleinste Eingriff zuerst: wenig Breitenänderung, wenig Verschiebung.
    moeglich.sort(
      (x, y) =>
        Math.abs(x.platz.breite - (modul(x.neueId).breite ?? 0)) -
          Math.abs(y.platz.breite - (modul(y.neueId).breite ?? 0)) ||
        y.platz.von - x.platz.von,
    );
    const b = moeglich[0];
    if (b) {
      const neueBreite = modul(b.neueId).breite ?? 0;
      const sprung = Math.abs(b.platz.breite - neueBreite);
      const danach = plaetze.filter((p) => p.von > b.platz.von).length;
      weg = {
        titel: `So passt es: ein Modul ${neueBreite < b.platz.breite ? "schmaler" : "breiter"}`,
        text:
          `Position ${b.platz.index + 1} der Hauptzeile — ${modul(b.platz.modulId).bezeichnung}, ` +
          `${b.platz.breite} mm — wird zu ${modul(b.neueId).bezeichnung} mit ${neueBreite} mm. ` +
          `Die Passblende kommt damit auf ${b.blende} mm und liegt wieder im Bereich ` +
          `${BLENDE_MIN}–${BLENDE_MAX} mm. ` +
          (danach === 0
            ? "Rechts davon steht nichts, Anschlüsse verschieben sich nicht."
            : danach === 1
              ? `Das Modul rechts davon verschiebt sich um ${sprung} mm, seine Anschlüsse mit ihm.`
              : `Die ${danach} Module rechts davon verschieben sich um ${sprung} mm, die Anschlusspositionen mit ihnen.`),
      };
    } else {
      weg = {
        titel: "Mit einem Modultausch allein ist es nicht zu lösen",
        text:
          `Die Passblende käme auf ${blendeIst} mm. Kein einzelner Tausch aus dem Katalog bringt sie ` +
          `zwischen ${BLENDE_MIN} und ${BLENDE_MAX} mm — hier muss die Zeile neu belegt werden, ` +
          `notfalls mit einer Sonderbreite beim Lieferanten.`,
      };
    }
  }

  const gebraucht = ["M1", "M4"].filter((id) => mp(id));
  return {
    zeilen,
    weg,
    vollstaendig: gebraucht.every((id) => typeof w[id] === "number"),
  };
}
