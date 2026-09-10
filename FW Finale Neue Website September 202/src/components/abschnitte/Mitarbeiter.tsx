import Image from 'next/image';
import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';

/**
 * Eigener Einstieg für die Mitarbeitersuche — die Stelle, an der die
 * Vorlage ihre Tür für Immobilienkunden hat. Eine Tür, keine Vermischung:
 * die Startseite bleibt Performance Marketing für beide Ziele.
 */
const punkte = [
  'Bewerbung in unter 60 Sekunden, ohne Lebenslauf',
  'Jede Bewerbung sofort auf Ihrem Handy',
  'Karriereseite mit Ihren eigenen Leuten',
  'Kosten je Bewerbung, monatlich ausgewiesen',
];

export default function Mitarbeiter() {
  return (
    <section className="band" aria-labelledby="mitarbeiter-titel">
      <div className="schale">
        <div className="grid items-center gap-12 py-20 md:py-24 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="kennung" data-reveal>Für Mitarbeiter</p>
            <h2 id="mitarbeiter-titel" className="t-h2 mt-6" data-split>
              Die guten Leute suchen nicht. Sie haben einen Job.
            </h2>
            <p className="t-body messen-weit mt-6 text-ink-2" data-reveal>
              Eine Stellenanzeige erreicht nur, wer aktiv sucht. Wir spielen Ihre Kampagne dort
              aus, wo die Leute wohnen, die zu Ihnen fahren würden — und machen das Bewerben so
              einfach, dass es abends auf dem Sofa passiert.
            </p>
            <ul className="mt-8 flex flex-col gap-3" data-reveal>
              {punkte.map((p) => (
                <li key={p} className="t-body flex gap-3">
                  <span aria-hidden="true" className="mt-3 h-px w-4 shrink-0" style={{ background: 'var(--brand)' }} />
                  {p}
                </li>
              ))}
            </ul>
            <div data-reveal>
              <Link href="/fallstudien/wav-westerstede" className="verweis mt-9">
                Fallstudie WAV Westerstede ansehen
                <Pfeil />
              </Link>
            </div>
          </div>

          <div className="bild-rahmen relative aspect-[3/2] lg:aspect-[4/3]" data-reveal>
            <Image src="/bilder/hebebuehne-dreh.jpg" alt="" fill sizes="(min-width: 64rem) 46vw, 100vw" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
