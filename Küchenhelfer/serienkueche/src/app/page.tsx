"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { brutto, eur } from "@/lib/berechnung";
import { alsKuechentyp, planeKueche, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";
import { Kuechenbild } from "@/components/warm/Kuechenbild";
import { Raumfrage } from "@/components/warm/Raumfrage";
import { FOTOS, FOTO_HINWEIS, FOTO_URHEBER, fotoUrl, type Foto } from "@/data/fotos";
import { anzahlModelle, ARTEN, FOTO_QUELLE, FOTOS_LIZENZIERT, GERAETEFOTO_HINWEIS, PREISSTAND_GERAETE, schaustueck } from "@/data/geraete";

/**
 * Die Schauseite — in Kalk und Tinte.
 *
 * Sie spricht jetzt die Sprache von Aplomb: kühl-mineralisch statt warm,
 * Maß vor Schmuck, Haarlinien statt Schatten, rechte Winkel statt Radien,
 * und eine Hierarchie, die aus der Größe kommt und nicht aus dem Gewicht.
 *
 * Was NICHT angefasst wurde: der Planer unter /kueche. Er bleibt in seiner
 * eigenen Gestaltung — dieselbe Strecke, dasselbe Bild, dieselben Farben.
 * Alles hier steht deshalb unter `.kalk`, und keine einzige Regel dieser
 * Schicht reicht dorthin hinüber.
 *
 * Der Inhalt ist derselbe geblieben, bis auf den Satz: die Seite duzt
 * weiter, weil der Planer duzt. Eine Seite, die vorn siezt und hinten
 * duzt, ist schlechter als beides.
 */

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

const ZUSAGEN: Array<[string, string]> = [
  ["Wir rechnen auf den Zentimeter", "Die Summe aller Schrankbreiten ergibt exakt die Länge deiner Küchenzeile — die Passleiste eingerechnet. Immer."],
  ["Wir kennen die Regeln", "Nichts Hohes vor dem Fenster, Abstand neben dem Herd, Spüle am Wasseranschluss."],
  ["Vor der Bestellung misst jemand nach", "Wände sind nie ganz gerade. Dein Plan bleibt, die Maße werden bestätigt."],
];

/** Was jeder kennt, der schon mal eine Küche gekauft hat. */
const SAMSTAGE: Array<[string, string, string]> = [
  ["01", "Samstag eins. Zwei Stunden Beratung, am Ende kein Preis.",
   "Gemessen hat der Verkäufer, gezeichnet hat er auch. Mitnehmen darfst du den Plan nicht."],
  ["02", "Samstag zwei. Ein Angebot über eine runde Summe.",
   "Vier Zeilen, ein Gesamtbetrag. Was die Spüle kostet und was die Montage, steht nicht drin."],
  ["03", "Samstag drei. Der Kühlschrank steht vor dem Fenster.",
   "Im Plan sah es nach genug Platz aus. Auffallen wird es am Liefertag."],
];

function Bild({
  f, breite, hoehe, prioritaet = false, masse = "(max-width: 1023px) 100vw, 60vw",
}: {
  f: Foto; breite: number; hoehe: number; prioritaet?: boolean; masse?: string;
}) {
  return (
    <Image
      src={fotoUrl(f, breite)}
      alt={f.alt}
      width={breite}
      height={hoehe}
      priority={prioritaet}
      className="hero-foto h-full w-full object-cover"
      sizes={masse}
    />
  );
}

/** Die Zeile, die hier alles trennt: links das Maß, rechts die Sache. */
function Fahrzeile({ mass, titel, satz }: { mass: string; titel: string; satz: string }) {
  return (
    <li className="linie border-t py-8 md:py-10">
      <div className="raster items-baseline gap-y-3">
        <span className="mass k-brass col-span-4 md:col-span-1">{mass}</span>
        <h3 className="ueberschrift col-span-4 md:col-span-5 lg:col-span-6">{titel}</h3>
        <p className="fliess k-slate col-span-4 text-[0.9375rem] leading-relaxed md:col-span-8 lg:col-span-4 lg:col-start-9">
          {satz}
        </p>
      </div>
    </li>
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
    <div className="kalk min-h-full overflow-x-clip">
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--kalk-ink)] focus:px-4 focus:py-2 focus:text-[14px] focus:font-medium focus:text-[var(--kalk-chalk)]"
      >
        Zum Inhalt springen
      </a>

      {/* ───────── Auftakt ─────────
          Der Text steht unten: oben liegt die helle Decke am Fensterlicht,
          und ein Schleier, der die lesbar machen müsste, deckt das ganze
          Foto zu. Unten sind Insel und Boden ohnehin dunkel. */}
      <section className="text-hell relative isolate flex min-h-svh flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[#0E1413]">
          <Bild f={FOTOS.hero} breite={2400} hoehe={3200} prioritaet masse="100vw" />
        </div>
        <span aria-hidden="true" className="kalk-schleier absolute inset-0 -z-10" />
        <span aria-hidden="true" className="kalk-schleier-seite absolute inset-0 -z-10 hidden lg:block" />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-40"
          style={{ background: "linear-gradient(to bottom, rgb(14 20 19 / 0.76) 0%, rgb(14 20 19 / 0.46) 48%, rgb(14 20 19 / 0) 100%)" }}
        />

        <header className="absolute inset-x-0 top-0 z-10">
          <div className="huelle flex h-[72px] items-center justify-between gap-4">
            {/* Drei Dinge passen bei 375 px nicht nebeneinander: die
                Wortmarke, der Hinweis und der Link brachen um, und
                "FÜR BAUTRÄGER" stand zweizeilig an der Wortmarke. Der
                Hinweis kommt deshalb erst ab 640 px dazu, und der Link
                heißt am Handy nur "Bauträger". */}
            <div className="flex items-baseline gap-3">
              <span className="wortmarke text-[0.9375rem]">Serienküche</span>
              <span className="mass k-mist hidden sm:inline">Prototyp</span>
            </div>
            <Link href="/dashboard" className="textlink mass whitespace-nowrap">
              <span className="sm:hidden">Bauträger</span>
              <span className="hidden sm:inline">Für Bauträger</span>
            </Link>
          </div>
        </header>

        <main id="inhalt" className="huelle pb-24 pt-10 sm:pb-28">
          <h1 className="display-xl kalk-titel max-w-[16ch]">
            Deine neue Küche. Ohne Termin im Küchenstudio.
          </h1>
          <p className="fliess-gross mt-8 opacity-85">
            Sag uns, wie dein Raum aussieht. Wir rechnen die Küche aus, die dort wirklich passt —
            jeder Schrank im Maß, jedes Gerät ausgesucht, der Preis komplett.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/kueche" className="knopf knopf--voll">Küche planen</Link>
            <Link href="#preis" className="knopf knopf--linie">Was kostet das?</Link>
          </div>
          <p className="mass k-mist mt-7">Fünf Minuten · kein Konto · kostenlos</p>
        </main>
      </section>

      {/* ───────── So läuft das sonst ───────── */}
      <section className="abschnitt" aria-labelledby="reibung-titel">
        <div className="huelle">
          <div className="raster items-end gap-y-8">
            <div className="col-span-4 md:col-span-8 lg:col-span-7">
              <h2 id="reibung-titel" className="display-l">So läuft das sonst.</h2>
            </div>
            <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
              <p className="fliess k-slate">
                Nicht weil es kompliziert wäre. Sondern weil zwischen dir und deinem
                Grundriss ein Termin, ein Tisch und ein Verkäufer stehen.
              </p>
            </div>
          </div>

          <ul className="mt-14 md:mt-20">
            {SAMSTAGE.map(([nr, satz, dazu]) => (
              <Fahrzeile key={nr} mass={nr} titel={satz} satz={dazu} />
            ))}
          </ul>

          <div className="linie raster mt-12 items-end gap-y-6 border-t pt-10">
            <p className="display-m col-span-4 md:col-span-8 lg:col-span-7">
              Kann man so machen. Muss man nicht.
            </p>
            <div className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-9">
              <Link href="/kueche" className="knopf knopf--voll w-full sm:w-auto">Küche planen</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Die erste Frage, zum Antippen ─────────
          Der einzige Baustein der Schauseite, der aus dem Planer stammt —
          und der einzige, der hier nicht umgezogen wurde. Er fragt genau
          das, was der Planer als Erstes fragt. */}
      <section className="raumfrage-huelle pb-4">
        <Raumfrage />
      </section>

      {/* ───────── Die Geräte ───────── */}
      <section className="abschnitt" aria-labelledby="geraete-titel">
        <div className="huelle">
          <div className="raster items-end gap-y-8">
            <div className="col-span-4 md:col-span-8 lg:col-span-7">
              <h2 id="geraete-titel" className="display-l">Keine Markengeräte nach Wahl. Diese hier.</h2>
            </div>
            <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
              <p className="fliess k-slate">
                Bosch und Siemens, jedes mit Modellnummer und Preis. Du suchst sie einzeln
                aus und siehst sofort, was die Küche dadurch kostet.
              </p>
            </div>
          </div>

          {/* Keine Kästen: eine Reihe Zellen, durch Haarlinien getrennt.
              Auf dem Handy zwei nebeneinander — fünf volle Karten
              untereinander wären ein halber Bildschirmkilometer. */}
          {/* Keine Rand-Akrobatik mit :not(:nth-child) — die traegt bei drei
              Umbruchpunkten nie ueber alle drei. Ein Abstand zwischen den
              Spalten und eine Haarlinie ueber jeder Zelle: das haelt in
              jeder Spaltenzahl, und die Zellen stossen nicht aneinander. */}
          <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-5">
            {ARTEN.map(({ art }) => {
              const g = schaustueck(art);
              if (!g?.foto) return null;
              return (
                <li key={art} className="linie flex flex-col border-t pt-5">
                  <div className="mass k-brass">{ARTNAME[art]}</div>
                  <div className="grund-2 mt-4 flex h-[128px] items-center justify-center sm:h-[150px]">
                    <Image
                      src={g.foto}
                      alt={`${g.marke} ${g.modell ?? g.name}`}
                      width={400}
                      height={400}
                      className="h-full w-full object-contain p-4"
                      sizes="(max-width: 639.98px) 46vw, (max-width: 1023.98px) 31vw, 240px"
                    />
                  </div>
                  <div className="ueberschrift mt-5 text-[1.0625rem]">
                    {[g.marke, g.serie].filter(Boolean).join(" ")}
                  </div>
                  <div className="mass k-mist mt-2">{g.modell}</div>
                  <div className="linie mt-auto flex items-baseline justify-between gap-2 border-t pt-4">
                    <span className="mass k-mist">{anzahlModelle(art)} Modelle</span>
                    <span className="mass">{eur(g.richtpreis)}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="k-mist mt-6 max-w-[80ch] text-[0.8125rem] leading-relaxed">
            {FOTO_QUELLE}. Preise sind recherchierte Straßenpreise, Stand {PREISSTAND_GERAETE} —
            Momentaufnahmen, keine Einkaufskonditionen.
            {!FOTOS_LIZENZIERT && <> {GERAETEFOTO_HINWEIS}</>}
          </p>
        </div>
      </section>

      {/* ───────── Bild bis an die Kante ───────── */}
      <section className="abschnitt pt-0">
        <div className="huelle">
          <div className="raster items-center gap-y-10">
            <div className="relative col-span-4 h-[clamp(280px,46vw,560px)] overflow-hidden md:col-span-8 lg:col-span-7">
              <Bild f={FOTOS.gruen} breite={1800} hoehe={1565} masse="(max-width: 1023px) 100vw, 58vw" />
            </div>
            <div className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-9">
              <h2 className="display-m">Dieselbe Küche, nur ohne vier Wochen Wartezeit.</h2>
              <p className="fliess k-slate mt-6">
                Ein Küchenstudio zeichnet deine Küche von Hand — deshalb dauert es und deshalb
                bekommst du den Plan nur halb. Hier rechnet sie ein Programm, in Sekunden, mit
                denselben Regeln und denselben Maßen. Und der Plan gehört dir.
              </p>
              <Link href="/kueche" className="knopf knopf--linie mt-8">Küche planen</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Dunkles Band ───────── */}
      <section className="auf-tinte abschnitt" aria-labelledby="zusage-titel">
        <div className="huelle">
          <div className="raster items-end gap-y-8">
            <div className="col-span-4 md:col-span-8 lg:col-span-7">
              <h2 id="zusage-titel" className="display-l">Und wenn es am Ende nicht passt?</h2>
            </div>
            <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
              <p className="fliess k-mist">
                Passiert nicht. Jeder Schrank folgt dem Raster, mit dem Küchen gebaut werden,
                und der Rest einer Wand wird zur zugeschnittenen Leiste. Was nicht hineinpasst,
                sagen wir dir sofort.
              </p>
            </div>
          </div>

          <dl className="mt-14 md:mt-20">
            {ZUSAGEN.map(([t, sz]) => (
              <div key={t} className="linie raster items-baseline gap-y-3 border-t py-8">
                <dt className="ueberschrift col-span-4 md:col-span-8 lg:col-span-6">{t}</dt>
                <dd className="fliess k-mist col-span-4 text-[0.9375rem] leading-relaxed md:col-span-8 lg:col-span-5 lg:col-start-8">
                  {sz}
                </dd>
              </div>
            ))}
          </dl>

          {/* Hier ist die Zusage gerade gegeben — das ist die Stelle, an der
              jemand loslegt, nicht erst nach vier Bildschirmen Galerie. */}
          <div className="linie mt-10 border-t pt-10">
            <Link href="/kueche" className="knopf knopf--voll w-full sm:w-auto">Küche planen</Link>
          </div>
        </div>
      </section>

      {/* ───────── Galerie ───────── */}
      <section className="abschnitt" aria-labelledby="galerie-titel">
        <div className="huelle">
          <h2 id="galerie-titel" className="display-l max-w-[18ch]">So sieht so etwas aus, wenn es steht.</h2>
          <div className="raster mt-14 gap-y-6">
            <figure className="relative col-span-4 h-[clamp(260px,42vw,520px)] overflow-hidden md:col-span-8 lg:col-span-7">
              <Bild f={FOTOS.insel} breite={1200} hoehe={1800} masse="(max-width: 1023px) 100vw, 58vw" />
              <figcaption className="text-hell absolute inset-x-0 bottom-0 p-5">
                <span className="mass">Dunkle Fronten, heller Stein — dieselbe Technik, andere Oberfläche.</span>
              </figcaption>
            </figure>
            <div className="col-span-4 grid gap-6 md:col-span-8 lg:col-span-5">
              {[
                { f: FOTOS.licht, b: 1200, h: 1600, text: "Kochfeld in der Platte, nichts hängt darüber." },
                { f: FOTOS.marmor, b: 1200, h: 784, text: "Wandlänge gibt den Takt vor, nicht der Geschmack." },
              ].map((x) => (
                <figure key={x.text} className="relative h-[clamp(180px,22vw,244px)] overflow-hidden">
                  <Bild f={x.f} breite={x.b} hoehe={x.h} masse="(max-width: 1023px) 100vw, 40vw" />
                  <figcaption className="text-hell absolute inset-x-0 bottom-0 p-4">
                    <span className="mass">{x.text}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <p className="k-mist mt-5 text-[0.8125rem]">{FOTO_HINWEIS}</p>
        </div>
      </section>

      {/* ───────── Preis ───────── */}
      <section id="preis" className="abschnitt pt-0" aria-labelledby="preis-titel">
        <div className="huelle">
          <div className="raster items-end gap-y-8">
            <div className="col-span-4 md:col-span-8 lg:col-span-7">
              <h2 id="preis-titel" className="display-l">Was kostet so eine Küche?</h2>
            </div>
            <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
              <p className="fliess k-slate">
                Diese drei liegen zwischen {eur(brutto(von))} und {eur(brutto(bis))} — komplett, mit
                Geräten, Montage und Mehrwertsteuer. Gerechnet mit demselben Planer, der gleich
                auch deine Küche rechnet.
              </p>
            </div>
          </div>

          {/* Kein Kasten um die Zahl: eine große Zahl braucht Raum, keine
              Umrandung. Nur Haarlinien zwischen den Spalten. */}
          <div className="linie mt-14 grid border-t sm:grid-cols-3">
            {beispiele.map((b) => (
              <div key={b.titel} className="linie flex flex-col border-b py-9 sm:px-7 sm:py-10 sm:first:pl-0 sm:last:pr-0 sm:[&:not(:first-child)]:border-l">
                <div className="mass k-brass">{b.titel}</div>
                <div className="display-m mt-5" style={{ fontVariantNumeric: "tabular-nums lining-nums" }}>
                  {eur(brutto(b.plan.preis))}
                </div>
                <p className="k-slate mt-4 max-w-[34ch] text-[0.9375rem] leading-snug">{b.satz}</p>
                <div className="grund-2 mt-7 flex items-end px-4 py-5">
                  <Kuechenbild typ={b.typ} variante={b.plan.variante} zeileId={b.typ.zeilen[0].id} hoehe={132} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Link href="/kueche" className="knopf knopf--voll">Jetzt deine rechnen lassen</Link>
            <span className="mass k-mist">Sofort ein Ergebnis, keine Rückrufbitte</span>
          </div>
        </div>
      </section>

      {/* ───────── Bauträger und Fuß ───────── */}
      <footer className="auf-tinte abschnitt">
        <div className="huelle">
          <Link href="/dashboard" className="group linie raster items-end gap-y-5 border-t pt-10">
            <div className="col-span-4 md:col-span-8 lg:col-span-8">
              <h2 className="ueberschrift">Ein ganzes Haus planen?</h2>
              <p className="fliess k-mist mt-3 text-[0.9375rem] leading-relaxed">
                Für Bauträger und Wohnungsunternehmen: Grundrisse aller Wohnungen einlesen,
                ähnliche Küchen zu wenigen Typen zusammenfassen und einmal planen statt vierzigmal.
              </p>
            </div>
            <span className="textlink mass col-span-4 md:col-span-8 lg:col-span-3 lg:col-start-10 lg:text-right">
              Zum Projektbereich →
            </span>
          </Link>

          <div className="linie mt-16 flex flex-wrap items-center justify-between gap-6 border-t pt-8">
            <span className="wortmarke text-[0.9375rem]">Serienküche</span>
            <nav aria-label="Rechtliches" className="flex flex-wrap items-center gap-x-7 gap-y-2">
              {[["/impressum", "Impressum"], ["/datenschutz", "Datenschutz"], ["/dashboard", "Für Bauträger"]].map(([href, text]) => (
                <Link key={href} href={href} className="textlink mass k-mist flex h-11 items-center">{text}</Link>
              ))}
            </nav>
          </div>

          <p className="k-mist mt-8 max-w-[78ch] text-[0.8125rem] leading-relaxed opacity-80">
            Fotos: {FOTO_URHEBER} (Unsplash). Prototyp. Gerätepreise sind recherchierte
            Straßenpreise, alle anderen Preise sind gesetzt. Der Plan wird aus deinen Eingaben
            wirklich gerechnet; das Einlesen von Grundrissen und die Bestellung sind nachgestellt.
            Und so gut ein Plan auch aussieht: bevor bestellt wird, misst jemand den fertigen
            Raum nach.
          </p>
        </div>
      </footer>
    </div>
  );
}
