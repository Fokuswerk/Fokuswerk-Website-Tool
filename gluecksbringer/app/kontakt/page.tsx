import type { Metadata } from "next";
import { KontaktFormular } from "@/components/kontakt-formular";
import { Kleeblatt } from "@/components/marke";
import { Reveal } from "@/components/reveal";
import { Abschnittsmarke, ButtonLink, PfeilRechts } from "@/components/ui";
import { ansprechpartner, verein } from "@/content/verein";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "So erreichen Sie die Glücksbringer am Meer e.V. in Bad Zwischenahn: E-Mail, Ansprechpartnerinnen und Social Media.",
  alternates: { canonical: "/kontakt" },
  openGraph: {
    title: "Kontakt | Glücksbringer am Meer e.V.",
    description: "So erreichen Sie uns in Bad Zwischenahn.",
    url: "/kontakt",
  },
};

/** Das Formular wird nur angeboten, wenn der Versand eingerichtet ist. */
const formularAktiv = Boolean(
  process.env.RESEND_API_KEY && process.env.KONTAKT_ABSENDER,
);

export default function Kontakt() {
  return (
    <>
      <section className="shell pt-32 sm:pt-36 lg:pt-40">
        <Reveal>
          <p className="eyebrow">
            <Kleeblatt className="size-4 text-glow" />
            Kontakt
          </p>
          <h1 className="mt-6 max-w-3xl text-h1 text-ink">
            Schreiben Sie uns – wir freuen uns über jede Nachricht.
          </h1>
          <p className="mt-8 max-w-xl text-lead text-ink-70">
            Ob Sie eine Frage zum Wunschbaum haben, mithelfen möchten oder von
            einer Familie wissen, die Unterstützung braucht: Melden Sie sich
            gern.
          </p>
        </Reveal>
      </section>

      <section className="shell mt-16 sm:mt-24">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
          {/* Kontaktdaten */}
          <div>
            <Reveal>
              <Abschnittsmarke nummer="01">Kontaktdaten</Abschnittsmarke>
            </Reveal>

            <Reveal delay={60}>
              <div className="mt-8 border-t border-sand-200 pt-7">
                <h2 className="text-xs font-semibold tracking-[0.14em] text-sea uppercase">
                  E-Mail
                </h2>
                <ul className="mt-4 space-y-2 text-[1.0625rem]">
                  <li>
                    <a
                      href={`mailto:${verein.email}`}
                      className="font-medium text-ink underline decoration-sand-300 underline-offset-4 transition-colors hover:text-glow hover:decoration-glow"
                    >
                      {verein.email}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${verein.emailWunschbaum}`}
                      className="font-medium text-ink underline decoration-sand-300 underline-offset-4 transition-colors hover:text-glow hover:decoration-glow"
                    >
                      {verein.emailWunschbaum}
                    </a>
                    <span className="ml-2 text-sm text-ink-50">
                      (Wunschbaum am Meer)
                    </span>
                  </li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-8 border-t border-sand-200 pt-7">
                <h2 className="text-xs font-semibold tracking-[0.14em] text-sea uppercase">
                  Ansprechpartnerinnen
                </h2>
                <ul className="mt-4 space-y-4">
                  {ansprechpartner.map((person) => (
                    <li key={person.name}>
                      <p className="text-[1.0625rem] font-medium text-ink">
                        {person.name}
                      </p>
                      <p className="text-[0.9375rem] text-ink-70">
                        {person.rolle ? `${person.rolle} · ` : ""}
                        {person.ort}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-8 border-t border-sand-200 pt-7">
                <h2 className="text-xs font-semibold tracking-[0.14em] text-sea uppercase">
                  Anschrift
                </h2>
                <address className="mt-4 text-[1.0625rem] leading-relaxed text-ink-70 not-italic">
                  {verein.name}
                  <br />
                  {verein.anschrift.strasse}
                  <br />
                  {verein.anschrift.plz} {verein.anschrift.ort}
                </address>
                <p className="mt-4 text-[0.9375rem] text-ink-50">
                  Registrierungsnummer: {verein.register}
                </p>
              </div>
            </Reveal>
          </div>

          {/* Formular oder direkter Weg */}
          <div>
            <Reveal delay={80}>
              <Abschnittsmarke nummer="02">
                {formularAktiv ? "Nachricht schreiben" : "Direkt schreiben"}
              </Abschnittsmarke>

              <div className="mt-8 border-t border-sand-200 pt-8">
                {formularAktiv ? (
                  <>
                    <p className="mb-8 max-w-md text-[1rem] leading-relaxed text-ink-70">
                      Gerne dürfen Sie uns auch über dieses Formular
                      kontaktieren. Die Felder mit Sternchen brauchen wir, um
                      antworten zu können.
                    </p>
                    <KontaktFormular />
                  </>
                ) : (
                  <div className="rounded-2xl border border-sand-200 bg-sand-50 p-8 sm:p-10">
                    <h2 className="text-h3 text-ink">
                      Am schnellsten erreichen Sie uns per E-Mail.
                    </h2>
                    <p className="mt-4 text-[1rem] leading-relaxed text-ink-70">
                      Schreiben Sie uns einfach, worum es geht – wir antworten
                      persönlich und so schnell wir können.
                    </p>
                    <ButtonLink
                      href={`mailto:${verein.email}`}
                      className="group mt-8"
                    >
                      {verein.email}
                      <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
                    </ButtonLink>
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-12 rounded-2xl border border-sand-200 bg-sand-50 p-7 sm:p-8">
                <h2 className="text-h3 text-ink">Sie möchten spenden?</h2>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
                  Alle Möglichkeiten – PayPal, Überweisung und Hilfe ohne Geld –
                  finden Sie auf einer Seite.
                </p>
                <ButtonLink
                  href="/unterstuetzen"
                  variante="sekundaer"
                  className="group mt-6"
                >
                  Zur Seite „Unterstützen“
                  <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 rounded-2xl border border-sand-200 bg-sand-50 p-7 sm:p-8">
                <h2 className="text-h3 text-ink">
                  Sie finden uns auch auf Facebook und Instagram.
                </h2>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
                  Dort zeigen wir, was zwischen den Aktionen passiert.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={verein.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink/35"
                  >
                    Facebook
                  </a>
                  <a
                    href={verein.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink/35"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
