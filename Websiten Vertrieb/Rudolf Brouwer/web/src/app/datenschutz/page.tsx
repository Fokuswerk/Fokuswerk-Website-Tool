import type { Metadata } from "next";
import SeitenKopf from "@/components/SeitenKopf";
import { betrieb } from "@/daten/betrieb";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Hinweise zur Verarbeitung personenbezogener Daten beim Besuch dieser Website der Rudolf Brouwer GmbH.",
  alternates: { canonical: "/datenschutz" },
};

export default function DatenschutzSeite() {
  return (
    <>
      <SeitenKopf
        marke="Rechtliches"
        titel="Datenschutz"
        anriss="Diese Website kommt ohne Tracking, ohne Werbenetzwerke und ohne Einwilligungsbanner aus. Was trotzdem an Daten anfällt, steht hier."
        krumen={[{ name: "Datenschutz", weg: "/datenschutz" }]}
      />

      <section className="takt-oben takt-unten">
        <div className="bahn">
          <div className="recht">
            <div className="recht-block">
              <h2>Verantwortliche Stelle</h2>
              <p>
                {betrieb.name}<br />
                {betrieb.strasse}<br />
                {betrieb.plz} {betrieb.ort}<br />
                Telefon {betrieb.telefon}<br />
                E-Mail <a href={`mailto:${betrieb.mail}`}>{betrieb.mail}</a>
              </p>
            </div>

            <div className="recht-block">
              <h2>Aufruf dieser Website</h2>
              <p>
                Beim Aufruf werden vom Server technisch notwendige Daten verarbeitet: IP-Adresse,
                Datum und Uhrzeit, aufgerufene Adresse, übertragene Datenmenge sowie Browser- und
                Betriebssystemangaben. Diese Verarbeitung ist zum Betrieb und zur Sicherheit der
                Website erforderlich; Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO.
              </p>
              <h2 className="recht-zweit">Keine Cookies, kein Tracking</h2>
              <p>
                Diese Website setzt keine Cookies zu Analyse- oder Werbezwecken, bindet keine
                Werbenetzwerke ein und erstellt keine Nutzungsprofile. Deshalb gibt es auch kein
                Einwilligungsbanner.
              </p>
            </div>

            <div className="recht-block">
              <h2>Kontakt- und Bewerbungsformular</h2>
              <p>
                Die Formulare auf dieser Website senden nichts an einen Server dieser Seite.
                Beim Absenden wird das E-Mail-Programm auf Ihrem Gerät mit den eingegebenen
                Angaben geöffnet — Sie entscheiden, ob Sie die Nachricht abschicken. Erst damit
                gelangen Ihre Angaben an {betrieb.mail}.
              </p>
              <p>
                Rufen Sie an oder schreiben Sie uns, verarbeiten wir Ihre Angaben zur Bearbeitung
                der Anfrage nach Artikel 6 Absatz 1 Buchstabe b beziehungsweise f DSGVO.
                Bewerbungsunterlagen verarbeiten wir nach § 26 BDSG zur Entscheidung über die
                Begründung eines Beschäftigungsverhältnisses und löschen sie, wenn sie dafür
                nicht mehr benötigt werden.
              </p>
            </div>

            <div className="recht-block">
              <h2>Kartenausschnitt</h2>
              <p>
                Auf der Kontaktseite kann ein Kartenausschnitt von OpenStreetMap angezeigt
                werden. Er wird ausschließlich geladen, wenn Sie die Schaltfläche „Karte laden"
                anklicken. Erst dann stellt Ihr Browser eine Verbindung zu Servern der
                OpenStreetMap Foundation her und übermittelt dabei Ihre IP-Adresse.
                Rechtsgrundlage ist Ihre Einwilligung nach Artikel 6 Absatz 1 Buchstabe a DSGVO,
                die Sie durch den Klick erteilen. Ohne Klick wird keine Verbindung aufgebaut.
              </p>
              <h2 className="recht-zweit">Schriften</h2>
              <p>
                Die verwendeten Schriften werden mit dieser Website ausgeliefert. Es entsteht
                keine Verbindung zu Servern Dritter.
              </p>
              <h2 className="recht-zweit">Hosting</h2>
              <p>
                Diese Website wird bei einem Dienstleister betrieben, der die Daten in unserem
                Auftrag verarbeitet.
                {/* TODO: vom Kunden bestätigen — Name und Anschrift des Hosters sowie der
                    Auftragsverarbeitungsvertrag, sobald der endgültige Betreiber feststeht. */}
              </p>
            </div>

            <div className="recht-block">
              <h2>Ihre Rechte</h2>
              <p>
                Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
                Verarbeitung, Datenübertragbarkeit und Widerspruch. Wenden Sie sich dafür an die
                oben genannte Anschrift. Außerdem können Sie sich bei einer Datenschutz-
                Aufsichtsbehörde beschweren — zuständig ist in Niedersachsen die Landesbeauftragte
                für den Datenschutz Niedersachsen.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
