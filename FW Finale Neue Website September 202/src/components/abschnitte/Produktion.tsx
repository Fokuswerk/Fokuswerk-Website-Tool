import Image from 'next/image';

/**
 * Das Produktionsband. Zwei Reihen laufen gegenläufig durch — das ist die
 * einzige Stelle, an der die Seite zeigt statt behauptet, dass aus einem
 * Drehtag ein Monatsvorrat wird.
 *
 * Jede Reihe steht doppelt im Markup; die Bewegung läuft über genau -50 %
 * und schließt dadurch nahtlos.
 */
const reiheA = [
  'aufbau-stativ', 'mechatroniker-handy', 'haende-motor', 'werkstatt-halle',
  'neuer-mitarbeiter', 'kameramonitor', 'schluesseluebergabe',
];
const reiheB = [
  'steinmetz-halle', 'landtechnik-halle', 'schnitt-vor-ort', 'inhaber-tresen',
  'transporter-hof', 'besprechung-werkbank', 'hebebuehne-dreh',
];

export default function Produktion() {
  return (
    <section className="band mt-24 overflow-hidden py-24 sm:mt-36 sm:py-32">
      <div className="schale">
        <div className="mx-auto max-w-[42rem] text-center">
          <p className="kennung justify-center" data-reveal>Bewegtbild</p>
          <h2 className="mt-6 text-[length:var(--text-3xl)]" data-split>
            Was an einem Drehtag <span className="kursiv">entsteht</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-[42ch] text-[length:var(--text-lg)] leading-[1.55] text-ink-2" data-reveal>
            Acht bis zwölf Clips, dazu die Standbilder für Seiten und Anzeigen.
            Genug für vier Wochen — in zwei Fassungen, für Bewerber und für Kunden.
          </p>
        </div>
      </div>

      <div className="mt-14 grid gap-4 sm:mt-16 sm:gap-5">
        <Reihe bilder={reiheA} zeit={64} />
        <Reihe bilder={reiheB} zeit={78} rueck />
      </div>

      <div className="schale mt-14">
        <ul className="mx-auto flex max-w-[46rem] flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-rule pt-8">
          {[
            ['8–12', 'Clips je Drehtag'],
            ['2', 'Fassungen: Bewerber und Kunden'],
            ['100 %', 'Rohmaterial bleibt bei Ihnen'],
          ].map(([w, l]) => (
            <li key={l} className="flex items-baseline gap-2.5" data-reveal>
              <span className="text-[length:var(--text-2xl)] font-extrabold tracking-[-0.04em]">{w}</span>
              <span className="text-sm text-ink-3">{l}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Reihe({ bilder, zeit, rueck = false }: { bilder: string[]; zeit: number; rueck?: boolean }) {
  const doppelt = [...bilder, ...bilder];
  return (
    <div className="lauf-halt relative">
      <div
        className={`lauf gap-4 sm:gap-5${rueck ? ' lauf-rueck' : ''}`}
        style={{ ['--lauf-zeit' as string]: `${zeit}s` }}
      >
        {doppelt.map((b, i) => (
          <figure
            key={`${b}-${i}`}
            className="relative aspect-[4/3] w-[13rem] flex-none overflow-hidden rounded-[var(--radius-md)] sm:w-[19rem]"
            style={{ background: 'var(--color-night-3)' }}
          >
            <Image
              src={`/bilder/${b}.jpg`}
              alt=""
              fill
              sizes="19rem"
              className="object-cover"
              aria-hidden="true"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
