import { beleg } from '@/lib/inhalt';

const zahlen = [
  { wert: beleg.budget, nach: 2, einheit: ' €', label: 'Werbebudget' },
  { wert: beleg.bewerbungen, nach: 0, einheit: '', label: 'Bewerbungen' },
  { wert: 0, nach: 0, einheit: '', label: 'davon brauchbar', text: beleg.brauchbar },
  { wert: beleg.tage, nach: 0, einheit: ' Tage', label: 'bis zur Unterschrift' },
];

export default function Beweisband() {
  return (
    <section className="pt-20 sm:pt-28">
      <div className="schale">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
          <p className="kennung kennung-strich" data-reveal>Ein Fall, vollständig belegt</p>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink-3" data-reveal>
            WAV Westerstede · Kfz-Werkstatt
          </p>
        </div>

        <ul className="grid grid-cols-2 md:grid-cols-4" data-fokus="Aus dem Werbekonto">
          {zahlen.map((z, i) => (
            <li
              key={z.label}
              className="border-b border-rule py-7 pr-4 md:border-b-0 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-rule md:[&:not(:first-child)]:pl-6"
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 80}ms` }}
            >
              <p className="text-[length:var(--text-4xl)] font-extrabold leading-none tracking-[-0.045em]">
                {z.text ? (
                  <span>{z.text}</span>
                ) : (
                  <>
                    <span data-zahl={z.wert} data-nachkomma={z.nach}>0</span>
                    {z.einheit}
                  </>
                )}
              </p>
              <span
                className="mt-4 block h-px w-full origin-left"
                style={{ background: 'var(--accent)', ['--reveal-delay' as string]: `${i * 80 + 120}ms` }}
                data-draw
                aria-hidden="true"
              />
              <p className="mt-3 max-w-[16ch] text-sm text-ink-3">{z.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
