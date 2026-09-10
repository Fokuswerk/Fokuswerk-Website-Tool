'use client';

import { useEffect, useState } from 'react';

/**
 * Der Auftakt.
 *
 * Vier Eckwinkel stehen an den Bildschirmrändern und ziehen sich auf die
 * Mitte zusammen — die Kamera stellt scharf. Dort steht die Wortmarke, dann
 * hebt sich die Blende nach oben weg und gibt die Seite frei.
 *
 * Regeln, damit es nicht nervt:
 * - einmal je Sitzung, nicht bei jedem Seitenwechsel
 * - insgesamt unter 1,6 Sekunden
 * - ein Klick oder eine Taste überspringt
 * - bei prefers-reduced-motion gar nicht
 * - die Seite darunter ist fertig gerendert; der Auftakt liegt nur darüber
 */
export default function Intro() {
  const [phase, setPhase] = useState<'aus' | 'weit' | 'scharf' | 'weg'>('aus');

  useEffect(() => {
    let schonGesehen = false;
    try { schonGesehen = sessionStorage.getItem('fw-auftakt') === '1'; } catch {}
    if (schonGesehen) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try { sessionStorage.setItem('fw-auftakt', '1'); } catch {}
    document.documentElement.classList.add('auftakt-laeuft');
    setPhase('weit');

    const t1 = window.setTimeout(() => setPhase('scharf'), 80);
    const t2 = window.setTimeout(() => setPhase('weg'), 1050);
    const t3 = window.setTimeout(() => {
      setPhase('aus');
      document.documentElement.classList.remove('auftakt-laeuft');
    }, 1650);

    const ueberspringen = () => {
      window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3);
      setPhase('weg');
      window.setTimeout(() => {
        setPhase('aus');
        document.documentElement.classList.remove('auftakt-laeuft');
      }, 500);
    };
    window.addEventListener('pointerdown', ueberspringen, { once: true });
    window.addEventListener('keydown', ueberspringen, { once: true });

    return () => {
      window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3);
      window.removeEventListener('pointerdown', ueberspringen);
      window.removeEventListener('keydown', ueberspringen);
      document.documentElement.classList.remove('auftakt-laeuft');
    };
  }, []);

  if (phase === 'aus') return null;

  const scharf = phase === 'scharf' || phase === 'weg';

  return (
    <div
      aria-hidden="true"
      className="auftakt"
      data-phase={phase}
    >
      <div className="auftakt-rahmen" data-scharf={scharf ? '' : undefined}>
        <span className="auftakt-ecke auftakt-lo" />
        <span className="auftakt-ecke auftakt-ro" />
        <span className="auftakt-ecke auftakt-lu" />
        <span className="auftakt-ecke auftakt-ru" />
        <span className="auftakt-marke">Fokuswerk</span>
      </div>
    </div>
  );
}
