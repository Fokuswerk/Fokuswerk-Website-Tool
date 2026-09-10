import Image from 'next/image';
import { leistungen } from '@/lib/inhalt';

export default function Leistungen() {
  return (
    <section id="arbeit" className="pt-24 sm:pt-36">
      <div className="schale">
        <div className="max-w-[46rem]">
          <p className="kennung kennung-strich" data-reveal>01 — Was wir machen</p>
          <h2 className="mt-6 text-[length:var(--text-4xl)]" data-split>
            Fünf Dinge. Alle im <span className="kursiv">Haus</span>.
          </h2>
          <p className="mt-6 max-w-[48ch] text-[length:var(--text-lg)] leading-[1.55] text-ink-2" data-reveal>
            Keine Agentur, die Produktion einkauft, und kein Produzent, der beim
            Werbekonto passt. Wer dreht, schneidet auch — und wer die Kampagne
            aufsetzt, schaut sie auch am Sonntagabend an.
          </p>
        </div>

        <div className="mt-16 grid gap-20 sm:mt-20 sm:gap-28">
          {leistungen.map((l, i) => (
            <article
              key={l.nr}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
              data-reveal
            >
              <div className={i % 2 === 1 ? 'lg:order-2' : undefined}>
                <div className="schein">
                  <div
                    className="szene-parallaxe relative aspect-[4/3] rounded-[var(--radius-lg)]"
                    style={{ boxShadow: 'var(--shadow-float)' }}
                    data-tilt="2.5"
                    data-szene
                  >
                    <Image
                      src={`/bilder/${l.bild}.jpg`}
                      alt={l.titel}
                      fill
                      sizes="(min-width: 64rem) 34rem, 100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className={i % 2 === 1 ? 'lg:order-1' : undefined}>
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-ink-3">
                  {l.nr} — {l.kurz}
                </p>
                <h3 className="mt-3 text-[length:var(--text-2xl)] font-bold tracking-[-0.035em]">
                  {l.titel}
                </h3>
                <p className="mt-4 max-w-[46ch] text-[1rem] leading-[1.65] text-ink-2">{l.was}</p>

                <ul className="mt-7 grid gap-0 border-t border-rule">
                  {l.raus.map((r) => (
                    <li key={r} className="flex items-start gap-3 border-b border-rule py-3 text-[0.95rem]">
                      <span className="mt-[0.55em] h-1 w-1 flex-none rounded-full" style={{ background: 'var(--accent)' }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
