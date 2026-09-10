'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { monat } from '@/lib/inhalt';

/**
 * Der Monat — gepinnte Scroll-Sequenz, gebaut wie das Gartenjahr der
 * Gartenzwerg-Präsentation: vier gleich lange Abschnitte, die Bilder
 * überblenden stufenlos mit der Scrollposition, ein sehr langsamer Zoom hält
 * das Bild in Bewegung, die Markierung rastet auf der Woche ein.
 *
 * Geschrieben wird direkt ins DOM; React erfährt nur den Abschnittswechsel.
 * Kein Scroll-Hijacking — der Browser scrollt normal, gelesen wird nur die
 * Position. Deshalb gibt es hier keine data-reveal-Elemente: die Aufbau-
 * Engine rechnet mit Dokumentpositionen, die in einem gepinnten Bereich
 * nicht stimmen.
 */
const SCHRITT = 0.9;
const klemmen = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export default function Monat() {
  const huelle = useRef<HTMLElement>(null);
  const zoom = useRef<HTMLDivElement>(null);
  const ebenen = useRef<(HTMLDivElement | null)[]>([]);
  const [aktiv, setAktiv] = useState(0);

  useEffect(() => {
    const el = huelle.current;
    if (!el) return;
    const ruhe = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let bild = 0;

    const zeichnen = () => {
      bild = 0;
      const r = el.getBoundingClientRect();
      const strecke = r.height - window.innerHeight;
      if (strecke <= 0) return;
      const fortschritt = klemmen(-r.top / strecke);
      const n = monat.length;
      const pos = klemmen(fortschritt * n - 0.5, 0, n - 1);
      const naechster = Math.min(n - 1, Math.floor(fortschritt * n));
      ebenen.current.forEach((k, i) => {
        if (!k) return;
        k.style.opacity = String(ruhe ? (i === naechster ? 1 : 0) : klemmen(1 - Math.abs(pos - i)));
      });
      if (zoom.current && !ruhe) zoom.current.style.transform = `scale(${1 + fortschritt * 0.05})`;
      setAktiv((alt) => (alt === naechster ? alt : naechster));
    };
    const planen = () => { if (!bild) bild = requestAnimationFrame(zeichnen); };

    zeichnen();
    window.addEventListener('scroll', planen, { passive: true });
    window.addEventListener('resize', planen);
    return () => {
      if (bild) cancelAnimationFrame(bild);
      window.removeEventListener('scroll', planen);
      window.removeEventListener('resize', planen);
    };
  }, []);

  /** Springt an die Scrollposition, an der die gewünschte Woche steht. */
  const springen = useCallback((i: number) => {
    const el = huelle.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const oben = r.top + window.scrollY;
    const strecke = r.height - window.innerHeight;
    window.scrollTo({ top: oben + ((i + 0.5) / monat.length) * strecke, behavior: 'smooth' });
  }, []);

  const jetzt = monat[aktiv];

  return (
    <section
      ref={huelle}
      aria-labelledby="monat-titel"
      className="band relative"
      style={{ height: `calc(100svh + ${(monat.length - 1) * SCHRITT * 100}svh)` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          ref={zoom}
          aria-hidden="true"
          className="absolute inset-0 will-change-transform [filter:saturate(0.78)_contrast(1.04)]"
        >
          {monat.map((m, i) => (
            <div
              key={m.id}
              ref={(k) => { ebenen.current[i] = k; }}
              className="absolute inset-0"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <Image src={`/bilder/${m.bild}.jpg`} alt="" fill sizes="100vw" className="object-cover" />
            </div>
          ))}
        </div>
        <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0c0f14 0%, #0c0f14bf 48%, #0c0f1459 100%)' }} />
        <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(to right, #0c0f14c7 0%, #0c0f1400 62%)' }} />

        <div className="relative flex h-full flex-col justify-between">
          <div className="schale pt-20 md:pt-28">
            <p className="kennung text-ink-2">Der Monat</p>
            <h2 id="monat-titel" className="t-h1 mt-5 max-w-[13ch]">
              Vier Wochen, in denen jemand zuständig ist.
            </h2>
          </div>

          <div className="schale">
            <div key={jetzt.id} className="monat-ein grid gap-5 pb-6 md:grid-cols-[0.9fr_1.1fr] md:items-end md:gap-14">
              <div>
                <p className="kennung kennung-ohne" style={{ color: 'var(--brand)' }}>
                  {jetzt.woche}
                  <span className="ml-3 text-ink-2">{jetzt.phase}</span>
                </p>
                <h3 className="t-h2 mt-4 max-w-[15ch]">{jetzt.titel}</h3>
              </div>
              <div>
                <p className="t-body messen text-ink-2">{jetzt.notiz}</p>
                {/* Auf dem Handy reicht der Satz — mit der Liste passt der gepinnte
                    Bildschirm nicht mehr auf 100svh. */}
                <ul className="mt-5 hidden gap-x-10 gap-y-2 sm:grid sm:grid-cols-2">
                  {jetzt.arbeit.map((a) => (
                    <li key={a} className="t-small flex items-start gap-2.5 text-ink-2">
                      <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0" style={{ background: 'var(--brand)' }} />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Wochenleiste. Der untere Abstand hält sie auf dem Handy über der
              Anrufleiste frei. */}
          <div className="schale pb-28 md:pb-14">
            <div role="tablist" aria-label="Woche im Monat wählen" className="relative border-t border-rule-2">
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 h-[2px] w-1/4 transition-transform duration-700 ease-[var(--ease-out)]"
                style={{ background: 'var(--brand)', transform: `translateX(${aktiv * 100}%)` }}
              />
              <div className="grid grid-cols-4">
                {monat.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={i === aktiv}
                    onClick={() => springen(i)}
                    className="group flex min-h-11 items-end justify-center pt-3.5 pb-1"
                  >
                    <span
                      className={`text-[0.7rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-500 sm:text-[0.76rem] ${
                        i === aktiv ? 'text-ink' : 'text-ink-3 group-hover:text-ink'
                      }`}
                    >
                      {m.woche}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-6">
              <p className="t-small text-ink-2">
                {jetzt.phase} · {aktiv + 1} von {monat.length}
              </p>
              <p
                className={`t-small hidden items-center gap-2 text-ink-2 transition-opacity duration-500 sm:flex ${
                  aktiv === monat.length - 1 ? 'opacity-0' : 'opacity-100'
                }`}
              >
                Weiterscrollen
                <svg viewBox="0 0 16 16" fill="none" className="schubs h-3.5 w-3.5" aria-hidden="true">
                  <path d="M8 1v13m0 0-4.8-4.8M8 14l4.8-4.8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
                </svg>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
