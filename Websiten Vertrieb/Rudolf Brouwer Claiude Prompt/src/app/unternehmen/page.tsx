import type { Metadata } from "next";
import Anlauf from "@/components/Anlauf";
import Zeitleiste from "@/components/Zeitleiste";
import { Sektion, Kopfzeile, Seitenkopf, Abschluss, Knopf, Foto } from "@/components/Bausteine";
import { betrieb } from "@/lib/daten";

export const metadata: Metadata = {
  title: "Unternehmen — seit 1962 in Wardenburg",
  description:
    "Die Rudolf Brouwer GmbH: 1962 in einer Garage in Nordmoslesfehn gegründet, seit 1973 an der Oldenburger Straße 209 in Wardenburg. Heizung, Sanitär und Schwimmbad in zweiter Generation.",
  alternates: { canonical: "/unternehmen" },
};

export default function Unternehmen() {
  return (
    <>
      <Seitenkopf
        label="Unternehmen"
        titel="Angefangen hat es 1962 in einer Garage."
        text="Rudolf Brouwer gründete den Betrieb am 22. Januar 1962 in Nordmoslesfehn. Heute führen ihn seine Söhne Roelf und Wolfgang Brouwer."
        aktionen={
          <>
            <Knopf href="/kontakt">Kontakt aufnehmen</Knopf>
            <Knopf href="/karriere" art="linie-hell">
              Offene Stellen
            </Knopf>
          </>
        }
      />

      <Sektion>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Kopfzeile
              nummer="01"
              label="Familienbetrieb"
              titel={<>In jeder Sparte das ganze Spektrum — und das seit {new Date().getFullYear() - betrieb.gegruendet} Jahren.</>}
              text="Ob Bad, Heizung, Solarenergie, Wellness oder Schwimmbad: Wir bieten in jeder Sparte Produkte und Dienstleistungen. Und lassen Sie mit dem 24-Stunden-Notdienst auch am Wochenende nicht im Kalten sitzen."
            />
          </div>
          <Anlauf klasse="lg:col-span-5 lg:col-start-8" verzug={120}>
            <Foto
              bild="/fotos/geschaeftsfuehrer.jpg"
              alt="Wolfgang und Roelf Brouwer, Geschäftsführer der Rudolf Brouwer GmbH"
              verhaeltnis="16/10"
              groesse="(min-width: 1024px) 40vw, 100vw"
            />
            <p className="t-label mt-4 text-mittel">
              Wolfgang und Roelf Brouwer · Geschäftsführer
            </p>
          </Anlauf>
        </div>
      </Sektion>

      <Zeitleiste />

      <Abschluss
        titel="Sie erreichen uns direkt."
        text="Kein Callcenter, keine Warteschleife. Wer ans Telefon geht, kennt den Betrieb."
      />
    </>
  );
}
