import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Werbekonto from '@/components/geraete/Werbekonto';
import Abschluss from '@/components/abschnitte/Abschluss';
import Pfeil from '@/components/ui/Pfeil';
import { beleg } from '@/lib/inhalt';

export const metadata: Metadata = {
  title: 'WAV Westerstede — 68 Bewerbungen aus 550 € Werbebudget',
  description:
    'Neun Monate erfolglose Suche, dann ein Drehtag und drei gemessene Kampagnenvarianten: 68 Bewerbungen, davon 25–30 fachlich brauchbar, unterschriebener Vertrag nach 14 Tagen.',
  alternates: { canonical: '/fallstudien/wav-westerstede' },
};

const zahlen = [
  { wert: `${beleg.budget.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`, label: 'Werbebudget' },
  { wert: String(beleg.bewerbungen), label: 'Bewerbungen' },
  { wert: beleg.brauchbar, label: 'fachlich brauchbar' },
  { wert: `${beleg.tage} Tage`, label: 'bis zur Unterschrift' },
];

const abschnitte = [
  {
    kennung: '01 — Die Ausgangslage',
    titel: 'Vier Bewerbungen im ganzen Jahr.',
    text: [
      'Alexander Lüers führt eine freie Kfz-Werkstatt in Westerstede. Neun Monate suchte er einen Kfz-Mechatroniker: Anzeige bei einem Jobportal, Aushang im Schaufenster, Nachfragen bei der Innung.',
      'Es kamen vier Bewerbungen, keine passte. Zwei Hebebühnen liefen deshalb nur halbtags, Termine vergab er drei Wochen im Voraus.',
    ],
  },
  {
    kennung: '02 — Das Vorgehen',
    titel: 'Ein Drehtag, drei Varianten, gemessen statt geraten.',
    text: [
      'Keine Models, keine Studiobilder — seine eigenen Leute an den eigenen Hebebühnen. Wer sich bewirbt, soll vorher sehen, wo er landet.',
      'Wir wussten nicht, welcher Bewerbungsweg bei einer Werkstatt trägt. Also liefen drei Varianten gleichzeitig: Bewerbung direkt in der App, über eine eigene Seite, über die Website. Nach zehn Tagen war es eindeutig.',
      'Bewerben geht seitdem in unter 60 Sekunden, ohne Lebenslauf und ohne Anschreiben, direkt vom Handy — und jede Bewerbung landet sofort auf seinem Telefon.',
    ],
  },
];

export default function Fallstudie() {
  return (
    <>
      <article>
        <header className="pt-32 sm:pt-40">
          <div className="schale">
            <nav className="mb-8 flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink-3">
              <Link href="/" className="transition-colors hover:text-ink">Start</Link>
              <span aria-hidden="true">/</span>
              <span>WAV Westerstede</span>
            </nav>

            <p className="kennung" data-reveal>Freie Kfz-Werkstatt · Ammerland</p>
            <h1 className="mt-6 max-w-[18ch] text-[length:var(--text-5xl)]" data-split>
              Neun Monate gesucht. Nach 14 Tagen{' '}
              <span className="kursiv">unterschrieben</span>.
            </h1>

            <ul className="mt-14 grid grid-cols-2 border-t border-rule md:grid-cols-4">
              {zahlen.map((z, i) => (
                <li
                  key={z.label}
                  className="border-b border-rule py-6 pr-4 md:border-b-0 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-rule md:[&:not(:first-child)]:pl-6"
                  data-reveal
                  style={{ ['--reveal-delay' as string]: `${i * 80}ms` }}
                >
                  <p className="text-[length:var(--text-3xl)] font-extrabold leading-none tracking-[-0.045em]">
                    {z.wert}
                  </p>
                  <p className="mt-2.5 text-sm text-ink-3">{z.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <div className="schale mt-16" data-reveal data-from="scale">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[var(--radius-xl)]"
               style={{ boxShadow: 'var(--shadow-float)' }}>
            <Image
              src="/bilder/hebebuehne-dreh.jpg"
              alt="Ein Kameramann filmt einen Mechatroniker unter einem angehobenen Fahrzeug."
              fill
              sizes="(min-width: 80rem) 76rem, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <p className="mt-4 text-sm text-ink-3">
            Der Drehtag bei WAV. Eigene Leute, eigene Hebebühnen.
          </p>
        </div>

        {abschnitte.map((a) => (
          <section key={a.kennung} className="pt-20 sm:pt-28">
            <div className="schale grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
              <div>
                <p className="kennung kennung-strich" data-reveal>{a.kennung}</p>
                <h2 className="mt-5 max-w-[16ch] text-[length:var(--text-2xl)]" data-reveal>{a.titel}</h2>
              </div>
              <div className="grid gap-4 text-[length:var(--text-lg)] leading-[1.6] text-ink-2" data-reveal>
                {a.text.map((t) => <p key={t.slice(0, 24)}>{t}</p>)}
              </div>
            </div>
          </section>
        ))}

        <section className="pt-20 sm:pt-28">
          <div className="schale grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <p className="kennung kennung-strich" data-reveal>03 — Der Beleg</p>
              <h2 className="mt-5 max-w-[16ch] text-[length:var(--text-2xl)]" data-reveal>
                4,92 € gegen 218 € je Bewerbung.
              </h2>
            </div>
            <div data-reveal data-from="scale">
              <Werbekonto />
              <p className="mt-5 max-w-[52ch] text-[0.95rem] leading-[1.6] text-ink-2">
                Bei gleichem Budget sind das 44 Bewerbungen statt einer. Wir haben
                dieses Lehrgeld einmal bezahlt — beim nächsten Betrieb läuft die
                teure Variante gar nicht erst an.
              </p>
              <p className="mt-6 border-t border-rule pt-5 text-sm leading-[1.6] text-ink-3">
                Alle Zahlen stammen aus den Werbekonten. Alexander Lüers ist als
                Referenz freigegeben — wenn Sie mit ihm sprechen möchten, geben wir
                Ihnen seine Nummer. Für die Kundenseite läuft parallel Google Ads:
                rund {beleg.anfragen} Anfragen in zweieinhalb Monaten.
              </p>
              <Link href="/" className="verweis mt-6">
                Zurück zur Startseite
                <Pfeil />
              </Link>
            </div>
          </div>
        </section>
      </article>

      <Abschluss />
    </>
  );
}
