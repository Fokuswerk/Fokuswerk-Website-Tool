import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import { cta, marke } from '@/lib/inhalt';

/**
 * Der Schlusspunkt — hier landet der rote Faden.
 *
 * Die Schaltfläche ist zweizeilig: oben, was passiert, darunter, was es
 * kostet an Zeit. Ein Knopf, der die Frage „worauf lasse ich mich ein?"
 * schon beantwortet, muss nicht überredet werden. Daneben steht die
 * Telefonnummer gleichwertig — ein Teil dieser Zielgruppe ruft lieber an,
 * als ein Formular auszufüllen.
 */
export default function Abschluss() {
  return (
    <section className="band pt-24 pb-4 sm:pt-32">
      <div className="schale">
        <div className="mx-auto max-w-[46rem] text-center">
          <p className="kennung justify-center" data-reveal>Der nächste Schritt</p>
          <h2 className="mt-6 text-[length:var(--text-5xl)]" data-split>
            Nennen Sie uns einen <span className="kursiv">Drehtag</span>.
          </h2>
          <p className="mx-auto mt-6 max-w-[44ch] text-[length:var(--text-lg)] leading-[1.55] text-ink-2" data-reveal>
            Kein Konzept, kein Workshop, keine Vorbereitungsphase. Ein Anruf, in dem
            wir Ihre Zahlen durchgehen. Danach wissen Sie, ob sich das für Ihren
            Betrieb rechnet — und wenn nicht, sagen wir Ihnen das im selben Gespräch.
          </p>

          <div
            className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-stretch"
            data-reveal
          >
            <Link
              href={cta.ziel}
              className="akt group w-full flex-col !items-start !gap-0.5 !rounded-[var(--radius-lg)] !px-8 !py-5 text-left sm:w-auto"
            >
              <span className="flex items-center gap-2.5 text-[1.08rem] font-bold tracking-[-0.02em]">
                {cta.text}
                <Pfeil groesse={15} />
              </span>
              <span className="text-[0.82rem] font-medium opacity-70">
                20 Minuten, am Telefon
              </span>
            </Link>

            <a
              href={`tel:${marke.telefon}`}
              className="akt akt-still w-full flex-col !items-start !gap-0.5 !rounded-[var(--radius-lg)] !px-8 !py-5 text-left sm:w-auto"
            >
              <span className="font-mono text-[1.08rem] font-medium tracking-[-0.01em]">
                {marke.telefonText}
              </span>
              <span className="text-[0.82rem] font-medium text-ink-3">
                Werktags 8 bis 18 Uhr
              </span>
            </a>
          </div>

          <p className="mt-6 text-sm text-ink-3" data-reveal>
            Kein Vertrag, keine Anzahlung, kein zweiter Termin.
          </p>
        </div>
      </div>
    </section>
  );
}
