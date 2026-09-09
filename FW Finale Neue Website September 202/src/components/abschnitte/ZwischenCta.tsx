import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import { cta, marke } from '@/lib/inhalt';

/**
 * Zwischenstopp. Wer bis hierher gelesen hat, weiß, wie es läuft — der
 * Abschluss ist noch weit unten. Hier hakt der rote Faden das erste Mal ein.
 */
export default function ZwischenCta() {
  return (
    <section className="pt-24 sm:pt-32">
      <div className="schale">
        <div
          className="karte flex flex-col items-start gap-7 px-7 py-8 sm:px-10 sm:py-9 lg:flex-row lg:items-center lg:justify-between lg:gap-12"
          data-reveal
        >
          <div>
            <p className="kennung">Kurz dazwischen</p>
            <p className="mt-3 max-w-[34ch] text-[length:var(--text-xl)] font-bold leading-[1.2] tracking-[-0.03em]">
              Reicht das schon, um es einmal durchzurechnen?
            </p>
            <p className="mt-2 max-w-[46ch] text-[0.95rem] leading-[1.6] text-ink-2">
              20 Minuten am Telefon. Sie schildern die Lage, wir rechnen mit Ihren
              Zahlen — und sagen Ihnen im selben Gespräch, ob es sich trägt.
            </p>
          </div>

          <div className="flex flex-none flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link href={cta.ziel} className="akt" data-faden="ziel">
              {cta.text}
              <Pfeil />
            </Link>
            <a href={`tel:${marke.telefon}`} className="akt akt-still font-mono">
              {marke.telefonText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
