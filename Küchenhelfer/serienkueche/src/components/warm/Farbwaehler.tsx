"use client";

import { useEffect, useState } from "react";

/**
 * Der Farbwähler — ein Werkzeug, keine Funktion der Seite.
 *
 * Fünf Farbwelten zum Durchklicken an der echten Seite, weil ein Farbblatt
 * lügt: dieselben Töne wirken in realistischen Flächenanteilen völlig anders
 * als nebeneinander in Streifen. Erscheint nur mit ?farben=1 in der Adresse
 * und merkt sich die Wahl, damit sie beim Weiterklicken in den Planer bleibt.
 *
 * Sobald eine Welt gewählt ist, kommt das hier wieder raus und ihre Werte
 * wandern fest nach :root.
 */

const WELTEN: Array<{ id: string; titel: string; satz: string; punkt: string }> = [
  { id: "oliv", titel: "Oliv", satz: "warmes Grün, Messing", punkt: "#313b1a" },
  { id: "lehm", titel: "Lehm", satz: "Terrakotta, Salbei", punkt: "#5c220d" },
  { id: "tinte", titel: "Tinte", satz: "Tiefblau, Messing", punkt: "#1d365d" },
  { id: "kohle", titel: "Kohle", satz: "ohne Farbe, nur Messing", punkt: "#383731" },
  { id: "rost", titel: "Rost", satz: "gebranntes Orange, Petrol", punkt: "#611e00" },
];

export function Farbwaehler() {
  const [zeigen, setzeZeigen] = useState(false);
  const [welt, setzeWelt] = useState("oliv");

  useEffect(() => {
    const an = new URLSearchParams(window.location.search).has("farben")
      || localStorage.getItem("farbwaehler") === "an";
    if (!an) return;
    localStorage.setItem("farbwaehler", "an");
    setzeZeigen(true);
    const gemerkt = localStorage.getItem("farbwelt") ?? "oliv";
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
