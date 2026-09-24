import type { Metadata } from "next";
import Link from "next/link";
import SeitenKopf from "@/components/SeitenKopf";
import Niveau from "@/components/Niveau";
import Auftritt from "@/components/Auftritt";
import Bild from "@/components/Bild";
import FragenBlock from "@/components/FragenBlock";
import { badAblauf } from "@/daten/leistungen";
import { betrieb, basisUrl } from "@/daten/betrieb";
import { faqAllgemein } from "@/daten/faq";

export const metadata: Metadata = {
  title: "Badsanierung in Wardenburg — Planung, Koordination, Ausführung",
  description:
    "Bad komplett erneuern lassen: Brouwer plant, koordiniert Fliesenleger, Elektriker, Maurer und Maler und führt aus. Mit Staubabsauganlage, 3D-Badbrille und über 500 m² Ausstellung in Wardenburg.",
  alternates: { canonical: "/leistungen/badsanierung" },
};

const dienst = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Badsanierung",
  serviceType: "Badsanierung, Badplanung, seniorengerechter Badumbau",
  provider: { "@id": `${basisUrl}/#betrieb` },
  areaServed: { "@type": "Place", name: "Wardenburg" },
  description:
    "Komplette Badsanierung aus einer Hand: Planung, Koordination der übrigen Gewerke, Installation und Übergabe.",
};

const baeder = [
  { datei: "bad-01.webp", alt: "Bad mit Aufsatzwaschbecken, Holzunterschrank, Rundspiegel und großformatiger Wandgestaltung" },
  { datei: "bad-02.webp", alt: "Bad unter der Dachschräge mit wandhängendem Waschtisch und gemusterter Tapete" },
  { datei: "bad-03.webp", alt: "Bad mit Doppelwaschtisch, beleuchtetem Spiegel und Fenster" },
  { datei: "bad-04.webp", alt: "Gäste-WC mit grüner Wand, Holzablage und Aufsatzwaschbecken" },
  { datei: "bad-05.webp", alt: "Bad mit Handtuchheizkörper, bodengleicher Dusche und wandhängendem WC" },
  { datei: "bad-06.webp", alt: "Bad mit Standwaschbecken, Holzablage und schwarz gerahmtem Spiegel" },
  { datei: "bad-07.webp", alt: "Bad mit grau lackierten Möbeln, Doppelwaschtisch und Glasdusche" },
  { datei: "bad-08.webp", alt: "Doppelwaschtisch mit Holzplatte und großem beleuchtetem Spiegel" },
];

export default function BadSeite() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dienst) }} />

      <SeitenKopf
        marke="Bad"
        titel="Ein Bad, für das Sie nur eine Nummer brauchen."
        anriss="Eine Badsanierung ist kein Sanitärauftrag, sondern fünf Handwerke in der richtigen Reihenfolge. Brouwer plant diese Reihenfolge, bestellt die anderen Gewerke und führt die eigene Arbeit selbst aus."
        krumen={[{ name: "Leistungen", weg: "/leistungen" }, { name: "Bad", weg: "/leistungen/badsanierung" }]}
        bild="a-badbereich.webp"
        bildAlt="Badbereich in der Ausstellung mit Waschtisch, Spiegelschrank und Handtuchheizkörper"
        bildVerhaeltnis="21 / 9"
      />

      {/* Der Ablauf — reale Schritte, keine erfundenen Fristen */}
      <section className="takt">
        <div className="bahn">
          <Niveau marke="Wie es abläuft" ziffer="06 Schritte" />
          <div className="ablauf-kopf">
            <h2 className="satz-eng">Von der ersten Idee bis zur Endreinigung.</h2>
            <p className="still satz ablauf-anriss">
              Diese Schritte beschreiben, was tatsächlich passiert. Wie lange sie dauern,
              entscheidet sich am Gebäude — verbindlich wird der Termin, der im Angebot steht.
              {/* TODO: vom Kunden bestätigen — übliche Dauer je Schritt, falls sie genannt werden soll. */}
            </p>
          </div>
          <ol className="ablauf">
            {badAblauf.map((s, i) => (
              <Auftritt as="li" key={s.nr} verzug={i * 60}>
                <span className="ablauf-nr kennziffer">{s.nr}</span>
                <h3 className="ablauf-titel">{s.titel}</h3>
                <p className="still ablauf-text">{s.text}</p>
              </Auftritt>
            ))}
          </ol>
        </div>
      </section>

      {/* Zwei Eigenheiten, die sonst niemand nennt */}
      <section className="takt kapitel-eigen">
        <div className="bahn">
          <Niveau marke="Zwei Eigenheiten" ziffer="Was den Unterschied macht" />
          <div className="eigen-raster">
            <Auftritt className="eigen">
              <Bild datei="a-dusche.webp" alt="Duschabtrennung und Waschtisch mit Holzfront in der Ausstellung" verhaeltnis="4 / 5" sizes="(max-width: 899px) 45vw, 22vw" />
              <h3>Eine Staubabsauganlage</h3>
              <p className="still">
                Beim Ausbrechen des alten Bades entsteht der Staub, der sonst durch die ganze
                Wohnung zieht. Brouwer setzt dafür eigens eine Absauganlage ein. Ein Detail, das
                erst auffällt, wenn es fehlt.
              </p>
            </Auftritt>
            <Auftritt className="eigen" verzug={90}>
              <Bild datei="brille.webp" alt="3D-Brille für die Badplanung auf einem Schreibtisch" verhaeltnis="4 / 5" sizes="(max-width: 899px) 45vw, 22vw" />
              <h3>Die 3D-Badbrille</h3>
              <p className="still">
                Wenn Brouwer Ihr Bad plant, können Sie mit der Brille hineingehen, bevor gebaut
                wird. Nicht als Spielerei: Die Frage, ob der Waschtisch zu wuchtig wirkt,
                beantwortet ein Raum besser als ein Grundriss.
              </p>
            </Auftritt>
            <div className="eigen eigen-text">
              <h3>Und wenn das Bad länger halten soll, als Sie gut zu Fuß sind</h3>
              <p className="still">
                Barrierefreie Bäder müssen nicht nach Pflegeheim aussehen. Die Aufgabe ist,
                Duschbereiche zu bauen, die heute schön sind und morgen tragen — bodengleich,
                mit Platz zum Wenden und mit Halt an den Stellen, an denen man ihn irgendwann
                braucht. Brouwer plant das als normales Bad, nicht als Sonderfall.
              </p>
              <Link href="/kontakt#anfrage" className="pfeil eigen-pfeil">
                Beratungstermin anfragen
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true"><path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gebaute Bäder */}
      <section className="takt kapitel-galerie">
        <div className="bahn">
          <Niveau marke="Gebaute Bäder" ziffer="aus dem eigenen Auftragsbuch" />
          <ul className="galerie">
            {baeder.map((b, i) => (
              <Auftritt as="li" key={b.datei} verzug={(i % 4) * 60}>
                <Bild datei={b.datei} alt={b.alt} verhaeltnis="4 / 5" sizes="(max-width: 599px) 92vw, (max-width: 999px) 45vw, 23vw" />
              </Auftritt>
            ))}
          </ul>
          <p className="still galerie-fuss">
            Aufnahmen aus abgeschlossenen Bädern der Rudolf Brouwer GmbH.
            {/* TODO: reale Referenz ergänzen — je Bad Ort, Jahr und Umfang beim Kunden erfragen,
                damit aus der Galerie ein Projektverzeichnis wird. */}
          </p>
        </div>
      </section>

      {/* Ausstellung als nächster Schritt */}
      <section className="kapitel-quer auf-dunkel">
        <div className="bahn">
          <div className="quer-raster">
            <div>
              <p className="marke">Der nächste Schritt</p>
              <h2 className="quer-titel">Oberflächen entscheidet man nicht am Bildschirm.</h2>
              <p className="still satz quer-blei">
                In der Ausstellung stehen Fliesen, Armaturen, Möbel und Duschabtrennungen in
                echter Größe. Über 500 Quadratmeter, 2020 neu aufgeteilt. Kommen Sie nach
                Terminabsprache — dann hat jemand Zeit für Sie.
              </p>
              <div className="quer-knoepfe">
                <Link href="/ausstellung" className="knopf">Ausstellung ansehen</Link>
                <a href={`tel:${betrieb.telefonRoh}`} className="knopf knopf-still">{betrieb.telefon}</a>
              </div>
            </div>
            <Auftritt className="quer-bild">
              <Bild datei="a-wandtext.webp" alt="Wandbeschriftung in der Ausstellung mit einer humorvollen Definition des Wortes Bad" verhaeltnis="3 / 2" sizes="(max-width: 899px) 92vw, 44vw" />
            </Auftritt>
          </div>
        </div>
      </section>

      <FragenBlock
        fragen={faqAllgemein.slice(0, 5)}
        titel="Was vor einer Badsanierung gefragt wird."
        ziffer="Preis und Dauer zuerst"
      />
    </>
  );
}
