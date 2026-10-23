"use client";

import { type ReactNode } from "react";

/** Eingabefelder für Leute, die keine Küchenplaner sind. */

export function Frage({
  titel,
  hilfe,
  children,
}: {
  titel: string;
  hilfe?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mt-6 first:mt-0">
      <h3 className="text-[14.5px] font-medium text-ink">{titel}</h3>
      {hilfe && <p className="mt-1 max-w-[64ch] text-[12.5px] leading-relaxed text-ink-3">{hilfe}</p>}
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

/** Maßeingabe in Zentimetern, gespeichert werden Millimeter. */
export function MassFeld({
  id,
  wert,
  setze,
  min = 50,
  max = 900,
  einheit = "cm",
}: {
  id: string;
  wert: number;
  setze: (mm: number) => void;
  min?: number;
  max?: number;
  einheit?: string;
}) {
  const cm = Math.round(wert / 10);
  const meter = (wert / 1000).toFixed(2).replace(".", ",");
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex items-center overflow-hidden rounded-sm border border-line bg-paper focus-within:border-accent">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          value={cm}
          min={min}
          max={max}
          step={5}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isFinite(v)) return;
            setze(Math.round(Math.min(max, Math.max(min, v)) * 10));
          }}
          className="num w-[94px] bg-transparent px-3 py-2 text-right text-[15px] text-ink outline-none"
        />
        <span className="num border-l border-line bg-ground px-2.5 py-2 text-[12.5px] text-ink-3">{einheit}</span>
      </div>
      <span className="num text-[12.5px] text-ink-3">= {meter} m</span>
    </div>
  );
}

export function Auswahl<T extends string>({
  wert,
  setze,
  optionen,
  spalten = 2,
}: {
  wert: T;
  setze: (v: T) => void;
  optionen: Array<{ id: T; titel: string; satz?: string; bild?: ReactNode }>;
  spalten?: number;
}) {
  return (
    <div className={`grid gap-2.5 ${spalten === 3 ? "sm:grid-cols-3" : spalten === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"}`}>
      {optionen.map((o) => {
        const aktiv = o.id === wert;
        return (
          <button
            key={o.id}
            onClick={() => setze(o.id)}
            aria-pressed={aktiv}
            className={`rounded-md border p-3 text-left transition-colors ${
              aktiv ? "border-accent bg-accent-soft ring-1 ring-accent" : "border-line bg-paper hover:border-ink-3"
            }`}
          >
            {o.bild && <div className="mb-2">{o.bild}</div>}
            <div className={`text-[13.5px] font-medium ${aktiv ? "text-ink" : "text-ink-2"}`}>{o.titel}</div>
            {o.satz && <div className="mt-0.5 text-[12px] leading-snug text-ink-3">{o.satz}</div>}
          </button>
        );
      })}
    </div>
  );
}

export function JaNein({
  wert,
  setze,
  ja = "Ja",
  nein = "Nein",
  jaSatz,
  neinSatz,
}: {
  wert: boolean;
  setze: (v: boolean) => void;
  ja?: string;
  nein?: string;
  jaSatz?: string;
  neinSatz?: string;
}) {
  return (
    <Auswahl<"ja" | "nein">
      wert={wert ? "ja" : "nein"}
      setze={(v) => setze(v === "ja")}
      optionen={[
        { id: "ja", titel: ja, satz: jaSatz },
        { id: "nein", titel: nein, satz: neinSatz },
      ]}
    />
  );
}

/** Schieber, mit dem eine Position auf einer Wand gesetzt wird. */
export function Position({
  id,
  wert,
  setze,
  max,
  beschriftung,
}: {
  id: string;
  wert: number;
  setze: (mm: number) => void;
  max: number;
  beschriftung: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[12.5px]">
        <span className="text-ink-2">{beschriftung}</span>
        <span className="num text-ink-3">{(wert / 10).toFixed(0)} cm von links</span>
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={Math.max(0, max)}
        step={50}
        value={Math.min(wert, max)}
        onChange={(e) => setze(Number(e.target.value))}
        className="mt-1.5 h-1 w-full cursor-pointer appearance-none rounded-full bg-line-2 accent-accent"
      />
    </div>
  );
}

export function Schrittleiste({
  schritte,
  aktiv,
  max,
  geheZu,
}: {
  schritte: string[];
  aktiv: number;
  max: number;
  geheZu: (n: number) => void;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
      {schritte.map((s, i) => {
        const erreicht = i <= max;
        const ist = i === aktiv;
        return (
          <li key={s} className="flex items-center">
            <button
              onClick={() => erreicht && geheZu(i)}
              disabled={!erreicht}
              aria-current={ist ? "step" : undefined}
              className={`rounded-sm px-2 py-1 text-[12px] transition-colors ${
                ist
                  ? "bg-accent-soft font-medium text-accent"
                  : erreicht
                    ? "text-ink-2 hover:bg-ground"
                    : "cursor-default text-ink-3/60"
              }`}
            >
              <span className="num mr-1.5 text-[11px]">{i + 1}</span>
              {s}
            </button>
            {i < schritte.length - 1 && <span className="px-0.5 text-ink-3/60">›</span>}
          </li>
        );
      })}
    </ol>
  );
}
