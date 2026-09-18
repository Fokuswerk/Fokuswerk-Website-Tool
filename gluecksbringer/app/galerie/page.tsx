import type { Metadata } from "next";
import { Galerie } from "@/components/galerie";
import { Kleeblatt } from "@/components/marke";
import { Reveal } from "@/components/reveal";
import { TextEin } from "@/components/text-ein";
import { ButtonLink, PfeilRechts } from "@/components/ui";
import { galerieAnzahl, galerieLaden } from "@/content/laden";

/** Neue Inhalte aus der Verwaltung erscheinen spätestens nach einer Minute;
 *  beim Speichern im Verwaltungsbereich wird die Seite zusätzlich sofort erneuert. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Galerie",
  description:
    "Bilder aus über zehn Jahren Glücksbringer am Meer e.V.: vom ersten Wunschbaum 2011 über Schwimmkurse und Kürbisfest bis zum Wunschbaum am Meer 2025.",
  alternates: { canonical: "/galerie" },
  openGraph: {
    title: "Galerie | Glücksbringer am Meer e.V.",
    description:
      "Bilder aus über zehn Jahren ehrenamtlicher Arbeit in Bad Zwischenahn.",
    url: "/galerie",
  },
};

export default async function GalerieSeite() {
  const galerie = await galerieLaden();
  const galerieBilderGesamt = await galerieAnzahl(galerie);

  return (
    <>
      <section className="shell pt-32 sm:pt-36 lg:pt-40">
        <Reveal>
          <p className="eyebrow">
            <Kleeblatt className="size-4 text-glow" />
            Galerie
          </p>
          <h1 className="mt-6 max-w-3xl text-h1 text-ink">
            <TextEin
              text="Über zehn Jahre leuchtende Kinderaugen."
              verzoegerung={100}
            />
          </h1>
          <p className="mt-8 max-w-xl text-lead text-ink-70">
            {galerieBilderGesamt} Bilder aus unserer Arbeit – vom allerersten
            Wunschbaum 2011 bis heute. Zum Vergrößern anklicken.
          </p>
        </Reveal>
      </section>

      <section className="shell mt-16 sm:mt-24">
        <Galerie jahre={galerie} />
      </section>

      <section className="shell mt-28 sm:mt-36">
        <Reveal>
          <div className="flex flex-col gap-8 rounded-3xl border border-sand-200 bg-sand-50 px-6 py-12 sm:px-12 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-h2 text-ink">
                Hinter jedem Bild steht ein Kind, das sich gefreut hat.
              </h2>
              <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-70">
                Möglich wurde das alles durch Menschen, die mitgemacht haben.
              </p>
            </div>
            <ButtonLink href="/unterstuetzen" className="group shrink-0">
              Jetzt unterstützen
              <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
