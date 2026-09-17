import type { Metadata } from "next";
import { verein } from "@/content/verein";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung der Glücksbringer am Meer e.V. – Informationen zur Verarbeitung personenbezogener Daten auf dieser Webseite.",
  alternates: { canonical: "/datenschutz" },
  robots: { index: true, follow: false },
};

/**
 * Rechtstext – wörtlich vom bisherigen Webauftritt übernommen (Stand Oktober 2025).
 * Inhaltliche Änderungen bitte nur durch den Verein bzw. nach rechtlicher Prüfung.
 */
export default function Datenschutz() {
  return (
    <section className="shell-narrow pt-32 pb-8 sm:pt-36 lg:pt-40">
      <p className="eyebrow">Rechtliches</p>
      <h1 className="mt-5 text-h1 text-ink">Datenschutzerklärung</h1>

      <div className="prose-gam mt-12">
        <h2>1. Verantwortliche Stelle</h2>
        <p>Verantwortlich für die Datenverarbeitung auf dieser Webseite ist:</p>
        <p>
          <strong>{verein.name}</strong>
          <br />
          {verein.anschrift.strasse}
          <br />
          {verein.anschrift.plz} {verein.anschrift.ort}
          <br />
          E-Mail: <a href={`mailto:${verein.email}`}>{verein.email}</a>
        </p>
        <p>
          Der Verein Glücksbringer am Meer e.V. ist Verantwortlicher im Sinne
          der Datenschutz-Grundverordnung (DSGVO).
        </p>

        <h2>2. Grundsätzliche Hinweise zur Datenverarbeitung</h2>
        <p>
          Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen.
          Wir behandeln Ihre personenbezogenen Daten vertraulich und
          entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser
          Datenschutzerklärung.
        </p>
        <p>
          Die Nutzung unserer Webseite ist grundsätzlich ohne Angabe
          personenbezogener Daten möglich. Soweit auf unseren Seiten
          personenbezogene Daten (z. B. Name, Anschrift oder E-Mail-Adresse)
          erhoben werden, erfolgt dies stets auf freiwilliger Basis.
        </p>

        <h2>
          3. Erhebung und Speicherung personenbezogener Daten sowie Art und
          Zweck der Verwendung
        </h2>
        <p>
          Wir erheben personenbezogene Daten, wenn Sie uns diese im Rahmen einer
          Anfrage, einer Mitgliedschaft oder einer Spende freiwillig mitteilen.
        </p>
        <p>Dies kann insbesondere in folgenden Fällen geschehen:</p>
        <p>
          <strong>Kontaktaufnahme per E-Mail oder Formular:</strong>
          <br />
          Ihre Angaben (z. B. Name, E-Mail-Adresse, Telefonnummer, Anliegen)
          werden zur Bearbeitung Ihrer Anfrage gespeichert.
        </p>
        <p>
          <strong>Spenden / Unterstützung:</strong>
          <br />
          Wenn Sie uns eine Spende zukommen lassen, verarbeiten wir die von
          Ihnen angegebenen Daten ausschließlich zur Abwicklung der Spende und
          zur Ausstellung einer Spendenbescheinigung.
        </p>
        <p>
          Eine Weitergabe Ihrer Daten an Dritte erfolgt nicht, es sei denn, dies
          ist gesetzlich vorgeschrieben oder für die Erfüllung des Vereinszwecks
          zwingend erforderlich.
        </p>

        <h2>4. Server-Logfiles</h2>
        <p>
          Beim Aufruf unserer Webseite werden automatisch Informationen durch
          den Provider erhoben und in sogenannten Server-Logfiles gespeichert.
        </p>
        <p>Diese Daten umfassen u. a.:</p>
        <ul>
          <li>Browsertyp und -version</li>
          <li>verwendetes Betriebssystem</li>
          <li>Referrer-URL</li>
          <li>Hostname des zugreifenden Rechners</li>
          <li>Uhrzeit der Serveranfrage</li>
          <li>IP-Adresse</li>
        </ul>
        <p>
          Diese Daten sind nicht bestimmten Personen zuordenbar und dienen
          ausschließlich der Sicherstellung eines störungsfreien Betriebs und
          zur Verbesserung unseres Angebots.
        </p>

        <h2>5. Verwendung von Cookies</h2>
        <p>
          Unsere Webseite verwendet teilweise sogenannte Cookies. Cookies sind
          kleine Textdateien, die auf Ihrem Endgerät gespeichert werden und die
          Nutzung der Webseite erleichtern.
        </p>
        <p>
          Sie können Ihren Browser so einstellen, dass Sie über das Setzen von
          Cookies informiert werden oder Cookies nur im Einzelfall erlauben. Bei
          der Deaktivierung von Cookies kann die Funktionalität dieser Webseite
          eingeschränkt sein.
        </p>

        <h2>6. Links zu externen Webseiten</h2>
        <p>
          Unsere Webseite kann Links zu externen Seiten enthalten, auf deren
          Inhalte wir keinen Einfluss haben.
        </p>
        <p>
          Für die Inhalte und den Datenschutz dieser externen Seiten übernehmen
          wir keine Verantwortung.
        </p>
        <p>
          Für die Verarbeitung personenbezogener Daten auf diesen Seiten ist
          stets der jeweilige Anbieter verantwortlich.
        </p>

        <h2>7. Ihre Rechte</h2>
        <p>Sie haben jederzeit das Recht auf:</p>
        <ul>
          <li>
            <strong>Auskunft</strong> über Ihre bei uns gespeicherten
            personenbezogenen Daten (Art. 15 DSGVO)
          </li>
          <li>
            <strong>Berichtigung</strong> unrichtiger oder unvollständiger Daten
            (Art. 16 DSGVO)
          </li>
          <li>
            <strong>Löschung</strong> Ihrer Daten (Art. 17 DSGVO)
          </li>
          <li>
            <strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)
          </li>
          <li>
            <strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21 DSGVO)
          </li>
          <li>
            <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)
          </li>
        </ul>
        <p>
          Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich
          jederzeit an uns wenden:
        </p>
        <p>
          📧 E-Mail:{" "}
          <a href="mailto:kontakt@gluecksbringer-am-meer.de">
            kontakt@gluecksbringer-am-meer.de
          </a>
        </p>

        <h2>8. SSL- bzw. TLS-Verschlüsselung</h2>
        <p>
          Diese Seite nutzt aus Sicherheitsgründen und zum Schutz vertraulicher
          Inhalte eine SSL- bzw. TLS-Verschlüsselung.
        </p>
        <p>
          Eine verschlüsselte Verbindung erkennen Sie an dem Schloss-Symbol in
          Ihrer Browserzeile und an der Adresszeile, die mit „https://“ beginnt.
        </p>

        <h2>9. Aktualität und Änderung dieser Datenschutzerklärung</h2>
        <p>
          Diese Datenschutzerklärung ist aktuell gültig und hat den Stand
          Oktober 2025.
        </p>
        <p>
          Wir behalten uns vor, diese Erklärung bei Änderungen an unserer
          Webseite oder bei neuen rechtlichen Vorgaben anzupassen.
        </p>

        <p className="!mt-12 border-t border-sand-200 pt-8 text-sm text-ink-50">
          Stand: Oktober 2025
          <br />© {verein.name}
        </p>
      </div>
    </section>
  );
}
