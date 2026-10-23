"use client";

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

export default function Start() {
  return (
    <div className="warm min-h-full">
      <main className="mx-auto max-w-[860px] px-5 py-10 sm:px-8 sm:py-16">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 17 17" aria-hidden="true">
            <rect x="0.75" y="0.75" width="15.5" height="15.5" rx="3" fill="none" strokeWidth="1.4" className="stroke-kohle" />
            <path d="M0.75 5.6 H16.25" strokeWidth="1.4" className="stroke-butter" />
          </svg>
          <span className="gross text-[16px] font-bold text-kohle">Serienküche</span>
          <span className="ml-2 rounded-full bg-butter-soft px-2.5 py-[3px] text-[11.5px] font-semibold text-kohle-2">
            Prototyp
          </span>
        </div>

        <h1 className="gross mt-12 max-w-[16ch] text-[38px] font-bold leading-[1.08] text-kohle sm:text-[52px]">
          Eine Küche planen, ohne eine Ahnung davon zu haben.
        </h1>
        <p className="mt-5 max-w-[54ch] text-[17px] leading-relaxed text-kohle-2">
          Du sagst, wie dein Raum aussieht und was reinsoll. Schrankbreiten, Abstände und was
          neben was darf — das übernehmen wir. Am Ende steht ein Plan, der wirklich passt,
          mit allen Teilen und einem Preis.
        </p>

        <div className="mt-10">
          <Link href="/kueche">
            <span className="warm-wahl inline-flex items-center gap-2.5 rounded-full bg-kohle px-8 py-4 text-[17px] font-semibold text-creme">
              Meine Küche planen
              <ArrowRight size={19} strokeWidth={2.2} />
            </span>
          </Link>
          <p className="mt-3 text-[14px] text-kohle-3">Dauert etwa drei Minuten. Kein Konto nötig.</p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            ["Du misst, wir rechnen", "Wandlänge, Fenster, Tür — mehr Angaben braucht es nicht."],
            ["Es passt wirklich", "Jeder Schrank sitzt im Raster, der Rest wird eine Passleiste."],
            ["Du siehst, was es kostet", "Komplett mit Geräten und Montage, bevor du irgendwo anrufst."],
          ].map(([t, s]) => (
            <div key={t} className="rounded-[20px] bg-papier px-5 py-5">
              <div className="gross text-[16px] font-bold text-kohle">{t}</div>
              <div className="mt-1.5 text-[14px] leading-relaxed text-kohle-2">{s}</div>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-linie-warm pt-8">
          <Link
            href="/dashboard"
            className="group flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-papier px-5 py-5 transition-shadow hover:shadow-[0_8px_26px_rgba(23,22,15,0.07)]"
          >
            <div className="flex items-start gap-4">
              <Building2 size={22} strokeWidth={1.7} className="mt-0.5 shrink-0 text-kohle-3" />
              <div>
                <div className="gross text-[16px] font-bold text-kohle">
                  Sie planen ein ganzes Haus?
                </div>
                <div className="mt-1 max-w-[62ch] text-[14px] leading-relaxed text-kohle-2">
                  Für Bauträger und Wohnungsunternehmen: Grundrisse aller Wohnungen einlesen,
                  ähnliche Küchen zu wenigen Typen zusammenfassen und einmal planen statt vierzigmal.
                </div>
              </div>
            </div>
            <span className="flex items-center gap-1.5 whitespace-nowrap pl-10 text-[14px] font-semibold text-kohle sm:pl-0">
              Zum Projektbereich
              <ArrowRight size={15} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>

        <p className="mt-10 max-w-[76ch] text-[13px] leading-relaxed text-kohle-3">
          Prototyp. Alle Preise sind erfunden. Der Plan wird aus deinen Eingaben wirklich
          gerechnet — das Einlesen von Grundrissen im Projektbereich und die Bestellung sind
          nachgestellt. Und so gut ein Plan auch aussieht: bevor bestellt wird, misst jemand
          den fertigen Raum nach.
        </p>
      </main>
    </div>
  );
}
