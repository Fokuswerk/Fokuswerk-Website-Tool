"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { kuechenwaende, wandlaenge, WANDNAME, type Raumangaben, type WandId } from "@/lib/planer";

/**
 * Der hochgeladene Grundriss mit dem, was wir daraus gelesen haben, darüber.
 *
 * Wo im Bild der Raum liegt, kann keine Erkennung sicher sagen und wir raten
 * es hier auch nicht: der Nutzer zieht den Rahmen auf seinen Küchenraum. Die
 * Maße in den Schildern kommen aus seinen Angaben, der Rahmen sagt nur, wozu
 * sie gehören. Fenster, Tür und Wasseranschluss sitzen an der Stelle der Wand,
 * die ihre Zahl angibt — wer unten eine Zahl ändert, sieht es hier sofort.
 *
 * Der Rahmen lässt sich frei ziehen. Ihn an das Seitenverhältnis der
 * eingegebenen Maße zu binden war falsch herum gedacht: der Plan ist das,
 * was man sieht, die Maße sind geschätzt. Wer einen schmalen Raum markiert,
 * meint einen schmalen Raum. Stattdessen sagen wir es, wenn Rahmen und Maße
 * auseinanderlaufen, und bieten an, die Tiefe an den Rahmen anzupassen.
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
  r, w, t, text, ton = "dunkel", versatz = 6, nurGross = false, aussen = false, notfallsWeg = false, box,
}: {
  r: Rahmen; w: WandId; t: number; text: string; ton?: "dunkel" | "hell"; versatz?: number;
  /** Auf dem Handy ist im Rahmen kein Platz fuer vier Schilder. */
  nurGross?: boolean;
  /** Bei einem flachen Rahmen stapeln sich die Schilder innen uebereinander.
      Dann stehen sie besser davor als darin. */
  aussen?: boolean;
  /** Masszahlen stehen auch in der Liste unter dem Bild. Passen sie im engen
      Rahmen nirgends hin, lassen wir sie lieber weg, als sie zu stapeln. */
  notfallsWeg?: boolean;
  /** Gemessene Bildgröße in Pixeln — nur damit lässt sich sagen, ob neben
      dem Rahmen wirklich ein Schild hinpasst. */
  box?: { w: number; h: number };
}) {
  const p = punkt(r, w, t);
  // Nach aussen nur, wo zwischen Rahmen und Bildrand auch Platz ist —
  // sonst steht das Schild halb neben dem Bild.
  // Oben und unten braucht ein Schild ~30 px, links und rechts ~120 px.
  const bw = box?.w ?? 0;
  const bh = box?.h ?? 0;
  const platz =
    w === "haupt" ? r.y * bh > 34
    : w === "gegenueber" ? (1 - (r.y + r.h)) * bh > 34
    : w === "links" ? r.x * bw > 124
    : (1 - (r.x + r.b)) * bw > 124;
  const raus = aussen && platz;
  if (aussen && !platz && notfallsWeg) return null;
  // Normalerweise nach innen schieben, damit kein Schild am Bildrand
  // abgeschnitten wird. Der Versatz haelt zwei Schilder auf derselben Wand
  // auseinander.
  // Auch draußen bleiben zwei Schilder derselben Wand auf zwei Zeilen.
  const abstand = raus ? (versatz > 20 ? 32 : 6) : versatz;
  const nachInnen =
    w === "haupt" ? (raus ? `translate(-50%, calc(-100% - ${abstand}px))` : `translate(-50%, ${abstand}px)`)
    : w === "gegenueber" ? (raus ? `translate(-50%, ${abstand}px)` : `translate(-50%, calc(-100% - ${abstand}px))`)
    : w === "links" ? (raus ? `translate(calc(-100% - ${abstand}px), -50%)` : `translate(${abstand}px, -50%)`)
    : (raus ? `translate(${abstand}px, -50%)` : `translate(calc(-100% - ${abstand}px), -50%)`);
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
  raum, rahmen, setzeRahmen, bild, kinder, maxHoehe = "48vh", setzeTiefe,
}: {
  raum: Raumangaben;
  rahmen: Rahmen;
  setzeRahmen: (r: Rahmen) => void;
  /** Erlaubt, die Raumtiefe aus dem gezogenen Rahmen zu uebernehmen. */
  setzeTiefe?: (mm: number) => void;
  /** Der hochgeladene Plan. Fehlt er, wird nur der Platzhalter gezeigt. */
  bild?: string | null;
  /** Platzhalterplan, wenn keine Bilddatei vorliegt. */
  kinder?: React.ReactNode;
  /** Deckel für die Höhe, damit der Plan nicht das ganze Bild einnimmt und
      die Liste darunter unerreichbar wird. */
  maxHoehe?: string;
}) {
  const huelle = useRef<HTMLDivElement>(null);
  const waende = kuechenwaende(raum);
  // Flacher oder schmaler Rahmen: dann stehen die Schilder davor statt darin.
  const [eng, setEng] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Nur messen, nicht mehr eingreifen: die Bildgroesse entscheidet, wo
  // Schilder hinpassen und wie flach der Rahmen wirklich ist.
  useEffect(() => {
    const richte = () => {
      const kasten = huelle.current?.getBoundingClientRect();
      if (!kasten || kasten.width < 1 || kasten.height < 1) return;
      setEng(rahmen.h * kasten.height < 150 || rahmen.b * kasten.width < 210);
      setBox((alt) => (Math.abs(alt.w - kasten.width) < 1 && Math.abs(alt.h - kasten.height) < 1
        ? alt
        : { w: kasten.width, h: kasten.height }));
    };
    richte();
    // Auch wenn das Bild erst spaeter laedt oder das Fenster schmaler wird,
    // muss der Rahmen neu passen.
    const el = huelle.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const beobachter = new ResizeObserver(richte);
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, [rahmen.b, rahmen.h, rahmen.x, rahmen.y]);

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
      <div
        ref={huelle}
        className="vertieft relative mx-auto w-fit max-w-full select-none overflow-hidden rounded-[18px] bg-papier ring-1 ring-black/[0.06]"
      >
      {bild ? (
        // Beliebiger Upload, deshalb kein next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bild}
          alt="Dein hochgeladener Grundriss"
          className="block max-w-full"
          style={{ maxHeight: maxHoehe, width: "auto" }}
          draggable={false}
        />
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
        <div key={w} className="pointer-events-none absolute bg-holz/85 ring-1 ring-kohle/40" style={{ ...stueck(w, 0, 1), minWidth: 5, minHeight: 5 }} />
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
      <Schild r={r} w="haupt" t={0.5} text={`Raumbreite ${Math.round(raum.breite / 10)} cm`} aussen={eng} notfallsWeg box={box} />
      <Schild r={r} w="links" t={0.5} text={`Raumtiefe ${Math.round(raum.tiefe / 10)} cm`} aussen={eng} notfallsWeg box={box} />
      {raum.fenster && (
        <Schild
          r={r}
          w={raum.fenster.wand}
          t={anteil(raum, raum.fenster.wand, raum.fenster.von + raum.fenster.breite / 2)}
          text={`Fenster ${Math.round(raum.fenster.breite / 10)} cm`}
          ton="hell"
          versatz={34}
          nurGross
          aussen={eng}
          box={box}
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
        aussen={eng}
        box={box}
      />

      {/* Griffe zum Aufziehen */}
      <span className={`${griff} cursor-nwse-resize`} style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, touchAction: "none" }} onPointerDown={zieh("ol")} />
      <span className={`${griff} cursor-nwse-resize`} style={{ left: `${(r.x + r.b) * 100}%`, top: `${(r.y + r.h) * 100}%`, touchAction: "none" }} onPointerDown={zieh("ur")} />

      <div className="pointer-events-none absolute right-3 top-3 hidden rounded-full bg-papier/95 px-3 py-1.5 text-[11.5px] font-semibold text-kohle shadow-sm sm:block">
        Zieh den Rahmen auf deinen Küchenraum
      </div>
      </div>

      {/* Laeuft der gezogene Rahmen deutlich anders als die eingetragenen
          Masse, sagen wir es — und bieten an, die Tiefe nachzuziehen. Die
          Breite bleibt, die misst man am ehesten selbst nach. */}
      {(() => {
        if (!setzeTiefe || box.w < 1 || box.h < 1) return null;
        const gezogen = (rahmen.b * box.w) / Math.max(1, rahmen.h * box.h);
        const eingetragen = (raum.breite || 1) / (raum.tiefe || 1);
        if (!isFinite(gezogen) || gezogen <= 0) return null;
        if (Math.abs(gezogen - eingetragen) / eingetragen < 0.1) return null;
        const neueTiefe = Math.min(6000, Math.max(1500, Math.round(raum.breite / gezogen / 10) * 10));
        if (Math.abs(neueTiefe - raum.tiefe) < 50) return null;
        return (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-butter-2 bg-butter-soft px-4 py-3">
            <span className="text-[13px] leading-snug text-kohle-2">
              Der Rahmen ist {gezogen > eingetragen ? "flacher" : "tiefer"} als deine Maße
              ({Math.round(raum.breite / 10)} × {Math.round(raum.tiefe / 10)} cm).
              Zum Rahmen passen {Math.round(raum.breite / 10)} × {Math.round(neueTiefe / 10)} cm.
            </span>
            <button
              type="button"
              onClick={() => setzeTiefe(neueTiefe)}
              className="shrink-0 rounded-full bg-kohle px-3.5 py-1.5 text-[12.5px] font-semibold text-creme"
            >
              Tiefe übernehmen
            </button>
          </div>
        );
      })()}

      {/* Legende unter dem Bild statt darauf — auf dem Handy deckt sie sonst den Plan zu */}
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-kohle-2">
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-[3px] bg-holz align-middle" />
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
export function BeispielPlan({ maxHoehe = "48vh" }: { maxHoehe?: string }) {
  const wand = "stroke-kohle-3";
  return (
    <svg
      viewBox="0 0 400 300"
      className="block max-w-full bg-papier"
      style={{ height: maxHoehe, width: "auto" }}
      role="img"
      aria-label="Beispielhafter Wohnungsgrundriss"
    >
      <rect x="14" y="14" width="372" height="272" fill="none" strokeWidth="7" className={wand} />
      <path d="M170 14 V130 M170 175 V286 M170 175 H386 M250 175 V286" strokeWidth="5" className={wand} fill="none" />
      <path d="M14 95 H60 M14 95" strokeWidth="5" className={wand} fill="none" />
      {/* Fenster als doppelte dünne Linien */}
      <path d="M60 14 H140 M222 14 H320" strokeWidth="7" className="stroke-papier" fill="none" />
      <path d="M60 14 H140 M222 14 H320 M14 150 V240" strokeWidth="2" className="stroke-kohle-3" fill="none" />
      {/* Türbögen */}
      <path d="M170 130 A45 45 0 0 1 125 175" strokeWidth="1.6" strokeDasharray="4 4" className="stroke-kohle-3" fill="none" />
      <path d="M250 220 A40 40 0 0 0 290 260" strokeWidth="1.6" strokeDasharray="4 4" className="stroke-kohle-3" fill="none" />
      <text x="78" y="110" fontSize="13" fontFamily="var(--font-warm)" className="fill-kohle-3">Küche</text>
      <text x="268" y="105" fontSize="13" fontFamily="var(--font-warm)" className="fill-kohle-3">Wohnen</text>
      <text x="300" y="240" fontSize="13" fontFamily="var(--font-warm)" className="fill-kohle-3">Bad</text>
      <text x="190" y="240" fontSize="13" fontFamily="var(--font-warm)" className="fill-kohle-3">Flur</text>
    </svg>
  );
}
