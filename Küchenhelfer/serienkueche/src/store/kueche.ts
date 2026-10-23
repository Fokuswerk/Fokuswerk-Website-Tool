"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { bereinigeGeraete, STANDARD_GERAETE, type GeraeteArt, type Geraetewahl } from "@/data/geraete";
import { angleichen, kuechenwaende, STANDARD_RAUM, type Raumangaben, type Strategie, type WandId } from "@/lib/planer";

/**
 * Der Weg für Privatkunden: viele kleine Schritte mit je einer Entscheidung.
 * Die Folge wird aus den Angaben berechnet — wer über Eck plant, wird nach
 * der Seite gefragt, wer kein Fenster hat, nicht nach dessen Platz.
 */

export type SchrittId =
  | "start" | "quelle" | "upload" | "pruefen" | "form" | "drehung"
  | "breite" | "tiefe"
  | `zeile-${WandId}`
  | "fensterJa" | "fenster"
  | "tuer" | "wasser"
  | `geraet-${GeraeteArt}`
  | "niveau" | "vorschlaege" | "ergebnis";

export function schrittFolge(raum: Raumangaben, quelle: Quelle): SchrittId[] {
  const f: SchrittId[] = ["start", "quelle"];
  if (quelle === "plan") {
    f.push("upload", "pruefen");
  } else {
    f.push("form");
    if (raum.form !== "eine-wand") f.push("drehung");
    f.push("breite", "tiefe");
    for (const w of kuechenwaende(raum)) f.push(`zeile-${w}` as SchrittId);
    f.push("fensterJa");
    if (raum.fenster) f.push("fenster");
    f.push("tuer", "wasser");
  }
  f.push(
    "geraet-kuehlschrank", "geraet-kochfeld", "geraet-backofen",
    "geraet-spuelmaschine", "geraet-dunstabzug",
    "niveau", "vorschlaege", "ergebnis",
  );
  return f;
}

export type Quelle = "fragen" | "plan";

export interface KuecheState {
  raum: Raumangaben;
  quelle: Quelle;
  /** Ist der simulierte Erkennungslauf schon gelaufen. */
  erkannt: boolean;
  schritt: SchrittId;
  gewaehlt: Strategie | null;
  /** Vom Nutzer von Hand umgestellte Belegung, je Vorschlag. */
  eigeneBelegung: Record<string, Record<string, string[]>>;

  setzeQuelle: (q: Quelle) => void;
  uebernehmeErkennung: () => void;
  setzeRaum: (teil: Partial<Raumangaben>) => void;
  setzeGeraet: (art: GeraeteArt, id: string) => void;
  setzeNutz: (wand: WandId, mm: number) => void;
  geheZu: (id: SchrittId) => void;
  weiter: () => void;
  zurueck: () => void;
  waehle: (s: Strategie) => void;
  setzeBelegung: (schluessel: string, belegung: Record<string, string[]>) => void;
  neu: () => void;
}

/** Was der simulierte Erkennungslauf aus einem Plan liest. */
export const ERKANNT: Raumangaben = {
  ...STANDARD_RAUM,
  breite: 3620,
  tiefe: 2740,
  nutz: { haupt: 3620, links: 2740, rechts: 2740, gegenueber: 3620 },
  fenster: { wand: "haupt", von: 1850, breite: 1180 },
  tuer: { wand: "gegenueber", von: 420, breite: 885 },
  wasser: { wand: "haupt", von: 2890 },
};

const ANFANG = {
  raum: STANDARD_RAUM,
  quelle: "fragen" as Quelle,
  erkannt: false,
  schritt: "start" as SchrittId,
  gewaehlt: null as Strategie | null,
  eigeneBelegung: {} as Record<string, Record<string, string[]>>,
};

export const useKueche = create<KuecheState>()(
  persist(
    (set) => ({
      ...ANFANG,

      setzeRaum: (teil) =>
        set((s) => ({ raum: angleichen({ ...s.raum, ...teil }), eigeneBelegung: {} })),

      setzeGeraet: (art, id) =>
        set((s) => ({
          raum: { ...s.raum, geraete: { ...s.raum.geraete, [art]: id } as Geraetewahl },
          eigeneBelegung: {},
        })),

      setzeNutz: (wand, mm) =>
        set((s) => ({
          raum: angleichen({ ...s.raum, nutz: { ...s.raum.nutz, [wand]: mm } }),
          eigeneBelegung: {},
        })),

      setzeQuelle: (q) => set({ quelle: q }),

      uebernehmeErkennung: () =>
        set({ raum: angleichen({ ...ERKANNT, geraete: { ...STANDARD_GERAETE } }), erkannt: true, eigeneBelegung: {} }),

      geheZu: (id) => set({ schritt: id }),

      weiter: () =>
        set((s) => {
          const f = schrittFolge(s.raum, s.quelle);
          return { schritt: f[Math.min(f.length - 1, f.indexOf(s.schritt) + 1)] };
        }),

      zurueck: () =>
        set((s) => {
          const f = schrittFolge(s.raum, s.quelle);
          return { schritt: f[Math.max(0, f.indexOf(s.schritt) - 1)] };
        }),

      waehle: (g) => set({ gewaehlt: g }),

      setzeBelegung: (schluessel, belegung) =>
        set((s) => ({ eigeneBelegung: { ...s.eigeneBelegung, [schluessel]: belegung } })),

      neu: () =>
        set({
          ...ANFANG,
          raum: { ...STANDARD_RAUM, nutz: { ...STANDARD_RAUM.nutz }, geraete: { ...STANDARD_GERAETE } },
          eigeneBelegung: {},
        }),
    }),
    {
      name: "serienkueche-einzel-v6",
      // Ein Plan aus einer älteren Sitzung kann Geräte nennen, die es nicht
      // mehr gibt. Beim Laden einmal geradeziehen, statt daran zu scheitern.
      merge: (gespeichert, jetzt) => {
        const alt = gespeichert as Partial<KuecheState> | undefined;
        if (!alt?.raum) return { ...jetzt, ...alt } as KuecheState;
        return {
          ...jetzt,
          ...alt,
          raum: angleichen({ ...STANDARD_RAUM, ...alt.raum, geraete: bereinigeGeraete(alt.raum.geraete) }),
        } as KuecheState;
      },
    },
  ),
);
