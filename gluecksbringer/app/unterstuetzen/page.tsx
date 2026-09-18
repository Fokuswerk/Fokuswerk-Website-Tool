import type { Metadata } from "next";
import Image from "next/image";
import { Kleeblatt } from "@/components/marke";
import { PayPalButton } from "@/components/paypal-button";
import { Puck } from "@/components/puck";
import { Reveal } from "@/components/reveal";
import { TextEin } from "@/components/text-ein";
import { Spendenkonto } from "@/components/spendenkonto";
import {
  Abschnittsmarke,
  ButtonLink,
  PfeilRechts,
  Trennlinie,
} from "@/components/ui";
import { bilder } from "@/content/bilder";
import { verein } from "@/content/verein";

export const metadata: Metadata = {
  title: "Unterstützen & Spenden",
  description:
    "Spenden Sie an die Glücksbringer am Meer e.V. – per PayPal oder Überweisung. Alle Aktionen des Vereins sind nur durch Spenden möglich, öffentliche Fördermittel erhalten wir nicht.",
  alternates: { canonical: "/unterstuetzen" },
  openGraph: {
    title: "Unterstützen & Spenden | Glücksbringer am Meer e.V.",
    description:
      "Per PayPal oder Überweisung helfen – jede Spende kommt bei Kindern in Bad Zwischenahn an.",
    url: "/unterstuetzen",
  },
};

const andereWege = [
  {
    titel: "Einen Wunsch pflücken",
    text: "In der Wunschbaum-Zeit hängt jede Wunschkarte für ein Kind. Sie können sie vor Ort oder am digitalen Wunschbaum abpflücken und das Geschenk besorgen.",
    link: { href: verein.wunschbaumUrl, label: "Zum digitalen Wunschbaum" },
  },
  {
    titel: "Mit anpacken",
    text: "Karten binden, Geschenke sortieren, beim Fest helfen: Wer Zeit mitbringt, ist bei uns willkommen. Schreiben Sie uns einfach.",
    link: { href: "/kontakt", label: "Kontakt aufnehmen" },
  },
  {
    titel: "Weitersagen",
    text: "Teilen Sie unsere Beiträge bei Facebook oder Instagram. Je mehr Menschen vom Wunschbaum wissen, desto mehr Wünsche werden erfüllt.",
    link: { href: verein.social.instagram, label: "Zu Instagram" },
  },
];

export default function Unterstuetzen() {
  return (
    <>
      <section className="shell pt-32 sm:pt-36 lg:pt-40">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">
                <Kleeblatt className="size-4 text-glow" />
                Unterstützen
              </p>
              <h1 className="mt-6 text-h1 text-ink">
                <TextEin
                  text="Von Ihnen zum Kind ist es hier ein Schritt."
                  verzoegerung={100}
                />
              </h1>
            </Reveal>

            <Reveal delay={80}>
              <p className="mt-8 max-w-xl text-lead text-ink-70">
                Keine Geschäftsstelle, keine Gehälter, kein Verwaltungsweg. Was
                gespendet wird, fließt in unsere Aktionen für Kinder in Bad
                Zwischenahn – in Weihnachtsgeschenke, in Schulranzen, in
                Ferienerlebnisse und in
                Hilfe, wenn es schnell gehen muss.
              </p>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-8 border-l-2 border-glow py-1 pl-6 text-[1.0625rem] leading-relaxed font-medium text-ink">
                {verein.finanzierungshinweis}
              </p>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <figure className="overflow-hidden rounded-2xl bg-sand-100">
              <Image
                src={bilder.geschenkuebergabe2024}
                alt="Fünf Ehrenamtliche der Glücksbringer am Meer stehen hinter einem Tisch voller verpackter Weihnachtsgeschenke."
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                placeholder="blur"
                className="bild-ein aspect-[4/3] w-full object-cover"
              />
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ Zwei Wege */}
      <section className="shell mt-24 sm:mt-32">
        <Reveal>
          <Abschnittsmarke nummer="01">
            So geht es am schnellsten
          </Abschnittsmarke>
          <h2 className="mt-5 max-w-2xl text-h2 text-ink">
            Zwei Wege, uns zu unterstützen.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Reveal>
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-ink p-8 text-paper sm:p-10">
              {/* Puck steht ganz in der Karte – nicht angeschnitten am Rand. */}
              <Puck
                wippt
                className="pointer-events-none absolute right-8 -bottom-2 hidden w-24 opacity-90 sm:block lg:w-28"
              />
              <div className="relative">
                <p className="text-xs font-semibold tracking-[0.14em] text-mist uppercase">
                  Variante 1
                </p>
                <h3 className="mt-5 text-h3">
                  Per PayPal – in einer halben Minute
                </h3>
                <p className="mt-4 text-[1rem] leading-relaxed text-paper/70">
                  Sie werden zu unserem PayPal-Profil weitergeleitet und können
                  den Betrag frei wählen. Ohne Anmeldung geht es dort auch per
                  Karte.
                </p>
                <p className="mt-6 max-w-xs text-[0.9375rem] leading-relaxed text-mist">
                  Auch kleine Beträge helfen: Ein Weihnachtswunsch am Wunschbaum
                  ist auf 25 € begrenzt.
                </p>
              </div>
              <PayPalButton className="relative mt-8 self-start" />
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-sand-200 bg-sand-50 p-8 sm:p-10">
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-sea uppercase">
                  Variante 2
                </p>
                <h3 className="mt-5 text-h3 text-ink">Per Überweisung</h3>
                <p className="mt-4 text-[1rem] leading-relaxed text-ink-70">
                  Für eine einmalige Spende oder einen Dauerauftrag. Bitte geben
                  Sie im Verwendungszweck an, wofür Ihre Spende gedacht ist –
                  zum Beispiel „Wunschbaum am Meer“.
                </p>
              </div>
              <div className="mt-8">
                <Spendenkonto />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------- Vertrauen */}
      <section className="shell mt-24 sm:mt-32">
        <Trennlinie />
        <div className="grid gap-10 py-12 sm:grid-cols-3 sm:gap-10 sm:py-14">
          {[
            {
              titel: "Ehrenamtlich",
              text: "Niemand bei uns bekommt Geld für seine Arbeit. Was gespendet wird, geht in die Aktionen.",
            },
            {
              titel: "Gemeinnützig",
              text: `${verein.name} ist ein gemeinnütziger Verein, eingetragen beim ${verein.registergericht} unter ${verein.registernummer}.`,
            },
            {
              titel: "Spendenbescheinigung",
              text: "Sie benötigen eine Bescheinigung für Ihre Spende? Schreiben Sie uns kurz – wir stellen sie Ihnen aus.",
            },
          ].map((punkt, index) => (
            <Reveal key={punkt.titel} delay={index * 80}>
              <div className="gruppe">
                <Puck variante="kopf" className="puck-marke h-9 w-auto" />
                <h3 className="mt-5 text-h3 text-ink">{punkt.titel}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
                  {punkt.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Trennlinie />
      </section>

      {/* -------------------------------------------------- Andere Wege */}
      <section className="shell mt-24 sm:mt-32">
        <Reveal>
          <Abschnittsmarke nummer="02">Ohne Geld helfen</Abschnittsmarke>
          <h2 className="mt-5 max-w-2xl text-h2 text-ink">
            Unterstützen geht auch anders.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-sand-200 bg-sand-200 sm:grid-cols-3">
          {andereWege.map((weg, index) => (
            <Reveal key={weg.titel} delay={index * 80} className="bg-paper">
              <div className="flex h-full flex-col justify-between p-7 sm:p-9">
                <div>
                  <h3 className="text-h3 text-ink">{weg.titel}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
                    {weg.text}
                  </p>
                </div>
                <a
                  href={weg.link.href}
                  {...(weg.link.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group mt-6 inline-flex items-center gap-2 self-start py-1.5 text-[0.9375rem] font-semibold text-sea transition-colors hover:text-glow"
                >
                  {weg.link.label}
                  <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-1" />
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ CTA */}
      <section className="shell mt-28 sm:mt-36">
        <Reveal>
          <div className="flex flex-col gap-8 rounded-3xl border border-sand-200 bg-sand-50 px-6 py-12 sm:px-12 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-h2 text-ink">Noch Fragen zur Spende?</h2>
              <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-70">
                Melden Sie sich gern – wir antworten persönlich.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <ButtonLink href="/kontakt" variante="sekundaer">
                Zur Kontaktseite
              </ButtonLink>
              <ButtonLink href={`mailto:${verein.email}`}>
                {verein.email}
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
