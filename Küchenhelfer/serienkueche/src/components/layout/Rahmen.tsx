"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Seitenleiste } from "./Seitenleiste";
import { Toasts, useOverlay } from "@/components/ui/kit";

export function Rahmen({ children }: { children: ReactNode }) {
  const [offen, setOffen] = useState(false);
  const schublade = useOverlay(offen, () => setOffen(false));
  const pfad = usePathname();
  // Der Weg fuer eine einzelne Kueche laeuft ohne Profi-Navigation.
  const profi = pfad.startsWith("/dashboard") || pfad.startsWith("/projects");

  if (!profi) {
    return (
      <>
        {children}
        <Toasts />
      </>
    );
  }

  return (
    <div className="druckraster min-h-full lg:grid lg:grid-cols-[246px_minmax(0,1fr)]">
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-ink focus:px-3 focus:py-2 focus:text-[13px] focus:font-medium focus:text-paper"
      >
        Zum Inhalt springen
      </a>
      {/* Leiste auf grossen Schirmen */}
      <div className="nur-bildschirm sticky top-0 hidden h-screen lg:block">
        <Seitenleiste />
      </div>

      {/* Leiste als Schublade auf Tablet und Handy.
          Der Streifen bleibt oben stehen — vorher scrollte er weg und das
          Menue war nur noch ganz am Seitenanfang erreichbar. */}
      <div className="nur-bildschirm sticky top-0 z-30 lg:hidden">
        <div className="flex items-center gap-2 border-b border-line bg-paper/85 px-3 py-2 backdrop-blur-xl backdrop-saturate-150">
          <button
            onClick={() => setOffen(true)}
            aria-label="Navigation öffnen"
            aria-expanded={offen}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-ink-2 hover:bg-ground"
          >
            <Menu size={18} strokeWidth={1.6} />
          </button>
          <span className="text-[14px] font-semibold tracking-[-0.01em]">Serienküche</span>
          <span className="num ml-auto rounded-xs bg-flag-soft px-1.5 py-[1px] text-[10.5px] text-flag">
            Prototyp
          </span>
        </div>
        {offen && (
          <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-label="Navigation">
            <div className="absolute inset-0 bg-ink/25" onClick={() => setOffen(false)} />
            <div ref={schublade} className="rise relative h-full w-[272px] max-w-[84vw]">
              <Seitenleiste schliessen={() => setOffen(false)} />
              <button
                onClick={() => setOffen(false)}
                aria-label="Navigation schließen"
                className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-sm text-ink-3 hover:bg-ground"
              >
                <X size={16} strokeWidth={1.6} />
              </button>
            </div>
          </div>
        )}
      </div>

      <main id="inhalt" className="min-w-0">{children}</main>
      <Toasts />
    </div>
  );
}
