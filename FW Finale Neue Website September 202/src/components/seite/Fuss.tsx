import Link from 'next/link';
import Pfeil from '@/components/ui/Pfeil';
import Zeichen from '@/components/ui/Zeichen';
import { cta, marke, navigation } from '@/lib/inhalt';

/**
 * Fußzeile, aufgebaut wie in der Gartenzwerg-Präsentation: links die Marke
 * mit einem Satz, was wir tun, rechts drei Spalten, darunter das Gebiet und
 * die Rechtszeile. Der untere Abstand auf dem Handy hält Platz für die
 * Anrufleiste frei.
 */
const unternehmen = [
  { titel: 'Fallstudie WAV', pfad: '/fallstudien/wav-westerstede' },
  { titel: 'Kontakt', pfad: '/kontakt' },
  { titel: 'Impressum', pfad: '/impressum' },
  { titel: 'Datenschutz', pfad: '/datenschutz' },
];

const linkKlasse = 't-small text-ink-2 underline-offset-4 transition-colors hover:text-ink hover:underline';

export default function Fuss() {
  return (
    <footer className="band pb-28 md:pb-0">
      <div className="schale">
        <div className="grid gap-14 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div className="flex flex-col">
            <Link href="/" className="flex items-center gap-3 self-start" aria-label="Fokuswerk, zur Startseite">
              <Zeichen groesse={34} />
              <span className="text-[1.9rem] font-extrabold tracking-[-0.04em] md:text-[2.2rem]">Fokuswerk</span>
            </Link>
            <span aria-hidden="true" className="mt-5 block h-[2px] w-10" style={{ background: 'var(--brand)' }} />
            <p className="t-small mt-4 font-semibold">Performance Marketing für Handwerk und Technik.</p>
            <p className="t-small messen mt-6 text-ink-3">
              Kampagnen für Neukunden und Mitarbeiter — selbst gedreht, selbst geschaltet, jeden
              Monat gemessen. Aus Oldenburg, für Betriebe im Nordwesten.
            </p>
            <Link href={cta.ziel} className="verweis mt-8 self-start">
              {cta.text}
              <Pfeil />
            </Link>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <nav aria-label="Fußzeile — Angebot">
              <h2 className="kennung kennung-ohne">Angebot</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {navigation.map((n) => (
                  <li key={n.pfad}><Link href={n.pfad} className={linkKlasse}>{n.titel}</Link></li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Fußzeile — Unternehmen">
              <h2 className="kennung kennung-ohne">Unternehmen</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {unternehmen.map((n) => (
                  <li key={n.pfad}><Link href={n.pfad} className={linkKlasse}>{n.titel}</Link></li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="kennung kennung-ohne">Kontakt</h2>
              <address className="mt-5 flex flex-col gap-3 not-italic">
                <a href={`tel:${marke.telefon}`} className={linkKlasse}>{marke.telefonText}</a>
                <a href={`mailto:${marke.mail}`} className={linkKlasse}>{marke.mail}</a>
                <span className="t-small text-ink-3">{marke.strasse}<br />{marke.plz} {marke.ort}</span>
                <span className="flex gap-4">
                  <a href={marke.instagram} className={linkKlasse} rel="noopener">Instagram</a>
                  <a href={marke.linkedin} className={linkKlasse} rel="noopener">LinkedIn</a>
                </span>
              </address>
            </div>
          </div>
        </div>

        <div className="border-t border-rule py-8">
          <h2 className="kennung kennung-ohne">Einsatzgebiet</h2>
          <p className="t-small mt-4 max-w-4xl text-ink-3">
            Nordwest-Niedersachsen · Betriebe in Oldenburg, Westerstede und Bad Zwischenahn
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-rule py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-small text-ink-3">© {new Date().getFullYear()} {marke.firma}</p>
          <p className="t-small text-ink-3">{marke.strasse} · {marke.plz} {marke.ort}</p>
        </div>
      </div>
    </footer>
  );
}
