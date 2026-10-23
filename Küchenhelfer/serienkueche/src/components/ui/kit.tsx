"use client";

import { type ReactNode, useEffect, useState } from "react";

/* Kleines eigenes Baukastenset statt einer Komponentenbibliothek:
   der Standardlook verbreiteter Kits ist genau die Anmutung, die hier
   vermieden werden soll. */

export function Seitenkopf({
  titel,
  kontext,
  aktionen,
  hinweis,
}: {
  titel: string;
  kontext?: ReactNode;
  aktionen?: ReactNode;
  hinweis?: ReactNode;
}) {
  return (
    <header className="border-b border-line bg-paper">
      <div className="px-6 pt-5 pb-4 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[19px] font-semibold tracking-[-0.015em] text-ink">{titel}</h1>
            {kontext && <div className="mt-1 text-[12.5px] text-ink-2">{kontext}</div>}
          </div>
          {aktionen && <div className="flex shrink-0 flex-wrap items-center gap-2">{aktionen}</div>}
        </div>
        {hinweis && <div className="mt-3">{hinweis}</div>}
      </div>
    </header>
  );
}

export function Inhalt({ children, breit }: { children: ReactNode; breit?: boolean }) {
  return (
    <div className={`px-6 py-6 lg:px-8 ${breit ? "" : "max-w-[1400px]"}`}>{children}</div>
  );
}

export function Abschnitt({
  titel,
  aktion,
  children,
}: {
  titel: string;
  aktion?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-7 first:mt-0">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">{titel}</h2>
        {aktion}
      </div>
      {children}
    </section>
  );
}

export function Flaeche({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-md border border-line bg-paper ${className}`}>{children}</div>
  );
}

type Ton = "ok" | "flag" | "mute" | "accent" | "good";

const TON: Record<Ton, string> = {
  ok: "bg-accent-soft text-accent",
  accent: "bg-accent text-white",
  flag: "bg-flag-soft text-flag",
  good: "bg-good-soft text-good",
  mute: "bg-line-2 text-ink-3",
};

export function Marke({ ton = "mute", children }: { ton?: Ton; children: ReactNode }) {
  return (
    <span className={`num inline-block whitespace-nowrap rounded-xs px-1.5 py-[1px] text-[11px] ${TON[ton]}`}>
      {children}
    </span>
  );
}

export function Knopf({
  children,
  onClick,
  art = "still",
  gross,
  deaktiviert,
  titel,
  typ = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  art?: "primaer" | "still" | "klar";
  gross?: boolean;
  deaktiviert?: boolean;
  titel?: string;
  typ?: "button" | "submit";
}) {
  const basis = `inline-flex items-center gap-1.5 rounded-sm font-medium transition-colors ${
    gross ? "px-3.5 py-2 text-[13px]" : "px-2.5 py-1.5 text-[12.5px]"
  }`;
  const stil = deaktiviert
    ? "cursor-not-allowed border border-line bg-line-2 text-ink-3"
    : art === "primaer"
      ? "bg-ink text-paper hover:bg-[#2b3038]"
      : art === "klar"
        ? "text-ink-2 hover:bg-ground"
        : "border border-line bg-paper text-ink-2 hover:border-ink-3 hover:text-ink";
  return (
    <button type={typ} title={titel} onClick={deaktiviert ? undefined : onClick} disabled={deaktiviert} className={`${basis} ${stil}`}>
      {children}
    </button>
  );
}

export function Zahlenreihe({
  werte,
}: {
  werte: Array<{ label: string; wert: ReactNode; zusatz?: ReactNode; ton?: "flag" }>;
}) {
  return (
    <div className="grid grid-cols-2 border-y border-line sm:grid-cols-3 xl:grid-cols-5">
      {werte.map((w, i) => (
        <div key={w.label} className={`px-4 py-3.5 ${i === 0 ? "" : "border-l border-line-2"} ${i >= 2 ? "border-t border-line-2 sm:border-t-0" : ""}`}>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">{w.label}</div>
          <div className={`num mt-1 text-[22px] leading-none tracking-[-0.02em] ${w.ton === "flag" ? "text-flag" : "text-ink"}`}>
            {w.wert}
          </div>
          {w.zusatz && <div className="mt-1.5 text-[11.5px] text-ink-3">{w.zusatz}</div>}
        </div>
      ))}
    </div>
  );
}

export function Tabelle({ children, dicht }: { children: ReactNode; dicht?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse ${dicht ? "text-[12.5px]" : "text-[13px]"}`}>{children}</table>
    </div>
  );
}

export function Th({ children, rechts, breite }: { children?: ReactNode; rechts?: boolean; breite?: string }) {
  return (
    <th
      style={breite ? { width: breite } : undefined}
      className={`whitespace-nowrap border-b border-line px-3 py-2.5 text-[10.5px] font-medium uppercase tracking-[0.05em] text-ink-3 ${rechts ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  rechts,
  num,
  stumm,
}: {
  children?: ReactNode;
  rechts?: boolean;
  num?: boolean;
  stumm?: boolean;
}) {
  return (
    <td
      className={`border-b border-line-2 px-3 py-2 align-baseline ${rechts ? "text-right" : ""} ${num ? "num whitespace-nowrap" : ""} ${stumm ? "text-ink-3" : ""}`}
    >
      {children}
    </td>
  );
}

export function Hinweisband({
  art = "flag",
  titel,
  children,
}: {
  art?: "flag" | "ruhig";
  titel: string;
  children: ReactNode;
}) {
  const stil =
    art === "flag"
      ? "border-flag/40 bg-flag-soft"
      : "border-line bg-ground";
  return (
    <div className={`rounded-md border px-4 py-3 ${stil}`}>
      <div className={`text-[10.5px] font-semibold uppercase tracking-[0.06em] ${art === "flag" ? "text-flag" : "text-ink-3"}`}>
        {titel}
      </div>
      <div className="mt-1 text-[12.5px] leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

export function Leer({ titel, children }: { titel: string; children?: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-line px-6 py-10 text-center">
      <div className="text-[13px] font-medium text-ink-2">{titel}</div>
      {children && <div className="mx-auto mt-1.5 max-w-[46ch] text-[12.5px] text-ink-3">{children}</div>}
    </div>
  );
}

/* Einfache Toastleiste. */
let melder: ((t: string) => void) | null = null;
export function melde(text: string) {
  melder?.(text);
}

export function Toasts() {
  const [liste, setListe] = useState<Array<{ id: number; text: string }>>([]);
  useEffect(() => {
    melder = (text: string) => {
      const id = Date.now() + Math.random();
      setListe((l) => [...l, { id, text }]);
      setTimeout(() => setListe((l) => l.filter((x) => x.id !== id)), 3600);
    };
    return () => {
      melder = null;
    };
  }, []);
  if (liste.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {liste.map((t) => (
        <div key={t.id} className="rise rounded-md border border-line bg-paper px-3.5 py-2.5 text-[12.5px] text-ink shadow-[0_6px_20px_rgba(27,30,35,0.08)]">
          {t.text}
        </div>
      ))}
    </div>
  );
}

export function Bestaetigung({
  offen,
  titel,
  text,
  bestaetigen,
  abbrechen,
  knopf = "Bestätigen",
}: {
  offen: boolean;
  titel: string;
  text: ReactNode;
  bestaetigen: () => void;
  abbrechen: () => void;
  knopf?: string;
}) {
  if (!offen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 px-4" role="dialog" aria-modal="true">
      <div className="rise w-full max-w-[460px] rounded-md border border-line bg-paper p-5 shadow-[0_18px_50px_rgba(27,30,35,0.16)]">
        <h3 className="text-[15px] font-semibold text-ink">{titel}</h3>
        <div className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{text}</div>
        <div className="mt-5 flex justify-end gap-2">
          <Knopf onClick={abbrechen}>Abbrechen</Knopf>
          <Knopf art="primaer" onClick={bestaetigen}>{knopf}</Knopf>
        </div>
      </div>
    </div>
  );
}
