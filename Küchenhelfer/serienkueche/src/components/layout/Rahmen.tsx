"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Seitenleiste } from "./Seitenleiste";
import { Toasts } from "@/components/ui/kit";

export function Rahmen({ children }: { children: ReactNode }) {
  const [offen, setOffen] = useState(false);

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[246px_minmax(0,1fr)]">
      {/* Leiste auf grossen Schirmen */}
      <div className="sticky top-0 hidden h-screen lg:block">
        <Seitenleiste />
      </div>

      {/* Leiste als Schublade auf Tablet und Handy */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-paper px-4 py-2.5">
          <button
            onClick={() => setOffen(true)}
            aria-label="Navigation öffnen"
            className="rounded-sm p-1 text-ink-2 hover:bg-ground"
          >
            <Menu size={18} strokeWidth={1.6} />
          </button>
          <span className="text-[14px] font-semibold tracking-[-0.01em]">Serienküche</span>
          <span className="num ml-auto rounded-xs bg-flag-soft px-1.5 py-[1px] text-[10.5px] text-flag">
            Prototyp
          </span>
        </div>
        {offen && (
          <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-ink/25" onClick={() => setOffen(false)} />
            <div className="rise relative h-full w-[272px] max-w-[84vw]">
              <Seitenleiste schliessen={() => setOffen(false)} />
              <button
                onClick={() => setOffen(false)}
                aria-label="Navigation schließen"
                className="absolute right-2 top-2 rounded-sm p-1 text-ink-3 hover:bg-ground"
              >
                <X size={16} strokeWidth={1.6} />
              </button>
            </div>
          </div>
        )}
      </div>

      <main className="min-w-0">{children}</main>
      <Toasts />
    </div>
  );
}
