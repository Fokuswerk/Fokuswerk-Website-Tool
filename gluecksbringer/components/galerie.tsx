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

export function Galerie({ jahre }: { jahre: GalerieJahr[] }) {
  const alle: Flach[] = jahre.flatMap((jahr) =>
    jahr.bilder.map((eintrag) => ({ ...eintrag, jahr: jahr.jahr })),
  );

  const [aktiv, setAktiv] = useState<number | null>(null);
  const [imBrowser, setImBrowser] = useState(false);

  useEffect(() => setImBrowser(true), []);
  const vorherigerFokus = useRef<HTMLElement | null>(null);
  const schliessenRef = useRef<HTMLButtonElement>(null);
  const beruehrung = useRef<{ x: number; y: number } | null>(null);

  const oeffnen = useCallback((index: number) => {
    vorherigerFokus.current = document.activeElement as HTMLElement | null;
    setAktiv(index);
  }, []);

  const schliessen = useCallback(() => {
    setAktiv(null);
    vorherigerFokus.current?.focus();
  }, []);

  const blaettern = useCallback(
    (richtung: 1 | -1) => {
      setAktiv((index) => {
        if (index === null) return index;
        return (index + richtung + alle.length) % alle.length;
      });
    },
    [alle.length],
  );

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

  const aktuell = aktiv === null ? null : alle[aktiv];
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
                    ? "masonry masonry-zwei"
                    : "masonry"
              }
            >
              {jahr.bilder.map((eintrag) => {
                const index = laufenderIndex++;
                return (
                  <figure key={eintrag.bild.src}>
                    <button
                      type="button"
                      onClick={() => oeffnen(index)}
                      className="group block w-full overflow-hidden rounded-xl bg-sand-100"
                    >
                      <Image
                        src={eintrag.bild}
                        alt={eintrag.alt}
                        // Das erste Bild steht im sichtbaren Bereich und wird vorgeladen.
                        priority={index === 0}
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                        placeholder="blur"
                        className="h-auto w-full transition-transform duration-[900ms] ease-[var(--ease-soft)] group-hover:scale-[1.035]"
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
              className="fixed inset-0 z-[100] flex flex-col bg-ink/96 backdrop-blur-sm"
              onClick={(event) => {
                if (event.target === event.currentTarget) schliessen();
              }}
              onTouchStart={(event) => {
                const punkt = event.changedTouches[0];
                beruehrung.current = { x: punkt.clientX, y: punkt.clientY };
              }}
              onTouchEnd={(event) => {
                const start = beruehrung.current;
                if (!start) return;
                const punkt = event.changedTouches[0];
                const dx = punkt.clientX - start.x;
                const dy = punkt.clientY - start.y;
                if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
                  blaettern(dx < 0 ? 1 : -1);
                }
                beruehrung.current = null;
              }}
            >
              <div className="flex items-center justify-between gap-4 px-4 py-4 text-paper sm:px-6">
                <p className="text-xs font-medium tracking-[0.12em] text-paper/60 uppercase tabular-nums">
                  {aktuell.jahr} · {(aktiv ?? 0) + 1} / {alle.length}
                </p>
                <button
                  ref={schliessenRef}
                  type="button"
                  onClick={schliessen}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-paper/20 transition-colors hover:bg-paper/10"
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

              <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
                <Image
                  key={aktuell.bild.src}
                  src={aktuell.bild}
                  alt={aktuell.alt}
                  sizes="100vw"
                  placeholder="blur"
                  className="max-h-full w-auto max-w-full object-contain"
                />

                <button
                  type="button"
                  onClick={() => blaettern(-1)}
                  className="absolute left-2 hidden size-12 items-center justify-center rounded-full border border-paper/20 text-paper transition-colors hover:bg-paper/10 sm:inline-flex"
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
                  className="absolute right-2 hidden size-12 items-center justify-center rounded-full border border-paper/20 text-paper transition-colors hover:bg-paper/10 sm:inline-flex"
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

              <div className="px-5 pt-5 pb-8 text-center sm:px-10">
                <p className="mx-auto max-w-2xl text-sm leading-relaxed text-paper/80">
                  {aktuell.unterschrift ?? aktuell.alt}
                </p>
                <p className="mt-3 text-xs text-paper/45 sm:hidden">
                  Zum Blättern wischen
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
