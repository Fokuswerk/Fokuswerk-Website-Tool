"use client";

import { useMemo, useState } from "react";
import { eur } from "@/lib/berechnung";
import { alsKuechentyp, planeKueche, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";
import { Kuechenbild } from "@/components/warm/Kuechenbild";

/**
 * Der Hero zeigt das Produkt, statt es zu beschreiben: ein Regler für die
 * Wandlänge, die Küche zeichnet sich neu, der Preis läuft mit. Gerechnet
 * wird mit demselben Planer wie in der Strecke — nichts ist hier Attrappe.
 */

const MIN = 2200;
const MAX = 4600;

export function LiveHero() {
  const [laenge, setLaenge] = useState(3400);

  const { typ, vorschlag } = useMemo(() => {
    const raum: Raumangaben = {
      ...STANDARD_RAUM,
      breite: laenge,
      nutz: { ...STANDARD_RAUM.nutz, haupt: laenge },
      fenster: laenge >= 3000 ? { wand: "haupt", von: Math.round(laenge * 0.55), breite: 1100 } : null,
      wasser: { wand: "haupt", von: Math.round(laenge * 0.78) },
    };
    return { typ: alsKuechentyp(raum), vorschlag: planeKueche(raum, "arbeiten") };
  }, [laenge]);

  const schraenke = Object.values(vorschlag.belegung).flat().length;

  return (
    <div className="rounded-[26px] bg-papier p-5 shadow-[0_24px_70px_-28px_rgba(23,22,15,0.35)] sm:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <div className="text-[13px] font-semibold uppercase tracking-[0.09em] text-kohle-3">
          Probier es direkt hier
        </div>
        <div className="num text-[13px] text-kohle-3">{(laenge / 1000).toFixed(2).replace(".", ",")} m Wand</div>
      </div>

      <div className="mt-4 rounded-[18px] bg-creme-2/60 px-3 pt-4 sm:px-5">
        <Kuechenbild typ={typ} variante={vorschlag.variante} zeileId={typ.zeilen[0].id} hoehe={210} mitNamen={false} />
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
        className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-creme-2"
      />
      <div className="mt-1.5 flex justify-between text-[12.5px] text-kohle-3">
        <span>kleine Küche</span>
        <span>Zieh am Regler</span>
        <span>großer Raum</span>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-linie-warm pt-5">
        <div>
          <div className="text-[13px] text-kohle-3">
            {schraenke} Schränke{vorschlag.haengeschraenke > 0 ? `, ${vorschlag.haengeschraenke} oben` : ""}
            {vorschlag.arbeitsflaeche > 0 ? ` · ${Math.round(vorschlag.arbeitsflaeche / 10)} cm Arbeitsfläche` : ""}
          </div>
          <div className="gross mt-0.5 text-[32px] font-bold leading-none text-kohle">
            {eur(vorschlag.preis)}
          </div>
        </div>
        <div className="text-right text-[12.5px] leading-snug text-kohle-3">
          komplett, mit Geräten
          <br />
          und Montage
        </div>
      </div>
    </div>
  );
}
