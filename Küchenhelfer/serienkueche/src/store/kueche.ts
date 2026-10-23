"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STANDARD_RAUM, type Raumangaben, type Strategie, type Wunschliste } from "@/lib/planer";

/** Zustand der Schritt-für-Schritt-Strecke für eine einzelne Küche. */
export interface KuecheState {
  raum: Raumangaben;
  schritt: number;
  /** Bis wohin der Nutzer schon war, damit er zurückspringen kann. */
  maxSchritt: number;
  gewaehlt: Strategie | null;

  setzeRaum: (teil: Partial<Raumangaben>) => void;
  setzeWunsch: (teil: Partial<Wunschliste>) => void;
  geheZu: (n: number) => void;
  weiter: () => void;
  zurueck: () => void;
  waehle: (s: Strategie) => void;
  neu: () => void;
}

const ANFANG = {
  raum: STANDARD_RAUM,
  schritt: 0,
  maxSchritt: 0,
  gewaehlt: null as Strategie | null,
};

export const LETZTER_SCHRITT = 5;

export const useKueche = create<KuecheState>()(
  persist(
    (set) => ({
      ...ANFANG,

      setzeRaum: (teil) => set((s) => ({ raum: { ...s.raum, ...teil } })),

      setzeWunsch: (teil) =>
        set((s) => ({ raum: { ...s.raum, wuensche: { ...s.raum.wuensche, ...teil } } })),

      geheZu: (n) =>
        set((s) => ({
          schritt: Math.max(0, Math.min(LETZTER_SCHRITT, n)),
          maxSchritt: Math.max(s.maxSchritt, Math.min(LETZTER_SCHRITT, n)),
        })),

      weiter: () =>
        set((s) => {
          const n = Math.min(LETZTER_SCHRITT, s.schritt + 1);
          return { schritt: n, maxSchritt: Math.max(s.maxSchritt, n) };
        }),

      zurueck: () => set((s) => ({ schritt: Math.max(0, s.schritt - 1) })),

      waehle: (g) => set({ gewaehlt: g }),

      neu: () => set({ ...ANFANG, raum: { ...STANDARD_RAUM, wuensche: { ...STANDARD_RAUM.wuensche } } }),
    }),
    { name: "serienkueche-einzel-v1" },
  ),
);
