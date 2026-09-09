import Image from 'next/image';
import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import { beleg, betriebe } from '@/lib/inhalt';

export default function Fallstudie() {
  return (
    <section className="pt-24 sm:pt-36">
      <div className="schale">
        <div className="max-w-[44rem]">
          <p className="kennung kennung-strich" data-reveal>04 — Die Fälle</p>
          <h2 className="mt-6 text-[length:var(--text-4xl)]" data-split>
            Neun Monate gesucht. Nach vierzehn Tagen{' '}
            <span className="kursiv">unterschrieben</span>.
          </h2>
        </div>
      </div>

      <div className="schale mt-14">
        <Link
          href="/fallstudien/wav-westerstede"
          className="group block"
          data-reveal
          data-from="scale"
        >
          <div className="relative overflow-hidden rounded-[var(--radius-xl)]" style={{ boxShadow: 'var(--shadow-float)' }} data-faden="rechts">
            <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
              <Image
                src="/bilder/aufbau-stativ.jpg"
                alt="Zwei Männer bauen in einer Kfz-Werkstatt ein Kamerastativ auf."
                fill
                sizes="(min-width: 80rem) 76rem, 100vw"
                className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.03]"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(105deg, #05070aeb 6%, #05070ab3 42%, #05070a33 100%)' }}
              />
            </div>

            <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
              <div>
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-white/60">
                  WAV Westerstede · Ammerland
                </p>
                <p className="mt-3 max-w-[20ch] text-[length:var(--text-2xl)] font-bold leading-[1.08] tracking-[-0.035em] text-white">
                  Vier Bewerbungen im Jahr. Dann ein Drehtag.
                </p>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-6">
                <ul className="flex flex-wrap gap-x-9 gap-y-4">
                  <Wert wert={`${beleg.budget.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`} label="Budget" />
                  <Wert wert={String(beleg.bewerbungen)} label="Bewerbungen" />
                  <Wert wert={`${beleg.tage} Tage`} label="bis zur Unterschrift" />
                </ul>
                <span className="verweis text-white">
                  Fallstudie ansehen
                  <Pfeil />
                </span>
              </div>
            </div>
          </div>
        </Link>

        <p className="mt-5 max-w-[56ch] text-sm leading-[1.6] text-ink-3" data-reveal>
          Alle Zahlen stammen aus den Werbekonten. Alexander Lüers ist als Referenz
          freigegeben — wenn Sie mit ihm sprechen möchten, geben wir Ihnen seine Nummer.
        </p>

        {/* Weitere Betriebe: nur Gewerk und Ort. Eine Fallstudie mit Zahlen
            steht erst hier, wenn der Betrieb sie freigegeben hat. */}
        <div className="mt-16 border-t border-rule pt-8" data-reveal>
          <p className="kennung">Außerdem in Betreuung</p>
          <ul className="mt-6 grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
            {betriebe.filter((b) => !b.fall).map((b) => (
              <li key={b.name} className="border-b border-rule py-5 pr-6 lg:border-b-0 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-rule lg:[&:not(:first-child)]:pl-6">
                <p className="text-[1.02rem] font-bold tracking-[-0.025em]">{b.name}</p>
                <p className="mt-1.5 text-sm text-ink-3">{b.gewerk}<br />{b.ort}</p>
              </li>
            ))}
          </ul>
          <p className="mt-7 max-w-[58ch] text-sm leading-[1.6] text-ink-3">
            Weitere Fallstudien folgen, sobald die Betriebe ihre Zahlen freigeben.
            Wir veröffentlichen keine, die wir nicht aus einem Werbekonto oder einer
            Rechnung belegen können — auch dann nicht, wenn das Ergebnis gut war.
          </p>
        </div>
      </div>
    </section>
  );
}

function Wert({ wert, label }: { wert: string; label: string }) {
  return (
    <li>
      <p className="text-[length:var(--text-2xl)] font-extrabold leading-none tracking-[-0.04em] text-white">
        {wert}
      </p>
      <p className="mt-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-white/55">{label}</p>
    </li>
  );
}
