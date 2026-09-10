import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import { cta, fuerWen, marke } from '@/lib/inhalt';

/**
 * Für wen. Wo die Vorlage ihr Einsatzgebiet zeigt, zeigt Fokuswerk seine
 * Auswahl: begrenzte Kapazität wird nicht versteckt, sondern gesagt. Die
 * Liste kommt aus dem Zielkundenprofil, ohne interne Umsatzzahlen.
 */
export default function FuerWen() {
  return (
    <section className="abschnitt bg-paper-2" aria-labelledby="fuerwen-titel">
      <div className="schale">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="kennung" data-reveal>Für wen</p>
            <h2 id="fuerwen-titel" className="t-h1 mt-6" data-split>Wir sind bewusst nicht für jeden.</h2>
            <p className="t-lead messen mt-7 text-ink-2" data-reveal>
              Wer zum Drehtag kommt, schaut abends auch die Zahlen an. Das geht nur mit wenigen
              Betrieben — deshalb suchen wir sie aus.
            </p>
            <p className="t-body messen mt-5 text-ink-2" data-reveal>
              Am besten passt ein Betrieb, bei dem ein einzelner Kunde oder eine besetzte Stelle
              die Werbung allein trägt. Wenn das bei Ihnen nicht so ist, sagen wir es im ersten Gespräch.
            </p>

            <div className="mt-10 border-t border-rule pt-8" data-reveal>
              <p className="kennung kennung-ohne">Passt Ihr Betrieb?</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link href={cta.ziel} className="akt">
                  {cta.text}
                  <Pfeil />
                </Link>
                <a href={`tel:${marke.telefon}`} className="akt akt-still">{marke.telefonText}</a>
              </div>
            </div>
          </div>

          <div data-reveal>
            <dl>
              {fuerWen.map((z) => (
                <div key={z.titel} className="border-t border-rule py-6 last:border-b">
                  <dt className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="t-h3">{z.titel}</span>
                    <span className="kennung kennung-ohne" style={z.stark ? { color: 'var(--accent)' } : undefined}>
                      {z.status}
                    </span>
                  </dt>
                  <dd className="mt-3">
                    <p className="t-small text-ink-2">{z.liste}</p>
                    <p className="t-small mt-2 max-w-lg text-ink-3">{z.notiz}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
