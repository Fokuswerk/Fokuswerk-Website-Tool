import type { Metadata } from "next";
import Anlauf from "@/components/Anlauf";
import Zahl from "@/components/Zahl";
import { Sektion, Kopfzeile, Seitenkopf, Abschluss, Knopf, Foto, Bildband } from "@/components/Bausteine";
import { betrieb } from "@/lib/daten";

export const metadata: Metadata = {
  title: "Ausstellung Bad und Pool",
  description:
    "Über 500 m² Ausstellung für Bad und Pool in Wardenburg bei Oldenburg. Badkojen, Duschen, Wannen, Heiztechnik und Wasserpflege — Besuch nach Terminabsprache.",
  alternates: { canonical: "/ausstellung" },
};

const fotos = [
  { bild: "/fotos/ausstellung-sitzbereich.jpg", alt: "Sitzecke in der Ausstellung vor einer Blumentapete, dahinter Badkojen und eine Duschkabine" },
  { bild: "/fotos/ausstellung-baeder.jpg", alt: "Mehrere Badkojen mit Waschtischen, WCs und begehbarer Dusche unter einer Holztreppe" },
  { bild: "/fotos/ausstellung-doppelwaschtisch.jpg", alt: "Doppelwaschtisch mit Aufsatzbecken, beleuchtetem Spiegel und Glasdusche" },
  { bild: "/fotos/ausstellung-badewanne.jpg", alt: "Badewanne mit Holzablage und grauem Waschtisch mit Spiegelschrank" },
  { bild: "/fotos/ausstellung-dusche.jpg", alt: "Eckdusche aus Glas neben einem Waschtisch mit Holzfront und Handtuchheizkörper" },
  { bild: "/fotos/ausstellung-waschtisch-holz.jpg", alt: "Waschtisch vor ockerfarbener Wand mit Spiegelschrank und Hochschrank in Eiche" },
  { bild: "/fotos/ausstellung-armatur.jpg", alt: "Verchromte Einhebelarmatur an einem weißen Waschbecken, daneben ein Zahnputzbecher" },
  { bild: "/fotos/ausstellung-whirlwanne.jpg", alt: "Massagedüsen im Boden einer weißen Badewanne" },
  { bild: "/fotos/ausstellung-wandtext.jpg", alt: "Wandtext in der Ausstellung: Bad, Aufenthaltsort von Seeräubern, Duschsängern, Topmodels und Beauty Queens" },
  { bild: "/fotos/ausstellung-heizung.jpg", alt: "Heizkessel und Heizkörper der Marke Brötje in der Ausstellung" },
  { bild: "/fotos/ausstellung-poolpflege.jpg", alt: "Regal mit Wasserpflegemitteln und Pooltestern hinter Glas" },
  { bild: "/fotos/ausstellung-beratung.jpg", alt: "Beratungsraum mit langem Holztisch, Bildschirm und Poolfotos an der Wand" },
];

export default function Ausstellung() {
  return (
    <>
      <Seitenkopf
        label="Ausstellung · Wardenburg"
        titel="Ein Bad aussuchen heißt: hingehen und anfassen."
        text="Auf mehr als 500 Quadratmetern zeigen wir Bäder, Duschen, Wannen, Heiztechnik und alles für den Pool. 2020 haben wir umgebaut."
        aktionen={
          <>
            <Knopf href="/kontakt">Termin vereinbaren</Knopf>
            <Knopf href="tel:+49440788991" art="linie-hell" extern>
              04407 8991
            </Knopf>
          </>
        }
      />

      <Sektion>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p
              className="t-zahl font-semibold tracking-[-0.04em]"
              style={{ fontSize: "clamp(72px, 11vw, 140px)", lineHeight: 0.88 }}
            >
              <Zahl bis={betrieb.ausstellungQm} />
            </p>
            <p className="t-label mt-4 text-mittel">Quadratmeter Bad und Pool</p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Kopfzeile
              titel={<>Kommen Sie mit Termin — dann hat jemand Zeit für Sie.</>}
              text="Wir bitten um vorherige Absprache. So ist sichergestellt, dass ein Mitarbeiter Sie umfassend berät und nicht nebenbei."
            />
            <Anlauf klasse="mt-8" verzug={80}>
              <p className="t-text mass text-tief/70">
                Planen Sie ein neues Bad oder denken Sie an einen seniorengerechten Umbau? Für ein
                erstes Gespräch steht ein spezialisierter Mitarbeiter bereit. Wenn wir Ihr Bad planen,
                bekommen Sie über die 3D-Badbrille schon vorab den Eindruck, darin zu stehen.
              </p>
            </Anlauf>
          </div>
        </div>
      </Sektion>

      <Bildband
        bild="/fotos/ausstellung-weit.jpg"
        alt="Weiter Blick in die Ausstellung der Brouwer GmbH mit Sitzecke, Badkojen und Duschkabine"
        unterschrift="Wardenburg, Oldenburger Straße 209."
      />

      <Sektion>
        <Kopfzeile nummer="02" label="Rundgang" titel={<>Zwölf Blicke in die Halle.</>} />
        <ul className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {fotos.map((f, i) => (
            <Anlauf als="li" key={f.bild} verzug={(i % 3) * 80}>
              <Foto
                bild={f.bild}
                alt={f.alt}
                verhaeltnis="16/9"
                groesse="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
              />
            </Anlauf>
          ))}
        </ul>
      </Sektion>

      <Abschluss
        titel="Wann passt es Ihnen?"
        text="Rufen Sie an oder schreiben Sie uns — wir halten Ihnen einen Termin frei, an dem in Ruhe beraten werden kann."
      />
    </>
  );
}
