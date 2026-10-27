"use client";

import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Minus, Plus } from "lucide-react";

/* Bausteine für den Weg der Privatkunden. Große Flächen, wenig Text,
   alles mit dem Daumen bedienbar. */

export function Fortschritt({ wert, text }: { wert: number; text?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(wert * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={text}
      aria-label="Fortschritt der Planung"
      className="vertieft h-[5px] w-full overflow-hidden rounded-full bg-linie-warm"
    >
      <div
        className="h-full rounded-full bg-gradient-to-b from-[#3a3730] to-kohle transition-[width] duration-500 ease-out"
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
  typ = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  art?: "primaer" | "still" | "klar";
  gross?: boolean;
  aus?: boolean;
  typ?: "button" | "submit";
}) {
  const basis = `inline-flex items-center justify-center gap-2 rounded-[3px] font-semibold transition-colors ${
    gross ? "px-7 py-3.5 text-[16px]" : "px-5 py-2.5 text-[14.5px]"
  }`;
  const stil = aus
    ? "cursor-not-allowed bg-creme-2 text-kohle-3"
    : art === "primaer"
      ? "bg-gradient-to-b from-[#3b382f] to-kohle text-creme shadow-[0_1px_2px_rgba(21,20,15,.2),0_10px_24px_-10px_rgba(21,20,15,.55),inset_0_1px_0_rgba(255,255,255,.14)] hover:from-[#474338] hover:to-[#211f18] active:translate-y-px"
      : art === "klar"
        ? "text-kohle-2 hover:text-kohle active:translate-y-px"
        : "flaeche text-kohle hover:border-kohle-3 active:translate-y-px";
  return (
    <button type={typ} onClick={aus ? undefined : onClick} disabled={aus} className={`${basis} ${stil}`}>
      {children}
    </button>
  );
}

export function Karte({
  children,
  className = "",
  ...rest
}: { children: ReactNode; className?: string } & Omit<ComponentPropsWithoutRef<"div">, "className" | "children">) {
  return <div className={`flaeche rounded-[3px] ${className}`} {...rest}>{children}</div>;
}

export function GrosseWahl<T extends string | number>({
  wert,
  setze,
  optionen,
  spalten = 2,
}: {
  wert: T | null;
  setze: (v: T) => void;
  optionen: Array<{ id: T; titel: string; satz?: string; zusatz?: ReactNode; bild?: ReactNode; ikone?: ReactNode }>;
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
            // Nochmal auf dieselbe Antwort tippen darf nichts ausloesen —
            // sonst springt eine sorgfaeltig gezogene Stelle auf Null zurueck.
            onClick={() => { if (!aktiv) setze(o.id); }}
            aria-pressed={aktiv}
            className={`warm-wahl flaeche rounded-[3px] p-4 text-left ${
              aktiv
                ? "flaeche-hoch !border-kohle ring-1 ring-kohle"
                : "hover:!border-linie-stark"
            }`}
          >
            {o.bild && <div className="vertieft mb-3.5 overflow-hidden rounded-[3px] bg-creme-2">{o.bild}</div>}
            {/* Ein blankes Symbol gehoert nicht in eine bildbreite graue
                Platte — das sah aus wie ein Bild, das nicht geladen hat. */}
            {o.ikone && (
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-[3px] border ${
                  aktiv ? "border-kohle bg-kohle text-creme" : "border-linie-stark bg-creme text-kohle-2"
                }`}
              >
                {o.ikone}
              </div>
            )}
            <div className="gross text-[16.5px] font-bold leading-tight text-kohle">{o.titel}</div>
            {o.satz && <div className="mt-1.5 text-[13.5px] leading-snug text-kohle-2">{o.satz}</div>}
            {o.zusatz && (
              <div className="mt-2.5 border-t border-linie-warm pt-2.5 text-[13px] font-semibold text-kohle">
                {o.zusatz}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Eine Reihe gleichrangiger Wahlknöpfe.
 *
 * Es gab zwei davon im Planer, und sie sahen verschieden aus: der Markenfilter
 * eine Reihe Knöpfe mit Haarlinie, der Ansichtswechsel eine Pille mit Schatten
 * darin. Die Pille war obendrein kaputt — runder Behälter, eckige Chips, also
 * stand der gewählte Chip oben links über den Rand hinaus. Und eine Pille gibt
 * es in diesem Entwurf gar nicht: ein Radius, 3 px.
 *
 * Jetzt eine Figur für beide: gewählt ist ausgefüllt, der Rest trägt eine
 * Haarlinie. 40 px hoch, damit der Daumen trifft.
 */
export function Wahlreihe<T extends string>({
  wert,
  setze,
  optionen,
  etikett,
  dunkel,
}: {
  wert: T;
  setze: (v: T) => void;
  optionen: Array<{ id: T; titel: string; zusatz?: ReactNode }>;
  etikett: string;
  /** Steht die Reihe auf dem dunklen Abschnittsgrund? Dann kehrt sie sich um:
      die gewählte Fläche ist hell, die anderen tragen eine helle Haarlinie. */
  dunkel?: boolean;
}) {
  return (
    <div role="group" aria-label={etikett} className="flex flex-wrap items-center gap-2">
      {optionen.map((o) => {
        const aktiv = o.id === wert;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => { if (!aktiv) setze(o.id); }}
            aria-pressed={aktiv}
            className={`druck flex h-10 items-center gap-2 rounded-[3px] px-4 text-[13.5px] font-semibold ${
              dunkel
                ? aktiv
                  ? "bg-creme text-kohle"
                  : "border border-creme/25 text-creme/80 hover:border-creme/55 hover:text-creme"
                : aktiv
                  ? "bg-kohle text-creme"
                  : "flaeche text-kohle-2 hover:!border-kohle-3 hover:text-kohle"
            }`}
          >
            {o.titel}
            {o.zusatz}
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
  /**
   * Beim Tippen darf nicht nach jeder Ziffer geklemmt werden.
   *
   * Vorher wurde aus der ersten getippten "3" sofort der Mindestwert 120,
   * die naechste Ziffer haengte sich daran, und das Feld lief in den
   * Hoechstwert. Deshalb ein eigener Entwurfszustand, der erst beim
   * Verlassen oder mit der Eingabetaste geklemmt wird.
   */
  const [entwurf, setEntwurf] = useState<string | null>(null);
  const uebernehmen = () => {
    if (entwurf === null) return;
    const v = Number(entwurf.replace(",", "."));
    if (entwurf.trim() !== "" && Number.isFinite(v)) setzeCm(v);
    setEntwurf(null);
  };
  return (
    <div>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setzeCm(cm - schritt)}
          aria-label="Kleiner"
          className="flaeche flex h-12 w-12 shrink-0 items-center justify-center rounded-[3px] text-kohle transition-colors hover:!border-kohle-3 active:scale-95"
        >
          <Minus size={20} strokeWidth={2} />
        </button>

        {/* Feste 196 px liessen den Minusknopf bei 320 px Schirmbreite aus dem Bild ragen. */}
        <div className="flex min-w-[min(196px,100%)] items-baseline justify-center gap-2">
          {/* Gegengewicht zur Einheit, damit die Zahl wirklich mittig steht. */}
          <span className="w-[30px] shrink-0" aria-hidden="true" />
          <input
            type="text"
            inputMode="numeric"
            value={entwurf ?? String(cm)}
            onChange={(e) => setEntwurf(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={uebernehmen}
            onKeyDown={(e) => {
              if (e.key === "Enter") { uebernehmen(); (e.target as HTMLInputElement).blur(); }
              if (e.key === "Escape") setEntwurf(null);
              if (e.key === "ArrowUp") { e.preventDefault(); setEntwurf(null); setzeCm(cm + schritt); }
              if (e.key === "ArrowDown") { e.preventDefault(); setEntwurf(null); setzeCm(cm - schritt); }
            }}
            aria-label={`Maß in ${einheit}, zwischen ${min} und ${max}`}
            className="gross ziffern w-[136px] bg-transparent text-center text-[54px] font-bold leading-none tracking-[-0.04em] text-kohle outline-none [appearance:textfield] focus:text-kohle [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="w-[30px] shrink-0 text-left text-[17px] font-medium text-kohle-3">{einheit}</span>
        </div>

        <button
          type="button"
          onClick={() => setzeCm(cm + schritt)}
          aria-label="Größer"
          className="flaeche flex h-12 w-12 shrink-0 items-center justify-center rounded-[3px] text-kohle transition-colors hover:!border-kohle-3 active:scale-95"
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
        onChange={(e) => { setEntwurf(null); setzeCm(Number(e.target.value)); }}
        aria-label="Maß schieben"
        aria-valuetext={`${cm} ${einheit}`}
        style={{ ["--fuell" as string]: `${((cm - min) / Math.max(1, max - min)) * 100}%` }}
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
        aria-valuetext={`${Math.round(Math.min(wert, max) / 10)} cm ab Wandanfang`}
        style={{ ["--fuell" as string]: `${(Math.min(wert, max) / Math.max(10, max)) * 100}%` }}
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
      className={`rounded-[3px] border-l-2 py-3 pl-4 pr-3.5 text-[14px] leading-relaxed text-kohle-2 ${
        ton === "achtung"
          ? "vertieft border-kohle bg-creme-2/80"
          : "border-linie-stark bg-papier/70 shadow-[0_1px_2px_rgba(21,20,15,.035)]"
      }`}
    >
      {children}
    </div>
  );
}
