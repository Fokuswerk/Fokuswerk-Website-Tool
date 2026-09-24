"use client";

import { useEffect, useRef, useState } from "react";

type Element = "div" | "li" | "section";

export default function Anlauf({
  children,
  verzug = 0,
  klasse = "",
  als = "div",
}: {
  children: React.ReactNode;
  verzug?: number;
  klasse?: string;
  als?: Element;
}) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  const [da, setDa] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDa(true);
      return;
    }
    const b = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDa(true);
          b.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    b.observe(el);
    return () => b.disconnect();
  }, []);

  const eigenschaften = {
    ref,
    className: `${da ? "anlauf-an" : "anlauf"} ${klasse}`,
    style: da ? { transitionDelay: `${verzug}ms` } : undefined,
  };

  if (als === "li") return <li {...eigenschaften}>{children}</li>;
  if (als === "section") return <section {...eigenschaften}>{children}</section>;
  return <div {...eigenschaften}>{children}</div>;
}
