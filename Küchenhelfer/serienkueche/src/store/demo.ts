"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STANDARDWAHL } from "@/data/varianten";
import { GEWICHTUNG_STANDARD, type Gewichtung } from "@/lib/berechnung";
import type { Dokument, SpezifikationSnapshot } from "@/lib/typen";

/**
 * Zentraler Demo-Zustand. Jede Ansicht liest und schreibt hier, damit die
 * Zahlen über die ganze Anwendung zusammenpassen. Persistenz im LocalStorage,
 * damit ein Neuladen den Stand nicht verwirft.
 */

export interface DemoState {
  auswahl: Record<string, string>;
  /** Nutzerbestätigungen je Typ und Prüfpunkt, überschreiben den Ausgangsstand. */
  freigaben: Record<string, Record<string, boolean>>;
  gewichtung: Gewichtung;
  /** Ist-Maße je Wohnung und Messpunkt. */
  aufmass: Record<string, Record<string, number | null>>;
  /** Festgeschriebene Spezifikationen, unveränderlich. */
  snapshots: SpezifikationSnapshot[];
  /** Zusätzlich hochgeladene Demo-Unterlagen. */
  eigeneDokumente: Dokument[];
  /** Zuletzt simulierte Generierungsläufe, damit Ergebnisse erhalten bleiben. */
  generiert: string[];

  waehle: (typId: string, variantId: string) => void;
  setzeFreigabe: (typId: string, pruefpunktId: string, wert: boolean) => void;
  setzeGewichtung: (g: Partial<Gewichtung>) => void;
  setzeAufmass: (wohnung: string, messpunkt: string, wert: number | null) => void;
  schreibeFest: (s: SpezifikationSnapshot) => void;
  fuegeDokumentHinzu: (d: Dokument) => void;
  merkeGeneriert: (typId: string) => void;
  zuruecksetzen: () => void;
}

const ANFANG = {
  auswahl: { ...STANDARDWAHL },
  freigaben: {} as Record<string, Record<string, boolean>>,
  gewichtung: { ...GEWICHTUNG_STANDARD },
  aufmass: {} as Record<string, Record<string, number | null>>,
  snapshots: [] as SpezifikationSnapshot[],
  eigeneDokumente: [] as Dokument[],
  generiert: [] as string[],
};

export const useDemo = create<DemoState>()(
  persist(
    (set) => ({
      ...ANFANG,

      waehle: (typId, variantId) =>
        set((s) => ({ auswahl: { ...s.auswahl, [typId]: variantId } })),

      setzeFreigabe: (typId, pruefpunktId, wert) =>
        set((s) => ({
          freigaben: {
            ...s.freigaben,
            [typId]: { ...(s.freigaben[typId] ?? {}), [pruefpunktId]: wert },
          },
        })),

      setzeGewichtung: (g) =>
        set((s) => ({ gewichtung: { ...s.gewichtung, ...g } })),

      setzeAufmass: (wohnung, messpunkt, wert) =>
        set((s) => ({
          aufmass: {
            ...s.aufmass,
            [wohnung]: { ...(s.aufmass[wohnung] ?? {}), [messpunkt]: wert },
          },
        })),

      schreibeFest: (snapshot) =>
        set((s) => ({ snapshots: [snapshot, ...s.snapshots] })),

      fuegeDokumentHinzu: (d) =>
        set((s) => ({ eigeneDokumente: [d, ...s.eigeneDokumente] })),

      merkeGeneriert: (typId) =>
        set((s) => (s.generiert.includes(typId) ? s : { generiert: [...s.generiert, typId] })),

      zuruecksetzen: () => set({ ...ANFANG, auswahl: { ...STANDARDWAHL }, gewichtung: { ...GEWICHTUNG_STANDARD } }),
    }),
    { name: "serienkueche-demo-v1" },
  ),
);
