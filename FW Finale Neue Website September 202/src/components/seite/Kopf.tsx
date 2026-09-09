'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cta, marke, navigation } from '@/lib/inhalt';
import Pfeil from '@/components/ui/Pfeil';

export default function Kopf() {
  const [gescrollt, setGescrollt] = useState(false);
  const [ueberBand, setUeberBand] = useState(false);
  const [offen, setOffen] = useState(false);

  // Die Leiste schwebt über dem Inhalt. Liegt unter ihr ein dunkles Band,
  // kehrt sie dieselben Farbvariablen um wie das Band selbst — sonst steht
  // eine weiße Kachel auf schwarzem Grund.
  useEffect(() => {
    let laeuft = false;
    const messen = () => {
      laeuft = false;
      setGescrollt(window.scrollY > 16);
      const baender = document.querySelectorAll<HTMLElement>('.band');
      const linie = 52; // Mitte der Leiste
      let drin = false;
      for (const b of baender) {
        const r = b.getBoundingClientRect();
        if (r.top <= linie && r.bottom >= linie) { drin = true; break; }
      }
      setUeberBand(drin);
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

  useEffect(() => {
    document.body.classList.toggle('menue-offen', offen);
    const aufTaste = (e: KeyboardEvent) => e.key === 'Escape' && setOffen(false);
    window.addEventListener('keydown', aufTaste);
    return () => window.removeEventListener('keydown', aufTaste);
  }, [offen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 pointer-events-none${ueberBand && !offen ? ' kopf-dunkel' : ''}`}
        style={{ paddingTop: gescrollt ? '0.6rem' : '1.1rem', transition: 'padding-top .5s var(--ease-out)' }}
      >
        <div className="schale">
          {/* Schwebende Leiste statt Bandkante: sie sitzt auf der Seite, nicht
              davor — deshalb Radius, Rand und ein Grund, der erst beim Scrollen
              deckt. */}
          <div
            className="pointer-events-auto flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2 sm:px-4"
            style={{
              background: gescrollt ? 'color-mix(in srgb, var(--color-paper) 82%, transparent)' : 'transparent',
              backdropFilter: gescrollt ? 'blur(18px) saturate(1.4)' : 'none',
              WebkitBackdropFilter: gescrollt ? 'blur(18px) saturate(1.4)' : 'none',
              border: `1px solid ${gescrollt ? 'var(--color-rule)' : 'transparent'}`,
              boxShadow: gescrollt ? 'var(--shadow-lift)' : 'none',
              transition: 'background .5s var(--ease-out), border-color .5s var(--ease-out), box-shadow .5s var(--ease-out)',
            }}
          >
            <Link href="/" className="flex items-center gap-2.5 pr-2" aria-label="Fokuswerk, zur Startseite">
              <Zeichen />
              <span className="text-[1.05rem] font-bold tracking-[-0.035em]">Fokuswerk</span>
            </Link>

            <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Hauptmenü">
              {navigation.map((n) => (
                <Link
                  key={n.pfad}
                  href={n.pfad}
                  className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
                >
                  {n.titel}
                </Link>
              ))}
            </nav>

            <a
              href={`tel:${marke.telefon}`}
              className="ml-auto hidden items-center gap-2 px-3 py-2 text-sm font-semibold md:ml-2 md:flex"
            >
              <Hoerer />
              <span className="font-mono tracking-[-0.01em]">{marke.telefonText}</span>
            </a>

            <Link href={cta.ziel} className="akt ml-auto !py-2.5 !px-4 text-[0.82rem] md:ml-0">
              Gespräch
              <Pfeil groesse={12} />
            </Link>

            <button
              type="button"
              className="grid h-10 w-10 place-items-center md:hidden"
              aria-expanded={offen}
              aria-controls="mobilmenue"
              onClick={() => setOffen((o) => !o)}
            >
              <span className="nur-sr">{offen ? 'Menü schließen' : 'Menü öffnen'}</span>
              <span className="relative block h-[11px] w-[22px]" aria-hidden="true">
                <span
                  className="absolute left-0 h-[1.5px] w-full bg-current"
                  style={{
                    top: 0,
                    transform: offen ? 'translateY(4.75px) rotate(45deg)' : 'none',
                    transition: 'transform .45s var(--ease-out)',
                  }}
                />
                <span
                  className="absolute left-0 h-[1.5px] w-full bg-current"
                  style={{
                    bottom: 0,
                    transform: offen ? 'translateY(-4.75px) rotate(-45deg)' : 'none',
                    transition: 'transform .45s var(--ease-out)',
                  }}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobiles Menü */}
      <div
        id="mobilmenue"
        className="fixed inset-0 z-40 md:hidden"
        hidden={!offen}
        style={{
          background: 'color-mix(in srgb, var(--color-paper) 92%, transparent)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <nav className="schale flex h-full flex-col justify-end gap-1 pb-10 pt-28" aria-label="Menü">
          {navigation.map((n, i) => (
            <Link
              key={n.pfad}
              href={n.pfad}
              onClick={() => setOffen(false)}
              className="border-b border-rule py-4 text-[2rem] font-bold tracking-[-0.04em]"
              style={{
                opacity: offen ? 1 : 0,
                transform: offen ? 'none' : 'translateY(14px)',
                transition: `opacity .6s var(--ease-out) ${i * 60 + 80}ms, transform .6s var(--ease-out) ${i * 60 + 80}ms`,
              }}
            >
              {n.titel}
            </Link>
          ))}
          <a href={`tel:${marke.telefon}`} className="mt-6 font-mono text-lg font-medium">
            {marke.telefonText}
          </a>
          <a href={`mailto:${marke.mail}`} className="text-sm text-ink-2">{marke.mail}</a>
        </nav>
      </div>
    </>
  );
}

/** Bildmarke: Blende. Fokus + Werk in einem Zeichen. */
function Zeichen() {
  return (
    <span
      className="grid h-8 w-8 place-items-center rounded-[9px]"
      style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
      aria-hidden="true"
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
        <path d="M3 7V3h4M17 7V3h-4M3 13v4h4M17 13v4h-4" />
        <rect x="8.6" y="8.6" width="2.8" height="2.8" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

function Hoerer() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M5.2 2.5 6.8 5.6 5.3 7c.7 1.5 2.2 3 3.7 3.7l1.4-1.5 3.1 1.6-.6 2.4c-.2.6-.8 1-1.4.9C7.1 13.5 2.5 8.9 1.9 3.5c-.1-.6.3-1.2.9-1.4l2.4-.6z" />
    </svg>
  );
}
