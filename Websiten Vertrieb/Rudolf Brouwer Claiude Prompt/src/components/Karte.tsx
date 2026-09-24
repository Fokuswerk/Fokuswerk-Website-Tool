"use client";

import { useState } from "react";
import { betrieb } from "@/lib/daten";

const rahmen =
  "https://www.openstreetmap.org/export/embed.html?bbox=8.1846%2C53.0595%2C8.2086%2C53.0715&layer=mapnik&marker=53.0655%2C8.1966";

export default function Karte() {
  const [geladen, setGeladen] = useState(false);

  return (
    <figure className="relative overflow-hidden rounded-kante border border-tief/15 bg-papier-2">
      <div className="relative aspect-[16/10]">
        {geladen ? (
          <iframe
            src={rahmen}
            title={`Lage der ${betrieb.name} auf OpenStreetMap`}
            loading="lazy"
            className="absolute inset-0 h-full w-full"
            style={{ border: 0 }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setGeladen(true)}
            className="absolute inset-0 flex flex-col items-start justify-end gap-4 p-8 text-left transition-colors hover:bg-tief/5"
          >
            <span className="t-karte">Karte laden</span>
            <span className="t-text max-w-[40ch] text-tief/65">
              Beim Laden wird eine Verbindung zu OpenStreetMap aufgebaut. Dabei wird Ihre IP-Adresse
              an OpenStreetMap übertragen.
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-4 border-t border-tief/15 px-6 py-4">
        <span className="t-label text-mittel">
          {betrieb.strasse} · {betrieb.plz} {betrieb.ort}
        </span>
        <a
          href="https://www.openstreetmap.org/?mlat=53.0655&mlon=8.1966#map=16/53.0655/8.1966"
          target="_blank"
          rel="noopener noreferrer"
          className="t-label text-tief transition-colors hover:text-kupfer"
        >
          Größere Karte →
        </a>
      </figcaption>
    </figure>
  );
}
