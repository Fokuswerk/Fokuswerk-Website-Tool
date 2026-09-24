import Image from "next/image";

/**
 * Bildfläche mit festem Seitenverhältnis. Die Quelldateien stammen von
 * brouwer-gmbh.de und aus dem Instagram-Auftritt des Betriebs und sind in
 * der Auflösung begrenzt — deshalb werden sie bewusst gefasst gezeigt und
 * nie über ihre native Breite hinaus skaliert.
 */
export default function Bild({
  datei,
  alt,
  verhaeltnis = "4 / 3",
  sizes = "(max-width: 767px) 92vw, 33vw",
  breite,
  hoehe,
  vorrang = false,
  klasse = "",
}: {
  datei: string;
  alt: string;
  verhaeltnis?: string;
  sizes?: string;
  breite?: number;
  hoehe?: number;
  vorrang?: boolean;
  klasse?: string;
}) {
  return (
    <div className={`flaeche ${klasse}`.trim()} style={{ aspectRatio: verhaeltnis }}>
      <Image
        src={`/bilder/${datei}`}
        alt={alt}
        fill={!breite}
        width={breite}
        height={hoehe}
        sizes={sizes}
        priority={vorrang}
        quality={88}
      />
    </div>
  );
}
