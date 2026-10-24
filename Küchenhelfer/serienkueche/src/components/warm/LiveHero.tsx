"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { alsKuechentyp, planeKueche, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";
import { Kuechenbild } from "@/components/warm/Kuechenbild";

/**
 * Der Hero zeigt das Produkt, statt es zu beschreiben.
 *
 * Hier stand ein Preis. Der war das Falsche an dieser Stelle: wer gerade auf
 * der Seite gelandet ist, hat noch nichts über seinen Raum gesagt, und eine
 * Zahl ohne Grundlage ist keine Auskunft, sondern ein Versprechen, das wir
 * nicht halten können. Was ein Mensch hier wissen will, ist, ob das Ding
 * wirklich etwas kann.
 *
 * Also zeigt es das, was nur ein Planer kann: Entscheidungen treffen und sie
 * begründen. Wand und Fenster lassen sich ziehen; die Küche ordnet sich neu,
 * und daneben stehen die Sätze, die der Planer dazu ausgibt — dieselben, die
 * später im Ergebnis stehen. Der Preis kommt, wenn es etwas zu rechnen gibt.
 */

const MIN = 2500;
const MAX = 4600;
/** Seitlicher Rand der Zeichnung, muss zu `randX` in Kuechenbild passen. */
const RAND = 180;
const FENSTER_BREITE = 1100;
/** Wie breit die Zeichnung bei der kürzesten Wand ist, als Anteil. */
const SCHMALSTE = (MIN + 2 * RAND) / (MAX + 2 * RAND);
/** Höhe der Fenstermitte in der Zeichnung, als Anteil der Zeichenhöhe. */
const FENSTER_HOEHE = (2500 - 1600 + 140) / 2790;

const meter = (mm: number) => (mm / 1000).toFixed(2).replace(".", ",");

export function LiveHero() {
  const [laenge, setLaenge] = useState(3400);
  const [fenster, setFenster] = useState(1700);

  const fensterMax = Math.max(0, laenge - FENSTER_BREITE);
  const fensterVon = Math.min(fenster, fensterMax);

  const { typ, vorschlag } = useMemo(() => {
    const raum: Raumangaben = {
      ...STANDARD_RAUM,
      breite: laenge,
      tiefe: 2500,
      nutz: { ...STANDARD_RAUM.nutz, haupt: laenge },
      fenster: { wand: "haupt", von: fensterVon, breite: FENSTER_BREITE },
      tuer: { wand: "gegenueber", von: 600, breite: 885 },
      wasser: { wand: "haupt", von: Math.round(laenge * 0.78) },
    };
    return { typ: alsKuechentyp(raum), vorschlag: planeKueche(raum, "arbeiten") };
  }, [laenge, fensterVon]);

  /* Was der Plan sagt — zuerst, was ihm auffällt, dann was gut ist. Die
     Passleiste bleibt draußen: Zuschnitt interessiert hier niemanden, und
     der Satz steht bei jeder Länge da. */
  const saetze = [
    ...vorschlag.achtungPunkte.map((t) => ({ gut: false, t })),
    ...vorschlag.gutPunkte.map((t) => ({ gut: true, t })),
  ]
    .filter((s) => !s.t.includes("Passleiste"))
    .slice(0, 3);

  const anteil = (laenge + 2 * RAND) / (MAX + 2 * RAND);
  const vbBreite = laenge + 2 * RAND;
  // Beide Griffe sitzen genau auf dem, was sie bewegen: Wandende und
  // Fenstermitte. Das geht auf, weil Reglerweg und Zeichnung affin sind.
  const fAnf = (FENSTER_BREITE / 2 + RAND) / vbBreite;
  const fEnd = (fensterMax + FENSTER_BREITE / 2 + RAND) / vbBreite;

  return (
    <div className="grid items-start gap-x-10 gap-y-7 lg:grid-cols-[minmax(0,1fr)_330px]">
      <div className="min-w-0">
        {/* Die Maßlinie ist die Wand und zugleich ihr Regler. */}
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
            aria-valuetext={`${meter(laenge)} Meter Wandlänge`}
            className="wandregler absolute top-0"
            style={{ left: `${SCHMALSTE * 100}%`, width: `${(1 - SCHMALSTE) * 100}%` }}
          />
        </div>

        {/* Die Küche wächst mit der Wand — gleicher Maßstab, mehr Wand. */}
        <div className="relative">
          <div
            className="transition-[width] duration-100 ease-out"
            style={{ width: `${anteil * 100}%` }}
          >
            <Kuechenbild typ={typ} variante={vorschlag.variante} zeileId={typ.zeilen[0].id} volleBreite />
          </div>

          {/* Der zweite Griff liegt auf dem Fenster. */}
          <label htmlFor="herofenster" className="sr-only">Stelle des Fensters an der Wand</label>
          <input
            id="herofenster"
            type="range"
            min={0}
            max={fensterMax}
            step={50}
            value={fensterVon}
            onChange={(e) => setFenster(Number(e.target.value))}
            aria-valuetext={`Fenster ${meter(fensterVon)} Meter ab der linken Ecke`}
            className="wandregler absolute -translate-y-1/2"
            style={{
              top: `${FENSTER_HOEHE * 100}%`,
              left: `${anteil * fAnf * 100}%`,
              width: `${anteil * (fEnd - fAnf) * 100}%`,
            }}
          />
        </div>

        <p className="mt-2 text-[12.5px] leading-snug text-kohle-3">
          Zieh an der Wand oder am Fenster. Die Küche ordnet sich neu — nach denselben Regeln, nach
          denen wir auch deine planen.
        </p>
      </div>

      <div className="border-t border-linie-warm pt-5 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-1">
        <div className="vorzeile">Was der Plan dazu sagt</div>
        <ul className="mt-3.5 space-y-2.5">
          {saetze.map((s) => (
            <li key={s.t} className="flex gap-2.5 text-[14.5px] leading-snug">
              {s.gut ? (
                <Check size={15} strokeWidth={2.4} className="mt-[3px] shrink-0 text-salbei" />
              ) : (
                <span className="mt-[1px] shrink-0 font-bold text-kohle">!</span>
              )}
              <span className={s.gut ? "text-kohle-2" : "text-kohle"}>{s.t}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-linie-warm pt-5">
          <p className="text-[13.5px] leading-snug text-kohle-2">
            Was deine Küche kostet, hängt an deinen Maßen und deinen Geräten. Das rechnen wir dir
            aus — mit jedem Schrank einzeln.
          </p>
          <Link
            href="/kueche"
            className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#3b382f] to-kohle px-5 py-2.5 text-[14.5px] font-semibold text-creme shadow-[0_1px_2px_rgba(21,20,15,.2),0_10px_24px_-10px_rgba(21,20,15,.55),inset_0_1px_0_rgba(255,255,255,.14)] transition-colors hover:from-[#474338] hover:to-[#211f18]"
          >
            Küche planen
            <ArrowRight size={15} strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
