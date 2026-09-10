import Image from 'next/image';
import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import { cta, marke } from '@/lib/inhalt';

/**
 * Abschluss. Derselbe Einstieg wie im Titelbereich, kein zweiter Pfad.
 * Darunter die Risikoumkehr direkt am Konversionspunkt und die Nummer für
 * alle, die lieber anrufen.
 */
export default function Schluss() {
  return (
    <section className="band relative isolate overflow-hidden" aria-labelledby="schluss-titel">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <Image src="/bilder/landtechnik-halle.jpg" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ background: '#0c0f14cc' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0c0f14d9 0%, #0c0f148c 50%, #0c0f1400 100%)' }} />
      </div>

      <div className="schale py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <h2 id="schluss-titel" className="t-h1 max-w-[14ch]" data-split>
              Ab hier ist das Marketing unsere Sache.
            </h2>
            <p className="t-lead messen mt-7 text-ink-2" data-reveal>
              Zwanzig Minuten am Telefon. Wenn es sich für Ihren Betrieb rechnet, fangen wir an.
              Wenn nicht, sagen wir es Ihnen im selben Gespräch.
            </p>
          </div>

          <div data-reveal>
            <div className="border-t border-rule-2 pt-8">
              <p className="kennung kennung-ohne text-ink-2">Erstes Gespräch</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link href={cta.ziel} className="akt sm:flex-1">
                  {cta.text}
                  <Pfeil />
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {['Kein Vertrag', 'Keine Anzahlung', 'Kein zweiter Termin'].map((p) => (
                  <li key={p} className="t-small flex items-center gap-2 text-ink-2">
                    <span aria-hidden="true" className="h-px w-3" style={{ background: 'var(--brand)' }} />
                    {p}
                  </li>
                ))}
              </ul>

              <p className="t-small mt-8 text-ink-3">
                Lieber direkt sprechen?{' '}
                <a href={`tel:${marke.telefon}`} className="text-ink underline underline-offset-4">
                  {marke.telefonText}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
