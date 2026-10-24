"use client";

import { useRef, useState } from "react";
import { modul } from "@/data/module";
import { AP_OK, HOCH_H, KORPUS, OS_H, OS_UK, PLATTE, rolleVon, ROLLE_NAME, SOCKEL } from "@/lib/masse";
import { platzierung } from "@/lib/berechnung";
import type { VarianteRoh } from "@/data/varianten";
import type { Kuechentyp } from "@/lib/typen";

/**
 * Die Küche von vorn, so wie man davorsteht.
 *
 * Bewusst keine technische Zeichnung: keine Maßketten, keine Artikelnummern.
 * Stattdessen erkennbare Dinge — Kühlschrank, Spüle, Herd — mit Namen daran.
 * Wer noch nie eine Küche geplant hat, soll auf einen Blick sehen, was wo steht.
 */

const R = 34;

export function Kuechenbild({
  typ,
  variante,
  zeileId = "Z1",
  hoehe = 260,
  volleBreite = false,
  nummernAb,
  waehlbar = false,
  gewaehlt = null,
  moeglich,
  onWaehle,
}: {
  typ: Kuechentyp;
  variante: VarianteRoh;
  zeileId?: string;
  hoehe?: number;
  /** Die Zeichnung nimmt die volle Breite und richtet die Höhe danach —
      so, wie eine Zeichnung in einem Dokument stehen soll. */
  volleBreite?: boolean;
  /** Positionsnummern wie im Küchenplan, fortlaufend ab dieser Zahl.
      Dieselbe Nummer steht später in der Stückliste. */
  nummernAb?: number;
  /** Schränke anfassbar machen, um sie zu tauschen. */
  waehlbar?: boolean;
  /** Angefasster Schrank, als Platz in der Zeile. */
  gewaehlt?: number | null;
  /** Welche Plätze als Ziel in Frage kommen. Ohne Angabe: alle. */
  moeglich?: (index: number) => boolean;
  onWaehle?: (index: number) => void;
}) {
  const zeile = typ.zeilen.find((z) => z.id === zeileId);
  if (!zeile) return null;
  const RH = 2500;
  const y = (w: number) => RH - w;
  const plaetze = platzierung(variante, zeileId);
  const fenster = typ.oeffnungen.filter((o) => o.art === "fenster" && o.wand === zeile.wand);

  const randX = 180;
  const randUnten = nummernAb !== undefined ? 360 : 150;
  const randOben = waehlbar ? 300 : 140;
  const vb = `${-randX} ${-randOben} ${zeile.laenge + 2 * randX} ${RH + randOben + randUnten}`;

  return (
    <svg
      viewBox={vb}
      style={volleBreite ? { width: "100%", height: "auto" } : { height: hoehe, width: "100%" }}
      className="block max-w-full"
      role="img"
      aria-label={`Die Küche von vorn: ${plaetze.map((p) => ROLLE_NAME[rolleVon(p.modulId)]).filter(Boolean).join(", ")}`}
    >
      {/* Wand */}
      <rect x={-randX} y={-randOben} width={zeile.laenge + 2 * randX} height={RH + randOben} rx={40} className="fill-creme-2" />

      {/* Fenster */}
      {fenster.map((f) => {
        const von = Math.max(0, f.von - zeile.start);
        const br = f.bruestung ?? 900;
        const h = f.hoehe ?? 1400;
        return (
          <g key={f.id}>
            {/* Als Fenster erkennbar machen: heller Ausschnitt, kraeftiger
                Rahmen, Sprossen und eine Bank darunter. Ohne das liest es
                sich wie ein hoher Schrank. */}
            <rect x={von} y={y(br + h)} width={f.breite} height={h} rx={20} className="fill-papier" />
            <rect
              x={von} y={y(br + h)} width={f.breite} height={h} rx={20}
              fill="none" strokeWidth={30} className="stroke-kohle-3"
            />
            <path
              d={`M${von + f.breite / 2} ${y(br + h)} V${y(br)} M${von} ${y(br + h / 2)} H${von + f.breite}`}
              strokeWidth={20}
              className="stroke-kohle-3"
            />
            <rect x={von - 70} y={y(br)} width={f.breite + 140} height={46} rx={16} className="fill-kohle-3" />
          </g>
        );
      })}

      {/* Hängeschränke, nur wo kein Hochschrank und kein Fenster */}
      {plaetze.map((p) => {
        const r = rolleVon(p.modulId);
        if (r === "kuehlschrank" || r === "backofen" || r === "leiste") return null;
        const stoert = fenster.some((f) => {
          const v = f.von - zeile.start;
          return p.von < v + f.breite && p.bis > v;
        });
        if (stoert) return null;
        const herd = r === "herd";
        return (
          <g key={`os-${p.index}`}>
            <rect
              x={p.von + 16}
              y={y(OS_UK + OS_H)}
              width={p.breite - 32}
              height={herd ? OS_H * 0.6 : OS_H}
              rx={R}
              className={herd ? "fill-kohle" : "fill-papier"}
            />
            {!herd && (
              <path
                d={`M${p.von + p.breite / 2} ${y(OS_UK + OS_H - 90)} V${y(OS_UK + 90)}`}
                strokeWidth={10}
                className="stroke-linie-warm"
              />
            )}
            {herd && (
              <path
                d={`M${p.von + 150} ${y(OS_UK + OS_H * 0.6 - 150)} H${p.von + p.breite - 150}`}
                strokeWidth={22}
                strokeLinecap="round"
                className="stroke-kohle-2"
              />
            )}
          </g>
        );
      })}

      {/* Arbeitsplatte — nur dort, wo sie wirklich liegt. Vor einem
          Hochschrank gibt es keine, sonst steht sie als Stummel in der Front. */}
      {(() => {
        const stuecke: Array<{ von: number; bis: number }> = [];
        for (const p of plaetze) {
          const r = rolleVon(p.modulId);
          if (r === "kuehlschrank" || r === "backofen") continue;
          const letztes = stuecke[stuecke.length - 1];
          if (letztes && letztes.bis === p.von) letztes.bis = p.bis;
          else stuecke.push({ von: p.von, bis: p.bis });
        }
        return stuecke.map((st) => (
          <rect key={st.von} x={st.von} y={y(AP_OK)} width={st.bis - st.von} height={PLATTE} rx={14} className="fill-kohle" />
        ));
      })()}

      {/* Schränke und Geräte */}
      {plaetze.map((p) => {
        const rolle = rolleVon(p.modulId);
        const hoch = rolle === "kuehlschrank" || rolle === "backofen";
        // Hochschraenke schliessen oben mit den Haengeschraenken ab und
        // stehen auf dem eigenen Sockel — genau wie im raeumlichen Bild.
        const oben = hoch ? HOCH_H : SOCKEL + KORPUS;
        const unten = hoch ? 0 : SOCKEL;
        const mitte = p.von + p.breite / 2;

        if (rolle === "leiste") {
          return (
            <rect
              key={p.index}
              x={p.von + 6}
              y={y(oben)}
              width={Math.max(10, p.breite - 12)}
              height={oben - SOCKEL}
              rx={12}
              className="fill-creme"
            />
          );
        }

        return (
          <g key={p.index}>
            <rect
              x={p.von + 16}
              y={y(oben)}
              width={p.breite - 32}
              height={oben - unten}
              rx={R}
              className="fill-papier"
            />
            <rect
              x={p.von + 16}
              y={y(oben)}
              width={p.breite - 32}
              height={oben - unten}
              rx={R}
              fill="none"
              strokeWidth={12}
              className="stroke-linie-warm"
            />

            {/* Kühlschrank: Tür mit Griff */}
            {rolle === "kuehlschrank" && (
              <>
                <path d={`M${p.von + 16} ${y(oben - 760)} H${p.von + p.breite - 16}`} strokeWidth={12} className="stroke-linie-warm" />
                <path d={`M${p.von + p.breite - 150} ${y(oben - 1050)} V${y(oben - 1420)}`} strokeWidth={26} strokeLinecap="round" className="stroke-kohle-2" />
                <path d={`M${p.von + p.breite - 150} ${y(oben - 420)} V${y(oben - 640)}`} strokeWidth={26} strokeLinecap="round" className="stroke-kohle-2" />
              </>
            )}

            {/* Backofen: Klappe mit Fenster */}
            {rolle === "backofen" && (
              <>
                <rect x={p.von + 110} y={y(1560)} width={p.breite - 220} height={520} rx={20} className="fill-kohle" />
                <path d={`M${p.von + 160} ${y(1620)} H${p.von + p.breite - 160}`} strokeWidth={26} strokeLinecap="round" className="stroke-kohle-2" />
              </>
            )}

            {/* Spüle: Becken und Armatur auf der Platte */}
            {rolle === "spuele" && (
              <>
                <rect x={mitte - 210} y={y(AP_OK + 30)} width={420} height={70} rx={24} className="fill-kohle" />
                <path
                  d={`M${mitte + 170} ${y(AP_OK + 30)} V${y(AP_OK + 330)} q0 -120 -150 -120`}
                  fill="none"
                  strokeWidth={34}
                  strokeLinecap="round"
                  className="stroke-kohle"
                />
                <path d={`M${p.von + 130} ${y(SOCKEL + 400)} H${p.von + p.breite - 130}`} strokeWidth={22} strokeLinecap="round" className="stroke-linie-warm" />
              </>
            )}

            {/* Herd: Platten auf der Arbeitsfläche */}
            {rolle === "herd" && (
              <>
                <rect x={mitte - 230} y={y(AP_OK + 26)} width={460} height={60} rx={18} className="fill-kohle" />
                {[-165, -55, 55, 165].map((dx) => (
                  <circle key={dx} cx={mitte + dx} cy={y(AP_OK + 56)} r={42} className="fill-kohle-2" />
                ))}
                <path d={`M${p.von + 130} ${y(SOCKEL + 300)} H${p.von + p.breite - 130}`} strokeWidth={22} strokeLinecap="round" className="stroke-linie-warm" />
              </>
            )}

            {/* Spülmaschine: Bedienleiste und Griff */}
            {rolle === "spuelmaschine" && (
              <>
                <rect x={p.von + 110} y={y(SOCKEL + KORPUS - 40)} width={p.breite - 220} height={90} rx={18} className="fill-kohle" />
                <path d={`M${p.von + 170} ${y(SOCKEL + 230)} H${p.von + p.breite - 170}`} strokeWidth={26} strokeLinecap="round" className="stroke-kohle-2" />
              </>
            )}

            {/* Schrank: Auszüge */}
            {rolle === "schrank" && (
              <>
                {[0.33, 0.66].map((f) => (
                  <path
                    key={f}
                    d={`M${p.von + 70} ${y(SOCKEL + KORPUS * f)} H${p.von + p.breite - 70}`}
                    strokeWidth={12}
                    className="stroke-linie-warm"
                  />
                ))}
                <path d={`M${mitte - 110} ${y(SOCKEL + 560)} H${mitte + 110}`} strokeWidth={24} strokeLinecap="round" className="stroke-kohle-3" />
              </>
            )}
          </g>
        );
      })}

      {/* Sockel und Boden */}
      <rect x={0} y={y(SOCKEL)} width={zeile.laenge} height={SOCKEL} className="fill-creme" />
      <path d={`M${-randX} ${RH} H${zeile.laenge + randX}`} strokeWidth={16} strokeLinecap="round" className="stroke-linie-warm" />

      {/* Positionsnummern. Namen passen unter einen 60er Schrank nie — ein
          Wort wie "Spülmaschine" ist breiter als der Schrank selbst. Im
          Küchenplan steht deshalb die Nummer, und daneben die Liste. */}
      {nummernAb !== undefined &&
        plaetze.map((p) => {
          if (p.breite < 200) return null;
          const cx = p.von + p.breite / 2;
          return (
            <g key={`nr-${p.index}`}>
              <circle cx={cx} cy={RH + 190} r={118} className="fill-papier stroke-linie-stark" strokeWidth={14} />
              <text
                x={cx}
                y={RH + 190}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={140}
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight={700}
                className="fill-kohle"
              >
                {nummernAb + p.index}
              </text>
            </g>
          );
        })}
      {/* Fassflächen zum Umstellen. Ganz oben, damit nichts dazwischenkommt. */}
      {waehlbar &&
        plaetze.map((p) => {
          const aktiv = gewaehlt === p.index;
          // Angefasst ist moeglicherweise ein Schrank an einer anderen Wand —
          // dann hat diese Zeile keine Auswahl, zeigt aber trotzdem Ziele.
          const offen = (gewaehlt !== null && gewaehlt !== undefined) || !!moeglich;
          const ziel = offen && !aktiv && (moeglich ? moeglich(p.index) : true);
          return (
            <g key={`fass-${p.index}`} onClick={() => onWaehle?.(p.index)} style={{ cursor: "pointer" }}>
              <rect
                x={p.von + 16}
                y={y(HOCH_H)}
                width={Math.max(10, p.breite - 32)}
                height={HOCH_H}
                rx={40}
                className={
                  aktiv
                    ? "fill-kohle/[0.14] stroke-kohle"
                    : ziel
                      ? "fill-transparent stroke-kohle/35 hover:fill-kohle/[0.07]"
                      : offen
                        ? "fill-transparent stroke-transparent"
                        : "fill-transparent stroke-transparent hover:fill-kohle/[0.05] hover:stroke-kohle/25"
                }
                strokeWidth={aktiv ? 26 : 14}
                strokeDasharray={aktiv ? undefined : "40 46"}
              />
              {aktiv && (
                <text
                  x={p.von + p.breite / 2}
                  y={y(HOCH_H) - 90}
                  textAnchor="middle"
                  fontSize={135}
                  fontWeight={700}
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  className="fill-kohle"
                >
                  ausgewählt
                </text>
              )}
            </g>
          );
        })}
    </svg>
  );
}


/* ------------------------------------------------------------------ */

import { kuechenwaende, wandlaenge, zeilenBereich, WANDNAME, type Raumangaben, type WandId } from "@/lib/planer";

/** Wo der Name einer Wand steht, ausserhalb des Raums. */
const NAMENSPLATZ: Record<WandId, (b: number, t: number) => { x: number; y: number; dreh: number }> = {
  haupt: (b) => ({ x: b / 2, y: -340, dreh: 0 }),
  gegenueber: (b, t) => ({ x: b / 2, y: t + 470, dreh: 0 }),
  links: (_b, t) => ({ x: -390, y: t / 2, dreh: -90 }),
  rechts: (b, t) => ({ x: b + 390, y: t / 2, dreh: 90 }),
};

/**
 * Der Raum von oben, als kleiner Grundriss.
 *
 * Bewusst wie ein Plan gezeichnet und nicht wie ein Schaubild: weisse
 * Flaeche, kraeftige Wandlinien, die Kueche als Band an der Wand, das
 * Fenster als Unterbrechung in der Wand, die Tuer mit Aufschlag. Dieselben
 * Farben wie auf dem hochgeladenen Grundriss, damit beide Bilder desselben
 * Raums zusammenpassen.
 */
/** Was sich im Grundriss an seine Wand schieben lässt. */
export type Ziehbar = "fenster" | "tuer" | "wasser";

export function Raumbild({
  raum,
  hervorhebung,
  hoehe = 210,
  volleBreite = false,
  ziehen,
}: {
  raum: Raumangaben;
  hervorhebung?: WandId | null;
  hoehe?: number;
  /** Volle Breite statt fester Höhe — für die Unterlagen. */
  volleBreite?: boolean;
  /** Macht ein Element im Plan greifbar: anfassen und an der Wand
      entlangschieben. Genauer als ein Regler, weil man sieht, wohin. */
  ziehen?: { was: Ziehbar; setze: (von: number) => void };
}) {
  const { breite, tiefe } = raum;
  const rand = 760;
  const svgRef = useRef<SVGSVGElement>(null);
  const [zieht, setZieht] = useState(false);
  const waende = kuechenwaende(raum);
  const WD = 110; // Wandstaerke in der Zeichnung
  const KT = 600; // Korpustiefe

  /**
   * Die vier Waende laufen im Uhrzeigersinn, genau wie im raeumlichen Bild
   * und in der Auflage auf dem hochgeladenen Grundriss: Hauptwand von links
   * nach rechts, rechte Wand von oben nach unten, Wand gegenueber von rechts
   * nach links, linke Wand von unten nach oben. Vorher lief diese Skizze auf
   * den beiden letzten Waenden andersherum — dann lag die Tuer, die man im
   * Grundriss rechts hingezogen hatte, hier links.
   */
  const laengsZuPlan = (w: WandId, von: number, lang: number) => {
    if (w === "haupt") return { x: von, y: 0, laengs: lang, quer: 0 };
    if (w === "rechts") return { x: breite, y: von, laengs: 0, quer: lang };
    if (w === "gegenueber") return { x: breite - von - lang, y: tiefe, laengs: lang, quer: 0 };
    return { x: 0, y: tiefe - von - lang, laengs: 0, quer: lang };
  };

  /** Ein Stueck Wand als Rechteck, mittig auf der Raumkante. */
  const aufWand = (w: WandId, von: number, lang: number, dicke: number) => {
    const g = laengsZuPlan(w, von, lang);
    const quer = w === "haupt" || w === "gegenueber";
    return {
      x: quer ? g.x : g.x - dicke / 2,
      y: quer ? g.y - dicke / 2 : g.y,
      w: quer ? lang : dicke,
      h: quer ? dicke : lang,
    };
  };

  /** Das Band, auf dem die Kueche steht. */
  const zeilenRect = (w: WandId) => {
    const { start, laenge } = zeilenBereich(raum, w);
    const g = laengsZuPlan(w, start, laenge);
    if (w === "haupt") return { x: g.x, y: 0, w: laenge, h: KT };
    if (w === "rechts") return { x: breite - KT, y: g.y, w: KT, h: laenge };
    if (w === "gegenueber") return { x: g.x, y: tiefe - KT, w: laenge, h: KT };
    return { x: 0, y: g.y, w: KT, h: laenge };
  };

  /** Ein einzelner Punkt auf einer Wand, in Planmassen. */
  const punktAufWand = (w: WandId, von: number, tief: number) => {
    if (w === "haupt") return { x: von, y: tief };
    if (w === "rechts") return { x: breite - tief, y: von };
    if (w === "gegenueber") return { x: breite - von, y: tiefe - tief };
    return { x: tief, y: tiefe - von };
  };

  const istAktiv = (w: WandId) => hervorhebung === w;

  // --- Anfassen und schieben --------------------------------------------
  const greifWand: WandId | null =
    ziehen?.was === "fenster" ? raum.fenster?.wand ?? null
    : ziehen?.was === "tuer" ? raum.tuer.wand
    : ziehen?.was === "wasser" ? raum.wasser.wand
    : null;
  const greifBreite =
    ziehen?.was === "fenster" ? raum.fenster?.breite ?? 0
    : ziehen?.was === "tuer" ? raum.tuer.breite
    : 0;

  /** Zeigerposition in Millimeter entlang der Wand. Rechnet die Verzerrung
      heraus, die entsteht, weil das Bild mittig eingepasst wird. */
  const mmUnterZeiger = (e: React.PointerEvent): number | null => {
    const el = svgRef.current;
    if (!el || !greifWand) return null;
    const r = el.getBoundingClientRect();
    const vbW = breite + 2 * rand;
    const vbH = tiefe + 2 * rand;
    const faktor = Math.min(r.width / vbW, r.height / vbH);
    const links = (r.width - vbW * faktor) / 2;
    const oben = (r.height - vbH * faktor) / 2;
    const ux = -rand + (e.clientX - r.left - links) / faktor;
    const uy = -rand + (e.clientY - r.top - oben) / faktor;
    // Dieselbe Richtung wie die Zeichnung: zwei Waende laufen rueckwaerts.
    const laengs =
      greifWand === "haupt" ? ux
      : greifWand === "rechts" ? uy
      : greifWand === "gegenueber" ? breite - ux
      : tiefe - uy;
    const max = Math.max(0, wandlaenge(raum, greifWand) - greifBreite);
    return Math.round(Math.min(max, Math.max(0, laengs - greifBreite / 2)) / 10) * 10;
  };

  const schiebe = (e: React.PointerEvent) => {
    const mm = mmUnterZeiger(e);
    if (mm !== null) ziehen!.setze(mm);
  };

  /** Zeigerposition in Planmassen — fuer die Frage, ob der Griff getroffen ist. */
  const planUnterZeiger = (e: React.PointerEvent): { x: number; y: number } | null => {
    const el = svgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const vbW = breite + 2 * rand;
    const vbH = tiefe + 2 * rand;
    const faktor = Math.min(r.width / vbW, r.height / vbH);
    return {
      x: -rand + (e.clientX - r.left - (r.width - vbW * faktor) / 2) / faktor,
      y: -rand + (e.clientY - r.top - (r.height - vbH * faktor) / 2) / faktor,
    };
  };

  /** Trifft der Zeiger den Griff oder das Element selbst?
      Vorher reagierte die ganze Flaeche: ein Tipp irgendwo in den Plan hat
      Fenster, Tuer oder Anschluss verschoben. */
  const aufGriff = (e: React.PointerEvent): boolean => {
    if (!greifWand) return false;
    const z = planUnterZeiger(e);
    if (!z) return false;
    const von =
      ziehen!.was === "fenster" ? raum.fenster?.von ?? 0
      : ziehen!.was === "tuer" ? raum.tuer.von
      : raum.wasser.von;
    const mitte = von + greifBreite / 2;
    const g = punktAufWand(greifWand, mitte, -330);
    if (Math.hypot(z.x - g.x, z.y - g.y) <= 560) return true;
    // Oder auf dem Element selbst, mit etwas Luft quer zur Wand.
    const a = punktAufWand(greifWand, von, 0);
    const b = punktAufWand(greifWand, von + greifBreite, 0);
    const quer = 260;
    return (
      z.x >= Math.min(a.x, b.x) - quer && z.x <= Math.max(a.x, b.x) + quer &&
      z.y >= Math.min(a.y, b.y) - quer && z.y <= Math.max(a.y, b.y) + quer
    );
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`${-rand} ${-rand} ${breite + 2 * rand} ${tiefe + 2 * rand}`}
      style={{
        ...(volleBreite ? { width: "100%", height: "auto" } : { height: hoehe, width: "100%" }),
        // Senkrecht scrollen muss moeglich bleiben; erst waehrend des Ziehens
        // gehoert die Geste ganz dem Griff.
        touchAction: ziehen ? (zieht ? "none" : "pan-y") : undefined,
      }}
      onPointerDown={ziehen ? (e) => {
        if (!aufGriff(e)) return;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setZieht(true);
        schiebe(e);
      } : undefined}
      onPointerMove={ziehen && zieht ? schiebe : undefined}
      onPointerUp={ziehen ? () => setZieht(false) : undefined}
      onPointerCancel={ziehen ? () => setZieht(false) : undefined}
      className={`block max-w-full ${ziehen ? "cursor-grab active:cursor-grabbing select-none" : ""}`}
      role="img"
      aria-label={
        hervorhebung
          ? `Der Raum von oben, hervorgehoben ist die ${WANDNAME[hervorhebung]}`
          : "Der Raum von oben"
      }
    >
      {/* Bodenflaeche */}
      <rect x={0} y={0} width={breite} height={tiefe} className="fill-papier" />

      {/* Kuechenbaender */}
      {waende.map((w) => {
        const r = zeilenRect(w);
        if (r.w <= 0 || r.h <= 0) return null;
        return (
          <g key={w}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} className="fill-holz-soft" />
            <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="none" strokeWidth={22} className="stroke-holz" />
          </g>
        );
      })}

      {/* Wandlinien. Die angefasste Wand wird kraeftig. */}
      {(["haupt", "rechts", "gegenueber", "links"] as WandId[]).map((w) => {
        const r = aufWand(w, 0, wandlaenge(raum, w), WD);
        return (
          <rect
            key={w}
            x={r.x} y={r.y} width={r.w} height={r.h}
            className={istAktiv(w) ? "fill-kohle" : "fill-kohle-3"}
          />
        );
      })}

      {/* Fenster: Unterbrechung in der Wand mit duenner Scheibe */}
      {raum.fenster && (() => {
        const f = raum.fenster;
        const leer = aufWand(f.wand, f.von, f.breite, WD + 8);
        const glas = aufWand(f.wand, f.von, f.breite, 26);
        return (
          <g>
            <rect x={leer.x} y={leer.y} width={leer.w} height={leer.h} className="fill-papier" />
            <rect x={glas.x} y={glas.y} width={glas.w} height={glas.h} className="fill-salbei" />
          </g>
        );
      })()}

      {/* Tuer: Oeffnung in der Wand und der Aufschlag als Viertelkreis */}
      {(() => {
        const t = raum.tuer;
        const leer = aufWand(t.wand, t.von, t.breite, WD + 8);
        const b = t.breite;
        // Das Band haengt am Anfang der Oeffnung und schlaegt in den Raum.
        const anf = punktAufWand(t.wand, t.von, 0);
        const ecke =
          t.wand === "haupt" ? { x: anf.x, y: anf.y, d: `a${b} ${b} 0 0 1 ${b} ${b}` }
          : t.wand === "rechts" ? { x: anf.x, y: anf.y, d: `a${b} ${b} 0 0 1 ${-b} ${b}` }
          : t.wand === "gegenueber" ? { x: anf.x, y: anf.y, d: `a${b} ${b} 0 0 1 ${-b} ${-b}` }
          : { x: anf.x, y: anf.y, d: `a${b} ${b} 0 0 1 ${b} ${-b}` };
        return (
          <g>
            <rect x={leer.x} y={leer.y} width={leer.w} height={leer.h} className="fill-papier" />
            <path
              d={`M${ecke.x} ${ecke.y} ${ecke.d}`}
              fill="none"
              strokeWidth={24}
              strokeDasharray="70 70"
              className="stroke-kohle-3"
            />
          </g>
        );
      })()}

      {/* Wasseranschluss */}
      {(() => {
        const w = raum.wasser.wand;
        const p = punktAufWand(w, raum.wasser.von, 210);
        return (
          <g>
            <circle cx={p.x} cy={p.y} r={160} className="fill-papier" />
            <circle cx={p.x} cy={p.y} r={160} fill="none" strokeWidth={26} className="stroke-kohle-2" />
            <path
              d={`M${p.x} ${p.y - 72} q 62 80 62 126 a 62 62 0 0 1 -124 0 q 0 -46 62 -126 Z`}
              className="fill-kohle-2"
            />
          </g>
        );
      })()}

      {/* Wandnamen rundherum */}
      {(["haupt", "rechts", "gegenueber", "links"] as WandId[]).map((w) => {
        const p = NAMENSPLATZ[w](breite, tiefe);
        return (
          <text
            key={`n-${w}`}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={205}
            fontWeight={istAktiv(w) ? 700 : 500}
            fontFamily="Plus Jakarta Sans, sans-serif"
            className={istAktiv(w) ? "fill-kohle" : "fill-kohle-3"}
            transform={p.dreh ? `rotate(${p.dreh} ${p.x} ${p.y})` : undefined}
          >
            {WANDNAME[w]}
          </text>
        );
      })}

      {/* Der Griff: liegt über dem Element, das gerade geschoben wird. */}
      {ziehen && greifWand && (() => {
        const von =
          ziehen.was === "fenster" ? raum.fenster?.von ?? 0
          : ziehen.was === "tuer" ? raum.tuer.von
          : raum.wasser.von;
        const mitte = von + greifBreite / 2;
        // Der Griff sitzt aussen vor der Wand: so verdeckt er nicht das
        // Fenster oder die Tür, um die es gerade geht.
        const AUS = 330;
        const an = punktAufWand(greifWand, mitte, 0);
        const aussen = punktAufWand(greifWand, mitte, -AUS);
        const p = { x: aussen.x, y: aussen.y, ax: an.x, ay: an.y };
        return (
          <g>
            <path d={`M${p.x} ${p.y} L${p.ax} ${p.ay}`} strokeWidth={26} className="stroke-kohle-3" />
            <circle cx={p.x} cy={p.y} r={zieht ? 250 : 215} className="fill-butter" opacity={0.32} />
            <circle cx={p.x} cy={p.y} r={118} className="fill-kohle" />
            <circle cx={p.x} cy={p.y} r={118} fill="none" strokeWidth={34} className="stroke-papier" />
          </g>
        );
      })()}
    </svg>
  );
}
