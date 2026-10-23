"use client";

import { modul } from "@/data/module";
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

const SOCKEL = 150;
const KORPUS = 720;
const PLATTE = 45;
const AP_OK = SOCKEL + KORPUS + PLATTE;
const OS_UK = 1460;
const OS_H = 700;
const HOCH_H = 2060;
const R = 34;

type Rolle = "kuehlschrank" | "backofen" | "spuele" | "herd" | "spuelmaschine" | "schrank" | "leiste";

function rolleVon(id: string): Rolle {
  if (id === "HK600") return "kuehlschrank";
  if (id === "HB600") return "backofen";
  if (id === "SP600") return "spuele";
  if (id === "KF600") return "herd";
  if (id === "GS600") return "spuelmaschine";
  if (modul(id).kategorie === "blende") return "leiste";
  return "schrank";
}

const NAME: Record<Rolle, string> = {
  kuehlschrank: "Kühlschrank",
  backofen: "Backofen",
  spuele: "Spüle",
  herd: "Herd",
  spuelmaschine: "Spülmaschine",
  schrank: "Schrank",
  leiste: "",
};

export function Kuechenbild({
  typ,
  variante,
  zeileId = "Z1",
  hoehe = 260,
  mitNamen = true,
}: {
  typ: Kuechentyp;
  variante: VarianteRoh;
  zeileId?: string;
  hoehe?: number;
  mitNamen?: boolean;
}) {
  const zeile = typ.zeilen.find((z) => z.id === zeileId);
  if (!zeile) return null;
  const RH = 2500;
  const y = (w: number) => RH - w;
  const plaetze = platzierung(variante, zeileId);
  const fenster = typ.oeffnungen.filter((o) => o.art === "fenster" && o.wand === zeile.wand);

  const randX = 180;
  const randUnten = mitNamen ? 420 : 160;
  const vb = `${-randX} ${-140} ${zeile.laenge + 2 * randX} ${RH + 140 + randUnten}`;

  return (
    <svg
      viewBox={vb}
      style={{ height: hoehe, width: "100%" }}
      className="block max-w-full"
      role="img"
      aria-label={`Die Küche von vorn: ${plaetze.map((p) => NAME[rolleVon(p.modulId)]).filter(Boolean).join(", ")}`}
    >
      {/* Wand */}
      <rect x={-randX} y={-140} width={zeile.laenge + 2 * randX} height={RH + 140} rx={40} className="fill-creme-2" />

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
                className="stroke-butter"
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
                <path d={`M${p.von + p.breite - 150} ${y(oben - 1050)} V${y(oben - 1420)}`} strokeWidth={26} strokeLinecap="round" className="stroke-butter" />
                <path d={`M${p.von + p.breite - 150} ${y(oben - 420)} V${y(oben - 640)}`} strokeWidth={26} strokeLinecap="round" className="stroke-butter" />
              </>
            )}

            {/* Backofen: Klappe mit Fenster */}
            {rolle === "backofen" && (
              <>
                <rect x={p.von + 110} y={y(1560)} width={p.breite - 220} height={520} rx={20} className="fill-kohle" />
                <path d={`M${p.von + 160} ${y(1620)} H${p.von + p.breite - 160}`} strokeWidth={26} strokeLinecap="round" className="stroke-butter" />
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
                  <circle key={dx} cx={mitte + dx} cy={y(AP_OK + 56)} r={42} className="fill-butter" />
                ))}
                <path d={`M${p.von + 130} ${y(SOCKEL + 300)} H${p.von + p.breite - 130}`} strokeWidth={22} strokeLinecap="round" className="stroke-linie-warm" />
              </>
            )}

            {/* Spülmaschine: Bedienleiste und Griff */}
            {rolle === "spuelmaschine" && (
              <>
                <rect x={p.von + 110} y={y(SOCKEL + KORPUS - 40)} width={p.breite - 220} height={90} rx={18} className="fill-kohle" />
                <path d={`M${p.von + 170} ${y(SOCKEL + 230)} H${p.von + p.breite - 170}`} strokeWidth={26} strokeLinecap="round" className="stroke-butter" />
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
                <path d={`M${mitte - 110} ${y(SOCKEL + 560)} H${mitte + 110}`} strokeWidth={24} strokeLinecap="round" className="stroke-butter-2" />
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
          return (
            <text
              key={`n-${p.index}`}
              x={p.von + p.breite / 2}
              y={RH + 260}
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
    </svg>
  );
}

/** Der Raum von oben, bewusst einfach gehalten. */
export function Raumbild({ typ, hoehe = 200 }: { typ: Kuechentyp; hoehe?: number }) {
  const { breite, tiefe } = typ.raum;
  const rand = 420;
  return (
    <svg
      viewBox={`${-rand} ${-rand} ${breite + 2 * rand} ${tiefe + 2 * rand}`}
      style={{ height: hoehe, width: "100%" }}
      className="block max-w-full"
      role="img"
      aria-label="Der Raum von oben"
    >
      <rect x={0} y={0} width={breite} height={tiefe} rx={60} className="fill-papier" />
      <rect x={0} y={0} width={breite} height={tiefe} rx={60} fill="none" strokeWidth={34} className="stroke-linie-warm" />

      {typ.zeilen.map((z) => {
        const t = 560;
        const r =
          z.wand === "nord" ? { x: z.start, y: 0, w: z.laenge, h: t }
          : z.wand === "sued" ? { x: z.start, y: tiefe - t, w: z.laenge, h: t }
          : z.wand === "west" ? { x: 0, y: z.start, w: t, h: z.laenge }
          : { x: breite - t, y: z.start, w: t, h: z.laenge };
        return <rect key={z.id} x={r.x} y={r.y} width={r.w} height={r.h} rx={44} className="fill-butter-2" />;
      })}

      {typ.oeffnungen.map((o) => {
        const d = 150;
        const r =
          o.wand === "nord" ? { x: o.von, y: -d / 2, w: o.breite, h: d }
          : o.wand === "sued" ? { x: o.von, y: tiefe - d / 2, w: o.breite, h: d }
          : o.wand === "west" ? { x: -d / 2, y: o.von, w: d, h: o.breite }
          : { x: breite - d / 2, y: o.von, w: d, h: o.breite };
        return (
          <rect
            key={o.id}
            x={r.x} y={r.y} width={r.w} height={r.h} rx={60}
            className={o.art === "fenster" ? "fill-salbei" : "fill-kohle-3"}
          />
        );
      })}

      {typ.zwangspunkte.map((z) => {
        const d = 230;
        const p =
          z.wand === "nord" ? { x: z.von + z.breite / 2, y: 180 }
          : z.wand === "sued" ? { x: z.von + z.breite / 2, y: tiefe - 180 }
          : z.wand === "west" ? { x: 180, y: z.von + z.breite / 2 }
          : { x: breite - 180, y: z.von + z.breite / 2 };
        return (
          <g key={z.id}>
            <circle cx={p.x} cy={p.y} r={d / 2} className="fill-papier" />
            <circle cx={p.x} cy={p.y} r={d / 2} fill="none" strokeWidth={26} className="stroke-salbei" />
            <path
              d={`M${p.x} ${p.y - 52} q 46 60 46 96 a 46 46 0 0 1 -92 0 q 0 -36 46 -96 Z`}
              className="fill-salbei"
            />
          </g>
        );
      })}
    </svg>
  );
}
