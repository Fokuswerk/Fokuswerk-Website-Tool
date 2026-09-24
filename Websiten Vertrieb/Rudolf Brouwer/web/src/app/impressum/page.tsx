import type { Metadata } from "next";
import SeitenKopf from "@/components/SeitenKopf";
import { betrieb } from "@/daten/betrieb";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung der Rudolf Brouwer GmbH, Oldenburger Straße 209, 26203 Wardenburg.",
  alternates: { canonical: "/impressum" },
};

export default function ImpressumSeite() {
  return (
    <>
      <SeitenKopf
        marke="Rechtliches"
        titel="Impressum"
        anriss="Angaben gemäß § 5 Digitale-Dienste-Gesetz."
        krumen={[{ name: "Impressum", weg: "/impressum" }]}
      />

      <section className="takt-oben takt-unten">
        <div className="bahn">
          <div className="recht">
            <div className="recht-block">
              <h2>Anbieter</h2>
              <p>
                {betrieb.name}<br />
                {betrieb.strasse}<br />
                {betrieb.plz} {betrieb.ort}
              </p>
              <p>
                Telefon <a href={`tel:${betrieb.telefonRoh}`}>{betrieb.telefon}</a><br />
                Telefax {betrieb.fax}<br />
                E-Mail <a href={`mailto:${betrieb.mail}`}>{betrieb.mail}</a>
              </p>
            </div>

            <div className="recht-block">
              <h2>Vertretungsberechtigt</h2>
              <p>Geschäftsführer: {betrieb.geschaeftsfuehrung.join(", ")}</p>
              <h2 className="recht-zweit">Registereintrag</h2>
              <p>
                {betrieb.registergericht}<br />
                {betrieb.handelsregister}
              </p>
              <h2 className="recht-zweit">Umsatzsteuer-Identifikationsnummer</h2>
              <p>Gemäß § 27 a Umsatzsteuergesetz: {betrieb.ustId}</p>
            </div>

            <div className="recht-block">
              <h2>Verantwortlich für den Inhalt</h2>
              <p>
                {betrieb.geschaeftsfuehrung[1]} und {betrieb.geschaeftsfuehrung[0]}<br />
                Anschrift wie oben
              </p>
              <h2 className="recht-zweit">Berufsbezeichnung</h2>
              <p>
                Installateur- und Heizungsbauerhandwerk, verliehen in der Bundesrepublik Deutschland.
                Es gelten die Handwerksordnung sowie die Regelungen der zuständigen Handwerkskammer.
                {/* TODO: vom Kunden bestätigen — zuständige Handwerkskammer und Kammerbezirk
                    für die vollständige Angabe nach § 5 DDG. */}
              </p>
            </div>

            <div className="recht-block">
              <h2>Streitbeilegung</h2>
              <p>
                Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor
                einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
              <h2 className="recht-zweit">Bildnachweis</h2>
              <p>
                Aufnahmen der Ausstellung, der Fahrzeuge, des Betriebsgebäudes und abgeschlossener
                Bäder: {betrieb.name}. Historische Aufnahmen: Archiv des Unternehmens.
                Herstellerlogos: die jeweiligen Markeninhaber.
              </p>
              <h2 className="recht-zweit">Haftung für Inhalte und Links</h2>
              <p>
                Für eigene Inhalte auf diesen Seiten sind wir nach den allgemeinen Gesetzen
                verantwortlich. Wir sind nicht verpflichtet, übermittelte oder gespeicherte
                fremde Informationen zu überwachen. Für die Inhalte verlinkter externer Seiten
                ist stets deren Anbieter verantwortlich; zum Zeitpunkt der Verlinkung waren keine
                rechtswidrigen Inhalte erkennbar. Werden uns Rechtsverletzungen bekannt, entfernen
                wir die betreffenden Inhalte umgehend.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
