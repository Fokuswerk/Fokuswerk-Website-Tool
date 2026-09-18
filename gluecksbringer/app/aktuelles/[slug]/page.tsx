import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeitragKarte } from "@/components/beitrag-karte";
import { Reveal } from "@/components/reveal";
import { Wischreihe } from "@/components/wischreihe";
import { Spendenkonto } from "@/components/spendenkonto";
import { ButtonLink, PfeilRechts } from "@/components/ui";
import {
  beitraegeSortiert,
  beitragNachSlug,
  type Block,
} from "@/content/aktuelles";
import { siteUrl, verein } from "@/content/verein";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return beitraegeSortiert.map((beitrag) => ({ slug: beitrag.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const beitrag = beitragNachSlug(slug);

  if (!beitrag) return { title: "Beitrag nicht gefunden" };

  return {
    title: beitrag.titel,
    description: beitrag.teaser,
    alternates: { canonical: `/aktuelles/${beitrag.slug}` },
    openGraph: {
      type: "article",
      title: beitrag.titel,
      description: beitrag.teaser,
      url: `/aktuelles/${beitrag.slug}`,
      publishedTime: beitrag.datum,
      images: [{ url: beitrag.bild.src, alt: beitrag.bildAlt }],
    },
  };
}

function BlockAusgabe({ block }: { block: Block }) {
  switch (block.typ) {
    case "ueberschrift":
      return <h2 className="mt-14 text-h3 text-ink">{block.text}</h2>;

    case "absatz":
      return (
        <p className="mt-6 text-[1.0625rem] leading-[1.75] text-ink-70">
          {block.text}
        </p>
      );

    case "liste":
      return (
        <ul className="mt-6 space-y-2.5">
          {block.punkte.map((punkt) => (
            <li
              key={punkt}
              className="relative pl-6 text-[1.0625rem] leading-[1.75] text-ink-70"
            >
              <span className="absolute top-[0.7em] left-0 size-1.5 rounded-full bg-glow" />
              {punkt}
            </li>
          ))}
        </ul>
      );

    case "schritte":
      return (
        <ol className="mt-8 space-y-px overflow-hidden rounded-2xl border border-sand-200 bg-sand-200">
          {block.eintraege.map((eintrag) => (
            <li key={eintrag.zeit} className="bg-paper p-6 sm:p-7">
              <p className="text-xs font-semibold tracking-[0.1em] text-sea uppercase">
                {eintrag.zeit}
              </p>
              <p className="mt-3 text-[1rem] leading-relaxed text-ink-70">
                {eintrag.text}
              </p>
            </li>
          ))}
        </ol>
      );

    case "hinweis":
      return (
        <p className="mt-8 border-l-2 border-glow bg-glow-soft/50 py-5 pr-5 pl-6 text-[1.0625rem] leading-relaxed font-medium text-ink">
          {block.text}
        </p>
      );

    case "spendenkonto":
      return (
        <div className="mt-10">
          <Spendenkonto verwendungszweck={block.verwendungszweck} />
        </div>
      );

    case "bild": {
      // Kleine Vorlagen – etwa gezeichnete Logos – werden nie hochskaliert,
      // sondern mittig auf der Fläche gezeigt. Sonst werden sie unscharf.
      const klein = block.bild.width < 640;
      return (
        <figure className="mt-10">
          <div
            className={`overflow-hidden rounded-2xl bg-sand-100 ${
              klein ? "flex justify-center px-6 py-8 sm:py-12" : ""
            }`}
          >
            <Image
              src={block.bild}
              alt={block.alt}
              sizes="(min-width: 768px) 46rem, 92vw"
              placeholder="blur"
              style={klein ? { maxWidth: block.bild.width } : undefined}
              className={klein ? "h-auto w-full" : "w-full"}
            />
          </div>
          {block.unterschrift ? (
            <figcaption className="mt-3 text-sm text-ink-50">
              {block.unterschrift}
            </figcaption>
          ) : null}
        </figure>
      );
    }
  }
}

export default async function BeitragSeite({ params }: Props) {
  const { slug } = await params;
  const beitrag = beitragNachSlug(slug);

  if (!beitrag) notFound();

  const weitere = beitraegeSortiert.filter(
    (eintrag) => eintrag.slug !== beitrag.slug,
  );

  const artikelSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: beitrag.titel,
    description: beitrag.teaser,
    datePublished: beitrag.datum,
    image: `${siteUrl}${beitrag.bild.src}`,
    author: { "@type": "Organization", name: verein.name },
    publisher: { "@type": "Organization", name: verein.name },
    mainEntityOfPage: `${siteUrl}/aktuelles/${beitrag.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(artikelSchema) }}
      />

      <article>
        <header className="shell-narrow pt-32 sm:pt-36 lg:pt-40">
          <Link
            href="/aktuelles"
            className="group inline-flex items-center gap-2 text-[0.875rem] font-semibold text-sea transition-colors hover:text-glow"
          >
            <PfeilRechts className="rotate-180 transition-transform duration-300 ease-[var(--ease-soft)] group-hover:-translate-x-1" />
            Alle Beiträge
          </Link>

          <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-[0.1em] text-sea uppercase">
            <span>{beitrag.kategorie}</span>
            <span aria-hidden="true" className="h-px w-5 bg-sand-300" />
            <time dateTime={beitrag.datum} className="text-ink-50">
              {beitrag.datumLabel}
            </time>
          </p>

          <h1 className="mt-5 text-h1 text-ink">{beitrag.titel}</h1>
          <p className="mt-7 text-lead text-ink-70">{beitrag.teaser}</p>
        </header>

        <figure className="shell-narrow mt-12">
          <div className="overflow-hidden rounded-2xl bg-sand-100">
            <Image
              src={beitrag.bild}
              alt={beitrag.bildAlt}
              priority
              sizes="(min-width: 768px) 46rem, 92vw"
              placeholder="blur"
              className="bild-ein w-full"
            />
          </div>
        </figure>

        <div className="shell-narrow mt-12 sm:mt-16">
          {beitrag.inhalt.map((block, index) => (
            <BlockAusgabe key={index} block={block} />
          ))}
        </div>

        <div className="shell-narrow mt-16">
          <div className="flex flex-col gap-6 rounded-2xl border border-sand-200 bg-sand-50 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <p className="max-w-md text-[1.0625rem] leading-relaxed text-ink">
              Möchten Sie unsere Arbeit unterstützen? Jede Spende kommt bei
              Kindern in Bad&nbsp;Zwischenahn an.
            </p>
            <ButtonLink href="/unterstuetzen" className="group shrink-0">
              Jetzt unterstützen
              <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </article>

      {weitere.length > 0 ? (
        <section className="shell mt-28 sm:mt-36">
          <h2 className="border-t border-sand-200 pt-6 text-xs font-semibold tracking-[0.14em] text-sea uppercase">
            Weitere Beiträge
          </h2>
          <div className="mt-12">
            <Wischreihe label="Weitere Beiträge" raster="sm:grid-cols-2">
              {weitere.map((eintrag, index) => (
                <Reveal key={eintrag.slug} delay={index * 90}>
                  <BeitragKarte beitrag={eintrag} />
                </Reveal>
              ))}
            </Wischreihe>
          </div>
        </section>
      ) : null}
    </>
  );
}
