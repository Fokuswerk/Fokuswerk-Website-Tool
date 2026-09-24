import type { Metadata } from "next";
import { Sektion, Seitenkopf } from "@/components/Bausteine";
import Anlauf from "@/components/Anlauf";
import { betrieb } from "@/lib/daten";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung der Rudolf Brouwer GmbH, Wardenburg.",
  alternates: { canonical: "/impressum" },
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

export default function Impressum() {
  return (
    <>
      <Seitenkopf label="Rechtliches" titel="Impressum" />

      <Sektion>
        <div className="max-w-[80ch]">
          <Block titel="Anbieter">
            <address className="not-italic">
              {betrieb.name}
              <br />
              {betrieb.strasse}
              <br />
              {betrieb.plz} {betrieb.ort}
            </address>
            <p>
              Telefon: <a href={`tel:${betrieb.telefonRaw}`} className="text-tief hover:text-kupfer">{betrieb.telefon}</a>
              <br />
              Fax: {betrieb.fax}
              <br />
              E-Mail: <a href={`mailto:${betrieb.email}`} className="text-tief hover:text-kupfer">{betrieb.email}</a>
            </p>
          </Block>

          <Block titel="Vertretung und Registereintrag">
            <p>
              Geschäftsführer: {betrieb.geschaeftsfuehrer}
              <br />
              {betrieb.register}
              <br />
              Umsatzsteuer-Identifikationsnummer nach § 27 a UStG: {betrieb.ustId}
            </p>
          </Block>

          <Block titel="Verantwortlich für den Inhalt">
            <p>
              Wolfgang und Roelf Brouwer, Anschrift wie oben.
              {/* TODO: vom Kunden bestätigen — zuständige Handwerkskammer und Berufsbezeichnung für § 5 Abs. 1 Nr. 5 DDG ergänzen */}
            </p>
          </Block>

          <Block titel="Streitbeilegung">
            <p>
              Die {betrieb.name} beteiligt sich nicht an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle und ist dazu nicht verpflichtet.
            </p>
            <p>
              Streitigkeiten über einen geschlossenen Vertrag und dessen Ausführung können vor der
              Vermittlungsstelle der Handwerkskammer Oldenburg, Theaterwall 32, 26122 Oldenburg,
              Telefon 0441 232221, verhandelt werden.
            </p>
          </Block>

          <Block titel="Haftung für Inhalte und Links">
            <p>
              Für eigene Inhalte auf diesen Seiten sind wir nach den allgemeinen Gesetzen
              verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte
              fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
              rechtswidrige Tätigkeit hinweisen.
            </p>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Für diese Inhalte ist stets der jeweilige Anbieter verantwortlich. Zum
              Zeitpunkt der Verlinkung waren keine rechtswidrigen Inhalte erkennbar. Bei Bekanntwerden
              von Rechtsverletzungen entfernen wir solche Links umgehend.
            </p>
          </Block>

          <Block titel="Urheberrecht">
            <p>
              Die durch uns erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
              Urheberrecht. Vervielfältigung, Bearbeitung und Verbreitung außerhalb der Grenzen des
              Urheberrechts bedürfen unserer schriftlichen Zustimmung.
            </p>
          </Block>

          <Block titel="Bildnachweis">
            <p>
              Fotos der Ausstellung und des Betriebs: Gundolf Renze, Marketing &amp; Medien, Lohne.
              <br />
              Weitere Aufnahmen: Adobe Stock (© manfredxy), Fotolia (© Holger Luck), RivieraPool
              Fertigschwimmbad GmbH, Geeste.
              {/* TODO: vom Kunden bestätigen — Lizenznachweise für die übernommenen Motive prüfen */}
            </p>
          </Block>
        </div>
      </Sektion>
    </>
  );
}
