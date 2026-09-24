import Link from "next/link";
import Bild from "./Bild";
import { basisUrl } from "@/daten/betrieb";

export type Krume = { name: string; weg: string };

/** Kopf einer Unterseite: Brotkrume, Label, H1, Anriss — und optional ein Bild.
 *  Header, Hero und alle folgenden Sektionen fluchten auf derselben Achse. */
export default function SeitenKopf({
  marke,
  titel,
  anriss,
  krumen = [],
  bild,
  bildAlt,
  bildVerhaeltnis = "21 / 9",
}: {
  marke: string;
  titel: string;
  anriss: string;
  krumen?: Krume[];
  bild?: string;
  bildAlt?: string;
  bildVerhaeltnis?: string;
}) {
  const schema = krumen.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [{ name: "Start", weg: "/" }, ...krumen].map((k, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: k.name,
          item: `${basisUrl}${k.weg}`,
        })),
      }
    : null;

  return (
    <header className="seitenkopf">
      {schema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ) : null}
      <div className="bahn">
        {krumen.length ? (
          <nav className="krume" aria-label="Sie sind hier">
            <Link href="/">Start</Link>
            {krumen.map((k, i) => (
              <span key={k.weg}>
                <span className="krume-trenn" aria-hidden="true">·</span>
                {i === krumen.length - 1 ? (
                  <span aria-current="page">{k.name}</span>
                ) : (
                  <Link href={k.weg}>{k.name}</Link>
                )}
              </span>
            ))}
          </nav>
        ) : null}

        <p className="marke seitenkopf-marke">{marke}</p>
        <h1 className="seitenkopf-titel">{titel}</h1>
        <div className="seitenkopf-linie">
          <p className="blei satz">{anriss}</p>
        </div>

        {bild ? (
          <div className="seitenkopf-bild">
            <Bild
              datei={bild}
              alt={bildAlt ?? ""}
              verhaeltnis={bildVerhaeltnis}
              sizes="(max-width: 767px) 92vw, 1344px"
              vorrang
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}
