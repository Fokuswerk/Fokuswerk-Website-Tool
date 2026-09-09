import Werbekonto from '@/components/geraete/Werbekonto';
import { disziplinen } from '@/lib/inhalt';

export default function Handwerk() {
  return (
    <section id="arbeit" className="pt-24 sm:pt-36">
      <div className="schale">
        <div className="max-w-[44rem]">
          <p className="kennung kennung-strich" data-reveal>01 — Das Handwerk</p>
          <h2 className="mt-6 text-[length:var(--text-4xl)]" data-split>
            Drei Disziplinen, ein Haus.<br />
            Und niemand, an den wir <span className="kursiv">weiterreichen</span>.
          </h2>
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center">
          <ul className="grid gap-0">
            {disziplinen.map((d, i) => (
              <li
                key={d.kennung}
                className="border-t border-rule py-6 last:border-b"
                data-reveal
                style={{ ['--reveal-delay' as string]: `${i * 90}ms` }}
              >
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-ink-3">
                  {d.kennung}
                </p>
                <h3 className="mt-2.5 text-[length:var(--text-xl)] font-bold tracking-[-0.03em]">
                  {d.titel}
                </h3>
                <p className="mt-2 max-w-[46ch] text-[0.98rem] leading-[1.6] text-ink-2">{d.text}</p>
              </li>
            ))}
          </ul>

          <div data-reveal data-from="scale" style={{ ['--reveal-delay' as string]: '120ms' }}>
            <Werbekonto />
            <p className="mt-4 max-w-[44ch] text-sm leading-[1.6] text-ink-3">
              Aus dem Werbekonto von WAV Westerstede. Wir wussten vorher nicht,
              welche Variante bei einer Werkstatt trägt — deshalb haben wir es
              nicht geraten, sondern gemessen.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
