"use client";

import { useEffect, useRef, useState } from "react";

/** Ruhiger Scroll-Auftritt. Bei prefers-reduced-motion ohne Wirkung,
 *  weil die Regel in globals.css alles zurücksetzt. */
export default function Auftritt({
  children,
  verzug = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  verzug?: number;
  as?: "div" | "section" | "li" | "article";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [da, setDa] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const beobachter = new IntersectionObserver(
      ([eintrag]) => {
        if (eintrag.isIntersecting) { setDa(true); beobachter.disconnect(); }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, []);

  const Element = Tag as React.ElementType;

  return (
    <Element
      ref={ref as React.Ref<HTMLElement>}
      className={`auftritt ${className}`.trim()}
      data-da={da ? "ja" : "nein"}
      style={{ transitionDelay: `${verzug}ms` }}
    >
      {children}
    </Element>
  );
}
