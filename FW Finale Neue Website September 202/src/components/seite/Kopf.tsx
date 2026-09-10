'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cta, marke, navigation } from '@/lib/inhalt';
import Pfeil from '@/components/ui/Pfeil';

/**
 * Kopfleiste und Vollbildmenü.
 *
 * Die Leiste folgt der Gartenzwerg-Präsentation: volle Breite statt
 * schwebender Pille, Navigation als Text in der Mitte, rechts Telefon und
 * Schaltfläche. Über dem Titelbild liegt sie transparent. Sobald gescrollt
 * wird, bekommt sie Grund und Haarlinie — hell über hellen Abschnitten,
 * dunkel über dunklen. Ein heller Balken über einem schwarzen Band war in
 * einer früheren Fassung genau der „komische weiße Balken".
 *
 * Unter 64rem trägt der Schalter das Vollbildmenü: eine Fläche, die die Seite
 * dahinter weichzeichnet; Einträge in Displaygröße, die gestaffelt aus einer
 * Maske fahren; rechts eine Spalte mit Schaltfläche und Kontakt.
 */
export default function Kopf() {
  const [gescrollt, setGescrollt] = useState(false);
  const [ueberBand, setUeberBand] = useState(false);
  const [offen, setOffen] = useState(false);
  // Drei Zustände statt zwei: eingehängt (sichtbar) und aufgezogen sind
  // getrennt. Wird das Menü gleich im offenen Zustand eingehängt, gibt es
  // keinen Ausgangswert, von dem ein Übergang laufen könnte — es steht dann
  // schlagartig fertig da, und die ganze Choreografie fällt aus.
  const [sichtbar, setSichtbar] = useState(false);
  const [aufgezogen, setAufgezogen] = useState(false);
  const schalter = useRef<HTMLButtonElement>(null);
  const pfad = usePathname();

  // Liegt unter der Leiste ein dunkles Band, kehrt sie dieselben Farbvariablen
  // um wie das Band.
  useEffect(() => {
    let laeuft = false;
    const messen = () => {
      laeuft = false;
      setGescrollt(window.scrollY > 16);
      let drin = false;
      for (const b of document.querySelectorAll<HTMLElement>('.band')) {
        const r = b.getBoundingClientRect();
        if (r.top <= 40 && r.bottom >= 40) { drin = true; break; }
      }
      setUeberBand(drin);
    };
    const planen = () => { if (!laeuft) { laeuft = true; requestAnimationFrame(messen); } };
    messen();
    window.addEventListener('scroll', planen, { passive: true });
    window.addEventListener('resize', planen);
    return () => {
      window.removeEventListener('scroll', planen);
      window.removeEventListener('resize', planen);
    };
  }, []);

  // Öffnen: erst einhängen, dann im nächsten Bild die Übergänge starten.
  // Schließen: Übergänge zurück, dann aushängen.
  useEffect(() => {
    document.body.classList.toggle('menue-offen', offen);
    if (offen) {
      setSichtbar(true);
      // Erst im geschlossenen Zustand einhängen, zwei Bilder später öffnen.
      // Das erste Bild sorgt dafür, dass React eingehängt hat, das zweite,
      // dass der Browser den geschlossenen Zustand einmal gezeichnet hat.
      let zweites = 0;
      const erstes = requestAnimationFrame(() => {
        zweites = requestAnimationFrame(() => setAufgezogen(true));
      });
      return () => { cancelAnimationFrame(erstes); cancelAnimationFrame(zweites); };
    }
    setAufgezogen(false);
    // Vorhang zieht sich in 0,6 s hoch, nach 0,14 s Vorlauf.
    const t = window.setTimeout(() => setSichtbar(false), 780);
    return () => window.clearTimeout(t);
  }, [offen]);

  // Beim Seitenwechsel schließen.
  useEffect(() => { setOffen(false); }, [pfad]);

  // Ab 64rem steht die Navigation in der Leiste und der Schalter ist weg —
  // ein offenes Menü ließe sich dann nicht mehr schließen.
  useEffect(() => {
    const breit = window.matchMedia('(min-width: 64rem)');
    const pruefen = () => { if (breit.matches) setOffen(false); };
    breit.addEventListener('change', pruefen);
    return () => breit.removeEventListener('change', pruefen);
  }, []);

  useEffect(() => {
    if (!offen) return;
    const aufTaste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOffen(false); schalter.current?.focus(); }
    };
    window.addEventListener('keydown', aufTaste);
    return () => window.removeEventListener('keydown', aufTaste);
  }, [offen]);

  const dunkel = offen || ueberBand;
  const gefuellt = gescrollt && !offen;
  // Der Weichzeichner steht inline: aus dem Stylesheet kam backdrop-filter
  // in diesem Projekt nicht zuverlässig an (siehe Menüfläche unten).
  const weich = gefuellt ? 'blur(18px) saturate(1.4)' : 'none';

  return (
    <>
      <header
        className={`kopf${dunkel ? ' kopf-dunkel' : ''}`}
        data-grund={gefuellt ? 'voll' : 'klar'}
        style={{ backdropFilter: weich, WebkitBackdropFilter: weich }}
      >
        <div className="schale flex h-16 items-center justify-between gap-6 md:h-20">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Fokuswerk, zur Startseite">
            <Zeichen />
            <span className="text-[1.1rem] font-bold tracking-[-0.035em] md:text-[1.2rem]">Fokuswerk</span>
          </Link>

          <nav aria-label="Hauptnavigation" className="hidden lg:block">
            <ul className="flex items-center gap-8 xl:gap-10">
              {navigation.map((n) => (
                <li key={n.pfad}>
                  <Link
                    href={n.pfad}
                    className="kopf-link"
                    aria-current={pfad === n.pfad ? 'page' : undefined}
                  >
                    {n.titel}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 md:gap-5">
            <a href={`tel:${marke.telefon}`} className="kopf-tel hidden xl:inline-flex">
              <Hoerer />
              {marke.telefonText}
            </a>

            <Link href={cta.ziel} className="akt kopf-akt hidden sm:inline-flex">
              {cta.text}
              <Pfeil groesse={12} />
            </Link>

            <button
              ref={schalter}
              type="button"
              className="brenner -mr-1 lg:hidden"
              aria-expanded={offen}
              aria-controls="hauptmenue"
              onClick={() => setOffen((o) => !o)}
            >
              <span className="nur-sr">{offen ? 'Menü schließen' : 'Menü öffnen'}</span>
              <span className="brenner-wort" aria-hidden="true">{offen ? 'Schließen' : 'Menü'}</span>
              <span className="brenner-linien" aria-hidden="true"><span /><span /></span>
            </button>
          </div>
        </div>
      </header>

      {sichtbar && (
        <div
          id="hauptmenue"
          className="overlay band"
          data-offen={aufgezogen ? '' : undefined}
          role="dialog"
          aria-modal="true"
          aria-label="Hauptmenü"
        >
          {/* Der Weichzeichner steht bewusst als Inline-Style. Aus dem
              Stylesheet kam backdrop-filter an diesem Element nicht an
              (berechneter Wert im Browser: none) — die Fläche war nur dunkel,
              nicht weich. Inline greift er, wie bei der Kopfleiste. */}
          <div
            className="overlay-grund"
            aria-hidden="true"
            style={{
              backdropFilter: 'blur(36px) saturate(1.1)',
              WebkitBackdropFilter: 'blur(36px) saturate(1.1)',
            }}
          />
          <span className="overlay-kante" aria-hidden="true" />

          <div className="overlay-innen schale">
            <p className="overlay-augen kennung">
              <span className="hidden sm:inline">Fokuswerk · Performance Marketing · </span>Oldenburg
            </p>

            <nav aria-label="Hauptmenü">
              <ul className="menue">
                {navigation.map((n, i) => (
                  <li key={n.pfad} className="menue-zeile" style={{ ['--i' as string]: i }}>
                    <Link
                      href={n.pfad}
                      className="menue-link"
                      aria-current={pfad === n.pfad ? 'page' : undefined}
                      onClick={() => setOffen(false)}
                    >
                      <span className="menue-nr" aria-hidden="true">0{i + 1}</span>
                      <span className="menue-titel"><span>{n.titel}</span></span>
                      <span className="menue-zeile-text">{n.zeile}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="menue-seite">
              <div>
                <Link href={cta.ziel} className="akt" onClick={() => setOffen(false)}>
                  {cta.text}
                  <Pfeil />
                </Link>
              </div>
              <p className="max-w-[30ch] text-sm leading-[1.55] text-ink-3">{cta.notiz}</p>

              <div className="menue-daten">
                <a href={`tel:${marke.telefon}`} className="menue-tel font-mono">{marke.telefonText}</a>
                <a href={`mailto:${marke.mail}`} className="menue-mail">{marke.mail}</a>
                <p className="mt-2 text-sm text-ink-3">{marke.strasse}<br />{marke.plz} {marke.ort}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Bildmarke: Sucherwinkel um einen Punkt. Ohne Kachel, damit sie auf
 *  Bild, Hell und Dunkel gleich ruhig steht; der Punkt trägt die Hausfarbe. */
function Zeichen() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" aria-hidden="true">
      <path d="M1.5 6.5V1.5h5M18.5 6.5V1.5h-5M1.5 13.5v5h5M18.5 13.5v5h-5" />
      <rect x="8.1" y="8.1" width="3.8" height="3.8" fill="var(--accent)" stroke="none" />
    </svg>
  );
}

function Hoerer() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M5.2 2.5 6.8 5.6 5.3 7c.7 1.5 2.2 3 3.7 3.7l1.4-1.5 3.1 1.6-.6 2.4c-.2.6-.8 1-1.4.9C7.1 13.5 2.5 8.9 1.9 3.5c-.1-.6.3-1.2.9-1.4l2.4-.6z" />
    </svg>
  );
}
