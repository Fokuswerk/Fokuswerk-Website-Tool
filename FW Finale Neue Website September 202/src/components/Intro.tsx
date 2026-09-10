'use client';

import { useEffect, useState } from 'react';

/**
 * Der Auftakt.
 *
 * Vier Eckwinkel stehen an den Bildschirmrändern und ziehen sich auf die
 * Wortmarke zusammen — die Kamera stellt scharf. Dann fährt die Blende nach
 * oben weg, und die Titelbühne baut sich darunter auf, während sie noch
 * fährt.
 *
 * Ob der Auftakt läuft, entscheidet ein Skript im Seitenkopf (layout.tsx),
 * noch vor dem ersten Bild: es setzt html[data-auftakt="laeuft"]. Solange das
 * Attribut steht, deckt eine Vorab-Blende die Seite, und Bewegung.tsx hält die
 * Titelbühne zurück. Diese Komponente übernimmt dann:
 *   laeuft → steht   eigene Blende deckt, die Vorab-Blende geht aus
 *   Ereignis fw-auftakt-weg   Blende fährt hoch, Titelbühne wird freigegeben
 *   Attribut entfernt   Seite ist scrollbar
 *
 * Regeln: einmal je Sitzung, unter 1,7 Sekunden, ein Klick oder eine Taste
 * überspringt, bei prefers-reduced-motion gar nicht.
 */
export default function Intro() {
  const [phase, setPhase] = useState<'aus' | 'weit' | 'scharf' | 'weg'>('aus');

  useEffect(() => {
    const html = document.documentElement;
    const zustand = html.getAttribute('data-auftakt');
    // „steht" ist erlaubt, damit der doppelte Effektlauf im Entwicklungsmodus
    // den Auftakt nicht abwürgt.
    if (zustand !== 'laeuft' && zustand !== 'steht') return;

    try { sessionStorage.setItem('fw-auftakt', '1'); } catch {}
    html.setAttribute('data-auftakt', 'steht');
    setPhase('weit');

    let fertig = false;
    let abschluss = 0;
    const wegziehen = () => {
      if (fertig) return;
      fertig = true;
      setPhase('weg');
      // Freigabe schon beim Hochfahren, nicht erst danach — die Headline
      // soll unter der Blende hervorkommen, nicht nach ihr erscheinen.
      window.dispatchEvent(new Event('fw-auftakt-weg'));
      abschluss = window.setTimeout(() => {
        setPhase('aus');
        html.removeAttribute('data-auftakt');
      }, 620);
    };

    const t1 = window.setTimeout(() => setPhase('scharf'), 80);
    const t2 = window.setTimeout(wegziehen, 1050);
    const ueberspringen = () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      wegziehen();
    };
    window.addEventListener('pointerdown', ueberspringen, { once: true });
    window.addEventListener('keydown', ueberspringen, { once: true });

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(abschluss);
      window.removeEventListener('pointerdown', ueberspringen);
      window.removeEventListener('keydown', ueberspringen);
    };
  }, []);

  if (phase === 'aus') return null;

  const scharf = phase === 'scharf' || phase === 'weg';

  return (
    <div aria-hidden="true" className="auftakt" data-phase={phase}>
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
