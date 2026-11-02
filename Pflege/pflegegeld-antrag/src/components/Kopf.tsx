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
   * in den langen Rechner. Wer oben landet, soll nicht mit 64 Fragen anfangen.
   *
   * Auf /check selbst zeigte der Knopf auf /check - ein Klick tat nichts. Wer
   * schon rechnet, hat als naechsten Schritt den Antrag, nicht den Rechner.
   */
  const aufStart = pfad === "/";
  const aufRechner = pfad === "/check";
  const ziel = aufStart ? "/#rechner" : aufRechner ? "/antrag" : "/check";

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
            <span className="lang">
              {aufStart ? "Pflegegrad schätzen" : aufRechner ? "Antrag stellen" : "Pflegegrad rechnen"}
            </span>
            <span className="kurz">
              {aufStart ? "Schätzen" : aufRechner ? "Antrag" : "Rechnen"}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
