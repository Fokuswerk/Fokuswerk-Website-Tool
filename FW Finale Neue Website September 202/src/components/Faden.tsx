'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Der rote Faden.
 *
 * Läuft von oben nach unten durch die Seite, schlingt sich an den Bausteinen
 * vorbei, kreist einzelne Zahlen ein und hakt an den Schaltflächen ein.
 *
 * Anker im Markup:
 *   data-faden="links" | "rechts"   — Wegpunkt neben dem Baustein
 *   data-faden="kreis"              — der Faden umrundet das Element einmal
 *   data-faden="ziel"               — er hakt waagerecht auf der Fläche ein
 *
 * Zwei Dinge, die vorher falsch waren und den Aufwand hier erklären:
 *
 * 1. Der Kopf hing hinterher. Der Fortschritt wurde aus der Y-Achse berechnet
 *    und auf die Bogenlänge angewendet — beide laufen aber nicht gleich, weil
 *    ein weiter Bogen viel Länge auf wenig Höhe verbraucht. Jetzt liegt eine
 *    Tabelle (Länge → Y) vor, in der die passende Länge gesucht wird.
 * 2. Er lag vor dem Text. Jetzt liegt er auf z-index -1, und die dunklen
 *    Bänder tragen ihren Grund auf einem eigenen Element dahinter.
 */

type Art = 'links' | 'rechts' | 'kreis' | 'ziel';
interface Punkt { x: number; y: number; art: Art; rx?: number; ry?: number }

export default function Faden() {
  const [pfad, setPfad] = useState('');
  const [masse, setMasse] = useState({ b: 0, h: 0 });
  const [an, setAn] = useState(false);
  const linie = useRef<SVGPathElement>(null);
  const knoten = useRef<SVGCircleElement>(null);
  const tabelle = useRef<{ l: number; y: number }[]>([]);
  const zeichnenRef = useRef<(() => void) | null>(null);
  const tabelleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!window.matchMedia('(min-width: 64rem)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setAn(true);

    const bauen = () => {
      const anker = Array.from(document.querySelectorAll<HTMLElement>('[data-faden]'));
      if (anker.length < 2) return;

      const oben = window.scrollY;
      const schale = document.querySelector('.schale');
      const sr = schale?.getBoundingClientRect();
      const xLinks = Math.max(30, (sr?.left ?? 40) - 34);
      const xRechts = Math.min(window.innerWidth - 30, (sr?.right ?? window.innerWidth - 40) + 34);

      const punkte: Punkt[] = anker.map((el) => {
        const r = el.getBoundingClientRect();
        const art = (el.dataset.faden ?? 'links') as Art;
        if (art === 'ziel') return { x: r.left + r.width / 2, y: r.top + oben - 24, art };
        if (art === 'kreis') {
          const rx = r.width / 2 + 24;
          const ry = r.height / 2 + 20;
          return { x: r.left + r.width / 2 - rx, y: r.top + oben + r.height / 2, art, rx, ry };
        }
        return { x: art === 'links' ? xLinks : xRechts, y: r.top + oben + r.height / 2, art };
      }).sort((a, b) => a.y - b.y);

      let d = `M ${f(punkte[0].x)} ${f(punkte[0].y)}`;
      for (let i = 1; i < punkte.length; i++) {
        const a = punkte[i - 1];
        const b = punkte[i];

        if (b.art === 'ziel') {
          // Nicht senkrecht durch den Absatz über der Fläche fallen: lange auf
          // der eigenen Seite bleiben, dann waagerecht einhaken.
          // Lange auf der eigenen Seite bleiben und erst flach einschwenken —
          // sonst faellt der Bogen mitten durch den Absatz über der Fläche.
          const seite = a.x < b.x ? -1 : 1;
          d += ` C ${f(a.x)} ${f(a.y + (b.y - a.y) * 0.86)},` +
               ` ${f(b.x + seite * 430)} ${f(b.y - 8)},` +
               ` ${f(b.x)} ${f(b.y)}`;
          continue;
        }

        const dy = (b.y - a.y) * 0.42;
        d += ` C ${f(a.x)} ${f(a.y + dy)}, ${f(b.x)} ${f(b.y - dy)}, ${f(b.x)} ${f(b.y)}`;

        if (b.art === 'kreis' && b.rx && b.ry) {
          // Einmal herum und zurück auf den Eintrittspunkt — die Geste, mit
          // der man auf Papier etwas einkreist.
          const cx = b.x + b.rx;
          d += ` A ${f(b.rx)} ${f(b.ry)} 0 1 1 ${f(cx + b.rx)} ${f(b.y)}`;
          d += ` A ${f(b.rx)} ${f(b.ry)} 0 1 1 ${f(b.x)} ${f(b.y)}`;
        }
      }

      setPfad(d);
      setMasse({ b: window.innerWidth, h: document.documentElement.scrollHeight });
    };

    // Länge → Y. Damit laesst sich zu jeder Bildhöhe die passende Bogenlänge
    // finden, statt beide Achsen gleichzusetzen.
    // (wird vom Pfad-Effekt weiter unten aufgerufen)
    const tabelleBauen = () => {
      const el = linie.current;
      if (!el) return;
      const laenge = el.getTotalLength();
      const schritte = 600;
      const t: { l: number; y: number }[] = [];
      for (let i = 0; i <= schritte; i++) {
        const l = (laenge * i) / schritte;
        t.push({ l, y: el.getPointAtLength(l).y });
      }
      tabelle.current = t;
      el.style.strokeDasharray = String(laenge);
      el.style.strokeDashoffset = String(laenge);
    };

    const laengeFuerY = (y: number) => {
      const t = tabelle.current;
      if (!t.length) return 0;
      if (y <= t[0].y) return 0;
      if (y >= t[t.length - 1].y) return t[t.length - 1].l;
      let lo = 0, hi = t.length - 1;
      while (hi - lo > 1) {
        const m = (lo + hi) >> 1;
        if (t[m].y < y) lo = m; else hi = m;
      }
      const sp = t[hi].y - t[lo].y || 1;
      return t[lo].l + ((y - t[lo].y) / sp) * (t[hi].l - t[lo].l);
    };

    const zeichnen = () => {
      const el = linie.current;
      if (!el || !tabelle.current.length) return;
      const laenge = el.getTotalLength();
      const blick = window.scrollY + window.innerHeight * 0.68;
      const bis = laengeFuerY(blick);

      el.style.strokeDashoffset = String(Math.max(0, laenge - bis));

      const k = knoten.current;
      if (k) {
        const pt = el.getPointAtLength(bis);
        k.setAttribute('cx', String(pt.x));
        k.setAttribute('cy', String(pt.y));
        k.style.opacity = bis > 4 ? '1' : '0';
      }
    };

    let laeuft = false;
    const planen = () => {
      if (laeuft) return;
      laeuft = true;
      requestAnimationFrame(() => { laeuft = false; zeichnen(); });
    };

    // Zwei Anlaeufe: einmal frueh, einmal nachdem Schriften und Bilder stehen.
    // Ein ResizeObserver auf dem Koerper waere hier falsch — jede Neuberechnung
    // aendert das Layout und loest die naechste aus.
    const start = window.setTimeout(bauen, 400);
    const nach = window.setTimeout(bauen, 1600);
    document.fonts?.ready.then(() => bauen());
    window.addEventListener('scroll', planen, { passive: true });
    window.addEventListener('resize', bauen);

    zeichnenRef.current = zeichnen;
    tabelleRef.current = tabelleBauen;

    return () => {
      window.clearTimeout(start);
      window.clearTimeout(nach);
      window.removeEventListener('scroll', planen);
      window.removeEventListener('resize', bauen);
    };
  }, []);

  // Erst wenn der neue Pfad im DOM steht, ergeben getTotalLength und
  // getPointAtLength den richtigen Wert.
  useEffect(() => {
    if (!pfad) return;
    tabelleRef.current?.();
    zeichnenRef.current?.();
  }, [pfad]);

  if (!an || !pfad) return null;

  return (
    <svg
      aria-hidden="true"
      className="fw-faden pointer-events-none absolute left-0 top-0 hidden lg:block"
      width="100%"
      height={masse.h}
      viewBox={`0 0 ${masse.b} ${masse.h}`}
      preserveAspectRatio="none"
      style={{ overflow: 'visible' }}
    >
      <path
        ref={linie}
        d={pfad}
        fill="none"
        stroke="var(--faden)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.72"
      />
      <circle ref={knoten} r="4" fill="var(--faden)" opacity="0.85"
              style={{ transition: 'opacity .4s var(--ease-out)' }} />
    </svg>
  );
}

const f = (n: number) => n.toFixed(1);
