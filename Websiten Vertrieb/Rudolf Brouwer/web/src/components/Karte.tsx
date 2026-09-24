"use client";

import { useState } from "react";
import { betrieb } from "@/daten/betrieb";

/**
 * Der Kartenausschnitt wird erst auf Klick geladen. Vorher geht keine
 * Anfrage an OpenStreetMap — also auch keine IP-Adresse der Besucherin.
 * Nebenbei spart das rund 900 kB beim Aufruf der Seite.
 */
export default function Karte() {
  const [geladen, setGeladen] = useState(false);

  const ausschnitt =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${(betrieb.laenge - 0.006).toFixed(5)}%2C${(betrieb.breite - 0.0028).toFixed(5)}` +
    `%2C${(betrieb.laenge + 0.006).toFixed(5)}%2C${(betrieb.breite + 0.0028).toFixed(5)}` +
    `&layer=mapnik&marker=${betrieb.breite}%2C${betrieb.laenge}`;

  const ganzeKarte =
    `https://www.openstreetmap.org/?mlat=${betrieb.breite}&mlon=${betrieb.laenge}#map=17/${betrieb.breite}/${betrieb.laenge}`;

  return (
    <div className="karte-rahmen">
      {geladen ? (
        <iframe
          src={ausschnitt}
          title={`Lage der ${betrieb.name} auf der Karte`}
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="karte-platz">
          <svg className="karte-netz" viewBox="0 0 400 300" aria-hidden="true">
            <defs>
              <pattern id="karte-raster" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#karte-raster)" />
            <path d="M0 196 L400 128" stroke="currentColor" strokeWidth="7" opacity="0.28" />
            <path d="M0 196 L400 128" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" opacity="0.5" />
            <circle cx="206" cy="161" r="8" fill="var(--marine)" />
            <circle cx="206" cy="161" r="17" fill="none" stroke="var(--marine)" strokeWidth="1.2" opacity="0.6" />
          </svg>

          <div className="karte-hinweis-block">
            <p className="marke">Oldenburger Straße 209</p>
            <p className="karte-platz-text">
              Die Karte kommt von OpenStreetMap. Sie wird erst geladen, wenn Sie es wollen —
              dabei wird Ihre IP-Adresse dorthin übertragen.
            </p>
            <div className="karte-platz-knoepfe">
              <button type="button" className="knopf" onClick={() => setGeladen(true)}>
                Karte laden
              </button>
              <a href={ganzeKarte} className="knopf knopf-still" rel="noopener">
                Bei OpenStreetMap öffnen
              </a>
            </div>
          </div>
        </div>
      )}
      <p className="still karte-quelle">
        Karte: <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> und Mitwirkende
      </p>
    </div>
  );
}
