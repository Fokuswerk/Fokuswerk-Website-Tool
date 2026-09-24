"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/* Auf dem Server steht sofort der richtige Wert — gezählt wird erst im Browser. */
const layoutEffekt = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function Zahl({ bis, dauer = 1200 }: { bis: number; dauer?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [wert, setWert] = useState(bis);

  layoutEffekt(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setWert(0);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const b = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        b.disconnect();
        const start = performance.now();
        const lauf = (t: number) => {
          const p = Math.min(1, (t - start) / dauer);
          setWert(Math.round(bis * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(lauf);
        };
        requestAnimationFrame(lauf);
      },
      { threshold: 0.4 },
    );
    b.observe(el);
    return () => b.disconnect();
  }, [bis, dauer]);

  /* Die Breite des Endwerts wird reserviert — beim Hochzählen springt nichts. */
  return (
    <span ref={ref} className="t-zahl relative inline-block">
      <span aria-hidden className="invisible">{bis.toLocaleString("de-DE")}</span>
      <span className="absolute inset-0 text-right">{wert.toLocaleString("de-DE")}</span>
    </span>
  );
}
