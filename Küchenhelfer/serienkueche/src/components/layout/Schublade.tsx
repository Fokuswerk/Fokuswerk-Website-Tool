"use client";

import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { auslauf, feder, gummiband, ruhigGestellt, type Federlauf } from "@/lib/feder";

/**
 * Die Navigation als Schublade — eine, die man anfassen kann.
 *
 * Vorher: sie erschien mit einem Aufblenden von unten, obwohl sie am linken
 * Rand sitzt, und beim Schließen war sie ohne Übergang einfach weg. Was
 * nach links verschwindet, muss von links wiederkommen, sonst verliert man
 * den Faden, wo das Ding eigentlich wohnt.
 *
 * Jetzt folgt sie dem Finger eins zu eins, nimmt beim Loslassen dessen
 * Schwung mit und lässt sich mitten in der Bewegung wieder packen und
 * umdrehen. Ob sie zugeht, entscheidet nicht die Stelle, an der losgelassen
 * wurde, sondern die, an der sie von allein ausrollen würde — ein kurzer
 * Schnipser reicht also.
 */
export function Schublade({
  offen,
  schliessen,
  kasten,
  children,
}: {
  offen: boolean;
  schliessen: () => void;
  /** Für Fokusfalle und Escape — kommt von useOverlay. */
  kasten: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const [da, setDa] = useState(offen);
  const schleier = useRef<HTMLDivElement>(null);
  const stelle = useRef(0);
  const lauf = useRef<Federlauf | null>(null);
  const ziel = useRef(0);
  const frisch = useRef(true);

  const breite = () => kasten.current?.offsetWidth || 272;

  const setzeStelle = useCallback((x: number) => {
    stelle.current = x;
    const p = kasten.current;
    if (p) p.style.transform = `translate3d(${x}px,0,0)`;
    const s = schleier.current;
    // Der Schleier hängt an der Schublade, nicht an einer eigenen Uhr: wer
    // sie halb herauszieht, sieht den Raum dahinter halb abgedunkelt.
    if (s) s.style.opacity = String(Math.max(0, Math.min(1, 1 + x / (breite() || 1))));
  }, [kasten]);

  const laufeZu = useCallback((wohin: number, tempo?: number, danach?: () => void) => {
    // Kein harter Schnitt beim Umdrehen: was noch in Fahrt ist, gibt sein
    // Tempo an die neue Bewegung weiter.
    const v = tempo ?? lauf.current?.tempo() ?? 0;
    lauf.current?.halt();
    ziel.current = wohin;
    if (ruhigGestellt()) {
      setzeStelle(wohin);
      lauf.current = null;
      danach?.();
      return;
    }
    lauf.current = feder({
      von: stelle.current,
      tempo: v,
      ziel: wohin,
      // Die Werte für eine Schublade: sie kommt mit Schwung aus der Geste,
      // also darf sie ein Stück überschwingen.
      daempfung: 0.8,
      antwort: 0.3,
      bei: setzeStelle,
      fertig: () => { lauf.current = null; danach?.(); },
    });
  }, [setzeStelle]);

  useLayoutEffect(() => {
    if (offen) setDa(true);
  }, [offen]);

  useLayoutEffect(() => {
    if (!da) { frisch.current = true; return; }
    if (frisch.current) {
      frisch.current = false;
      // Vor dem ersten Malen ganz draußen stehen, sonst blitzt sie auf.
      setzeStelle(-breite());
    }
    if (offen) laufeZu(0);
    else if (ziel.current === 0) laufeZu(-breite(), undefined, () => setDa(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [da, offen]);

  useLayoutEffect(() => () => lauf.current?.halt(), []);

  /** Wo der Finger aufsetzte, wo die Schublade dabei stand, und die letzten
      Punkte seines Wegs — aus denen kommt das Tempo beim Loslassen. */
  const griff = useRef<{ x0: number; y0: number; stelle0: number; los: boolean; spur: Array<{ t: number; x: number }> } | null>(null);

  const anfassen = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // Mitten im Flug greifbar: die Feder hält an, wo sie gerade steht.
    lauf.current?.halt();
    lauf.current = null;
    griff.current = { x0: e.clientX, y0: e.clientY, stelle0: stelle.current, los: false, spur: [{ t: e.timeStamp, x: e.clientX }] };
  };

  const ziehen = (e: React.PointerEvent) => {
    const g = griff.current;
    if (!g) return;
    const dx = e.clientX - g.x0;
    const dy = e.clientY - g.y0;
    if (!g.los) {
      // Beide Gesten laufen erst nebeneinander. Erst wenn klar ist, welche
      // gemeint war, verliert die andere — senkrecht gehört der Liste.
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) >= Math.abs(dx)) { griff.current = null; return; }
      g.los = true;
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    }
    g.spur.push({ t: e.timeStamp, x: e.clientX });
    if (g.spur.length > 6) g.spur.shift();
    const b = breite();
    const roh = g.stelle0 + dx;
    // Nach rechts ist nichts mehr: sie folgt noch, aber immer weniger.
    setzeStelle(roh > 0 ? gummiband(roh, b) : Math.max(-b, roh));
  };

  const loslassen = () => {
    const g = griff.current;
    griff.current = null;
    if (!g?.los) return;
    const b = breite();
    // Tempo aus den letzten Punkten, nicht aus dem allerletzten Sprung —
    // ein einzelnes Ereignis kurz vor dem Abheben liegt oft bei null.
    const a = g.spur[0];
    const z = g.spur[g.spur.length - 1];
    const v = ((z.x - a.x) / Math.max(1, z.t - a.t)) * 1000;
    const endstelle = stelle.current + auslauf(v);
    if (endstelle < -b / 2) {
      laufeZu(-b, v, () => setDa(false));
      schliessen();
    } else {
      laufeZu(0, v);
    }
  };

  if (!da) return null;

  return (
    <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-label="Navigation">
      <div
        ref={schleier}
        className="absolute inset-0 bg-ink/25"
        style={{ opacity: 0 }}
        onClick={schliessen}
      />
      <div
        ref={kasten}
        onPointerDown={anfassen}
        onPointerMove={ziehen}
        onPointerUp={loslassen}
        onPointerCancel={loslassen}
        // Senkrecht darf die Liste darin weiterscrollen; waagerecht gehört
        // die Geste der Schublade.
        style={{ touchAction: "pan-y" }}
        className="relative h-full w-[272px] max-w-[84vw] will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}
