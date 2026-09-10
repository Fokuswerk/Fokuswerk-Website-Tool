import { fragen } from '@/lib/inhalt';

/**
 * Fragen. Beantwortet werden Kaufeinwände, keine Marketingfragen. Natives
 * details/summary: tastaturbedienbar und im Browser-Suchtext auffindbar,
 * ohne eine Zeile JavaScript. Dieselben Fragen gehen als FAQPage an die Suche.
 */
export default function Fragen() {
  return (
    <section className="abschnitt" aria-labelledby="fragen-titel">
      <div className="schale">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="kennung" data-reveal>Fragen</p>
            <h2 id="fragen-titel" className="t-h1 mt-6" data-split>
              Was Sie wissen wollen, bevor Sie unterschreiben.
            </h2>
          </div>

          <div className="border-t border-rule">
            {fragen.map((f) => (
              <div key={f.frage} className="border-b border-rule" data-reveal>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                    <span className="t-h3 text-[1.15rem] leading-snug md:text-[1.3rem]">{f.frage}</span>
                    <span
                      aria-hidden="true"
                      className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center text-ink-3 transition-transform duration-500 ease-[var(--ease-out)] group-open:rotate-45"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <path d="M7 1v12M1 7h12" />
                      </svg>
                    </span>
                  </summary>
                  <p className="t-body messen-weit pb-6 text-ink-2">{f.antwort}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: fragen.map((f) => ({
              '@type': 'Question',
              name: f.frage,
              acceptedAnswer: { '@type': 'Answer', text: f.antwort },
            })),
          }),
        }}
      />
    </section>
  );
}
