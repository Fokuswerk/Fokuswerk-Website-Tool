import type { Metadata } from 'next';
import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import { marke } from '@/lib/inhalt';

export const metadata: Metadata = {
  title: 'Anfrage eingegangen',
  robots: { index: false, follow: false },
};

export default function Danke() {
  return (
    <section className="pt-32 pb-28 sm:pt-44">
      <div className="schale">
        <div className="mx-auto max-w-[40rem] text-center">
          <p className="kennung justify-center">Eingegangen</p>
          <h1 className="mt-6 text-[length:var(--text-4xl)]">
            Wir melden uns innerhalb eines <span className="kursiv">Werktags</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-[40ch] text-[length:var(--text-lg)] leading-[1.55] text-ink-2">
            Falls es schneller gehen soll, rufen Sie einfach an — werktags zwischen
            8 und 18 Uhr sind wir erreichbar.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={`tel:${marke.telefon}`} className="akt w-full sm:w-auto">{marke.telefonText}</a>
            <Link href="/fallstudien/wav-westerstede" className="akt akt-still w-full sm:w-auto">
              Fallstudie ansehen
              <Pfeil />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
