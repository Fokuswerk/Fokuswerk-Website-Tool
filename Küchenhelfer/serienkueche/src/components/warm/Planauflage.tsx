"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { kuechenwaende, wandlaenge, WANDNAME, type Raumangaben, type WandId } from "@/lib/planer";

/**
 * Der hochgeladene Grundriss mit dem, was wir daraus gelesen haben, darüber.
 *
 * Wo im Bild der Raum liegt, kann keine Erkennung sicher sagen und wir raten
 * es hier auch nicht: der Nutzer zieht den Rahmen auf seinen Küchenraum. Die
 * Maße in den Schildern kommen aus seinen Angaben, der Rahmen sagt nur, wozu
 * sie gehören. Fenster, Tür und Wasseranschluss sitzen an der Stelle der Wand,
 * die ihre Zahl angibt — wer unten eine Zahl ändert, sieht es hier sofort.
 */

export interface Rahmen {
  x: number;
  y: number;
  b: number;
  h: number;
}

export const RAHMEN_START: Rahmen = { x: 0.045, y: 0.055, b: 0.44, h: 0.44 };

const MIN = 0.12;
const klemm = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Anteil 0..1 entlang einer Wand, im Uhrzeigersinn von ihrem Anfang. */
function anteil(raum: Raumangaben, w: WandId, mm: number) {
  return klemm(mm / Math.max(1, wandlaenge(raum, w)), 0, 1);
}

/** Punkt auf einer Wand des Rahmens, in Prozent des Bildes. */
function punkt(r: Rahmen, w: WandId, t: number) {
  if (w === "haupt") return { x: r.x + r.b * t, y: r.y };
  if (w === "gegenueber") return { x: r.x + r.b * (1 - t), y: r.y + r.h };
  if (w === "rechts") return { x: r.x + r.b, y: r.y + r.h * t };
  return { x: r.x, y: r.y + r.h * (1 - t) };
}

function Schild({
  r, w, t, text, ton = "dunkel", versatz = 6, nurGross = false,
}: {
  r: Rahmen; w: WandId; t: number; text: string; ton?: "dunkel" | "hell"; versatz?: number;
  /** Auf dem Handy ist im Rahmen kein Platz fuer vier Schilder. */
  nurGross?: boolean;
}) {
  const p = punkt(r, w, t);
  // Immer nach innen schieben, damit kein Schild am Bildrand abgeschnitten wird.
  // Der Versatz haelt zwei Schilder auf derselben Wand auseinander.
  const nachInnen =
    w === "haupt" ? `translate(-50%, ${versatz}px)`
    : w === "gegenueber" ? `translate(-50%, calc(-100% - ${versatz}px))`
    : w === "links" ? `translate(${versatz}px, -50%)`
    : `translate(calc(-100% - ${versatz}px), -50%)`;
  return (
    <span
      className={`pointer-events-none absolute whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-semibold shadow-sm sm:px-2.5 sm:py-1 sm:text-[11.5px] ${
        nurGross ? "hidden sm:inline-block" : ""
      } ${ton === "dunkel" ? "bg-kohle text-creme" : "bg-papier text-kohle"}`}
      style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, transform: nachInnen }}
    >
      {text}
    </span>
  );
}

export function Planauflage({
  raum, rahmen, setzeRahmen, bild, kinder,
}: {
  raum: Raumangaben;
  rahmen: Rahmen;
  setzeRahmen: (r: Rahmen) => void;
  /** Der hochgeladene Plan. Fehlt er, wird nur der Platzhalter gezeigt. */
  bild?: string | null;
  /** Platzhalterplan, wenn keine Bilddatei vorliegt. */
  kinder?: React.ReactNode;
}) {
  const huelle = useRef<HTMLDivElement>(null);
  const waende = kuechenwaende(raum);

  const zieh = (art: "flaeche" | "ol" | "ur") => (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const kasten = huelle.current?.getBoundingClientRect();
    if (!kasten) return;
    const start = { ...rahmen };
    const vonX = e.clientX;
    const vonY = e.clientY;

    const bewege = (ev: PointerEvent) => {
      const dx = (ev.clientX - vonX) / kasten.width;
      const dy = (ev.clientY - vonY) / kasten.height;
      if (art === "flaeche") {
        setzeRahmen({ ...start, x: klemm(start.x + dx, 0, 1 - start.b), y: klemm(start.y + dy, 0, 1 - start.h) });
      } else if (art === "ur") {
        setzeRahmen({ ...start, b: klemm(start.b + dx, MIN, 1 - start.x), h: klemm(start.h + dy, MIN, 1 - start.y) });
      } else {
        const nx = klemm(start.x + dx, 0, start.x + start.b - MIN);
        const ny = klemm(start.y + dy, 0, start.y + start.h - MIN);
        setzeRahmen({ x: nx, y: ny, b: start.b + (start.x - nx), h: start.h + (start.y - ny) });
      }
    };
    const ende = () => {
      window.removeEventListener("pointermove", bewege);
      window.removeEventListener("pointerup", ende);
    };
    window.addEventListener("pointermove", bewege);
    window.addEventListener("pointerup", ende);
  };

  const griff = "absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-kohle bg-papier shadow-md";
  const r = rahmen;

  /** Wandstück als Rechteck in Prozentangaben. */
  const stueck = (w: WandId, von: number, bis: number) => {
    const a = punkt(r, w, von);
    const b = punkt(r, w, bis);
    return {
      left: `${Math.min(a.x, b.x) * 100}%`,
      top: `${Math.min(a.y, b.y) * 100}%`,
      width: `${Math.abs(b.x - a.x) * 100}%`,
      height: `${Math.abs(b.y - a.y) * 100}%`,
    };
  };

  return (
    <div>
      <div ref={huelle} className="relative select-none overflow-hidden rounded-[18px] bg-papier">
      {bild ? (
        // Beliebiger Upload, deshalb kein next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bild} alt="Dein hochgeladener Grundriss" className="block w-full" draggable={false} />
      ) : (
        kinder
      )}

      {/* Alles außerhalb des Rahmens abdunkeln, damit der Raum heraussticht */}
      <div
        className="pointer-events-none absolute inset-0 bg-kohle/35"
        style={{
          clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${r.x * 100}% ${r.y * 100}%, ${r.x * 100}% ${(r.y + r.h) * 100}%, ${(r.x + r.b) * 100}% ${(r.y + r.h) * 100}%, ${(r.x + r.b) * 100}% ${r.y * 100}%, ${r.x * 100}% ${r.y * 100}%)`,
        }}
      />

      {/* Der Rahmen selbst — anfassbar und verschiebbar */}
      <div
        onPointerDown={zieh("flaeche")}
        className="absolute cursor-move rounded-[4px] border-2 border-dashed border-papier ring-2 ring-kohle/70"
        style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.b * 100}%`, height: `${r.h * 100}%`, touchAction: "none" }}
      />

      {/* Wände mit Küche */}
      {waende.map((w) => (
        <div key={w} className="pointer-events-none absolute bg-butter/80 ring-1 ring-kohle/50" style={{ ...stueck(w, 0, 1), minWidth: 5, minHeight: 5 }} />
      ))}

      {/* Fenster, Tür, Wasser an ihrer Stelle auf der Wand */}
      {raum.fenster && (
        <div
          className="pointer-events-none absolute bg-salbei ring-1 ring-papier"
          style={{
            ...stueck(raum.fenster.wand, anteil(raum, raum.fenster.wand, raum.fenster.von), anteil(raum, raum.fenster.wand, raum.fenster.von + raum.fenster.breite)),
            minWidth: 6, minHeight: 6,
          }}
        />
      )}
      <div
        className="pointer-events-none absolute bg-kohle ring-1 ring-papier"
        style={{
          ...stueck(raum.tuer.wand, anteil(raum, raum.tuer.wand, raum.tuer.von), anteil(raum, raum.tuer.wand, raum.tuer.von + raum.tuer.breite)),
          minWidth: 6, minHeight: 6,
        }}
      />
      {(() => {
        const p = punkt(r, raum.wasser.wand, anteil(raum, raum.wasser.wand, raum.wasser.von));
        return (
          <span
            className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-papier bg-kohle-2"
            style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
          />
        );
      })()}

      {/* Schilder */}
      <Schild r={r} w="haupt" t={0.5} text={`Raumbreite ${Math.round(raum.breite / 10)} cm`} />
      <Schild r={r} w="links" t={0.5} text={`Raumtiefe ${Math.round(raum.tiefe / 10)} cm`} />
      {raum.fenster && (
        <Schild
          r={r}
          w={raum.fenster.wand}
          t={anteil(raum, raum.fenster.wand, raum.fenster.von + raum.fenster.breite / 2)}
          text={`Fenster ${Math.round(raum.fenster.breite / 10)} cm`}
          ton="hell"
          versatz={34}
          nurGross
        />
      )}
      <Schild
        r={r}
        w={raum.tuer.wand}
        t={anteil(raum, raum.tuer.wand, raum.tuer.von + raum.tuer.breite / 2)}
        text="Tür"
        ton="hell"
        versatz={34}
        nurGross
      />

      {/* Griffe zum Aufziehen */}
      <span className={`${griff} cursor-nwse-resize`} style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, touchAction: "none" }} onPointerDown={zieh("ol")} />
      <span className={`${griff} cursor-nwse-resize`} style={{ left: `${(r.x + r.b) * 100}%`, top: `${(r.y + r.h) * 100}%`, touchAction: "none" }} onPointerDown={zieh("ur")} />

      <div className="pointer-events-none absolute right-3 top-3 hidden rounded-full bg-papier/95 px-3 py-1.5 text-[11.5px] font-semibold text-kohle shadow-sm sm:block">
        Zieh den Rahmen auf deinen Küchenraum
      </div>
      </div>

      {/* Legende unter dem Bild statt darauf — auf dem Handy deckt sie sonst den Plan zu */}
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-kohle-2">
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-[3px] bg-butter align-middle" />
          Küche an {waende.map((w) => WANDNAME[w]).join(", ")}
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-[3px] bg-salbei align-middle" />
          Fenster
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-[3px] bg-kohle align-middle" />
          Tür
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-kohle-2 align-middle" />
          Wasseranschluss
        </span>
      </div>
    </div>
  );
}

/** Ein gezeichneter Beispielgrundriss, wenn die Datei ein PDF ist. */
export function BeispielPlan() {
  const wand = "stroke-kohle-3";
  return (
    <svg viewBox="0 0 400 300" className="block w-full bg-papier" role="img" aria-label="Beispielhafter Wohnungsgrundriss">
      <rect x="14" y="14" width="372" height="272" fill="none" strokeWidth="7" className={wand} />
      <path d="M170 14 V130 M170 175 V286 M170 175 H386 M250 175 V286" strokeWidth="5" className={wand} fill="none" />
      <path d="M14 95 H60 M14 95" strokeWidth="5" className={wand} fill="none" />
      {/* Fenster als doppelte dünne Linien */}
      <path d="M60 14 H140 M222 14 H320" strokeWidth="7" className="stroke-papier" fill="none" />
      <path d="M60 14 H140 M222 14 H320 M14 150 V240" strokeWidth="2" className="stroke-kohle-3" fill="none" />
      {/* Türbögen */}
      <path d="M170 130 A45 45 0 0 1 125 175" strokeWidth="1.6" strokeDasharray="4 4" className="stroke-kohle-3" fill="none" />
      <path d="M250 220 A40 40 0 0 0 290 260" strokeWidth="1.6" strokeDasharray="4 4" className="stroke-kohle-3" fill="none" />
      <text x="78" y="110" fontSize="13" fontFamily="Plus Jakarta Sans, sans-serif" className="fill-kohle-3">Küche</text>
      <text x="268" y="105" fontSize="13" fontFamily="Plus Jakarta Sans, sans-serif" className="fill-kohle-3">Wohnen</text>
      <text x="300" y="240" fontSize="13" fontFamily="Plus Jakarta Sans, sans-serif" className="fill-kohle-3">Bad</text>
      <text x="190" y="240" fontSize="13" fontFamily="Plus Jakarta Sans, sans-serif" className="fill-kohle-3">Flur</text>
    </svg>
  );
}
