import Image from 'next/image';

/**
 * Die Bühne im Titelbereich: ein Browserfenster mit einer Karriereseite und
 * davor ein Telefon mit der Anzeige, die darauf führt.
 *
 * Beides trägt echten Inhalt aus der Produktion — nie eine Skizze und nie
 * erfundene Kennzahlen. Ein Gerät mit Platzhalter darin ist schlimmer als
 * gar keines.
 */
export default function Buehne() {
  return (
    <div className="schein relative mx-auto w-full max-w-[62rem]" style={{ ['--schein-op' as string]: 1 }}>
      <div data-szene className="szene-geraet">
      <div data-tilt="3" className="relative">
        {/* Browserfenster */}
        <div className="geraet streif mx-auto w-full max-w-[54rem]">
          <div className="geraet-leiste">
            <div className="geraet-punkte"><i /><i /><i /></div>
            <div className="geraet-adresse">
              <Schloss />
              wav-westerstede.de/karriere
            </div>
            <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.14em] text-white/35 sm:block">
              Ausgeliefert
            </span>
          </div>

          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0f1319]">
            <Image
              src="/bilder/hero-hoch.jpg"
              alt="Kfz-Werkstatt: ein Mechatroniker arbeitet an einem angehobenen Fahrzeug."
              fill
              sizes="(min-width: 64rem) 54rem, 100vw"
              className="object-cover object-[52%_38%]"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, #05070ae6 8%, #05070a4d 45%, #05070a1a 100%)' }}
            />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/55 sm:text-[0.66rem]">
                Westerstede · seit 1994 · Kfz-Meisterbetrieb
              </p>
              <p className="mt-2 max-w-[18ch] text-[1.35rem] font-bold leading-[1.05] tracking-[-0.035em] text-white sm:text-[2.1rem]">
                Schrauben, wo dir keiner reinredet.
              </p>
              <span
                className="mt-4 inline-flex items-center gap-2 rounded-[10px] px-3.5 py-2 text-[0.72rem] font-semibold sm:text-[0.8rem]"
                style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}
              >
                In 60 Sekunden bewerben
              </span>
            </div>
          </div>
        </div>

        {/* Telefon mit der Anzeige, die auf die Seite führt */}
        <div className="absolute -bottom-8 right-0 hidden w-[9.5rem] sm:block lg:-right-4 lg:w-[11.5rem]">
          <div className="schweben-langsam">
            <div
              className="relative overflow-hidden rounded-[1.6rem] border-[5px] border-[#181d25] bg-[#181d25]"
              style={{ boxShadow: 'var(--shadow-deep)' }}
            >
              <div className="relative aspect-[9/19]">
                <Image
                  src="/bilder/mechatroniker-handy.jpg"
                  alt="Anzeige: ein Mechatroniker in der Werkstatt."
                  fill
                  sizes="12rem"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, #05070aeb 22%, transparent 62%)' }}
                />
                <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 p-2.5">
                  <span className="h-4 w-4 rounded-full bg-white/25" />
                  <span className="font-mono text-[0.42rem] uppercase tracking-[0.12em] text-white/70">
                    wav_westerstede
                  </span>
                  <span className="ml-auto font-mono text-[0.4rem] text-white/45">Gesponsert</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                  <p className="text-[0.6rem] font-bold leading-tight text-white">
                    Wir suchen einen Mechatroniker.
                  </p>
                  <span
                    className="mt-1.5 block rounded-[5px] py-1 text-center text-[0.5rem] font-semibold"
                    style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}
                  >
                    Jetzt bewerben
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function Schloss() {
  return (
    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="2.5" y="5.2" width="7" height="5.3" rx="1.2" />
      <path d="M4.3 5.2V3.9a1.7 1.7 0 0 1 3.4 0v1.3" />
    </svg>
  );
}
