"use client";

import { type ReactNode } from "react";
import { Minus, Plus } from "lucide-react";

/* Bausteine für den Weg der Privatkunden. Große Flächen, wenig Text,
   alles mit dem Daumen bedienbar. */

export function Fortschritt({ wert }: { wert: number }) {
  return (
    <div className="h-[2px] w-full overflow-hidden rounded-full bg-linie-warm">
      <div
        className="h-full rounded-full bg-kohle transition-[width] duration-500 ease-out"
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
  const basis = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors ${
    gross ? "px-7 py-3.5 text-[16px]" : "px-5 py-2.5 text-[14.5px]"
  }`;
  const stil = aus
    ? "cursor-not-allowed bg-creme-2 text-kohle-3"
    : art === "primaer"
      ? "bg-kohle text-creme hover:bg-[#312e25]"
      : art === "klar"
        ? "text-kohle-2 hover:text-kohle"
        : "border border-linie-stark bg-papier text-kohle hover:border-kohle";
  return (
    <button type="button" onClick={aus ? undefined : onClick} disabled={aus} className={`${basis} ${stil}`}>
      {children}
    </button>
  );
}

export function Karte({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[16px] bg-papier ${className}`}>{children}</div>;
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
            className={`warm-wahl rounded-[14px] border p-4 text-left ${
              aktiv
                ? "border-kohle bg-papier ring-1 ring-kohle"
                : "border-linie-warm bg-papier hover:border-linie-stark"
            }`}
          >
            {o.bild && <div className="mb-3">{o.bild}</div>}
            <div className="gross text-[16.5px] font-bold leading-tight text-kohle">{o.titel}</div>
            {o.satz && <div className="mt-1.5 text-[13.5px] leading-snug text-kohle-2">{o.satz}</div>}
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
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-linie-stark bg-papier text-kohle transition-colors hover:border-kohle active:scale-95"
        >
          <Minus size={20} strokeWidth={2} />
        </button>

        <div className="flex min-w-[196px] items-baseline justify-center gap-2">
          {/* Gegengewicht zur Einheit, damit die Zahl wirklich mittig steht. */}
          <span className="w-[30px] shrink-0" aria-hidden="true" />
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
            className="gross ziffern w-[136px] bg-transparent text-center text-[54px] font-bold leading-none tracking-[-0.04em] text-kohle outline-none [appearance:textfield] focus:text-kohle [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="w-[30px] shrink-0 text-left text-[17px] font-medium text-kohle-3">{einheit}</span>
        </div>

        <button
          type="button"
          onClick={() => setzeCm(cm + schritt)}
          aria-label="Größer"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-linie-stark bg-papier text-kohle transition-colors hover:border-kohle active:scale-95"
        >
          <Plus size={20} strokeWidth={2} />
        </button>
      </div>
      <div className="ziffern mt-2 text-center text-[13.5px] text-kohle-3">
        {(wert / 1000).toFixed(2).replace(".", ",")} Meter
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={5}
        value={cm}
        onChange={(e) => setzeCm(Number(e.target.value))}
        aria-label="Maß schieben"
        className="mt-7 w-full cursor-pointer"
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
        className="w-full cursor-pointer"
      />
      <div className="mt-3 flex justify-between text-[13px] text-kohle-3">
        <span>{links}</span>
        <span>{rechts}</span>
      </div>
    </div>
  );
}

export function Notiz({ children, ton = "ruhig" }: { children: ReactNode; ton?: "ruhig" | "achtung" }) {
  return (
    <div
      className={`rounded-[12px] border-l-2 py-2.5 pl-4 pr-3 text-[14px] leading-relaxed text-kohle-2 ${
        ton === "achtung" ? "border-kohle bg-creme-2/70" : "border-linie-stark bg-papier"
      }`}
    >
      {children}
    </div>
  );
}
