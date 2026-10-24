"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { brutto, eur } from "@/lib/berechnung";
import { alsKuechentyp, planeKueche, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";
import { Kuechenbild } from "@/components/warm/Kuechenbild";
import { LiveHero } from "@/components/warm/LiveHero";
import { FOTOS, FOTO_HINWEIS, FOTO_URHEBER, fotoUrl, type Foto } from "@/data/fotos";
import { anzahlModelle, ARTEN, FOTO_QUELLE, PREISSTAND_GERAETE, schaustueck } from "@/data/geraete";

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

const SCHRITTE = [
  ["01", "Raum beschreiben", "Wandlängen, Fenster, Tür, Wasseranschluss. Mit dem Zollstock in fünf Minuten erledigt."],
  ["02", "Oder Grundriss hochladen", "Hast du einen Plan? Dann lesen wir die Maße heraus, und du prüfst sie einmal nach."],
  ["03", "Küche aussuchen", "Fertige Vorschläge mit Preis. Umstellen, bis es passt — dann schicken wir das Angebot."],
];

const ZUSAGEN = [
  ["Wir rechnen auf den Zentimeter", "Die Summe aller Schrankbreiten ergibt exakt die Länge deiner Küchenzeile — die Passleiste eingerechnet. Immer."],
  ["Wir kennen die Regeln", "Nichts Hohes vor dem Fenster, Abstand neben dem Herd, Spüle am Wasseranschluss."],
  ["Vor der Bestellung misst jemand nach", "Wände sind nie ganz gerade. Dein Plan bleibt, die Maße werden bestätigt."],
];

/** Ein Foto, das seinen Platz füllt, mit einem warmen Schleier darüber,
    damit die Bilder zur Farbigkeit der Seite passen. */
function Bild({
  f, breite, hoehe, schleier = true, prioritaet = false,
}: {
  f: Foto; breite: number; hoehe: number; schleier?: boolean; prioritaet?: boolean;
}) {
  return (
    <>
      <Image
        src={fotoUrl(f, breite)}
        alt={f.alt}
        width={breite}
        height={hoehe}
        priority={prioritaet}
        className="h-full w-full object-cover"
        sizes="(max-width: 768px) 100vw, 60vw"
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
      className={`inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-[16.5px] font-semibold transition-colors ${
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
      {/* ---------- Auftakt: ein Bild, ein Satz ---------- */}
      <section className="relative isolate flex min-h-[86vh] flex-col">
        <div className="absolute inset-0 -z-10 overflow-hidden bg-kohle">
          <Bild f={FOTOS.hero} breite={2400} hoehe={1500} schleier={false} prioritaet />
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(14,13,9,0.70) 0%, rgba(14,13,9,0.52) 40%, rgba(14,13,9,0.82) 100%)",
            }}
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

        <div className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-center px-5 pb-28 pt-10 sm:px-8 sm:pb-36">
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
        </div>
      </section>

      {/* ---------- Der Beweis, halb ins Bild geschoben ---------- */}
      <section className="relative z-10 -mt-24 sm:-mt-28">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="flaeche flaeche-hoch rounded-[26px] px-5 pb-8 pt-7 sm:px-10 sm:pb-10 sm:pt-9">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="vorzeile">Probier es hier</div>
              <div className="text-[13.5px] text-kohle-3">Das ist kein Bild — das rechnet gerade.</div>
            </div>
            <div className="mt-6">
              <LiveHero />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Drei Schritte ---------- */}
      <section className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 sm:py-32">
        <h2 className="gross max-w-[20ch] text-[32px] font-bold leading-[1.08] text-kohle sm:text-[46px]">
          Drei Schritte, keine Vorkenntnisse.
        </h2>
        <ol className="mt-12 grid gap-4 sm:grid-cols-3">
          {SCHRITTE.map(([nr, titel, satz]) => (
            <li key={nr} className="flaeche relative rounded-[20px] px-6 pb-7 pt-7 sm:px-7">
              {/* Die Zahl liegt vertieft im Papier statt als Zeile darüber:
                  man sieht die Reihenfolge, ohne sie zu lesen. */}
              <span className="vertieft ziffern gross flex h-11 w-11 items-center justify-center rounded-full text-[15px] font-bold text-kohle-2">
                {nr}
              </span>
              <h3 className="gross mt-5 text-[20px] font-bold leading-tight text-kohle">{titel}</h3>
              <p className="mt-2.5 text-[15.5px] leading-relaxed text-kohle-2">{satz}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Die Geräte, die wirklich drinstehen ---------- */}
      <section className="border-y border-linie-warm bg-creme-2/70">
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
                <li key={art} className="flaeche flex flex-col overflow-hidden rounded-[18px]">
                  <div className="vertieft flex h-[118px] items-center justify-center bg-papier sm:h-[158px]">
                    <Image
                      src={g.foto}
                      alt={`${g.marke} ${g.modell ?? g.name}`}
                      width={400}
                      height={400}
                      className="h-full w-full object-contain p-4"
                      sizes="(max-width: 640px) 100vw, 240px"
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
          </p>
        </div>
      </section>

      {/* ---------- Bild, das über den Rand läuft ---------- */}
      <section className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 pb-24 sm:px-8 sm:pb-32 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="relative h-[clamp(280px,46vw,540px)] overflow-hidden rounded-[22px] lg:-ml-[max(0px,calc((100vw-1240px)/2+2rem))] lg:rounded-l-none">
          <Bild f={FOTOS.gruen} breite={1800} hoehe={1200} />
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
      <section className="relative isolate overflow-hidden bg-kohle text-creme">
        <div className="lg:grid lg:grid-cols-[1fr_minmax(0,36%)]">
          <div className="mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8 sm:py-32 lg:ml-auto lg:mr-0 lg:max-w-[760px] lg:pr-16">
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
          </div>
          <div className="relative h-[clamp(220px,46vw,340px)] lg:h-auto">
            <Bild f={FOTOS.detail} breite={1200} hoehe={1600} schleier={false} />
          </div>
        </div>
      </section>

      {/* ---------- Galerie ---------- */}
      <section className="mx-auto max-w-[1240px] px-5 pt-24 sm:px-8 sm:pt-32">
        <h2 className="gross max-w-[20ch] text-[32px] font-bold leading-[1.08] text-kohle sm:text-[46px]">
          So sieht so etwas aus, wenn es steht.
        </h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <figure className="relative h-[clamp(260px,42vw,480px)] overflow-hidden rounded-[22px]">
            <Bild f={FOTOS.insel} breite={1800} hoehe={1200} />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-kohle/80 to-transparent p-5 text-[13.5px] font-medium text-creme">
              Dunkle Fronten, heller Stein — dieselbe Technik, andere Oberfläche.
            </figcaption>
          </figure>
          <div className="grid gap-5">
            <figure className="relative h-[clamp(180px,20vw,230px)] overflow-hidden rounded-[22px]">
              <Bild f={FOTOS.licht} breite={1200} hoehe={700} />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-kohle/80 to-transparent p-4 text-[13px] font-medium text-creme">
                Kochfeld in der Platte, nichts hängt darüber.
              </figcaption>
            </figure>
            <figure className="relative h-[clamp(180px,20vw,230px)] overflow-hidden rounded-[22px]">
              <Bild f={FOTOS.marmor} breite={1200} hoehe={700} />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-kohle/80 to-transparent p-4 text-[13px] font-medium text-creme">
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
        <p className="ziffern mt-6 max-w-[58ch] text-[16.5px] leading-relaxed text-kohle-2">
          Je nach Raum und Ausstattung zwischen {eur(brutto(von))} und {eur(brutto(bis))} — komplett, mit Geräten,
          Montage und Mehrwertsteuer. Die drei Beispiele sind mit demselben Planer gerechnet, der gleich auch deine
          Küche rechnet.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {beispiele.map((b) => (
            <div key={b.titel} className="flaeche flex flex-col overflow-hidden rounded-[20px]">
              {/* Die Zeichnung steht auf Creme statt auf Weiss: die Schraenke
                  sind hell, auf weissem Grund verschwinden sie. */}
              <div className="vertieft flex items-center bg-creme px-4 py-5">
                <Kuechenbild typ={b.typ} variante={b.plan.variante} zeileId={b.typ.zeilen[0].id} hoehe={146} />
              </div>
              <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                <div className="gross text-[19px] font-bold text-kohle">{b.titel}</div>
                <div className="mt-1.5 text-[14.5px] leading-snug text-kohle-2">{b.satz}</div>
                <div className="gross ziffern mt-5 border-t border-linie-warm pt-4 text-[28px] font-bold leading-none text-kohle">
                  {eur(brutto(b.plan.preis))}
                </div>
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
          Fotos: {FOTO_URHEBER} (Unsplash). Prototyp. Gerätepreise sind recherchierte Straßenpreise,
          alle anderen Preise sind gesetzt. Der Plan wird aus deinen Eingaben wirklich gerechnet;
          das Einlesen von Grundrissen und die Bestellung sind nachgestellt. Und so gut ein Plan
          auch aussieht: bevor bestellt wird, misst jemand den fertigen Raum nach.
        </p>
      </section>
    </div>
  );
}
