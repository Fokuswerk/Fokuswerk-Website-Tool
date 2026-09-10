import { gruende } from '@/lib/inhalt';

export default function Warum() {
  return (
    <section className="pt-24 sm:pt-36">
      <div className="schale">
        <div className="max-w-[46rem]">
          <p className="kennung kennung-strich" data-reveal>03 — Warum das trägt</p>
          <h2 className="mt-6 text-[length:var(--text-4xl)]" data-split>
            Drei Gründe, und keiner davon ist{' '}
            <span className="kursiv">Kreativität</span>.
          </h2>
        </div>

        <ol className="mt-14 grid gap-0 border-t border-rule">
          {gruende.map((g, i) => (
            <li
              key={g.kopf}
              className="grid gap-4 border-b border-rule py-9 lg:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1.25fr)] lg:items-start lg:gap-10"
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 90}ms` }}
            >
              <span className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-ink-3">
                0{i + 1}
              </span>
              <h3 className="max-w-[18ch] text-[length:var(--text-xl)] font-bold tracking-[-0.03em]">
                {g.kopf}
              </h3>
              <p className="max-w-[54ch] text-[1rem] leading-[1.68] text-ink-2">{g.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
