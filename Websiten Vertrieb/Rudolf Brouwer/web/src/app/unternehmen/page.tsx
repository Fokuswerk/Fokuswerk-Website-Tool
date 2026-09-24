import type { Metadata } from "next";
import Link from "next/link";
import SeitenKopf from "@/components/SeitenKopf";
import Niveau from "@/components/Niveau";
import Auftritt from "@/components/Auftritt";
import Bild from "@/components/Bild";
import { betrieb, chronik } from "@/daten/betrieb";

export const metadata: Metadata = {
  title: "Das Unternehmen — Familienbetrieb in Wardenburg seit 1962",
  description:
    "Die Rudolf Brouwer GmbH wurde 1962 in einer Garage in Nordmoslesfehn gegründet und sitzt seit 1973 an der Oldenburger Straße 209 in Wardenburg. Chronik, Geschäftsführung und Arbeitsweise.",
  alternates: { canonical: "/unternehmen" },
};

export default function UnternehmenSeite() {
  return (
    <>
      <SeitenKopf
        marke="Unternehmen"
        titel="Ein Betrieb, der seine Adresse seit 1973 nicht gewechselt hat."
        anriss="Gegründet am 22. Januar 1962 von Rudolf Brouwer in der Garage seines Vaters in Nordmoslesfehn. Seit 1966 in Wardenburg, seit 1973 am Ortseingang. Geführt wird er heute von Roelf und Wolfgang Brouwer."
        krumen={[{ name: "Unternehmen", weg: "/unternehmen" }]}
      />

      {/* Die Jahreszahl als Bild */}
      <section className="takt-oben">
        <div className="bahn">
          <div className="gross-jahr">
            <span className="jahr gross-jahr-zahl">1962</span>
            <div className="gross-jahr-text">
              <p className="marke">Gegründet</p>
              <p className="blei satz-eng">
                „22.01.1962: Firmengründung durch Rudolf Brouwer in Nordmoslesfehn — in der Garage
                des Vaters." Zwei Jahre später arbeitet Hannelore Brouwer mit im Betrieb.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chronik */}
      <section className="takt">
        <div className="bahn">
          <Niveau marke="Chronik" ziffer="1962 — 2020" />
          <ol className="chronik">
            {chronik.map((c, i) => (
              <Auftritt as="li" key={c.jahr + c.text.slice(0, 12)} verzug={i * 40} className="chronik-punkt">
                <span className="jahr chronik-jahr">{c.jahr}</span>
                <p className="chronik-text">{c.text}</p>
                {"bild" in c && c.bild ? (
                  <div className="chronik-bild">
                    <Bild datei={c.bild} alt={("alt" in c && c.alt) || ""} verhaeltnis="16 / 9" sizes="(max-width: 767px) 92vw, 300px" />
                  </div>
                ) : <span className="chronik-leer" aria-hidden="true" />}
              </Auftritt>
            ))}
          </ol>
        </div>
      </section>

      {/* Die Menschen */}
      <section className="takt kapitel-eigen">
        <div className="bahn">
          <Niveau marke="Wer entscheidet" ziffer="Geschäftsführung" />
          <div className="leute-raster">
            <Auftritt className="leute-bild">
              <Bild datei="geschaeftsfuehrung.webp" alt="Roelf und Wolfgang Brouwer, Geschäftsführer der Rudolf Brouwer GmbH" verhaeltnis="8 / 5" sizes="(max-width: 899px) 92vw, 42vw" />
              <p className="marke leute-bildtext">Roelf Brouwer · Wolfgang Brouwer</p>
            </Auftritt>
            <div>
              <h2>Zwei Namen, zwei Bereiche.</h2>
              <p className="still satz leute-blei">
                Roelf Brouwer ist seit dem 15. März 1990 im Betrieb und verantwortet den Bereich
                Schwimmbad. Wolfgang Brouwer kam zum 1. Januar 1997 dazu und verantwortet die
                Heizung. Beide sind Geschäftsführer — und beide sind im Haus, wenn Sie anrufen.
              </p>
              <ul className="liste-strich leute-liste">
                <li>
                  <span className="leute-titel">Kein Callcenter</span>
                  <span className="still">Am Telefon sitzt jemand, der den Betrieb kennt.</span>
                </li>
                <li>
                  <span className="leute-titel">Zwei Gesellschaften</span>
                  <span className="still">Der Schwimmbadbereich läuft als {betrieb.pool.name} an derselben Adresse.</span>
                </li>
                <li>
                  <span className="leute-titel">Meisterbetrieb</span>
                  <span className="still">Eingetragen beim {betrieb.registergericht}, {betrieb.handelsregister}.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Das Team */}
      <section className="takt">
        <div className="bahn">
          <Niveau marke="Die Mannschaft" ziffer="Wer die Arbeit macht" />
          <div className="mann-raster">
            <Auftritt className="mann-bild">
              <Bild datei="team.webp" alt="Das Team der Rudolf Brouwer GmbH bei einer gemeinsamen Veranstaltung" verhaeltnis="4 / 3" sizes="(max-width: 899px) 92vw, 56vw" />
            </Auftritt>
            <div className="mann-text">
              <h2 className="satz-eng">Anlagenmechaniker, Kundendiensttechniker, Auszubildende.</h2>
              <p className="still satz mann-blei">
                Die Leute, die zu Ihnen ins Haus kommen, arbeiten hier — viele seit Jahren.
                Wer dazukommen will, findet die offenen Stellen auf der Karriereseite.
                {/* TODO: vom Kunden bestätigen — Mitarbeiterzahl, damit sie als Kennzahl
                    genannt werden kann. Bisher nirgends belegt, deshalb keine Angabe. */}
              </p>
              <div className="quer-knoepfe">
                <Link href="/karriere" className="knopf">Offene Stellen</Link>
                <Link href="/karriere/ausbildung" className="knopf knopf-still">Ausbildung</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
