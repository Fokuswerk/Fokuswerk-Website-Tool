import type { Metadata } from "next";
import { verein } from "@/content/verein";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Impressum und Anbieterkennzeichnung der Glücksbringer am Meer e.V.",
  alternates: { canonical: "/impressum" },
  robots: { index: true, follow: false },
};

/**
 * Anbieterkennzeichnung.
 *
 * Alle Angaben stammen aus den bisherigen Seiten "Kontakt" und "Datenschutz".
 * Ergänzungen (z. B. Telefonnummer oder weitere Vorstandsmitglieder) bitte
 * in `content/verein.ts` bzw. hier eintragen – es wurde nichts hinzugedichtet.
 */
export default function Impressum() {
  return (
    <section className="shell-narrow pt-32 pb-8 sm:pt-36 lg:pt-40">
      <p className="eyebrow">Rechtliches</p>
      <h1 className="mt-5 text-h1 text-ink">Impressum</h1>

      <div className="prose-gam mt-12">
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          <strong>{verein.name}</strong>
          <br />
          {verein.anschrift.strasse}
          <br />
          {verein.anschrift.plz} {verein.anschrift.ort}
          <br />
          {verein.anschrift.land}
        </p>

        <h2>Vertreten durch</h2>
        <p>{verein.vorsitzende} (1. Vorsitzende)</p>

        <h2>Kontakt</h2>
        <p>
          E-Mail: <a href={`mailto:${verein.email}`}>{verein.email}</a>
        </p>

        <h2>Registereintrag</h2>
        <p>
          Eintragung im Vereinsregister
          <br />
          Registergericht: {verein.registergericht}
          <br />
          Registernummer: {verein.registernummer}
        </p>

        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
          {verein.vorsitzende}
          <br />
          {verein.anschrift.strasse}
          <br />
          {verein.anschrift.plz} {verein.anschrift.ort}
        </p>

        <h2>Gestaltung und Umsetzung</h2>
        <p>
          Diese Website wurde dem Verein von der{" "}
          <a href="https://fokuswerk.de" target="_blank" rel="noopener">
            Fokuswerk GbR
          </a>{" "}
          gestaltet, umgesetzt und gespendet. Für sämtliche Inhalte ist allein
          der Verein Glücksbringer am Meer e.V. verantwortlich.
        </p>

        <h2>Bildnachweis</h2>
        <p>
          Die Fotos aus der Vereinsarbeit sowie die Zeichnung des Maskottchens
          „Puck“ stammen aus dem Archiv des Vereins Glücksbringer am Meer e.V.
        </p>
        <p>
          Die Aufnahme des Zwischenahner Meers auf der Startseite: „Abend am
          Zwischenahner Meer (2024)“ von JoachimKohler-HB, über Wikimedia
          Commons, lizenziert unter{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/deed.de"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY-SA 4.0
          </a>
          . Das Bild wurde für die Verwendung auf dieser Seite beschnitten.
        </p>

        <h2>Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach
          den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
          überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
          Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der
          Nutzung von Informationen nach den allgemeinen Gesetzen bleiben
          hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
          Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
          Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
          Inhalte umgehend entfernen.
        </p>

        <h2>Haftung für Links</h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
          fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
          verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
          Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
          Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige
          Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Bei
          Bekanntwerden von Rechtsverletzungen werden wir derartige Links
          umgehend entfernen.
        </p>

        <h2>Urheberrecht</h2>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
          Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
          Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
          Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
          jeweiligen Autors bzw. Erstellers.
        </p>

        <p className="!mt-12 border-t border-sand-200 pt-8 text-sm text-ink-50">
          Hinweise zum Umgang mit personenbezogenen Daten finden Sie in unserer{" "}
          <a href="/datenschutz">Datenschutzerklärung</a>.
        </p>
      </div>
    </section>
  );
}
