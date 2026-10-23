"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ClipboardCheck,
  FileText,
  LayoutGrid,
  PencilRuler,
  Plug,
  Ruler,
  Settings,
  Shapes,
  Table2,
} from "lucide-react";
import { PROJEKT } from "@/data/projekt";
import { useDemo } from "@/store/demo";
import { Bestaetigung, melde } from "@/components/ui/kit";

const PUNKTE = [
  { href: "/dashboard", label: "Übersicht", icon: LayoutGrid },
  { href: "/projects/demo/documents", label: "Unterlagen", icon: FileText },
  { href: "/projects/demo/rooms", label: "Raumprüfung", icon: ClipboardCheck },
  { href: "/projects/demo/types", label: "Küchentypen", icon: Shapes },
  { href: "/projects/demo/planning", label: "Küchenplanung", icon: PencilRuler },
  { href: "/projects/demo/specifications", label: "Spezifikationen", icon: Table2 },
  { href: "/projects/demo/installations", label: "Installationsplanung", icon: Plug },
  { href: "/projects/demo/survey", label: "Aufmaß & Bestellung", icon: Ruler },
];

export function Seitenleiste({ schliessen }: { schliessen?: () => void }) {
  const pfad = usePathname();
  const zuruecksetzen = useDemo((s) => s.zuruecksetzen);
  const [frage, setFrage] = useState(false);

  return (
    <nav className="flex h-full flex-col border-r border-line bg-paper">
      <div className="px-4 pt-5 pb-4">
        <Link href="/dashboard" className="block" onClick={schliessen}>
          <div className="flex items-center gap-2">
            <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true">
              <rect x="0.75" y="0.75" width="15.5" height="15.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-ink" />
              <path d="M0.75 5.6 H16.25 M5.6 5.6 V16.25 M10.6 5.6 V16.25" stroke="currentColor" strokeWidth="1" className="text-accent" />
            </svg>
            <span className="text-[14.5px] font-semibold tracking-[-0.01em] text-ink">Serienküche</span>
          </div>
        </Link>
        <div className="mt-3.5 rounded-sm border border-line bg-ground px-2.5 py-2">
          <div className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">Projekt</div>
          <div className="mt-0.5 truncate text-[12.5px] font-medium text-ink">{PROJEKT.name}</div>
          <div className="num mt-0.5 text-[11px] text-ink-3">{PROJEKT.ort} · {PROJEKT.einheiten} WE</div>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto px-2.5 pb-3">
        {PUNKTE.map((p) => {
          const aktiv = pfad === p.href;
          const Icon = p.icon;
          return (
            <li key={p.href}>
              <Link
                href={p.href}
                onClick={schliessen}
                aria-current={aktiv ? "page" : undefined}
                className={`mb-[1px] flex items-center gap-2.5 rounded-sm px-2.5 py-[7px] text-[13px] transition-colors ${
                  aktiv ? "bg-accent-soft font-medium text-ink" : "text-ink-2 hover:bg-ground"
                }`}
              >
                <Icon size={15} strokeWidth={1.6} className={aktiv ? "text-accent" : "text-ink-3"} />
                <span className="truncate">{p.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-line-2 px-4 py-3.5">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11.5px]">
          <dt className="text-ink-3">Bauherr</dt>
          <dd className="truncate text-ink-2">{PROJEKT.bauherr}</dd>
          <dt className="text-ink-3">Architekt</dt>
          <dd className="truncate text-ink-2">Hestermann</dd>
          <dt className="text-ink-3">Stand</dt>
          <dd className="text-ink-2">{PROJEKT.status}</dd>
        </dl>
        <button
          onClick={() => setFrage(true)}
          className="mt-3 flex w-full items-center gap-2 rounded-sm px-1 py-1 text-[11.5px] text-ink-3 transition-colors hover:text-ink-2"
        >
          <Settings size={13} strokeWidth={1.6} />
          Demo-Stand zurücksetzen
        </button>
        <div className="mt-3 rounded-sm border border-flag/40 bg-flag-soft px-2.5 py-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-flag">Prototyp</div>
          <p className="mt-0.5 text-[11px] leading-snug text-ink-2">
            Alle Daten erfunden. Planung, Erkennung und Bestellung sind simuliert.
          </p>
        </div>
      </div>

      <Bestaetigung
        offen={frage}
        titel="Demo-Stand zurücksetzen"
        text="Alle Variantenwahlen, Bestätigungen, Aufmaßwerte, festgeschriebenen Spezifikationen und hochgeladenen Unterlagen gehen verloren. Der Ausgangszustand wird wiederhergestellt."
        knopf="Zurücksetzen"
        abbrechen={() => setFrage(false)}
        bestaetigen={() => {
          zuruecksetzen();
          setFrage(false);
          melde("Demo-Stand zurückgesetzt.");
        }}
      />
    </nav>
  );
}
