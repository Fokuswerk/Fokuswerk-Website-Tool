import type { Metadata } from 'next';
import Formular from '@/components/abschnitte/Formular';
import { marke } from '@/lib/inhalt';

export const metadata: Metadata = {
  title: 'Gespräch vereinbaren',
  description:
    '20 Minuten am Telefon: Wir gehen Ihre Zahlen durch und sagen Ihnen, ob sich ein Drehtag im Monat für Ihren Betrieb rechnet.',
  alternates: { canonical: '/kontakt' },
};

const ablauf = [
  'Sie schildern kurz, wie es läuft: offene Stellen, Auslastung, abgegebene Aufträge.',
  'Wir rechnen mit Ihren Zahlen durch, ob sich das trägt.',
  'Danach sagen wir Ihnen, ob wir zusagen würden — oder warum nicht.',
];

export default function Kontakt() {
  return (
    <section className="pt-32 pb-24 sm:pt-40">
      <div className="schale">
        <div className="max-w-[42rem]">
          <p className="kennung" data-reveal>Kontakt</p>
          <h1 className="mt-6 text-[length:var(--text-5xl)]" data-split>
            Zwanzig Minuten, am <span className="kursiv">Telefon</span>.
          </h1>
          <p className="mt-6 max-w-[44ch] text-[length:var(--text-lg)] leading-[1.55] text-ink-2" data-reveal>
            Kein Pitch, keine Präsentation, kein zweiter Termin. Ein Anruf, an dessen
            Ende Sie wissen, ob sich das für Ihren Betrieb rechnet.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
          <div data-reveal><Formular /></div>

          <aside className="grid gap-10 self-start" data-reveal style={{ ['--reveal-delay' as string]: '120ms' }}>
            <div>
              <p className="kennung">Direkt</p>
              <a href={`tel:${marke.telefon}`}
                 className="mt-4 block font-mono text-[length:var(--text-2xl)] font-medium tracking-[-0.025em]">
                {marke.telefonText}
              </a>
              <a href={`mailto:${marke.mail}`} className="mt-2 block text-ink-2">{marke.mail}</a>
              <p className="mt-4 max-w-[38ch] text-sm leading-[1.6] text-ink-3">
                Werktags 8 bis 18 Uhr. Wenn niemand rangeht, sind wir auf einem
                Drehtag — schreiben Sie kurz, wir melden uns zurück.
              </p>
            </div>

            <div className="border-t border-rule pt-8">
              <p className="kennung">Was im Gespräch passiert</p>
              <ol className="mt-5 grid gap-4">
                {ablauf.map((t, i) => (
                  <li key={t.slice(0, 20)} className="flex gap-3 text-[0.95rem] leading-[1.6] text-ink-2">
                    <span className="font-mono text-xs text-ink-3">0{i + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-t border-rule pt-8">
              <p className="kennung">Anschrift</p>
              <address className="mt-4 text-[0.95rem] not-italic leading-[1.7] text-ink-2">
                {marke.firma}<br />{marke.strasse}<br />{marke.plz} {marke.ort}
              </address>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
