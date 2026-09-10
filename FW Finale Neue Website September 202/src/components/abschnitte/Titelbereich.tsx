import Image from 'next/image';
import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import { cta, marke } from '@/lib/inhalt';

/**
 * Der Titelbereich: ein Bild vom Drehtag, randlos, die Headline unten links.
 *
 * Aufbau nach der Gartenzwerg-Präsentation. Der Inhalt sitzt unten, damit
 * das Bild oben Luft behält und der Daumen die Schaltfläche erreicht; die
 * Kopfleiste liegt transparent darüber. Drei Verläufe statt einer flächigen
 * Abdunklung: das Bild bleibt lesbar, der Text hat trotzdem sicheren Kontrast.
 *
 * Das Bild zeigt, was wir tun — vor Ort drehen —, statt es zu behaupten.
 * Beim Auftakt stellt es scharf (data-from="fokus"), während die Blende
 * hochfährt: die Kamera findet ihren Fokus, danach steht die Headline.
 */
export default function Titelbereich() {
  return (
    <section className="band titel-zone relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden sm:min-h-[94svh]">
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

      <div className="schale relative pt-32 pb-10 sm:pb-14 lg:pb-16">
        <p className="kennung kennung-lang text-ink-2" data-reveal>
          Performance Marketing für Handwerk und Technik
        </p>

        <h1
          className="mt-6 max-w-[15ch] text-[length:var(--text-6xl)] leading-[0.95] sm:max-w-none"
          data-split
        >
          Mehr Aufträge.<br className="hidden sm:inline" /> Und die <span className="kursiv kursiv-fein">Leute</span> dafür.
        </h1>

        <div className="mt-10 grid gap-8 border-t border-rule-2 pt-8 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <p
            className="max-w-[52ch] text-[length:var(--text-lg)] leading-[1.55] text-ink-2"
            data-reveal
            style={{ ['--reveal-delay' as string]: '220ms' }}
          >
            Performance Marketing auf Meta und Google — für Neukunden und für
            Bewerber. Wir drehen selbst, schalten selbst und zeigen Ihnen jeden
            Monat, was eine Anfrage gekostet hat.
          </p>

          <div
            className="flex flex-col gap-4 lg:items-end"
            data-reveal
            style={{ ['--reveal-delay' as string]: '320ms' }}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={cta.ziel} className="akt w-full sm:w-auto">
                {cta.text}
                <Pfeil />
              </Link>
              <a href={`tel:${marke.telefon}`} className="akt akt-still w-full sm:w-auto">
                {marke.telefonText}
              </a>
            </div>
            <p className="text-sm text-ink-3">{cta.notiz}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
