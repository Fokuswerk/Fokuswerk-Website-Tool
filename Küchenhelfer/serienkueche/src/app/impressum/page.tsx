import Link from "next/link";
import { Rechtsseite, Platzhalter } from "@/components/warm/Rechtsseite";

export const metadata = { title: "Impressum — Serienküche" };

export default function Impressum() {
  return (
    <Rechtsseite titel="Impressum" vor="Angaben nach § 5 DDG">
      <h2>Anbieter</h2>
      <p>
        <Platzhalter>Firmenname</Platzhalter>
        <br />
        <Platzhalter>Straße und Hausnummer</Platzhalter>
        <br />
        <Platzhalter>Postleitzahl und Ort</Platzhalter>
      </p>

      <h2>Vertreten durch</h2>
      <p><Platzhalter>Name der vertretungsberechtigten Person</Platzhalter></p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <Platzhalter>Nummer</Platzhalter>
        <br />
        E-Mail: <Platzhalter>adresse@beispiel.de</Platzhalter>
      </p>

      <h2>Registereintrag</h2>
      <p>
        Eingetragen im <Platzhalter>Handelsregister</Platzhalter> des
        Amtsgerichts <Platzhalter>Ort</Platzhalter>, Registernummer{" "}
        <Platzhalter>HRB 00000</Platzhalter>.
      </p>

      <h2>Umsatzsteuer-Identifikationsnummer</h2>
      <p>
        Nach § 27 a Umsatzsteuergesetz: <Platzhalter>DE000000000</Platzhalter>
      </p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen. Die frühere Online-Streitbeilegungsplattform der
        Europäischen Kommission wurde zum 20. Juli 2025 eingestellt; ein Verweis darauf entfällt
        deshalb.
      </p>

      <h2>Verantwortlich für den Inhalt</h2>
      <p><Platzhalter>Name und Anschrift</Platzhalter></p>

      <p className="hinweis">
        Dieses Werkzeug ist ein Prototyp. Solange hier Platzhalter stehen, wird die Seite nicht
        öffentlich betrieben — die Angaben müssen vor dem ersten öffentlichen Aufruf vollständig
        sein. Siehe auch die <Link href="/datenschutz">Datenschutzerklärung</Link>.
      </p>
    </Rechtsseite>
  );
}
