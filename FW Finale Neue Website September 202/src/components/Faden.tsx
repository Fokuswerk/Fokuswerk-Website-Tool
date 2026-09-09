'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Der rote Faden.
 *
 * Eine Linie läuft von oben nach unten durch die Seite, schlingt sich
 * abwechselnd links und rechts an den Bausteinen vorbei und wird beim
 * Scrollen gezeichnet. Am Ende läuft sie in die Schaltfläche.
 *
 * Ankerpunkte werden im Markup gesetzt:
 *   data-faden="links" | "rechts" | "ziel"
 * „ziel" ist der Schlusspunkt — dort endet der Faden mittig über der
 * Schaltfläche und bekommt einen Knoten.
 *
 * Gerechnet wird nur bei Aufbau und Größenänderung. Beim Scrollen wird eine
 * einzige Zahl geschrieben (strokeDashoffset) plus die Position des Knotens.
 */
export default function Faden() {
  const [pfad, setPfad] = useState('');
  const [hoehe, setHoehe] = useState(0);
  const [an, setAn] = useState(false);
  const linie = useRef<SVGPathElement>(null);
  const knoten = useRef<SVGCircleElement>(null);
  const spanne = useRef({ start: 0, ende: 1 });

  useEffect(() => {
    if (!window.matchMedia('(min-width: 64rem)').matches) return;
    setAn(true);

    let ausgang = 0;

    const bauen = () => {
      const anker = Array.from(document.querySelectorAll<HTMLElement>('[data-faden]'));
      if (anker.length < 2) return;

      const scrollY = window.scrollY;
      const schale = document.querySelector('.schale');
      const sr = schale?.getBoundingClientRect();
      const links = (sr?.left ?? 40) - 30;
      const rechts = (sr?.right ?? window.innerWidth - 40) + 30;

      const punkte = anker.map((el) => {
        const r = el.getBoundingClientRect();
        const seite = el.dataset.faden;
        if (seite === 'ziel') {
          return { x: r.left + r.width / 2, y: r.top + scrollY - 26, ziel: true };
        }
        return {
          x: seite === 'links'
            ? Math.max(26, links)
            : Math.min(window.innerWidth - 26, rechts),
          y: r.top + scrollY + r.height / 2,
          ziel: false,
        };
      }).sort((a, b) => a.y - b.y);

      let d = `M ${punkte[0].x.toFixed(1)} ${punkte[0].y.toFixed(1)}`;
      for (let i = 1; i < punkte.length; i++) {
        const a = punkte[i - 1];
        const b = punkte[i];
        const dy = (b.y - a.y) * 0.42;
        if (b.ziel) {
          // Der Schlussbogen darf nicht senkrecht durch den Absatz über der
          // Schaltfläche fallen. Er bleibt deshalb lange auf seiner Seite und
          // hakt erst kurz vor dem Ziel ein.
          const seite = a.x < b.x ? -1 : 1;
          d += ` C ${a.x.toFixed(1)} ${(a.y + (b.y - a.y) * 0.72).toFixed(1)},` +
               ` ${(b.x + seite * 250).toFixed(1)} ${(b.y - 18).toFixed(1)},` +
               ` ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
        } else {
          d += ` C ${a.x.toFixed(1)} ${(a.y + dy).toFixed(1)}, ${b.x.toFixed(1)} ${(b.y - dy).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
        }
      }

      setPfad(d);
      setHoehe(document.documentElement.scrollHeight);
      spanne.current = { start: punkte[0].y, ende: punkte[punkte.length - 1].y };
      ausgang = 0;
      window.requestAnimationFrame(zeichnen);
    };

    const zeichnen = () => {
      const el = linie.current;
      if (!el) return;
      const laenge = el.getTotalLength();
      if (!laenge) return;
      if (!ausgang) {
        el.style.strokeDasharray = String(laenge);
        ausgang = laenge;
      }

      const { start, ende } = spanne.current;
      const blick = window.scrollY + window.innerHeight * 0.62;
      const p = Math.max(0, Math.min(1, (blick - start) / (ende - start)));

      el.style.strokeDashoffset = String(laenge * (1 - p));

      const k = knoten.current;
      if (k) {
        const pt = el.getPointAtLength(laenge * p);
        k.setAttribute('cx', String(pt.x));
        k.setAttribute('cy', String(pt.y));
        k.style.opacity = p > 0.004 ? '1' : '0';
        k.setAttribute('r', p > 0.985 ? '6' : '4.5');
      }
    };

    let laeuft = false;
    const planen = () => {
      if (laeuft) return;
      laeuft = true;
      requestAnimationFrame(() => { laeuft = false; zeichnen(); });
    };

    // Erst bauen, wenn Schriften und Bilder stehen — sonst wandern die Anker.
    const start = window.setTimeout(bauen, 350);
    window.addEventListener('scroll', planen, { passive: true });
    window.addEventListener('resize', bauen);
    const beobachter = new ResizeObserver(() => bauen());
    beobachter.observe(document.body);

    return () => {
      window.clearTimeout(start);
      window.removeEventListener('scroll', planen);
      window.removeEventListener('resize', bauen);
      beobachter.disconnect();
    };
  }, []);

  if (!an || !pfad) return null;

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block"
      width="100%"
      height={hoehe}
      viewBox={`0 0 ${typeof window !== 'undefined' ? window.innerWidth : 1440} ${hoehe}`}
      preserveAspectRatio="none"
      style={{ overflow: 'visible' }}
    >
      <path
        ref={linie}
        d={pfad}
        fill="none"
        stroke="var(--faden)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'stroke-dashoffset .12s linear' }}
      />
      <circle
        ref={knoten}
        r="4.5"
        fill="var(--faden)"
        style={{ transition: 'opacity .4s var(--ease-out)' }}
      />
    </svg>
  );
}
