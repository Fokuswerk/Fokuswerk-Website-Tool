"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Auf dem Smartphone eine wischbare Reihe, ab Tablet ein normales Raster.
 *
 * Das Wischen übernimmt der Browser selbst (scroll-snap) – das läuft flüssiger
 * als jede Nachbildung in JavaScript. Ausgewertet wird nur die Position, um
 * die Punkte darunter mitzuführen.
 */
export function Wischreihe({
  children,
  raster = "sm:grid-cols-2 lg:grid-cols-3",
  label,
}: {
  children: ReactNode;
  /** Rasterklassen ab Tablet, z. B. "sm:grid-cols-2 lg:grid-cols-3". */
  raster?: string;
  /** Beschreibung für Screenreader, z. B. "Beiträge". */
  label: string;
}) {
  const anzahl = Children.count(children);
  const reihe = useRef<HTMLDivElement>(null);
  const [aktiv, setAktiv] = useState(0);
  const [wischbar, setWischbar] = useState(false);

  useEffect(() => {
    const element = reihe.current;
    if (!element) return;

    let angefordert = 0;

    const messen = () => {
      // Nur solange die Reihe tatsächlich waagerecht scrollt (Smartphone).
      setWischbar(element.scrollWidth > element.clientWidth + 4);
      const erstes = element.firstElementChild as HTMLElement | null;
      if (!erstes) return;
      const schritt = erstes.offsetWidth + 16;
      setAktiv(Math.round(element.scrollLeft / schritt));
    };

    const beiScroll = () => {
      cancelAnimationFrame(angefordert);
      angefordert = requestAnimationFrame(messen);
    };

    messen();
    element.addEventListener("scroll", beiScroll, { passive: true });
    window.addEventListener("resize", beiScroll, { passive: true });

    return () => {
      cancelAnimationFrame(angefordert);
      element.removeEventListener("scroll", beiScroll);
      window.removeEventListener("resize", beiScroll);
    };
  }, [anzahl]);

  function springen(index: number) {
    const element = reihe.current;
    const erstes = element?.firstElementChild as HTMLElement | null;
    if (!element || !erstes) return;
    element.scrollTo({
      left: index * (erstes.offsetWidth + 16),
      behavior: "smooth",
    });
  }

  return (
    <div>
      <div
        ref={reihe}
        className={`wischreihe ${raster}`}
        role={wischbar ? "group" : undefined}
        aria-label={wischbar ? `${label} – waagerecht wischbar` : undefined}
      >
        {children}
      </div>

      {wischbar && anzahl > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-2 sm:hidden">
          {Array.from({ length: anzahl }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => springen(index)}
              aria-label={`Zu Eintrag ${index + 1} von ${anzahl}`}
              aria-current={index === aktiv ? "true" : undefined}
              className="p-2"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-500 ease-[var(--ease-soft)] ${
                  index === aktiv ? "w-6 bg-glow" : "w-1.5 bg-sand-300"
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
