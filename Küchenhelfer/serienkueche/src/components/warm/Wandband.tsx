"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { planeKueche, zieheAn, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";
import { MODULE } from "@/data/module";

/**
 * Das Band auf der Kante.
 *
 * Es liegt auf der Farbgrenze zwischen Auftaktfoto und dunklem Abschnitt und
 * ragt in beide hinein. Wer es anfasst, zieht seine eigene Wand auf Maß und
 * sieht darunter die Küche, die dort wirklich hineingeht.
 *
 * Drei Dinge sind an dieser Stelle schon durchgefallen: ein Regler mit Preis
 * ("da soll noch kein preis stehen"), ein Regler mit den Sätzen des Planers
 * ("wirkt billig, weil das so schnell springt alles") und ein angeschnittenes
 * Stücklistenblatt. Daraus folgt dreierlei:
 *
 * KEIN PREIS. Nirgends, auch kein "ab". Eine Zahl, bevor jemand etwas über
 * seinen Fall gesagt hat, ist keine Auskunft, sondern Behauptung.
 *
 * NICHTS SPRINGT. Das war nie ein Gestaltungsfehler, sondern der Planer:
 * besteAnordnung() sucht für jede Wandlänge alle Permutationen neu und
 * bewertet global. Gemessen bleiben dabei im Mittel 14,9 Prozent der Zeile an
 * ihrem Platz, bei 226 von 240 Zehn-Millimeter-Schritten bricht mehr als die
 * Hälfte weg, größter Einzelsprung neun Module. Hier läuft deshalb zieheAn():
 * die Reihenfolge wird einmal gerechnet und nie wieder angefasst. Verändert
 * wird ausschließlich das rechte Ende — erst die Passleiste, dann ein Schrank
 * mehr oder weniger. Das ist auch bautechnisch die ehrliche Antwort: wer eine
 * Zeile verlängert, hängt hinten etwas an.
 *
 * DER MASSSTAB IST FEST. Die längste Wand füllt die Breite, kürzere lassen
 * rechts Platz. Ein 60er-Schrank ist deshalb immer gleich breit, und die
 * Zeichnung wächst zur Seite, statt zu zoomen.
 *
 * Gezeichnet wird die Draufsicht, nicht der Aufriss: ein Aufriss hat ein
 * Seitenverhältnis um 1,4 und wird in einem 1240 px breiten Band über 600 px
 * hoch. Die Draufsicht liegt bei 4,4 und passt. Sie ist außerdem die Sprache,
 * in der dieses Werkzeug ohnehin spricht — Wand, Maß, Kette.
 */

const START = 3400;
const MIN = 2400;
const MAX = 4800;
const RASTER = 10;
/** Luft links und rechts, damit Maßkette und Endstück nicht am Rand kleben. */
const RAND = 180;
const SPANNE = MAX + 2 * RAND;
/** Höhe des Zeichenfeldes in Millimetern: Wand, Schränke, Maßkette. */
const HOCH = 1180;
const KETTE_Y = 980;

/* Was in einem Kasten steckt. Nur Geräte bekommen ein Wort — ein Schrank, der
   ein Schrank ist, braucht keine Beschriftung. */
const MARKE: Record<string, string> = {
  SP: "SPÜLE",
  KF: "HERD",
  GS: "SPÜLER",
  HK: "KÜHL",
  KS: "KÜHL",
  HB: "OFEN",
  MU: "MÜLL",
};

const BREITE: Record<string, number> = Object.fromEntries(
  MODULE.filter((m) => m.breite).map((m) => [m.id, m.breite as number]),
);

const mmBreite = (id: string) => (id.startsWith("PBX:") ? Number(id.slice(4)) : (BREITE[id] ?? 0));

const meter = (mm: number) => (mm / 1000).toLocaleString("de-DE", { minimumFractionDigits: 2 });

function raumMit(wand: number): Raumangaben {
  return {
    ...STANDARD_RAUM,
    form: "eine-wand",
    breite: wand,
    tiefe: 2600,
    nutz: { haupt: wand, links: 2600, rechts: 2600, gegenueber: wand },
    fenster: { wand: "haupt", von: Math.min(1850, wand - 1200), breite: 1200 },
  };
}

export function Wandband() {
  const [wand, setzeWand] = useState(START);
  const [beruehrt, setzeBeruehrt] = useState(false);
  const huelle = useRef<HTMLDivElement>(null);
  const zug = useRef<{ x: number; start: number; proMm: number } | null>(null);

  /* Einmal gerechnet, nie wieder: ab hier steht die Reihenfolge fest. */
  const basis = useMemo(() => Object.values(planeKueche(raumMit(START), "arbeiten").belegung).flat(), []);
  const ids = useMemo(() => zieheAn(basis, wand - START), [basis, wand]);

  const fensterVon = Math.min(1850, wand - 1200);

  /* Lage jedes Kastens in Millimetern. Zeichnung und Maßkette kommen aus
     derselben Liste, deshalb sitzen die Schrägstriche exakt auf den Fugen. */
  const kaesten = useMemo(() => {
    let x = 0;
    return (ids ?? []).map((id) => {
      const breite = mmBreite(id);
      const k = { id, von: x, breite, blende: id.startsWith("PBX:"), marke: MARKE[id.slice(0, 2)] ?? "" };
      x += breite;
      return k;
    });
  }, [ids]);

  const blende = kaesten.find((k) => k.blende);
  const schraenke = kaesten.filter((k) => !k.blende).length;

  /* Die eine Zeile darunter kommt aus den Maßen, nicht aus dem Marketing — und
     sie sagt auch, wenn etwas nicht geht. Ein Werkzeug, das immer eine Zahl
     ausspuckt, glaubt einem niemand. */
  const satz = !ids
    ? `${meter(wand)} m gehen mit diesen Schränken nicht auf: es bliebe ein Streifen unter 2 cm, und das ist keine Passleiste mehr, sondern eine Fuge.`
    : blende
      ? `${schraenke} Schränke in festen Serienbreiten, dazu ${Math.round(blende.breite / 10)} cm Rest. Daraus wird eine Passleiste, vor Ort zugeschnitten — das ist normal und nicht der Fehler, nach dem es aussieht.`
      : `${schraenke} Schränke, kein Rest. Diese Wandlänge geht in Serienbreiten genau auf.`;

  const rechtsProzent = ((RAND + wand) / SPANNE) * 100;

  function fasseAn(e: React.PointerEvent<HTMLButtonElement>) {
    const breitePx = huelle.current?.getBoundingClientRect().width ?? 0;
    if (!breitePx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    zug.current = { x: e.clientX, start: wand, proMm: breitePx / SPANNE };
    setzeBeruehrt(true);
  }

  function ziehe(e: React.PointerEvent<HTMLButtonElement>) {
    const z = zug.current;
    if (!z) return;
    const roh = z.start + (e.clientX - z.x) / z.proMm;
    const neu = Math.max(MIN, Math.min(MAX, Math.round(roh / RASTER) * RASTER));
    if (neu !== wand) setzeWand(neu);
  }

  function lassLos(e: React.PointerEvent<HTMLButtonElement>) {
    zug.current = null;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function perTaste(e: React.KeyboardEvent<HTMLButtonElement>) {
    const richtung = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!richtung) return;
    e.preventDefault();
    setzeBeruehrt(true);
    setzeWand((w) => Math.max(MIN, Math.min(MAX, w + richtung * (e.shiftKey ? 100 : RASTER))));
  }

  /* Ein Schrägstrich bei 45 Grad, wie in der Bauzeichnung. */
  const Schraeg = ({ bei, stark = false }: { bei: number; stark?: boolean }) => (
    <line
      x1={RAND + bei - 46}
      x2={RAND + bei + 46}
      y1={KETTE_Y + 58}
      y2={KETTE_Y - 58}
      stroke="currentColor"
      strokeWidth={stark ? 15 : 9}
      className={stark ? "text-kohle" : "text-kohle-3"}
    />
  );

  return (
    <div className="nicht-drucken relative z-10">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
        <div className="border border-linie-stark bg-creme px-4 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
            <div className="vorzeile">Deine Wand</div>
            <div className="ziffern text-[12.5px] text-kohle-3 sm:text-[13px]">
              {beruehrt ? "gezogen" : "angenommen"} ·{" "}
              <span className="font-semibold text-kohle">{meter(wand)} m</span>
            </div>
          </div>

          <div ref={huelle} className="relative mt-3 w-full sm:mt-4">
            <svg
              viewBox={`0 0 ${SPANNE} ${HOCH}`}
              className="block w-full"
              role="img"
              aria-label={`Grundriss von oben: Wand ${meter(wand)} Meter, ${schraenke} Schränke`}
            >
              {/* Die Wand, 110 mm stark, als Riegel von oben. */}
              <rect x={RAND} y={0} width={wand} height={110} className="fill-kohle" />
              {/* Das Fenster ist der Ausschnitt in der Wand, kein Symbol daneben. */}
              <rect x={RAND + fensterVon} y={12} width={1200} height={86} className="fill-creme" />
              <line
                x1={RAND + fensterVon}
                x2={RAND + fensterVon + 1200}
                y1={55}
                y2={55}
                stroke="currentColor"
                strokeWidth={12}
                className="text-kohle"
              />

              {/* Die Schränke hängen an der Wand, 600 mm tief. */}
              {kaesten.map((k) => (
                <g key={`${k.id}-${k.von}`}>
                  <rect
                    x={RAND + k.von}
                    y={110}
                    width={k.breite}
                    height={600}
                    fill={k.blende ? "var(--color-messing-soft)" : "var(--color-papier)"}
                    stroke={k.blende ? "var(--color-messing)" : "var(--color-linie-stark)"}
                    strokeWidth={11}
                    strokeDasharray={k.blende ? "44 34" : undefined}
                  />
                  {k.marke && k.breite >= 430 && (
                    <text
                      x={RAND + k.von + k.breite / 2}
                      y={452}
                      textAnchor="middle"
                      fill="var(--color-kohle-3)"
                      style={{ fontFamily: "var(--font-data)", fontSize: 132, letterSpacing: 10 }}
                    >
                      {k.marke}
                    </text>
                  )}
                </g>
              ))}

              {/* Wasseranschluss: angenommen, nicht gemessen — also gestrichelt. */}
              <line
                x1={RAND + Math.min(2500, wand - 300)}
                x2={RAND + Math.min(2500, wand - 300)}
                y1={110}
                y2={760}
                stroke="currentColor"
                strokeWidth={11}
                strokeDasharray="52 42"
                className="text-kohle-3"
              />

              {/* Die Maßkette. Durchgezogen, was in fester Serienbreite steht;
                  gestrichelt das Reststück. Vor der ersten Berührung ist alles
                  gestrichelt: noch hat niemand etwas über seine Wand gesagt. */}
              <line
                x1={RAND}
                x2={RAND + (blende ? blende.von : wand)}
                y1={KETTE_Y}
                y2={KETTE_Y}
                stroke="currentColor"
                strokeWidth={14}
                className={beruehrt ? "text-kohle" : "text-kohle-3"}
                strokeDasharray={beruehrt ? undefined : "90 66"}
              />
              {blende && (
                <line
                  x1={RAND + blende.von}
                  x2={RAND + wand}
                  y1={KETTE_Y}
                  y2={KETTE_Y}
                  stroke="var(--color-messing)"
                  strokeWidth={14}
                  strokeDasharray="56 44"
                />
              )}
              {kaesten.map((k) => (
                <Schraeg key={`s-${k.von}`} bei={k.von} />
              ))}
              <Schraeg bei={0} stark />
              <Schraeg bei={wand} stark />
            </svg>

            {/* Der Griff IST das Endstück der Maßkette, kein Reglerknopf. */}
            <button
              type="button"
              role="slider"
              aria-label="Länge deiner Wand"
              aria-valuemin={MIN}
              aria-valuemax={MAX}
              aria-valuenow={wand}
              aria-valuetext={`${meter(wand)} Meter`}
              onPointerDown={fasseAn}
              onPointerMove={ziehe}
              onPointerUp={lassLos}
              onPointerCancel={lassLos}
              onKeyDown={perTaste}
              className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none items-center justify-center rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kohle"
              style={{ left: `${rechtsProzent}%`, top: `${(KETTE_Y / HOCH) * 100}%` }}
            >
              {/* Rändelstriche rechts vom Schrägstrich: das ist ein Griff, keine
                  Verzierung. Kein mitlaufendes "Ziehen"-Etikett — das war schon
                  einmal "zu dick". Der Griff muss es selbst sagen. */}
              <span
                aria-hidden="true"
                className="ml-4 flex items-center gap-[3px] border border-linie-stark bg-papier px-[5px] py-[7px]"
              >
                <span className="block h-[14px] w-[2px] bg-kohle" />
                <span className="block h-[14px] w-px bg-kohle-3" />
                <span className="block h-[14px] w-[2px] bg-kohle" />
              </span>
            </button>
          </div>

          {/* Feste Höhe: beim Ziehen darf hier nichts nachrutschen. */}
          <p className="mt-2 min-h-[4.3em] max-w-[64ch] text-[14px] leading-snug text-kohle-2 sm:mt-3 sm:min-h-[2.9em] sm:text-[15px]">
            {satz}
          </p>

          <Link
            href={`/kueche?wand=${wand}`}
            className="group inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-kohle"
          >
            Weiter mit diesen Maßen
            <ArrowRight size={15} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
