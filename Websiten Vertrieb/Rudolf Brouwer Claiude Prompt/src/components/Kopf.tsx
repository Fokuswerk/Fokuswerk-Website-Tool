"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { betrieb } from "@/lib/daten";

const navigation = [
  { nr: "01", titel: "Startseite", href: "/" },
  { nr: "02", titel: "Bad", href: "/bad" },
  { nr: "03", titel: "Heizung", href: "/heizung" },
  { nr: "04", titel: "Solarenergie", href: "/solarenergie" },
  { nr: "05", titel: "Schwimmbad", href: "/schwimmbad" },
  { nr: "06", titel: "Wellness", href: "/wellness" },
  { nr: "07", titel: "Ausstellung", href: "/ausstellung" },
  { nr: "08", titel: "Unternehmen", href: "/unternehmen" },
  { nr: "09", titel: "Kontakt", href: "/kontakt" },
];

const nebenwege = [
  { titel: "Karriere", href: "/karriere" },
  { titel: "Partner", href: "/partner" },
];

export default function Kopf() {
  const [offen, setOffen] = useState(false);
  const [gescrollt, setGescrollt] = useState(false);
  const pfad = usePathname();
  const knopfRef = useRef<HTMLButtonElement>(null);
  const schliessenRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const beiScroll = () => setGescrollt(window.scrollY > 24);
    beiScroll();
    window.addEventListener("scroll", beiScroll, { passive: true });
    return () => window.removeEventListener("scroll", beiScroll);
  }, []);

  useEffect(() => setOffen(false), [pfad]);

  useEffect(() => {
    if (!offen) return;
    document.body.style.overflow = "hidden";
    schliessenRef.current?.focus();
    const beiTaste = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOffen(false);
        knopfRef.current?.focus();
      }
    };
    window.addEventListener("keydown", beiTaste);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", beiTaste);
    };
  }, [offen]);

  const aufStart = pfad === "/";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
          gescrollt || !aufStart
            ? "border-b border-white/10 bg-tiefer/95 backdrop-blur-sm"
            : "border-b border-transparent"
        }`}
      >
        <div className="huelle">
          <div className="bahn flex h-20 items-center justify-between md:h-24">
            <Link href="/" aria-label="Brouwer GmbH — zur Startseite" className="auf-dunkel block">
              <Image
                src="/logo-brouwer.png"
                alt="Rudolf Brouwer GmbH — Heizung, Sanitär, Schwimmbad"
                width={300}
                height={121}
                priority
                className="h-9 w-auto brightness-0 invert md:h-12"
              />
            </Link>

            <div className="auf-dunkel flex items-center gap-6">
              <a
                href={`tel:${betrieb.telefonRaw}`}
                className="t-label hidden text-papier/70 transition-colors hover:text-papier md:block"
              >
                {betrieb.telefon}
              </a>
              <button
                ref={knopfRef}
                type="button"
                onClick={() => setOffen(true)}
                aria-expanded={offen}
                aria-controls="hauptmenue"
                className="t-label flex items-center gap-4 text-papier"
              >
                <span aria-hidden className="flex w-6 flex-col gap-[5px]">
                  <span className="h-px w-full bg-papier" />
                  <span className="h-px w-full bg-papier" />
                </span>
                Menü
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Vollbild-Menü */}
      <div
        id="hauptmenue"
        role="dialog"
        aria-modal="true"
        aria-label="Hauptmenü"
        hidden={!offen}
        className="auf-dunkel fixed inset-0 z-[60] overflow-y-auto bg-tiefer text-papier"
      >
        <div className="huelle min-h-full">
          <div className="bahn flex min-h-[100svh] flex-col">
            <div className="flex h-20 shrink-0 items-center justify-between md:h-24">
              <span className="t-label text-papier/50">Menü</span>
              <button
                ref={schliessenRef}
                type="button"
                onClick={() => setOffen(false)}
                className="t-label flex items-center gap-4 text-papier"
              >
                Schließen
                <span aria-hidden className="relative block h-4 w-4">
                  <span className="absolute left-0 top-1/2 h-px w-full rotate-45 bg-papier" />
                  <span className="absolute left-0 top-1/2 h-px w-full -rotate-45 bg-papier" />
                </span>
              </button>
            </div>

            <div className="grid flex-1 grid-cols-1 items-start gap-16 py-8 lg:grid-cols-[1fr_minmax(0,400px)] lg:gap-24 lg:py-16">
              <nav aria-label="Hauptnavigation">
                <ul>
                  {navigation.map((e, i) => (
                    <li
                      key={e.href}
                      className={offen ? "stufe" : ""}
                      style={offen ? { animationDelay: `${80 + i * 40}ms` } : undefined}
                    >
                      <Link
                        href={e.href}
                        className="group flex items-baseline gap-6 border-b border-white/10 py-2 md:gap-8 md:py-4"
                        aria-current={pfad === e.href ? "page" : undefined}
                      >
                        <span className="t-label t-zahl shrink-0 text-papier/40 transition-colors group-hover:text-kupfer">
                          {e.nr}
                        </span>
                        <span
                          className={`font-semibold tracking-[-0.03em] transition-colors ${
                            pfad === e.href ? "text-kupfer" : "text-papier group-hover:text-kupfer"
                          }`}
                          style={{ fontSize: "clamp(26px, 3.4vw, 42px)", lineHeight: 1.05 }}
                        >
                          {e.titel}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div
                className={`hidden lg:block ${offen ? "stufe" : ""}`}
                style={offen ? { animationDelay: "240ms" } : undefined}
              >
                <figure>
                  <div className="relative aspect-[4/5] max-h-[54svh] overflow-hidden rounded-kante">
                    <Image
                      src="/fotos/ausstellung-baeder.jpg"
                      alt="Badkojen in der Ausstellung der Brouwer GmbH mit Waschtischen, WCs und begehbarer Dusche"
                      fill
                      sizes="400px"
                      className="object-cover object-[60%_center]"
                    />
                  </div>
                  <figcaption className="t-label mt-4 text-papier/50">
                    Ausstellung · {betrieb.ausstellungQm} m² · Wardenburg
                  </figcaption>
                </figure>
              </div>
            </div>

            <div
              className={`shrink-0 border-t border-white/10 py-8 ${offen ? "stufe" : ""}`}
              style={offen ? { animationDelay: "320ms" } : undefined}
            >
              <div className="flex flex-col gap-4 text-papier/60 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-10">
                  <a href={`tel:${betrieb.telefonRaw}`} className="t-label transition-colors hover:text-papier">
                    {betrieb.telefon}
                  </a>
                  <a href={`mailto:${betrieb.email}`} className="t-label transition-colors hover:text-papier">
                    {betrieb.email}
                  </a>
                  <span className="t-label">
                    {betrieb.strasse} · {betrieb.plz} {betrieb.ort}
                  </span>
                </div>
                <div className="flex items-center gap-8">
                  {nebenwege.map((n) => (
                    <Link key={n.href} href={n.href} className="t-label transition-colors hover:text-papier">
                      {n.titel}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
