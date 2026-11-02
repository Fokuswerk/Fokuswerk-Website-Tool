"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Marke from "./Marke";

/** Sticky Kopfleiste, bekommt beim Scrollen eine Haarlinie. */
export default function Kopf() {
  const [fest, setFest] = useState(false);
  const pfad = usePathname();
  /**
   * Auf der Startseite fuehrt der Knopf in den 90-Sekunden-Schnellcheck, nicht
   * in den langen Rechner. Wer oben landet, soll nicht mit 65 Fragen anfangen.
   */
  const aufStart = pfad === "/";
  const ziel = aufStart ? "/#rechner" : "/check";

  useEffect(() => {
    const pruefen = () => setFest(window.scrollY > 12);
    pruefen();
    window.addEventListener("scroll", pruefen, { passive: true });
    return () => window.removeEventListener("scroll", pruefen);
  }, []);

  return (
    <header className={`kopf${fest ? " fest" : ""}`}>
      <div className="kopf-innen">
        <Marke />
        <nav className="kopf-nav">
          <Link href="/bescheid">Bescheid prüfen</Link>
          <Link href="/reform">Leistungen</Link>
          <Link href={ziel} className="haupt">
            <span className="lang">{aufStart ? "Pflegegrad schätzen" : "Pflegegrad rechnen"}</span>
            <span className="kurz">{aufStart ? "Schätzen" : "Rechnen"}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
