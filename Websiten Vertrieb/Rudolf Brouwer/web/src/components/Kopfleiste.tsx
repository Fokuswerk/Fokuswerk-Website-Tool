"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { betrieb } from "@/daten/betrieb";
import { leistungen } from "@/daten/leistungen";

const haupt = [
  { weg: "/leistungen", name: "Leistungen", untermenue: true },
  { weg: "/ausstellung", name: "Ausstellung" },
  { weg: "/unternehmen", name: "Unternehmen" },
  { weg: "/karriere", name: "Karriere" },
  { weg: "/kontakt", name: "Kontakt" },
];

export default function Kopfleiste() {
  const pfad = usePathname();
  const [gescrollt, setGescrollt] = useState(false);
  const [menue, setMenue] = useState(false);        // mobiles Vollbildmenü
  const [klappe, setKlappe] = useState(false);      // Leistungen-Panel (Desktop)
  const zeitgeber = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const lauf = () => setGescrollt(window.scrollY > 8);
    lauf();
    window.addEventListener("scroll", lauf, { passive: true });
    return () => window.removeEventListener("scroll", lauf);
  }, []);

  useEffect(() => { setMenue(false); setKlappe(false); }, [pfad]);

  useEffect(() => {
    document.body.style.overflow = menue ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menue]);

  useEffect(() => {
    const zu = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenue(false); setKlappe(false); } };
    window.addEventListener("keydown", zu);
    return () => window.removeEventListener("keydown", zu);
  }, []);

  const aktiv = (weg: string) => pfad === weg || pfad.startsWith(weg + "/");

  const oeffne = () => { if (zeitgeber.current) clearTimeout(zeitgeber.current); setKlappe(true); };
  const schliesse = () => { zeitgeber.current = setTimeout(() => setKlappe(false), 120); };

  return (
    <>
      <a className="sprung" href="#inhalt">Zum Inhalt springen</a>

      <header className="kopf" data-eng={gescrollt ? "ja" : "nein"}>
        {/* Nebenleiste: Anschrift links, Notdienst und Rufnummer rechts */}
        <div className="kopf-neben">
          <div className="bahn kopf-neben-inhalt">
            <span className="still">{betrieb.strasse} · {betrieb.plz} {betrieb.ort}</span>
            <span className="kopf-neben-rechts">
              <Link href="/leistungen/kundendienst#notdienst" className="kopf-notdienst">
                <span className="kopf-punkt" aria-hidden="true" />
                Heizungsnotdienst rund um die Uhr
              </Link>
              <a href={`tel:${betrieb.telefonRoh}`} className="kopf-ruf">{betrieb.telefon}</a>
            </span>
          </div>
        </div>

        {/* Hauptleiste */}
        <div className="kopf-haupt">
          <div className="bahn kopf-haupt-inhalt">
            <Link href="/" className="kopf-marke" aria-label={`${betrieb.name} — zur Startseite`}>
              <Image src="/bilder/logo.png" alt="" width={300} height={121} priority />
            </Link>

            <nav className="kopf-nav" aria-label="Hauptnavigation">
              {haupt.map((p) =>
                p.untermenue ? (
                  <div key={p.weg} className="kopf-klappe" onMouseEnter={oeffne} onMouseLeave={schliesse}>
                    <Link
                      href={p.weg}
                      className="kopf-link"
                      data-an={aktiv(p.weg) ? "ja" : "nein"}
                      aria-expanded={klappe}
                      onFocus={oeffne}
                    >
                      {p.name}
                      <svg className="kopf-pfeil" width="9" height="6" viewBox="0 0 9 6" aria-hidden="true">
                        <path d="M1 1l3.5 3.5L8 1" fill="none" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                    </Link>
                  </div>
                ) : (
                  <Link key={p.weg} href={p.weg} className="kopf-link" data-an={aktiv(p.weg) ? "ja" : "nein"}>
                    {p.name}
                  </Link>
                )
              )}
              <Link href="/kontakt#anfrage" className="knopf kopf-knopf">Projekt anfragen</Link>
            </nav>

            <button
              className="kopf-schalter"
              onClick={() => setMenue((v) => !v)}
              aria-expanded={menue}
              aria-label={menue ? "Menü schließen" : "Menü öffnen"}
            >
              <span data-auf={menue ? "ja" : "nein"} />
              <span data-auf={menue ? "ja" : "nein"} />
            </button>
          </div>
        </div>

        {/* Leistungen-Panel, Desktop */}
        <div
          className="kopf-panel"
          data-auf={klappe ? "ja" : "nein"}
          onMouseEnter={oeffne}
          onMouseLeave={schliesse}
          aria-hidden={!klappe}
        >
          <div className="bahn kopf-panel-inhalt">
            {leistungen.map((l, i) => (
              <Link
                key={l.weg}
                href={l.weg}
                className="kopf-panel-punkt"
                style={{ "--verzug": `${i * 45}ms` } as React.CSSProperties}
                tabIndex={klappe ? 0 : -1}
              >
                <span className="marke">{l.marke}</span>
                <span className="kopf-panel-titel">{l.titel}</span>
                <span className="kopf-panel-gewerk still">{l.gewerk}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Mobiles Vollbildmenü */}
      <div className="menue" data-auf={menue ? "ja" : "nein"} aria-hidden={!menue}>
        <nav className="bahn menue-inhalt" aria-label="Hauptnavigation, mobil">
          <p className="marke">Leistungen</p>
          <ul className="menue-liste">
            {leistungen.map((l) => (
              <li key={l.weg}>
                <Link href={l.weg} tabIndex={menue ? 0 : -1}>{l.titel}</Link>
              </li>
            ))}
          </ul>
          <p className="marke menue-marke-zwei">Betrieb</p>
          <ul className="menue-liste">
            {haupt.filter((p) => !p.untermenue).map((p) => (
              <li key={p.weg}><Link href={p.weg} tabIndex={menue ? 0 : -1}>{p.name}</Link></li>
            ))}
            <li><Link href="/karriere/ausbildung" tabIndex={menue ? 0 : -1}>Ausbildung</Link></li>
          </ul>
          <div className="menue-fuss">
            <a href={`tel:${betrieb.telefonRoh}`} className="menue-ruf" tabIndex={menue ? 0 : -1}>{betrieb.telefon}</a>
            <span className="still">{betrieb.strasse} · {betrieb.plz} {betrieb.ort}</span>
          </div>
        </nav>
      </div>
    </>
  );
}
