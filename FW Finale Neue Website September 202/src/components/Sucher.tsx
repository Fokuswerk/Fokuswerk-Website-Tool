'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Der Sucher.
 *
 * Vier Eckwinkel liegen fest über der Seite und rasten beim Scrollen auf das
 * Element ein, das gerade in der Bildmitte steht — wie der Autofokus einer
 * Kamera. Das ist das eine Element, das sich durch die ganze Seite zieht: es
 * kommt aus der Bildmarke und aus dem, was wir tun.
 *
 * Regeln, damit es dezent bleibt:
 * - nur auf Zeigergeräten ab 62rem, nie auf dem Handy
 * - nur, solange ein Ziel nah an der Bildmitte steht; sonst blendet er ab
 * - Haarlinien in der Hausfarbe, kein Rahmen, keine Fläche
 * - bei prefers-reduced-motion gar nicht erst gerendert
 */

interface Lage {
  x: number; y: number; b: number; h: number;
  marke: string; dunkel: boolean; sichtbar: boolean;
}

const LEER: Lage = { x: 0, y: 0, b: 0, h: 0, marke: '', dunkel: false, sichtbar: false };

export default function Sucher() {
  const [lage, setLage] = useState<Lage>(LEER);
  const [an, setAn] = useState(false);
  const letzterKey = useRef('');
  const [rastet, setRastet] = useState(false);

  useEffect(() => {
    const passt =
      window.matchMedia('(min-width: 62rem)').matches &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!passt) return;
    setAn(true);

    let laeuft = false;
    let zeitgeber: number | undefined;

    const messen = () => {
      laeuft = false;
      const ziele = Array.from(document.querySelectorAll<HTMLElement>('[data-fokus]'));
      if (!ziele.length) return;

      const mitte = window.innerHeight / 2;
      const grenze = window.innerHeight * 0.42;
      let bester: HTMLElement | null = null;
      let kleinster = Infinity;

      for (const el of ziele) {
        const r = el.getBoundingClientRect();
        if (r.height === 0) continue;
        const abstand = Math.abs(r.top + r.height / 2 - mitte);
        if (abstand < kleinster) { kleinster = abstand; bester = el; }
      }

      if (!bester || kleinster > grenze || document.body.classList.contains('menue-offen')) {
        setLage((v) => (v.sichtbar ? { ...v, sichtbar: false } : v));
        return;
      }

      const r = bester.getBoundingClientRect();
      const rand = 14;
      const marke = bester.dataset.fokus ?? '';
      if (marke !== letzterKey.current) {
        letzterKey.current = marke;
        setRastet(true);
        window.clearTimeout(zeitgeber);
        zeitgeber = window.setTimeout(() => setRastet(false), 420);
      }

      setLage({
        x: Math.round(r.left - rand),
        y: Math.round(r.top - rand),
        b: Math.round(r.width + rand * 2),
        h: Math.round(r.height + rand * 2),
        marke,
        dunkel: Boolean(bester.closest('.band')),
        sichtbar: true,
      });
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
      window.clearTimeout(zeitgeber);
    };
  }, []);

  if (!an) return null;

  const farbe = lage.dunkel ? 'var(--brand-lit)' : 'var(--brand-deep)';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-30"
      style={{
        transform: `translate3d(${lage.x}px, ${lage.y}px, 0)`,
        width: lage.b,
        height: lage.h,
        opacity: lage.sichtbar ? 1 : 0,
        transition:
          'transform .75s var(--ease-out), width .75s var(--ease-out), height .75s var(--ease-out), opacity .45s var(--ease-out)',
        willChange: 'transform, width, height',
      }}
    >
      {/* Vier Eckwinkel. Beim Einrasten ziehen sie sich kurz zusammen. */}
      {(['lo', 'ro', 'lu', 'ru'] as const).map((ecke) => (
        <span
          key={ecke}
          className="absolute block h-[20px] w-[20px]"
          style={{
            [ecke.startsWith('l') ? 'left' : 'right']: 0,
            [ecke.endsWith('o') ? 'top' : 'bottom']: 0,
            borderTop: ecke.endsWith('o') ? `1px solid ${farbe}` : undefined,
            borderBottom: ecke.endsWith('u') ? `1px solid ${farbe}` : undefined,
            borderLeft: ecke.startsWith('l') ? `1px solid ${farbe}` : undefined,
            borderRight: ecke.startsWith('r') ? `1px solid ${farbe}` : undefined,
            transform: rastet ? 'scale(1.5)' : 'scale(1)',
            transformOrigin: `${ecke.startsWith('l') ? 'left' : 'right'} ${ecke.endsWith('o') ? 'top' : 'bottom'}`,
            transition: 'transform .42s var(--ease-out)',
            opacity: 0.85,
          }}
        />
      ))}

      {/* Kennung wie im Kamerasucher */}
      <span
        className="absolute left-0 top-full mt-2 whitespace-nowrap font-mono text-[0.58rem] uppercase tracking-[0.18em]"
        style={{
          color: farbe,
          opacity: lage.sichtbar && !rastet ? 0.8 : 0,
          transition: 'opacity .5s var(--ease-out) .15s',
        }}
      >
        {lage.marke}
      </span>
    </div>
  );
}
