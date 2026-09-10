import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import { cta, einstieg } from '@/lib/inhalt';

/**
 * So beginnt es. Ein Register mit großen Ziffern und Haarlinien statt einer
 * Prozessgrafik; jeder Schritt trägt eine Zeitangabe — daran kann man uns
 * messen.
 */
export default function Einstieg() {
  return (
    <section id="vorgehen" className="abschnitt bg-paper-2" aria-labelledby="einstieg-titel">
      <div className="schale">
        <div className="max-w-3xl">
          <p className="kennung" data-reveal>So beginnt es</p>
          <h2 id="einstieg-titel" className="t-h1 mt-6" data-split>
            Fünf Schritte. Danach kostet es Sie einen halben Tag im Monat.
          </h2>
        </div>

        <ol className="mt-16 border-t border-rule">
          {einstieg.map((s) => (
            <li
              key={s.nr}
              className="grid gap-3 border-b border-rule py-8 md:grid-cols-[5rem_1fr_1.4fr] md:gap-10 md:py-10"
              data-reveal
            >
              <span className="t-num text-[2.4rem] leading-none md:text-[3rem]" style={{ color: 'var(--accent)' }} aria-hidden="true">
                {s.nr}
              </span>
              <div>
                <h3 className="t-h3">{s.titel}</h3>
                <p className="t-small mt-1.5 text-ink-3">{s.dauer}</p>
              </div>
              <p className="t-body messen-weit text-ink-2 md:pt-1">{s.text}</p>
            </li>
          ))}
        </ol>

        <div data-reveal>
          <Link href={cta.ziel} className="verweis mt-12">
            Mit Schritt eins beginnen
            <Pfeil />
          </Link>
        </div>
      </div>
    </section>
  );
}
