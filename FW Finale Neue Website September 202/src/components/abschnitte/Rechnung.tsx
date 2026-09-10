'use client';

import Link from 'next/link';
import { useState } from 'react';
import Pfeil from '@/components/ui/Pfeil';
import { cta, rechnung } from '@/lib/inhalt';

/**
 * Die Rechnung. Zwei Regler und eine Auswahl, eine Zahl — sofort, ohne
 * Formular. Die Zahl ist die des Besuchers, nicht unsere; deshalb steht die
 * Herkunft der Rechengröße offen darunter.
 */
const dauern = [3, 6, 12] as const;
const euro = (n: number) => `${n.toLocaleString('de-DE')} €`;

export default function Rechnung() {
  const [satz, setSatz] = useState<number>(rechnung.satzStandard);
  const [stellen, setStellen] = useState<number>(1);
  const [dauer, setDauer] = useState<number>(6);

  const jahr = stellen * rechnung.stundenJahr * satz;
  const monat = Math.round(jahr / 12);

  return (
    <section id="rechnung" className="band" aria-labelledby="rechnung-titel">
      <div className="schale">
        <div className="grid gap-14 py-20 md:py-28 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div className="flex flex-col justify-center">
            <p className="kennung" data-reveal>Die Rechnung</p>
            <h2 id="rechnung-titel" className="t-h1 mt-6" data-split>
              Was eine offene Stelle kostet, rechnet Ihnen niemand vor. Hier dauert es zehn Sekunden.
            </h2>
            <p className="t-lead messen-weit mt-7 text-ink-2" data-reveal>
              Zwei Regler, eine Zahl. Nicht das Gehalt, das Sie sparen — der Umsatz, den die
              Stelle erwirtschaftet hätte.
            </p>
            <div data-reveal>
              <Link href={cta.ziel} className="akt mt-9">
                {cta.text}
                <Pfeil />
              </Link>
              <p className="t-small mt-4 text-ink-3">20 Minuten · am Telefon · unverbindlich</p>
            </div>
          </div>

          <div data-reveal>
            <div className="rounded-[var(--radius-lg)] border border-rule-2 p-6 md:p-9">
              <div className="border-b border-rule pb-7" role="status" aria-live="polite" aria-atomic="true">
                <p className="kennung kennung-ohne">Entgangener Werkstattumsatz</p>
                <p className="mt-4 flex flex-wrap items-baseline gap-x-3">
                  <span className="t-num text-[2.8rem] leading-[0.95] sm:text-[3.4rem] md:text-[4.4rem]">{euro(jahr)}</span>
                  <span className="t-small text-ink-3">im Jahr</span>
                </p>
                <p className="t-body mt-5 text-ink-2">
                  Das sind <span className="text-ink">{euro(monat)} in jedem Monat</span>. Nach {dauer} Monaten
                  Suche: <span className="text-ink">{euro(monat * dauer)}</span>.
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-7">
                <Regler titel="Ihr Stundenverrechnungssatz" wert={satz} min={60} max={180} schritt={5} anzeige={`${satz} €`} aufAendern={setSatz} />
                <Regler titel="Unbesetzte Stellen" wert={stellen} min={1} max={4} schritt={1} anzeige={String(stellen)} aufAendern={setStellen} />

                <fieldset>
                  <legend className="t-small text-ink-2">Wie lange suchen Sie schon?</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dauern.map((d) => {
                      const an = d === dauer;
                      return (
                        <button
                          key={d}
                          type="button"
                          aria-pressed={an}
                          onClick={() => setDauer(d)}
                          className={`min-h-11 rounded-[var(--radius-xs)] border px-4 text-[0.875rem] transition-colors duration-300 ${
                            an ? 'border-ink bg-ink text-paper' : 'border-rule-2 text-ink hover:border-ink'
                          }`}
                        >
                          {d} Monate
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>

              <p className="t-small mt-8 text-ink-3">{rechnung.quelle}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Regler({
  titel, wert, min, max, schritt, anzeige, aufAendern,
}: {
  titel: string; wert: number; min: number; max: number;
  schritt: number; anzeige: string; aufAendern: (v: number) => void;
}) {
  const anteil = ((wert - min) / (max - min)) * 100;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-4">
        <span className="t-small text-ink-2">{titel}</span>
        <span className="t-num text-[1.15rem]">{anzeige}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={schritt}
        value={wert}
        onChange={(e) => aufAendern(Number(e.target.value))}
        className="fw-regler mt-3 w-full"
        style={{ ['--anteil' as string]: `${anteil}%` }}
      />
    </label>
  );
}
