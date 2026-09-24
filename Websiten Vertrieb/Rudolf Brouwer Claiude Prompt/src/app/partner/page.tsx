import type { Metadata } from "next";
import Anlauf from "@/components/Anlauf";
import { Sektion, Kopfzeile, Seitenkopf, Abschluss, Knopf } from "@/components/Bausteine";
import { partner } from "@/lib/daten";

export const metadata: Metadata = {
  title: "Partner und Lieferanten",
  description:
    "Mit wem die Rudolf Brouwer GmbH arbeitet: Hersteller und Großhändler für Heizung, Sanitär, Badmöbel, Duschabtrennungen und Wasserpflege.",
  alternates: { canonical: "/partner" },
};

export default function Partner() {
  return (
    <>
      <Seitenkopf
        label="Partner"
        titel="Mit wem wir arbeiten."
        text="Hersteller, Großhändler und Handwerksbetriebe, auf die wir uns bei Material und Fremdgewerken verlassen."
        aktionen={<Knopf href="/kontakt">Kontakt aufnehmen</Knopf>}
      />

      <Sektion>
        <Kopfzeile
          nummer="01"
          label="Hersteller und Betriebe"
          titel={<>Neun Namen, die auf unseren Baustellen auftauchen.</>}
        />
        <ul className="mt-16 grid grid-cols-1 gap-x-8 border-t border-tief/20 md:grid-cols-2">
          {partner.map((p, i) => (
            <Anlauf als="li" key={p.name} verzug={(i % 2) * 60} klasse="border-b border-tief/12 py-6">
              <h2 className="t-karte">{p.name}</h2>
              <p className="t-text mt-4 text-tief/65">{p.was}</p>
            </Anlauf>
          ))}
        </ul>
        {/* TODO: vom Kunden bestätigen — Logos und Weblinks der Partner nachreichen */}
      </Sektion>

      <Abschluss
        titel="Fragen zu einem Produkt?"
        text="Welche Marke in Ihr Bad oder an Ihre Heizung passt, klären wir im Gespräch — mit dem, was wir aus der Praxis kennen."
      />
    </>
  );
}
