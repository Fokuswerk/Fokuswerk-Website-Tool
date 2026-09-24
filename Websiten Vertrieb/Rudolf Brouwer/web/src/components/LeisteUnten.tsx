"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { betrieb } from "@/daten/betrieb";

/** Feste Leiste am unteren Rand, nur mobil. Höchstens zwei Aktionen —
 *  im Karrierebereich wechselt die rechte Aktion auf Bewerbung. */
export default function LeisteUnten() {
  const pfad = usePathname();
  const karriere = pfad.startsWith("/karriere");

  return (
    <div className="leiste-unten">
      <a href={`tel:${betrieb.telefonRoh}`}>
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
          <path d="M3.2 1.3a1.3 1.3 0 0 1 1.8.2l1.5 2a1.3 1.3 0 0 1-.1 1.7l-.8.8a8.6 8.6 0 0 0 3.4 3.4l.8-.8a1.3 1.3 0 0 1 1.7-.1l2 1.5a1.3 1.3 0 0 1 .2 1.8l-1 1.3c-.5.6-1.3.8-2 .5A14.3 14.3 0 0 1 1.4 4.5c-.3-.7-.1-1.5.5-2l1.3-1.2Z" />
        </svg>
        Anrufen
      </a>
      {karriere ? (
        <Link href="/karriere#bewerben">Bewerben</Link>
      ) : (
        <Link href="/kontakt#anfrage">Projekt anfragen</Link>
      )}
    </div>
  );
}
