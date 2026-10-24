"use client";

/**
 * Die Maßkette als Fortschrittsanzeige.
 *
 * Vorher hingen 19 Schritte an einem 160 px breiten Balken, der pro Antwort
 * acht Pixel wuchs; "Schritt 14 von 19" stand nur im Code für Vorlesesoftware.
 * Die Frage "habe ich schon, was muss ich noch?" war damit buchstäblich
 * unbeantwortbar.
 *
 * Jetzt steht dort eine Maßkette: vier benannte Felder, jedes mit seiner
 * Spanne, die Zahl in einer Lücke in der Linie — so, wie eine Wand in einer
 * Bauzeichnung bemaßt wird. Die Grammatik ist die aus dem technischen
 * Zeichnen und sie sagt hier etwas Wahres:
 *
 *   durchgezogen = erledigt
 *   gestrichelt  = kommt noch
 *
 * Die Schrägstriche an den Feldgrenzen sind Maßhilfsstriche, keine Zierde.
 * Dieselbe Figur trägt die ganze Marke; sie darf deshalb nirgends als
 * Trennlinie, Rahmen oder Unterstreichung auftauchen.
 */

export interface Station {
  name: string;
  /** Kurzform fuers Handy — vier Namen nebeneinander passen dort nicht. */
  kurz: string;
  /** Wie viele Schritte in diesem Abschnitt liegen. */
  gesamt: number;
  /** Wie viele davon hinter dem Nutzer liegen. */
  erledigt: number;
  /** Steht der Nutzer gerade hier? */
  jetzt: boolean;
  /** Zum ersten Schritt dieses Abschnitts springen — nur rückwärts erlaubt. */
  hin?: () => void;
}

/** Ein Maßhilfsstrich: 45 Grad, wie in der Zeichnung. */
function Schraegstrich({ hell }: { hell?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-[9px] w-px shrink-0 rotate-45 ${hell ? "bg-kohle/35" : "bg-kohle-3/55"}`}
    />
  );
}

export function Massleiste({ stationen }: { stationen: Station[] }) {
  const gesamt = stationen.reduce((s, x) => s + x.gesamt, 0);
  const erledigt = stationen.reduce((s, x) => s + x.erledigt, 0);

  return (
    <div
      className="flex min-w-0 flex-1 items-stretch"
      role="group"
      aria-label={`Fortschritt: ${erledigt} von ${gesamt} Fragen beantwortet`}
    >
      {stationen.map((s, i) => {
        const fertig = s.erledigt >= s.gesamt;
        const angefangen = s.erledigt > 0 || s.jetzt;
        const Huelle = s.hin ? "button" : "div";
        return (
          <Huelle
            key={s.name}
            {...(s.hin
              ? { type: "button" as const, onClick: s.hin, title: `Zurück zu ${s.name}` }
              : {})}
            style={{ ["--spanne" as string]: s.gesamt }}
            className={`massfeld group flex min-w-0 flex-col justify-center px-1.5 text-left ${
              s.hin ? "cursor-pointer" : "cursor-default"
            }`}
          >
            {/* Die Beschriftung sitzt über der Lücke, nicht auf der Linie. */}
            <span className="flex min-w-0 items-baseline gap-1.5 pb-[3px]">
              <span
                className={`truncate text-[11.5px] leading-none ${
                  s.jetzt
                    ? "font-semibold text-kohle"
                    : fertig
                      ? "text-kohle-2 group-hover:text-kohle"
                      : "text-kohle-3"
                }`}
              >
                <span className="sm:hidden">{s.kurz}</span>
                <span className="hidden sm:inline">{s.name}</span>
              </span>
              {/* Auf dem Handy nur dort eine Zahl, wo man gerade steht —
                  vier Zaehler nebeneinander fressen die Namen auf. */}
              <span
                className={`ziffern shrink-0 text-[10.5px] leading-none ${
                  s.jetzt ? "text-kohle-2" : "text-kohle-3/80"
                } ${fertig || s.jetzt ? "" : "hidden sm:inline"}`}
              >
                {fertig ? "✓" : `${s.erledigt}/${s.gesamt}`}
              </span>
            </span>

            {/* Die Maßlinie: erledigter Teil durchgezogen, Rest gestrichelt. */}
            <span className="flex items-center" aria-hidden="true">
              <Schraegstrich hell={!angefangen} />
              <span className="relative h-px min-w-0 flex-1">
                <span className="absolute inset-0 border-t border-dashed border-kohle-3/45" />
                <span
                  className="absolute inset-y-0 left-0 border-t border-kohle transition-[width] duration-500 ease-out"
                  style={{ width: `${Math.min(100, (s.erledigt / Math.max(1, s.gesamt)) * 100)}%` }}
                />
              </span>
              {i === stationen.length - 1 && <Schraegstrich hell={!fertig} />}
            </span>
          </Huelle>
        );
      })}
    </div>
  );
}
