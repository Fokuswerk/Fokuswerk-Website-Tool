type Props = {
  name: string;
  breiten: number[];
  /**
   * Die zu den Breiten gehoerenden Hoehen. Ohne width und height am img
   * springt das Layout beim Nachladen - der Browser kennt das Seitenverhaeltnis
   * sonst erst, wenn die Datei da ist.
   */
  hoehe?: number[];
  alt: string;
  sizes: string;
  className?: string;
  prioritaet?: boolean;
};

/** AVIF mit WebP als Rückfall, feste Seitenverhältnisse über width/height. */
export default function Bild({ name, breiten, hoehe, alt, sizes, className, prioritaet }: Props) {
  const satz = (endung: string) =>
    breiten.map((b) => `/bilder/${name}-${b}.${endung} ${b}w`).join(", ");
  const letzte = breiten.length - 1;
  return (
    <picture>
      <source type="image/avif" srcSet={satz("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={satz("webp")} sizes={sizes} />
      <img
        src={`/bilder/${name}-${breiten[letzte]}.webp`}
        width={breiten[letzte]}
        height={hoehe?.[letzte]}
        alt={alt}
        className={className}
        loading={prioritaet ? "eager" : "lazy"}
        decoding={prioritaet ? "sync" : "async"}
        fetchPriority={prioritaet ? "high" : "auto"}
      />
    </picture>
  );
}
