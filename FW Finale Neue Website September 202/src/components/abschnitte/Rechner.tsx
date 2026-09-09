'use client';

import { useState } from 'react';
import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import { cta, rechnung } from '@/lib/inhalt';

/**
 * Zwei Regler, ein Ergebnis. Die Zahl ist die des Besuchers, nicht unsere —
 * deshalb steht die Herkunft der Rechengröße offen darunter und nicht im
 * Kleingedruckten.
 */
export default function Rechner() {
  const [satz, setSatz] = useState<number>(rechnung.satzStandard);
  const [stellen, setStellen] = useState<number>(1);

  const jahr = stellen * rechnung.stundenJahr * satz;
  const monat = Math.round(jahr / 12);

  return (
    <section id="rechnung" className="band mt-24 pt-24 pb-4 sm:mt-36 sm:pt-32">
      <div className="schale">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-20">
          <div>
            <p className="kennung kennung-strich" data-reveal>05 — Die Rechnung</p>
            <h2 className="mt-6 text-[length:var(--text-4xl)]" data-split>
              Was eine offene Stelle kostet, steht in keiner{' '}
              <span className="kursiv">Rechnung</span>.
            </h2>
            <p className="mt-6 max-w-[42ch] text-[length:var(--text-lg)] leading-[1.55] text-ink-2" data-reveal>
              Nicht das Gehalt, das Sie sparen — der Umsatz, den die Stelle
              erwirtschaftet hätte. Stellen Sie Ihre eigenen Werte ein.
            </p>

            <div className="mt-10 grid gap-8" data-reveal style={{ ['--reveal-delay' as string]: '120ms' }}>
              <Regler
                titel="Ihr Stundenverrechnungssatz"
                wert={satz}
                min={60}
                max={180}
                schritt={5}
                anzeige={`${satz} €`}
                aufAendern={setSatz}
              />
              <Regler
                titel="Unbesetzte Stellen"
                wert={stellen}
                min={1}
                max={4}
                schritt={1}
                anzeige={String(stellen)}
                aufAendern={setStellen}
              />
            </div>
          </div>

          <div data-reveal data-from="scale">
            <div
              className="rounded-[var(--radius-xl)] p-8 sm:p-10"
              style={{
                background: 'var(--color-paper-2)',
                border: '1px solid var(--color-rule)',
                boxShadow: 'var(--shadow-deep)',
              }}
            >
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-ink-3">
                Entgangener Werkstattumsatz
              </p>

              <p className="mt-6 text-[length:var(--text-6xl)] font-extrabold leading-[0.9] tracking-[-0.05em]"
                 style={{ color: 'var(--accent)' }}>
                {jahr.toLocaleString('de-DE')} €
              </p>
              <p className="mt-3 text-sm text-ink-2">im Jahr</p>

              <div className="mt-8 flex flex-wrap items-baseline gap-x-3 border-t border-rule pt-6">
                <p className="text-[length:var(--text-2xl)] font-bold tracking-[-0.035em]">
                  {monat.toLocaleString('de-DE')} €
                </p>
                <p className="text-sm text-ink-2">im Monat</p>
              </div>

              <p className="mt-6 text-[0.8rem] leading-[1.6] text-ink-3">{rechnung.quelle}</p>

              <Link href={cta.ziel} className="akt mt-8 w-full">
                {cta.text}
                <Pfeil />
              </Link>
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
        <span className="text-sm font-medium text-ink-2">{titel}</span>
        <span className="font-mono text-[1.35rem] font-medium tracking-[-0.02em]">{anzeige}</span>
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
