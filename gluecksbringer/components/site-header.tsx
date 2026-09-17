"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigation, verein } from "@/content/verein";
import { Wortmarke } from "./marke";
import { PfeilRechts } from "./ui";

export function SiteHeader() {
  const pfad = usePathname();
  const [gescrollt, setGescrollt] = useState(false);
  const [menueOffen, setMenueOffen] = useState(false);

  useEffect(() => {
    const beiScroll = () => setGescrollt(window.scrollY > 12);
    beiScroll();
    window.addEventListener("scroll", beiScroll, { passive: true });
    return () => window.removeEventListener("scroll", beiScroll);
  }, []);

  // Menü bei Seitenwechsel schließen
  useEffect(() => {
    setMenueOffen(false);
  }, [pfad]);

  // Hintergrund nicht mitscrollen lassen, solange das Menü offen ist
  useEffect(() => {
    if (!menueOffen) return;
    const vorher = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const beiEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenueOffen(false);
    };
    window.addEventListener("keydown", beiEscape);

    return () => {
      document.body.style.overflow = vorher;
      window.removeEventListener("keydown", beiEscape);
    };
  }, [menueOffen]);

  const istAktiv = (href: string) =>
    pfad === href || pfad.startsWith(`${href}/`);

  return (
    <header
      data-scrolled={gescrollt}
      className="fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-[var(--ease-soft)] data-[scrolled=true]:bg-paper/88 data-[scrolled=true]:shadow-[0_1px_0_rgba(16,41,59,0.08)] data-[scrolled=true]:backdrop-blur-md"
    >
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-paper"
      >
        Zum Inhalt springen
      </a>

      {/* Die Kopfzeile bleibt über der Menü-Ebene, damit der Schließen-Knopf erreichbar ist. */}
      <div className="shell relative z-50">
        <div
          data-scrolled={gescrollt}
          className="flex items-center justify-between gap-3 py-5 sm:gap-6 transition-[padding] duration-500 ease-[var(--ease-soft)] data-[scrolled=true]:py-3.5"
        >
          <Wortmarke />

          <nav
            aria-label="Hauptnavigation"
            className="hidden items-center gap-1 lg:flex"
          >
            {navigation.map((eintrag) => (
              <Link
                key={eintrag.href}
                href={eintrag.href}
                aria-current={istAktiv(eintrag.href) ? "page" : undefined}
                className="group relative rounded-full px-4 py-2 text-[0.9375rem] font-medium text-ink-70 transition-colors duration-200 hover:text-ink"
              >
                {eintrag.label}
                <span
                  aria-hidden="true"
                  data-aktiv={istAktiv(eintrag.href)}
                  className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-glow transition-transform duration-300 ease-[var(--ease-soft)] group-hover:scale-x-100 data-[aktiv=true]:scale-x-100"
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/unterstuetzen"
              className="group inline-flex items-center gap-1.5 rounded-full bg-glow px-4 py-2.5 text-[0.875rem] font-semibold text-white transition-colors duration-300 hover:bg-glow-deep sm:px-5 sm:text-[0.9375rem]"
            >
              <span className="sm:hidden">Spenden</span>
              <span className="hidden sm:inline">Unterstützen</span>
              <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
            </Link>

            <button
              type="button"
              onClick={() => setMenueOffen((offen) => !offen)}
              aria-expanded={menueOffen}
              aria-controls="mobilmenue"
              className="-mr-2 inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[0.05] lg:hidden"
            >
              <span className="sr-only">
                {menueOffen ? "Menü schließen" : "Menü öffnen"}
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="size-6"
              >
                <path
                  d={menueOffen ? "M6 6l12 12M18 6L6 18" : "M4 8h16M4 16h16"}
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        id="mobilmenue"
        data-offen={menueOffen}
        className="invisible fixed inset-0 top-0 z-40 bg-paper opacity-0 transition-[opacity,visibility] duration-300 ease-[var(--ease-soft)] data-[offen=true]:visible data-[offen=true]:opacity-100 lg:hidden"
      >
        <div className="flex h-dvh flex-col overflow-y-auto pt-24 pb-10">
          <nav
            aria-label="Hauptnavigation (mobil)"
            className="shell flex flex-col"
          >
            {navigation.map((eintrag, index) => (
              <Link
                key={eintrag.href}
                href={eintrag.href}
                aria-current={istAktiv(eintrag.href) ? "page" : undefined}
                style={{
                  transitionDelay: menueOffen ? `${80 + index * 45}ms` : "0ms",
                }}
                data-offen={menueOffen}
                className="flex items-baseline justify-between border-b border-sand-200 py-5 font-[family-name:var(--font-display)] text-[1.75rem] font-semibold tracking-[-0.025em] text-ink opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-soft)] data-[offen=true]:translate-y-0 data-[offen=true]:opacity-100 aria-[current=page]:text-sea"
              >
                {eintrag.label}
                <span className="text-xs font-medium tracking-[0.1em] text-ink-50 tabular-nums">
                  0{index + 1}
                </span>
              </Link>
            ))}

            <Link
              href="/unterstuetzen"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-glow px-7 py-4 text-base font-semibold text-white"
            >
              Jetzt unterstützen
              <PfeilRechts />
            </Link>

            <div className="mt-10 space-y-1 text-[0.9375rem] text-ink-70">
              <p>
                <a href={`mailto:${verein.email}`} className="hover:text-glow">
                  {verein.email}
                </a>
              </p>
              <p>
                {verein.anschrift.plz} {verein.anschrift.ort}
              </p>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
