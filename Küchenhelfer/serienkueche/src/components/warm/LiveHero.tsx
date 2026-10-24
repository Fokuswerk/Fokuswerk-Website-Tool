"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { brutto, eur } from "@/lib/berechnung";
import { alsKuechentyp, istStauraum, planeKueche, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";
import { modul } from "@/data/module";

/**
 * Der Hero zeigt das Produkt, statt es zu beschreiben: ein Regler für die
 * Wandlänge, die Küche baut sich neu auf, der Preis läuft mit. Gerechnet
 * wird mit demselben Planer wie in der Strecke — nichts ist hier Attrappe.
 */

const Kuechenraum = dynamic(
  () => import("@/components/warm/Kuechenraum").then((m) => m.Kuechenraum),
  { ssr: false, loading: () => <div className="rounded-[18px] bg-creme-2" style={{ height: HOEHE }} /> },
);

const MIN = 2200;
const MAX = 4600;
const HOEHE = "clamp(290px, 44vw, 470px)";

export function LiveHero() {
  const [laenge, setLaenge] = useState(3400);

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

  // Passleisten sind Zuschnitt, keine Schraenke — sie mitzuzaehlen hat die
  // Zahl aufgeblasen.
  const schraenke = Object.values(vorschlag.belegung)
    .flat()
    .filter((id) => !id.startsWith("PBX:") && modul(id).kategorie !== "blende").length;

  return (
    <div>
      <Kuechenraum
        typ={typ}
        variante={vorschlag.variante}
        hoehe={HOEHE}
        rahmenGroesse={3.9}
        unterzeile={false}
      />

      <div className="mx-auto mt-8 max-w-[640px]">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="vorzeile">Wandlänge</div>
            <div className="gross ziffern mt-1.5 text-[25px] font-bold leading-none text-kohle">
              {(laenge / 1000).toFixed(2).replace(".", ",")} m
            </div>
          </div>
          <div className="text-right">
            <div className="vorzeile">Komplett, inkl. MwSt.</div>
            <div className="gross ziffern mt-1.5 text-[25px] font-bold leading-none text-kohle">
              {eur(brutto(vorschlag.preis))}
            </div>
          </div>
        </div>

        {/* Was sich beim Schieben mitaendert, steht in einer eigenen Zeile.
            Vorher lagen die Enden des Reglers und die gerechneten Werte in
            einer Reihe und lasen sich wie ein einziger Satz. */}
        <div className="ziffern mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-t border-linie-warm pt-4 text-[13.5px] text-kohle-2">
          <span>
            <strong className="font-semibold text-kohle">{schraenke}</strong> Schränke
          </span>
          {vorschlag.arbeitsflaeche > 0 && (
            <span>
              <strong className="font-semibold text-kohle">
                {(vorschlag.arbeitsflaeche / 1000).toFixed(2).replace(".", ",")} m
              </strong>{" "}
              Arbeitsfläche zwischen Spüle und Herd
            </span>
          )}
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
          className="mt-6 w-full cursor-pointer"
        />
        <div className="ziffern mt-2.5 flex items-center justify-between gap-4 text-[12.5px] text-kohle-3">
          <span>{(MIN / 1000).toFixed(2).replace(".", ",")} m</span>
          <span>{(MAX / 1000).toFixed(2).replace(".", ",")} m</span>
        </div>
      </div>
    </div>
  );
}
