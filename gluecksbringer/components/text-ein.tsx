import { Fragment } from "react";

/**
 * Lässt eine Überschrift Wort für Wort einlaufen.
 *
 * Wird nur für die jeweils erste Überschrift einer Seite verwendet – sie steht
 * im sichtbaren Bereich, die Bewegung läuft also direkt beim Öffnen.
 *
 * Zwischen den Wörtern steht ein gewöhnliches Leerzeichen als eigener
 * Textknoten. Nur so darf die Zeile an dieser Stelle umbrechen, und beim
 * Kopieren des Textes entstehen keine Sonderzeichen.
 */
export function TextEin({
  text,
  verzoegerung = 0,
  schritt = 55,
  className = "",
}: {
  text: string;
  /** Startverzögerung in Millisekunden. */
  verzoegerung?: number;
  /** Abstand zwischen zwei Wörtern in Millisekunden. */
  schritt?: number;
  className?: string;
}) {
  const woerter = text.split(" ");

  return (
    <span className={className}>
      {woerter.map((wort, index) => (
        <Fragment key={`${wort}-${index}`}>
          <span
            className="wort"
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
