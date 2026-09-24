import type { Metadata } from "next";
import Link from "next/link";
import SeitenKopf from "@/components/SeitenKopf";
import Niveau from "@/components/Niveau";
import Auftritt from "@/components/Auftritt";
import Bild from "@/components/Bild";
import { leistungen } from "@/daten/leistungen";
import { partner, betrieb } from "@/daten/betrieb";

export const metadata: Metadata = {
  title: "Leistungen — Bad, Heizung, Energie, Pool und Kundendienst",
  description:
    "Badsanierung, Heizungsmodernisierung, Solarwärme, Schwimmbadtechnik und Kundendienst aus einem Haus in Wardenburg. Was Brouwer übernimmt und wie die Zusammenarbeit abläuft.",
  alternates: { canonical: "/leistungen" },
};

export default function LeistungenSeite() {
  return (
    <>
      <SeitenKopf
        marke="Leistungen"
        titel="Fünf Aufgaben, die dieser Betrieb übernimmt."
        anriss="Geschnitten nach dem, was ansteht — nicht nach den Gewerken, in denen ein Handwerksbetrieb intern denkt. Zu jeder Aufgabe gehört, wer sie koordiniert und was danach passiert."
        krumen={[{ name: "Leistungen", weg: "/leistungen" }]}
      />

      <section className="takt-oben">
        <div className="bahn">
          <ul className="uebersicht">
            {leistungen.map((l, i) => (
              <Auftritt as="li" key={l.weg} verzug={i * 70}>
                <Link href={l.weg} className="uebersicht-punkt">
                  <span className="uebersicht-bild">
                    <Bild datei={l.bild} alt={l.alt} verhaeltnis="4 / 3" sizes="(max-width: 767px) 92vw, 30vw" />
                  </span>
                  <span className="uebersicht-nr kennziffer">{String(i + 1).padStart(2, "0")}</span>
                  <span className="marke marke-akzent">{l.marke}</span>
                  <span className="uebersicht-titel">{l.titel}</span>
                  <span className="still uebersicht-anriss">{l.anriss}</span>
                  <span className="pfeil uebersicht-pfeil">
                    Ansehen
                    <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true"><path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" /></svg>
                  </span>
                </Link>
              </Auftritt>
            ))}
          </ul>
        </div>
      </section>

      <section className="takt">
        <div className="bahn">
          <Niveau marke="Womit wir arbeiten" ziffer="Hersteller und Partnerbetriebe" />
          <div className="partner-raster">
            <div className="partner-text">
              <h2 className="satz-eng">Marken, die im Haus stehen — und Betriebe, mit denen seit Jahren gebaut wird.</h2>
              <p className="still satz partner-blei">
                Die Liste stammt aus dem laufenden Betrieb, nicht aus einer Werbevereinbarung.
                Ein Fliesenfachgeschäft ist darunter, weil bei einer Badsanierung jemand die
                Fliesen legen muss.
              </p>
            </div>
            <ul className="partner-liste">
              {partner.map((p) => (
                <li key={p.name}>
                  <Bild datei={p.bild} alt={`Logo ${p.name}`} verhaeltnis="16 / 9" sizes="150px" klasse="partner-bild" />
                  <span className="partner-name">{p.name}</span>
                  <span className="still partner-rolle">{p.rolle}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="kapitel-abschluss auf-dunkel">
        <div className="bahn">
          <div className="abschluss-raster">
            <div>
              <h2 className="abschluss-titel">Unklar, was Ihr Vorhaben braucht?</h2>
              <p className="still satz abschluss-blei">
                Ein Anruf sortiert das schneller als jede Leistungsseite. Oder Sie kommen in die
                Ausstellung — nach Terminabsprache, dann hat jemand Zeit.
              </p>
            </div>
            <div className="abschluss-aktionen">
              <a href={`tel:${betrieb.telefonRoh}`} className="abschluss-nummer">{betrieb.telefon}</a>
              <p className="marke abschluss-zeiten">Mo–Do 8.30–12.30 · 14.00–17.00 Uhr <span className="abschluss-trenn">·</span> Fr 8.30–12.30 Uhr</p>
              <Link href="/kontakt#anfrage" className="knopf abschluss-knopf">Projekt anfragen</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
