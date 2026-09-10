import Image from 'next/image';
import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import Zeichen from '@/components/ui/Zeichen';
import { beleg, betriebe } from '@/lib/inhalt';

/**
 * Betriebe, die wir betreuen — eine horizontale Bahn mit großen Karten,
 * Scroll-Snap statt Karussell-Bibliothek. Genannt werden nur Name, Gewerk und
 * Ort; eine Geschichte mit Zahlen steht nur dort, wo sie belegt ist. Wo es
 * kein Bild aus dem Betrieb gibt, steht eine Schriftkarte statt eines
 * Symbolfotos, das so tut, als wäre es dort entstanden.
 */
const bilder: Record<string, string> = { 'WAV Westerstede': 'werkstatt-halle' };

export default function Betriebe() {
  return (
    <section className="abschnitt-eng overflow-x-clip" aria-labelledby="betriebe-titel">
      <div className="schale">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="kennung" data-reveal>Betriebe</p>
            <h2 id="betriebe-titel" className="t-h1 mt-6" data-split>Betriebe, die wir betreuen.</h2>
          </div>
          <div data-reveal>
            <Link href="/fallstudien/wav-westerstede" className="verweis">
              Zur Fallstudie
              <Pfeil />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12" data-reveal>
        <ul
          className="keine-leiste flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 md:gap-8"
          style={{ paddingInline: 'var(--rand)', scrollPaddingInline: 'var(--rand)' }}
        >
          {betriebe.map((b) => {
            const bild = bilder[b.name];
            const inhalt = (
              <>
                <div className="bild-rahmen relative aspect-[4/5]">
                  {bild ? (
                    <Image
                      src={`/bilder/${bild}.jpg`}
                      alt="Werkstatthalle mit Hebebühnen"
                      fill
                      sizes="(min-width: 64rem) 36vw, (min-width: 40rem) 52vw, 78vw"
                      className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="band absolute inset-0 flex flex-col justify-between p-7">
                      <Zeichen groesse={28} />
                      <div>
                        <p className="kennung kennung-ohne">{b.gewerk}</p>
                        <p className="mt-3 text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold leading-[1.05] tracking-[-0.04em]">{b.name}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <h3 className="t-h3">{b.name}</h3>
                  <span className="t-small shrink-0 text-ink-3">{b.ort}</span>
                </div>
                <p className="t-small mt-2 text-ink-3">{b.gewerk}{b.fall ? ' · Fallstudie' : ''}</p>
                {b.fall && (
                  <p className="t-body mt-3 text-ink-2">
                    {beleg.bewerbungen} Bewerbungen aus {beleg.budget.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € Budget.
                    Der Vertrag mit dem neuen Mitarbeiter war nach {beleg.tage} Tagen unterschrieben.
                  </p>
                )}
              </>
            );
            return (
              <li key={b.name} className="w-[78vw] max-w-[30rem] shrink-0 snap-start sm:w-[52vw] lg:w-[36vw]">
                {b.fall ? (
                  <Link href={`/fallstudien/${b.fall}`} className="group block">{inhalt}</Link>
                ) : (
                  <div>{inhalt}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="schale">
        <p className="t-small mt-6 max-w-[62ch] text-ink-3">
          Weitere Fallstudien folgen, sobald die Betriebe ihre Zahlen freigeben. Wir
          veröffentlichen keine, die wir nicht aus einem Werbekonto oder einer Rechnung belegen können.
        </p>
      </div>
    </section>
  );
}
