"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { alsKuechentyp, angleichen, planeKueche, STANDARD_RAUM } from "@/lib/planer";
import { baueUnterlagen } from "@/lib/unterlagen";

/**
 * Das Blatt, das am Ende herauskommt — als Beweis auf der Startseite.
 *
 * Hier standen nacheinander zwei Versuche, das Rechnen vorzuführen: erst ein
 * Regler mit einem Preis daran, dann einer mit den Sätzen des Planers. Beide
 * verlangten erst eine Handlung und gaben dann etwas Abstraktes zurück, und
 * beim Ziehen sprang die ganze Küche — das sieht billig aus, egal wie richtig
 * die Zahlen dahinter sind.
 *
 * Was dieses Werkzeug von jedem Konfigurator unterscheidet, ist nicht die
 * Rechnerei, sondern was am Ende dasteht: jede Position mit Artikelnummer,
 * jeder Anschluss mit Maß und Höhe, ein Zuschnittplan mit den Ausschnitten für
 * Kochfeld und Spüle. Das zeigt sonst niemand, bevor man unterschrieben hat.
 * Also zeigen wir es — das echte Blatt, aus derselben Rechnung, nur
 * angeschnitten.
 */

const RAUM = angleichen({ ...STANDARD_RAUM, breite: 3400 });

/** Nur Zeilen mit Positionsnummer: die lassen sich in der Zeichnung wiederfinden. */
const ZEILEN = 8;

export function Beweisblatt() {
  const vorschlag = planeKueche(RAUM, "arbeiten");
  const u = baueUnterlagen(RAUM, alsKuechentyp(RAUM), vorschlag);
  const mm = (x: number) => x.toLocaleString("de-DE");
  const eur = (x: number) => `${Math.round(x).toLocaleString("de-DE")} €`;

  const kette = u.massketten[0];
  const zeilen = u.liste.slice(0, ZEILEN);
  const anschluesse = u.anschluesse.length;
  const ausschnitte = u.zuschnitt.platten.reduce((s, p) => s + p.ausschnitte.length, 0);

  return (
    <div className="grid items-start gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Das Blatt. Angeschnitten, weil es weitergeht. */}
      <div className="min-w-0">
        <div className="vertieft relative overflow-hidden rounded-[14px] bg-papier">
          <div className="max-h-[420px] overflow-hidden px-4 pb-0 pt-4 sm:max-h-[500px] sm:px-6 sm:pt-6">
            <div className="border-b border-linie-warm pb-2.5 sm:flex sm:items-baseline sm:justify-between sm:gap-4">
              <span className="vorzeile">Unterlagen zur Anfrage</span>
              <span className="ziffern mt-0.5 block text-[11.5px] text-kohle-3 sm:mt-0">
                Vorgang {u.kopf.vorgang} · {u.kopf.erstellt}
              </span>
            </div>

            {/* Die Maßkette. Ein Bild der Küche steht weiter unten auf der
                Seite; hier zählt, dass jede Position ein Maß hat und die
                Summe aufgeht. */}
            <div className="mt-4 hidden sm:block">
              <div className="ziffern mb-1.5 flex items-baseline justify-between text-[10.5px] uppercase tracking-[0.07em] text-kohle-3">
                <span>Maßkette {kette.wand}</span>
                <span>{mm(kette.laenge)} mm</span>
              </div>
              <svg viewBox={`0 0 ${kette.laenge} 300`} className="block w-full" role="img" aria-label="Maßkette der Hauptwand">
                {kette.positionen.map((pos) => (
                  <g key={pos.nr}>
                    <rect
                      x={pos.von + 6}
                      y={96}
                      width={pos.breite - 12}
                      height={110}
                      rx={10}
                      className="fill-creme-2"
                    />
                    <path d={`M${pos.von} 24 V74 M${pos.bis} 24 V74`} strokeWidth={6} className="stroke-kohle-3" />
                    <path d={`M${pos.von} 49 H${pos.bis}`} strokeWidth={6} className="stroke-kohle-3" />
                    <text
                      x={(pos.von + pos.bis) / 2}
                      y={44}
                      textAnchor="middle"
                      className="fill-kohle"
                      style={{ fontSize: 62, fontFamily: "var(--schrift-data, monospace)" }}
                    >
                      {pos.breite}
                    </text>
                    <circle cx={(pos.von + pos.bis) / 2} cy={151} r={46} className="fill-kohle" />
                    <text
                      x={(pos.von + pos.bis) / 2}
                      y={151}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-papier"
                      style={{ fontSize: 56, fontFamily: "var(--schrift-data, monospace)", fontWeight: 700 }}
                    >
                      {pos.nr}
                    </text>
                  </g>
                ))}
                <path d={`M0 240 H${kette.laenge}`} strokeWidth={6} className="stroke-linie-warm" />
                <path d={`M0 228 V252 M${kette.laenge} 228 V252`} strokeWidth={8} className="stroke-kohle" />
                <text
                  x={kette.laenge / 2}
                  y={296}
                  textAnchor="middle"
                  className="fill-kohle-2"
                  style={{ fontSize: 58, fontFamily: "var(--schrift-data, monospace)" }}
                >
                  {mm(kette.laenge)} mm, Summe geht auf
                </text>
              </svg>
            </div>

            <table className="mt-5 w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-linie-warm text-[10.5px] uppercase tracking-[0.07em] text-kohle-3">
                  <th className="w-[42px] pb-1.5 font-medium">Pos</th>
                  <th className="pb-1.5 font-medium">Bezeichnung</th>
                  <th className="hidden pb-1.5 font-medium sm:table-cell">Artikel</th>
                  <th className="pb-1.5 text-right font-medium">Netto</th>
                </tr>
              </thead>
              <tbody className="ziffern text-[12.5px] text-kohle-2">
                {zeilen.map((z) => (
                  <tr key={z.bezeichnung + z.artikel} className="border-b border-linie-warm/60">
                    <td className="py-[7px] font-semibold text-kohle">{z.pos}</td>
                    <td className="py-[7px] pr-3 leading-snug">{z.bezeichnung}</td>
                    <td className="hidden py-[7px] pr-3 text-kohle-3 sm:table-cell">{z.artikel}</td>
                    <td className="py-[7px] text-right">{eur(z.summe)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Der Anschnitt: das Blatt geht weiter, man sieht nur den Anfang. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-papier" />
        </div>
        <p className="ziffern mt-3 text-[12px] text-kohle-3">
          Ausschnitt aus einem echten Blatt — gerechnet für eine 3,40-m-Wand, Ausstattung mittel.
        </p>
      </div>

      {/* Was darauf steht. Zahlen, keine Versprechen. */}
      <div className="border-t border-linie-warm pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-1">
        <h3 className="gross text-[21px] font-bold leading-tight text-kohle sm:text-[24px]">
          Nicht „Küche&nbsp;komplett: {eur(u.gesamt).replace(" ", "\u00a0")}“.
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-kohle-2">
          Sondern jede Position einzeln, mit Artikelnummer und Preis — und alles, was ein Monteur
          und ein Elektriker brauchen, bevor sie kommen.
        </p>

        <dl className="ziffern mt-6 space-y-3.5 border-t border-linie-warm pt-5">
          {[
            [`${u.liste.length} Positionen`, "vom Hochschrank bis zur Passleiste, einzeln ausgewiesen"],
            [`${anschluesse} Anschlüsse`, "jeder mit Maß ab Wandanfang und Höhe über dem Boden"],
            [`${ausschnitte} Ausschnitte`, "Zuschnittplan für die Platte, mit Kochfeld und Spüle"],
          ].map(([zahl, satz]) => (
            <div key={zahl} className="flex gap-3.5">
              <dt className="gross w-[112px] shrink-0 text-[15px] font-bold leading-snug text-kohle">
                {zahl}
              </dt>
              <dd className="text-[13.5px] leading-snug text-kohle-2">{satz}</dd>
            </div>
          ))}
        </dl>

        <Link
          href="/kueche"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#3b382f] to-kohle px-6 py-3 text-[15px] font-semibold text-creme shadow-[0_1px_2px_rgba(21,20,15,.2),0_10px_24px_-10px_rgba(21,20,15,.55),inset_0_1px_0_rgba(255,255,255,.14)] transition-colors hover:from-[#474338] hover:to-[#211f18]"
        >
          Für deinen Raum rechnen
          <ArrowRight size={16} strokeWidth={2.2} />
        </Link>
        <div className="mt-2.5 text-[12.5px] text-kohle-3">
          Fünf Minuten. Kein Konto, kein Termin.
        </div>
      </div>
    </div>
  );
}
