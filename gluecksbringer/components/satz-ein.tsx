"use client";

import { Fragment, useEffect, useRef, useState } from "react";

/**
 * Lässt einen Satz Wort für Wort einlaufen – anders als `TextEin` aber erst,
 * wenn er beim Scrollen ins Bild kommt. Für die großen Aussagen mitten auf der
 * Seite, die man sonst schon fertig vorfindet, bevor man dort ankommt.
 *
 * Zwischen den Wörtern steht ein gewöhnliches Leerzeichen als eigener
 * Textknoten – nur so darf die Zeile dort umbrechen und der Text bleibt
 * unverändert kopierbar.
 */
export function SatzEin({
  text,
  verzoegerung = 0,
  schritt = 70,
  className = "",
}: {
  text: string;
  /** Startverzögerung in Millisekunden. */
  verzoegerung?: number;
  /** Abstand zwischen zwei Wörtern in Millisekunden. */
  schritt?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setSichtbar(true);
      return;
    }

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const eintrag of eintraege) {
          if (eintrag.isIntersecting) {
            setSichtbar(true);
            beobachter.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -14% 0px", threshold: 0.2 },
    );

    beobachter.observe(element);
    return () => beobachter.disconnect();
  }, []);

  const woerter = text.split(" ");

  return (
    <span ref={ref} data-visible={sichtbar} className={className}>
      {woerter.map((wort, index) => (
        <Fragment key={`${wort}-${index}`}>
          <span
            className="satz-wort"
            style={{
              ["--wort-verzoegerung" as string]: `${verzoegerung + index * schritt}ms`,
            }}
          >
            {wort}
          </span>
          {index < woerter.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
