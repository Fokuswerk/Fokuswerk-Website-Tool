'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { schritte } from '@/lib/inhalt';
import Werbekonto from '@/components/geraete/Werbekonto';

/**
 * Die Scroll-Sequenz. Links laufen die Schritte durch, rechts steht ein
 * Rahmen fest und wechselt seinen Inhalt — vom Foto über die Anzeige und die
 * Seite bis zum Werbekonto.
 *
 * Aktiv ist der Schritt, dessen Mitte der Bildschirmmitte am nächsten liegt.
 * Gemessen wird in einer rAF-Schleife, geschaltet wird nur eine Zahl.
 */
export default function Vorgehen() {
  const [aktiv, setAktiv] = useState(0);
  const rahmen = useRef<HTMLDivElement>(null);
  const punkte = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    let laeuft = false;
    const messen = () => {
      laeuft = false;
      const mitte = window.innerHeight * 0.5;
      let bester = 0;
      let kleinster = Infinity;
      punkte.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const abstand = Math.abs(r.top + r.height / 2 - mitte);
        if (abstand < kleinster) { kleinster = abstand; bester = i; }
      });
      setAktiv(bester);
    };
    const planen = () => {
      if (laeuft) return;
      laeuft = true;
      requestAnimationFrame(messen);
    };
    messen();
    window.addEventListener('scroll', planen, { passive: true });
    window.addEventListener('resize', planen);
    return () => {
      window.removeEventListener('scroll', planen);
      window.removeEventListener('resize', planen);
    };
  }, []);

  const anteil = ((aktiv + 1) / schritte.length) * 100;

  return (
    <section id="vorgehen" className="pt-24 sm:pt-36">
      <div className="schale">
        <div className="max-w-[46rem]">
          <p className="kennung kennung-strich" data-reveal>02 — Das Vorgehen</p>
          <h2 className="mt-6 text-[length:var(--text-4xl)]" data-split>
            Fünf Schritte. Danach läuft es <span className="kursiv">monatlich</span>.
          </h2>
          <p className="mt-6 max-w-[46ch] text-[length:var(--text-lg)] leading-[1.55] text-ink-2" data-reveal>
            Ein halber Tag Ihrer Zeit im Monat. Den Rest übernehmen wir — und
            zeigen Ihnen am Monatsende, was dabei herausgekommen ist.
          </p>
        </div>

        <div ref={rahmen} className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          {/* Schritte */}
          <ol className="relative">
            {/* Fortschrittsschiene */}
            <span
              className="absolute left-[7px] top-2 bottom-2 hidden w-px sm:block"
              style={{ background: 'var(--color-rule-2)' }}
              aria-hidden="true"
            />
            <span
              className="absolute left-[7px] top-2 hidden w-px sm:block"
              style={{
                height: `calc(${anteil}% - 1rem)`,
                background: 'var(--accent)',
                transition: 'height .6s var(--ease-out)',
              }}
              aria-hidden="true"
            />

            {schritte.map((s, i) => {
              const ist = i === aktiv;
              return (
                <li
                  key={s.nr}
                  ref={(el) => { punkte.current[i] = el; }}
                  className="relative py-8 sm:pl-10"
                >
                  <span
                    className="absolute left-0 top-[2.45rem] hidden h-[15px] w-[15px] rounded-full sm:block"
                    style={{
                      background: ist ? 'var(--accent)' : 'var(--color-paper)',
                      border: `1px solid ${ist ? 'var(--accent)' : 'var(--color-rule-2)'}`,
                      transform: ist ? 'scale(1)' : 'scale(0.72)',
                      transition: 'background .45s var(--ease-out), transform .45s var(--ease-out), border-color .45s',
                    }}
                    aria-hidden="true"
                  />
                  <p
                    className="font-mono text-[0.64rem] uppercase tracking-[0.16em]"
                    style={{ color: ist ? 'var(--accent)' : 'var(--color-ink-3)', transition: 'color .4s' }}
                  >
                    {s.nr} — {s.marke}
                  </p>
                  <h3
                    className="mt-2.5 text-[length:var(--text-xl)] font-bold tracking-[-0.03em]"
                    style={{
                      color: ist ? 'var(--color-ink)' : 'var(--color-ink-3)',
                      transition: 'color .5s var(--ease-out)',
                    }}
                  >
                    {s.titel}
                  </h3>
                  <p
                    className="mt-2.5 max-w-[46ch] text-[0.98rem] leading-[1.62]"
                    style={{
                      color: ist ? 'var(--color-ink-2)' : 'var(--color-ink-3)',
                      transition: 'color .5s var(--ease-out)',
                    }}
                  >
                    {s.text}
                  </p>

                  <div className="geraet relative mt-6 aspect-[4/3] w-full lg:hidden">
                    <Inhalt art={s.art} bild={s.bild} marke={s.marke} />
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Feststehender Rahmen */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div className="schein">
                <div className="geraet aspect-[4/5] w-full" data-fokus="Der Ablauf, Schritt für Schritt">
                  {schritte.map((s, i) => (
                    <div
                      key={s.nr}
                      className="absolute inset-0"
                      style={{
                        opacity: i === aktiv ? 1 : 0,
                        transform: i === aktiv ? 'none' : 'scale(1.03)',
                        transition: 'opacity .7s var(--ease-out), transform 1.2s var(--ease-out)',
                        pointerEvents: i === aktiv ? 'auto' : 'none',
                      }}
                      aria-hidden={i !== aktiv}
                    >
                      <Inhalt art={s.art} bild={s.bild} marke={s.marke} />
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-center font-mono text-[0.64rem] uppercase tracking-[0.16em] text-ink-3">
                Schritt {schritte[aktiv].nr} von 05
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Inhalt({ art, bild, marke }: { art: string; bild: string; marke: string }) {
  if (art === 'konto') {
    return (
      <div className="grid h-full content-center gap-5 p-6" style={{ background: 'var(--color-night-2)' }}>
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/45">
          Tag 10 · die Entscheidung
        </p>
        <Werbekonto />
      </div>
    );
  }

  if (art === 'telefon') {
    return (
      <div className="grid h-full place-items-center p-8" style={{ background: 'var(--color-night-2)' }}>
        <div className="relative w-[11rem] overflow-hidden rounded-[1.4rem] border-[5px] border-[#0c0f14]"
             style={{ boxShadow: 'var(--shadow-deep)' }}>
          <div className="relative aspect-[9/18]">
            <Image src={`/bilder/${bild}.jpg`} alt="" fill sizes="12rem" className="object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #05070aeb 24%, transparent 62%)' }} />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-[0.62rem] font-bold leading-tight text-white">
                Wir suchen Verstärkung für die Werkstatt.
              </p>
              <span className="mt-1.5 block rounded-[5px] py-1 text-center text-[0.5rem] font-semibold"
                    style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
                Jetzt bewerben
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (art === 'fenster') {
    return (
      <div className="grid h-full place-items-center p-6" style={{ background: 'var(--color-night-2)' }}>
        <div className="w-full overflow-hidden rounded-[var(--radius-md)]" style={{ boxShadow: 'var(--shadow-deep)' }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'var(--color-night-3)' }}>
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="mx-auto font-mono text-[0.55rem] tracking-[0.08em] text-white/45">
              ihr-betrieb.de/karriere
            </span>
          </div>
          <div className="relative aspect-[16/11]">
            <Image src={`/bilder/${bild}.jpg`} alt="" fill sizes="24rem" className="object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #05070ae6 12%, #05070a40 60%)' }} />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="max-w-[16ch] text-[1rem] font-bold leading-tight text-white">
                Schrauben, wo dir keiner reinredet.
              </p>
              <span className="mt-2.5 inline-block rounded-[7px] px-3 py-1.5 text-[0.62rem] font-semibold"
                    style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}>
                In 60 Sekunden bewerben
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Image src={`/bilder/${bild}.jpg`} alt={marke} fill sizes="34rem" className="object-cover" />
      <div className="absolute inset-x-0 bottom-0 p-5"
           style={{ background: 'linear-gradient(to top, #05070ab8, transparent)' }}>
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/80">{marke}</p>
      </div>
    </div>
  );
}
