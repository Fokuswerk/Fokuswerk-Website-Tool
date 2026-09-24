"use client";

import { useEffect, useRef, useState } from "react";
import { historie } from "@/lib/daten";

export default function Zeitleiste() {
  const [aktiv, setAktiv] = useState(0);
  const punkte = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const b = new IntersectionObserver(
      (eintraege) => {
        const sichtbar = eintraege
          .filter((e) => e.isIntersecting)
          .sort((a, z) => a.boundingClientRect.top - z.boundingClientRect.top)[0];
        if (!sichtbar) return;
        const i = punkte.current.indexOf(sichtbar.target as HTMLLIElement);
        if (i >= 0) setAktiv(i);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    punkte.current.forEach((p) => p && b.observe(p));
    return () => b.disconnect();
  }, []);

  return (
    <section className="auf-dunkel sektion bg-tief text-papier" aria-label="Historie">
      <div className="huelle">
        <div className="bahn">
          <p className="t-label flex items-baseline gap-4 text-papier/50">
            <span className="t-zahl">02</span>
            <span>Historie</span>
          </p>
          <h2 className="t-h2 mt-6 max-w-[20ch]">Vom alten Rathaus an den Ortseingang.</h2>

          <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Große Jahreszahl, bleibt beim Scrollen stehen */}
            <div className="hidden lg:col-span-5 lg:block">
              <div className="sticky top-40">
                <p
                  aria-hidden
                  className="t-zahl font-semibold tracking-[-0.05em] text-kupfer"
                  style={{ fontSize: "clamp(80px, 11vw, 152px)", lineHeight: 0.88 }}
                >
                  {historie[aktiv].jahr}
                </p>
                <p className="t-label mt-6 text-papier/50">
                  <span className="t-zahl">
                    {String(aktiv + 1).padStart(2, "0")}
                  </span>{" "}
                  von{" "}
                  <span className="t-zahl">{String(historie.length).padStart(2, "0")}</span>
                </p>
                <div className="mt-6 h-px w-full max-w-[280px] bg-white/15">
                  <div
                    className="h-px bg-kupfer transition-[width] duration-500"
                    style={{ width: `${((aktiv + 1) / historie.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <ol className="lg:col-span-6 lg:col-start-7">
              {historie.map((h, i) => (
                <li
                  key={h.jahr + h.text.slice(0, 8)}
                  ref={(el) => {
                    punkte.current[i] = el;
                  }}
                  className="border-t border-white/15 py-8 first:border-t-0 first:pt-0 md:py-10"
                >
                  <p
                    className={`t-label t-zahl transition-colors duration-300 ${
                      i === aktiv ? "text-kupfer" : "text-papier/40"
                    }`}
                  >
                    {h.jahr}
                  </p>
                  <p
                    className={`t-text mass mt-4 transition-colors duration-300 ${
                      i === aktiv ? "text-papier" : "text-papier/55"
                    }`}
                  >
                    {h.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
