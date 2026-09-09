import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';

export default function NichtGefunden() {
  return (
    <section className="pt-32 pb-28 sm:pt-44">
      <div className="schale">
        <div className="mx-auto max-w-[38rem] text-center">
          <p className="kennung justify-center">Fehler 404</p>
          <h1 className="mt-6 text-[length:var(--text-4xl)]">
            Diese Seite gibt es <span className="kursiv">nicht</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-[36ch] text-[length:var(--text-lg)] text-ink-2">
            Vielleicht ist sie umgezogen, vielleicht hat sich ein Tippfehler
            eingeschlichen.
          </p>
          <Link href="/" className="akt mt-9">
            Zur Startseite
            <Pfeil />
          </Link>
        </div>
      </div>
    </section>
  );
}
