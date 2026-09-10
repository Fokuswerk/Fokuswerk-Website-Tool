import Link from 'next/link';
import Buehne from '@/components/geraete/Buehne';
import Pfeil from '@/components/ui/Pfeil';
import { beleg, cta, marke } from '@/lib/inhalt';

/**
 * Der Titelbereich als dunkle Bühne.
 *
 * Dunkel, weil der Rest der Seite hell ist: der Bruch beim ersten Scrollen
 * ist der stärkste Takt, den eine Seite hat. Darüber liegen zwei Ebenen, die
 * sich langsam bewegen — Punktraster und zwei warme Lichter. Beide sind
 * Grafik, kein Bild, und kosten nichts an Ladezeit.
 */
const belege = [
  { wert: beleg.budget, nach: 2, einheit: ' €', label: 'Werbebudget' },
  { wert: beleg.bewerbungen, nach: 0, einheit: '', label: 'Bewerbungen' },
  { wert: beleg.anfragen, nach: 0, einheit: '', label: 'Anfragen über Google Ads' },
  { wert: beleg.tage, nach: 0, einheit: ' Tage', label: 'bis zur Unterschrift' },
];

export default function Titelbereich() {
  return (
    <section className="band relative overflow-hidden pt-32 sm:pt-40">
      <div className="buehne-grund" aria-hidden="true" />

      <div className="schale relative">
        <div className="mx-auto max-w-[56rem] text-center">
          <p className="kennung justify-center" data-reveal>
            Performance Marketing für Handwerk und Technik
          </p>

          <h1
            className="mx-auto mt-7 max-w-[14ch] text-[length:var(--text-6xl)] leading-[0.94]"
            data-split
          >
            Mehr Aufträge. Und die <span className="kursiv kursiv-fein">Leute</span> dafür.
          </h1>

          <p
            className="mx-auto mt-8 max-w-[50ch] text-[length:var(--text-lg)] leading-[1.55] text-ink-2"
            data-reveal
            style={{ ['--reveal-delay' as string]: '220ms' }}
          >
            Performance Marketing auf Meta und Google — für Neukunden und für
            Bewerber. Wir drehen selbst, schalten selbst und zeigen Ihnen jeden
            Monat, was eine Anfrage gekostet hat.
          </p>

          <div
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
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

      <div className="schale relative mt-16 pb-4 sm:mt-20" data-reveal style={{ ['--reveal-delay' as string]: '260ms' }}>
        <Buehne />
      </div>

      {/* Beleg direkt im Titelbereich: der erste Einwand ist „behaupten kann
          das jeder", und der wird hier schon beantwortet. */}
      <div className="schale relative mt-16 sm:mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-4">
          <p className="kennung kennung-strich" data-reveal>Ein Fall, vollständig belegt</p>
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-3" data-reveal>
            WAV Westerstede · Kfz-Werkstatt
          </p>
        </div>

        <ul className="grid grid-cols-2 pb-16 md:grid-cols-4 sm:pb-20">
          {belege.map((z, i) => (
            <li
              key={z.label}
              className="border-b border-rule py-7 pr-4 md:border-b-0 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-rule md:[&:not(:first-child)]:pl-6"
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 80}ms` }}
            >
              <p className="text-[length:var(--text-3xl)] font-extrabold leading-none tracking-[-0.045em]">
                <span data-zahl={z.wert} data-nachkomma={z.nach}>0</span>
                {z.einheit}
              </p>
              <span
                className="mt-4 block h-px w-full origin-left"
                style={{ background: 'var(--accent)', ['--reveal-delay' as string]: `${i * 80 + 120}ms` }}
                data-draw
                aria-hidden="true"
              />
              <p className="mt-3 max-w-[18ch] text-sm text-ink-3">{z.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
