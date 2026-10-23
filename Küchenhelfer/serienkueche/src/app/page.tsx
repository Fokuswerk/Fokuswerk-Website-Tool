"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { eur } from "@/lib/berechnung";
import { alsKuechentyp, planeKueche, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";
import { Kuechenbild } from "@/components/warm/Kuechenbild";
import { LiveHero } from "@/components/warm/LiveHero";

/**
 * Die Startseite zeigt die Küche, statt über sie zu reden: ganz oben steht
 * das Produkt, groß und anfassbar, und der Preis läuft mit. Alles andere
 * tritt zurück — eine Schrift, kaum Linien, keine Farbe in der Oberfläche.
 */

function Zeichen() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true">
      <rect x="1.6" y="3.6" width="18.8" height="14.8" rx="2.6" fill="none" strokeWidth="1.7" className="stroke-kohle" />
      <path d="M1.6 10.5 H20.4" strokeWidth="1.7" className="stroke-kohle" />
      <path d="M7.4 13.6 V16.1 M14.6 13.6 V16.1" strokeWidth="1.7" strokeLinecap="round" className="stroke-kohle-3" />
      <path d="M7.4 6.1 V8.3 M14.6 6.1 V8.3" strokeWidth="1.7" strokeLinecap="round" className="stroke-kohle-3" />
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
  { titel: "Normale Küche", satz: "3,40 m, Fenster, Spülmaschine, mittlere Ausstattung", raum: {} },
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
  ["01", "Raum beschreiben", "Wandlängen, Fenster, Tür, Wasseranschluss. Mit dem Zollstock in fünf Minuten erledigt."],
  ["02", "Oder Grundriss hochladen", "Hast du einen Plan? Dann lesen wir die Maße heraus, und du prüfst sie einmal nach."],
  ["03", "Küche aussuchen", "Drei fertige Vorschläge mit Preis. Du wählst, wir schicken dir das Angebot."],
];

const ZUSAGEN = [
  ["Wir rechnen auf den Zentimeter", "Die Summe aller Schrankbreiten ergibt exakt deine Wandlänge. Immer."],
  ["Wir kennen die Regeln", "Nichts Hohes vor dem Fenster, Abstand neben dem Herd, Spüle am Wasseranschluss."],
  ["Vor der Bestellung misst jemand nach", "Wände sind nie ganz gerade. Dein Plan bleibt, die Maße werden bestätigt."],
];

function Knopf({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 rounded-full bg-kohle px-8 py-4 text-[16.5px] font-semibold text-creme transition-colors hover:bg-[#312e25]"
    >
      {children}
      <ArrowRight size={18} strokeWidth={2.2} />
    </Link>
  );
}

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
      <header className="mx-auto flex h-[64px] max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <Zeichen />
          <span className="gross text-[16px] font-bold text-kohle">Serienküche</span>
          <span className="ml-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-kohle-3">Prototyp</span>
        </div>
        <Link href="/dashboard" className="text-[14px] font-medium text-kohle-2 transition-colors hover:text-kohle">
          Für Bauträger
        </Link>
      </header>

      {/* Auftakt: erst der Satz, dann die Küche selbst. */}
      <section className="mx-auto max-w-[1180px] px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-20">
        <div className="mx-auto max-w-[860px] text-center">
          <h1 className="gross gross-xl mx-auto max-w-[17ch] text-[42px] font-bold text-kohle sm:text-[60px] lg:text-[74px]">
            Deine neue Küche. Ohne Termin im Küchenstudio.
          </h1>
          <p className="mx-auto mt-7 max-w-[52ch] text-[18px] leading-[1.6] text-kohle-2">
            Sag uns, wie dein Raum aussieht. Wir rechnen die Küche aus, die dort wirklich passt —
            jeder Schrank im Maß, jedes Gerät ausgesucht, der Preis komplett.
          </p>
          <div className="mt-9">
            <Knopf href="/kueche">Küche planen</Knopf>
          </div>
          <p className="mt-5 text-[14px] text-kohle-3">
            Fünf Minuten · kein Konto · kostenlos und unverbindlich
          </p>
        </div>

        <div className="mt-14 sm:mt-20">
          <LiveHero />
        </div>
      </section>

      {/* Drei Schritte */}
      <section className="mx-auto max-w-[1180px] px-5 pb-20 sm:px-8 sm:pb-28">
        <h2 className="gross max-w-[20ch] text-[32px] font-bold leading-[1.08] text-kohle sm:text-[44px]">
          Drei Schritte, keine Vorkenntnisse.
        </h2>
        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-3">
          {SCHRITTE.map(([nr, titel, satz]) => (
            <div key={nr} className="border-t border-linie-warm pt-6">
              <div className="vorzeile ziffern">{nr}</div>
              <h3 className="gross mt-3 text-[20px] font-bold text-kohle">{titel}</h3>
              <p className="mt-2.5 text-[15.5px] leading-relaxed text-kohle-2">{satz}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Der Einwand, der Leute wirklich stoppt */}
      <section className="bg-kohle py-20 text-creme sm:py-28">
        <div className="mx-auto grid max-w-[1180px] items-start gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="gross text-[32px] font-bold leading-[1.08] sm:text-[44px]">
              Und wenn es am Ende nicht passt?
            </h2>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.65] text-creme/70">
              Passiert nicht. Jeder Schrank folgt dem Raster, mit dem Küchen gebaut werden, und der
              Rest einer Wand wird zur zugeschnittenen Leiste. Was nicht hineinpasst, sagen wir dir
              sofort — statt dir eine Küche zu verkaufen, die nicht hineingeht.
            </p>
          </div>
          <div>
            {ZUSAGEN.map(([t, s]) => (
              <div key={t} className="border-t border-creme/15 py-6 first:border-t-0 first:pt-0 last:pb-0">
                <div className="gross text-[18px] font-bold">{t}</div>
                <div className="mt-2 text-[15.5px] leading-relaxed text-creme/65">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preis, aus echt gerechneten Beispielen */}
      <section className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 sm:py-28">
        <h2 className="gross max-w-[22ch] text-[32px] font-bold leading-[1.08] text-kohle sm:text-[44px]">
          Was kostet so eine Küche?
        </h2>
        <p className="ziffern mt-6 max-w-[58ch] text-[16.5px] leading-relaxed text-kohle-2">
          Je nach Raum und Ausstattung zwischen {eur(von)} und {eur(bis)} — komplett, mit Geräten und
          Montage. Die drei Beispiele sind mit demselben Planer gerechnet, der gleich auch deine
          Küche rechnet.
        </p>

        <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-3">
          {beispiele.map((b) => (
            <div key={b.titel} className="border-t border-linie-warm pt-6">
              <Kuechenbild
                typ={b.typ}
                variante={b.plan.variante}
                zeileId={b.typ.zeilen[0].id}
                hoehe={140}
                mitNamen={false}
              />
              <div className="gross mt-5 text-[19px] font-bold text-kohle">{b.titel}</div>
              <div className="mt-1.5 text-[14.5px] leading-snug text-kohle-2">{b.satz}</div>
              <div className="gross ziffern mt-4 text-[28px] font-bold leading-none text-kohle">
                {eur(b.plan.preis)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-6">
          <Knopf href="/kueche">Jetzt deine rechnen lassen</Knopf>
          <span className="text-[14.5px] text-kohle-3">Du bekommst sofort ein Ergebnis, keine Rückrufbitte.</span>
        </div>
      </section>

      {/* Bauträger, bewusst klein */}
      <section className="mx-auto max-w-[1180px] px-5 pb-20 sm:px-8">
        <Link
          href="/dashboard"
          className="group flex flex-wrap items-center justify-between gap-5 border-t border-linie-warm pt-8"
        >
          <div>
            <div className="gross text-[17px] font-bold text-kohle">Sie planen ein ganzes Haus?</div>
            <div className="mt-2 max-w-[68ch] text-[14.5px] leading-relaxed text-kohle-2">
              Für Bauträger und Wohnungsunternehmen: Grundrisse aller Wohnungen einlesen, ähnliche
              Küchen zu wenigen Typen zusammenfassen und einmal planen statt vierzigmal.
            </div>
          </div>
          <span className="flex items-center gap-1.5 whitespace-nowrap text-[14.5px] font-semibold text-kohle">
            Zum Projektbereich
            <ArrowRight size={15} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <p className="mt-10 max-w-[78ch] text-[13px] leading-relaxed text-kohle-3">
          Prototyp. Alle Preise sind erfunden. Der Plan wird aus deinen Eingaben wirklich gerechnet;
          das Einlesen von Grundrissen und die Bestellung sind nachgestellt. Und so gut ein Plan auch
          aussieht: bevor bestellt wird, misst jemand den fertigen Raum nach.
        </p>
      </section>
    </div>
  );
}
