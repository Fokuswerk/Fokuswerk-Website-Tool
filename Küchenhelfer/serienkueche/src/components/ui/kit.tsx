"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";

/* Kleines eigenes Baukastenset statt einer Komponentenbibliothek:
   der Standardlook verbreiteter Kits ist genau die Anmutung, die hier
   vermieden werden soll. */

export function Seitenkopf({
  titel,
  kontext,
  aktionen,
  hinweis,
}: {
  titel: string;
  kontext?: ReactNode;
  aktionen?: ReactNode;
  hinweis?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="px-6 pb-5 pt-6 lg:px-9">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[23px] font-semibold leading-tight tracking-[-0.025em] text-ink">{titel}</h1>
            {kontext && <div className="mt-1.5 text-[13px] text-ink-2">{kontext}</div>}
          </div>
          {aktionen && <div className="flex shrink-0 flex-wrap items-center gap-2">{aktionen}</div>}
        </div>
        {hinweis && <div className="mt-3">{hinweis}</div>}
      </div>
    </header>
  );
}

/**
 * Briefkopf und Fusszeile, die nur auf Papier erscheinen.
 *
 * Am Bildschirm traegt die Navigation den Zusammenhang: man sieht links,
 * in welchem Projekt man ist. Ein ausgedrucktes Blatt hat das nicht und
 * muss fuer sich stehen — mit Projekt, Gegenstand, Stand und einer
 * Fusszeile, die Chrome auf jeder Seite wiederholt.
 */
export function Druckbogen({
  titel,
  projekt,
  zeile,
  stand,
}: {
  titel: string;
  projekt: string;
  zeile?: string;
  stand?: string;
}) {
  // Das Datum erst nach dem Mounten setzen: auf dem Server entsteht sonst
  // das Builddatum, im Browser das heutige — ein echter Hydration-Fehler
  // auf jeder Seite des Profibereichs.
  const [heute, setHeute] = useState("");
  useEffect(() => {
    setHeute(new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" }));
  }, []);
  return (
    <>
      <div className="nur-drucken drucken-kopf">
        <div className="drucken-kopf-zeile">
          <strong>{projekt} — {titel}</strong>
          <span>Gedruckt {heute}</span>
        </div>
        {(zeile || stand) && (
          <div className="drucken-kopf-zeile drucken-fein">
            <span>{zeile}</span>
            <span>{stand}</span>
          </div>
        )}
      </div>
      <div className="nur-drucken drucken-fuss">
        {projekt} · {titel} · {heute} · Prototyp, kein verbindliches Angebot
      </div>
    </>
  );
}

export function Inhalt({ children, breit }: { children: ReactNode; breit?: boolean }) {
  return (
    <div className={`px-6 py-8 lg:px-9 lg:py-10 ${breit ? "" : "max-w-[1400px]"}`}>{children}</div>
  );
}

export function Abschnitt({
  titel,
  aktion,
  children,
}: {
  titel: string;
  aktion?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">{titel}</h2>
        {aktion}
      </div>
      {children}
    </section>
  );
}

export function Flaeche({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`pro-flaeche rounded-md ${className}`}>{children}</div>
  );
}

type Ton = "ok" | "flag" | "mute" | "accent" | "good";

const TON: Record<Ton, string> = {
  ok: "bg-accent-soft text-accent",
  accent: "bg-accent text-white",
  flag: "bg-flag-soft text-flag",
  good: "bg-good-soft text-good",
  mute: "bg-line-2 text-ink-3",
};

export function Marke({ ton = "mute", children }: { ton?: Ton; children: ReactNode }) {
  return (
    <span className={`num inline-block whitespace-nowrap rounded-xs px-1.5 py-[1px] text-[11px] ${TON[ton]}`}>
      {children}
    </span>
  );
}

export function Knopf({
  children,
  onClick,
  art = "still",
  gross,
  deaktiviert,
  titel,
  typ = "button",
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  art?: "primaer" | "still" | "klar";
  gross?: boolean;
  deaktiviert?: boolean;
  titel?: string;
  typ?: "button" | "submit";
  /** Fuehrt der Knopf woandershin, ist er ein Link — nicht ein Knopf in
      einem Link. Das waren zwei Tabstopps fuer eine Handlung. */
  href?: string;
}) {
  const basis = `druck inline-flex items-center gap-1.5 rounded-sm font-medium ${
    gross ? "px-3.5 py-2 text-[13px]" : "px-2.5 py-1.5 text-[12.5px]"
  }`;
  const stil = deaktiviert
    ? "cursor-not-allowed border border-line bg-line-2 text-ink-3"
    : art === "primaer"
      ? "bg-gradient-to-b from-[#36352d] to-ink text-paper shadow-[0_1px_2px_rgba(26,26,22,.18),0_6px_16px_-8px_rgba(26,26,22,.45),inset_0_1px_0_rgba(255,255,255,.12)] hover:from-[#423f35]"
      : art === "klar"
        ? "text-ink-2 hover:bg-ground"
        : "border border-line bg-paper text-ink-2 hover:border-ink-3 hover:text-ink";
  if (href && !deaktiviert) {
    return (
      <Link href={href} title={titel} onClick={onClick} className={`${basis} ${stil}`}>
        {children}
      </Link>
    );
  }
  return (
    <button type={typ} title={titel} onClick={deaktiviert ? undefined : onClick} disabled={deaktiviert} className={`${basis} ${stil}`}>
      {children}
    </button>
  );
}

export function Zahlenreihe({
  werte,
}: {
  werte: Array<{ label: string; wert: ReactNode; zusatz?: ReactNode; ton?: "flag" }>;
}) {
  return (
    <div className="grid grid-cols-2 border-y border-line sm:grid-cols-3 xl:grid-cols-5">
      {werte.map((w, i) => (
        <div key={w.label} className={`px-4 py-5 sm:px-5 ${i === 0 ? "" : "border-l border-line-2"} ${i >= 2 ? "border-t border-line-2 sm:border-t-0" : ""}`}>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.11em] text-ink-3">{w.label}</div>
          {/* Auf dem Handy stehen zwei Zahlen nebeneinander; eine Summe wie
              203.038 € braucht dort weniger Schriftgrad, sonst laeuft das
              Eurozeichen aus der Spalte. */}
          <div className={`num mt-2 text-[24px] leading-none tracking-[-0.03em] sm:text-[29px] ${w.ton === "flag" ? "text-flag" : "text-ink"}`}>
            {w.wert}
          </div>
          {w.zusatz && <div className="mt-2 text-[11.5px] leading-snug text-ink-3">{w.zusatz}</div>}
        </div>
      ))}
    </div>
  );
}

/**
 * Tabelle mit Hinweis, wenn rechts noch etwas steht.
 *
 * Breite Tabellen schieben sich in einem schmalen Fenster seitlich weg —
 * ohne Zeichen dafuer sieht niemand, dass eine Spalte fehlt. Ein weicher
 * Verlauf an der Kante zeigt, dass es weitergeht, und verschwindet, sobald
 * man am Ende ist.
 */
export function Tabelle({ children, dicht }: { children: ReactNode; dicht?: boolean }) {
  const feld = useRef<HTMLDivElement>(null);
  const [kante, setKante] = useState({ links: false, rechts: false });

  useEffect(() => {
    const el = feld.current;
    if (!el) return;
    const pruefe = () => {
      const rest = el.scrollWidth - el.clientWidth - el.scrollLeft;
      setKante({ links: el.scrollLeft > 4, rechts: rest > 4 });
    };
    pruefe();
    el.addEventListener("scroll", pruefe, { passive: true });
    if (typeof ResizeObserver === "undefined") return () => el.removeEventListener("scroll", pruefe);
    const beobachter = new ResizeObserver(pruefe);
    beobachter.observe(el);
    return () => {
      el.removeEventListener("scroll", pruefe);
      beobachter.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      <div ref={feld} className="overflow-x-auto">
        <table className={`w-full border-collapse ${dicht ? "text-[12.5px]" : "text-[13px]"}`}>{children}</table>
      </div>
      {kante.links && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-paper to-transparent" />
      )}
      {kante.rechts && (
        <>
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-paper via-paper/85 to-transparent" />
          {/* Ein Zeichen am Rand statt einer Zeile ueber der Tabelle: dort
              stehen schon Ueberschrift und Link. */}
          <span
            className="pointer-events-none absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-paper text-[12px] text-ink-3 shadow-[0_1px_3px_rgba(27,30,35,0.1)]"
            title="Seitlich scrollen — rechts stehen weitere Spalten"
          >
            →
          </span>
        </>
      )}
    </div>
  );
}

export function Th({ children, rechts, breite, nebensache }: {
  children?: ReactNode; rechts?: boolean; breite?: string;
  /** Zweitrangige Spalte: faellt im schmalen Fenster weg, damit die
      wichtigen Spalten ohne seitliches Schieben lesbar bleiben. */
  nebensache?: boolean;
}) {
  return (
    <th
      style={breite ? { width: breite } : undefined}
      className={`whitespace-nowrap border-b border-line px-3 py-3 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-3 ${rechts ? "text-right" : "text-left"} ${nebensache ? "hidden xl:table-cell" : ""}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  rechts,
  num,
  stumm,
  nebensache,
}: {
  children?: ReactNode;
  rechts?: boolean;
  num?: boolean;
  stumm?: boolean;
  /** Gehoert zu einer Spalte, die im schmalen Fenster wegfaellt. */
  nebensache?: boolean;
}) {
  return (
    <td
      className={`border-b border-line-2 px-3 py-3 align-baseline ${rechts ? "text-right" : ""} ${num ? "num whitespace-nowrap" : ""} ${stumm ? "text-ink-3" : ""} ${nebensache ? "hidden xl:table-cell" : ""}`}
    >
      {children}
    </td>
  );
}

export function Hinweisband({
  art = "flag",
  titel,
  children,
}: {
  art?: "flag" | "ruhig";
  titel: string;
  children: ReactNode;
}) {
  const stil =
    art === "flag"
      ? "border-l-flag bg-flag-soft/70"
      : "border-l-ink-3 bg-ground";
  return (
    <div className={`rounded-md border-l-2 py-3.5 pl-4 pr-4 ${stil}`}>
      <div className={`text-[10.5px] font-semibold uppercase tracking-[0.11em] ${art === "flag" ? "text-flag" : "text-ink-3"}`}>
        {titel}
      </div>
      <div className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

export function Leer({ titel, children }: { titel: string; children?: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-line px-6 py-10 text-center">
      <div className="text-[13px] font-medium text-ink-2">{titel}</div>
      {children && <div className="mx-auto mt-1.5 max-w-[46ch] text-[12.5px] text-ink-3">{children}</div>}
    </div>
  );
}

/* Einfache Toastleiste. */
let melder: ((t: string) => void) | null = null;
export function melde(text: string) {
  melder?.(text);
}

export function Toasts() {
  const [liste, setListe] = useState<Array<{ id: number; text: string; geht?: boolean }>>([]);
  useEffect(() => {
    melder = (text: string) => {
      const id = Date.now() + Math.random();
      setListe((l) => [...l, { id, text }]);
      // Zwei Schritte: erst nach unten ausblenden — denselben Weg zurueck,
      // den sie gekommen ist —, dann aus der Liste nehmen. Vorher war sie
      // von einem Bild aufs naechste weg.
      setTimeout(() => setListe((l) => l.map((x) => (x.id === id ? { ...x, geht: true } : x))), 3600);
      setTimeout(() => setListe((l) => l.filter((x) => x.id !== id)), 3800);
    };
    return () => {
      melder = null;
    };
  }, []);
  // Der Behaelter bleibt im Baum, auch wenn nichts darin steht: wird die
  // Live-Region erst mit ihrem Inhalt eingehaengt, liest keine
  // Vorlesesoftware sie vor.
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2"
    >
      {liste.map((t) => (
        <div key={t.id} className={`${t.geht ? "toast-raus" : "toast-rein"} rounded-md border border-line bg-paper px-3.5 py-2.5 text-[12.5px] text-ink shadow-[0_6px_20px_rgba(27,30,35,0.08)]`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

/**
 * Was ein Overlay braucht, damit man mit der Tastatur herauskommt.
 *
 * Escape schliesst, der Fokus wandert hinein und beim Schliessen dorthin
 * zurueck, wo er herkam, und Tab laeuft im Kreis statt hinter das Overlay.
 * Zwei Overlays koennen gleichzeitig offen sein (Bestaetigung in der
 * Schublade) — deshalb ein Stapel, und nur das oberste hoert zu.
 */
const overlayStapel: symbol[] = [];

export function useOverlay(offen: boolean, schliessen: () => void) {
  const kasten = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!offen) return;
    const ich = Symbol("overlay");
    overlayStapel.push(ich);
    const vorher = document.activeElement as HTMLElement | null;
    const greifbar = () =>
      Array.from(
        kasten.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);
    greifbar()[0]?.focus();

    const amZug = () => overlayStapel[overlayStapel.length - 1] === ich;
    const taste = (e: KeyboardEvent) => {
      if (!amZug()) return;
      if (e.key === "Escape") { e.stopPropagation(); schliessen(); return; }
      if (e.key !== "Tab") return;
      const liste = greifbar();
      if (liste.length === 0) return;
      const erster = liste[0];
      const letzter = liste[liste.length - 1];
      if (e.shiftKey && document.activeElement === erster) { e.preventDefault(); letzter.focus(); }
      else if (!e.shiftKey && document.activeElement === letzter) { e.preventDefault(); erster.focus(); }
    };
    document.addEventListener("keydown", taste, true);
    return () => {
      document.removeEventListener("keydown", taste, true);
      const i = overlayStapel.indexOf(ich);
      if (i >= 0) overlayStapel.splice(i, 1);
      vorher?.focus?.();
    };
  }, [offen, schliessen]);
  return kasten;
}

export function Bestaetigung({
  offen,
  titel,
  text,
  bestaetigen,
  abbrechen,
  knopf = "Bestätigen",
}: {
  offen: boolean;
  titel: string;
  text: ReactNode;
  bestaetigen: () => void;
  abbrechen: () => void;
  knopf?: string;
}) {
  const kasten = useOverlay(offen, abbrechen);
  /* Er kam mit einem Aufblenden herein und war beim Schliessen von einem
     Bild aufs naechste weg — der Weg hinaus war gar keiner. Jetzt bleibt er
     so lange haengen, wie das Ausblenden dauert, und laeuft dabei die
     Eingangskurve rueckwaerts. Der Schleier geht mit: vorher stand er
     schlagartig da und verdeckte den Hintergrund, bevor der Dialog ueber-
     haupt zu sehen war. */
  const [da, setDa] = useState(offen);
  /* Beides beim Rendern bestimmt, nicht in einem Effekt. Ein Effekt laeuft
     erst, nachdem der Browser gemalt hat — es stand also noch ein ganzes
     Einzelbild lang alles unveraendert da, obwohl schon geklickt war. Genau
     dieses Loch zwischen Tun und Antwort soll es nicht geben. */
  if (offen && !da) setDa(true);
  const geht = da && !offen;
  useEffect(() => {
    if (!geht) return;
    const uhr = setTimeout(() => setDa(false), 180);
    return () => clearTimeout(uhr);
  }, [geht]);
  if (!da) return null;
  return (
    <div
      className={`${geht ? "schleier-raus" : "schleier-rein"} fixed inset-0 z-50 flex items-center justify-center bg-ink/20 px-4`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-titel"
      onClick={(e) => { if (e.target === e.currentTarget) abbrechen(); }}
    >
      <div ref={kasten} className={`${geht ? "dialog-raus" : "dialog-rein"} w-full max-w-[460px] rounded-md border border-line bg-paper p-5 shadow-[0_18px_50px_rgba(27,30,35,0.16)]`}>
        <h3 id="dialog-titel" className="text-[15px] font-semibold text-ink">{titel}</h3>
        <div className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{text}</div>
        <div className="mt-5 flex justify-end gap-2">
          <Knopf onClick={abbrechen}>Abbrechen</Knopf>
          <Knopf art="primaer" onClick={bestaetigen}>{knopf}</Knopf>
        </div>
      </div>
    </div>
  );
}
