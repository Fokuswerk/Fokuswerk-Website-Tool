"use client";

import { useState } from "react";
import type { Frage } from "@/daten/faq";

/** Aufklappbare Fragen. Ohne Skript sind alle Antworten über <details> erreichbar. */
export default function Fragen({ fragen }: { fragen: readonly Frage[] }) {
  const [offen, setOffen] = useState<number | null>(0);

  return (
    <ul className="fragen">
      {fragen.map((f, i) => {
        const auf = offen === i;
        return (
          <li key={f.frage} className="frage" data-auf={auf ? "ja" : "nein"}>
            <h3>
              <button
                type="button"
                className="frage-schalter"
                aria-expanded={auf}
                onClick={() => setOffen(auf ? null : i)}
              >
                <span>{f.frage}</span>
                <span className="frage-zeichen" aria-hidden="true">
                  <span /><span />
                </span>
              </button>
            </h3>
            <div className="frage-huelle" hidden={!auf}>
              <p className="still frage-antwort">{f.antwort}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
