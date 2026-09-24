import type { Metadata } from "next";
import Link from "next/link";
import SeitenKopf from "@/components/SeitenKopf";
import Niveau from "@/components/Niveau";
import Auftritt from "@/components/Auftritt";
import Bild from "@/components/Bild";
import Kontaktformular from "@/components/Kontaktformular";
import Karte from "@/components/Karte";
import FragenBlock from "@/components/FragenBlock";
import { betrieb } from "@/daten/betrieb";
import { faqAllgemein } from "@/daten/faq";

export const metadata: Metadata = {
  title: "Kontakt — Rudolf Brouwer GmbH, Oldenburger Straße 209, Wardenburg",
  description:
    "Telefon 04407 8991, info@brouwer-gmbh.de, Oldenburger Straße 209 in 26203 Wardenburg. Öffnungszeiten, Anfahrt und ein kurzes Anfrageformular — Beratung und Ausstellungsbesuch nach Terminabsprache.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktSeite() {
  return (
    <>
      <SeitenKopf
        marke="Kontakt"
        titel="Am schnellsten geht es am Telefon."
        anriss="Ein Anruf klärt in zwei Minuten, was ein Formular in drei Absätzen umkreist. Wenn es Ihnen anders lieber ist: Das Formular unten kommt mit Auswahl statt fünfzehn Pflichtfeldern aus."
        krumen={[{ name: "Kontakt", weg: "/kontakt" }]}
      />

      {/* Die drei Wege */}
      <section className="takt-oben">
        <div className="bahn">
          <ul className="wege-drei">
            <li>
              <span className="marke marke-akzent">Anrufen</span>
              <a href={`tel:${betrieb.telefonRoh}`} className="wege-haupt">{betrieb.telefon}</a>
              <span className="still">Mo–Do 8.30–12.30 und 14.00–17.00 Uhr · Fr 8.30–12.30 Uhr</span>
            </li>
            <li>
              <span className="marke">Schreiben</span>
              <a href={`mailto:${betrieb.mail}`} className="wege-haupt wege-mail">{betrieb.mail}</a>
              <span className="still">Telefax {betrieb.fax}</span>
            </li>
            <li>
              <span className="marke">Vorbeikommen</span>
              <span className="wege-haupt wege-adresse">{betrieb.strasse}<br />{betrieb.plz} {betrieb.ort}</span>
              <span className="still">{betrieb.zeitenHinweis}</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Formular */}
      <section className="takt" id="anfrage">
        <div className="bahn">
          <Niveau marke="Anfrage" ziffer="Auswahl, dann vier Felder" />
          <div className="anfrage-raster">
            <div className="anfrage-text">
              <h2>Sagen Sie kurz, worum es geht.</h2>
              <p className="still satz anfrage-blei">
                Für einen Rückruf genügen Name und eine Nummer. Wenn Sie schon wissen, was
                ansteht, helfen ein paar Angaben zum Gebäude — Baujahr, Größe, was erneuert
                werden soll.
              </p>
              <div className="anfrage-notiz">
                <p className="marke">Heizung ausgefallen?</p>
                <p className="still anfrage-notiz-text">
                  Dann nicht schreiben, sondern anrufen: Der Notdienst ist rund um die Uhr
                  erreichbar.
                </p>
                <Link href="/leistungen/kundendienst#notdienst" className="pfeil">
                  Zum Notdienst
                  <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true"><path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" /></svg>
                </Link>
              </div>
            </div>
            <div className="anfrage-form">
              <Kontaktformular />
            </div>
          </div>
        </div>
      </section>

      {/* Anfahrt und Karte */}
      <section className="takt kapitel-eigen">
        <div className="bahn">
          <Niveau marke="Anfahrt" ziffer="Am Ortseingang" />
          <div className="karte-raster">
            <div className="karte-text">
              <h2 className="satz-eng">Oldenburger Straße 209, seit 1973.</h2>
              <address className="karte-adresse">
                {betrieb.name}<br />
                {betrieb.strasse}<br />
                {betrieb.plz} {betrieb.ort}
              </address>
              <dl className="karte-zeiten">
                {betrieb.zeiten.map((z) => (
                  <div key={z.tage}>
                    <dt className="marke">{z.tage}</dt>
                    <dd>{z.zeit}</dd>
                  </div>
                ))}
              </dl>
              <p className="still karte-hinweis">{betrieb.zeitenHinweis}</p>
              <Auftritt className="karte-bild">
                <Bild datei="gebaeude-quer.webp" alt="Das Gebäude der Rudolf Brouwer GmbH an der Oldenburger Straße in Wardenburg" verhaeltnis="12 / 5" sizes="(max-width: 899px) 92vw, 40vw" />
              </Auftritt>
            </div>
            <Karte />
          </div>
        </div>
      </section>

      <FragenBlock fragen={faqAllgemein} titel="Bevor Sie anrufen." ziffer="Preis, Dauer, Zuständigkeit" />
    </>
  );
}
