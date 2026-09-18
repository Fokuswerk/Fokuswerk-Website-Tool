"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GalerieJahr } from "@/content/galerie";

type Flach = {
  bild: GalerieJahr["bilder"][number]["bild"];
  alt: string;
  unterschrift?: string;
  jahr: string;
};

/** Ab wie viel Prozent der Breite ein Wisch als Blättern zählt. */
const SCHWELLE_ANTEIL = 0.2;
/** Ab welchem Tempo (px pro Millisekunde) auch ein kurzer Wisch reicht. */
const SCHWELLE_TEMPO = 0.4;
/** Wie weit nach unten gezogen werden muss, um die Ansicht zu schließen. */
const SCHLIESS_WEG = 120;

type Geste = {
  startX: number;
  startY: number;
  startZeit: number;
  letzteX: number;
  letzteZeit: number;
  tempo: number;
  achse: "offen" | "waagerecht" | "senkrecht";
  id: number;
};

export function Galerie({ jahre }: { jahre: GalerieJahr[] }) {
  const alle: Flach[] = jahre.flatMap((jahr) =>
    jahr.bilder.map((eintrag) => ({ ...eintrag, jahr: jahr.jahr })),
  );

  const [aktiv, setAktiv] = useState<number | null>(null);
  const [imBrowser, setImBrowser] = useState(false);
  const [ruhig, setRuhig] = useState(false);

  /** Verschiebung während der Geste bzw. während der Blätter-Animation. */
  const [zug, setZug] = useState({ x: 0, y: 0 });
  const [animiert, setAnimiert] = useState(false);
  const [schliesst, setSchliesst] = useState(false);

  const geste = useRef<Geste | null>(null);
  const zielRichtung = useRef(0);
  const buehne = useRef<HTMLDivElement>(null);
  const vorherigerFokus = useRef<HTMLElement | null>(null);
  const schliessenRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setImBrowser(true);
    const abfrage = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setzen = () => setRuhig(abfrage.matches);
    setzen();
    abfrage.addEventListener("change", setzen);
    return () => abfrage.removeEventListener("change", setzen);
  }, []);

  const oeffnen = useCallback((index: number) => {
    vorherigerFokus.current = document.activeElement as HTMLElement | null;
    zielRichtung.current = 0;
    setZug({ x: 0, y: 0 });
    setAnimiert(false);
    setSchliesst(false);
    setAktiv(index);
  }, []);

  const schliessen = useCallback(() => {
    setAktiv(null);
    setSchliesst(false);
    setZug({ x: 0, y: 0 });
    geste.current = null;
    vorherigerFokus.current?.focus();
  }, []);

  /** Blättert mit einer gleitenden Bewegung zum nächsten oder vorherigen Bild. */
  const blaettern = useCallback(
    (richtung: 1 | -1) => {
      if (zielRichtung.current !== 0) return;

      if (ruhig) {
        setAktiv((index) =>
          index === null
            ? index
            : (index + richtung + alle.length) % alle.length,
        );
        return;
      }

      const breite = buehne.current?.clientWidth ?? window.innerWidth;
      zielRichtung.current = richtung;
      setAnimiert(true);
      setZug({ x: -richtung * breite, y: 0 });
    },
    [alle.length, ruhig],
  );

  /** Nach der Blätter-Animation den Index übernehmen und ohne Sprung zurücksetzen. */
  const animationFertig = useCallback(() => {
    const richtung = zielRichtung.current;
    if (richtung === 0) {
      setAnimiert(false);
      return;
    }
    zielRichtung.current = 0;
    setAktiv((index) =>
      index === null ? index : (index + richtung + alle.length) % alle.length,
    );
    setAnimiert(false);
    setZug({ x: 0, y: 0 });
  }, [alle.length]);

  // Tastatur, Scroll-Sperre und Fokus
  useEffect(() => {
    if (aktiv === null) return;

    const vorher = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    schliessenRef.current?.focus();

    const beiTaste = (event: KeyboardEvent) => {
      if (event.key === "Escape") schliessen();
      if (event.key === "ArrowRight") blaettern(1);
      if (event.key === "ArrowLeft") blaettern(-1);
    };

    window.addEventListener("keydown", beiTaste);
    return () => {
      document.body.style.overflow = vorher;
      window.removeEventListener("keydown", beiTaste);
    };
  }, [aktiv, blaettern, schliessen]);

  // --- Zeigergesten (Finger, Stift und Maus) -------------------------------

  function gesteStart(event: React.PointerEvent) {
    if (animiert || zielRichtung.current !== 0) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    geste.current = {
      startX: event.clientX,
      startY: event.clientY,
      startZeit: event.timeStamp,
      letzteX: event.clientX,
      letzteZeit: event.timeStamp,
      tempo: 0,
      achse: "offen",
      id: event.pointerId,
    };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function gesteBewegung(event: React.PointerEvent) {
    const g = geste.current;
    if (!g || g.id !== event.pointerId) return;

    const dx = event.clientX - g.startX;
    const dy = event.clientY - g.startY;

    if (g.achse === "offen") {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      g.achse = Math.abs(dx) > Math.abs(dy) ? "waagerecht" : "senkrecht";
    }

    const zeitDelta = event.timeStamp - g.letzteZeit;
    if (zeitDelta > 0) {
      g.tempo = (event.clientX - g.letzteX) / zeitDelta;
      g.letzteX = event.clientX;
      g.letzteZeit = event.timeStamp;
    }

    if (g.achse === "waagerecht") {
      setZug({ x: dx, y: 0 });
    } else {
      // Nach oben ziehen federt zurück, nach unten schließt die Ansicht.
      setZug({ x: 0, y: dy > 0 ? dy : dy * 0.25 });
    }
  }

  function gesteEnde(event: React.PointerEvent) {
    const g = geste.current;
    if (!g || g.id !== event.pointerId) return;
    geste.current = null;

    const dx = event.clientX - g.startX;
    const dy = event.clientY - g.startY;
    const breite = buehne.current?.clientWidth ?? window.innerWidth;

    if (g.achse === "waagerecht") {
      const weitGenug = Math.abs(dx) > breite * SCHWELLE_ANTEIL;
      const schnellGenug = Math.abs(g.tempo) > SCHWELLE_TEMPO;

      if (weitGenug || schnellGenug) {
        blaettern(dx < 0 ? 1 : -1);
        return;
      }
    }

    if (g.achse === "senkrecht" && dy > SCHLIESS_WEG) {
      setSchliesst(true);
      setAnimiert(true);
      setZug({ x: 0, y: window.innerHeight * 0.5 });
      window.setTimeout(schliessen, ruhig ? 0 : 280);
      return;
    }

    // Nicht weit genug: zurückfedern
    setAnimiert(true);
    setZug({ x: 0, y: 0 });
  }

  const aktuell = aktiv === null ? null : alle[aktiv];
  const vorheriges =
    aktiv === null ? null : alle[(aktiv - 1 + alle.length) % alle.length];
  const naechstes = aktiv === null ? null : alle[(aktiv + 1) % alle.length];

  const zieht = geste.current !== null;
  const verblassen = schliesst ? 0 : Math.max(0, 1 - Math.max(0, zug.y) / 420);

  let laufenderIndex = 0;

  return (
    <>
      <div className="space-y-24 sm:space-y-32">
        {jahre.map((jahr) => (
          <section
            key={jahr.jahr}
            aria-labelledby={`jahr-${jahr.jahr.replace(/\s|\//g, "")}`}
          >
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b border-sand-200 pb-5 sm:mb-12">
              <h2
                id={`jahr-${jahr.jahr.replace(/\s|\//g, "")}`}
                className="text-h2 text-ink tabular-nums"
              >
                {jahr.jahr}
              </h2>
              {jahr.einleitung ? (
                <p className="max-w-md text-[0.9375rem] text-ink-70">
                  {jahr.einleitung}
                </p>
              ) : null}
            </div>

            <div
              className={
                jahr.bilder.length === 1
                  ? "sm:max-w-xl"
                  : jahr.bilder.length === 2
                    ? "bildraster bildraster-zwei"
                    : "bildraster"
              }
            >
              {jahr.bilder.map((eintrag) => {
                const index = laufenderIndex++;
                return (
                  <figure key={eintrag.bild.src} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => oeffnen(index)}
                      className={`group block w-full overflow-hidden rounded-xl ${
                        eintrag.einpassen
                          ? "flex items-center justify-center bg-sand-50 p-4"
                          : "bg-sand-100"
                      }`}
                    >
                      <Image
                        src={eintrag.bild}
                        alt={eintrag.alt}
                        // Das erste Bild steht im sichtbaren Bereich und wird vorgeladen.
                        priority={index === 0}
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                        placeholder="blur"
                        // Gezeichnete Vorlagen nie über ihre Originalgröße ziehen.
                        style={
                          eintrag.einpassen
                            ? { maxWidth: eintrag.bild.width }
                            : undefined
                        }
                        className={`transition-transform duration-[900ms] ease-[var(--ease-soft)] group-hover:scale-[1.035] ${
                          eintrag.einpassen
                            ? "aspect-[4/3] w-full object-contain"
                            : "aspect-[4/3] w-full object-cover"
                        }`}
                      />
                    </button>
                    {eintrag.unterschrift ? (
                      <figcaption className="mt-3 text-sm leading-relaxed text-ink-70">
                        {eintrag.unterschrift}
                      </figcaption>
                    ) : null}
                  </figure>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {aktuell && imBrowser
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Bild ${(aktiv ?? 0) + 1} von ${alle.length}: ${aktuell.alt}`}
              className="fixed inset-0 z-[100] flex touch-none flex-col select-none"
              onClick={(event) => {
                if (event.target === event.currentTarget) schliessen();
              }}
            >
              {/* Eigener Hintergrund statt Pseudo-Element: verlässlich in allen
                  Browsern und beim Herunterziehen sauber ausblendbar. */}
              <div
                aria-hidden="true"
                className={`absolute inset-0 bg-ink ${ruhig ? "" : "hintergrund-ein"}`}
                style={{
                  opacity: verblassen,
                  transition: zieht ? "none" : "opacity 0.3s linear",
                }}
              />
              {/* Kopfzeile */}
              <div className="relative z-10 flex items-center justify-between gap-4 px-4 py-4 text-paper sm:px-6">
                <p className="text-xs font-medium tracking-[0.12em] text-paper/70 uppercase tabular-nums">
                  {aktuell.jahr} · {(aktiv ?? 0) + 1} / {alle.length}
                </p>
                <button
                  ref={schliessenRef}
                  type="button"
                  onClick={schliessen}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-paper/25 transition-colors hover:bg-paper/10"
                >
                  <span className="sr-only">Ansicht schließen</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="size-5"
                  >
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Bühne mit drei Plätzen: vorheriges, aktuelles, nächstes Bild */}
              <div
                ref={buehne}
                className="relative z-10 flex min-h-0 flex-1 items-center overflow-hidden"
                onPointerDown={gesteStart}
                onPointerMove={gesteBewegung}
                onPointerUp={gesteEnde}
                onPointerCancel={gesteEnde}
              >
                <div
                  className="flex h-full w-full will-change-transform"
                  onTransitionEnd={(event) => {
                    if (event.propertyName === "transform") animationFertig();
                  }}
                  style={{
                    transform: `translate3d(calc(-100% + ${zug.x}px), ${zug.y}px, 0) scale(${
                      zug.y > 0 ? Math.max(0.82, 1 - zug.y / 1600) : 1
                    })`,
                    transition:
                      animiert && !ruhig
                        ? "transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1)"
                        : "none",
                  }}
                >
                  {[vorheriges, aktuell, naechstes].map((eintrag, platz) => (
                    <div
                      key={`${platz}-${eintrag?.bild.src}`}
                      className="flex h-full w-full shrink-0 items-center justify-center px-3 sm:px-20"
                      aria-hidden={platz !== 1}
                    >
                      {eintrag ? (
                        <Image
                          src={eintrag.bild}
                          alt={platz === 1 ? eintrag.alt : ""}
                          sizes="100vw"
                          placeholder="blur"
                          draggable={false}
                          style={{ maxWidth: eintrag.bild.width }}
                          className="pointer-events-none max-h-full w-auto rounded-sm object-contain"
                        />
                      ) : null}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => blaettern(-1)}
                  className="pfeil absolute left-3 hidden size-12 items-center justify-center rounded-full border border-paper/25 text-paper backdrop-blur-sm transition-[background-color,transform] duration-300 ease-[var(--ease-soft)] hover:-translate-x-0.5 hover:bg-paper/10 sm:inline-flex"
                >
                  <span className="sr-only">Vorheriges Bild</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="size-5"
                  >
                    <path
                      d="M15 5l-7 7 7 7"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => blaettern(1)}
                  className="pfeil absolute right-3 hidden size-12 items-center justify-center rounded-full border border-paper/25 text-paper backdrop-blur-sm transition-[background-color,transform] duration-300 ease-[var(--ease-soft)] hover:translate-x-0.5 hover:bg-paper/10 sm:inline-flex"
                >
                  <span className="sr-only">Nächstes Bild</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="size-5"
                  >
                    <path
                      d="M9 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Bildunterschrift und Fortschritt */}
              <div className="relative z-10 px-5 pt-5 pb-7 text-center sm:px-10">
                <p
                  key={aktuell.bild.src}
                  className={ruhig ? "" : "unterschrift-ein"}
                  style={{ margin: "0 auto", maxWidth: "42rem" }}
                >
                  <span className="text-sm leading-relaxed text-paper/85">
                    {aktuell.unterschrift ?? aktuell.alt}
                  </span>
                </p>

                <div
                  aria-hidden="true"
                  className="mx-auto mt-5 h-px w-40 overflow-hidden rounded-full bg-paper/20"
                >
                  <span
                    className="block h-full bg-paper/70 transition-[width] duration-500 ease-[var(--ease-soft)]"
                    style={{
                      width: `${(((aktiv ?? 0) + 1) / alle.length) * 100}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-paper/55 sm:hidden">
                  {zieht
                    ? "Loslassen zum Blättern"
                    : "Wischen zum Blättern · nach unten zum Schließen"}
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
