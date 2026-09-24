import Link from "next/link";
import Image from "next/image";
import { betrieb } from "@/daten/betrieb";

/**
 * Der Hero ist eine Bühne, genau einen Bildschirm hoch.
 *
 * Aufbau von oben nach unten:
 *   dunkle Markenfläche → Aussage → zwei Aktionen → das Wasserband →
 *   der Projekt-Einstieg.
 *
 * Das Wasserband ist zugleich das Motiv der ganzen Seite: die Linie zwischen
 * Wärme und Wasser. Es läuft randlos durch, bleibt aber ein Band — das
 * Bildmaterial des Betriebs endet bei 1170 px, ein formatfüllendes Foto wäre
 * unscharf. Als schmaler Streifen bleibt es scharf und wird zum Motiv.
 */

const einstieg = [
  { weg: "/leistungen/badsanierung", name: "Bad", zusatz: "Planen, sanieren, koordinieren" },
  { weg: "/leistungen/heizung", name: "Heizung", zusatz: "Erneuern und auslegen" },
  { weg: "/leistungen/energie", name: "Energie", zusatz: "Wärme aus der Sonne" },
  { weg: "/leistungen/pool-wellness", name: "Pool", zusatz: "Becken und Technik" },
];

export default function Hero() {
  return (
    <section className="hero auf-dunkel" data-heroblende>
      {/* Aussage */}
      <div className="bahn hero-oben">
        <p className="hero-mikro sacht">
          Bad · Heizung · Energie · Pool
          <span className="hero-ort">Wardenburg</span>
        </p>

        <h1 className="hero-titel">
          <span className="zeile"><span style={{ "--verzug": "90ms" } as React.CSSProperties}>Wärme und Wasser.</span></span>
          <span className="zeile"><span style={{ "--verzug": "210ms" } as React.CSSProperties}>Seit 1962.</span></span>
        </h1>

        <div className="hero-fuss sacht" style={{ "--verzug": "430ms" } as React.CSSProperties}>
          <p className="hero-blei">
            Bad, Heizung, Energie und Schwimmbad aus einem Haus in {betrieb.ort}.
            Über 500 Quadratmeter eigene Ausstellung
            <span className="hero-blei-zwei"> — und ein Ansprechpartner für alle Gewerke</span>.
          </p>
          <div className="hero-knoepfe">
            <Link href="/kontakt#anfrage" className="knopf">Projekt anfragen</Link>
            <a href={`tel:${betrieb.telefonRoh}`} className="knopf knopf-still hero-ruf">
              <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
                <path d="M3.2 1.3a1.3 1.3 0 0 1 1.8.2l1.5 2a1.3 1.3 0 0 1-.1 1.7l-.8.8a8.6 8.6 0 0 0 3.4 3.4l.8-.8a1.3 1.3 0 0 1 1.7-.1l2 1.5a1.3 1.3 0 0 1 .2 1.8l-1 1.3c-.5.6-1.3.8-2 .5A14.3 14.3 0 0 1 1.4 4.5c-.3-.7-.1-1.5.5-2l1.3-1.2Z" />
              </svg>
              {betrieb.telefon}
            </a>
          </div>
        </div>
      </div>

      {/* Das Wasserband — randlos, mit der Niveaulinie als Oberkante */}
      <div className="hero-band">
        <Image
          src="/bilder/regendusche.webp"
          alt="Regendusche über dunklen Fliesen, fallendes Wasser"
          fill
          sizes="100vw"
          priority
          quality={86}
        />
      </div>

      {/* Projekt-Einstieg */}
      <div className="bahn hero-einstieg">
        <p className="marke hero-einstieg-marke">Was möchten Sie umsetzen?</p>
        <ul className="hero-wahl">
          {einstieg.map((e, i) => (
            <li key={e.weg} style={{ "--verzug": `${620 + i * 70}ms` } as React.CSSProperties}>
              <Link href={e.weg} className="hero-wahl-punkt sacht">
                <span className="hero-wahl-name">{e.name}</span>
                <span className="hero-wahl-zusatz">{e.zusatz}</span>
                <svg className="hero-wahl-pfeil" width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true">
                  <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
