import Image from 'next/image';
import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import { belegpunkte, cta } from '@/lib/inhalt';

/**
 * Warum wir. Kein einziges Adjektiv als Argument — jeder Punkt trägt den
 * Wert aus dem Vertrauensband, den er einlöst. Wo die Vorlage Kundenstimmen
 * zeigt, steht hier die eine freigegebene Referenz: Zitate kommen erst auf
 * die Seite, wenn Kunden sie freigegeben haben.
 */
export default function Warum() {
  return (
    <section className="abschnitt" aria-labelledby="warum-titel">
      <div className="schale">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <div className="lg:sticky lg:top-28">
              <p className="kennung" data-reveal>Warum wir</p>
              <h2 id="warum-titel" className="t-h1 mt-6" data-split>
                Vier Werte. Fünf Belege. Kein einziges Adjektiv als Argument.
              </h2>
              <div className="bild-rahmen relative mt-10 hidden aspect-[4/5] lg:block" data-reveal>
                <Image src="/bilder/inhaber-tresen.jpg" alt="" fill sizes="30vw" className="object-cover" />
              </div>
            </div>
          </div>

          <dl className="border-t border-rule">
            {belegpunkte.map((b) => (
              <div key={b.titel} className="border-b border-rule py-7" data-reveal>
                <dt>
                  <span className="kennung">{b.wert}</span>
                  <span className="t-h3 mt-3 block">{b.titel}</span>
                </dt>
                <dd className="t-body messen-weit mt-3 text-ink-2">{b.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-20 md:mt-28">
          <p className="kennung" data-reveal>Referenz</p>
          <div className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-md)] bg-rule md:grid-cols-[1.5fr_1fr]" data-reveal>
            <div className="bg-paper p-7 md:p-9">
              <p className="t-h3 max-w-[34ch]">
                Alexander Lüers ist als Referenz freigegeben. Wenn Sie mit ihm sprechen möchten,
                geben wir Ihnen seine Nummer.
              </p>
              <p className="t-small mt-6 text-ink-3">WAV Westerstede · Kfz-Werkstatt</p>
            </div>
            <div className="flex flex-col justify-between gap-6 bg-paper p-7 md:p-9">
              <p className="t-body text-ink-2">
                Kundenzitate stehen hier, sobald sie freigegeben sind. Bis dahin ist ein Anruf bei
                einem echten Kunden mehr wert als ein Satz auf einer Website.
              </p>
              <Link href={cta.ziel} className="verweis self-start">
                Im Gespräch nach der Nummer fragen
                <Pfeil />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
