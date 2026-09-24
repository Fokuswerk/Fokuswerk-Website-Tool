import type { Metadata } from "next";
import Link from "next/link";
import SeitenKopf from "@/components/SeitenKopf";
import Niveau from "@/components/Niveau";
import Auftritt from "@/components/Auftritt";
import Bild from "@/components/Bild";
import { betrieb } from "@/daten/betrieb";

export const metadata: Metadata = {
  title: "Badausstellung in Wardenburg — über 500 m² für Bad und Pool",
  description:
    "Über 500 Quadratmeter Sanitär- und Poolausstellung an der Oldenburger Straße 209 in Wardenburg. Fliesen, Armaturen, Möbel, Duschabtrennungen und Pooltechnik in echter Größe. Besuch nach Terminabsprache.",
  alternates: { canonical: "/ausstellung" },
};

const raeume = [
  { datei: "a-doppelwasch.webp", alt: "Doppelwaschtisch mit beleuchtetem Spiegel in der Ausstellung", titel: "Waschplätze", text: "Aufsatzbecken, Unterbau, Doppelwaschtisch — nebeneinander und in voller Höhe.", gross: true },
  { datei: "a-treppe.webp", alt: "Waschtisch mit Holzfront, Spiegel und Duschabtrennung neben der Treppe", titel: "Auf zwei Ebenen", text: "Die Ausstellung geht über eine Treppe weiter." },
  { datei: "a-dusche.webp", alt: "Eckdusche mit Glasabtrennung und Waschtisch in Holzoptik", titel: "Duschen", text: "Abtrennungen, Ablaufarten und Fliesenbilder zum Vergleichen." },
  { datei: "a-wanne.webp", alt: "Badewanne mit Holzablage und Spiegelschrank", titel: "Wannen", text: "Einbau, freistehend, mit Ablage — und der Platz, den sie wirklich brauchen.", gross: true },
  { datei: "a-armaturwand.webp", alt: "Regalwand mit Armaturen in der Ausstellung", titel: "Armaturen", text: "Eine ganze Wand. Der Unterschied zwischen zwei Hebeln zeigt sich in der Hand." },
  { datei: "a-poolpflege.webp", alt: "Regal mit Mitteln zur Wasserpflege im Poolbereich", titel: "Poolpflege", text: "Wasseraufbereitung und Messtechnik — der unsichtbare Teil eines Pools." },
];

export default function AusstellungSeite() {
  return (
    <>
      <SeitenKopf
        marke="Ausstellung"
        titel="Über 500 Quadratmeter, die man betreten kann."
        anriss="Ein Bad entscheidet sich an Oberflächen, Höhen und Licht — an Dingen, die ein Bildschirm nicht wiedergibt. Deshalb steht hier alles in echter Größe: Sanitärbereich und Poolbereich unter einem Dach, 2020 neu aufgeteilt."
        krumen={[{ name: "Ausstellung", weg: "/ausstellung" }]}
        bild="a-panorama.webp"
        bildAlt="Blick in die Ausstellung der Rudolf Brouwer GmbH mit Sitzbereich, Duschabtrennungen und Treppe"
        bildVerhaeltnis="2 / 1"
      />

      {/* Drei Zahlen, die den Raum beschreiben */}
      <section className="takt-oben">
        <div className="bahn">
          <ul className="raumzahlen">
            <li>
              <span className="raumzahl jahr">500<span className="raumzahl-einheit">m²</span></span>
              <span className="marke">Fläche</span>
              <span className="still">Seit 1996 in dieser Größe — davor seit 1983 die erste Sanitärausstellung.</span>
            </li>
            <li>
              <span className="raumzahl jahr">2</span>
              <span className="marke">Bereiche</span>
              <span className="still">Sanitär und Pool, seit dem Umbau 2020 klar getrennt und doch nebeneinander.</span>
            </li>
            <li>
              <span className="raumzahl jahr">1973</span>
              <span className="marke">Adresse</span>
              <span className="still">Oldenburger Straße 209, am Ortseingang. Seitdem hat sich nur das Haus verändert.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Rundgang */}
      <section className="takt">
        <div className="bahn">
          <Niveau marke="Rundgang" ziffer="Sechs Stationen" />
          <h2 className="satz-eng rundgang-kopf">Sechs Stationen, die man sonst nur auf Bildern sieht.</h2>
          <ul className="rundgang">
            {raeume.map((r, i) => (
              <Auftritt as="li" key={r.datei} verzug={(i % 3) * 70} className={r.gross ? "rundgang-gross" : ""}>
                <Bild
                  datei={r.datei}
                  alt={r.alt}
                  verhaeltnis={r.gross ? "3 / 2" : "3 / 4"}
                  sizes="(max-width: 599px) 92vw, (max-width: 999px) 45vw, 30vw"
                />
                <h3 className="rundgang-titel">{r.titel}</h3>
                <p className="still rundgang-text">{r.text}</p>
              </Auftritt>
            ))}
          </ul>
        </div>
      </section>

      {/* Der Beratungsraum + 3D-Brille */}
      <section className="takt kapitel-eigen">
        <div className="bahn">
          <Niveau marke="Beratung" ziffer="Warum nach Termin" />
          <div className="beratung-raster">
            <Auftritt className="beratung-bild">
              <Bild datei="a-beratung.webp" alt="Beratungsraum in der Ausstellung mit Besprechungstisch und Bildschirm" verhaeltnis="3 / 2" sizes="(max-width: 899px) 92vw, 50vw" />
            </Auftritt>
            <div>
              <h2>Ein eigener Raum, in dem geplant wird.</h2>
              <p className="still satz beratung-blei">
                Brouwer bittet ausdrücklich um vorherige Terminabsprache. Der Grund ist einfach:
                Dann sitzt jemand mit Ihnen am Tisch, der Zeit hat — statt zwischen zwei
                Baustellen zu erklären, warum die eine Fliese teurer ist als die andere.
              </p>
              <div className="beratung-brille">
                <Bild datei="brille.webp" alt="3D-Brille für die Badplanung auf einem Schreibtisch" verhaeltnis="1 / 1" sizes="120px" klasse="beratung-daumen" />
                <div>
                  <h3 className="beratung-titel">Und wenn geplant wird, können Sie hineingehen.</h3>
                  <p className="still beratung-text">
                    Für geplante Bäder gibt es die 3D-Badbrille. Mit ihr stehen Sie in Ihrem
                    Entwurf, bevor er gebaut ist — die zuverlässigste Art zu merken, dass der
                    Schrank doch zu groß ist.
                  </p>
                </div>
              </div>
              <div className="beratung-knoepfe">
                <Link href="/kontakt#anfrage" className="knopf">Termin anfragen</Link>
                <a href={`tel:${betrieb.telefonRoh}`} className="knopf knopf-still">{betrieb.telefon}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Anfahrt */}
      <section className="takt kapitel-anfahrt auf-dunkel">
        <div className="bahn">
          <Niveau marke="Hinkommen" ziffer="Oldenburger Straße 209" />
          <div className="anfahrt-raster">
            <div>
              <h2 className="anfahrt-titel">Am Ortseingang von {betrieb.ort}.</h2>
              <address className="anfahrt-adresse">
                {betrieb.strasse}<br />
                {betrieb.plz} {betrieb.ort}
              </address>
              <dl className="anfahrt-zeiten">
                {betrieb.zeiten.map((z) => (
                  <div key={z.tage}>
                    <dt className="marke">{z.tage}</dt>
                    <dd>{z.zeit}</dd>
                  </div>
                ))}
              </dl>
              <p className="still anfahrt-hinweis">{betrieb.zeitenHinweis}</p>
              <div className="quer-knoepfe">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${betrieb.breite}&mlon=${betrieb.laenge}#map=17/${betrieb.breite}/${betrieb.laenge}`}
                  className="knopf knopf-still" rel="noopener"
                >
                  Karte öffnen
                </a>
              </div>
            </div>
            <Auftritt className="anfahrt-bild">
              <Bild datei="gebaeude.webp" alt="Das Gebäude der Rudolf Brouwer GmbH an der Oldenburger Straße 209 in Wardenburg" verhaeltnis="16 / 9" sizes="(max-width: 899px) 92vw, 46vw" />
              <p className="marke anfahrt-bildtext">Oldenburger Straße 209 · seit 1973</p>
            </Auftritt>
          </div>
        </div>
      </section>
    </>
  );
}
