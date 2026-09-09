import Image from 'next/image';

/**
 * Der Filmstreifen.
 *
 * Kein Karussell: der Streifen läuft nicht von selbst, sondern wird vom
 * Scrollen gezogen. In der Mitte steht ein fester Kopf, unter dem die Bilder
 * durchlaufen — dazu Perforation und Zeitcode. Das Bauteil zeigt, was ein
 * Drehtag hergibt, in der Sprache dessen, womit es aufgenommen wurde.
 */
const streifen = [
  { bild: 'aufbau-stativ', code: '00:00:14', tag: 'Aufbau' },
  { bild: 'werkstatt-halle', code: '00:07:02', tag: 'Halle' },
  { bild: 'haende-motor', code: '00:19:38', tag: 'Detail' },
  { bild: 'mechatroniker-handy', code: '00:31:55', tag: 'Pause' },
  { bild: 'inhaber-tresen', code: '00:48:20', tag: 'Chef' },
  { bild: 'steinmetz-halle', code: '01:02:47', tag: 'Staub' },
  { bild: 'landtechnik-halle', code: '01:16:09', tag: 'Technik' },
  { bild: 'neuer-mitarbeiter', code: '01:29:31', tag: 'Porträt' },
  { bild: 'schluesseluebergabe', code: '01:44:06', tag: 'Übergabe' },
  { bild: 'besprechung-werkbank', code: '01:58:52', tag: 'Abnahme' },
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

      {/* Der Streifen. Bewegt sich nur, solange gescrollt wird. */}
      <div className="relative mt-16 select-none" data-faden="rechts">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-px -translate-x-1/2 lg:block"
             style={{ background: 'rgb(var(--brand-glow) / 0.5)' }}>
          <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"
                style={{ background: 'var(--brand)' }} />
        </div>

        <div data-szene="lang" className="fw-film">
          <div className="fw-perf flex items-center justify-between px-6" aria-hidden="true">
            <span className="fw-randtext">Fokuswerk · 400 · Safety Film</span>
            <span className="fw-randtext">Oldenburg</span>
          </div>

          <div className="flex">
            {streifen.map((k, i) => (
              <figure key={k.bild} className="fw-kader">
                <div className="relative aspect-[3/2] w-[15rem] overflow-hidden sm:w-[21rem]">
                  <Image
                    src={`/bilder/${k.bild}.jpg`}
                    alt=""
                    fill
                    sizes="21rem"
                    className="object-cover"
                    aria-hidden="true"
                  />
                  <span className="fw-vignette" />
                </div>
                <figcaption className="flex items-baseline justify-between gap-3 px-2 py-1.5">
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-white/60">
                    {String(i + 1).padStart(2, '0')} · {k.tag}
                  </span>
                  <span className="font-mono text-[0.55rem] tracking-[0.08em] text-white/50">
                    {k.code}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="fw-perf flex items-center justify-between px-6" aria-hidden="true">
            <span className="fw-randtext">Drehtag · Werkstatt · 24 B/s</span>
            <span className="fw-randtext">Fokuswerk · 400</span>
          </div>
        </div>
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
