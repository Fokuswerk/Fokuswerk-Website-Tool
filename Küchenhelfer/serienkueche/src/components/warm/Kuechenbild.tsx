"use client";

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
const NAME = ROLLE_NAME;

export function Kuechenbild({
  typ,
  variante,
  zeileId = "Z1",
  hoehe = 260,
  mitNamen = true,
  waehlbar = false,
  gewaehlt = null,
  moeglich,
  onWaehle,
}: {
  typ: Kuechentyp;
  variante: VarianteRoh;
  zeileId?: string;
  hoehe?: number;
  mitNamen?: boolean;
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
  const randUnten = mitNamen ? 560 : 160;
  const randOben = waehlbar ? 300 : 140;
  const vb = `${-randX} ${-randOben} ${zeile.laenge + 2 * randX} ${RH + randOben + randUnten}`;

  return (
    <svg
      viewBox={vb}
      style={{ height: hoehe, width: "100%" }}
      className="block max-w-full"
      role="img"
      aria-label={`Die Küche von vorn: ${plaetze.map((p) => NAME[rolleVon(p.modulId)]).filter(Boolean).join(", ")}`}
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

      {/* Arbeitsplatte */}
      <rect x={0} y={y(AP_OK)} width={zeile.laenge} height={PLATTE} rx={14} className="fill-kohle" />

      {/* Schränke und Geräte */}
      {plaetze.map((p) => {
        const rolle = rolleVon(p.modulId);
        const hoch = rolle === "kuehlschrank" || rolle === "backofen";
        const oben = hoch ? SOCKEL + HOCH_H : SOCKEL + KORPUS;
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
              height={oben - SOCKEL}
              rx={R}
              className={hoch ? "fill-papier" : "fill-papier"}
            />
            <rect
              x={p.von + 16}
              y={y(oben)}
              width={p.breite - 32}
              height={oben - SOCKEL}
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

      {/* Namen darunter */}
      {mitNamen &&
        plaetze.map((p) => {
          const n = NAME[rolleVon(p.modulId)];
          if (!n || p.breite < 400) return null;
          // Lange Wörter wie "Spülmaschine" sind breiter als ein 60er Schrank.
          // Deshalb abwechselnd zwei Zeilen: so stösst nichts aneinander.
          const zweite = p.index % 2 === 1;
          return (
            <text
              key={`n-${p.index}`}
              x={p.von + p.breite / 2}
              y={RH + (zweite ? 420 : 260)}
              textAnchor="middle"
              fontSize={135}
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontWeight={500}
              className="fill-kohle-2"
            >
              {n}
            </text>
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

import { kuechenwaende, wandlaenge, zeilenStart, WANDNAME, type Raumangaben, type WandId } from "@/lib/planer";

const ECKE: Record<WandId, { x: (b: number, t: number) => number; y: (b: number, t: number) => number }> = {
  haupt: { x: (b) => b / 2, y: () => -300 },
  gegenueber: { x: (b) => b / 2, y: (_b, t) => t + 400 },
  links: { x: () => -330, y: (_b, t) => t / 2 },
  rechts: { x: (b) => b + 330, y: (_b, t) => t / 2 },
};

/**
 * Der Raum von oben. Zeigt, welche Wand gerade gemeint ist — ohne das
 * weiss niemand, worauf sich eine Frage bezieht.
 */
export function Raumbild({
  raum,
  hervorhebung,
  hoehe = 210,
}: {
  raum: Raumangaben;
  hervorhebung?: WandId | null;
  hoehe?: number;
}) {
  const { breite, tiefe } = raum;
  const rand = 560;
  const waende = kuechenwaende(raum);

  const zeilenRect = (w: WandId) => {
    const t = 560;
    const start = zeilenStart(raum, w);
    const laenge = Math.max(0, Math.min(raum.nutz[w], wandlaenge(raum, w) - start));
    if (w === "haupt") return { x: start, y: 0, w: laenge, h: t };
    if (w === "gegenueber") return { x: start, y: tiefe - t, w: laenge, h: t };
    if (w === "links") return { x: 0, y: start, w: t, h: laenge };
    return { x: breite - t, y: start, w: t, h: laenge };
  };

  const aufWand = (w: WandId, von: number, lang: number, dicke: number) => {
    if (w === "haupt") return { x: von, y: -dicke / 2, w: lang, h: dicke };
    if (w === "gegenueber") return { x: von, y: tiefe - dicke / 2, w: lang, h: dicke };
    if (w === "links") return { x: -dicke / 2, y: von, w: dicke, h: lang };
    return { x: breite - dicke / 2, y: von, w: dicke, h: lang };
  };

  return (
    <svg
      viewBox={`${-rand} ${-rand} ${breite + 2 * rand} ${tiefe + 2 * rand}`}
      style={{ height: hoehe, width: "100%" }}
      className="block max-w-full"
      role="img"
      aria-label={hervorhebung ? `Der Raum von oben, hervorgehoben ist die ${WANDNAME[hervorhebung]}` : "Der Raum von oben"}
    >
      <rect x={0} y={0} width={breite} height={tiefe} rx={70} className="fill-papier" />
      <rect x={0} y={0} width={breite} height={tiefe} rx={70} fill="none" strokeWidth={36} className="stroke-linie-warm" />

      {/* Küchenzeilen */}
      {waende.map((w) => {
        const r = zeilenRect(w);
        if (r.w <= 0 || r.h <= 0) return null;
        return (
          <rect
            key={w}
            x={r.x} y={r.y} width={r.w} height={r.h} rx={46}
            className={hervorhebung && hervorhebung !== w ? "fill-holz/45" : "fill-holz"}
          />
        );
      })}

      {/* Hervorgehobene Wand kräftig markieren */}
      {hervorhebung && (() => {
        const r = aufWand(hervorhebung, 0, wandlaenge(raum, hervorhebung), 150);
        const e = ECKE[hervorhebung];
        return (
          <g>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={70} className="fill-kohle" />
            <text
              x={e.x(breite, tiefe)}
              y={e.y(breite, tiefe)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={210}
              fontWeight={700}
              fontFamily="Plus Jakarta Sans, sans-serif"
              className="fill-kohle"
              transform={
                hervorhebung === "links" || hervorhebung === "rechts"
                  ? `rotate(${hervorhebung === "links" ? -90 : 90} ${e.x(breite, tiefe)} ${e.y(breite, tiefe)})`
                  : undefined
              }
            >
              {WANDNAME[hervorhebung]}
            </text>
          </g>
        );
      })()}

      {/* Fenster und Tür */}
      {raum.fenster && (() => {
        const r = aufWand(raum.fenster.wand, raum.fenster.von, raum.fenster.breite, 170);
        return <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={70} className="fill-salbei" />;
      })()}
      {(() => {
        const r = aufWand(raum.tuer.wand, raum.tuer.von, raum.tuer.breite, 170);
        return <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={70} className="fill-kohle-3" />;
      })()}

      {/* Wasseranschluss als Tropfen */}
      {(() => {
        const w = raum.wasser.wand;
        const p =
          w === "haupt" ? { x: raum.wasser.von, y: 250 }
          : w === "gegenueber" ? { x: raum.wasser.von, y: tiefe - 250 }
          : w === "links" ? { x: 250, y: raum.wasser.von }
          : { x: breite - 250, y: raum.wasser.von };
        return (
          <g>
            <circle cx={p.x} cy={p.y} r={135} className="fill-papier" />
            <circle cx={p.x} cy={p.y} r={135} fill="none" strokeWidth={28} className="stroke-salbei" />
            <path d={`M${p.x} ${p.y - 58} q 52 66 52 106 a 52 52 0 0 1 -104 0 q 0 -40 52 -106 Z`} className="fill-salbei" />
          </g>
        );
      })()}
    </svg>
  );
}
