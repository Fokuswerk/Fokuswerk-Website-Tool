import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import { cta, marke } from '@/lib/inhalt';

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
            Betrieb rechnet — und wenn nicht, sagen wir Ihnen das.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row" data-reveal>
            <Link href={cta.ziel} className="akt w-full sm:w-auto">
              {cta.text}
              <Pfeil />
            </Link>
            <a href={`tel:${marke.telefon}`} className="akt akt-still w-full sm:w-auto">
              {marke.telefonText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
