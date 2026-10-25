"use client";

import { useEffect, useState } from "react";

/**
 * Der Farbwähler — ein Werkzeug, keine Funktion der Seite.
 *
 * Fünf Farbwelten zum Durchklicken an der echten Seite, weil ein Farbblatt
 * lügt — und alle fünf sind diesmal an den FOTOS verankert: nachgemessen
 * liegen fünf der sechs Bilder bei 55 bis 106 Grad Farbton, das Hero-Foto bei
 * 71. Jeder frühere Grundton lag 53 bis 194 Grad davon weg. Deshalb: dieselben Töne wirken in realistischen Flächenanteilen völlig anders
 * als nebeneinander in Streifen. Erscheint nur mit ?farben=1 in der Adresse
 * und merkt sich die Wahl, damit sie beim Weiterklicken in den Planer bleibt.
 *
 * Sobald eine Welt gewählt ist, kommt das hier wieder raus und ihre Werte
 * wandern fest nach :root.
 */

const WELTEN: Array<{ id: string; titel: string; satz: string; punkt: string }> = [
  { id: "asche", titel: "Asche", satz: "warmes Fast-Schwarz, Messing", punkt: "#3c362e" },
  { id: "bronze", titel: "Bronze", satz: "tiefe Bronze, Messing", punkt: "#453319" },
  { id: "terra", titel: "Terrakotta", satz: "gebrannter Ton, Salbei", punkt: "#601f00" },
  { id: "ocker", titel: "Ocker", satz: "dunkles Gold, Petrol", punkt: "#483300" },
  { id: "tabak", titel: "Tabak", satz: "Leder und Tabak, Messing", punkt: "#522c09" },
];

export function Farbwaehler() {
  const [zeigen, setzeZeigen] = useState(false);
  const [welt, setzeWelt] = useState("asche");

  useEffect(() => {
    const an = new URLSearchParams(window.location.search).has("farben")
      || localStorage.getItem("farbwaehler") === "an";
    if (!an) return;
    localStorage.setItem("farbwaehler", "an");
    setzeZeigen(true);
    const gemerkt = localStorage.getItem("farbwelt") ?? "asche";
    setzeWelt(gemerkt);
    document.documentElement.dataset.farbwelt = gemerkt;
  }, []);

  function waehle(id: string) {
    setzeWelt(id);
    localStorage.setItem("farbwelt", id);
    document.documentElement.dataset.farbwelt = id;
  }

  if (!zeigen) return null;

  return (
    <div className="nicht-drucken fixed inset-x-0 bottom-0 z-[90] border-t border-black/15 bg-white/92 px-3 py-2 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-2 gap-y-2">
        <span className="mr-1 hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45 sm:inline">
          Farbwelt
        </span>
        {WELTEN.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => waehle(w.id)}
            className={`flex items-center gap-2 rounded-[3px] border px-2.5 py-1.5 text-left transition-colors ${
              welt === w.id ? "border-black bg-black text-white" : "border-black/20 bg-white text-black hover:border-black/50"
            }`}
          >
            <span
              aria-hidden="true"
              className="block h-5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/15"
              style={{ background: w.punkt }}
            />
            <span className="leading-tight">
              <span className="block text-[13px] font-bold">{w.titel}</span>
              <span className={`block text-[11px] ${welt === w.id ? "text-white/70" : "text-black/50"}`}>{w.satz}</span>
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("farbwaehler");
            localStorage.removeItem("farbwelt");
            delete document.documentElement.dataset.farbwelt;
            setzeZeigen(false);
          }}
          className="ml-auto text-[12px] text-black/45 underline underline-offset-2 hover:text-black"
        >
          ausblenden
        </button>
      </div>
    </div>
  );
}
