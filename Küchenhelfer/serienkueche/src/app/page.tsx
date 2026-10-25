"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { brutto, eur } from "@/lib/berechnung";
import { alsKuechentyp, planeKueche, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";
import { Kuechenbild } from "@/components/warm/Kuechenbild";
import { Raumfrage } from "@/components/warm/Raumfrage";
import { FOTOS, FOTO_HINWEIS, FOTO_URHEBER, fotoUrl, type Foto } from "@/data/fotos";
import { anzahlModelle, ARTEN, FOTO_QUELLE, FOTOS_LIZENZIERT, GERAETEFOTO_HINWEIS, PREISSTAND_GERAETE, schaustueck } from "@/data/geraete";

/**
 * Die Startseite.
 *
 * Erst das Gefühl, dann der Beweis: ein großes Bild mit dem Satz darauf,
 * und direkt darunter — halb in das Bild hineinragend — die Küche, die das
 * Werkzeug wirklich rechnet. Danach wechseln helle und dunkle Abschnitte,
 * damit die Seite einen Puls hat und nicht als eine lange Fläche herunterläuft.
 */

function Zeichen({ hell = false }: { hell?: boolean }) {
  const strich = hell ? "stroke-creme" : "stroke-kohle";
  const fein = hell ? "stroke-creme/60" : "stroke-kohle-3";
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true">
      <rect x="1.6" y="3.6" width="18.8" height="14.8" rx="2.6" fill="none" strokeWidth="1.7" className={strich} />
      <path d="M1.6 10.5 H20.4" strokeWidth="1.7" className={strich} />
      <path d="M7.4 13.6 V16.1 M14.6 13.6 V16.1" strokeWidth="1.7" strokeLinecap="round" className={fein} />
      <path d="M7.4 6.1 V8.3 M14.6 6.1 V8.3" strokeWidth="1.7" strokeLinecap="round" className={fein} />
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
      geraete: { ...STANDARD_RAUM.geraete, spuelmaschine: "gs-keine", kuehlschrank: "ks-bosch-kur21" },
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
      geraete: { ...STANDARD_RAUM.geraete, kochfeld: "kf-siemens-ex645", backofen: "bo-siemens-hb774" },
      ofenHoch: true,
    },
  },
];

const ARTNAME: Record<string, string> = {
  kuehlschrank: "Kühlschrank",
  kochfeld: "Kochfeld",
  backofen: "Backofen",
  spuelmaschine: "Spülmaschine",
  dunstabzug: "Dunstabzug",
};


const ZUSAGEN = [
  ["Wir rechnen auf den Zentimeter", "Die Summe aller Schrankbreiten ergibt exakt die Länge deiner Küchenzeile — die Passleiste eingerechnet. Immer."],
  ["Wir kennen die Regeln", "Nichts Hohes vor dem Fenster, Abstand neben dem Herd, Spüle am Wasseranschluss."],
  ["Vor der Bestellung misst jemand nach", "Wände sind nie ganz gerade. Dein Plan bleibt, die Maße werden bestätigt."],
];

/** Ein Foto, das seinen Platz füllt, mit einem warmen Schleier darüber,
    damit die Bilder zur Farbigkeit der Seite passen. */
function Bild({
  f, breite, hoehe, schleier = true, prioritaet = false, masse = "(max-width: 1023px) 100vw, 60vw",
}: {
  f: Foto; breite: number; hoehe: number; schleier?: boolean; prioritaet?: boolean;
  /** Wie breit das Bild an seinem Platz wirklich wird. Ein einziger Wert für
      sieben verschiedene Plätze lädt für den Hero zu wenig und für die
      kleinen Kacheln zu viel. */
  masse?: string;
}) {
  return (
    <>
      <Image
        src={fotoUrl(f, breite)}
        alt={f.alt}
        width={breite}
        height={hoehe}
        priority={prioritaet}
        /* Der Ausschnitt haengt am Seitenverhaeltnis des Platzes, nicht an
           einem festen Wert — deshalb steht er in CSS und nicht hier.
           Nachgemessen: das Foto ist 2400x3200, ein Hochformat. Am Handy
           (Rahmen 0,46) ist die ganze Hoehe zu sehen, der senkrechte Wert
           aendert dort gar nichts. Am Schreibtisch (Rahmen bis 1,91) bleibt
           nur ein knappes Drittel der Hoehe uebrig: bei 64 Prozent war das
           die dunkle Insel, und der Auftakt sah aus wie eine schwarze Flaeche.
           Bei 30 Prozent liegt dort die Decke mit dem Fensterlicht. */
        className="hero-foto h-full w-full object-cover"
        sizes={masse}
      />
      {schleier && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(60,48,30,0.06), rgba(40,32,20,0.14))" }}
        />
      )}
    </>
  );
}

function Knopf({ href, children, hell = false }: { href: string; children: ReactNode; hell?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 rounded-[3px] px-8 py-4 text-[16.5px] font-semibold transition-colors ${
        hell
          ? "bg-creme text-kohle hover:bg-white"
          : "bg-gradient-to-b from-[#3b382f] to-kohle text-creme shadow-[0_1px_2px_rgba(21,20,15,.2),0_10px_24px_-10px_rgba(21,20,15,.55),inset_0_1px_0_rgba(255,255,255,.14)] hover:from-[#474338]"
      }`}
    >
      {children}
      <ArrowRight size={18} strokeWidth={2.2} />
    </Link>
  );
}

/** Was jeder kennt, der schon mal eine Kueche gekauft hat. */
const SAMSTAGE: Array<[string, string, string]> = [
  [
    "01",
    "Samstag eins. Zwei Stunden Beratung, am Ende kein Preis.",
    "Gemessen hat der Verkäufer, gezeichnet hat er auch. Mitnehmen darfst du den Plan nicht.",
  ],
  [
    "02",
    "Samstag zwei. Ein Angebot über eine runde Summe.",
    "Vier Zeilen, ein Gesamtbetrag. Was die Spüle kostet und was die Montage, steht nicht drin.",
  ],
  [
    "03",
    "Samstag drei. Der Kühlschrank steht vor dem Fenster.",
    "Im Plan sah es nach genug Platz aus. Auffallen wird es am Liefertag.",
  ],
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
    <div className="warm min-h-full overflow-x-clip">
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[3px] focus:bg-kohle focus:px-4 focus:py-2 focus:text-[14px] focus:font-semibold focus:text-creme"
      >
        Zum Inhalt springen
      </a>
      {/* ---------- Auftakt: ein Bild, ein Satz ---------- */}
      {/* 86vh hiess: unten lugt immer der naechste Abschnitt rein, und genau das
          ist "es ist nicht Fullscreen". svh statt vh, damit auf dem Handy die
          ein- und ausfahrende Browserleiste das Bild nicht springen laesst. */}
      <section className="auf-dunkel relative isolate flex min-h-svh flex-col">
        <div className="absolute inset-0 -z-10 overflow-hidden bg-marke-tief">
          <Bild f={FOTOS.hero} breite={2400} hoehe={3200} schleier={false} prioritaet masse="100vw" />
          <span
            aria-hidden="true"
            className="absolute inset-0 hero-schleier"
            /* Der Verlauf faerbt das Foto in der Markenfarbe ein, statt es nur
               abzudunkeln. Mit Fast-Schwarz wirkt ein Tageslichtfoto einfach
               dunkel; mit dem Oliv bekommt die ganze Seite ein Gesicht. */

          />
        </div>

        <header className="mx-auto flex h-[72px] w-full max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <Zeichen hell />
            <span className="gross text-[16px] font-bold text-creme">Serienküche</span>
            <span className="ml-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-creme/55">Prototyp</span>
          </div>
          <Link href="/dashboard" className="text-[14px] font-medium text-creme/75 transition-colors hover:text-creme">
            Für Bauträger
          </Link>
        </header>

        {/* Der Text stand mittig — also genau ueber der hellsten Stelle des Fotos,
            der weissen Decke am Fensterlicht. Damit er dort lesbar war, musste
            der Schleier das ganze Bild zudecken, und uebrig blieb eine gruene
            Flaeche. Jetzt steht er unten, wo die Insel und der Boden ohnehin
            dunkel sind: die obere Haelfte bleibt das Foto. */}
        <main id="inhalt" className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-end px-5 pb-24 pt-10 sm:px-8 sm:pb-28">
          <h1 className="gross gross-xl max-w-[18ch] text-[44px] font-bold text-creme sm:text-[68px] lg:text-[86px]">
            Deine neue Küche. Ohne Termin im Küchenstudio.
          </h1>
          <p className="mt-7 max-w-[54ch] text-[17.5px] leading-[1.6] text-creme/80 sm:text-[19px]">
            Sag uns, wie dein Raum aussieht. Wir rechnen die Küche aus, die dort wirklich passt —
            jeder Schrank im Maß, jedes Gerät ausgesucht, der Preis komplett.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Knopf href="/kueche" hell>Küche planen</Knopf>
            <span className="text-[14px] text-creme/65">
              Fünf Minuten · kein Konto · kostenlos
            </span>
          </div>
        </main>
      </section>

      {/* ---------- So laeuft das sonst: Wiedererkennung ----------
           Hier standen nacheinander drei Versuche, das Rechnen vorzufuehren:
           ein Regler mit Preis, einer mit den Saetzen des Planers, dann das
           Stuecklistenblatt. Alle drei waren richtig und alle drei falsch an
           dieser Stelle — direkt nach dem Auftakt will niemand verstehen, wie
           wir arbeiten. Er will sich wiedererkennen.
           Deshalb steht hier jetzt kein Beweis, keine Tabelle und keine Zahl,
           sondern das, was jeder kennt, der schon mal eine Kueche gekauft
           hat. Nichts daran muss man lesen lernen. */}
      {/* Nachgemessen lagen hier 3,3 Bildschirme am Stueck bei Helligkeit 2 von
          100 — der Auftakt und dieser Abschnitt waren beide dunkel, und der
          Schnitt dazwischen trennte Dunkel von Dunkel. Eine Kante, die man
          sieht, die aber nichts trennt, liest sich als Fehler. Dazu sassen die
          vier Karten als einziges Helles mitten in dieser Strecke.
          Jetzt ist der Abschnitt mit der Frage HELL. Damit trennt der Schnitt
          wirklich etwas, die Karten stehen nicht mehr als Insel im Dunkeln,
          und die Seite wechselt sich ab: dunkel, hell, dunkel, hell. */}
      {/* KEIN z-index auf diesem Abschnitt. Mit "relative z-10" macht er einen
          eigenen Stapelkontext auf, und dann koennen die Karten darin nicht
          mehr ueber den dunklen Abschnitt steigen — der helle Grund malt die
          Ueberlappung wieder zu. Gemessen: der dunkle Abschnitt beginnt 140 px
          vor dem Kartenende, zu sehen war davon nichts. Der Stapelkontext
          gehoert an das Kartenraster, nicht an den Abschnitt. */}
      <section className="bg-creme">
        <div className="pt-24 sm:pt-32">
          <Raumfrage />
        </div>
      </section>

      <section className="auf-dunkel relative bg-marke text-creme">
        <div className="mx-auto max-w-[1240px] px-5 pb-20 pt-[150px] sm:px-8 sm:pb-28 sm:pt-[200px]">
          <h2 className="gross max-w-[14ch] text-[34px] font-bold leading-[1.04] sm:text-[52px]">
            So läuft das sonst.
          </h2>

          <ol className="mt-12 sm:mt-16">
            {SAMSTAGE.map(([nr, satz, dazu]) => (
              <li
                key={nr}
                className="grid gap-x-8 gap-y-2 border-t border-creme/15 py-7 sm:grid-cols-[64px_minmax(0,1fr)] sm:py-9"
              >
                <span className="gross ziffern text-[15px] leading-none text-messing sm:pt-2">{nr}</span>
                <div className="min-w-0">
                  <p className="gross max-w-[26ch] text-[23px] font-semibold leading-[1.18] text-creme sm:text-[31px]">
                    {satz}
                  </p>
                  <p className="mt-2.5 max-w-[52ch] text-[15.5px] leading-relaxed text-creme/60">{dazu}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="gross mt-12 text-[26px] font-semibold leading-tight text-creme sm:mt-14 sm:text-[36px]">
            Kann man so machen. Muss man nicht.
          </p>
          <div className="mt-8">
            <Knopf href="/kueche" hell>Küche planen</Knopf>
          </div>
        </div>
      </section>

      {/* ---------- Die Geräte, die wirklich drinstehen ---------- */}
      <section className="border-y border-linie-warm bg-creme">
        <div className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 sm:py-32">
          <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
            <h2 className="gross max-w-[20ch] text-[32px] font-bold leading-[1.08] text-kohle sm:text-[46px]">
              Keine Markengeräte nach Wahl. Diese hier.
            </h2>
            <p className="mt-6 max-w-[42ch] text-[16.5px] leading-[1.65] text-kohle-2 lg:mt-0 lg:shrink-0">
              Bosch und Siemens, jedes mit Modellnummer und Preis. Du suchst sie einzeln aus und
              siehst sofort, was die Küche dadurch kostet.
            </p>
          </div>

          {/* Auf dem Handy zwei nebeneinander: fünf volle Karten untereinander
              waeren ein halber Bildschirmkilometer bis zum naechsten Knopf. */}
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {ARTEN.map(({ art }) => {
              const g = schaustueck(art);
              if (!g?.foto) return null;
              return (
                <li key={art} className="flaeche flex flex-col overflow-hidden rounded-[3px]">
                  <div className="vertieft flex h-[118px] items-center justify-center bg-papier sm:h-[158px]">
                    <Image
                      src={g.foto}
                      alt={`${g.marke} ${g.modell ?? g.name}`}
                      width={400}
                      height={400}
                      className="h-full w-full object-contain p-4"
                      sizes="(max-width: 639.98px) 46vw, (max-width: 1023.98px) 31vw, 240px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3.5 sm:px-4 sm:pb-4 sm:pt-4">
                    <div className="vorzeile">{ARTNAME[art]}</div>
                    <div className="gross mt-1.5 text-[15px] font-bold leading-tight text-kohle sm:text-[16px]">
                      {[g.marke, g.serie].filter(Boolean).join(" ")}
                    </div>
                    <div className="ziffern mt-0.5 text-[12.5px] text-kohle-3">{g.modell}</div>
                    <div className="ziffern mt-auto flex flex-wrap items-baseline justify-between gap-x-2 border-t border-linie-warm pt-3 text-[12.5px] text-kohle-3 sm:text-[13px]">
                      <span>{anzahlModelle(art)} Modelle</span>
                      <span className="font-semibold text-kohle">{eur(g.richtpreis)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 text-[12.5px] leading-relaxed text-kohle-3">
            {FOTO_QUELLE}. Preise sind recherchierte Straßenpreise, Stand {PREISSTAND_GERAETE} —
            Momentaufnahmen, keine Einkaufskonditionen.
            {!FOTOS_LIZENZIERT && <> {GERAETEFOTO_HINWEIS}</>}
          </p>
        </div>
      </section>

      {/* ---------- Bild, das über den Rand läuft ---------- */}
      {/* Gemessen: 0 px Abstand zur Oberkante des vorherigen Abschnitts — das
          Bild stiess ohne Luft direkt an den Farbwechsel. Jetzt steht es mit
          Luft oben und unten mittig im hellen Abschnitt. */}
      <section className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="relative h-[clamp(280px,46vw,540px)] overflow-hidden rounded-[3px] lg:-ml-[max(2rem,calc((100vw-1240px)/2+2rem))] lg:rounded-l-none">
          <Bild f={FOTOS.gruen} breite={1800} hoehe={1565} masse="(max-width: 1023px) 100vw, calc(50vw + 8px)" />
        </div>
        <div>
          <h2 className="gross max-w-[18ch] text-[30px] font-bold leading-[1.08] text-kohle sm:text-[40px]">
            Dieselbe Küche, nur ohne vier Wochen Wartezeit.
          </h2>
          <p className="mt-6 max-w-[46ch] text-[16.5px] leading-[1.65] text-kohle-2">
            Ein Küchenstudio zeichnet deine Küche von Hand — deshalb dauert es und deshalb
            bekommst du den Plan nur halb. Hier rechnet sie ein Programm, in Sekunden, mit
            denselben Regeln und denselben Maßen. Und der Plan gehört dir.
          </p>
          <div className="mt-8">
            <Knopf href="/kueche">Küche planen</Knopf>
          </div>
        </div>
      </section>

      {/* ---------- Dunkles Band, Bild bis an die Kante ---------- */}
      <section className="auf-dunkel relative isolate overflow-hidden bg-marke text-creme">
        <div className="lg:grid lg:grid-cols-[1fr_minmax(0,36%)]">
          {/* "ml-auto" schob die 760er Spalte an den rechten Rand ihrer Zelle —
                auf 2560 px blieben links 904 px schwarzes Nichts, 35 % der
                Breite. Jetzt beginnt der Text genau am Seitenrand wie jeder
                andere Abschnitt auch. */}
          <div className="w-full px-5 py-24 sm:px-8 sm:py-32 lg:py-36 lg:pl-[max(2rem,calc((100vw-1240px)/2))] lg:pr-16">
            <h2 className="gross text-[32px] font-bold leading-[1.08] sm:text-[46px]">
              Und wenn es am Ende nicht passt?
            </h2>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.65] text-creme/70">
              Passiert nicht. Jeder Schrank folgt dem Raster, mit dem Küchen gebaut werden, und der
              Rest einer Wand wird zur zugeschnittenen Leiste. Was nicht hineinpasst, sagen wir dir
              sofort — statt dir eine Küche zu verkaufen, die nicht hineingeht.
            </p>
            <div className="mt-10">
              {ZUSAGEN.map(([t, sz]) => (
                <div key={t} className="border-t border-creme/15 py-6 last:pb-0">
                  <div className="gross text-[18px] font-bold">{t}</div>
                  <div className="mt-2 text-[15.5px] leading-relaxed text-creme/65">{sz}</div>
                </div>
              ))}
            </div>
            {/* Gemessen am Handy: zwischen diesem Band und dem Knopf im
                Preisteil lagen 3928 px — 4,8 Bildschirme Galerie und Preise
                ohne eine einzige Stelle zum Weitermachen. Hier ist die Zusage
                gerade gegeben; das ist die Stelle, an der jemand loslegt. */}
            <div className="mt-10">
              <Knopf href="/kueche" hell>Küche planen</Knopf>
            </div>
          </div>
          <div className="relative h-[clamp(220px,46vw,340px)] lg:h-auto">
            <Bild f={FOTOS.detail} breite={1200} hoehe={1500} schleier={false} masse="(max-width: 1023px) 100vw, 36vw" />
          </div>
        </div>
      </section>

      {/* ---------- Galerie ---------- */}
      <section className="mx-auto max-w-[1240px] px-5 pt-24 sm:px-8 sm:pt-32">
        <h2 className="gross max-w-[20ch] text-[32px] font-bold leading-[1.08] text-kohle sm:text-[46px]">
          So sieht so etwas aus, wenn es steht.
        </h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <figure className="relative h-[clamp(260px,42vw,480px)] overflow-hidden rounded-[3px]">
            <Bild f={FOTOS.insel} breite={1200} hoehe={1800} masse="(max-width: 1023px) 100vw, 664px" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-marke-tief/85 via-marke-tief/80 via-70% to-transparent p-5 text-[13.5px] font-medium text-creme">
              Dunkle Fronten, heller Stein — dieselbe Technik, andere Oberfläche.
            </figcaption>
          </figure>
          <div className="grid gap-5">
            <figure className="relative h-[clamp(180px,20vw,230px)] overflow-hidden rounded-[3px]">
              <Bild f={FOTOS.licht} breite={1200} hoehe={1600} masse="(max-width: 1023px) 100vw, 492px" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-marke-tief/85 via-marke-tief/80 via-70% to-transparent p-4 text-[13px] font-medium text-creme">
                Kochfeld in der Platte, nichts hängt darüber.
              </figcaption>
            </figure>
            <figure className="relative h-[clamp(180px,20vw,230px)] overflow-hidden rounded-[3px]">
              <Bild f={FOTOS.marmor} breite={1200} hoehe={784} masse="(max-width: 1023px) 100vw, 492px" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-marke-tief/85 via-marke-tief/80 via-70% to-transparent p-4 text-[13px] font-medium text-creme">
                Wandlänge gibt den Takt vor, nicht der Geschmack.
              </figcaption>
            </figure>
          </div>
        </div>
        <p className="mt-4 text-[12.5px] text-kohle-3">{FOTO_HINWEIS}</p>
      </section>

      {/* ---------- Preis, aus echt gerechneten Beispielen ---------- */}
      <section className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 sm:py-32">
        <h2 className="gross max-w-[22ch] text-[32px] font-bold leading-[1.08] text-kohle sm:text-[46px]">
          Was kostet so eine Küche?
        </h2>
        {/* Kein "ziffern" auf einem Absatz: die Klasse setzt jetzt die Mono, und
            ein ganzer Fliesstext in Monospace ist genau die Terminal-Anmutung,
            die abgelehnt wurde. Die Mono gehoert an die Zahl, nicht an den Satz. */}
        <p className="mt-6 max-w-[58ch] text-[16.5px] leading-relaxed text-kohle-2">
          Diese drei Beispiele liegen zwischen {eur(brutto(von))} und {eur(brutto(bis))} — komplett, mit Geräten,
          Montage und Mehrwertsteuer. Größere Räume und gehobene Ausstattung kosten mehr. Gerechnet sind sie
          mit demselben Planer, der gleich auch deine Küche rechnet.
        </p>

        {/* Hier standen drei Karten mit der Zahl darin — genau das Muster, das
            schon einmal durchgefallen ist: "Eine grosse Zahl braucht Raum,
            keine Umrandung. In 400 px Spaltenbreite kann sie nicht wirken."
            Also Kasten auf, Zahl frei, nur Haarlinien zwischen den Spalten.
            Die Zahl laeuft in der Mono: gleiche Ziffernbreite, und sie sieht
            aus wie abgelesen, nicht wie ausgedacht. */}
        <div className="mt-14 grid divide-y divide-linie-stark border-y border-linie-stark sm:mt-16 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {beispiele.map((b) => (
            <div key={b.titel} className="flex flex-col px-0 py-9 sm:px-7 sm:py-10 sm:first:pl-0 sm:last:pr-0">
              <div className="vorzeile">{b.titel}</div>
              {/* Die Mono traegt kleine Messwerte gut — Modellnummern, Masse,
                  Etiketten. Als 46-px-Zahl liest sie sich technisch statt
                  wertig: "wieder sehr KI-lastig". Grosse Zahlen stehen deshalb
                  in Plein. Zappeln koennen sie hier nicht, die drei Beispiele
                  sind gerechnet und stehen fest. */}
              <div className="gross mt-5 text-[46px] font-bold leading-none tracking-[-0.03em] text-kohle [font-variant-numeric:lining-nums] sm:text-[52px]">
                {eur(brutto(b.plan.preis))}
              </div>
              <div className="mt-3.5 max-w-[34ch] text-[14.5px] leading-snug text-kohle-2">{b.satz}</div>
              {/* Die Zeichnung steht auf Creme: die Schraenke sind hell, auf
                  weissem Grund verschwinden sie. */}
              <div className="mt-7 flex items-end bg-creme px-4 py-5">
                <Kuechenbild typ={b.typ} variante={b.plan.variante} zeileId={b.typ.zeilen[0].id} hoehe={132} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-6">
          <Knopf href="/kueche">Jetzt deine rechnen lassen</Knopf>
          <span className="text-[14.5px] text-kohle-3">Du bekommst sofort ein Ergebnis, keine Rückrufbitte.</span>
        </div>
      </section>

      {/* ---------- Bauträger, bewusst klein ---------- */}
      <section className="mx-auto max-w-[1240px] px-5 pb-20 sm:px-8">
        <Link
          href="/dashboard"
          className="group flex flex-wrap items-center justify-between gap-5 border-t border-linie-warm pt-8"
        >
          <div>
            <div className="gross text-[17px] font-bold text-kohle">Ein ganzes Haus planen?</div>
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

        {/* Rechtsseiten gehoeren in die Fusszeile — ohne sie ist die Seite
            nicht oeffentlich betreibbar, und es gab bisher keinen Ort, an dem
            sie verlinkt waeren. */}
        <nav aria-label="Rechtliches" className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-linie-warm pt-6 text-[13.5px]">
          <Link href="/impressum" className="text-kohle-2 underline underline-offset-2 hover:text-kohle">Impressum</Link>
          <Link href="/datenschutz" className="text-kohle-2 underline underline-offset-2 hover:text-kohle">Datenschutz</Link>
          <Link href="/dashboard" className="text-kohle-2 underline underline-offset-2 hover:text-kohle">Für Bauträger</Link>
        </nav>

        <p className="mt-6 max-w-[78ch] text-[13px] leading-relaxed text-kohle-3">
          Fotos: {FOTO_URHEBER} (Unsplash). Prototyp. Gerätepreise sind recherchierte Straßenpreise,
          alle anderen Preise sind gesetzt. Der Plan wird aus deinen Eingaben wirklich gerechnet;
          das Einlesen von Grundrissen und die Bestellung sind nachgestellt. Und so gut ein Plan
          auch aussieht: bevor bestellt wird, misst jemand den fertigen Raum nach.
        </p>
      </section>
    </div>
  );
}
