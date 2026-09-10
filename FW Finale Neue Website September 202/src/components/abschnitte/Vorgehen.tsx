import { schritte } from '@/lib/inhalt';

/**
 * Das Vorgehen als eine Linie mit fünf Stationen.
 *
 * Ersetzt die Sticky-Sequenz mit wechselndem Bild — die war zu lang und hat
 * den Leser irgendwann verloren. Hier steht alles auf einer Höhe: eine
 * Schiene, die sich beim Hereinfahren zieht, und fünf Stationen, die der
 * Reihe nach aufgehen. Auf dem Handy läuft dieselbe Schiene senkrecht.
 */
export default function Vorgehen() {
  return (
    <section id="vorgehen" className="pt-24 sm:pt-36">
      <div className="schale">
        <div className="max-w-[46rem]">
          <p className="kennung kennung-strich" data-reveal>02 — Das Vorgehen</p>
          <h2 className="mt-6 text-[length:var(--text-4xl)]" data-split>
            Fünf Schritte. Danach läuft es <span className="kursiv">monatlich</span>.
          </h2>
          <p className="mt-6 max-w-[46ch] text-[length:var(--text-lg)] leading-[1.55] text-ink-2" data-reveal>
            Ein halber Tag Ihrer Zeit im Monat. Den Rest übernehmen wir — und
            zeigen Ihnen am Monatsende, was dabei herausgekommen ist.
          </p>
        </div>

        <ol className="prozess mt-16 sm:mt-20" data-reveal>
          {/* Die Schiene: zieht sich beim Erscheinen von links auf. */}
          <span className="prozess-schiene" data-draw aria-hidden="true" />

          {schritte.map((s, i) => (
            <li key={s.nr} className="prozess-station" style={{ ['--i' as string]: i }}>
              <span className="prozess-punkt" aria-hidden="true">
                <span>{s.nr}</span>
              </span>
              <p className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-3">
                {s.marke}
              </p>
              <h3 className="mt-2 text-[length:var(--text-lg)] font-bold leading-[1.2] tracking-[-0.025em]">
                {s.titel}
              </h3>
              <p className="mt-2.5 text-[0.92rem] leading-[1.6] text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
