import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import { cta, stufen } from '@/lib/inhalt';

/**
 * Drei Stufen. Unterschieden wird, wen Sie suchen, nicht wie viel wir
 * drehen. Die oberste Stufe trägt die dunkle Karte, das Etikett markiert die
 * Empfehlung. Preise stehen hier bewusst nicht: der Monatspreis hängt am
 * Betrieb und fällt im ersten Gespräch.
 */
export default function Stufen() {
  return (
    <section className="abschnitt" aria-labelledby="stufen-titel">
      <div className="schale">
        <div className="max-w-3xl">
          <p className="kennung" data-reveal>Betreuung</p>
          <h2 id="stufen-titel" className="t-h1 mt-5" data-split>
            Drei Stufen. Der Unterschied ist, wen Sie suchen.
          </h2>
          <span aria-hidden="true" className="mt-6 block h-[2px] w-10" style={{ background: 'var(--brand)' }} data-reveal />
          <p className="t-lead mt-6 text-ink-2" data-reveal>
            Die Mechanik ist in jeder Stufe dieselbe: Drehtag, Seite, Kampagne, Messung.
            Unterschiedlich ist, wer am Ende anruft — ein Kunde, ein Bewerber oder beide.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3 md:gap-6">
          {stufen.map((s, i) => {
            const tief = i === stufen.length - 1;
            return (
              <div
                key={s.name}
                data-reveal
                style={{ ['--reveal-delay' as string]: `${i * 110}ms` }}
                className={`flex flex-col rounded-[var(--radius-lg)] p-7 md:p-8 ${tief ? 'band' : 'border border-rule bg-paper-2'}`}
              >
                <div className="flex min-h-8 items-center justify-between gap-4">
                  <span className="t-num text-[1.6rem] leading-none" style={{ color: 'var(--accent)' }}>{s.ordnung}</span>
                  {s.empfohlen && (
                    <span className="kennung kennung-ohne rounded-full px-3 py-1.5" style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
                      Unsere Empfehlung
                    </span>
                  )}
                </div>
                <h3 className="t-h2 mt-5">{s.name}</h3>
                <p className="t-lead mt-2.5" style={{ color: 'var(--accent)' }}>{s.versprechen}</p>
                <p className="t-body mt-4 text-ink-2">{s.text}</p>
                <ul className="mt-7 flex flex-col gap-3.5">
                  {s.punkte.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <span aria-hidden="true" className="mt-[0.6em] h-[5px] w-[5px] shrink-0 rotate-45" style={{ background: 'var(--accent)' }} />
                      <span className="t-small">{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-9">
                  <div className="border-t border-rule pt-5">
                    <p className="t-small text-ink-3">Gemessen in</p>
                    <p className="t-num mt-1.5 text-[1.6rem] leading-tight">{s.mass}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4" data-reveal>
          <Link href={cta.ziel} className="verweis">
            {cta.text}
            <Pfeil />
          </Link>
          <p className="t-small max-w-xl text-ink-3">
            Den Monatspreis nennen wir Ihnen im ersten Gespräch — für Ihren Betrieb, nicht als Spanne.
          </p>
        </div>
      </div>
    </section>
  );
}
