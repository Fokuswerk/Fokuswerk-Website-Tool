'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Pfeil from '@/components/ui/Pfeil';
import { leistungen } from '@/lib/inhalt';

/**
 * Leistungen als Register. Kein Icon-Kartenraster, sondern ein
 * Inhaltsverzeichnis mit einer Bildvorschau, die dem Zeiger folgt; ein Klick
 * klappt auf, was hineingeht und was herauskommt. Mobil gibt es keinen
 * Hover — dort steht eine Miniatur neben jedem Eintrag.
 */
export default function Leistungen() {
  const [aktiv, setAktiv] = useState(0);

  return (
    <section id="arbeit" className="abschnitt" aria-labelledby="leistungen-titel">
      <div className="schale">
        <div className="max-w-3xl">
          <p className="kennung" data-reveal>Was dazugehört</p>
          <h2 id="leistungen-titel" className="t-h1 mt-6" data-split>
            Alles, was eine Kampagne braucht — und nichts, was sie nicht braucht.
          </h2>
          <p className="t-lead messen-weit mt-7 text-ink-2" data-reveal>
            Die Liste ist vollständig, aber sie ist nicht das Produkt. Sie kaufen hier keine
            einzelne Position — Sie geben das Marketing ab.
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
          <ul className="border-t border-rule">
            {leistungen.map((l, i) => (
              <li key={l.nr} className="border-b border-rule" data-reveal onMouseEnter={() => setAktiv(i)}>
                <details
                  className="group"
                  onToggle={(e) => { if (e.currentTarget.open) setAktiv(i); }}
                >
                  <summary
                    className="flex cursor-pointer list-none items-center gap-5 py-5 md:gap-8 md:py-6 [&::-webkit-details-marker]:hidden"
                    onFocus={() => setAktiv(i)}
                  >
                    <span className="bild-rahmen relative h-14 w-16 shrink-0 !rounded-[var(--radius-sm)] lg:hidden">
                      <Image src={`/bilder/${l.bild}.jpg`} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="t-h3 block transition-transform duration-500 ease-[var(--ease-out)] lg:group-hover:translate-x-2">
                        {l.titel}
                      </span>
                      <span className="t-small mt-1 block text-ink-3 lg:hidden">{l.kurz}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-4">
                      <span className="kennung kennung-ohne hidden lg:block" aria-hidden="true">{l.nr}</span>
                      <Plus />
                    </span>
                  </summary>
                  <div className="pb-7 lg:pr-16">
                    <p className="t-body messen-weit text-ink-2">{l.was}</p>
                    <ul className="mt-5 flex flex-col gap-2.5">
                      {l.raus.map((r) => (
                        <li key={r} className="t-small flex items-start gap-3">
                          <span aria-hidden="true" className="mt-[0.6em] h-[5px] w-[5px] shrink-0 rotate-45" style={{ background: 'var(--accent)' }} />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              </li>
            ))}
          </ul>

          <div className="hidden lg:block">
            <div className="sticky top-32 ml-auto max-w-[22rem]">
              <div className="bild-rahmen relative aspect-[3/4]">
                {leistungen.map((l, i) => (
                  <Image
                    key={l.nr}
                    src={`/bilder/${l.bild}.jpg`}
                    alt=""
                    fill
                    sizes="352px"
                    className={`object-cover transition-opacity duration-700 ease-[var(--ease-out)] ${i === aktiv ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))}
              </div>
              <p className="t-small mt-4 text-ink-3" aria-hidden="true">{leistungen[aktiv].kurz}</p>
            </div>
          </div>
        </div>

        <div data-reveal>
          <Link href="/fallstudien/wav-westerstede" className="verweis mt-12">
            So sah das bei WAV Westerstede aus
            <Pfeil />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Plus() {
  return (
    <span
      aria-hidden="true"
      className="flex h-6 w-6 items-center justify-center text-ink-3 transition-transform duration-500 ease-[var(--ease-out)] group-open:rotate-45"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M7 1v12M1 7h12" />
      </svg>
    </span>
  );
}
