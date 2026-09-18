/**
 * Puck, das Maskottchen des Vereins.
 *
 * Die Figur begleitet den Wunschbaum seit 2011 – auf den Wunschkarten, den
 * Plakaten und dem ersten Weihnachtslogo. Sie liegt als Vektor vor (aus der
 * Originalzeichnung nachgezeichnet) und bleibt dadurch bei jeder Größe scharf,
 * von 24 Pixeln in der Kopfleiste bis zur halben Bildschirmhöhe.
 *
 * `figur`  – die ganze Puck, für Stellen, an denen sie als Person auftritt
 * `kopf`   – nur der Kopf, für kleine Marken und Anschnitte
 */

type Variante = "figur" | "kopf";

const QUELLE: Record<Variante, { pfad: string; breite: number; hoehe: number }> = {
  figur: { pfad: "/puck.svg", breite: 1404, hoehe: 2700 },
  kopf: { pfad: "/puck-kopf.svg", breite: 1368, hoehe: 966 },
};

export function Puck({
  variante = "figur",
  className = "",
  wippt = false,
  alt = "",
}: {
  variante?: Variante;
  className?: string;
  /** Leises Wippen, sobald die Figur als Person auftritt. */
  wippt?: boolean;
  /** Leer lassen, wenn Puck nur schmückt – dann bleibt sie für Vorleseprogramme stumm. */
  alt?: string;
}) {
  const { pfad, breite, hoehe } = QUELLE[variante];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Vektor, kein Raster: next/image würde ihn nur größer machen.
    <img
      src={pfad}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={breite}
      height={hoehe}
      loading="lazy"
      decoding="async"
      className={`${wippt ? "puck" : ""} ${className}`}
    />
  );
}
