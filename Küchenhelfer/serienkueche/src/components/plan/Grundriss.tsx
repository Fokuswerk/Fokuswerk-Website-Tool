"use client";

import { Fragment } from "react";
import { modul } from "@/data/module";
import { platzierung } from "@/lib/berechnung";
import type { VarianteRoh } from "@/data/varianten";
import type { Kuechentyp, Oeffnung, Wandseite, Zeile, Zwangspunkt } from "@/lib/typen";

const WAND = 240;
const TIEFE_US = 600;
const TIEFE_OS = 350;

/** Rechteck auf einer Wand, aus Laufmaß und Breite. */
function aufWand(
  wand: Wandseite,
  von: number,
  breite: number,
  tiefe: number,
  raum: { breite: number; tiefe: number },
) {
  switch (wand) {
    case "nord":
      return { x: von, y: 0, w: breite, h: tiefe };
    case "sued":
      return { x: von, y: raum.tiefe - tiefe, w: breite, h: tiefe };
    case "west":
      return { x: 0, y: von, w: tiefe, h: breite };
    case "ost":
      return { x: raum.breite - tiefe, y: von, w: tiefe, h: breite };
  }
}

/** Lücke in der Wand für eine Öffnung. */
function inWand(wand: Wandseite, von: number, breite: number, raum: { breite: number; tiefe: number }) {
  switch (wand) {
    case "nord":
      return { x: von, y: -WAND, w: breite, h: WAND };
    case "sued":
      return { x: von, y: raum.tiefe, w: breite, h: WAND };
    case "west":
      return { x: -WAND, y: von, w: WAND, h: breite };
    case "ost":
      return { x: raum.breite, y: von, w: WAND, h: breite };
  }
}

function Tuerbogen({ o, raum }: { o: Oeffnung; raum: { breite: number; tiefe: number } }) {
  const b = o.breite;
  const links = o.anschlag !== "rechts";
  let px = 0, py = 0, bx = 0, by = 0, ex = 0, ey = 0, sweep = 1;

  if (o.wand === "nord" || o.wand === "sued") {
    const y = o.wand === "nord" ? 0 : raum.tiefe;
    const ri = o.wand === "nord" ? 1 : -1;
    px = links ? o.von : o.von + b;
    py = y;
    bx = px;
    by = y + ri * b;
    ex = links ? o.von + b : o.von;
    ey = y;
    sweep = links ? (o.wand === "nord" ? 0 : 1) : o.wand === "nord" ? 1 : 0;
  } else {
    const x = o.wand === "west" ? 0 : raum.breite;
    const ri = o.wand === "west" ? 1 : -1;
    px = x;
    py = links ? o.von : o.von + b;
    bx = x + ri * b;
    by = py;
    ex = x;
    ey = links ? o.von + b : o.von;
    sweep = links ? (o.wand === "west" ? 1 : 0) : o.wand === "west" ? 0 : 1;
  }

  return (
    <g fill="none" stroke="currentColor" strokeWidth={22} className="text-ink-3">
      <path d={`M${px} ${py} L${bx} ${by}`} />
      <path d={`M${bx} ${by} A${b} ${b} 0 0 ${sweep} ${ex} ${ey}`} strokeWidth={14} strokeDasharray="60 40" />
    </g>
  );
}

function Masskette({
  x1, y1, x2, y2, text, versatz = 0, senkrecht,
}: {
  x1: number; y1: number; x2: number; y2: number; text: string; versatz?: number; senkrecht?: boolean;
}) {
  const ax = senkrecht ? x1 - versatz : x1;
  const ay = senkrecht ? y1 : y1 - versatz;
  const bx = senkrecht ? x2 - versatz : x2;
  const by = senkrecht ? y2 : y2 - versatz;
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  return (
    <g className="text-accent" stroke="currentColor" fill="none">
      <path d={`M${ax} ${ay} L${bx} ${by}`} strokeWidth={14} />
      {senkrecht ? (
        <>
          <path d={`M${ax - 55} ${ay} H${ax + 55}`} strokeWidth={14} />
          <path d={`M${bx - 55} ${by} H${bx + 55}`} strokeWidth={14} />
        </>
      ) : (
        <>
          <path d={`M${ax} ${ay - 55} V${ay + 55}`} strokeWidth={14} />
          <path d={`M${bx} ${by - 55} V${by + 55}`} strokeWidth={14} />
        </>
      )}
      <text
        x={mx}
        y={senkrecht ? my : my - 60}
        fill="currentColor"
        stroke="none"
        fontSize={150}
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        transform={senkrecht ? `rotate(-90 ${mx} ${my})` : undefined}
        dy={senkrecht ? -60 : 0}
      >
        {text}
      </text>
    </g>
  );
}

function ZwangspunktZeichnung({ z, raum }: { z: Zwangspunkt; raum: { breite: number; tiefe: number } }) {
  const r = aufWand(z.wand, z.von, z.breite, z.art === "heizkoerper" ? 120 : 420, raum);
  const offen = z.freigabe === "offen";
  return (
    <g className={offen ? "text-flag" : "text-ink-3"}>
      <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="currentColor" strokeWidth={22} strokeDasharray={offen ? "70 50" : undefined} />
      {z.art !== "heizkoerper" && (
        <path d={`M${r.x} ${r.y} L${r.x + r.w} ${r.y + r.h} M${r.x + r.w} ${r.y} L${r.x} ${r.y + r.h}`} stroke="currentColor" strokeWidth={16} fill="none" />
      )}
    </g>
  );
}

export function Grundriss({
  typ,
  variante,
  zeigeModule = true,
  zeigeMasse = true,
  gewaehltesModul,
  aufModul,
  hoehe = 420,
}: {
  typ: Kuechentyp;
  variante?: VarianteRoh;
  zeigeModule?: boolean;
  zeigeMasse?: boolean;
  gewaehltesModul?: string | null;
  aufModul?: (schluessel: string | null) => void;
  hoehe?: number;
}) {
  const raum = typ.raum;
  const rand = zeigeMasse ? 1150 : 500;
  const vb = `${-WAND - rand} ${-WAND - rand} ${raum.breite + 2 * WAND + 2 * rand} ${raum.tiefe + 2 * WAND + 2 * rand}`;

  return (
    <svg
      viewBox={vb}
      style={{ height: hoehe, width: "100%" }}
      className="block max-w-full"
      role="img"
      aria-label={`Grundriss ${typ.id}, ${typ.bezeichnung}, Nischenlänge ${typ.zeilen[0].laenge} Millimeter`}
      onClick={() => aufModul?.(null)}
    >
      {/* Wandband */}
      <rect x={-WAND} y={-WAND} width={raum.breite + 2 * WAND} height={raum.tiefe + 2 * WAND} className="fill-ink-3/25" />
      <rect x={0} y={0} width={raum.breite} height={raum.tiefe} className="fill-paper" />

      {/* Öffnungen aus dem Wandband schneiden */}
      {typ.oeffnungen.map((o) => {
        const r = inWand(o.wand, o.von, o.breite, raum);
        return <rect key={`cut-${o.id}`} x={r.x} y={r.y} width={r.w} height={r.h} className="fill-paper" />;
      })}

      {/* Wandkontur */}
      <rect x={-WAND} y={-WAND} width={raum.breite + 2 * WAND} height={raum.tiefe + 2 * WAND} fill="none" stroke="currentColor" strokeWidth={26} className="text-ink" />
      <rect x={0} y={0} width={raum.breite} height={raum.tiefe} fill="none" stroke="currentColor" strokeWidth={26} className="text-ink" />

      {/* Fenster als Doppelstrich, Türen als Bogen */}
      {typ.oeffnungen.map((o) => {
        if (o.art === "fenster") {
          const r = inWand(o.wand, o.von, o.breite, raum);
          const waag = o.wand === "nord" || o.wand === "sued";
          return (
            <g key={o.id} className="text-accent" stroke="currentColor" strokeWidth={30} fill="none">
              {waag ? (
                <>
                  <path d={`M${r.x} ${r.y + r.h * 0.35} H${r.x + r.w}`} />
                  <path d={`M${r.x} ${r.y + r.h * 0.65} H${r.x + r.w}`} />
                </>
              ) : (
                <>
                  <path d={`M${r.x + r.w * 0.35} ${r.y} V${r.y + r.h}`} />
                  <path d={`M${r.x + r.w * 0.65} ${r.y} V${r.y + r.h}`} />
                </>
              )}
            </g>
          );
        }
        return <Tuerbogen key={o.id} o={o} raum={raum} />;
      })}

      {typ.zwangspunkte.map((z) => (
        <ZwangspunktZeichnung key={z.id} z={z} raum={raum} />
      ))}

      {/* Küchenmodule */}
      {zeigeModule && variante &&
        typ.zeilen.map((z: Zeile) => (
          <Fragment key={z.id}>
            {platzierung(variante, z.id).map((p) => {
              const m = modul(p.modulId);
              const r = aufWand(z.wand, z.start + p.von, p.breite, TIEFE_US, raum);
              const schluessel = `${z.id}:${p.index}`;
              const aktiv = gewaehltesModul === schluessel;
              const hoch = m.kategorie === "hochschrank";
              const blende = m.kategorie === "blende";
              return (
                <g
                  key={schluessel}
                  onClick={(e) => {
                    e.stopPropagation();
                    aufModul?.(aktiv ? null : schluessel);
                  }}
                  className={aufModul ? "cursor-pointer" : undefined}
                >
                  <rect
                    x={r.x}
                    y={r.y}
                    width={r.w}
                    height={r.h}
                    className={
                      aktiv
                        ? "fill-accent/35 stroke-accent"
                        : blende
                          ? "fill-flag/18 stroke-flag"
                          : hoch
                            ? "fill-accent/22 stroke-accent"
                            : "fill-accent/10 stroke-accent"
                    }
                    strokeWidth={aktiv ? 34 : 20}
                  />
                  {hoch && (
                    <path
                      d={`M${r.x} ${r.y} L${r.x + r.w} ${r.y + r.h} M${r.x + r.w} ${r.y} L${r.x} ${r.y + r.h}`}
                      className="stroke-accent/45"
                      strokeWidth={14}
                      fill="none"
                    />
                  )}
                  {p.breite >= 450 && (
                    <text
                      x={r.x + r.w / 2}
                      y={r.y + r.h / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={126}
                      fontFamily="IBM Plex Mono, monospace"
                      className="pointer-events-none fill-accent"
                      transform={z.wand === "west" || z.wand === "ost" ? `rotate(-90 ${r.x + r.w / 2} ${r.y + r.h / 2})` : undefined}
                    >
                      {p.breite}
                    </text>
                  )}
                </g>
              );
            })}
            {/* Hängeschränke als feine Linie hinter der Zeile */}
            <g className="text-accent/35">
              {(() => {
                const r = aufWand(z.wand, z.start, z.laenge, TIEFE_OS, raum);
                return (
                  <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="currentColor" strokeWidth={14} strokeDasharray="90 70" />
                );
              })()}
            </g>
          </Fragment>
        ))}

      {/* Raumstempel */}
      <text
        x={raum.breite / 2}
        y={raum.tiefe - 320}
        textAnchor="middle"
        fontSize={150}
        fontFamily="IBM Plex Mono, monospace"
        className="fill-ink-3"
      >
        {typ.id} · {(raum.breite * raum.tiefe / 1_000_000).toFixed(2).replace(".", ",")} m²
      </text>

      {/* Maßketten */}
      {zeigeMasse && (
        <>
          <Masskette x1={0} y1={-WAND} x2={raum.breite} y2={-WAND} versatz={520} text={String(raum.breite)} />
          <Masskette x1={-WAND} y1={0} x2={-WAND} y2={raum.tiefe} versatz={520} text={String(raum.tiefe)} senkrecht />
          {typ.zeilen.map((z) => {
            if (z.wand !== "nord") return null;
            return (
              <Masskette
                key={z.id}
                x1={z.start}
                y1={-WAND}
                x2={z.start + z.laenge}
                y2={-WAND}
                versatz={930}
                text={`Nische ${z.laenge}`}
              />
            );
          })}
        </>
      )}
    </svg>
  );
}
