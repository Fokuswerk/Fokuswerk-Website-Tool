import Image from "next/image";
import Link from "next/link";
import { BeitragKarte, FolgenKarte } from "@/components/beitrag-karte";
import { Kleeblatt } from "@/components/marke";
import { PayPalButton } from "@/components/paypal-button";
import { Puck } from "@/components/puck";
import { Reveal } from "@/components/reveal";
import { SatzEin } from "@/components/satz-ein";
import { Spendenkonto } from "@/components/spendenkonto";
import { TextEin } from "@/components/text-ein";
import { Wischreihe } from "@/components/wischreihe";
import {
  Abschnittsmarke,
  ButtonLink,
  PfeilRechts,
  Trennlinie,
} from "@/components/ui";
import { beitraegeSortiert } from "@/content/aktuelles";
import { bilder } from "@/content/bilder";
import { galerie } from "@/content/galerie";
import { projekte, unterstuetzer } from "@/content/projekte";
import { verein } from "@/content/verein";

const fakten = [
  { wert: "2011", label: "gegründet von sechs Müttern aus Bad Zwischenahn" },
  { wert: "15.", label: "Wunschbaum am Meer – zuletzt im Winter 2025" },
  { wert: "0 €", label: "öffentliche Fördermittel. Alles kommt von Spenden." },
];

const wegEinesWunsches = [
  {
    schritt: "01",
    titel: "Die Familien werden angeschrieben",
    text: "Die Gemeindeverwaltung wendet sich an Familien in Bad Zwischenahn, denen es schwerfällt, die Weihnachtswünsche ihrer Kinder zu erfüllen.",
  },
  {
    schritt: "02",
    titel: "Das Kind schreibt seinen Wunsch auf",
    text: "Jedes Kind darf einen Weihnachtswunsch bis 25 € einreichen. Der Wunsch wird zu einer Karte – und die Karte hängt am Wunschbaum.",
  },
  {
    schritt: "03",
    titel: "Jemand pflückt die Karte",
    text: "Vor Ort in der Bibliothek am Meer oder am digitalen Wunschbaum. Das verpackte Geschenk geben Sie bei uns ab, wir bringen es rechtzeitig zur Familie.",
  },
];

export default function Startseite() {
  const [featured, ...weitere] = beitraegeSortiert;

  // Drei Bilder, die den Bogen von 2011 bis heute spannen: der erste Baum,
  // der Baum mit Plakat, die Wunschkarten von 2025. Über die Bildnamen
  // gewählt, damit die Auswahl beim Umsortieren der Galerie stehen bleibt.
  const alleBilder = galerie.flatMap((jahr) => jahr.bilder);
  const galerieVorschau = [
    bilder.g2011BaumGeschmueckt,
    bilder.g2015Wunschbaum,
    bilder.wunschbaum2025Wunschkarten,
  ]
    .map((bild) => alleBilder.find((eintrag) => eintrag.bild.src === bild.src))
    .filter((eintrag): eintrag is (typeof alleBilder)[number] => Boolean(eintrag));

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32">
        <div className="shell">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
            <div className="pt-6 lg:pt-0">
              <Reveal>
                <p className="eyebrow">
                  <Kleeblatt className="size-4 text-glow" />
                  Bad Zwischenahn · seit 2011
                </p>
              </Reveal>

              <Reveal delay={60}>
                <h1 className="mt-6 text-display text-ink">
                  <TextEin
                    text="Gemeinsam schenken wir Kindern ein Stück Glück."
                    verzoegerung={120}
                  />
                </h1>
              </Reveal>

              <Reveal delay={120}>
                <p className="mt-7 max-w-lg text-lead text-ink-70">
                  Seit 2011 sorgen wir dafür, dass Kinder aus Familien mit wenig
                  Geld nicht die sind, bei denen zuerst gespart wird. Zu
                  Weihnachten, zum Schulstart, in den Sommerferien – und dann,
                  wenn es schnell gehen muss. Ehrenamtlich, aus Bad Zwischenahn.
                </p>
              </Reveal>

              <Reveal delay={180}>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <ButtonLink
                    href="/ueber-uns"
                    variante="sekundaer"
                    className="group"
                  >
                    Unsere Arbeit entdecken
                    <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
                  </ButtonLink>
                  <ButtonLink href="/unterstuetzen" className="group">
                    Jetzt unterstützen
                    <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
                  </ButtonLink>
                </div>
              </Reveal>
            </div>

            <Reveal delay={120}>
              <figure>
                <div className="relative">
                  <div className="overflow-hidden rounded-2xl bg-sand-100">
                    <Image
                      src={bilder.wunschbaum2025Team}
                      alt="Das Team der Glücksbringer am Meer steht mit verpackten Geschenken vor dem geschmückten Wunschbaum in der Bibliothek am Meer."
                      priority
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      placeholder="blur"
                      className="bild-ein aspect-[4/5] w-full object-cover object-center sm:aspect-[16/11] lg:aspect-[5/4]"
                    />
                  </div>
                  {/* Puck steht auf der Bildkante – das Zeichen, das der Verein seit 2011 benutzt. */}
                  <Puck
                    wippt
                    className="pointer-events-none absolute bottom-0 -left-4 hidden h-28 w-auto translate-y-[26%] drop-shadow-[0_16px_30px_rgba(16,41,59,0.20)] sm:block lg:-left-7 lg:h-36"
                  />
                </div>
                <figcaption className="mt-5 max-w-md text-sm text-ink-50 sm:mt-9 sm:pl-24 lg:pl-28">
                  Der 15. Wunschbaum am Meer, kurz vor der Eröffnung in der
                  Bibliothek am Meer.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- 01 Wer wir sind */}
      <section className="shell mt-28 sm:mt-36">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
          <Reveal>
            <Abschnittsmarke nummer="01">Wer wir sind</Abschnittsmarke>
            <h2 className="mt-5 text-h2 text-ink">Hallo und Moin!</h2>
          </Reveal>

          <div>
            <Reveal delay={80}>
              <p className="text-lead text-ink">
                Wir freuen uns, dass Sie unsere Website geöffnet haben. Wir
                können inzwischen auf einige Jahre erfolgreiche ehrenamtliche
                Arbeit zurückblicken und sind mächtig stolz auf das Erreichte –
                und die vielen leuchtenden Kinderaugen.
              </p>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-70">
                Entstanden ist der Verein aus einer Initiative von sechs
                Müttern, die den ersten „Wunschbaum am Meer“ ins Leben riefen.
                Heute organisieren wir mit Unterstützung von Helfern, Familien,
                der Gemeinde und vielen Spendern verschiedene Projekte für
                wirtschaftlich benachteiligte Kinder in unserer Gemeinde.
              </p>
            </Reveal>

          </div>
        </div>

        {/* Das Gruppenbild läuft über beide Spalten – sonst bleibt links eine
            große leere Fläche stehen. */}
        <Reveal delay={200}>
          <figure className="mt-12 sm:mt-16">
            <div className="overflow-hidden rounded-2xl bg-sand-100">
              <Image
                src={bilder.vereinTeam}
                alt="Sieben Frauen des Vereins Glücksbringer am Meer stehen lächelnd nebeneinander."
                sizes="(min-width: 1024px) 78rem, 100vw"
                placeholder="blur"
                className="w-full"
              />
            </div>
            <figcaption className="mt-3 text-sm text-ink-50">
              Die Glücksbringer am Meer – ehrenamtlich, seit 2011.
            </figcaption>
          </figure>
        </Reveal>
      </section>

      {/* -------------------------------------------------------- Fakten-Band */}
      <section className="shell mt-24 sm:mt-32">
        <Trennlinie />
        <dl className="grid gap-10 py-12 sm:grid-cols-3 sm:gap-8 sm:py-14">
          {fakten.map((fakt, index) => (
            <Reveal key={fakt.wert} delay={index * 90} className="sm:px-2">
              <dt className="zahl-maske font-[family-name:var(--font-display)] text-[2.75rem] leading-none font-semibold tracking-[-0.04em] text-sea tabular-nums sm:text-[3.25rem]">
                <span className="zahl">{fakt.wert}</span>
              </dt>
              <dd className="mt-4 max-w-[22ch] text-[0.9375rem] leading-relaxed text-ink-70">
                {fakt.label}
              </dd>
            </Reveal>
          ))}
        </dl>
        <Trennlinie />
      </section>

      {/* ------------------------------------------------ 02 Warum es uns gibt */}
      <section className="mt-24 sm:mt-32">
        <div className="shell">
          <Reveal>
            <Abschnittsmarke nummer="02">Warum es uns gibt</Abschnittsmarke>
          </Reveal>

          {/* Beide Spalten beginnen auf derselben Linie – die Aussage links steht
              in festen Zeilen, damit sie nicht zerfranst umbricht. */}
          <div className="mt-9 grid gap-10 border-t border-sand-200 pt-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-start lg:gap-16 lg:pt-12">
            <p className="font-[family-name:var(--font-display)] text-[clamp(1.85rem,1.1rem+2.5vw,3rem)] leading-[1.1] font-semibold tracking-[-0.03em] text-ink">
              {/* Jede Zeile ein eigener Block – so bricht die Aussage genau dort um,
                  wo sie es soll, und nicht irgendwo in der Mitte. */}
              <span className="block">
                <SatzEin text="Wir haben kein Budget." />
              </span>
              <span className="block">
                <SatzEin text="Wir haben" verzoegerung={280} />
                <span> </span>
                <SatzEin
                  text="Bad Zwischenahn."
                  verzoegerung={420}
                  className="text-glow"
                />
              </span>
            </p>

            <Reveal delay={140}>
              <div>
                <p className="text-[1.0625rem] leading-relaxed text-ink-70">
                  Keine öffentlichen Fördermittel, kein Etat, auf den wir
                  zurückgreifen könnten. Jedes Geschenk, jeder Schulranzen und
                  jeder Schwimmkurs entsteht, weil jemand von hier mitmacht.
                </p>
                <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink">
                  <strong className="font-semibold">
                    Alle unsere Aktionen sind nur durch Spenden möglich.
                  </strong>{" "}
                  Dieser Satz ist bei uns keine Floskel, sondern die Rechnung.
                </p>
                <Link
                  href="/unterstuetzen"
                  className="group mt-7 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-sea transition-colors hover:text-glow"
                >
                  So können Sie helfen
                  <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={120}>
          <figure className="mt-16 sm:mt-20">
            <div className="parallax-rahmen aspect-[4/3] w-full sm:aspect-[2/1] lg:aspect-[12/5]">
              <Image
                src={bilder.meerAbend}
                alt="Abendlicht über dem Zwischenahner Meer: Möwen sitzen auf dem weißen Geländer eines Stegs, dahinter liegt das gegenüberliegende Ufer."
                sizes="100vw"
                placeholder="blur"
                className="parallax-bild h-full w-full object-cover object-[50%_42%]"
              />
            </div>
            <figcaption className="shell mt-3 text-xs text-ink-50 sm:text-right">
              Abend am Zwischenahner Meer. Foto: JoachimKohler-HB,{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/deed.de"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-ink-50/40 underline-offset-2 transition-colors hover:text-ink"
              >
                CC BY-SA 4.0
              </a>
            </figcaption>
          </figure>
        </Reveal>
      </section>

      {/* -------------------------------------------------- 03 Was wir machen */}
      <section className="shell mt-24 sm:mt-32">
        <Reveal>
          <div className="max-w-2xl">
            <Abschnittsmarke nummer="03">Was wir machen</Abschnittsmarke>
            <h2 className="mt-5 text-h2 text-ink">
              <SatzEin
                text="Vier Projekte, ein Ziel: dass Kinder nicht außen vor bleiben."
                schritt={48}
              />
            </h2>
          </div>
        </Reveal>

        <ul className="mt-12 sm:mt-16">
          {projekte.map((projekt, index) => (
            <Reveal as="li" key={projekt.slug} delay={index * 70}>
              <div className="grid items-baseline gap-4 border-t border-sand-200 py-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10 sm:py-10 lg:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1.2fr)]">
                <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-glow tabular-nums">
                  0{index + 1}
                </span>
                <h3 className="text-h3 text-ink">{projekt.titel}</h3>
                <p className="max-w-xl text-[1rem] leading-relaxed text-ink-70 sm:col-span-2 lg:col-span-1">
                  {projekt.beschreibung}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
        <Trennlinie />
      </section>

      {/* ------------------------------------------------- 04 Wem wir helfen */}
      <section className="shell mt-24 sm:mt-32">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div>
            <Reveal>
              <Abschnittsmarke nummer="04">Wem wir helfen</Abschnittsmarke>
              <h2 className="mt-5 text-h2 text-ink">
                <SatzEin text="Wie aus einem Wunsch ein Geschenk wird." />
              </h2>
              <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-ink-70">
                Unser größtes Projekt ist der Wunschbaum am Meer. Er richtet
                sich an Familien in unserer Gemeinde, denen es schwerfällt, die
                Weihnachtswünsche ihrer Kinder zu erfüllen.
              </p>
            </Reveal>

            <Reveal delay={140}>
              <figure className="mt-10 overflow-hidden rounded-2xl bg-sand-100">
                <Image
                  src={bilder.wunschbaum2025Wunschkarten}
                  alt="Zwei Ehrenamtliche hängen beschriftete Wunschkarten an den beleuchteten Weihnachtsbaum."
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  placeholder="blur"
                  className="aspect-[4/5] w-full object-cover"
                />
              </figure>
            </Reveal>
          </div>

          <div className="lg:pt-16">
            <ol>
              {wegEinesWunsches.map((eintrag, index) => (
                <Reveal as="li" key={eintrag.schritt} delay={index * 90}>
                  <div className="border-t border-sand-200 py-8">
                    <span className="text-xs font-semibold tracking-[0.14em] text-sea tabular-nums">
                      {eintrag.schritt}
                    </span>
                    <h3 className="mt-3 text-h3 text-ink">{eintrag.titel}</h3>
                    <p className="mt-3 text-[1rem] leading-relaxed text-ink-70">
                      {eintrag.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={270} className="block border-t border-sand-200 pt-8">
              <ButtonLink
                href={verein.wunschbaumUrl}
                variante="sekundaer"
                className="group"
              >
                Zum digitalen Wunschbaum
                <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
              </ButtonLink>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- Puck stellt sich vor */}
      <section className="shell mt-24 sm:mt-32">
        <Reveal>
          <div className="overflow-hidden rounded-3xl bg-sand-50 px-6 py-12 sm:px-12 sm:py-14 lg:px-16">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
              <div className="flex justify-center lg:justify-start">
                <Puck
                  wippt
                  alt="Puck, das Maskottchen des Vereins: ein Mädchen mit roter Mütze und rotem Kittel."
                  className="h-56 w-auto sm:h-72 lg:h-80"
                />
              </div>

              <div>
                <p className="eyebrow">
                  <Kleeblatt className="size-4 text-glow" />
                  Unser Maskottchen
                </p>
                <h2 className="mt-5 text-h2 text-ink">
                  <SatzEin text="Das ist Puck." />
                </h2>
                <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-ink-70">
                  Puck begleitet den Wunschbaum am Meer seit vielen Jahren: als
                  kleine Figur auf jeder Wunschkarte, auf den Plakaten und auf
                  dem allerersten Weihnachtslogo des Vereins. Wer in Bad
                  Zwischenahn eine Karte vom Baum nimmt, hat sie längst in der
                  Hand gehabt.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <figure className="flex items-center gap-4">
                    <Image
                      src={bilder.g2011Weihnachtslogo}
                      alt="Das erste Weihnachtslogo des Vereins: eine gezeichnete Christbaumkugel mit Puck und einem Geschenk."
                      placeholder="blur"
                      sizes="120px"
                      className="h-auto w-[84px] rounded-lg"
                    />
                    <figcaption className="text-sm leading-relaxed text-ink-50">
                      Das erste Weihnachtslogo,
                      <br />
                      gezeichnet 2011.
                    </figcaption>
                  </figure>

                  <Link
                    href="/aktuelles/puck-stellt-sich-vor"
                    className="group inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-sea transition-colors hover:text-glow"
                  >
                    Puck stellt sich vor
                    <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------- 05 Was bisher entstand */}
      <section className="shell mt-28 sm:mt-36">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <Abschnittsmarke nummer="05">
                Was bisher entstanden ist
              </Abschnittsmarke>
              <h2 className="mt-5 text-h2 text-ink">
                Über zehn Jahre Wunschbaum – in Bildern.
              </h2>
            </div>
            <Link
              href="/galerie"
              className="group inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-sea transition-colors hover:text-glow"
            >
              Zur Galerie
              <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12">
          <Wischreihe raster="sm:grid-cols-3" label="Bilder aus der Galerie">
            {galerieVorschau.map((eintrag, index) => (
              <Reveal key={eintrag.bild.src} delay={index * 90}>
                <Link
                  href="/galerie"
                  className="group block overflow-hidden rounded-xl bg-sand-100"
                >
                  <Image
                    src={eintrag.bild}
                    alt={eintrag.alt}
                    sizes="(min-width: 640px) 31vw, 82vw"
                    placeholder="blur"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-soft)] group-hover:scale-[1.04]"
                  />
                </Link>
              </Reveal>
            ))}
          </Wischreihe>
        </div>
      </section>

      {/* ------------------------------------------------------ 06 Aktuelles */}
      <section className="shell mt-28 sm:mt-36">
        <Reveal>
          <div className="max-w-2xl">
            <Abschnittsmarke nummer="06">Aktuelles</Abschnittsmarke>
            <h2 className="mt-5 text-h2 text-ink">
              Woran wir gerade arbeiten.
            </h2>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <article className="mt-12 grid gap-8 border-t border-sand-200 pt-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-14">
            <Link
              href={`/aktuelles/${featured.slug}`}
              className="group block overflow-hidden rounded-2xl bg-sand-100"
            >
              <Image
                src={featured.bild}
                alt={featured.bildAlt}
                sizes="(min-width: 1024px) 55vw, 100vw"
                placeholder="blur"
                style={
                  featured.bildPosition
                    ? { objectPosition: featured.bildPosition }
                    : undefined
                }
                className="aspect-[3/2] w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-soft)] group-hover:scale-[1.03]"
              />
            </Link>

            <div className="lg:py-4">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-[0.1em] text-sea uppercase">
                <span>{featured.kategorie}</span>
                <span aria-hidden="true" className="h-px w-5 bg-sand-300" />
                <time dateTime={featured.datum} className="text-ink-50">
                  {featured.datumLabel}
                </time>
              </p>
              <h3 className="mt-5 text-h2 text-ink">
                <Link
                  href={`/aktuelles/${featured.slug}`}
                  className="transition-colors hover:text-sea"
                >
                  {featured.titel}
                </Link>
              </h3>
              <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-ink-70">
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

        <div className="mt-16">
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

      {/* ---------------------------------------------------- 07 Wie helfen */}
      <section className="mt-28 sm:mt-36">
        <div className="shell">
          <div className="overflow-hidden rounded-3xl bg-ink px-6 py-16 text-paper sm:px-12 sm:py-20 lg:px-16">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
              <div>
                <Reveal>
                  <p className="eyebrow text-mist">
                    <span className="text-glow tabular-nums">07</span>
                    <span aria-hidden="true" className="h-px w-6 bg-paper/25" />
                    Wie kann ich helfen?
                  </p>
                  <h2 className="mt-6 text-h1">
                    <SatzEin text="Mit 25 Euro hängt eine Karte weniger am Baum." />
                  </h2>
                  <p className="mt-6 max-w-lg text-lead text-paper/70">
                    So viel darf ein Weihnachtswunsch bei uns kosten. Was darüber
                    hinaus zusammenkommt, wird zum Schulranzen im August, zum
                    Schwimmkurs im Sommer, zur Hilfe an dem Tag, an dem sie
                    gebraucht wird. Bei uns arbeitet niemand gegen Bezahlung.
                  </p>
                </Reveal>

                <Reveal delay={100}>
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <PayPalButton />
                    <ButtonLink
                      href="/unterstuetzen"
                      variante="hell"
                      className="group"
                    >
                      Per Überweisung unterstützen
                      <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
                    </ButtonLink>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={160}>
                <Spendenkonto ton="dunkel" />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 08 Danke */}
      <section className="shell mt-28 sm:mt-36">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
          <Reveal>
            <Abschnittsmarke nummer="08">Wer uns unterstützt</Abschnittsmarke>
            <h2 className="mt-5 text-h2 text-ink">
              <SatzEin text="Danke an alle, die mitmachen." />
            </h2>
            <p className="mt-6 max-w-sm text-[1rem] leading-relaxed text-ink-70">
              Ohne Helferinnen und Helfer, Familien, die Gemeinde und viele
              Spenderinnen und Spender gäbe es keinen Wunschbaum. Diese drei
              begleiten uns besonders eng.
            </p>
          </Reveal>

          <div>
            <ul>
              {unterstuetzer.map((eintrag, index) => (
                <Reveal as="li" key={eintrag.name} delay={index * 80}>
                  <div className="grid gap-2 border-t border-sand-200 py-7 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] sm:gap-10">
                    <h3 className="text-[1.0625rem] font-semibold text-ink">
                      {eintrag.href ? (
                        <a
                          href={eintrag.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:text-sea"
                        >
                          {eintrag.name}
                        </a>
                      ) : (
                        eintrag.name
                      )}
                    </h3>
                    <p className="text-[0.9375rem] leading-relaxed text-ink-70">
                      {eintrag.rolle}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
            <Trennlinie />

            <Reveal delay={240}>
              <p className="mt-8 text-[0.9375rem] text-ink-50">
                Danke natürlich an dieser Stelle ganz besonders an all unsere
                bisherigen Unterstützer*innen.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- 09 Kontakt */}
      <section className="shell mt-28 sm:mt-36">
        <Reveal>
          <div className="flex flex-col gap-8 rounded-3xl border border-sand-200 bg-sand-50 px-6 py-12 sm:px-12 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <Abschnittsmarke nummer="09">Kontakt</Abschnittsmarke>
              <h2 className="mt-5 text-h2 text-ink">
                Sie haben eine Frage oder möchten mithelfen?
              </h2>
              <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-70">
                Schreiben Sie uns einfach – wir freuen uns über jede Nachricht.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <ButtonLink href="/kontakt" className="group">
                Kontakt aufnehmen
                <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href={`mailto:${verein.email}`} variante="sekundaer">
                {verein.email}
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
