import type { Metadata } from "next";
import Image from "next/image";
import { Kleeblatt } from "@/components/marke";
import { Reveal } from "@/components/reveal";
import {
  Abschnittsmarke,
  ButtonLink,
  PfeilRechts,
  Trennlinie,
} from "@/components/ui";
import { bilder } from "@/content/bilder";
import { meilensteine, projekte } from "@/content/projekte";
import { team, verein } from "@/content/verein";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Glücksbringer am Meer e.V.: ein gemeinnütziger Verein in Bad Zwischenahn, entstanden 2011 aus der Initiative von sechs Müttern. Wer wir sind und wofür wir arbeiten.",
  alternates: { canonical: "/ueber-uns" },
  openGraph: {
    title: "Über uns | Glücksbringer am Meer e.V.",
    description:
      "Ein gemeinnütziger Verein in Bad Zwischenahn – seit 2011 ehrenamtlich für Kinder in unserer Gemeinde.",
    url: "/ueber-uns",
  },
};

const werte = [
  {
    titel: "Ehrenamtlich",
    text: "Bei uns arbeiten alle freiwillig und unbezahlt. Was wir tun, tun wir neben Beruf und Familie – weil wir es für richtig halten.",
  },
  {
    titel: "In unserer Gemeinde",
    text: "Wir helfen dort, wo wir selbst leben: bei Kindern und Familien in Bad Zwischenahn. Kurze Wege, bekannte Gesichter, unmittelbare Wirkung.",
  },
  {
    titel: "Allein durch Spenden",
    text: "Wir erhalten keine öffentlichen Fördermittel. Jede Aktion entsteht, weil Menschen aus der Region mitmachen.",
  },
];

export default function UeberUns() {
  return (
    <>
      <section className="shell pt-32 sm:pt-36 lg:pt-40">
        <Reveal>
          <p className="eyebrow">
            <Kleeblatt className="size-4 text-glow" />
            Über uns
          </p>
          <h1 className="mt-6 max-w-4xl text-h1 text-ink">
            Aus einer Idee von sechs Müttern ist ein Verein geworden.
          </h1>
        </Reveal>

        <Reveal delay={80}>
          <p className="mt-8 max-w-2xl text-lead text-ink-70">
            Wir sind ein gemeinnütziger Verein in Bad Zwischenahn und setzen uns
            seit 2011 für wirtschaftlich benachteiligte Kinder in unserer
            Gemeinde ein.
          </p>
        </Reveal>
      </section>

      <Reveal delay={120}>
        <figure className="mt-14 sm:mt-20">
          <Image
            src={bilder.vereinTeam}
            alt="Sieben Frauen des Vereins Glücksbringer am Meer stehen lächelnd nebeneinander."
            priority
            sizes="100vw"
            placeholder="blur"
            className="h-[46vw] max-h-[520px] min-h-[220px] w-full object-cover object-top"
          />
        </figure>
      </Reveal>

      {/* ------------------------------------------------------- Geschichte */}
      <section className="shell mt-24 sm:mt-32">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
          <Reveal>
            <Abschnittsmarke nummer="01">Wie alles begann</Abschnittsmarke>
          </Reveal>

          <div className="max-w-2xl">
            <Reveal delay={60}>
              <p className="text-lead text-ink">
                Entstanden ist der Verein aus einer Initiative von sechs
                Müttern, die den ersten „Wunschbaum am Meer“ ins Leben riefen.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-70">
                Aus dem einen Baum in der Vorweihnachtszeit sind über die Jahre
                mehrere Projekte geworden. Heute organisieren wir mit
                Unterstützung von Helfern, Familien, der Gemeinde und vielen
                Spendern Aktionen, die Kindern weiterhelfen – im Winter genauso
                wie im Sommer und zum Schulstart.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-70">
                Wir können inzwischen auf einige Jahre erfolgreiche
                ehrenamtliche Arbeit zurückblicken und sind mächtig stolz auf
                das Erreichte und die vielen leuchtenden Kinderaugen.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Zeitleiste */}
      <section className="shell mt-24 sm:mt-32">
        <Reveal>
          <div className="max-w-2xl">
            <Abschnittsmarke nummer="02">Meilensteine</Abschnittsmarke>
            <h2 className="mt-5 text-h2 text-ink">Von 2011 bis heute.</h2>
          </div>
        </Reveal>

        <ol className="mt-14 space-y-14 sm:space-y-16">
          {meilensteine.map((eintrag) => (
            <Reveal as="li" key={eintrag.jahr} delay={60}>
              <div className="grid gap-6 border-t border-sand-200 pt-8 lg:grid-cols-[7rem_minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
                <p className="font-[family-name:var(--font-display)] text-[1.5rem] leading-none font-semibold text-sea tabular-nums">
                  {eintrag.jahr}
                </p>

                <div>
                  <h3 className="text-h3 text-ink">{eintrag.titel}</h3>
                  <p className="mt-4 text-[1rem] leading-relaxed text-ink-70">
                    {eintrag.text}
                  </p>
                </div>

                {eintrag.bild ? (
                  <figure className="overflow-hidden rounded-xl bg-sand-100">
                    <Image
                      src={eintrag.bild}
                      alt={eintrag.bildAlt ?? ""}
                      sizes="(min-width: 1024px) 34vw, 92vw"
                      placeholder="blur"
                      className="aspect-[3/2] w-full object-cover"
                    />
                  </figure>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------ Werte */}
      <section className="shell mt-28 sm:mt-36">
        <Reveal>
          <div className="max-w-2xl">
            <Abschnittsmarke nummer="03">Wofür wir stehen</Abschnittsmarke>
            <h2 className="mt-5 text-h2 text-ink">
              Drei Dinge, die uns wichtig sind.
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-sand-200 bg-sand-200 sm:grid-cols-3">
          {werte.map((wert, index) => (
            <Reveal key={wert.titel} delay={index * 80} className="bg-paper">
              <div className="h-full p-7 sm:p-9">
                <Kleeblatt className="size-6 text-glow" />
                <h3 className="mt-6 text-h3 text-ink">{wert.titel}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
                  {wert.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- Projekte */}
      <section className="shell mt-28 sm:mt-36">
        <Reveal>
          <div className="max-w-2xl">
            <Abschnittsmarke nummer="04">Unsere Projekte</Abschnittsmarke>
            <h2 className="mt-5 text-h2 text-ink">Was wir konkret machen.</h2>
          </div>
        </Reveal>

        <ul className="mt-12">
          {projekte.map((projekt, index) => (
            <Reveal as="li" key={projekt.slug} delay={index * 70}>
              <div className="grid items-baseline gap-3 border-t border-sand-200 py-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-10 sm:py-10">
                <h3 className="text-h3 text-ink">{projekt.titel}</h3>
                <p className="text-[1rem] leading-relaxed text-ink-70">
                  {projekt.beschreibung}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
        <Trennlinie />
      </section>

      {/* --------------------------------------------------------- Menschen */}
      <section className="shell mt-28 sm:mt-36">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
          <Reveal>
            <Abschnittsmarke nummer="05">Die Menschen dahinter</Abschnittsmarke>
            <h2 className="mt-5 text-h2 text-ink">
              Wir sind keine Organisation. Wir sind Nachbarinnen und Nachbarn.
            </h2>
            <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-ink-70">
              Hinter den Glücksbringern am Meer stehen Menschen aus Bad
              Zwischenahn, die ihre Freizeit einsetzen – für Kinder, die sie zum
              Teil persönlich kennen.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <ul className="border-t border-sand-200">
              {team.map((name) => (
                <li
                  key={name}
                  className="flex items-center gap-4 border-b border-sand-200 py-4"
                >
                  <Kleeblatt className="size-4 shrink-0 text-glow/70" />
                  <span className="text-[1.0625rem] font-medium text-ink">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-8 font-[family-name:var(--font-display)] text-[1.25rem] font-medium text-sea">
              Liebe Grüße von Ihren Glücksbringern am Meer e.V.
            </p>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------------- CTA */}
      <section className="shell mt-28 sm:mt-36">
        <Reveal>
          <div className="flex flex-col gap-8 rounded-3xl bg-ink px-6 py-14 text-paper sm:px-12 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-h2">{verein.finanzierungshinweis}</h2>
              <p className="mt-5 text-[1.0625rem] leading-relaxed text-paper/70">
                Deshalb zählt jede Unterstützung – ob als Spende, als
                abgepflückter Wunsch oder als helfende Hand.
              </p>
            </div>
            <ButtonLink
              href="/unterstuetzen"
              variante="hell"
              className="group shrink-0"
            >
              Jetzt unterstützen
              <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
