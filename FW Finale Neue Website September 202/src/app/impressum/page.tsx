import type { Metadata } from 'next';
import Rechtstext from '@/components/seite/Rechtstext';
import { marke } from '@/lib/inhalt';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Angaben gemäß § 5 DDG für Fokuswerk GbR, Oldenburg.',
  alternates: { canonical: '/impressum' },
  robots: { index: false, follow: true },
};

export default function Impressum() {
  return (
    <Rechtstext titel="Impressum" stand="September 2026">
      <div>
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          {marke.firma} — eine Gesellschaft bürgerlichen Rechts (Abt &amp; Bodenstab GbR)<br />
          vertreten durch: {marke.vertreter}<br />
          {marke.strasse}<br />
          {marke.plz} {marke.ort}<br />
          Deutschland
        </p>
      </div>

      <div>
        <h2>Kontakt</h2>
        <p>
          Telefon: <a href={`tel:${marke.telefon}`}>{marke.telefonText}</a><br />
          E-Mail: <a href={`mailto:${marke.mail}`}>{marke.mail}</a>
        </p>
      </div>

      <div>
        <h2>Umsatzsteuer-Identifikationsnummer</h2>
        <p>Gemäß § 27a Umsatzsteuergesetz: {marke.ustId}</p>
      </div>

      <div>
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>{marke.vertreter}<br />{marke.strasse}<br />{marke.plz} {marke.ort}</p>
      </div>

      <div>
        <h2>Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf
          diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10
          DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
          gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
          forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>
        <p>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen
          nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche
          Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
          Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
          Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
        </p>
      </div>

      <div>
        <h2>Haftung für Links</h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte
          wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch
          keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der
          jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Bei Bekanntwerden
          von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
        </p>
      </div>

      <div>
        <h2>Urheberrecht</h2>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
          unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
          Verbreitung und jede Art der Verwertung außerhalb der Grenzen des
          Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors
          bzw. Erstellers.
        </p>
      </div>
    </Rechtstext>
  );
}
