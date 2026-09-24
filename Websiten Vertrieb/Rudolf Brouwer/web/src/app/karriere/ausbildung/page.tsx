import type { Metadata } from "next";
import Link from "next/link";
import SeitenKopf from "@/components/SeitenKopf";
import Niveau from "@/components/Niveau";
import Auftritt from "@/components/Auftritt";
import Bild from "@/components/Bild";
import Bewerbungsformular from "@/components/Bewerbungsformular";
import { ausbildungFragen, stellen } from "@/daten/stellen";
import { betrieb, basisUrl } from "@/daten/betrieb";

export const metadata: Metadata = {
  title: "Ausbildung Anlagenmechaniker SHK in Wardenburg",
  description:
    "Ausbildung zum Anlagenmechaniker für Sanitär-, Heizungs- und Klimatechnik bei der Rudolf Brouwer GmbH in Wardenburg. Praktikum vorab möglich, Chance auf Übernahme nach dem Abschluss.",
  alternates: { canonical: "/karriere/ausbildung" },
};

const azubi = stellen.find((s) => s.art === "Ausbildung")!;

const anzeige = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: azubi.titel,
  description: `${azubi.anriss} Aufgaben: ${azubi.aufgaben.join("; ")}.`,
  employmentType: "INTERN",
  hiringOrganization: { "@type": "Organization", name: betrieb.name, sameAs: basisUrl },
  jobLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      streetAddress: betrieb.strasse,
      postalCode: betrieb.plz,
      addressLocality: betrieb.ort,
      addressCountry: betrieb.land,
    },
  },
  directApply: true,
};

export default function AusbildungSeite() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(anzeige) }} />

      <SeitenKopf
        marke="Ausbildung"
        titel="Ein Beruf, bei dem man abends sieht, was man morgens angefangen hat."
        anriss="Anlagenmechaniker für Sanitär-, Heizungs- und Klimatechnik. Sie bauen Heizungen ein, installieren Bäder und schließen Schwimmbadtechnik an — bei Leuten zu Hause, nicht in einer Halle."
        krumen={[{ name: "Karriere", weg: "/karriere" }, { name: "Ausbildung", weg: "/karriere/ausbildung" }]}
      />

      {/* Das Praktikum zuerst — die niedrigste Hürde */}
      <section className="takt-oben">
        <div className="bahn">
          <div className="praktikum">
            <div className="praktikum-text">
              <p className="marke marke-akzent">Der einfachste Anfang</p>
              <h2 className="praktikum-titel">Machen Sie erst ein Praktikum.</h2>
              <p className="still satz praktikum-blei">
                Brouwer bietet ausdrücklich an, vorab ein Praktikum im Haus zu machen — damit Sie
                einen Einblick in den Beruf bekommen, bevor Sie sich für drei Jahre entscheiden.
                Dafür braucht es keine Bewerbungsmappe, nur einen Anruf.
              </p>
            </div>
            <div className="praktikum-aktion">
              <a href={`tel:${betrieb.telefonRoh}`} className="praktikum-nummer">{betrieb.telefon}</a>
              <a href="#bewerben" className="knopf">Praktikum anfragen</a>
            </div>
          </div>
        </div>
      </section>

      {/* Fragen, die Jugendliche wirklich stellen */}
      <section className="takt">
        <div className="bahn">
          <Niveau marke="Was Sie wissen wollen" ziffer="Fünf Fragen" />
          <div className="azubi-raster">
            <ol className="azubi-fragen">
              {ausbildungFragen.map((f, i) => (
                <Auftritt as="li" key={f.frage} verzug={i * 50}>
                  <span className="kennziffer azubi-nr">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="azubi-frage">{f.frage}</h3>
                  <p className="still azubi-antwort">{f.antwort}</p>
                </Auftritt>
              ))}
            </ol>
            <div className="azubi-seite">
              <Auftritt>
                <Bild datei="rohre.webp" alt="Kupferrohre, Fittings und eine Rohrzange auf einer technischen Zeichnung" verhaeltnis="4 / 5" sizes="(max-width: 899px) 60vw, 26vw" />
              </Auftritt>
              <div className="azubi-kasten">
                <p className="marke">Danach</p>
                <p className="azubi-kasten-text">
                  „Wir bieten dir die Chance auf Übernahme nach erfolgreichem Abschluss der
                  Ausbildung."
                </p>
                <p className="still azubi-quelle">Aus dem Stellenangebot des Betriebs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Was Sie mitbringen */}
      <section className="takt kapitel-eigen">
        <div className="bahn">
          <Niveau marke="Was Sie mitbringen" ziffer="Kurze Liste" />
          <div className="mit-raster">
            <h2 className="satz-eng">Mehr steht da nicht.</h2>
            <ul className="liste-strich mit-liste">
              {azubi.profil.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
          <p className="still mit-hinweis">
            Wann die nächste Ausbildung beginnt, klären Sie am besten im Telefonat.
            {/* TODO: vom Kunden bestätigen — der auf der alten Website genannte Ausbildungsbeginn
                (01.08.2026) ist verstrichen. Nächsten Starttermin erfragen und hier einsetzen. */}
          </p>
        </div>
      </section>

      {/* Bewerben */}
      <section className="takt" id="bewerben">
        <div className="bahn">
          <Niveau marke="Bewerben" ziffer="Drei Angaben genügen" />
          <div className="bewerben-raster">
            <div className="bewerben-text">
              <h2>Kein Anschreiben nötig.</h2>
              <p className="still satz bewerben-blei">
                Name, eine Nummer oder E-Mail, worum es geht — das reicht für den ersten Kontakt.
                Alles Weitere besprechen Sie persönlich.
              </p>
              <div className="bewerben-ruf">
                <p className="marke">Oder einfach anrufen</p>
                <a href={`tel:${betrieb.telefonRoh}`} className="bewerben-nummer">{betrieb.telefon}</a>
                <p className="still bewerben-zeiten">Mo–Do 8.30–12.30 und 14.00–17.00 Uhr · Fr 8.30–12.30 Uhr</p>
              </div>
              <Link href="/karriere" className="pfeil azubi-zurueck">
                Auch Stellen für Fachkräfte ansehen
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true"><path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" /></svg>
              </Link>
            </div>
            <div className="bewerben-form">
              <Bewerbungsformular />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
