import Link from "next/link";
import Image from "next/image";
import { betrieb } from "@/daten/betrieb";

/**
 * Der Hero ist eine Bühne: ein vollflächiges Foto, darüber ein Overlay aus
 * dem Markenton, darauf helle Typografie. Genau einen Bildschirm hoch.
 *
 * Die Aussage sitzt unten links, der Projekt-Einstieg rechts daneben —
 * darüber bleibt das Bild frei.
 */

const einstieg = [
  { weg: "/leistungen/badsanierung", name: "Bad" },
  { weg: "/leistungen/heizung", name: "Heizung" },
  { weg: "/leistungen/energie", name: "Energie" },
  { weg: "/leistungen/pool-wellness", name: "Pool" },
];

export default function Hero() {
  return (
    <section className="hero auf-dunkel" data-heroblende>
      {/* Bild */}
      <div className="hero-bild">
        <Image
          src="/bilder/hero-wasser.webp"
          alt="Regendusche mit fallendem Wasser vor dunkel gefliester Wand"
          fill
          sizes="100vw"
          priority
          quality={82}
        />
      </div>
      <div className="hero-schleier" aria-hidden="true" />

      {/* Aussage */}
      <div className="bahn hero-inhalt">
        <div className="hero-satz">
          <p className="hero-mikro sacht">
            Bad · Heizung · Energie · Pool
            <span className="hero-ort">Wardenburg</span>
          </p>

          <h1 className="hero-titel">
            <span className="zeile"><span style={{ "--verzug": "90ms" } as React.CSSProperties}>Wärme und Wasser.</span></span>
            <span className="zeile"><span style={{ "--verzug": "210ms" } as React.CSSProperties}>Seit 1962.</span></span>
          </h1>

          <p className="hero-blei sacht" style={{ "--verzug": "430ms" } as React.CSSProperties}>
            Bad, Heizung, Energie und Schwimmbad aus einem Haus in {betrieb.ort}.
            Über 500 Quadratmeter eigene Ausstellung
            <span className="hero-blei-zwei"> — und ein Ansprechpartner für alle Gewerke</span>.
          </p>

          <div className="hero-knoepfe sacht" style={{ "--verzug": "530ms" } as React.CSSProperties}>
            <Link href="/kontakt#anfrage" className="knopf">Projekt anfragen</Link>
            <a href={`tel:${betrieb.telefonRoh}`} className="knopf knopf-still hero-ruf">
              <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
                <path d="M3.2 1.3a1.3 1.3 0 0 1 1.8.2l1.5 2a1.3 1.3 0 0 1-.1 1.7l-.8.8a8.6 8.6 0 0 0 3.4 3.4l.8-.8a1.3 1.3 0 0 1 1.7-.1l2 1.5a1.3 1.3 0 0 1 .2 1.8l-1 1.3c-.5.6-1.3.8-2 .5A14.3 14.3 0 0 1 1.4 4.5c-.3-.7-.1-1.5.5-2l1.3-1.2Z" />
              </svg>
              {betrieb.telefon}
            </a>
          </div>
        </div>

        {/* Projekt-Einstieg */}
        <div className="hero-einstieg sacht" style={{ "--verzug": "640ms" } as React.CSSProperties}>
          <p className="marke hero-einstieg-marke">Was möchten Sie umsetzen?</p>
          <ul className="hero-wahl">
            {einstieg.map((e) => (
              <li key={e.weg}>
                <Link href={e.weg} className="hero-wahl-punkt">
                  <span className="hero-wahl-name">{e.name}</span>
                  <svg className="hero-wahl-pfeil" width="15" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true">
                    <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Hinweis nach unten */}
      <div className="bahn hero-weiter">
        <a href="#belege" className="hero-weiter-punkt">
          <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true">
            <path d="M6 0v14M1 9l5 5 5-5" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          Was wir übernehmen
        </a>
      </div>
    </section>
  );
}
