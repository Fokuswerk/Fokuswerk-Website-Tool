"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Check, Ruler, ScanLine, Sparkles } from "lucide-react";
import { eur } from "@/lib/berechnung";
import { alsKuechentyp, planeKueche, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";
import { Kuechenbild } from "@/components/warm/Kuechenbild";
import { LiveHero } from "@/components/warm/LiveHero";

function Zeichen() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <rect x="1.5" y="3.5" width="19" height="15" rx="2.5" fill="none" strokeWidth="1.6" className="stroke-kohle" />
      <path d="M1.5 10.5 H20.5" strokeWidth="1.6" className="stroke-kohle" />
      <path d="M7.4 13.4 V16.2 M14.6 13.4 V16.2" strokeWidth="1.8" strokeLinecap="round" className="stroke-butter" />
      <path d="M7.4 6 V8.2 M14.6 6 V8.2" strokeWidth="1.8" strokeLinecap="round" className="stroke-butter" />
    </svg>
  );
}

const BEISPIELE: Array<{ titel: string; satz: string; raum: Partial<Raumangaben> }> = [
  {
    titel: "Kleine Mietwohnung",
    satz: "2,40 m an einer Wand, einfache Ausstattung, ohne Spülmaschine",
    raum: {
      breite: 2400,
      nutz: { haupt: 2400, links: 2600, rechts: 2600, gegenueber: 2400 },
      fenster: null,
      niveau: "einfach",
      geraete: { ...STANDARD_RAUM.geraete, spuelmaschine: "gs-keine", kuehlschrank: "kuehl-klein" },
    },
  },
  {
    titel: "Normale Küche",
    satz: "3,40 m, Fenster, Spülmaschine, mittlere Ausstattung",
    raum: {},
  },
  {
    titel: "Großer Raum",
    satz: "4,40 m, Induktion, Backofen auf Griffhöhe, gehoben",
    raum: {
      breite: 4400,
      nutz: { haupt: 4400, links: 2800, rechts: 2800, gegenueber: 4400 },
      niveau: "gehoben",
      geraete: { ...STANDARD_RAUM.geraete, kochfeld: "kf-induktion", backofen: "ofen-hoch" },
    },
  },
];

const SCHRITTE = [
  { nr: "1", titel: "Raum beschreiben", satz: "Wandlängen, Fenster, Tür, Wasseranschluss. Mit dem Zollstock in fünf Minuten erledigt.", icon: Ruler },
  { nr: "2", titel: "Oder Grundriss hochladen", satz: "Hast du einen Plan? Dann lesen wir die Maße heraus, und du prüfst sie einmal nach.", icon: ScanLine },
  { nr: "3", titel: "Küche aussuchen", satz: "Drei fertige Vorschläge mit Preis. Du wählst, wir schicken dir das Angebot.", icon: Sparkles },
];

export default function Start() {
  const beispiele = useMemo(
    () =>
      BEISPIELE.map((b) => {
        const raum = { ...STANDARD_RAUM, ...b.raum } as Raumangaben;
        return { ...b, typ: alsKuechentyp(raum), plan: planeKueche(raum, "arbeiten") };
      }),
    [],
  );
  const von = Math.min(...beispiele.map((b) => b.plan.preis));
  const bis = Math.max(...beispiele.map((b) => b.plan.preis));

  return (
    <div className="warm min-h-full">
      {/* Kopf */}
      <header className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <Zeichen />
          <span className="gross text-[17px] font-bold text-kohle">Serienküche</span>
          <span className="ml-1 rounded-full bg-butter-soft px-2.5 py-[3px] text-[11px] font-semibold text-kohle-2">
            Prototyp
          </span>
        </div>
        <Link href="/dashboard" className="text-[14px] font-semibold text-kohle-2 hover:text-kohle">
          Für Bauträger
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1240px] px-5 pb-6 pt-6 sm:px-8 sm:pt-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
          <div>
            <h1 className="gross max-w-[14ch] text-[42px] font-bold leading-[1.02] tracking-[-0.025em] text-kohle sm:text-[58px]">
              Deine neue Küche. Ohne Termin im Küchenstudio.
            </h1>
            <p className="mt-6 max-w-[46ch] text-[18px] leading-[1.6] text-kohle-2">
              Sag uns, wie dein Raum aussieht. Wir rechnen die Küche aus, die dort wirklich
              passt — jeder Schrank im Maß, jedes Gerät ausgesucht, der Preis komplett.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/kueche">
                <span className="warm-wahl inline-flex items-center gap-2.5 rounded-full bg-kohle px-8 py-4 text-[17px] font-semibold text-creme shadow-[0_12px_30px_-10px_rgba(23,22,15,0.6)]">
                  Küche planen
                  <ArrowRight size={19} strokeWidth={2.2} />
                </span>
              </Link>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
              {["Fünf Minuten", "Kein Konto", "Kostenlos und unverbindlich"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-[14.5px] font-medium text-kohle-2">
                  <Check size={15} strokeWidth={2.6} className="text-salbei" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <LiveHero />
        </div>
      </section>

      {/* Wie es geht */}
      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="gross max-w-[20ch] text-[30px] font-bold leading-[1.12] text-kohle sm:text-[38px]">
          Drei Schritte, keine Vorkenntnisse.
        </h2>
        <div className="mt-9 grid gap-x-8 gap-y-9 sm:grid-cols-3">
          {SCHRITTE.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.nr}>
                <div className="flex items-center gap-3">
                  <span className="gross flex h-10 w-10 items-center justify-center rounded-full bg-kohle text-[17px] font-bold text-creme">
                    {s.nr}
                  </span>
                  <Icon size={19} strokeWidth={1.8} className="text-butter" />
                </div>
                <h3 className="gross mt-4 text-[19px] font-bold text-kohle">{s.titel}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-kohle-2">{s.satz}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dunkles Band: der Einwand, der Leute wirklich stoppt */}
      <section className="bg-kohle py-16 text-creme sm:py-20">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 className="gross text-[30px] font-bold leading-[1.12] sm:text-[38px]">
              Und wenn es am Ende nicht passt?
            </h2>
            <p className="mt-5 max-w-[48ch] text-[17px] leading-[1.65] text-creme/75">
              Passiert nicht. Jeder Schrank folgt dem Raster, mit dem Küchen gebaut werden, und
              der Rest einer Wand wird zur zugeschnittenen Leiste. Was nicht hineinpasst, sagen
              wir dir sofort — statt dir eine Küche zu verkaufen, die nicht hineingeht.
            </p>
          </div>
          <div className="space-y-5">
            {[
              ["Wir rechnen auf den Zentimeter", "Die Summe aller Schrankbreiten ergibt exakt deine Wandlänge. Immer."],
              ["Wir kennen die Regeln", "Nichts Hohes vor dem Fenster, Abstand neben dem Herd, Spüle am Wasseranschluss."],
              ["Vor der Bestellung misst jemand nach", "Wände sind nie ganz gerade. Dein Plan bleibt, die Maße werden bestätigt."],
            ].map(([t, s]) => (
              <div key={t} className="flex gap-4 border-t border-creme/15 pt-5 first:border-t-0 first:pt-0">
                <Check size={19} strokeWidth={2.4} className="mt-0.5 shrink-0 text-butter" />
                <div>
                  <div className="gross text-[17px] font-bold">{t}</div>
                  <div className="mt-1 text-[15px] leading-relaxed text-creme/70">{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preisanker aus echt gerechneten Beispielen */}
      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="gross max-w-[22ch] text-[30px] font-bold leading-[1.12] text-kohle sm:text-[38px]">
          Was kostet so eine Küche?
        </h2>
        <p className="mt-4 max-w-[56ch] text-[16px] leading-relaxed text-kohle-2">
          Je nach Raum und Ausstattung zwischen {eur(von)} und {eur(bis)} — komplett, mit
          Geräten und Montage. Die drei Beispiele sind mit demselben Planer gerechnet, der
          gleich auch deine Küche rechnet.
        </p>

        <div className="mt-9 grid gap-5 lg:grid-cols-3">
          {beispiele.map((b) => (
            <div key={b.titel} className="overflow-hidden rounded-[22px] bg-papier shadow-[0_3px_16px_-6px_rgba(23,22,15,0.18)]">
              <div className="bg-creme-2/60 px-4 pt-4">
                <Kuechenbild typ={b.typ} variante={b.plan.variante} zeileId={b.typ.zeilen[0].id} hoehe={135} mitNamen={false} />
              </div>
              <div className="p-5">
                <div className="gross text-[18px] font-bold text-kohle">{b.titel}</div>
                <div className="mt-1 text-[14px] leading-snug text-kohle-2">{b.satz}</div>
                <div className="gross mt-4 border-t border-linie-warm pt-4 text-[26px] font-bold leading-none text-kohle">
                  {eur(b.plan.preis)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-5">
          <Link href="/kueche">
            <span className="warm-wahl inline-flex items-center gap-2.5 rounded-full bg-kohle px-8 py-4 text-[17px] font-semibold text-creme shadow-[0_12px_30px_-10px_rgba(23,22,15,0.6)]">
              Jetzt deine rechnen lassen
              <ArrowRight size={19} strokeWidth={2.2} />
            </span>
          </Link>
          <span className="text-[14.5px] text-kohle-3">Du bekommst sofort ein Ergebnis, keine Rückrufbitte.</span>
        </div>
      </section>

      {/* Bauträger, bewusst klein */}
      <section className="mx-auto max-w-[1240px] px-5 pb-16 sm:px-8">
        <Link
          href="/dashboard"
          className="group flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-linie-warm px-6 py-5 transition-colors hover:border-kohle-3"
        >
          <div>
            <div className="gross text-[16px] font-bold text-kohle">Sie planen ein ganzes Haus?</div>
            <div className="mt-1 max-w-[70ch] text-[14px] leading-relaxed text-kohle-2">
              Für Bauträger und Wohnungsunternehmen: Grundrisse aller Wohnungen einlesen,
              ähnliche Küchen zu wenigen Typen zusammenfassen und einmal planen statt vierzigmal.
            </div>
          </div>
          <span className="flex items-center gap-1.5 whitespace-nowrap text-[14px] font-semibold text-kohle">
            Zum Projektbereich
            <ArrowRight size={15} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <p className="mt-8 max-w-[80ch] text-[13px] leading-relaxed text-kohle-3">
          Prototyp. Alle Preise sind erfunden. Der Plan wird aus deinen Eingaben wirklich
          gerechnet; das Einlesen von Grundrissen und die Bestellung sind nachgestellt. Und so
          gut ein Plan auch aussieht: bevor bestellt wird, misst jemand den fertigen Raum nach.
        </p>
      </section>
    </div>
  );
}
