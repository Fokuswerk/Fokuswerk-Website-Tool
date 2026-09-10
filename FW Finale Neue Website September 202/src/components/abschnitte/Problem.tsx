import { rechnung, schmerzen } from '@/lib/inhalt';

/**
 * Das Problem, in den Worten des Inhabers. Vier Sätze, überfliegbar; jedes
 * Zeichen ist nur der Anker fürs Auge. Darunter die eine Zahl — dieselbe
 * Rechengröße wie im Rechner weiter unten.
 */
const jahr = rechnung.stundenJahr * rechnung.satzStandard;
const monatRund = Math.round(jahr / 12 / 100) * 100;

export default function Problem() {
  return (
    <section id="problem" className="abschnitt" aria-labelledby="problem-titel">
      <div className="schale">
        <div className="max-w-3xl">
          <p className="kennung" data-reveal>Das eigentliche Problem</p>
          <h2 id="problem-titel" className="t-h1 mt-6" data-split>
            Werbung ist nicht das Problem. Dass sie niemand dauerhaft macht, schon.
          </h2>
        </div>

        <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {schmerzen.map((s, i) => (
            <li key={s.zitat} data-reveal style={{ ['--reveal-delay' as string]: `${i * 90}ms` }}>
              <Symbol name={s.zeichen} />
              <p className="t-h3 mt-6 border-t border-rule pt-6 text-[1.25rem] leading-snug">„{s.zitat}“</p>
              <p className="t-small mt-3 text-ink-2">{s.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-16 border-l-2 pl-6 md:pl-8" style={{ borderColor: 'var(--accent)' }} data-reveal>
          <p className="t-num text-[2.6rem] leading-none md:text-[3.4rem]">
            {jahr.toLocaleString('de-DE')} € im Jahr
          </p>
          <p className="t-lead messen mt-4 text-ink-2">
            erwirtschaftet eine Fachkraft in einer Werkstatt: {rechnung.stundenJahr.toLocaleString('de-DE')} verrechnete
            Stunden zu {rechnung.satzStandard} €. Jeder Monat, in dem die Stelle leer bleibt, kostet
            rund {monatRund.toLocaleString('de-DE')} €.
          </p>
          <p className="t-small mt-3 text-ink-3">
            Branchenwerte für freie Werkstätten im ländlichen Raum, Stand 2026. Ihre eigene Zahl
            rechnen Sie weiter unten aus.
          </p>
        </div>
      </div>
    </section>
  );
}

/** Vier Haarlinienzeichen im 32er-Raster, kein Icon-Set. */
function Symbol({ name }: { name: string }) {
  const pfade: Record<string, React.ReactNode> = {
    uhr: (<><circle cx="16" cy="16" r="11" /><path d="M16 10v6.5l4.2 2.6" /></>),
    schleife: (<><path d="M25 16a9 9 0 1 1-2.64-6.36" /><path d="M25.2 6.5v4.8h-4.8" /></>),
    werkzeug: (<path d="M20.5 5.5a6 6 0 0 0-5.7 7.9L5.9 22.3a2.1 2.1 0 0 0 0 3l.8.8a2.1 2.1 0 0 0 3 0l8.9-8.9a6 6 0 0 0 7.9-5.7l-3.4 3.4-3.6-1-1-3.6 3.4-3.4a6 6 0 0 0-1.4-.4z" />),
    kamera: (<><rect x="4" y="10" width="17" height="13" rx="2" /><path d="m21 14.5 7-4v12l-7-4" /><path d="M5 6l22 21" /></>),
  };
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ color: 'var(--accent)' }}
    >
      {pfade[name]}
    </svg>
  );
}
