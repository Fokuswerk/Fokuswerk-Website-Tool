"use client";

import { useMemo, useState } from "react";
import { brutto, eur } from "@/lib/berechnung";
import { alsKuechentyp, planeKueche, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";
import { modul } from "@/data/module";
import { Kuechenbild } from "@/components/warm/Kuechenbild";

/**
 * Der Hero zeigt das Produkt, statt es zu beschreiben.
 *
 * Vorher stand hier ein kleines räumliches Bild in einem großen leeren
 * Kasten, darunter zwei beschriftete Zahlen nebeneinander — Wandlänge und
 * Preis, wie auf einem Formular. Das behauptete "das rechnet gerade", bewies
 * es aber nicht: man sah nichts rechnen.
 *
 * Jetzt ist die Wand selbst der Regler. Am rechten Ende hängt ein Griff; zieht
 * man daran, wird die Wand länger, und die Küche darunter baut sich neu auf —
 * maßstäblich, mit denselben Schränken, die später in der Stückliste stehen.
 * Der Griff sitzt genau am Wandende, weil die Maßlinie und der Regler
 * denselben Weg zurücklegen.
 */

const MIN = 2500;
const MAX = 4600;
/** Seitlicher Rand der Zeichnung, muss zu `randX` in Kuechenbild passen. */
const RAND = 180;
/** Wie breit die Zeichnung bei der kürzesten Wand ist, als Anteil. */
const SCHMALSTE = (MIN + 2 * RAND) / (MAX + 2 * RAND);

const meter = (mm: number) => (mm / 1000).toFixed(2).replace(".", ",");

export function LiveHero() {
  const [laenge, setLaenge] = useState(3400);
  const [zieht, setZieht] = useState(false);

  const { typ, vorschlag } = useMemo(() => {
    const raum: Raumangaben = {
      ...STANDARD_RAUM,
      breite: laenge,
      tiefe: 2500,
      nutz: { ...STANDARD_RAUM.nutz, haupt: laenge },
      fenster: laenge >= 3000 ? { wand: "haupt", von: Math.round(laenge * 0.55), breite: 1100 } : null,
      tuer: { wand: "gegenueber", von: 600, breite: 885 },
      wasser: { wand: "haupt", von: Math.round(laenge * 0.78) },
    };
    return { typ: alsKuechentyp(raum), vorschlag: planeKueche(raum, "arbeiten") };
  }, [laenge]);

  // Passleisten sind Zuschnitt, keine Schraenke.
  const schraenke = Object.values(vorschlag.belegung)
    .flat()
    .filter((id) => !id.startsWith("PBX:") && modul(id).kategorie !== "blende").length;

  const anteil = (laenge + 2 * RAND) / (MAX + 2 * RAND);

  return (
    <div className="grid items-start gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
      {/* Die Maßlinie ist die Wand und zugleich der Regler. */}
      <div className="relative h-[46px] select-none">
        <div
          className="absolute top-[22px] h-[2px] bg-kohle transition-[width] duration-100 ease-out"
          style={{ width: `${anteil * 100}%` }}
        />
        <div className="absolute left-0 top-[14px] h-[18px] w-[2px] bg-kohle" />
        <div
          className="absolute top-[14px] h-[18px] w-[2px] bg-kohle transition-[left] duration-100 ease-out"
          style={{ left: `calc(${anteil * 100}% - 2px)` }}
        />
        <div
          className="gross ziffern absolute top-0 -translate-x-1/2 whitespace-nowrap bg-papier px-2 text-[19px] font-bold leading-none text-kohle transition-[left] duration-100 ease-out sm:text-[22px]"
          style={{ left: `${(anteil * 100) / 2}%` }}
        >
          {meter(laenge)} m
        </div>

        <label htmlFor="herolaenge" className="sr-only">Wandlänge</label>
        <input
          id="herolaenge"
          type="range"
          min={MIN}
          max={MAX}
          step={100}
          value={laenge}
          onChange={(e) => setLaenge(Number(e.target.value))}
          onPointerDown={() => setZieht(true)}
          onPointerUp={() => setZieht(false)}
          onPointerCancel={() => setZieht(false)}
          aria-valuetext={`${meter(laenge)} Meter Wandlänge`}
          className="wandregler absolute top-0"
          style={{ left: `${SCHMALSTE * 100}%`, width: `${(1 - SCHMALSTE) * 100}%` }}
        />
      </div>

      {/* Die Küche wächst mit der Wand — gleicher Maßstab, mehr Wand. */}
      <div
        className="transition-[width] duration-100 ease-out"
        style={{ width: `${anteil * 100}%` }}
      >
        <Kuechenbild typ={typ} variante={vorschlag.variante} zeileId={typ.zeilen[0].id} volleBreite />
      </div>

      <p
        className={`mt-2 text-[12.5px] text-kohle-3 transition-opacity ${zieht ? "opacity-0" : "opacity-100"}`}
      >
        Am Griff ziehen — die Wand wird länger, die Küche rechnet sich neu.
      </p>
      </div>

      <div className="border-t border-linie-warm pt-5 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-1">
        <div>
          <div className="gross ziffern text-[30px] font-bold leading-none text-kohle sm:text-[38px]">
            {eur(brutto(vorschlag.preis))}
          </div>
          <div className="mt-1.5 text-[13px] text-kohle-3">Komplett, mit Geräten und Montage, inkl. MwSt.</div>
        </div>
        <p className="mt-5 text-[14.5px] leading-snug text-kohle-2">
          Dafür stehen{" "}
          <strong className="ziffern font-semibold text-kohle">{schraenke} Schränke</strong> an der Wand
          {vorschlag.arbeitsflaeche > 0 ? (
            <>
              , mit{" "}
              <strong className="ziffern font-semibold text-kohle">
                {meter(vorschlag.arbeitsflaeche)} m
              </strong>{" "}
              freier Fläche zwischen Spüle und Herd.
            </>
          ) : (
            <>. Spüle und Herd liegen nebeneinander — für mehr fehlt die Wand.</>
          )}
        </p>
      </div>
    </div>
  );
}
