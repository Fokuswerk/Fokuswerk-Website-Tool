import type { Metadata } from "next";
import Anlauf from "@/components/Anlauf";
import Zahl from "@/components/Zahl";
import { Sektion, Kopfzeile, Seitenkopf, Abschluss, Knopf, Foto, Linienliste, Bildband } from "@/components/Bausteine";

export const metadata: Metadata = {
  title: "Heizung — Modernisierung und Wartung",
  description:
    "Heizungsmodernisierung in Wardenburg und Oldenburg: Wärmepumpe, Hybridheizung, Pellets und Solarthermie. Wärmebedarfsberechnung, Förderantrag, Wartung und 24-Stunden-Notdienst.",
  alternates: { canonical: "/heizung" },
};

const systeme = [
  { titel: "Wärmepumpe", text: "Nutzt Umweltwärme aus Luft oder Erdreich." },
  { titel: "Hybridheizung", text: "Zum Beispiel Gasbrennwert kombiniert mit einer Wärmepumpe." },
  { titel: "Solarthermische Anlage", text: "Sonnenwärme für Warmwasser und Heizungsunterstützung." },
  { titel: "Biomasseheizung", text: "Heizen mit Pellets." },
  { titel: "Brennstoffzellenheizung", text: "Strom und Wärme aus einem Gerät." },
  { titel: "Fern- oder Nahwärme", text: "Anschluss an ein vorhandenes Netz." },
];

const auszeichnung = [
  { titel: "Fachgerechte Beratung" },
  { titel: "Planung und Projektierung" },
  { titel: "Klare Preise und Terminzusagen" },
  { titel: "Qualifizierte Installation" },
  { titel: "Kundendienst" },
];

const wartung = [
  { titel: "Reinigung und Einstellung", text: "Das Heizgerät wird gereinigt und optimal eingestellt." },
  { titel: "Steuerung und Regeltechnik", text: "Die zentralen Steuerungs- und Regeleinrichtungen werden überprüft." },
  { titel: "Sicherheitsrelevante Bauteile", text: "Alle sicherheitsrelevanten Bauteile werden kontrolliert." },
];

export default function Heizung() {
  return (
    <>
      <Seitenkopf
        label="02 · Heizung"
        titel="Erst rechnen, dann bauen."
        text="Wir ermitteln den tatsächlichen Wärmebedarf nach Wärmeschutzverordnung. So ist die Anlage so groß wie nötig — und nicht größer."
        aktionen={
          <>
            <Knopf href="/kontakt">Beratung vereinbaren</Knopf>
            <Knopf href="tel:+49440788991" art="linie-hell" extern>
              04407 8991
            </Knopf>
          </>
        }
      />

      <Sektion>
        <Kopfzeile
          nummer="01"
          label="Modernisierung"
          titel={<>Sechs Wege, ein Haus warm zu bekommen.</>}
          text="Welche Energieform zu Ihnen passt, hängt vom Gebäude ab, nicht vom Prospekt. Wir stellen Ihnen die Möglichkeiten vor und rechnen sie durch."
        />
        <div className="mt-16">
          <Linienliste eintraege={systeme} spalten={3} />
        </div>

        <Anlauf klasse="mt-20" verzug={80}>
          <div className="grid grid-cols-1 gap-12 border-t border-tief/20 pt-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <p
                className="t-zahl font-semibold tracking-[-0.04em]"
                style={{ fontSize: "clamp(56px, 8vw, 104px)", lineHeight: 0.92 }}
              >
                <Zahl bis={30} />&nbsp;%
              </p>
              <p className="t-label mt-4 text-mittel">Grundförderung der KfW</p>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p className="t-text mass text-tief/75">
                Die genannten Heizsysteme werden von der KfW gefördert. Das Programm besteht aus einer
                Grundförderung von 30 Prozent und mehreren Bonusförderungen. Welche davon Sie
                bekommen, klären wir in der Beratung — und stellen den Antrag.
              </p>
              <p className="t-text mass mt-6 text-tief/75">
                Eine neue Öl- oder Gasheizung ist weiterhin zulässig. Zu bedenken sind die
                Preisentwicklung der Energieträger, die CO<sub>2</sub>-Abgabe und die Pflicht, ab 2029
                steigende Anteile erneuerbarer Energien zu nutzen.
              </p>
            </div>
          </div>
        </Anlauf>
      </Sektion>

      <Bildband
        bild="/fotos/band-planung.jpg"
        alt="Kupferrohre, Fittinge und eine Rohrzange auf einem Installationsplan"
        unterschrift="Die Anlage wird bis ins Detail geplant, bevor sie gekauft wird."
        position="center 45%"
      />

      <Sektion dunkel>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Kopfzeile
              dunkel
              nummer="02"
              label="Was uns auszeichnet"
              titel={<>Ein Angebot, das hält, was es rechnet.</>}
              text="Wir planen, beziehen mögliche Förderungen ein und erstellen ein Angebot mit klaren Preisen. Die Installation läuft zügig und termingerecht."
            />
          </div>
          <Anlauf klasse="lg:col-span-5 lg:col-start-8" verzug={100}>
            <ul className="divide-y divide-white/15 border-y border-white/15">
              {auszeichnung.map((a) => (
                <li key={a.titel} className="t-karte py-6">
                  {a.titel}
                </li>
              ))}
            </ul>
          </Anlauf>
        </div>
      </Sektion>

      <Sektion>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <Anlauf klasse="lg:col-span-5 lg:order-2" verzug={120}>
            <Foto
              bild="/fotos/ausstellung-heizung.jpg"
              alt="Heizkessel und Heizkörper der Marke Brötje in der Ausstellung der Brouwer GmbH"
              verhaeltnis="16/9"
              groesse="(min-width: 1024px) 40vw, 100vw"
            />
            <p className="t-label mt-4 text-mittel">Heiztechnik in der Ausstellung</p>
          </Anlauf>
          <div className="lg:col-span-6 lg:order-1">
            <Kopfzeile
              nummer="03"
              label="Wartung"
              titel={<>Nach der Installation bleiben wir Ihr Ansprechpartner.</>}
              text="Ihre Heizung liefert jahraus, jahrein Wärme und warmes Wasser. Die regelmäßige Wartung hält Leistung und Betriebsbereitschaft."
            />
            <div className="mt-12">
              <Linienliste eintraege={wartung} spalten={2} />
            </div>
          </div>
        </div>
      </Sektion>

      <Sektion dunkel>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <Kopfzeile
              dunkel
              nummer="04"
              label="Notdienst"
              titel={<>Heizung ausgefallen? Auch am Wochenende geht jemand ran.</>}
              text="Unser Notdienst ist 24 Stunden erreichbar. Wir lassen Sie nicht im Kalten sitzen."
            />
          </div>
          <Anlauf klasse="lg:col-span-5 lg:col-start-9" verzug={80}>
            <a
              href="tel:+49440788991"
              className="t-zahl block font-semibold tracking-[-0.03em] text-papier transition-colors hover:text-kupfer"
              style={{ fontSize: "clamp(34px, 4.6vw, 56px)", lineHeight: 1 }}
            >
              04407 8991
            </a>
            <p className="t-label mt-4 text-papier/50">24 Stunden · Heizungsnotdienst</p>
          </Anlauf>
        </div>
      </Sektion>

      <Abschluss
        titel="Wir rechnen Ihnen das durch."
        text="Bringen Sie mit, was Sie über Ihr Haus wissen — Baujahr, Dämmung, letzte Heizkostenabrechnung. Den Rest machen wir."
      />
    </>
  );
}
