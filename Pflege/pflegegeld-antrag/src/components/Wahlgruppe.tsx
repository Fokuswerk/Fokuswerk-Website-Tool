"use client";

import { useRef } from "react";

type Props = {
  name: string;
  optionen: string[];
  wert: number | undefined;
  onWahl: (index: number) => void;
  /**
   * Wird nur bei einer bewussten Festlegung gerufen - Klick, Leertaste oder
   * Eingabetaste. Beim Durchblaettern mit den Pfeiltasten NICHT, sonst springt
   * ein Rechner, der nach der Antwort weiterschaltet, sofort zur naechsten
   * Frage und die Tastatur wird unbenutzbar.
   */
  onFestlegen?: (index: number) => void;
};

/**
 * Einfachauswahl als echte Radiogruppe: Vorleseprogramme sagen damit "Option 3
 * von 7, ausgewählt", und man kommt mit den Pfeiltasten durch die Antworten.
 * Die Tabulatortaste springt in die Gruppe hinein und wieder heraus, nicht
 * durch jede einzelne Antwort (rollender tabIndex).
 */
export default function Wahlgruppe({ name, optionen, wert, onWahl, onFestlegen }: Props) {
  const gruppe = useRef<HTMLDivElement>(null);

  function fokussiere(i: number) {
    const knoepfe = gruppe.current?.querySelectorAll<HTMLButtonElement>("button");
    knoepfe?.[i]?.focus();
  }

  function taste(e: React.KeyboardEvent, i: number) {
    const letzte = optionen.length - 1;
    let ziel: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") ziel = i === letzte ? 0 : i + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") ziel = i === 0 ? letzte : i - 1;
    else if (e.key === "Home") ziel = 0;
    else if (e.key === "End") ziel = letzte;
    if (ziel === null) return;
    e.preventDefault();
    fokussiere(ziel);
    onWahl(ziel);
  }

  /** Nur ein Knopf der Gruppe ist mit der Tabulatortaste erreichbar. */
  function tabIndex(i: number): 0 | -1 {
    if (wert === undefined) return i === 0 ? 0 : -1;
    return wert === i ? 0 : -1;
  }

  return (
    <div className="wahlen" role="radiogroup" aria-label={name} ref={gruppe}>
      {optionen.map((text, i) => (
        <button
          key={i}
          type="button"
          role="radio"
          className="wahl"
          aria-checked={wert === i}
          tabIndex={tabIndex(i)}
          onKeyDown={(e) => taste(e, i)}
          onClick={() => {
            onWahl(i);
            onFestlegen?.(i);
          }}
        >
          <span className="wahl-haken" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 8.4L6.2 11.6L13 4.8"
                stroke="var(--akzent-auf)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>{text}</span>
        </button>
      ))}
    </div>
  );
}
