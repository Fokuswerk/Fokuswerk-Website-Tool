"use client";

import Link from "next/link";
import { ArrowRight, Building2, Home } from "lucide-react";

export default function Start() {
  return (
    <main className="mx-auto max-w-[940px] px-5 py-12 sm:py-16 lg:px-8">
      <div className="flex items-center gap-2">
        <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true">
          <rect x="0.75" y="0.75" width="15.5" height="15.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-ink" />
          <path d="M0.75 5.6 H16.25 M5.6 5.6 V16.25 M10.6 5.6 V16.25" stroke="currentColor" strokeWidth="1" className="text-accent" />
        </svg>
        <span className="text-[14.5px] font-semibold tracking-[-0.01em] text-ink">Serienküche</span>
        <span className="num ml-2 rounded-xs bg-flag-soft px-1.5 py-[1px] text-[10.5px] text-flag">Prototyp</span>
      </div>

      <h1 className="mt-10 max-w-[20ch] text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[38px]">
        Küche planen, ohne sich auszukennen.
      </h1>
      <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-ink-2">
        Sie sagen, wie der Raum aussieht und was hineinsoll. Den Rest — Schrankbreiten,
        Abstände, was neben was darf — übernimmt das Werkzeug. Am Ende steht ein maßhaltiger
        Plan mit allen Teilen und einem Preis.
      </p>

      <h2 className="mt-12 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">
        Was planen Sie?
      </h2>

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <Link
          href="/kueche"
          className="group rounded-md border border-line bg-paper p-5 transition-colors hover:border-accent"
        >
          <Home size={20} strokeWidth={1.5} className="text-accent" />
          <h3 className="mt-3 text-[17px] font-semibold text-ink">Eine einzelne Küche</h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">
            Für die eigene Wohnung oder eine einzelne Mietwohnung. Sie werden Schritt für
            Schritt gefragt — Wandlängen, Fenster, Tür, wo das Wasser herkommt. Dauert ein
            paar Minuten.
          </p>
          <ul className="mt-3 space-y-1 border-t border-line-2 pt-3 text-[12.5px] text-ink-3">
            <li>Keine Vorkenntnisse nötig</li>
            <li>Die Zeichnung wächst beim Ausfüllen mit</li>
            <li>Drei Vorschläge mit Preis und Teileliste</li>
          </ul>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent">
            Loslegen
            <ArrowRight size={14} strokeWidth={1.8} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/dashboard"
          className="group rounded-md border border-line bg-paper p-5 transition-colors hover:border-accent"
        >
          <Building2 size={20} strokeWidth={1.5} className="text-ink-2" />
          <h3 className="mt-3 text-[17px] font-semibold text-ink">Ein ganzes Haus</h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">
            Für Bauträger und Wohnungsunternehmen. Grundrisse aller Wohnungen einlesen,
            ähnliche Küchen zu wenigen Typen zusammenfassen und einmal planen statt vierzigmal.
          </p>
          <ul className="mt-3 space-y-1 border-t border-line-2 pt-3 text-[12.5px] text-ink-3">
            <li>40 Wohnungen werden 6 Küchentypen</li>
            <li>Mengen und Kosten über das ganze Projekt</li>
            <li>Installationsplan vor dem Rohbau</li>
          </ul>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent">
            Beispielprojekt ansehen
            <ArrowRight size={14} strokeWidth={1.8} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <div className="mt-10 rounded-md border border-flag/40 bg-flag-soft px-4 py-3">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-flag">
          Hinweis zum Prototyp
        </div>
        <p className="mt-1 max-w-[76ch] text-[12.5px] leading-relaxed text-ink-2">
          Alle Daten und Preise sind erfunden. Der Plan für eine einzelne Küche wird wirklich
          gerechnet — Schrankfolge, Maße und Preis entstehen aus Ihren Eingaben. Das Einlesen
          von Grundrissen und die Bestellung sind dagegen nachgestellt. Und ganz gleich, wie
          gut ein Plan aussieht: vor der Bestellung misst jemand den fertigen Raum nach.
        </p>
      </div>
    </main>
  );
}
