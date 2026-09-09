import Link from 'next/link';
import Buehne from '@/components/geraete/Buehne';
import Pfeil from '@/components/ui/Pfeil';
import { cta, marke } from '@/lib/inhalt';

export default function Titelbereich() {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-36">
      <div className="schale">
        <div className="mx-auto max-w-[56rem] text-center">
          <p className="kennung justify-center" data-reveal>
            Für Betriebe mit eigener Werkstatt
          </p>

          {/* Kaskade in einer Überschrift: drei Größen, ein Satz. Das eine
              kursive Wort trägt den Marker. */}
          <h1 className="mt-6 sm:mt-8" data-split>
            <span className="block text-[length:var(--text-2xl)] font-semibold tracking-[-0.03em] text-ink-2">
              Ein Drehtag im Monat.
            </span>
            <span className="mt-1 block text-[length:var(--text-6xl)] font-extrabold leading-[0.94] tracking-[-0.045em]">
              Zwei Kampagnen.
            </span>
            <span className="mt-2 block text-[length:var(--text-3xl)] font-bold tracking-[-0.035em] sm:mt-3">
              Mitarbeiter und <span className="kursiv">Kunden</span>.
            </span>
          </h1>

          <p
            className="mx-auto mt-7 max-w-[46ch] text-[length:var(--text-lg)] leading-[1.55] text-ink-2"
            data-reveal
            style={{ ['--reveal-delay' as string]: '220ms' }}
          >
            Wir drehen bei Ihnen im Betrieb, fahren die Kampagnen auf Meta und
            Google und bauen die Seiten, auf denen beides landet. Alles selbst,
            alles im Haus.
          </p>

          <div
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
            data-reveal
            style={{ ['--reveal-delay' as string]: '320ms' }}
          >
            <Link href={cta.ziel} className="akt w-full sm:w-auto">
              {cta.text}
              <Pfeil />
            </Link>
            <a href={`tel:${marke.telefon}`} className="akt akt-still w-full sm:w-auto">
              {marke.telefonText}
            </a>
          </div>

          <p className="mt-4 text-sm text-ink-3" data-reveal style={{ ['--reveal-delay' as string]: '400ms' }}>
            {cta.notiz}
          </p>
        </div>
      </div>

      <div className="schale mt-16 sm:mt-20" data-reveal data-from="scale" style={{ ['--reveal-delay' as string]: '260ms' }}>
        <Buehne />
      </div>
    </section>
  );
}
