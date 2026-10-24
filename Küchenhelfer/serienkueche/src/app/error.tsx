"use client";

import Link from "next/link";

/**
 * Was ein Besucher sieht, wenn etwas abstürzt.
 *
 * Vorher stand dort Nexts englische Standardseite. Der Fehler selbst gehört
 * nicht auf den Bildschirm — wohl aber ein Weg zurück und die Zusicherung,
 * dass die Planung im Browser nicht verloren ist.
 */
export default function Fehler({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="warm flex min-h-screen items-center justify-center px-5">
      <div className="max-w-[52ch] text-center">
        <div className="vorzeile">Etwas ist schiefgegangen</div>
        <h1 className="gross mt-3 text-[32px] font-bold text-kohle sm:text-[40px]">
          Das hat hier nicht funktioniert.
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-kohle-2">
          Ein Fehler im Werkzeug, nicht an deiner Eingabe. Deine Planung liegt weiter in deinem
          Browser — meistens hilft schon ein neuer Versuch.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center rounded-full bg-gradient-to-b from-[#3b382f] to-kohle px-6 py-3 text-[15.5px] font-semibold text-creme"
          >
            Nochmal versuchen
          </button>
          <Link href="/" className="text-[15px] text-kohle-2 underline underline-offset-2 hover:text-kohle">
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
