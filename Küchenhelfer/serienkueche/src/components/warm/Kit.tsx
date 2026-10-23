"use client";

import { type ReactNode } from "react";
import { Minus, Plus } from "lucide-react";

/* Bausteine für den Weg der Privatkunden. Große Flächen, wenig Text,
   alles mit dem Daumen bedienbar. */

export function Fortschritt({ wert }: { wert: number }) {
  return (
    <div className="h-[5px] w-full overflow-hidden rounded-full bg-creme-2">
      <div
        className="h-full rounded-full bg-butter transition-[width] duration-500 ease-out"
        style={{ width: `${Math.round(wert * 100)}%` }}
      />
    </div>
  );
}

export function WKnopf({
  children,
  onClick,
  art = "still",
  gross,
  aus,
}: {
  children: ReactNode;
  onClick?: () => void;
  art?: "primaer" | "still" | "klar";
  gross?: boolean;
  aus?: boolean;
}) {
  const basis = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all ${
    gross ? "px-7 py-3.5 text-[16px]" : "px-5 py-2.5 text-[14.5px]"
  }`;
  const stil = aus
    ? "cursor-not-allowed bg-creme-2 text-kohle-3"
    : art === "primaer"
      ? "bg-kohle text-creme hover:bg-[#2a2819] active:scale-[0.98]"
      : art === "klar"
        ? "text-kohle-2 hover:bg-creme-2"
        : "border border-linie-warm bg-papier text-kohle hover:border-kohle-3 active:scale-[0.98]";
  return (
    <button type="button" onClick={aus ? undefined : onClick} disabled={aus} className={`${basis} ${stil}`}>
      {children}
    </button>
  );
}

export function Karte({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[22px] bg-papier ${className}`}>{children}</div>;
}

export function GrosseWahl<T extends string | number>({
  wert,
  setze,
  optionen,
  spalten = 2,
}: {
  wert: T | null;
  setze: (v: T) => void;
  optionen: Array<{ id: T; titel: string; satz?: string; bild?: ReactNode }>;
  spalten?: 2 | 3 | 4;
}) {
  const grid = spalten === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : spalten === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid gap-3 ${grid}`}>
      {optionen.map((o) => {
        const aktiv = o.id === wert;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => setze(o.id)}
            aria-pressed={aktiv}
            className={`warm-wahl rounded-[20px] border-2 p-4 text-left ${
              aktiv
                ? "border-kohle bg-papier shadow-[0_8px_26px_rgba(23,22,15,0.09)]"
                : "border-transparent bg-papier shadow-[0_2px_10px_rgba(23,22,15,0.04)] hover:shadow-[0_8px_22px_rgba(23,22,15,0.07)]"
            }`}
          >
            {o.bild && <div className="mb-3">{o.bild}</div>}
            <div className="text-[16px] font-semibold leading-tight text-kohle">{o.titel}</div>
            {o.satz && <div className="mt-1 text-[13.5px] leading-snug text-kohle-2">{o.satz}</div>}
          </button>
        );
      })}
    </div>
  );
}

/** Zahl mit großen Tasten — auf dem Sofa tippt niemand gern Zahlen. */
export function GrosseZahl({
  wert,
  setze,
  min,
  max,
  schritt = 10,
  einheit = "cm",
}: {
  wert: number;
  setze: (mm: number) => void;
  min: number;
  max: number;
  schritt?: number;
  einheit?: string;
}) {
  const cm = Math.round(wert / 10);
  const setzeCm = (c: number) => setze(Math.round(Math.min(max, Math.max(min, c)) * 10));
  return (
    <div>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setzeCm(cm - schritt)}
          aria-label="Kleiner"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-linie-warm bg-papier text-kohle transition-colors hover:border-kohle-3 active:scale-95"
        >
          <Minus size={22} strokeWidth={2.2} />
        </button>

        <div className="flex min-w-[180px] items-baseline justify-center gap-2">
          <input
            type="number"
            value={cm}
            min={min}
            max={max}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v)) setzeCm(v);
            }}
            aria-label={`Maß in ${einheit}`}
            className="gross w-[150px] bg-transparent text-center text-[52px] font-bold leading-none text-kohle outline-none [appearance:textfield] focus:text-kohle [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-[19px] font-semibold text-kohle-3">{einheit}</span>
        </div>

        <button
          type="button"
          onClick={() => setzeCm(cm + schritt)}
          aria-label="Größer"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-linie-warm bg-papier text-kohle transition-colors hover:border-kohle-3 active:scale-95"
        >
          <Plus size={22} strokeWidth={2.2} />
        </button>
      </div>
      <div className="mt-2 text-center text-[14px] text-kohle-3">
        das sind {(wert / 1000).toFixed(2).replace(".", ",")} Meter
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={5}
        value={cm}
        onChange={(e) => setzeCm(Number(e.target.value))}
        aria-label="Maß schieben"
        className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-creme-2"
      />
    </div>
  );
}

/** Position auf einer Wand, mit sprechender Rückmeldung statt Millimetern. */
export function Schieber({
  wert,
  setze,
  max,
  links,
  rechts,
}: {
  wert: number;
  setze: (mm: number) => void;
  max: number;
  links: string;
  rechts: string;
}) {
  return (
    <div>
      <input
        type="range"
        min={0}
        max={Math.max(10, max)}
        step={50}
        value={Math.min(wert, max)}
        onChange={(e) => setze(Number(e.target.value))}
        aria-label="Stelle an der Wand"
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-creme-2"
      />
      <div className="mt-2 flex justify-between text-[13px] text-kohle-3">
        <span>{links}</span>
        <span>{rechts}</span>
      </div>
    </div>
  );
}

export function Notiz({ children, ton = "ruhig" }: { children: ReactNode; ton?: "ruhig" | "achtung" }) {
  return (
    <div
      className={`rounded-[18px] px-4 py-3 text-[14px] leading-relaxed ${
        ton === "achtung" ? "bg-butter-soft text-kohle-2" : "bg-papier text-kohle-2"
      }`}
    >
      {children}
    </div>
  );
}
