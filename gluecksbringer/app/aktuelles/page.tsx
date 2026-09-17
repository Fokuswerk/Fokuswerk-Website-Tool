import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BeitragKarte, FolgenKarte } from "@/components/beitrag-karte";
import { Kleeblatt } from "@/components/marke";
import { Reveal } from "@/components/reveal";
import { TextEin } from "@/components/text-ein";
import { Wischreihe } from "@/components/wischreihe";
import { PfeilRechts } from "@/components/ui";
import { beitraegeSortiert } from "@/content/aktuelles";

export const metadata: Metadata = {
  title: "Aktuelles",
  description:
    "Neuigkeiten der Glücksbringer am Meer e.V.: Berichte vom Wunschbaum am Meer, von unseren Aktionen und aus dem Vereinsleben in Bad Zwischenahn.",
  alternates: { canonical: "/aktuelles" },
  openGraph: {
    title: "Aktuelles | Glücksbringer am Meer e.V.",
    description: "Berichte vom Wunschbaum am Meer und aus dem Vereinsleben.",
    url: "/aktuelles",
  },
};

export default function AktuellesUebersicht() {
  const [featured, ...weitere] = beitraegeSortiert;

  return (
    <>
      <section className="shell pt-32 sm:pt-36 lg:pt-40">
        <Reveal>
          <p className="eyebrow">
            <Kleeblatt className="size-4 text-glow" />
            Aktuelles
          </p>
          <h1 className="mt-6 max-w-3xl text-h1 text-ink">
            <TextEin
              text="Was bei den Glücksbringern gerade passiert."
              verzoegerung={100}
            />
          </h1>
          <p className="mt-8 max-w-xl text-lead text-ink-70">
            Berichte von unseren Aktionen, vom Wunschbaum am Meer und aus dem
            Vereinsleben in Bad Zwischenahn.
          </p>
        </Reveal>
      </section>

      {/* Hauptbeitrag */}
      <section className="shell mt-16 sm:mt-20">
        <Reveal>
          <article className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-14">
            <Link
              href={`/aktuelles/${featured.slug}`}
              className="group block overflow-hidden rounded-2xl bg-sand-100"
            >
              <Image
                src={featured.bild}
                alt={featured.bildAlt}
                priority
                sizes="(min-width: 1024px) 58vw, 100vw"
                placeholder="blur"
                style={
                  featured.bildPosition
                    ? { objectPosition: featured.bildPosition }
                    : undefined
                }
                className="aspect-[3/2] w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-soft)] group-hover:scale-[1.03]"
              />
            </Link>

            <div>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-[0.1em] text-sea uppercase">
                <span className="rounded-full bg-glow-soft px-3 py-1 text-glow-deep">
                  Neuester Beitrag
                </span>
                <time dateTime={featured.datum} className="text-ink-50">
                  {featured.datumLabel}
                </time>
              </p>
              <h2 className="mt-5 text-h2 text-ink">
                <Link
                  href={`/aktuelles/${featured.slug}`}
                  className="transition-colors hover:text-sea"
                >
                  {featured.titel}
                </Link>
              </h2>
              <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-70">
                {featured.teaser}
              </p>
              <Link
                href={`/aktuelles/${featured.slug}`}
                className="group mt-7 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-sea transition-colors hover:text-glow"
              >
                Mehr erfahren
                <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-1" />
              </Link>
            </div>
          </article>
        </Reveal>
      </section>

      {/* Weitere Beiträge */}
      <section className="shell mt-24 sm:mt-32">
        <h2 className="border-t border-sand-200 pt-6 text-xs font-semibold tracking-[0.14em] text-sea uppercase">
          Weitere Beiträge
        </h2>

        <div className="mt-12">
          <Wischreihe label="Weitere Beiträge">
            {weitere.map((beitrag, index) => (
              <Reveal key={beitrag.slug} delay={index * 90}>
                <BeitragKarte beitrag={beitrag} />
              </Reveal>
            ))}
            <Reveal delay={weitere.length * 90}>
              <FolgenKarte />
            </Reveal>
          </Wischreihe>
        </div>
      </section>
    </>
  );
}
