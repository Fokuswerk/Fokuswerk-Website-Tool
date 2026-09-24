import type { Metadata } from "next";
import Anlauf from "@/components/Anlauf";
import Zahl from "@/components/Zahl";
import { Sektion, Kopfzeile, Seitenkopf, Abschluss, Knopf, Foto, Linienliste } from "@/components/Bausteine";

export const metadata: Metadata = {
  title: "Schwimmbad, Pool und Poolsanierung",
  description:
    "Schwimmbadbau und Pooltechnik aus Wardenburg: Becken, Überdachung, Filteranlage und Beheizung. Poolsanierung mit neuer Folie, Treppe und stromsparender Pumpe.",
  alternates: { canonical: "/schwimmbad" },
};

const technik = [
  { titel: "Beckenarten", text: "Wir stellen Ihnen die verschiedenen Bauarten vor und planen nach Ihren Vorstellungen." },
  { titel: "Überdachung und Abdeckung", text: "Verschiedene Lösungen, damit die Saison länger dauert." },
  { titel: "Beheizung", text: "Hier zahlt sich aus, dass wir seit Jahrzehnten Heizungsbauer sind: Wärmetauscher inklusive." },
  { titel: "Filter und Wasserpflege", text: "Filteranlagen, Wasserreinigung und die Mittel dazu — alles aus der Ausstellung." },
];

export default function Schwimmbad() {
  return (
    <>
      <Seitenkopf
        label="04 · Schwimmbad"
        titel="Der Pool ist das eine. Ihn warm zu bekommen, das andere."
        text="Wir bauen Schwimmbäder im Garten und im Haus — und beheizen sie mit der Erfahrung eines Heizungsbetriebs."
        aktionen={
          <>
            <Knopf href="/kontakt">Beratung vereinbaren</Knopf>
            <Knopf href="https://www.pool-gmbh.de" art="linie-hell" extern>
              pool-gmbh.de
            </Knopf>
          </>
        }
      />

      <Sektion>
        <Kopfzeile
          nummer="01"
          label="Planung"
          titel={<>Die wichtigste Entscheidung fällt vor dem ersten Spatenstich.</>}
          text="Beim Schwimmbad entscheidet der Standort über alles, was danach kommt. Wie bei jeder größeren Anschaffung sollte die Planung gut durchdacht sein."
        />
        <div className="mt-16">
          <Linienliste eintraege={technik} spalten={2} />
        </div>
      </Sektion>

      <Sektion dunkel>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Kopfzeile
              dunkel
              nummer="02"
              label="Poolsanierung"
              titel={<>Ein Becken, das in die Jahre gekommen ist, muss nicht raus.</>}
              text="Eine neue Folie in kräftigen Farben und Mustern frischt das Becken auf. Aus der Leiter wird eine begehbare Treppe."
            />
            <Anlauf klasse="mt-12" verzug={80}>
              <div className="border-t border-white/15 pt-8">
                <p
                  className="t-zahl font-semibold tracking-[-0.04em]"
                  style={{ fontSize: "clamp(56px, 8vw, 104px)", lineHeight: 0.92 }}
                >
                  bis <Zahl bis={50} />&nbsp;%
                </p>
                <p className="t-label mt-4 text-papier/50">
                  weniger Strom durch eine neue Filterpumpe
                </p>
              </div>
            </Anlauf>
          </div>
          <Anlauf klasse="lg:col-span-5 lg:col-start-8" verzug={120}>
            <Foto
              bild="/fotos/ausstellung-poolpflege.jpg"
              alt="Regal mit Wasserpflegemitteln, Pooltestern und Zubehör in der Ausstellung der Brouwer GmbH"
              verhaeltnis="16/9"
              groesse="(min-width: 1024px) 40vw, 100vw"
            />
            <p className="t-label mt-4 text-papier/50">Wasserpflege in der Ausstellung</p>
          </Anlauf>
        </div>
      </Sektion>

      <Sektion>
        <Kopfzeile
          nummer="03"
          label="Spezialseite"
          titel={<>Für den Pool gibt es bei uns eine eigene Adresse.</>}
          text="Roelf und Nicole Brouwer betreuen den Schwimmbadbereich. Ausführliche Informationen und Referenzen finden Sie auf der Spezialseite."
        />
        <Anlauf klasse="mt-10" verzug={80}>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Knopf href="https://www.pool-gmbh.de" extern>
              www.pool-gmbh.de
            </Knopf>
            <Knopf href="mailto:info@pool-gmbh.de" art="linie" extern>
              info@pool-gmbh.de
            </Knopf>
          </div>
        </Anlauf>
      </Sektion>

      <Abschluss
        titel="Abkühlung nach einem heißen Tag."
        text="Eine erfrischende Runde am frühen Morgen, ein Sprung ins Wasser am Abend. Wir sagen Ihnen, was auf Ihrem Grundstück geht."
      />
    </>
  );
}
