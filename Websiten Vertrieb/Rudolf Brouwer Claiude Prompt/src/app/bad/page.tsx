import type { Metadata } from "next";
import Anlauf from "@/components/Anlauf";
import { Sektion, Kopfzeile, Seitenkopf, Abschluss, Knopf, Foto, Linienliste, Bildband } from "@/components/Bausteine";

export const metadata: Metadata = {
  title: "Badsanierung und Seniorenbad",
  description:
    "Badsanierung aus einer Hand in Wardenburg und Oldenburg: Planung, alle Gewerke, Fixpreis und Fixtermin. Seniorengerechte Bäder, Planung mit 3D-Badbrille.",
  alternates: { canonical: "/bad" },
};

const enthalten = [
  { titel: "Beratung", text: "In der Ausstellung oder bei Ihnen zu Hause — mit Blick auf das, was baulich möglich ist." },
  { titel: "Planung", text: "Grundriss, Technik und Ausstattung. Erste Eindrücke bekommen Sie über die 3D-Badbrille." },
  { titel: "Fixpreis und Fixtermin", text: "Das Angebot gilt. Der Termin auch." },
  { titel: "Elektroarbeiten", text: "Neue Leitungen, Steckdosen, Licht und Anschlüsse für Spiegel und Heizkörper." },
  { titel: "Heizung", text: "Heizkörper, Fußbodenheizung und Warmwasser — aus demselben Haus." },
  { titel: "Fremdgewerke", text: "Maurer, Fliesenleger, Maler, Innenausbau und Endreinigung koordinieren wir für Sie." },
];

export default function Bad() {
  return (
    <>
      <Seitenkopf
        label="01 · Bad"
        titel="Ein Bad, ein Angebot, ein Ansprechpartner."
        text="Schlüsselfertige Badmodernisierung: von der Installation über das Fliesenlegen bis zur Endreinigung regelt das alles einer — wir."
        aktionen={
          <>
            <Knopf href="/kontakt">Termin vereinbaren</Knopf>
            <Knopf href="/ausstellung" art="linie-hell">
              Ausstellung ansehen
            </Knopf>
          </>
        }
      />

      <Sektion>
        <Kopfzeile
          nummer="01"
          label="Badsanierung"
          titel={<>Der Staub bleibt in der Maschine, nicht in Ihrer Wohnung.</>}
          text="Für die Sanierung setzen wir eine eigene Staubabsauganlage ein. Ihr Bad-Berater koordiniert die Handwerker nach Plan und achtet auf Termine und Angebotsgrenzen."
        />
        <div className="mt-16">
          <Linienliste eintraege={enthalten} />
        </div>
      </Sektion>

      <Bildband
        bild="/fotos/band-armatur.jpg"
        alt="Verchromte Kreuzgriff-Armatur an einem weißen Waschbecken"
        unterschrift="Jeder Tag beginnt im Badezimmer — und endet dort."
      />

      <Sektion dunkel>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Kopfzeile
              dunkel
              nummer="02"
              label="Bad-Ideen"
              titel={<>Ihr neues Bad sehen Sie, bevor die erste Fliese fällt.</>}
              text="Für das erste Gespräch steht ein spezialisierter Mitarbeiter bereit — nach Terminabsprache. Planen wir Ihr Bad, bekommen Sie über die 3D-Badbrille den Eindruck, schon darin zu stehen."
            />
            <Anlauf klasse="mt-10" verzug={80}>
              <p className="t-text mass text-papier/70">
                Angesagt sind klare, reduzierte Linien. Kontrastreich zum Weiß: dunkle Hölzer wie
                Nussbaum. Aufgesetzte Becken stechen ins Auge. Eine allein tonangebende Stilrichtung
                gibt es nicht — Anregungen finden Sie in der Ausstellung im Haus.
              </p>
            </Anlauf>
          </div>
          <Anlauf klasse="lg:col-span-5 lg:col-start-8" verzug={120}>
            <Foto
              bild="/fotos/ausstellung-waschtisch-holz.jpg"
              alt="Waschtisch mit Holzfront, beleuchtetem Spiegel und Handtuchheizkörper in der Ausstellung"
              verhaeltnis="16/9"
              groesse="(min-width: 1024px) 40vw, 100vw"
            />
            <p className="t-label mt-4 text-papier/50">Ausstellung Wardenburg</p>
          </Anlauf>
        </div>
      </Sektion>

      <Sektion>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <Anlauf klasse="lg:col-span-5 lg:order-2" verzug={120}>
            <Foto
              bild="/fotos/ausstellung-dusche.jpg"
              alt="Bodengleiche Dusche mit Klappsitz und Haltegriff neben einem Waschtisch in der Ausstellung"
              verhaeltnis="16/9"
              groesse="(min-width: 1024px) 40vw, 100vw"
            />
            <p className="t-label mt-4 text-mittel">Bodengleich, mit Sitz und Haltegriff</p>
          </Anlauf>
          <div className="lg:col-span-6 lg:order-1">
            <Kopfzeile
              nummer="03"
              label="Das Seniorenbad"
              titel={<>Zukunftsbäder statt Seniorenbäder.</>}
              text="Das barrierefreie Bad gewinnt unabhängig von Lebenssituation und Generation an Beliebtheit. Die Kunst liegt darin, heute schon die Anforderungen von morgen mitzubauen."
            />
            <Anlauf klasse="mt-10" verzug={80}>
              <p className="t-text mass text-tief/70">
                Wir gestalten Duschbereiche, die nicht nach Sanitärraum aussehen. Manchmal sind es
                kleine Dinge, die den Alltag beschwerlich machen — und einfache, sichere und
                formschöne Hilfen, die ihn wieder leicht machen.
              </p>
            </Anlauf>
          </div>
        </div>
      </Sektion>

      <Abschluss
        titel="Reden wir über Ihr Bad."
        text="Kommen Sie nach Terminabsprache in die Ausstellung — dann hat jemand Zeit, mit Ihnen zu planen. Oder rufen Sie an."
      />
    </>
  );
}
