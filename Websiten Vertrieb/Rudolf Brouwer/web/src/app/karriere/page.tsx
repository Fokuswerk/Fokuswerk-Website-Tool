import type { Metadata } from "next";
import Link from "next/link";
import SeitenKopf from "@/components/SeitenKopf";
import Niveau from "@/components/Niveau";
import Auftritt from "@/components/Auftritt";
import Bild from "@/components/Bild";
import Bewerbungsformular from "@/components/Bewerbungsformular";
import { stellen, leistungenArbeitgeber } from "@/daten/stellen";
import { betrieb, basisUrl } from "@/daten/betrieb";

export const metadata: Metadata = {
  title: "Karriere — Anlagenmechaniker SHK und Kundendiensttechniker gesucht",
  description:
    "Offene Stellen bei der Rudolf Brouwer GmbH in Wardenburg: Anlagenmechaniker SHK und Kundendiensttechniker. Unbefristet, übertariflich, 30 Tage Urlaub, Freizeitausgleich und Firmenwagen zur Arbeit.",
  alternates: { canonical: "/karriere" },
};

const fach = stellen.filter((s) => s.art === "Fachkraft");

const anzeigen = fach.map((s) => ({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: s.titel,
  description: `${s.anriss} Aufgaben: ${s.aufgaben.join("; ")}. Profil: ${s.profil.join("; ")}.`,
  employmentType: "FULL_TIME",
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
  /* TODO: vom Kunden bestätigen — datePosted und validThrough, sobald bekannt.
     Ohne echtes Datum wird hier nichts behauptet. */
}));

const gruppen = ["Vertrag", "Geld", "Zeit", "Alltag", "Team", "Arbeit"] as const;

export default function KarriereSeite() {
  return (
    <>
      {anzeigen.map((a, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(a) }} />
      ))}

      <SeitenKopf
        marke="Karriere"
        titel="Ein Handwerksbetrieb, der ordentlich geführt wird."
        anriss="Unbefristeter Vertrag, übertarifliche Bezahlung, 30 Tage Urlaub, Freizeitausgleich für Überstunden — und mit dem Firmenwagen zur Arbeit. Kein Konzern, keine Matrix: Die Geschäftsführung sitzt im selben Haus."
        krumen={[{ name: "Karriere", weg: "/karriere" }]}
      />

      {/* Zwei Wege: Fachkraft oder Ausbildung */}
      <section className="takt-oben">
        <div className="bahn">
          <div className="wege">
            <div className="weg weg-an">
              <p className="marke marke-akzent">Sie sind gelernt</p>
              <h2 className="weg-titel">Fachkräfte</h2>
              <p className="still weg-text">
                Anlagenmechaniker SHK und Kundendiensttechniker. Berufseinsteiger sind
                ausdrücklich willkommen.
              </p>
              <a href="#stellen" className="pfeil">
                Zu den Stellen
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true"><path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" /></svg>
              </a>
            </div>
            <div className="weg">
              <p className="marke">Sie fangen an</p>
              <h2 className="weg-titel">Ausbildung</h2>
              <p className="still weg-text">
                Anlagenmechaniker für Sanitär-, Heizungs- und Klimatechnik. Vorher ist ein
                Praktikum möglich.
              </p>
              <Link href="/karriere/ausbildung" className="pfeil">
                Zur Ausbildung
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true"><path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Was geboten wird */}
      <section className="takt">
        <div className="bahn">
          <Niveau marke="Was geboten wird" ziffer="Zehn Punkte, wörtlich" />
          <div className="gaben-raster">
            <div>
              <h2 className="satz-eng">Nichts davon ist ausgedacht.</h2>
              <p className="still satz gaben-blei">
                Diese Liste steht so im Stellenangebot des Betriebs. Sie ist hier nur sortiert —
                nicht ergänzt.
              </p>
              <Auftritt className="gaben-bild">
                <Bild datei="team.webp" alt="Das Team der Rudolf Brouwer GmbH bei einer gemeinsamen Veranstaltung" verhaeltnis="4 / 3" sizes="(max-width: 899px) 92vw, 34vw" />
              </Auftritt>
            </div>
            <ul className="gaben">
              {gruppen.map((g) => {
                const punkte = leistungenArbeitgeber.filter((l) => l.art === g);
                if (!punkte.length) return null;
                return (
                  <li key={g} className="gabe-gruppe">
                    <span className="marke gabe-marke">{g}</span>
                    <ul className="gabe-punkte">
                      {punkte.map((p) => <li key={p.punkt}>{p.punkt}</li>)}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Stellen */}
      <section className="takt kapitel-eigen" id="stellen">
        <div className="bahn">
          <Niveau marke="Offene Stellen" ziffer={`0${fach.length} Positionen`} />
          <ul className="stellen">
            {fach.map((s, i) => (
              <Auftritt as="li" key={s.weg} verzug={i * 80} className="stelle">
                <div className="stelle-kopf">
                  <div>
                    <h3 className="stelle-titel">{s.titel}</h3>
                    <p className="marke stelle-art">{s.beschaeftigung}</p>
                  </div>
                  <a href="#bewerben" className="knopf stelle-knopf">Unkompliziert bewerben</a>
                </div>
                <p className="still satz stelle-anriss">{s.anriss}</p>
                <div className="stelle-spalten">
                  <div>
                    <p className="marke">Aufgaben</p>
                    <ul className="liste-strich stelle-liste">
                      {s.aufgaben.map((a) => <li key={a}>{a}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="marke">Ihr Profil</p>
                    <ul className="liste-strich stelle-liste">
                      {s.profil.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                  </div>
                </div>
              </Auftritt>
            ))}
          </ul>
        </div>
      </section>

      {/* Bewerbung — niedrige Hürde */}
      <section className="takt" id="bewerben">
        <div className="bahn">
          <Niveau marke="Bewerben" ziffer="Drei Angaben genügen" />
          <div className="bewerben-raster">
            <div className="bewerben-text">
              <h2>Erst einmal kennenlernen.</h2>
              <p className="still satz bewerben-blei">
                Für den ersten Kontakt braucht es keine Mappe. Name, eine Nummer oder E-Mail,
                die Stelle — den Rest klären zwei Sätze am Telefon. Ein Lebenslauf ist für das
                erste Gespräch nicht nötig; wenn Sie einen haben, bringen Sie ihn später mit.
              </p>
              <div className="bewerben-ruf">
                <p className="marke">Lieber direkt sprechen</p>
                <a href={`tel:${betrieb.telefonRoh}`} className="bewerben-nummer">{betrieb.telefon}</a>
                <p className="still bewerben-zeiten">
                  Mo–Do 8.30–12.30 und 14.00–17.00 Uhr · Fr 8.30–12.30 Uhr
                </p>
              </div>
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
