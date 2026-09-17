"use client";

import { useState } from "react";
import { verein } from "@/content/verein";

function Kopieren({ wert, label }: { wert: string; label: string }) {
  const [kopiert, setKopiert] = useState(false);

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(wert);
      setKopiert(true);
      window.setTimeout(() => setKopiert(false), 2000);
    } catch {
      // Zwischenablage nicht verfügbar – der Wert steht ohnehin sichtbar daneben.
    }
  }

  return (
    <button
      type="button"
      onClick={kopieren}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-current/25 px-3 py-1 text-xs font-semibold transition-colors duration-200 hover:bg-current/[0.07]"
    >
      {kopiert ? (
        <>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="size-3.5"
          >
            <path
              d="M3 8.5 6.2 12 13 4.8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Kopiert
        </>
      ) : (
        <>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="size-3.5"
          >
            <rect
              x="5.5"
              y="5.5"
              width="8"
              height="8"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M10.5 3.2A1.7 1.7 0 0 0 8.8 2.5H4.2A1.7 1.7 0 0 0 2.5 4.2v4.6c0 .73.46 1.36 1.1 1.6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="sr-only">{label} kopieren</span>
          <span aria-hidden="true">Kopieren</span>
        </>
      )}
    </button>
  );
}

/**
 * Die Bankverbindung des Vereins.
 * Die Daten stehen ausschließlich in `content/verein.ts` – bitte dort pflegen.
 */
export function Spendenkonto({
  verwendungszweck,
  ton = "hell",
}: {
  verwendungszweck?: string;
  ton?: "hell" | "dunkel";
}) {
  const dunkel = ton === "dunkel";

  const zeilen: { label: string; wert: string; kopierbar?: boolean }[] = [
    { label: "Kontoinhaber", wert: verein.spende.kontoinhaber },
    { label: "IBAN", wert: verein.spende.iban, kopierbar: true },
    { label: "BIC", wert: verein.spende.bic, kopierbar: true },
    { label: "Bank", wert: verein.spende.bank },
  ];

  if (verwendungszweck) {
    zeilen.push({ label: "Verwendungszweck", wert: verwendungszweck });
  }

  return (
    <div
      className={
        dunkel
          ? "rounded-2xl border border-paper/15 bg-paper/[0.06] p-6 text-paper sm:p-8"
          : "rounded-2xl border border-sand-200 bg-sand-50 p-6 text-ink sm:p-8"
      }
    >
      <h3
        className={`text-xs font-semibold tracking-[0.14em] uppercase ${
          dunkel ? "text-mist" : "text-sea"
        }`}
      >
        Spendenkonto
      </h3>

      <dl className="mt-5 space-y-3.5">
        {zeilen.map((zeile) => (
          <div
            key={zeile.label}
            className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b pb-3.5 last:border-0 last:pb-0 ${
              dunkel ? "border-paper/10" : "border-sand-200"
            }`}
          >
            <dt
              className={`text-xs font-medium ${dunkel ? "text-paper/55" : "text-ink-50"}`}
            >
              {zeile.label}
            </dt>
            <dd className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-medium whitespace-nowrap tabular-nums">
                {zeile.wert}
              </span>
              {zeile.kopierbar ? (
                <Kopieren wert={zeile.wert} label={zeile.label} />
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
