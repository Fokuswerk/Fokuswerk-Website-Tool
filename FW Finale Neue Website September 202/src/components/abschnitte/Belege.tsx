import Link from 'next/link';
import Buehne from '@/components/geraete/Buehne';
import Pfeil from '@/components/ui/Pfeil';
import { beleg } from '@/lib/inhalt';

/**
 * Der Beleg direkt unter dem Titelbild — an der Stelle, an der die
 * Gartenzwerg-Präsentation ihre Vertrauensleiste hat.
 *
 * Der erste Einwand nach einer Headline ist „behaupten kann das jeder". Hier
 * steht deshalb sofort ein Fall mit Zahlen aus dem Werbekonto, daneben die
 * Anzeige und die Seite, auf die sie führt. Keine Zahl ohne Konto dahinter.
 */
const belege = [
  { wert: beleg.budget, nach: 2, einheit: ' €', label: 'Werbebudget' },
  { wert: beleg.bewerbungen, nach: 0, einheit: '', label: 'Bewerbungen' },
  { wert: beleg.anfragen, nach: 0, einheit: '', label: 'Anfragen über Google Ads' },
  { wert: beleg.tage, nach: 0, einheit: ' Tage', label: 'bis zur Unterschrift' },
];

export default function Belege() {
  return (
    <section className="pt-20 sm:pt-28">
      <div className="schale grid items-center gap-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-20">
        <div>
          <p className="kennung kennung-strich" data-reveal>Ein Fall, vollständig belegt</p>
          <p className="mt-5 text-[length:var(--text-xl)] font-bold tracking-[-0.03em]" data-reveal>
            WAV Westerstede · Kfz-Werkstatt
          </p>

          <ul className="mt-8 grid grid-cols-2 border-t border-rule">
            {belege.map((z, i) => (
              <li
                key={z.label}
                className="border-b border-rule py-6 pr-4 even:border-l even:pl-5 sm:even:pl-6"
                data-reveal
                style={{ ['--reveal-delay' as string]: `${i * 80}ms` }}
              >
                <p className="text-[length:var(--text-3xl)] font-extrabold leading-none tracking-[-0.045em]">
                  <span data-zahl={z.wert} data-nachkomma={z.nach}>0</span>
                  {z.einheit}
                </p>
                <p className="mt-3 max-w-[18ch] text-sm text-ink-3">{z.label}</p>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4" data-reveal>
            <p className="text-sm text-ink-3">Alle Zahlen stammen aus den Werbekonten.</p>
            <Link href="/fallstudien/wav-westerstede" className="verweis">
              Fallstudie ansehen
              <Pfeil />
            </Link>
          </div>
        </div>

        <div data-reveal data-from="scale">
          <Buehne />
        </div>
      </div>
    </section>
  );
}
