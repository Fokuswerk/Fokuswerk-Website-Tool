import type { Metadata } from "next";
import Anlauf from "@/components/Anlauf";
import { Sektion, Kopfzeile, Seitenkopf, Abschluss, Knopf, Linienliste } from "@/components/Bausteine";

export const metadata: Metadata = {
  title: "Solarenergie und Solarthermie",
  description:
    "Solarthermische Anlagen aus Wardenburg: Sonnenwärme für Warmwasser und Heizungsunterstützung. Flach- und Vakuumröhrenkollektoren, Förderung über BAFA und KfW.",
  alternates: { canonical: "/solarenergie" },
};

const kollektoren = [
  { titel: "Flachkollektor", text: "Der verbreitete Typ. Günstiger in der Anschaffung." },
  { titel: "Vakuum-Röhrenkollektor", text: "Höherer Wirkungsgrad, höherer Preis." },
];

const anlage = [
  { titel: "Sonnenkollektor", text: "Das Kraftwerk der Anlage. Er erhitzt die Wärmeträgerflüssigkeit." },
  { titel: "Solarspeicher", text: "Ein an die Wasserleitung angeschlossener Kessel mit zwei Wärmetauschern." },
  { titel: "Zweiter Wärmetauscher", text: "Am konventionellen Heizkessel — er heizt im Winter nach." },
];

export default function Solarenergie() {
  return (
    <>
      <Seitenkopf
        label="03 · Solarenergie"
        titel="Mit der Sonne heizen — nicht nur Strom machen."
        text="Photovoltaik erzeugt Strom. Solarthermie erzeugt Wärme: für Warmwasser und zur Unterstützung der Heizung. Darum kümmern wir uns."
        aktionen={
          <>
            <Knopf href="/kontakt">Beratung vereinbaren</Knopf>
            <Knopf href="/heizung" art="linie-hell">
              Zur Heizung
            </Knopf>
          </>
        }
      />

      <Sektion>
        <Kopfzeile
          nummer="01"
          label="Solarwärme"
          titel={<>Drei Bauteile, ein Kreislauf.</>}
          text="Die im Kollektor erhitzte Flüssigkeit durchströmt einen Wärmetauscher im Speicher und erwärmt so Ihr Brauchwasser."
        />
        <div className="mt-16">
          <Linienliste eintraege={anlage} spalten={3} />
        </div>
      </Sektion>

      <Sektion dunkel>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Kopfzeile
              dunkel
              nummer="02"
              label="Kollektoren"
              titel={<>Zwei Typen, die sich in Preis und Wirkungsgrad unterscheiden.</>}
              text="Sonnenkollektoren sind in den vergangenen Jahren technisch deutlich besser geworden. Die Technik ist ausgereift und in jedes Eigenheim integrierbar."
            />
          </div>
          <Anlauf klasse="lg:col-span-5 lg:col-start-8" verzug={100}>
            <Linienliste eintraege={kollektoren} dunkel spalten={2} />
          </Anlauf>
        </div>
      </Sektion>

      <Sektion>
        <Kopfzeile
          nummer="03"
          label="Förderung"
          titel={<>Zuschüsse, Boni und zinsgünstige Darlehen — wir kennen den Weg dahin.</>}
          text="Der Kauf einer Solarthermieanlage wird über das Bundesamt für Wirtschaft und Ausfuhrkontrolle und die KfW gefördert. Das verkürzt die Amortisationszeit deutlich."
        />
        <Anlauf klasse="mt-12" verzug={80}>
          <p className="t-text mass text-tief/70">
            Wir liefern nicht nur die Technik, um vorhandene Energie effizient zu nutzen — wir
            beraten Sie auch zu den Fördermöglichkeiten und stellen die Anträge.
          </p>
        </Anlauf>
      </Sektion>

      <Abschluss
        titel="Passt Solarthermie auf Ihr Dach?"
        text="Ausrichtung, Neigung und Warmwasserbedarf entscheiden. Wir sehen es uns an und rechnen es durch."
      />
    </>
  );
}
