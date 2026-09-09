import type { Metadata } from 'next';
import Rechtstext from '@/components/seite/Rechtstext';
import { marke } from '@/lib/inhalt';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: 'Wie Fokuswerk mit personenbezogenen Daten auf dieser Website umgeht.',
  alternates: { canonical: '/datenschutz' },
  robots: { index: false, follow: true },
};

export default function Datenschutz() {
  return (
    <Rechtstext titel="Datenschutzerklärung" stand="September 2026">
      <div>
        <h2>Kurz vorweg</h2>
        <p>
          Diese Website setzt <strong>keine Cookies</strong>, bindet{' '}
          <strong>keine Analyse- oder Trackingdienste</strong> ein und lädt{' '}
          <strong>keine Skripte von Dritten</strong>. Schriften werden vom eigenen
          Server ausgeliefert. Deshalb gibt es hier kein Einwilligungsbanner — es
          gäbe nichts, worin eingewilligt werden müsste.
        </p>
      </div>

      <div>
        <h2>Verantwortlich</h2>
        <p>
          {marke.firma}<br />{marke.strasse}<br />{marke.plz} {marke.ort}<br />
          E-Mail: <a href={`mailto:${marke.mail}`}>{marke.mail}</a><br />
          Telefon: <a href={`tel:${marke.telefon}`}>{marke.telefonText}</a>
        </p>
      </div>

      <div>
        <h2>Aufruf der Website</h2>
        <p>
          Beim Aufruf erhebt unser Hostinganbieter technisch notwendige Zugriffsdaten
          (IP-Adresse, Zeitpunkt, aufgerufene Adresse, übertragene Datenmenge,
          Browsertyp und Betriebssystem). Diese Verarbeitung ist für den Betrieb und
          die Sicherheit der Website erforderlich; Rechtsgrundlage ist Art. 6 Abs. 1
          lit. f DSGVO. Die Daten werden nicht mit anderen Quellen zusammengeführt.
        </p>
        <h3>Auftragsverarbeiter Hosting</h3>
        <p>
          Die Website wird bei Vercel Inc. betrieben. Mit dem Anbieter besteht ein
          Vertrag zur Auftragsverarbeitung.
        </p>
      </div>

      <div>
        <h2>Kontaktaufnahme</h2>
        <p>
          Wenn Sie das Anfrageformular nutzen oder uns per E-Mail oder Telefon
          kontaktieren, verarbeiten wir die von Ihnen angegebenen Daten (Betrieb, Name,
          Telefonnummer, E-Mail-Adresse und Ihre Nachricht) ausschließlich zur
          Bearbeitung Ihrer Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
          bei vorvertraglichen Maßnahmen, sonst Art. 6 Abs. 1 lit. f DSGVO.
        </p>
        <p>
          Der Versand des Formulars erfolgt über den Dienstleister Resend
          (Plus Five Five, Inc.). Ihre Angaben werden gelöscht, sobald die Anfrage
          abschließend bearbeitet ist und keine gesetzlichen Aufbewahrungsfristen
          entgegenstehen.
        </p>
      </div>

      <div>
        <h2>Ihre Rechte</h2>
        <ul>
          <li>Auskunft über die zu Ihnen gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO)</li>
          <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
        </ul>
        <p>
          Zuständig ist die Landesbeauftragte für den Datenschutz Niedersachsen.
        </p>
      </div>

      <div>
        <h2>Änderungen</h2>
        <p>
          Sobald diese Website Analyse- oder Werbedienste einbindet, wird diese
          Erklärung um die entsprechenden Abschnitte ergänzt und ein
          Einwilligungsbanner vorgeschaltet.
        </p>
      </div>
    </Rechtstext>
  );
}
