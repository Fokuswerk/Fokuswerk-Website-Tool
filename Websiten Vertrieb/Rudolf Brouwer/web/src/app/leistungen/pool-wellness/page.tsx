import type { Metadata } from "next";
import Link from "next/link";
import SeitenKopf from "@/components/SeitenKopf";
import Niveau from "@/components/Niveau";
import Auftritt from "@/components/Auftritt";
import Bild from "@/components/Bild";
import FragenBlock from "@/components/FragenBlock";
import { betrieb, basisUrl } from "@/daten/betrieb";
import { faqPool } from "@/daten/faq";

export const metadata: Metadata = {
  title: "Pool, Schwimmbadtechnik und Wellness in Wardenburg",
  description:
    "Schwimmbadbau, Poolsanierung, Filter- und Wärmetechnik, Dampfdusche und Whirlpool. Bad und Pool in einer Ausstellung in Wardenburg — beheizt von einem Betrieb, der seit Jahrzehnten Heizungen baut.",
  alternates: { canonical: "/leistungen/pool-wellness" },
};

const dienst = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Schwimmbad und Wellness",
  serviceType: "Schwimmbadbau, Poolsanierung, Schwimmbadtechnik, Dampfdusche, Whirlpool",
  provider: { "@id": `${basisUrl}/#betrieb` },
  areaServed: { "@type": "Place", name: "Wardenburg" },
  description:
    "Planung und Bau von Schwimmbädern, Sanierung bestehender Becken sowie Filter-, Wärme- und Wasseraufbereitungstechnik.",
};

const technik = [
  { nr: "01", name: "Becken", text: "Bei den Beckenarten ist vieles möglich. Welche zu Grundstück und Nutzung passt, zeigt das erste Gespräch — angefangen bei der Wahl des Standorts." },
  { nr: "02", name: "Filter und Pumpe", text: "Die Filteranlage hält das Wasser klar. Eine effiziente Pumpe nach heutigem Stand kann einen erheblichen Teil des Stroms sparen, den eine alte zieht." },
  { nr: "03", name: "Wärmetauscher", text: "Beheizt wird über einen Wärmetauscher an der Wärmeerzeugung des Hauses. Hier trifft der Pool auf das, was dieser Betrieb seit Jahrzehnten macht." },
  { nr: "04", name: "Wasseraufbereitung", text: "Der Teil, über den niemand spricht und der über den Betrieb entscheidet. Mittel und Messtechnik stehen in der Ausstellung." },
  { nr: "05", name: "Abdeckung und Überdachung", text: "Hält Wärme im Becken und Blätter draußen. Für Abdeckungen und Überdachungen gibt es verschiedene Lösungen." },
];

export default function PoolSeite() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dienst) }} />

      <SeitenKopf
        marke="Pool & Wellness"
        titel="Oben Wasser. Unten eine Anlage."
        anriss="Ein Pool ist eine ruhige Fläche und darunter eine Maschine aus Pumpe, Filter, Wärmetauscher und Wasseraufbereitung. Der zweite Teil entscheidet, ob der erste hält — und er entscheidet sich bei der Planung, nicht beim Kauf."
        krumen={[{ name: "Leistungen", weg: "/leistungen" }, { name: "Pool & Wellness", weg: "/leistungen/pool-wellness" }]}
        bild="regendusche.webp"
        bildAlt="Regendusche über dunklen Fliesen, fallendes Wasser"
        bildVerhaeltnis="21 / 9"
      />

      {/* Die Technik als Kette */}
      <section className="takt">
        <div className="bahn">
          <Niveau marke="Die Kette" ziffer="05 Bauteile" />
          <div className="kette-kopf">
            <h2 className="satz-eng">Fünf Bauteile, die dauerhaft zusammenarbeiten müssen.</h2>
            <p className="still satz kette-anriss">
              Eine Poolanlage fällt selten an einem Teil aus. Sie fällt dort aus, wo die Teile
              nicht aufeinander abgestimmt wurden.
            </p>
          </div>
          <ol className="kette">
            {technik.map((t, i) => (
              <Auftritt as="li" key={t.nr} verzug={i * 55}>
                <span className="kennziffer kette-nr">{t.nr}</span>
                <h3 className="kette-name">{t.name}</h3>
                <p className="still kette-text">{t.text}</p>
              </Auftritt>
            ))}
          </ol>
        </div>
      </section>

      {/* Wellness im Bad */}
      <section className="takt kapitel-wellness auf-dunkel">
        <div className="bahn">
          <Niveau marke="Wellness" ziffer="Im eigenen Bad" />
          <div className="wellness-raster">
            <div className="wellness-text">
              <h2>Die Wohlfühloase braucht keine eigene Etage.</h2>
              <p className="still satz wellness-blei">
                Eine Dampfdusche belegt die Fläche einer normalen Dusche: morgens duschen,
                abends dampfen. Ein Whirlpool bringt Masterjet-Düsen, Minijets und einen
                Bodengeysir ins Haus — mit einer eigenen Technikpalette, die die Montage
                vor Ort kurz hält.
              </p>
            </div>
            <div className="wellness-bilder">
              <Auftritt>
                <Bild datei="dampfdusche.webp" alt="Freistehende Dampfdusche mit gerundeter Glasfront" verhaeltnis="4 / 5" sizes="(max-width: 767px) 45vw, 28vw" />
                <p className="marke wellness-marke">Dampfdusche</p>
              </Auftritt>
              <Auftritt verzug={80}>
                <Bild datei="whirlpool.webp" alt="Whirlpool mit Massagedüsen und sprudelnder Wasseroberfläche" verhaeltnis="4 / 5" sizes="(max-width: 767px) 45vw, 28vw" />
                <p className="marke wellness-marke">Whirlpool</p>
              </Auftritt>
            </div>
          </div>
        </div>
      </section>

      {/* Wer zuständig ist — sauber getrennt */}
      <section className="takt">
        <div className="bahn">
          <Niveau marke="Zuständigkeit" ziffer="Zwei Gesellschaften, eine Adresse" />
          <div className="zustaendig">
            <div className="zustaendig-text">
              <h2 className="satz-eng">Für Schwimmbad gibt es eine eigene Gesellschaft.</h2>
              <p className="still satz zustaendig-blei">
                Der Schwimmbadbereich liegt bei der {betrieb.pool.name} — dieselbe Adresse,
                dieselbe Familie, eigene Ansprechpartner. Zuständig sind {betrieb.pool.ansprech}.
                Ausführliche Informationen zu Becken und Technik stehen auf der eigenen Seite
                des Bereichs.
              </p>
              <div className="zustaendig-knoepfe">
                <a href={betrieb.pool.web} className="knopf" rel="noopener">
                  {betrieb.pool.webKurz} öffnen
                </a>
                <a href={`mailto:${betrieb.pool.mail}`} className="knopf knopf-still">{betrieb.pool.mail}</a>
              </div>
            </div>
            <Auftritt className="zustaendig-bild">
              <Bild datei="a-poolpflege.webp" alt="Regal mit Mitteln zur Wasserpflege im Poolbereich der Ausstellung" verhaeltnis="3 / 4" sizes="(max-width: 899px) 60vw, 28vw" />
            </Auftritt>
          </div>
        </div>
      </section>

      <FragenBlock fragen={faqPool} titel="Was zum Pool gefragt wird." ziffer="Sanierung, Wärme, Zuständigkeit" />

      <section className="kapitel-quer">
        <div className="bahn">
          <div className="quer-raster">
            <div>
              <p className="marke">Ansehen</p>
              <h2 className="quer-titel">Der Poolbereich steht in der Ausstellung.</h2>
              <p className="still satz quer-blei">
                2020 wurde die Ausstellung neu aufgeteilt — Sanitär und Pool unter einem Dach.
                Technik, Wasserpflege und Oberflächen stehen nebeneinander.
              </p>
              <div className="quer-knoepfe">
                <Link href="/ausstellung" className="knopf">Ausstellung ansehen</Link>
              </div>
            </div>
            <Auftritt className="quer-bild">
              <Bild datei="a-flucht.webp" alt="Blick durch die Ausstellung mit Treppe, Sitzbereich und Duschabtrennungen" verhaeltnis="3 / 2" sizes="(max-width: 899px) 92vw, 44vw" />
            </Auftritt>
          </div>
        </div>
      </section>
    </>
  );
}
