import type { Metadata } from "next";
import Anlauf from "@/components/Anlauf";
import { Sektion, Kopfzeile, Seitenkopf, Abschluss, Knopf, Foto, Linienliste } from "@/components/Bausteine";

export const metadata: Metadata = {
  title: "Wellness — Dampfdusche und Whirlpool",
  description:
    "Dampfdusche und Whirlpool für das eigene Bad: Wellness-Einrichtungen aus Wardenburg. Wunschklima auf der Fläche einer gewöhnlichen Dusche.",
  alternates: { canonical: "/wellness" },
};

const whirlpool = [
  { titel: "Masterjet-Düsen", text: "Kräftige Rückenmassage mit voluminösem Schwall." },
  { titel: "Minijets", text: "Ein ganzer Sitzplatz, dicht besetzt." },
  { titel: "Bodengeysir", text: "Was man sonst nur aus dem portablen Spa-Bereich kennt." },
];

export default function Wellness() {
  return (
    <>
      <Seitenkopf
        label="05 · Wellness"
        titel="Die Wohlfühloase braucht nicht mehr Platz als Ihre Dusche."
        text="Morgens duschen, abends dampfbaden — beides im selben Raum. Wir bauen Wellness-Einrichtungen ins vorhandene Bad."
        aktionen={
          <>
            <Knopf href="/kontakt">Termin vereinbaren</Knopf>
            <Knopf href="/bad" art="linie-hell">
              Zum Bad
            </Knopf>
          </>
        }
      />

      <Sektion>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Kopfzeile
              nummer="01"
              label="Dampfdusche"
              titel={<>50 Grad, 100 Prozent Luftfeuchte — das ist der ganze Trick.</>}
              text="Die Kombination erleichtert die Atmung und hilft bei Heuschnupfen, Bronchitis und Nebenhöhlenentzündung. Das Einatmen von Dampf wirkt schleimlösend und lockert die Muskulatur."
            />
            <Anlauf klasse="mt-10" verzug={80}>
              <p className="t-text mass text-tief/70">
                Morgens lässt sich die Kabine als normale Dusche verwenden, abends oder nach dem
                Sport als Dampfbad. Die Verwendung von Wasserdampf hat eine lange Tradition — schon
                die Kulturen des Altertums wussten um die Wirkung von Dampfbädern.
              </p>
            </Anlauf>
          </div>
          <Anlauf klasse="lg:col-span-5 lg:col-start-8" verzug={120}>
            <Foto
              bild="/fotos/ausstellung-dusche.jpg"
              alt="Verglaste Duschkabine mit Regenbrause neben einem Waschtisch in der Ausstellung"
              verhaeltnis="16/9"
              groesse="(min-width: 1024px) 40vw, 100vw"
            />
            <p className="t-label mt-4 text-mittel">Kabinen in der Ausstellung</p>
          </Anlauf>
        </div>
      </Sektion>

      <Sektion dunkel>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <Anlauf klasse="lg:col-span-5 lg:order-2" verzug={120}>
            <Foto
              bild="/fotos/ausstellung-whirlwanne.jpg"
              alt="Massagedüsen im Boden einer weißen Badewanne, daneben eine Holzablage"
              verhaeltnis="16/9"
              groesse="(min-width: 1024px) 40vw, 100vw"
            />
            <p className="t-label mt-4 text-papier/50">Komfortbad mit Massageanlage</p>
          </Anlauf>
          <div className="lg:col-span-6 lg:order-1">
            <Kopfzeile
              dunkel
              nummer="02"
              label="Whirlpool"
              titel={<>Massage im eigenen Bad, nicht im Hotel.</>}
              text="Für den privaten Bereich gibt es das Komfortbad mit allen Massageanlagen. Filtration und Technik sitzen kompakt auf einer separaten Palette."
            />
            <div className="mt-12">
              <Linienliste eintraege={whirlpool} dunkel spalten={2} />
            </div>
          </div>
        </div>
      </Sektion>

      <Abschluss
        titel="Sehen Sie es sich an."
        text="Dampfdusche und Wanne stehen in der Ausstellung. Nach Terminabsprache zeigen wir Ihnen, was in Ihr Bad passt."
      />
    </>
  );
}
