import Link from 'next/link';
import Buehne from '@/components/geraete/Buehne';
import Pfeil from '@/components/ui/Pfeil';
import { cta, marke } from '@/lib/inhalt';

export default function Titelbereich() {
  return (
    <section className="relative pt-32 sm:pt-40">
      <div className="schale">
        {/* Eine Schriftgröße für die Aussage, eine Kennung darüber, ein Absatz
            darunter. Drei Stufen in der Überschrift wirkten unruhig. */}
        <div className="mx-auto max-w-[54rem] text-center">
          <p className="kennung justify-center" data-reveal>
            Handwerk · Technik · Nordwest-Niedersachsen
          </p>

          <h1
            className="mx-auto mt-7 max-w-[19ch] text-[length:var(--text-5xl)] leading-[0.98]"
            data-split
          >
            Aus einem Drehtag im Monat werden Aufträge und{' '}
            <span className="kursiv">Bewerbungen</span>.
          </h1>

          <p
            className="mx-auto mt-7 max-w-[48ch] text-[length:var(--text-lg)] leading-[1.55] text-ink-2"
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

      <div className="schale mt-16 pb-14 sm:mt-20 sm:pb-16" data-reveal style={{ ['--reveal-delay' as string]: '260ms' }}>
        <Buehne />
      </div>
    </section>
  );
}
