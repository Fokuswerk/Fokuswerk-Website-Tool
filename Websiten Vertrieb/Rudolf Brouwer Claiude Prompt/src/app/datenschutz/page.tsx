import type { Metadata } from "next";
import { Sektion, Seitenkopf } from "@/components/Bausteine";
import Anlauf from "@/components/Anlauf";
import { betrieb } from "@/lib/daten";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung der Rudolf Brouwer GmbH, Wardenburg.",
  alternates: { canonical: "/datenschutz" },
  robots: { index: false, follow: true },
};

function Block({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <Anlauf klasse="border-t border-tief/15 py-10 first:border-t-0 first:pt-0">
      <h2 className="t-h3">{titel}</h2>
      <div className="mass mt-6 space-y-4 text-tief/75">{children}</div>
    </Anlauf>
  );
}

export default function Datenschutz() {
  return (
    <>
      <Seitenkopf
        label="Rechtliches"
        titel="Datenschutz"
        text="Diese Website kommt ohne Tracking, ohne Werbenetzwerke und ohne Einwilligungsbanner aus. Was trotzdem verarbeitet wird, steht hier."
      />

      <Sektion>
        <div className="max-w-[80ch]">
          <Block titel="Verantwortlicher">
            <address className="not-italic">
              {betrieb.name}
              <br />
              {betrieb.strasse}
              <br />
              {betrieb.plz} {betrieb.ort}
            </address>
            <p>
              Telefon: {betrieb.telefon}
              <br />
              E-Mail: <a href={`mailto:${betrieb.email}`} className="text-tief hover:text-kupfer">{betrieb.email}</a>
            </p>
            {/* TODO: vom Kunden bestätigen — ist ein Datenschutzbeauftragter benannt? */}
          </Block>

          <Block titel="Aufruf der Website (Server-Logfiles)">
            <p>
              Beim Aufruf dieser Website werden durch den Hosting-Dienstleister automatisch
              Zugriffsdaten verarbeitet: IP-Adresse, Datum und Uhrzeit, aufgerufene Seite,
              übertragene Datenmenge, Browsertyp und Betriebssystem. Diese Verarbeitung ist technisch
              erforderlich, um die Seite auszuliefern und den Betrieb abzusichern.
            </p>
            <p>
              Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO. Unser berechtigtes Interesse
              liegt im sicheren und stabilen Betrieb der Website.
            </p>
          </Block>

          <Block titel="Hosting">
            <p>
              Diese Website wird bei der Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
              USA, gehostet. Mit dem Anbieter besteht ein Auftragsverarbeitungsvertrag. Eine
              Übermittlung in die USA stützt sich auf die Standardvertragsklauseln der EU-Kommission.
              {/* TODO: vom Kunden bestätigen — endgültiger Hoster und abgeschlossener AV-Vertrag */}
            </p>
          </Block>

          <Block titel="Cookies und Analyse">
            <p>
              Diese Website setzt keine Cookies zu Analyse- oder Werbezwecken und bindet keine
              Tracking-Dienste ein. Schriften werden vom eigenen Server ausgeliefert, es wird keine
              Verbindung zu Google Fonts aufgebaut.
            </p>
          </Block>

          <Block titel="Kartendarstellung (OpenStreetMap)">
            <p>
              Auf der Kontaktseite können Sie eine Karte von OpenStreetMap nachladen. Die Karte wird
              erst geladen, wenn Sie die Schaltfläche anklicken. Dabei wird Ihre IP-Adresse an die
              OpenStreetMap Foundation, St John&apos;s Innovation Centre, Cowley Road, Cambridge,
              CB4 0WS, Vereinigtes Königreich, übertragen. Rechtsgrundlage ist Ihre Einwilligung nach
              Artikel 6 Absatz 1 Buchstabe a DSGVO, die Sie durch den Klick erteilen.
            </p>
          </Block>

          <Block titel="Kontaktaufnahme">
            <p>
              Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir Ihre Angaben zur
              Bearbeitung der Anfrage. Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe b DSGVO,
              soweit die Anfrage der Anbahnung oder Durchführung eines Vertrags dient, sonst Artikel
              6 Absatz 1 Buchstabe f DSGVO. Wir löschen die Daten, sobald sie nicht mehr erforderlich
              sind, und beachten gesetzliche Aufbewahrungsfristen.
            </p>
          </Block>

          <Block titel="Bewerbungen">
            <p>
              Bewerbungsunterlagen verarbeiten wir ausschließlich zur Durchführung des
              Bewerbungsverfahrens auf Grundlage von § 26 BDSG und Artikel 6 Absatz 1 Buchstabe b
              DSGVO. Nach Abschluss des Verfahrens löschen wir die Unterlagen spätestens nach sechs
              Monaten, sofern Sie einer längeren Speicherung nicht zugestimmt haben.
            </p>
          </Block>

          <Block titel="Ihre Rechte">
            <p>
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
              Verarbeitung, Datenübertragbarkeit und Widerspruch. Eine erteilte Einwilligung können
              Sie jederzeit mit Wirkung für die Zukunft widerrufen. Wenden Sie sich dafür an die oben
              genannten Kontaktdaten.
            </p>
            <p>
              Außerdem steht Ihnen ein Beschwerderecht bei einer Aufsichtsbehörde zu. Zuständig ist
              die Landesbeauftragte für den Datenschutz Niedersachsen, Prinzenstraße 5, 30159
              Hannover.
            </p>
          </Block>

          <Block titel="Stand">
            <p>
              Diese Erklärung beschreibt den technischen Stand dieser Website. Sie ersetzt keine
              rechtliche Prüfung.
              {/* TODO: vom Kunden bestätigen — Datenschutzerklärung vor dem Livegang anwaltlich prüfen lassen */}
            </p>
          </Block>
        </div>
      </Sektion>
    </>
  );
}
