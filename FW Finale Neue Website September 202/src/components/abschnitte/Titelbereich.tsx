import Image from 'next/image';
import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import { cta, marke } from '@/lib/inhalt';

/**
 * Titelbereich, im Aufbau 1 zu 1 wie die Gartenzwerg-Präsentation: randloses
 * Foto, links Kennung, Headline und Unterzeile, rechts hinter einer Haarlinie
 * der eine Einstieg, darunter der Hinweis nach unten. Der Inhalt sitzt unten,
 * damit das Bild oben Luft behält und der Daumen die Schaltfläche erreicht.
 *
 * Beim Auftakt stellt das Bild scharf (data-from="fokus"), während die
 * Blende hochfährt.
 */
export default function Titelbereich() {
  return (
    <section className="band titel-zone relative isolate flex min-h-[94svh] flex-col justify-end overflow-hidden md:min-h-[96svh]">
      <div className="titel-bild" data-reveal data-from="fokus" aria-hidden="true">
        <Image
          src="/bilder/hero-drehtag.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[30%_50%] lg:object-[50%_42%]"
        />
      </div>
      <div className="titel-verlauf" aria-hidden="true" />

      <div className="schale relative pt-28 pb-12 md:pt-32 md:pb-20">
        <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <p className="kennung kennung-lang text-ink-2" data-reveal>
              Performance Marketing für Handwerk und Technik
            </p>
            <h1 className="t-display mt-5 max-w-[14ch] md:mt-7" data-split>
              Mehr Aufträge. Und die <span className="kursiv kursiv-fein">Leute</span> dafür.
            </h1>
            <p
              className="t-lead messen-weit mt-6 text-ink-2 md:mt-8"
              data-reveal
              style={{ ['--reveal-delay' as string]: '220ms' }}
            >
              Performance Marketing auf Meta und Google — für Neukunden und für
              Bewerber. Wir drehen selbst, schalten selbst und zeigen Ihnen jeden
              Monat, was eine Anfrage gekostet hat.
            </p>
          </div>

          <div className="lg:pb-3" data-reveal style={{ ['--reveal-delay' as string]: '320ms' }}>
            <div className="border-t border-rule-2 pt-7 md:pt-8">
              <p className="kennung kennung-ohne text-ink-2">Rechnet sich das für Ihren Betrieb?</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link href={cta.ziel} className="akt sm:flex-1">
                  {cta.text}
                  <Pfeil />
                </Link>
                <a href={`tel:${marke.telefon}`} className="akt akt-still sm:flex-1">
                  {marke.telefonText}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 hidden items-center gap-3 text-ink-3 md:mt-20 md:flex" data-reveal>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1v13m0 0-4.8-4.8M8 14l4.8-4.8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
          </svg>
          <span className="kennung kennung-ohne text-ink-3">Was wir machen</span>
        </div>
      </div>
    </section>
  );
}
