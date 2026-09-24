import Niveau from "./Niveau";
import Fragen from "./Fragen";
import type { Frage } from "@/daten/faq";

/** FAQ-Abschnitt samt FAQPage-Auszeichnung. */
export default function FragenBlock({
  fragen,
  marke = "Häufige Fragen",
  titel,
  ziffer,
}: {
  fragen: readonly Frage[];
  marke?: string;
  titel: string;
  ziffer?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: fragen.map((f) => ({
      "@type": "Question",
      name: f.frage,
      acceptedAnswer: { "@type": "Answer", text: f.antwort },
    })),
  };

  return (
    <section className="takt kapitel-fragen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="bahn">
        <Niveau marke={marke} ziffer={ziffer} />
        <div className="fragen-raster">
          <h2 className="satz-eng">{titel}</h2>
          <Fragen fragen={fragen} />
        </div>
      </div>
    </section>
  );
}
