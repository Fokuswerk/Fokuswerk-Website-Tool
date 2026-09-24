import type { Metadata } from "next";
import Link from "next/link";
import SeitenKopf from "@/components/SeitenKopf";
import Niveau from "@/components/Niveau";
import Auftritt from "@/components/Auftritt";
import Bild from "@/components/Bild";
import { betrieb, basisUrl } from "@/daten/betrieb";

export const metadata: Metadata = {
  title: "Kundendienst und 24-Stunden-Heizungsnotdienst in Wardenburg",
  description:
    "Wartung, Reparatur und Störungsbeseitigung an Heizungsanlagen in Wardenburg. Bei einem Heizungsausfall außerhalb der Geschäftszeiten ist der Notdienst rund um die Uhr erreichbar.",
  alternates: { canonical: "/leistungen/kundendienst" },
};

const dienst = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Heizungskundendienst und Notdienst",
  serviceType: "Wartung, Reparatur, Störungsbeseitigung, Heizungsnotdienst",
  provider: { "@id": `${basisUrl}/#betrieb` },
  areaServed: { "@type": "Place", name: "Wardenburg" },
  hoursAvailable: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "00:00", closes: "23:59" },
  description:
    "Wartung und Instandhaltung von Heizungsanlagen sowie Reparatur und Störungsbeseitigung, mit einem Notdienst für Heizungsausfälle rund um die Uhr.",
};

const arbeiten = [
  { titel: "Wartung", text: "Regelmäßig geprüft bleibt eine Anlage betriebsbereit und bringt die Leistung, für die sie ausgelegt wurde. Die Wartung ist der Termin, bei dem Verschleiß auffällt, bevor er zum Ausfall wird." },
  { titel: "Reparatur", text: "Störungsbeseitigung an Heizungsanlagen. Der Kundendiensttechniker bringt die Anlage wieder in Betrieb — unabhängig davon, wer sie eingebaut hat." },
  { titel: "Einweisung", text: "Nach einer neuen Anlage gehört die Einweisung dazu: was die Regelung kann, welche Einstellung wofür steht und woran man erkennt, dass etwas nicht stimmt." },
];

export default function KundendienstSeite() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dienst) }} />

      <SeitenKopf
        marke="Kundendienst"
        titel="Nach dem Einbau bleibt dieselbe Nummer."
        anriss="Eine Heizung ist kein abgeschlossener Auftrag, sondern eine Anlage, die zwanzig Jahre laufen soll. Brouwer wartet, repariert und beseitigt Störungen — und zwar mit eigenen Leuten, nicht über eine Hotline."
        krumen={[{ name: "Leistungen", weg: "/leistungen" }, { name: "Kundendienst", weg: "/leistungen/kundendienst" }]}
      />

      {/* Notdienst — sichtbar, aber ohne die Marke in Warnrot zu ertränken */}
      <section className="takt-oben" id="notdienst">
        <div className="bahn">
          <div className="notdienst">
            <div className="notdienst-kopf">
              <span className="notdienst-punkt" aria-hidden="true" />
              <p className="marke marke-akzent">Heizungsnotdienst</p>
            </div>
            <div className="notdienst-raster">
              <h2 className="notdienst-titel">Heizung ausgefallen — und es ist Samstag.</h2>
              <div className="notdienst-rechts">
                <p className="still satz notdienst-text">
                  Für genau diesen Fall gibt es den 24-Stunden-Notdienst. Rufen Sie an, statt zu
                  schreiben: Bei einem Ausfall zählt die Stunde, nicht das Formular.
                </p>
                <a href={`tel:${betrieb.telefonRoh}`} className="notdienst-nummer">
                  {betrieb.telefon}
                </a>
                <p className="marke notdienst-hinweis">Rund um die Uhr für Heizungsausfälle</p>
                {/* TODO: vom Kunden bestätigen — läuft der Notdienst außerhalb der Geschäftszeiten
                    über dieselbe Rufnummer oder über eine eigene Bereitschaftsnummer? */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Was der Kundendienst macht */}
      <section className="takt">
        <div className="bahn">
          <Niveau marke="Im Alltag" ziffer="Drei Arten von Terminen" />
          <div className="dienst-raster">
            <ul className="liste-strich dienste">
              {arbeiten.map((a) => (
                <li key={a.titel}>
                  <h3 className="dienst-titel">{a.titel}</h3>
                  <p className="still dienst-text">{a.text}</p>
                </li>
              ))}
            </ul>
            <Auftritt className="dienst-bild">
              <Bild datei="kreuzgriff.webp" alt="Verchromter Kreuzgriff einer Armatur in Nahaufnahme" verhaeltnis="3 / 4" sizes="(max-width: 899px) 60vw, 30vw" />
            </Auftritt>
          </div>
        </div>
      </section>

      <section className="kapitel-quer auf-dunkel">
        <div className="bahn">
          <div className="quer-raster">
            <div>
              <p className="marke">Wenn es ohnehin ansteht</p>
              <h2 className="quer-titel">Eine Reparatur ist manchmal der Moment, den Austausch zu rechnen.</h2>
              <p className="still satz quer-blei">
                Wenn Reparaturen häufiger werden und Ersatzteile schwerer zu bekommen sind, lohnt
                die Frage, was ein neuer Wärmeerzeuger kostet — in Ruhe, nicht im Januar bei
                minus fünf Grad.
              </p>
              <div className="quer-knoepfe">
                <Link href="/leistungen/heizung" className="knopf">Heizung erneuern</Link>
                <Link href="/kontakt#anfrage" className="knopf knopf-still">Wartung anfragen</Link>
              </div>
            </div>
            <Auftritt className="quer-bild">
              <Bild datei="heizgeraet-neu.webp" alt="Modernes wandhängendes Heizgerät mit Bedienfeld" verhaeltnis="1 / 1" sizes="(max-width: 899px) 60vw, 26vw" klasse="quer-bild-eng" />
            </Auftritt>
          </div>
        </div>
      </section>
    </>
  );
}
