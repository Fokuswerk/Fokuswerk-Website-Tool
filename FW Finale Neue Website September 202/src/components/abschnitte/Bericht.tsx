import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import { beleg } from '@/lib/inhalt';

/**
 * Die Auswertung als Dokument, nicht als Dashboard: ein Blatt mit
 * Haarlinien, wie ein Kontoauszug. Jede Zeile ist eine belegte Zahl aus den
 * Werbekonten von WAV Westerstede — keine Beispielwerte.
 */
const euro2 = (n: number) => `${n.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`;

const ergebnis: [string, string][] = [
  ['Werbebudget', euro2(beleg.budget)],
  ['Bewerbungen', String(beleg.bewerbungen)],
  ['davon fachlich brauchbar', beleg.brauchbar],
  ['Anfragen über Google Ads', `${beleg.anfragen} in zweieinhalb Monaten`],
];
const varianten: [string, string][] = [
  ['Günstigste Variante', `${euro2(beleg.guenstig)} je Bewerbung`],
  ['Teuerste Variante', `${beleg.teuer} € je Bewerbung · abgeschaltet`],
];
const entscheidungen = [
  'Drei Varianten gleichzeitig, nach zehn Tagen entschieden',
  'Teure Variante abgeschaltet, Budget umgelegt',
  'Bewerbung in unter 60 Sekunden, ohne Lebenslauf',
  'Jede Bewerbung sofort auf dem Handy des Inhabers',
];

export default function Bericht() {
  return (
    <section className="abschnitt" aria-labelledby="bericht-titel">
      <div className="schale">
        <div className="grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <div className="flex flex-col justify-center">
            <p className="kennung" data-reveal>Auswertung</p>
            <h2 id="bericht-titel" className="t-h1 mt-6" data-split>Jeder Euro bekommt eine Zeile.</h2>
            <p className="t-lead messen mt-7 text-ink-2" data-reveal>
              Ein Dashboard mit vierzig Kennzahlen öffnet niemand. Am Monatsende zählt eine
              Frage: Was hat eine Anfrage gekostet?
            </p>
            <p className="t-body messen mt-5 text-ink-2" data-reveal>
              Deshalb bekommen Sie eine Seite im Monat: was lief, was es gekostet hat, was wir
              abschalten und was wir im nächsten Monat ändern. Konten und Messung laufen auf
              Ihren Namen — Sie sehen dieselben Zahlen wie wir.
            </p>
            <div data-reveal>
              <Link href="/fallstudien/wav-westerstede" className="verweis mt-9">
                Fallstudie ansehen
                <Pfeil />
              </Link>
            </div>
          </div>

          <article className="rounded-[var(--radius-lg)] border border-rule bg-paper-2/60" data-reveal>
            <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule px-5 py-4 md:px-7">
              <h3 className="kennung kennung-ohne text-ink">Auswertung</h3>
              <p className="t-small text-ink-3">WAV Westerstede · Kfz-Werkstatt</p>
            </header>

            <div className="px-5 py-6 md:px-7">
              <Block titel="Budget und Ergebnis" zeilen={ergebnis} />
              <Block titel="Varianten im Test" zeilen={varianten} />

              <section className="mt-7">
                <h4 className="kennung kennung-ohne">Entscheidungen</h4>
                <ul className="mt-3 flex flex-col gap-2">
                  {entscheidungen.map((e) => (
                    <li key={e} className="t-small flex gap-3">
                      <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0" style={{ background: 'var(--accent)' }} />
                      {e}
                    </li>
                  ))}
                </ul>
              </section>

              <Block titel="Ergebnis" zeilen={[['Vertrag unterschrieben', `nach ${beleg.tage} Tagen`]]} />
            </div>

            <footer className="border-t border-rule px-5 py-3.5 md:px-7">
              <p className="t-small text-ink-3">Werte aus den Werbekonten, für diese Seite zusammengefasst.</p>
            </footer>
          </article>
        </div>
      </div>
    </section>
  );
}

function Block({ titel, zeilen }: { titel: string; zeilen: [string, string][] }) {
  return (
    <section className="mt-7 first:mt-0">
      <h4 className="kennung kennung-ohne">{titel}</h4>
      <dl className="mt-3">
        {zeilen.map(([name, wert]) => (
          <div key={name} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5 border-b border-dotted border-rule-2 py-2.5 last:border-b-0">
            <dt className="t-small">{name}</dt>
            <dd className="t-small font-semibold">{wert}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
