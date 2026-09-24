import type { Metadata } from "next";
import Link from "next/link";
import SeitenKopf from "@/components/SeitenKopf";
import Niveau from "@/components/Niveau";
import Auftritt from "@/components/Auftritt";
import Bild from "@/components/Bild";
import FragenBlock from "@/components/FragenBlock";
import { waermeerzeuger } from "@/daten/leistungen";
import { betrieb, basisUrl } from "@/daten/betrieb";
import { faqHeizung } from "@/daten/faq";

export const metadata: Metadata = {
  title: "Heizung erneuern in Wardenburg — Modernisierung und Wartung",
  description:
    "Heizungsmodernisierung vom Meisterbetrieb in Wardenburg: Wärmebedarf nach Wärmeschutzverordnung berechnet, Anlage passend ausgelegt, Wartung und 24-Stunden-Notdienst aus demselben Haus.",
  alternates: { canonical: "/leistungen/heizung" },
};

const dienst = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Heizungsmodernisierung",
  serviceType: "Heizungsbau, Heizungsmodernisierung, Heizungswartung",
  provider: { "@id": `${basisUrl}/#betrieb` },
  areaServed: { "@type": "Place", name: "Wardenburg" },
  description:
    "Planung, Auslegung und Einbau von Wärmeerzeugern einschließlich Berechnung des Wärmebedarfs sowie Wartung und Störungsbeseitigung.",
};

const auszeichnet = [
  { titel: "Fachgerechte Beratung", text: "Bevor eine Technik vorgeschlagen wird, wird das Gebäude betrachtet." },
  { titel: "Planung und Projektierung", text: "Die Anlage wird bis ins Detail geplant, nicht nach Katalog zusammengestellt." },
  { titel: "Klare Preise und Terminzusagen", text: "Das Angebot nennt einen Preis und einen Termin — beides gilt." },
  { titel: "Qualifizierte Installation", text: "Ausführung unter Berücksichtigung der Sicherheitsvorschriften." },
  { titel: "Eigener Kundendienst", text: "Nach dem Einbau bleibt derselbe Betrieb zuständig." },
];

export default function HeizungSeite() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dienst) }} />

      <SeitenKopf
        marke="Heizung"
        titel="Erst rechnen. Dann die Technik wählen."
        anriss="Die meisten Fehler bei einer neuen Heizung entstehen nicht beim Einbau, sondern bei der Auslegung. Brouwer führt die nach Wärmeschutzverordnung vorgeschriebenen Berechnungen durch, damit die Leistung der Anlage dem tatsächlichen Wärmebedarf Ihres Gebäudes entspricht — eine zu groß gewählte Anlage kostet zwanzig Jahre lang Geld."
        krumen={[{ name: "Leistungen", weg: "/leistungen" }, { name: "Heizung", weg: "/leistungen/heizung" }]}
      />

      {/* Wärmeerzeuger — eine Tabelle, keine Kartenwand */}
      <section className="takt">
        <div className="bahn">
          <Niveau marke="Was in Frage kommt" ziffer="06 Systeme" />
          <div className="waerme-raster">
            <div className="waerme-text">
              <h2>Sechs Wege, ein Haus warm zu bekommen.</h2>
              <p className="still satz waerme-blei">
                Welcher davon zu Ihrem Gebäude passt, hängt an Dämmung, Heizflächen und den
                Vorlauftemperaturen, die das Haus braucht. Diese Übersicht ordnet ein — sie
                ersetzt die Berechnung nicht.
              </p>
              <Auftritt className="waerme-bild">
                <Bild datei="heizgeraet-neu.webp" alt="Modernes wandhängendes Heizgerät mit Bedienfeld" verhaeltnis="1 / 1" sizes="(max-width: 899px) 45vw, 22vw" />
              </Auftritt>
            </div>

            <ul className="waerme-liste">
              {waermeerzeuger.map((w, i) => (
                <Auftritt as="li" key={w.name} verzug={i * 50}>
                  <span className="kennziffer waerme-nr">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="waerme-name">{w.name}</h3>
                  <p className="still waerme-satz">{w.text}</p>
                </Auftritt>
              ))}
            </ul>
          </div>
          <p className="still waerme-fuss">
            Die genannten Systeme werden über Programme der KfW gefördert. Welche Sätze für Ihr
            Vorhaben gelten, hängt vom Programm und vom Zeitpunkt des Antrags ab — deshalb steht
            hier keine Prozentzahl. Brouwer bezieht die Förderung in das Angebot ein.
          </p>
        </div>
      </section>

      {/* Was den Betrieb auszeichnet */}
      <section className="takt kapitel-eigen">
        <div className="bahn">
          <Niveau marke="Wie gearbeitet wird" ziffer="Fünf Zusagen" />
          <div className="zusagen-raster">
            <h2 className="satz-eng">Was im Angebot steht, gilt.</h2>
            <ul className="liste-strich zusagen">
              {auszeichnet.map((a) => (
                <li key={a.titel}>
                  <span className="zusage-titel">{a.titel}</span>
                  <span className="still zusage-text">{a.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Störung und Wartung */}
      <section className="kapitel-quer auf-dunkel">
        <div className="bahn">
          <div className="quer-raster">
            <Auftritt className="quer-bild">
              <Bild datei="a-heizgeraet.webp" alt="Heizgerät und Heizkörper im Ausstellungsraum des Betriebs" verhaeltnis="3 / 2" sizes="(max-width: 899px) 92vw, 44vw" />
            </Auftritt>
            <div>
              <p className="marke">Danach</p>
              <h2 className="quer-titel">Die Anlage steht. Der Ansprechpartner bleibt.</h2>
              <p className="still satz quer-blei">
                Regelmäßige Wartung hält die Leistung und die Betriebsbereitschaft. Fällt trotzdem
                etwas aus, übernimmt der eigene Kundendienst Reparatur und Störungsbeseitigung —
                und am Wochenende der Notdienst rund um die Uhr.
              </p>
              <div className="quer-knoepfe">
                <Link href="/leistungen/kundendienst" className="knopf">Kundendienst und Notdienst</Link>
                <a href={`tel:${betrieb.telefonRoh}`} className="knopf knopf-still">{betrieb.telefon}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FragenBlock
        fragen={faqHeizung}
        titel="Die Fragen, die vor einem Heizungstausch kommen."
        ziffer="Technik, Förderung, Störung"
      />
    </>
  );
}
