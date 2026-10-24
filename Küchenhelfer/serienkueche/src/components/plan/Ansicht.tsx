"use client";

import { modul } from "@/data/module";
import { platzierung } from "@/lib/berechnung";
import type { VarianteRoh } from "@/data/varianten";
import type { Anschluss, Kuechentyp } from "@/lib/typen";

/**
 * Wandansicht einer Küchenzeile. Maße in mm, Nullpunkt links unten auf
 * Oberkante Fertigfußboden. In SVG wird y gespiegelt.
 */

const SOCKEL = 150;
const KORPUS = 720;
const PLATTE = 40;
const AP_OK = SOCKEL + KORPUS + PLATTE; // 910
const OS_UK = 1450;
const OS_H = 720;
const HOCH_H = 2060;

const SYMBOL: Record<string, { zeichen: string; farbe: string }> = {
  kaltwasser: { zeichen: "KW", farbe: "text-accent" },
  warmwasser: { zeichen: "WW", farbe: "text-accent" },
  abwasser: { zeichen: "AW", farbe: "text-accent" },
  steckdose: { zeichen: "SD", farbe: "text-accent" },
  herd: { zeichen: "400V", farbe: "text-accent" },
  geschirrspueler: { zeichen: "GS", farbe: "text-accent" },
  dunstabzug: { zeichen: "DA", farbe: "text-accent" },
  kuehlschrank: { zeichen: "KS", farbe: "text-accent" },
};

export function Ansicht({
  typ,
  variante,
  zeileId,
  anschluesse = [],
  gewaehltesModul,
  aufModul,
  hoehe = 300,
  volleBreite = false,
}: {
  typ: Kuechentyp;
  variante: VarianteRoh;
  zeileId: string;
  anschluesse?: Anschluss[];
  gewaehltesModul?: string | null;
  aufModul?: (schluessel: string | null) => void;
  hoehe?: number;
  /** Volle Breite statt fester Hoehe: eine Werkzeichnung soll das Blatt
      ausnutzen, nicht in der Mitte schweben. */
  volleBreite?: boolean;
}) {
  const zeile = typ.zeilen.find((z) => z.id === zeileId);
  if (!zeile) return null;
  const RH = typ.raum.hoehe;
  const y = (wert: number) => RH - wert;
  const plaetze = platzierung(variante, zeileId);

  // Fenster auf derselben Wand wie die Zeile
  const fenster = typ.oeffnungen.filter(
    (o) => o.art === "fenster" && o.wand === zeile.wand,
  );

  // Rechts steht die Hoehenangabe der Arbeitsplatte neben der Zeile — dafuer
  // braucht diese Seite mehr Platz, sonst wird "910 OFF" abgeschnitten.
  const randL = 420;
  const randR = 820;
  const vb = `${-randL} ${-randL} ${zeile.laenge + randL + randR} ${RH + 2 * randL + 300}`;

  return (
    <svg
      viewBox={vb}
      style={volleBreite ? { width: "100%", height: "auto" } : { height: hoehe, width: "100%" }}
      className="block max-w-full"
      role="img"
      aria-label={`Wandansicht ${zeile.bezeichnung}, Länge ${zeile.laenge} Millimeter`}
      onClick={() => aufModul?.(null)}
    >
      {/* Wandfläche */}
      <rect x={0} y={0} width={zeile.laenge} height={RH} className="fill-ground" />
      <rect x={0} y={0} width={zeile.laenge} height={RH} fill="none" strokeWidth={14} className="stroke-line" />

      {/* Fensteröffnung */}
      {fenster.map((f) => {
        const vonLokal = f.von - zeile.start;
        const br = f.bruestung ?? 900;
        const h = f.hoehe ?? 1400;
        return (
          <g key={f.id}>
            <rect x={vonLokal} y={y(br + h)} width={f.breite} height={h} className="fill-paper" />
            <rect
              x={vonLokal}
              y={y(br + h)}
              width={f.breite}
              height={h}
              fill="none"
              strokeWidth={16}
              strokeDasharray="70 50"
              className="stroke-ink-3"
            />
            <text
              x={vonLokal + f.breite / 2}
              y={y(br + h / 2)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={92}
              fontFamily="IBM Plex Mono, monospace"
              className="fill-ink-3"
            >
              FENSTER
            </text>
          </g>
        );
      })}

      {/* Hängeschränke über den Feldern ohne Hochschrank und ohne Fenster */}
      {plaetze.map((p) => {
        const m = modul(p.modulId);
        if (m.kategorie === "hochschrank") return null;
        const stoert = fenster.some((f) => {
          const v = f.von - zeile.start;
          return p.von < v + f.breite && p.bis > v;
        });
        if (stoert) return null;
        const kochfeld = p.modulId === "KF600";
        return (
          <g key={`os-${p.index}`}>
            <rect
              x={p.von + 10}
              y={y(OS_UK + OS_H)}
              width={p.breite - 20}
              height={OS_H}
              className={kochfeld ? "fill-accent/18 stroke-accent/55" : "fill-accent/10 stroke-accent/45"}
              strokeWidth={14}
            />
            {kochfeld && (
              <text
                x={p.von + p.breite / 2}
                y={y(OS_UK + OS_H / 2)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={86}
                fontFamily="IBM Plex Mono, monospace"
                className="fill-accent"
              >
                ESSE
              </text>
            )}
          </g>
        );
      })}

      {/* Arbeitsplatte */}
      <rect x={0} y={y(AP_OK)} width={zeile.laenge} height={PLATTE} className="fill-ink" />

      {/* Unter- und Hochschränke */}
      {plaetze.map((p) => {
        const m = modul(p.modulId);
        const hoch = m.kategorie === "hochschrank";
        const blende = m.kategorie === "blende";
        const schluessel = `${zeileId}:${p.index}`;
        const aktiv = gewaehltesModul === schluessel;
        const oben = hoch ? SOCKEL + HOCH_H : SOCKEL + KORPUS;
        // Im Spuelenschrank sitzen Kalt-, Warm- und Abwasser dicht
        // beieinander. Wo zwei oder mehr Kuerzel stehen, bleibt der
        // Schranktyp weg — er steht in der Stueckliste. Die Anschluesse
        // sind hier das, was gebraucht wird.
        const dicht =
          anschluesse.filter((a) => a.x >= p.von && a.x <= p.bis && a.hoehe < AP_OK).length >= 2;
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
              x={p.von}
              y={y(oben)}
              width={p.breite}
              height={oben - SOCKEL}
              className={
                aktiv
                  ? "fill-accent/35 stroke-accent"
                  : blende
                    ? "fill-flag/20 stroke-flag"
                    : hoch
                      ? "fill-accent/22 stroke-accent"
                      : "fill-accent/12 stroke-accent"
              }
              strokeWidth={aktiv ? 26 : 16}
            />
            {p.breite >= 450 && !dicht && (
              <text
                x={p.von + p.breite / 2}
                // Im Unterschrank sitzt der Name knapp unter der Platte: in
                // der Mitte lag er genau auf den Anschlusszeichen.
                y={hoch ? y(SOCKEL + HOCH_H / 2) : y(AP_OK - 190)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={94}
                fontFamily="IBM Plex Mono, monospace"
                className="pointer-events-none fill-accent"
              >
                {m.artikel.split("-")[0]}
              </text>
            )}
            {p.breite < 450 && (
              <text
                x={p.von + p.breite / 2}
                y={y(SOCKEL + KORPUS / 2)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={80}
                fontFamily="IBM Plex Mono, monospace"
                className="pointer-events-none fill-flag"
              >
                {p.breite}
              </text>
            )}
          </g>
        );
      })}

      {/* Sockel */}
      <rect x={0} y={y(SOCKEL)} width={zeile.laenge} height={SOCKEL} className="fill-ink-3/35" />

      {/* Anschlüsse */}
      {anschluesse.map((a) => {
        const s = SYMBOL[a.art] ?? { zeichen: "?", farbe: "text-accent" };
        const offen = a.freigabe === "offen";
        // Wasser, Warmwasser und Abwasser sitzen im Spuelenschrank dicht
        // beieinander. Steht ein anderer Anschluss direkt darueber, haengt
        // das Kuerzel unter den Punkt statt darueber.
        const darueber = anschluesse.some(
          (b) => b.id !== a.id && Math.abs(b.x - a.x) < 190 && b.hoehe > a.hoehe && b.hoehe - a.hoehe < 320,
        );
        return (
          <g key={a.id} className={offen ? "text-flag" : "text-accent"}>
            <circle cx={a.x} cy={y(a.hoehe)} r={62} fill="currentColor" opacity={offen ? 0.25 : 0.18} />
            <circle cx={a.x} cy={y(a.hoehe)} r={62} fill="none" stroke="currentColor" strokeWidth={18} strokeDasharray={offen ? "40 30" : undefined} />
            <text
              x={a.x}
              y={darueber ? y(a.hoehe) + 180 : y(a.hoehe) - 110}
              textAnchor="middle"
              fontSize={82}
              fontFamily="IBM Plex Mono, monospace"
              fill="currentColor"
            >
              {s.zeichen}
            </text>
          </g>
        );
      })}

      {/* Höhenangabe Arbeitsplatte */}
      <g className="text-ink-3">
        <path d={`M${zeile.laenge + 120} ${y(AP_OK)} H${zeile.laenge + 300}`} stroke="currentColor" strokeWidth={12} fill="none" />
        <text x={zeile.laenge + 320} y={y(AP_OK)} dominantBaseline="central" fontSize={88} fontFamily="IBM Plex Mono, monospace" fill="currentColor">
          {AP_OK} OFF
        </text>
      </g>

      {/* Maßkette unten */}
      <g className="text-accent" stroke="currentColor" fill="none">
        <path d={`M0 ${RH + 230} H${zeile.laenge}`} strokeWidth={14} />
        <path d={`M0 ${RH + 175} V${RH + 285} M${zeile.laenge} ${RH + 175} V${RH + 285}`} strokeWidth={14} />
        <text
          x={zeile.laenge / 2}
          y={RH + 195}
          textAnchor="middle"
          fontSize={108}
          fontFamily="IBM Plex Mono, monospace"
          fill="currentColor"
          stroke="none"
        >
          {zeile.laenge}
        </text>
      </g>
    </svg>
  );
}
