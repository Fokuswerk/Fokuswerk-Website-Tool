import Image from "next/image";
import { ButtonLink, PfeilRechts } from "@/components/ui";
import { bilder } from "@/content/bilder";

export default function NichtGefunden() {
  return (
    <section className="shell flex min-h-[70dvh] items-center pt-32 pb-24 sm:pt-36">
      <div className="grid w-full items-center gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,4fr)]">
        <div>
          <p className="eyebrow">Fehler 404</p>
          <h1 className="mt-5 text-h1 text-ink">
            Diese Seite konnten wir nicht finden.
          </h1>
          <p className="mt-7 max-w-lg text-lead text-ink-70">
            Vielleicht hat sich die Adresse geändert. Puck bringt Sie gern
            zurück auf die Startseite – oder direkt dorthin, wo Sie helfen
            können.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/" variante="sekundaer" className="group">
              Zur Startseite
              <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
            </ButtonLink>
            <ButtonLink href="/unterstuetzen" className="group">
              Jetzt unterstützen
              <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>

        <div className="hidden justify-center lg:flex">
          <Image
            src={bilder.puck}
            alt="Puck, das Maskottchen der Glücksbringer am Meer."
            width={200}
            height={385}
            className="puck h-auto w-44"
          />
        </div>
      </div>
    </section>
  );
}
