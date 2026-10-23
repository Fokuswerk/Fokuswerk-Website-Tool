"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STANDARD_RAUM, zeilenzahl, type Raumangaben, type Strategie, type Wunschliste } from "@/lib/planer";

/**
 * Der Weg für Privatkunden: viele kleine Schritte mit je einer Entscheidung.
 * Nicht zutreffende Schritte fallen aus der Folge heraus — wer kein Fenster
 * hat, wird nicht gefragt, wo es sitzt.
 */

export type SchrittId =
  | "start"
  | "form"
  | "wandA"
  | "wandB"
  | "tiefe"
  | "fensterJa"
  | "fensterWo"
  | "tuer"
  | "wasser"
  | "spuelmaschine"
  | "kuehl"
  | "ofen"
  | "niveau"
  | "vorschlaege"
  | "ergebnis";

export function schrittFolge(raum: Raumangaben): SchrittId[] {
  const folge: SchrittId[] = ["start", "form", "wandA"];
  if (zeilenzahl(raum.form) > 1) folge.push("wandB");
  folge.push("tiefe", "fensterJa");
  if (raum.fenster) folge.push("fensterWo");
  folge.push("tuer", "wasser", "spuelmaschine", "kuehl", "ofen", "niveau", "vorschlaege", "ergebnis");
  return folge;
}

export interface KuecheState {
  raum: Raumangaben;
  schritt: SchrittId;
  besucht: SchrittId[];
  gewaehlt: Strategie | null;

  setzeRaum: (teil: Partial<Raumangaben>) => void;
  setzeWunsch: (teil: Partial<Wunschliste>) => void;
  geheZu: (id: SchrittId) => void;
  weiter: () => void;
  zurueck: () => void;
  waehle: (s: Strategie) => void;
  neu: () => void;
}

const ANFANG = {
  raum: STANDARD_RAUM,
  schritt: "start" as SchrittId,
  besucht: ["start"] as SchrittId[],
  gewaehlt: null as Strategie | null,
};

export const useKueche = create<KuecheState>()(
  persist(
    (set) => ({
      ...ANFANG,

      setzeRaum: (teil) => set((s) => ({ raum: { ...s.raum, ...teil } })),

      setzeWunsch: (teil) =>
        set((s) => ({ raum: { ...s.raum, wuensche: { ...s.raum.wuensche, ...teil } } })),

      geheZu: (id) =>
        set((s) => ({ schritt: id, besucht: s.besucht.includes(id) ? s.besucht : [...s.besucht, id] })),

      weiter: () =>
        set((s) => {
          const folge = schrittFolge(s.raum);
          const i = folge.indexOf(s.schritt);
          const naechster = folge[Math.min(folge.length - 1, i + 1)];
          return {
            schritt: naechster,
            besucht: s.besucht.includes(naechster) ? s.besucht : [...s.besucht, naechster],
          };
        }),

      zurueck: () =>
        set((s) => {
          const folge = schrittFolge(s.raum);
          const i = folge.indexOf(s.schritt);
          return { schritt: folge[Math.max(0, i - 1)] };
        }),

      waehle: (g) => set({ gewaehlt: g }),

      neu: () =>
        set({
          ...ANFANG,
          raum: { ...STANDARD_RAUM, wuensche: { ...STANDARD_RAUM.wuensche } },
          besucht: ["start"],
        }),
    }),
    { name: "serienkueche-einzel-v2" },
  ),
);
