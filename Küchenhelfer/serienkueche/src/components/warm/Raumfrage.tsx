"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FORMEN, kuechenwaende, type Raumform, type WandId } from "@/lib/planer";
import { useKueche } from "@/store/kueche";

/**
 * Die Frage auf der Kante.
 *
 * Hier lagen nacheinander: ein Regler mit Preis, ein Regler mit den Sätzen des
 * Planers, ein angeschnittenes Stücklistenblatt und zuletzt ein Planband mit
 * Maßkette und Draufsicht. Das letzte war technisch sauber — Reihenfolge
 * eingefroren, nichts sprang, jeder Millimeter gerechnet — und trotzdem
 * falsch: "das matcht da jetzt wieder gar nicht rein von der Optik her … das
 * muss irgendwie was Cooles, Interaktives, Lustiges sein."
 *
 * Der Fehler war das Register. Ein weißer Kasten mit Bauzeichnung, gestrichelten
 * Hilfslinien und Millimetermaßen auf einem Küchenfoto ist ein Fremdkörper, und
 * Millimeter machen niemandem Lust auf eine Küche. Wer eine Küche kauft, freut
 * sich nicht auf das Vermessen, sondern auf die Küche.
 *
 * Deshalb steht hier jetzt kein Werkzeug, sondern die erste echte Frage des
 * Planers — groß gestellt, mit vier Räumen zum Antippen. Wer einen antippt,
 * sieht die Schränke in die Wände einrasten und ist im nächsten Augenblick im
 * Planer, die Antwort schon gesetzt. Kein Maß, keine Zahl, kein Preis: eine
 * Frage, die jeder sofort beantworten kann, weil er seinen Raum kennt.
 *
 * Die vier Formen sind nicht ausgedacht, sondern genau die, die der Planer
 * rechnet (FORMEN in lib/planer.ts). Welche Wände die Küche trägt, sagt
 * kuechenwaende() — dieselbe Funktion, die auch im Planer die Skizze zeichnet.
 */

/* Der Raum von oben. Mass in willkuerlichen Einheiten, nur fuer die Zeichnung. */
const L = 12;
const R = 148;
const O = 12;
const U = 96;
const TIEFE = 13;
const BLOCK = 17;

/** Die Schraenke an einer Wand, als Reihe kleiner Kaesten. */
function schraenkeAn(w: WandId) {
  const kaesten: Array<{ x: number; y: number; b: number; h: number }> = [];
  if (w === "haupt" || w === "gegenueber") {
    const y = w === "haupt" ? O : U - TIEFE;
    for (let x = L; x + BLOCK <= R; x += BLOCK) kaesten.push({ x: x + 1, y, b: BLOCK - 2, h: TIEFE });
  } else {
    const x = w === "links" ? L : R - TIEFE;
    for (let y = O; y + BLOCK <= U; y += BLOCK) kaesten.push({ x, y: y + 1, b: TIEFE, h: BLOCK - 2 });
  }
  return kaesten;
}

function Raum({ form, wach }: { form: Raumform; wach: boolean }) {
  const waende = kuechenwaende({ form, ausrichtung: 0 });
  return (
    <svg viewBox={`0 0 ${R + L} ${U + O}`} className="block w-full" aria-hidden="true">
      {/* Der Raum: ein Rechteck mit Boden. */}
      <rect x={L} y={O} width={R - L} height={U - O} className="fill-creme-2" />
      {/* Die Wände, die die Küche tragen, liegen dick auf dem Rechteck. */}
      {waende.map((w) => {
        const d =
          w === "haupt" ? `M${L} ${O} H${R}`
          : w === "gegenueber" ? `M${L} ${U} H${R}`
          : w === "links" ? `M${L} ${O} V${U}`
          : `M${R} ${O} V${U}`;
        return <path key={w} d={d} strokeWidth={5} className="stroke-kohle" fill="none" />;
      })}
      {/* Und auf Berührung rasten die Schränke ein — von der Wand her, nicht
          nacheinander wie eine Aufzählung, sondern alle zugleich. */}
      <g
        style={{
          opacity: wach ? 1 : 0,
          transform: wach ? "none" : "scale(0.94)",
          transformOrigin: "center",
          transition: "opacity .14s ease-out, transform .18s cubic-bezier(.22,.9,.3,1)",
        }}
      >
        {waende.flatMap((w, wi) =>
          schraenkeAn(w).map((k, i) => {
            /* Zwei Kaesten an der ersten Wand bekommen ein Geraet. Ohne das
               sind es Kisten an einer Linie; mit Herd und Spuele erkennt man
               eine Kueche, ohne ein Wort zu lesen. */
            const geraet = wi === 0 ? (i === 1 ? "herd" : i === 3 ? "spuele" : null) : null;
            const mx = k.x + k.b / 2;
            const my = k.y + k.h / 2;
            return (
              <g key={`${w}-${i}`}>
                <rect
                  x={k.x}
                  y={k.y}
                  width={k.b}
                  height={k.h}
                  className="fill-papier stroke-kohle-3"
                  strokeWidth={1.4}
                />
                {geraet === "herd" && (
                  <>
                    {[-2.6, 2.6].map((dx) =>
                      [-2.6, 2.6].map((dy) => (
                        <circle key={`${dx}-${dy}`} cx={mx + dx} cy={my + dy} r={1.5} className="fill-kohle" />
                      )),
                    )}
                  </>
                )}
                {geraet === "spuele" && (
                  <>
                    <rect
                      x={mx - 4.4}
                      y={my - 3.4}
                      width={8.8}
                      height={6.8}
                      rx={1.4}
                      className="fill-none stroke-kohle"
                      strokeWidth={1.4}
                    />
                    <path
                      d={`M${mx} ${my - 3.4} V${my - 6.2}`}
                      className="stroke-kohle"
                      strokeWidth={1.4}
                      strokeLinecap="round"
                    />
                  </>
                )}
              </g>
            );
          }),
        )}
      </g>
    </svg>
  );
}

export function Raumfrage() {
  const router = useRouter();
  const { setzeRaum, setzeQuelle, geheZu } = useKueche();
  const [wach, setzeWach] = useState<Raumform | null>(null);

  function waehle(form: Raumform) {
    /* Die Antwort steht im Planer schon drin, wenn er aufgeht. Genau das war
       gemeint mit "dass dich da einfach Stück für Stück jemand durchführt". */
    setzeRaum({ form, ausrichtung: 0 });
    setzeQuelle("fragen");
    /* Nicht auf die Formfrage, sondern auf die danach: die ist ja gerade
       beantwortet worden. Sonst stünde man vor seiner eigenen Antwort. */
    geheZu("drehung");
    router.push("/kueche");
  }

  return (
    <div className="nicht-drucken relative z-10">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
        <div className="bg-kohle px-5 py-7 text-creme sm:px-9 sm:py-9">
          <div className="sm:flex sm:items-end sm:justify-between sm:gap-10">
            <h2 className="gross max-w-[16ch] text-[26px] font-bold leading-[1.1] sm:text-[34px]">
              Fangen wir mit deinem Raum an.
            </h2>
            <p className="mt-2.5 max-w-[34ch] text-[15px] leading-snug text-creme/65 sm:mt-0 sm:shrink-0">
              Tipp an, wie deine Küche steht. Den Rest rechnen wir.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:grid-cols-4 sm:gap-4">
            {FORMEN.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => waehle(f.id)}
                onPointerEnter={() => setzeWach(f.id)}
                onPointerLeave={() => setzeWach((v) => (v === f.id ? null : v))}
                onPointerDown={() => setzeWach(f.id)}
                onFocus={() => setzeWach(f.id)}
                onBlur={() => setzeWach((v) => (v === f.id ? null : v))}
                className="group flex flex-col rounded-[3px] bg-creme p-2.5 text-left transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-creme active:translate-y-0 sm:p-3.5"
              >
                <Raum form={f.id} wach={wach === f.id} />
                <div className="gross mt-2.5 text-[15px] font-bold leading-tight text-kohle sm:text-[17px]">
                  {f.titel}
                </div>
                <div className="mt-1 text-[12.5px] leading-snug text-kohle-2 sm:text-[13.5px]">{f.erklaerung}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
