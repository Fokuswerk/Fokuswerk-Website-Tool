import { platzierung } from "@/lib/berechnung";
import type { VarianteRoh } from "@/data/varianten";
import type { Anschluss, Kuechentyp, Pruefpunkt } from "@/lib/typen";

/**
 * Aus der gewählten Variante abgeleitete Angaben: Anschlusspositionen und
 * Freigabestand. Beides wird gerechnet, nicht hinterlegt — ändert sich die
 * Variante, ändern sich die Anschlüsse mit.
 */

const AP_OK = 910;

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
  const schritt = Math.round(hauptzeile.laenge / 4);
  for (let i = 1; i <= 3; i++) {
    const x = schritt * i;
    const imSpuelbereich = sp && sp.zeileId === hauptzeile.id && x > sp.von - 200 && x < sp.bis + 200;
    if (imSpuelbereich) continue;
    liste.push({
      id: `A-SD${i}`, art: "steckdose", bezeichnung: `Steckdose Arbeitsplatte ${i}`, x, hoehe: AP_OK + 240,
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
