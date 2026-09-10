import Image from 'next/image';
import { prinzip } from '@/lib/inhalt';

/**
 * Das Prinzip. Hier wird der Kategoriebruch ausgesprochen: Der Markt
 * verkauft Reichweite, wir verkaufen Anfragen. Die drei Punkte sind konkret
 * und überprüfbar, nicht „Qualität, Leidenschaft, Kreativität".
 */
export default function Prinzip() {
  return (
    <section className="band" aria-labelledby="prinzip-titel">
      <div className="schale">
        <div className="grid gap-12 py-20 md:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="bild-rahmen relative aspect-[4/5] lg:aspect-[3/4]" data-reveal>
            <Image src="/bilder/kamera-gimbal.jpg" alt="" fill sizes="(min-width: 64rem) 38vw, 100vw" className="object-cover" />
          </div>

          <div className="flex flex-col justify-center">
            <p className="kennung" data-reveal>Das Prinzip</p>
            <h2 id="prinzip-titel" className="t-h1 mt-6" data-split>
              Wir verkaufen keine Reichweite. Wir verkaufen Anfragen.
            </h2>
            <p className="t-lead messen-weit mt-7 text-ink-2" data-reveal>
              Reichweite, Klicks und Impressionen sind Zahlen für die Agentur, nicht für Sie.
              Sie interessiert, wer anruft, wer sich bewirbt — und was jeder davon gekostet hat.
            </p>

            <dl className="mt-12 border-t border-rule">
              {prinzip.map((p, i) => (
                <div key={p.titel} className="border-b border-rule py-7" data-reveal style={{ ['--reveal-delay' as string]: `${i * 110}ms` }}>
                  <dt className="t-h3">{p.titel}</dt>
                  <dd className="t-body messen-weit mt-3 text-ink-2">{p.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
