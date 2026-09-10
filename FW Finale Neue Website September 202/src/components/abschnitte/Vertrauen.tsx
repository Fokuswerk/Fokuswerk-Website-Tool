import { vertrauen } from '@/lib/inhalt';

/**
 * Vertrauensband direkt unter dem Titelbild, mit geringer visueller Last.
 * Die vier Werte stehen hier als Behauptung und werden unter „Warum wir"
 * einzeln belegt — ein Wert, der nur oben steht, wäre Dekoration.
 */
export default function Vertrauen() {
  return (
    <section className="bg-paper-2" aria-label="Wie wir arbeiten">
      <div className="schale">
        <div className="flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-7" data-reveal>
          <p className="t-small max-w-md">{vertrauen.satz}</p>
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 lg:gap-x-4">
            {vertrauen.werte.map((w, i) => (
              <li key={w} className="flex items-center gap-3 lg:gap-4">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="hidden h-[5px] w-[5px] rotate-45 sm:block"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
                <span className="kennung kennung-ohne text-ink">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
