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

const ALLE: WandId[] = ["haupt", "rechts", "gegenueber", "links"];

const WANDWEG: Record<WandId, string> = {
  haupt: `M${L} ${O} H${R}`,
  rechts: `M${R} ${O} V${U}`,
  gegenueber: `M${L} ${U} H${R}`,
  links: `M${L} ${O} V${U}`,
};

/** Die Schraenke an einer Wand, als Reihe mit Geraeten darin. */
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

/** Die Kante der Arbeitsplatte, innen an der Schrankreihe entlang. */
function platteAn(w: WandId): string {
  if (w === "haupt") return `M${L} ${O + TIEFE} H${R}`;
  if (w === "gegenueber") return `M${L} ${U - TIEFE} H${R}`;
  if (w === "links") return `M${L + TIEFE} ${O} V${U}`;
  return `M${R - TIEFE} ${O} V${U}`;
}

/** Herd und Spuele, damit man ohne ein Wort zu lesen eine Kueche erkennt. */
function Geraet({ art, mx, my }: { art: "herd" | "spuele"; mx: number; my: number }) {
  if (art === "herd") {
    return (
      <>
        {[-2.6, 2.6].map((dx) =>
          [-2.6, 2.6].map((dy) => (
            <circle key={`${dx}-${dy}`} cx={mx + dx} cy={my + dy} r={1.5} className="fill-kohle" />
          )),
        )}
      </>
    );
  }
  return (
    <>
      <rect
        x={mx - 4.4}
        y={my - 3.2}
        width={8.8}
        height={6.4}
        rx={1.2}
        className="fill-none stroke-kohle"
        strokeWidth={1.3}
      />
      <circle cx={mx} cy={my} r={1} className="fill-kohle" />
    </>
  );
}

function Raum({ form, wach }: { form: Raumform; wach: boolean }) {
  const waende = kuechenwaende({ form, ausrichtung: 0 });
  /* Die Tuer kommt an die erste Wand ohne Kueche — ein Raum ohne Tuer ist
     kein Raum, und im Grundriss ist sie das Zeichen, das ihn lesbar macht. */
  const tuerwand = ALLE.find((w) => !waende.includes(w)) ?? "gegenueber";
  const fenster = waende.includes("haupt") ? "gegenueber" : "haupt";

  return (
    <svg viewBox={`0 0 ${R + L} ${U + O}`} className="block w-full" aria-hidden="true">
      {/* Der Boden. Warm, nicht grau: das hier ist eine Wohnung. */}
      <rect x={L} y={O} width={R - L} height={U - O} className="fill-creme-2" />

      {/* Alle vier Waende duenn — der Raum ist geschlossen. */}
      {ALLE.map((w) => (
        <path key={`d-${w}`} d={WANDWEG[w]} strokeWidth={2} className="stroke-linie-stark" fill="none" />
      ))}

      {/* Das Fenster: ein heller Ausschnitt in der Wand gegenueber der Kueche. */}
      {fenster === "haupt" ? (
        <path d={`M${L + 44} ${O} H${L + 92}`} strokeWidth={5} className="stroke-papier" fill="none" />
      ) : (
        <path d={`M${L + 44} ${U} H${L + 92}`} strokeWidth={5} className="stroke-papier" fill="none" />
      )}

      {/* Die Waende, die die Kueche tragen, liegen dick darauf. */}
      {waende.map((w) => (
        <path key={w} d={WANDWEG[w]} strokeWidth={5} className="stroke-kohle" fill="none" />
      ))}

      {/* Die Schraenke. Immer sichtbar — ein leerer Kasten mit einer Linie ist
          keine Kueche, sondern ein leerer Kasten mit einer Linie. */}
      {waende.flatMap((w, wi) =>
        schraenkeAn(w).map((k, i) => {
          const geraet = wi === 0 ? (i === 1 ? "herd" : i === 3 ? "spuele" : null) : null;
          return (
            <g key={`${w}-${i}`}>
              <rect
                x={k.x}
                y={k.y}
                width={k.b}
                height={k.h}
                className="fill-papier stroke-linie-stark"
                strokeWidth={1.2}
              />
              {geraet && <Geraet art={geraet} mx={k.x + k.b / 2} my={k.y + k.h / 2} />}
            </g>
          );
        }),
      )}

      {/* Die Arbeitsplatte laeuft ueber die Fugen hinweg — eine Platte, nicht
          sieben Deckel. Beim Beruehren wird sie kraeftig: das ist die Flaeche,
          auf der gearbeitet wird. */}
      {waende.map((w) => (
        <path
          key={`p-${w}`}
          d={platteAn(w)}
          strokeWidth={wach ? 3 : 2}
          className={wach ? "stroke-kohle" : "stroke-kohle-3"}
          fill="none"
          style={{ transition: "stroke-width .16s ease-out" }}
        />
      ))}

      {/* Die Tuer, als Viertelkreis wie im Grundriss. */}
      {tuerwand === "gegenueber" && (
        <>
          <path d={`M${R - 46} ${U} H${R - 18}`} strokeWidth={5} className="stroke-papier" fill="none" />
          <path
            d={`M${R - 46} ${U} A28 28 0 0 1 ${R - 18} ${U - 28}`}
            strokeWidth={1.4}
            className="stroke-kohle-3"
            fill="none"
          />
        </>
      )}
      {tuerwand === "links" && (
        <>
          <path d={`M${L} ${U - 40} V${U - 12}`} strokeWidth={5} className="stroke-papier" fill="none" />
          <path
            d={`M${L} ${U - 12} A28 28 0 0 1 ${L + 28} ${U - 40}`}
            strokeWidth={1.4}
            className="stroke-kohle-3"
            fill="none"
          />
        </>
      )}
      {tuerwand === "rechts" && (
        <>
          <path d={`M${R} ${U - 40} V${U - 12}`} strokeWidth={5} className="stroke-papier" fill="none" />
          <path
            d={`M${R} ${U - 12} A28 28 0 0 0 ${R - 28} ${U - 40}`}
            strokeWidth={1.4}
            className="stroke-kohle-3"
            fill="none"
          />
        </>
      )}
      {tuerwand === "haupt" && (
        <>
          <path d={`M${L + 14} ${O} H${L + 42}`} strokeWidth={5} className="stroke-papier" fill="none" />
          <path
            d={`M${L + 42} ${O} A28 28 0 0 1 ${L + 14} ${O + 28}`}
            strokeWidth={1.4}
            className="stroke-kohle-3"
            fill="none"
          />
        </>
      )}
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
    /* Kein Kasten mehr.
       Hier lagen nacheinander ein weisser und ein fast schwarzer Kasten, beide
       auf der Naht zwischen Foto und gruenem Abschnitt, beide mit demselben
       Urteil: "das sieht da wie ein Fremdkoerper aus, einfach billig
       reingepfuscht." Die Farbe war nie das Problem. Ein Kasten, der auf einer
       Kante liegt, ist immer ein aufgeklebtes Ding — er gehoert weder zu dem,
       was ueber ihm liegt, noch zu dem darunter.
       Also gibt es ihn nicht mehr. Die Frage steht jetzt als erstes IM gruenen
       Abschnitt, auf dessen eigenem Grund, ohne Rahmen, ohne eigene Farbe,
       ohne Ueberlappung. Die harte Kante zwischen Foto und Gruen bleibt genau
       das: eine Kante. Kaesten gibt es nur noch dort, wo der Kasten die
       Handlung ist — die vier Raeume, die man antippt. */
    <div className="nicht-drucken">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
        <div>
          <div className="sm:flex sm:items-end sm:justify-between sm:gap-10">
            <h2 className="gross max-w-[16ch] text-[30px] font-bold leading-[1.06] text-creme sm:text-[42px]">
              Fangen wir mit deinem Raum an.
            </h2>
            <p className="mt-3 max-w-[34ch] text-[15.5px] leading-snug text-creme/65 sm:mt-0 sm:shrink-0">
              Tipp an, wie deine Küche steht. Den Rest rechnen wir.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-11 sm:grid-cols-4 sm:gap-5">
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
