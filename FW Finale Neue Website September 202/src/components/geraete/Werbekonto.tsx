'use client';

import { useEffect, useRef, useState } from 'react';
import { beleg } from '@/lib/inhalt';

/**
 * Schaustück „Werbekonto": zwei Varianten, gemessene Kosten je Bewerbung,
 * und der Moment, in dem die teure abgeschaltet wird.
 *
 * Es stehen ausschließlich die beiden Werte darin, die aus dem Konto belegt
 * sind — keine erfundenen dritten Zeilen, keine erfundene Laufzeit.
 */
export default function Werbekonto() {
  const [phase, setPhase] = useState(0); // 0 = ruht, 1 = misst, 2 = entschieden
  const rahmen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rahmen.current;
    if (!el) return;
    const ruhe = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const b = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        b.disconnect();
        if (ruhe) { setPhase(2); return; }
        setPhase(1);
        window.setTimeout(() => setPhase(2), 2200);
      },
      { threshold: 0.4 },
    );
    b.observe(el);
    return () => b.disconnect();
  }, []);

  const laeuft = phase >= 1;
  const aus = phase >= 2;

  return (
    <div ref={rahmen} className="karte overflow-hidden">
      <div className="flex items-center gap-3 border-b border-rule px-5 py-3.5">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: aus ? 'var(--accent)' : '#22c55e' }}
        />
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-3">
          Werbekonto · Kampagnenvergleich
        </p>
        <p className="ml-auto font-mono text-[0.66rem] text-ink-3">
          {aus ? 'Tag 10' : 'läuft'}
        </p>
      </div>

      <div className="divide-y divide-rule">
        <Zeile
          name="Variante A · Bewerbung in der App"
          wert={beleg.guenstig}
          anteil={laeuft ? 0.14 : 0}
          gut
          aus={false}
        />
        <Zeile
          name="Variante B · Bewerbung über Umweg"
          wert={beleg.teuer}
          anteil={laeuft ? 1 : 0}
          gut={false}
          aus={aus}
        />
      </div>

      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-4"
        style={{
          background: 'var(--color-paper-2)',
          opacity: aus ? 1 : 0,
          transform: aus ? 'none' : 'translateY(6px)',
          transition: 'opacity .6s var(--ease-out), transform .6s var(--ease-out)',
        }}
      >
        <p className="text-sm font-semibold">Variante B abgeschaltet, Budget umgelegt.</p>
        <p className="text-sm text-ink-2">
          Bei gleichem Budget sind das 44 Bewerbungen statt einer.
        </p>
      </div>
    </div>
  );
}

function Zeile({
  name, wert, anteil, gut, aus,
}: { name: string; wert: number; anteil: number; gut: boolean; aus: boolean }) {
  return (
    <div className="px-5 py-4" style={{ opacity: aus ? 0.42 : 1, transition: 'opacity .7s var(--ease-out)' }}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium">
          {name}
          {aus && (
            <span className="ml-2 rounded-[4px] border border-rule-2 px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-ink-3">
              aus
            </span>
          )}
        </p>
        <p
          className="whitespace-nowrap text-[1.15rem] font-bold tracking-[-0.03em]"
          style={{ color: gut ? 'var(--accent)' : 'var(--color-ink)' }}
        >
          {wert.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
        </p>
      </div>
      <div className="mt-2.5 h-[6px] overflow-hidden rounded-full" style={{ background: 'var(--color-paper-3)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${anteil * 100}%`,
            background: gut ? 'var(--accent)' : 'var(--color-ink)',
            transition: 'width 1.6s var(--ease-out)',
          }}
        />
      </div>
      <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-3">
        Kosten je Bewerbung
      </p>
    </div>
  );
}
