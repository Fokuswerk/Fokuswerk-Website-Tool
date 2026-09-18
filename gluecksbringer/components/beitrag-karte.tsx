import Image from "next/image";
import Link from "next/link";
import type { Beitrag } from "@/content/aktuelles";
import { verein } from "@/content/verein";
import { Kleeblatt } from "./marke";
import { PfeilRechts } from "./ui";
import { platzhalter } from "@/lib/bild";

export function BeitragKarte({ beitrag }: { beitrag: Beitrag }) {
  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/aktuelles/${beitrag.slug}`}
        className="block overflow-hidden rounded-xl bg-sand-100"
      >
        <Image
          src={beitrag.bild}
          alt={beitrag.bildAlt}
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"
          placeholder={platzhalter(beitrag.bild)}
          style={
            beitrag.bildPosition
              ? { objectPosition: beitrag.bildPosition }
              : undefined
          }
          className="aspect-[3/2] w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-soft)] group-hover:scale-[1.04]"
        />
      </Link>

      <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-[0.1em] text-sea uppercase">
        <span>{beitrag.kategorie}</span>
        <span aria-hidden="true" className="h-px w-5 bg-sand-300" />
        <time dateTime={beitrag.datum} className="text-ink-50">
          {beitrag.datumLabel}
        </time>
      </p>

      <h3 className="mt-3 text-h3 text-ink">
        <Link
          href={`/aktuelles/${beitrag.slug}`}
          className="transition-colors hover:text-sea"
        >
          {beitrag.titel}
        </Link>
      </h3>

      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
        {beitrag.teaser}
      </p>

      <Link
        href={`/aktuelles/${beitrag.slug}`}
        className="mt-5 inline-flex items-center gap-2 self-start py-1.5 text-[0.9375rem] font-semibold text-sea transition-colors hover:text-glow"
      >
        Mehr erfahren
        <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-1" />
      </Link>
    </article>
  );
}

/** Füllt die dritte Spalte, solange es nur wenige Beiträge gibt.
 *  Gleicher Aufbau wie eine Beitragskarte – Bildfläche oben, dann Text –
 *  damit die Reihe nicht aus dem Takt gerät. */
export function FolgenKarte() {
  return (
    <aside className="flex h-full flex-col">
      <div className="flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-xl bg-ink">
        <Kleeblatt className="size-14 text-glow" />
      </div>

      <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-[0.1em] text-sea uppercase">
        <span>Nichts verpassen</span>
      </p>

      <h3 className="mt-3 text-h3 text-ink">
        Die kurzen Neuigkeiten stehen bei Facebook und Instagram.
      </h3>

      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
        Dort zeigen wir, was zwischen den Aktionen passiert – und wann der
        nächste Wunschbaum steht.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={verein.social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink/35"
        >
          Facebook
        </a>
        <a
          href={verein.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink/35"
        >
          Instagram
        </a>
      </div>
    </aside>
  );
}
