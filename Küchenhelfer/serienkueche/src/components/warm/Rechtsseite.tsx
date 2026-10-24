import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Rahmen für die Rechtsseiten.
 *
 * Bewusst schlicht und ohne Bilder: hier liest jemand nach, er wird nicht
 * umworben. Die Platzhalter sind sichtbar markiert, damit niemand die Seite
 * für vollständig hält, solange die Angaben des Betreibers fehlen.
 */
export function Rechtsseite({
  titel,
  vor,
  children,
}: {
  titel: string;
  vor?: string;
  children: ReactNode;
}) {
  return (
    <div className="warm min-h-full">
      <header className="border-b border-linie-warm">
        <div className="mx-auto flex h-[64px] max-w-[760px] items-center gap-4 px-5 sm:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 17 17" aria-hidden="true">
              <rect x="0.75" y="0.75" width="15.5" height="15.5" rx="3" fill="none" strokeWidth="1.4" className="stroke-kohle" />
              <path d="M0.75 5.6 H16.25" strokeWidth="1.4" className="stroke-kohle-3" />
            </svg>
            <span className="gross text-[15px] font-bold text-kohle">Serienküche</span>
          </Link>
          <Link href="/" className="ml-auto text-[13.5px] text-kohle-2 hover:text-kohle">
            Zurück zur Startseite
          </Link>
        </div>
      </header>

      <main id="inhalt" className="mx-auto max-w-[760px] px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        {vor && <div className="vorzeile">{vor}</div>}
        <h1 className="gross mt-3 text-[34px] font-bold text-kohle sm:text-[44px]">{titel}</h1>
        <div className="rechtstext mt-8">{children}</div>
      </main>
    </div>
  );
}

/** Eine Angabe, die der Betreiber noch einsetzen muss. */
export function Platzhalter({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded-[4px] bg-butter-soft px-1.5 py-0.5 text-kohle-2">
      [{children}]
    </mark>
  );
}
