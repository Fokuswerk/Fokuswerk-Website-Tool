"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

/**
 * Ein Scherz für den Partner: bevor irgendetwas zu sehen ist, muss eine
 * Kleinigkeit bestätigt werden. Einmal durch, dann merkt der Browser es sich.
 *
 * Bewusst kein Anmelde- oder Bezahlvorgang: es wird nichts abgefragt,
 * nichts gesendet und nichts gespeichert außer dem Haken hier.
 */

const SCHLUESSEL = "serienkueche-tor";

const AUSREDEN = [
  "Der Knopf klemmt.",
  "Dieser Knopf ist leider außer Betrieb.",
  "Versuch's weiter. Er bewegt sich schneller als du.",
  "Letzte Warnung: der Knopf gewinnt.",
];

export function Torwaechter() {
  const [bereit, setBereit] = useState(false);
  const [offen, setOffen] = useState(false);
  const [zugestimmt, setZugestimmt] = useState(false);
  const [flucht, setFlucht] = useState<{ x: number; y: number } | null>(null);
  const [versuche, setVersuche] = useState(0);
  const feld = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(SCHLUESSEL) !== "ja") setOffen(true);
    } catch {
      setOffen(true);
    }
    setBereit(true);
  }, []);

  // Beim offenen Tor nicht hinter dem Overlay scrollen können.
  useEffect(() => {
    if (!offen) return;
    const vorher = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = vorher; };
  }, [offen]);

  if (!bereit || !offen) return null;

  const durchlassen = () => {
    try { window.localStorage.setItem(SCHLUESSEL, "ja"); } catch { /* dann eben jedes Mal */ }
    setOffen(false);
  };

  const ausweichen = () => {
    const kasten = feld.current?.getBoundingClientRect();
    if (!kasten) return;
    const spanne = Math.min(150, kasten.width / 2.6);
    setFlucht({
      x: (Math.random() - 0.5) * 2 * spanne,
      y: (Math.random() - 0.5) * 70,
    });
    setVersuche((v) => v + 1);
  };

  return (
    <div className="warm fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto px-5 py-8">
      <div className="absolute inset-0 bg-creme/80 backdrop-blur-xl" />

      <div ref={feld} className="flaeche flaeche-hoch relative w-full max-w-[520px] rounded-[22px] px-7 py-9 sm:px-10 sm:py-11">
        <div className="vorzeile">Zutritt</div>
        <h1 className="gross mt-3 text-[30px] font-bold leading-[1.06] tracking-[-0.03em] text-kohle sm:text-[38px]">
          Einmal kurz bestätigen.
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-kohle-2">
          Bevor du die Küche siehst, fehlt noch eine Formalie. Rein rechtlich unbedenklich,
          menschlich überfällig.
        </p>

        <button
          type="button"
          onClick={() => setZugestimmt((v) => !v)}
          aria-pressed={zugestimmt}
          className={`warm-wahl mt-7 flex w-full items-start gap-3.5 rounded-[14px] border p-4 text-left transition-colors ${
            zugestimmt ? "border-kohle bg-creme-2/60 ring-1 ring-kohle" : "border-linie-stark bg-papier hover:border-kohle-3"
          }`}
        >
          <span
            className={`mt-[1px] flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border-2 transition-colors ${
              zugestimmt ? "border-kohle bg-kohle text-creme" : "border-linie-stark bg-papier text-transparent"
            }`}
          >
            <Check size={14} strokeWidth={3} />
          </span>
          <span className="text-[16px] font-semibold leading-snug text-kohle">
            Thees ist der coolste und beste Typ, den es gibt.
          </span>
        </button>

        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
          <button
            type="button"
            onClick={durchlassen}
            disabled={!zugestimmt}
            className={`inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[16px] font-semibold transition-all ${
              zugestimmt
                ? "bg-gradient-to-b from-[#3b382f] to-kohle text-creme shadow-[0_1px_2px_rgba(21,20,15,.2),0_10px_24px_-10px_rgba(21,20,15,.55),inset_0_1px_0_rgba(255,255,255,.14)]"
                : "cursor-not-allowed bg-creme-2 text-kohle-3"
            }`}
          >
            Weiter zur Küche
            <ArrowRight size={18} strokeWidth={2.2} />
          </button>

          <button
            type="button"
            onMouseEnter={ausweichen}
            onFocus={ausweichen}
            onClick={ausweichen}
            className="rounded-full px-3 py-2 text-[14px] text-kohle-3 transition-transform duration-200 hover:text-kohle-3"
            style={flucht ? { transform: `translate(${flucht.x}px, ${flucht.y}px)` } : undefined}
          >
            Das sehe ich anders
          </button>
        </div>

        {versuche > 0 && (
          <p className="mt-4 text-[13.5px] text-kohle-3">
            {AUSREDEN[Math.min(versuche, AUSREDEN.length) - 1]}
          </p>
        )}

        <p className="mt-8 border-t border-linie-warm pt-5 text-[12.5px] leading-relaxed text-kohle-3">
          Das hier ist ein Scherz und keine Bezahlschranke: es kostet nichts, es wird nichts
          abgefragt und nichts verschickt. Der Haken bleibt nur in diesem Browser.
        </p>
      </div>
    </div>
  );
}
