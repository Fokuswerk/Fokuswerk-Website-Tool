import type { Metadata } from "next";
import Link from "next/link";
import SeitenKopf from "@/components/SeitenKopf";
import Niveau from "@/components/Niveau";
import Auftritt from "@/components/Auftritt";
import Bild from "@/components/Bild";
import SolarSchema from "@/components/SolarSchema";
import { betrieb, basisUrl } from "@/daten/betrieb";

export const metadata: Metadata = {
  title: "Solarwärme und regenerative Energie in Wardenburg",
  description:
    "Solarthermie für Warmwasser und Heizungsunterstützung, geplant und eingebaut vom Meisterbetrieb in Wardenburg. Aufbau, Kollektorbauarten und Beratung zu Fördermöglichkeiten über BAFA und KfW.",
  alternates: { canonical: "/leistungen/energie" },
};

const dienst = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Solarthermie",
  serviceType: "Solarwärme, regenerative Wärmeerzeugung, Förderberatung",
  provider: { "@id": `${basisUrl}/#betrieb` },
  areaServed: { "@type": "Place", name: "Wardenburg" },
  description:
    "Planung und Einbau solarthermischer Anlagen zur Warmwasserbereitung und Heizungsunterstützung einschließlich Beratung zu Fördermöglichkeiten.",
};

export default function EnergieSeite() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dienst) }} />

      <SeitenKopf
        marke="Energie"
        titel="Wärme aus der Sonne — und wo sie wirklich hilft."
        anriss="Solarthermie erzeugt keinen Strom, sondern Wärme: für das Brauchwasser und zur Unterstützung der Heizung. Das macht sie unspektakulär und rechenbar. Wir sagen Ihnen, was Ihr Dach hergibt und welche Kollektorbauart dazu passt."
        krumen={[{ name: "Leistungen", weg: "/leistungen" }, { name: "Energie", weg: "/leistungen/energie" }]}
      />

      {/* Das Schema */}
      <section className="takt">
        <div className="bahn">
          <Niveau marke="Wie es funktioniert" ziffer="Aufbau der Anlage" />
          <h2 className="satz-eng schema-kopf">Drei Bauteile, ein Kreislauf.</h2>
          <SolarSchema />
        </div>
      </section>

      {/* Erst der Unterschied, dann die Bauart */}
      <section className="takt kapitel-eigen">
        <div className="bahn">
          <Niveau marke="Zwei Verwechslungen" ziffer="Wärme oder Strom" />
          <div className="energie-raster">
            <Auftritt>
              <h3 className="energie-titel">Solarthermie ist nicht Photovoltaik.</h3>
              <p className="still energie-text">
                Photovoltaik erzeugt Strom. Solarthermie wandelt Sonnenenergie in Wärme um — für
                Warmwasser und zur Heizungsunterstützung. Beide Anlagenarten werden gefördert,
                aber über verschiedene Wege: Solarthermie unter anderem über das BAFA und die
                KfW. Brouwer baut die Wärmeseite.
              </p>
            </Auftritt>
            <Auftritt verzug={80}>
              <h3 className="energie-titel">Flachkollektor oder Röhre.</h3>
              <p className="still energie-text">
                In der Solartechnik werden zwei Bauarten unterschieden: Flachkollektoren und
                Vakuum-Röhrenkollektoren. Sie unterscheiden sich vor allem in Preis und
                Wirkungsgrad. Welche sich für Ihr Dach rechnet, hängt von Fläche, Neigung und
                Ausrichtung ab.
              </p>
            </Auftritt>
            <Auftritt className="energie-bild" verzug={160}>
              <Bild datei="solardach.webp" alt="Wohnhaus mit Solarkollektoren auf dem Dach" verhaeltnis="4 / 5" sizes="(max-width: 899px) 45vw, 22vw" />
            </Auftritt>
          </div>
        </div>
      </section>

      {/* Förderung, ohne Zahlen zu erfinden */}
      <section className="takt">
        <div className="bahn">
          <Niveau marke="Förderung" ziffer="Was wir dazu sagen — und was nicht" />
          <div className="foerder-raster">
            <h2 className="satz-eng">Wir nennen Ihnen die Wege. Keine Prozentzahl auf einer Website.</h2>
            <div className="foerder-text">
              <p className="still satz">
                Für solarthermische Anlagen gibt es Zuschüsse, Bonuszahlungen und zinsgünstige
                Darlehen — unter anderem über das Bundesamt für Wirtschaft und Ausfuhrkontrolle
                und die KfW-Bankengruppe. Welche Sätze für Ihr Vorhaben gelten, hängt vom
                Programm, vom Gebäude und vom Zeitpunkt des Antrags ab.
              </p>
              <p className="still satz foerder-zweit">
                Deshalb steht hier keine Zahl, die nächste Woche falsch wäre. Brouwer berät zu den
                Fördermöglichkeiten und bezieht sie in das Angebot ein — und stellt auf Wunsch
                die Förderanträge.
              </p>
              <Link href="/kontakt#anfrage" className="pfeil foerder-pfeil">
                Beratung zur Förderung anfragen
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true"><path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="kapitel-quer auf-dunkel">
        <div className="bahn">
          <div className="quer-raster">
            <div>
              <p className="marke">Gehört zusammen</p>
              <h2 className="quer-titel">Eine Solaranlage ist Teil der Heizung, nicht ihr Ersatz.</h2>
              <p className="still satz quer-blei">
                Der Solarspeicher hängt am Wärmeerzeuger. Wer beides plant, plant es zusammen —
                sonst arbeiten zwei Anlagen gegeneinander.
              </p>
              <div className="quer-knoepfe">
                <Link href="/leistungen/heizung" className="knopf">Heizung ansehen</Link>
                <a href={`tel:${betrieb.telefonRoh}`} className="knopf knopf-still">{betrieb.telefon}</a>
              </div>
            </div>
            <Auftritt className="quer-bild">
              <Bild datei="rohre.webp" alt="Kupferrohre, Fittings und eine Rohrzange auf einer technischen Zeichnung" verhaeltnis="3 / 2" sizes="(max-width: 899px) 92vw, 44vw" />
            </Auftritt>
          </div>
        </div>
      </section>
    </>
  );
}
