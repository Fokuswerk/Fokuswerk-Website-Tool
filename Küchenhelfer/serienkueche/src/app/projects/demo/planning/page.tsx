"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Lock, Sparkles } from "lucide-react";
import { KUECHENTYPEN, PROJEKT } from "@/data/projekt";
import { modul } from "@/data/module";
import { eur, kennzahlen, platzierung, variantenFuer, variante, zahl } from "@/lib/berechnung";
import { anschluesse, istFreigegeben, offeneFreigaben, typMitFreigabe } from "@/lib/ableitung";
import { arbeitshoeheVon } from "@/lib/masse";
import { useDemo } from "@/store/demo";
import { Grundriss } from "@/components/plan/Grundriss";
import { Ansicht } from "@/components/plan/Ansicht";
import {
  Abschnitt, Flaeche, Hinweisband, Inhalt, Knopf, Marke,
  Seitenkopf, Tabelle, Td, Th, melde,
} from "@/components/ui/kit";

const RECHENSCHRITTE = [
  "Raummodell geladen",
  "Zwangspunkte gesetzt",
  "Regeln K1 und K2 als Nebenbedingungen aufgestellt",
  "Modulfolgen im Raster 600 / 450 / 150 durchsucht",
  "Zulässige Lösungen nach K3 bewertet",
];

const ZIELE = [
  { id: "kosten", label: "Kosten" },
  { id: "stauraum", label: "Stauraum" },
  { id: "ergonomie", label: "Ergonomie" },
  { id: "installation", label: "Installation" },
] as const;

export default function Planung() {
  const { auswahl, freigaben, gewichtung, setzeGewichtung, waehle, generiert, merkeGeneriert } = useDemo();
  const [aktiv, setAktiv] = useState(
    KUECHENTYPEN.find((t) => istFreigegeben(t, freigaben))?.id ?? KUECHENTYPEN[0].id,
  );
  const [lauf, setLauf] = useState<number | null>(null);
  const [modulWahl, setModulWahl] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const starteRef = useRef<(() => void) | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // Bestaetigungen gelten auch im Bild: sonst zeichnet der Grundriss
  // Zwangspunkte weiter als ungeprueft, die oben als fest gelten.
  const typ = typMitFreigabe(KUECHENTYPEN.find((t) => t.id === aktiv)!, freigaben);
  const frei = istFreigegeben(typ, freigaben);
  // Vorher war "generiert || frei" innerhalb des frei-Zweigs immer wahr —
  // der Rechenlauf samt dem Satz "Demo-Simulation, es laeuft kein echter
  // Solver" war unerreichbar. Jetzt zaehlt nur, ob er fuer diesen Typ schon
  // gelaufen ist.
  const gezeigt = generiert.includes(typ.id);
  const gewaehlt = variante(auswahl[typ.id]);
  const varianten = variantenFuer(typ.id);
  const [zeileWahl, setZeileWahl] = useState(typ.zeilen[0].id);
  useEffect(() => {
    setZeileWahl(typ.zeilen[0].id);
    setModulWahl(null);
  }, [typ.id, typ.zeilen]);

  // Beim ersten Oeffnen eines freigegebenen Typs einmal laufen lassen.
  useEffect(() => {
    if (!frei || generiert.includes(typ.id) || lauf !== null) return;
    starteRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typ.id, frei]);

  const starte = () => {
    if (!frei) return;
    setLauf(0);
    let i = 0;
    const weiter = () => {
      i += 1;
      if (i < RECHENSCHRITTE.length) {
        setLauf(i);
        timer.current = setTimeout(weiter, 460);
      } else {
        setLauf(null);
        merkeGeneriert(typ.id);
        melde(`${varianten.length} zulässige Varianten für ${typ.id}.`);
      }
    };
    timer.current = setTimeout(weiter, 460);
  };
  starteRef.current = starte;

  const modulInfo = (() => {
    if (!modulWahl) return null;
    const [zeileId, idxText] = modulWahl.split(":");
    const idx = Number(idxText);
    const p = platzierung(gewaehlt, zeileId)[idx];
    if (!p) return null;
    const m = modul(p.modulId);
    const zeile = typ.zeilen.find((z) => z.id === zeileId)!;
    return { p, m, zeile };
  })();

  const blockierendeOffen = offeneFreigaben(typ, freigaben).filter((p) => p.blockierend);

  const weitereOffen = offeneFreigaben(typ, freigaben).filter((p) => !p.blockierend);

  return (
    <>
      <Seitenkopf
        titel="Küchenplanung"
        kontext={`${typ.id} · ${typ.bezeichnung} · ${typ.wohnungen.length} Einheiten`}
        aktionen={
          frei ? (
            gezeigt ? (
              <Marke ton="ok">{varianten.length} Varianten vorberechnet</Marke>
            ) : (
              <Knopf art="primaer" onClick={starte} deaktiviert={lauf !== null}>
                <Sparkles size={14} strokeWidth={1.8} />
                Varianten generieren
              </Knopf>
            )
          ) : (
            <Marke ton="flag">Typ nicht bestätigt</Marke>
          )
        }
      />

      <Inhalt breit>
        <div className="grid gap-4 xl:grid-cols-[254px_minmax(0,1fr)_330px]">
          {/* Links: Typ, Anforderungen, Gewichtung */}
          <div className="min-w-0 space-y-4">
            <Flaeche className="overflow-hidden">
              <div className="border-b border-line px-3 py-2 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">
                Küchentyp
              </div>
              <ul>
                {KUECHENTYPEN.map((t) => {
                  const tFrei = istFreigegeben(t, freigaben);
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() => setAktiv(t.id)}
                        aria-current={t.id === aktiv ? "true" : undefined}
                        className={`flex w-full items-center gap-2 border-b border-line-2 px-3 py-2 text-left text-[12.5px] transition-colors ${
                          t.id === aktiv ? "bg-accent-soft" : "hover:bg-ground"
                        }`}
                      >
                        <span className="num font-medium text-ink">{t.id}</span>
                        <span className="min-w-0 flex-1 truncate text-ink-2">{t.bezeichnung}</span>
                        {!tFrei && <Lock size={12} strokeWidth={1.8} className="shrink-0 text-flag" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Flaeche>

            <Flaeche className="px-3 py-3">
              <div className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">Anforderungen</div>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[12px]">
                <dt className="text-ink-3">Ausstattung</dt>
                <dd className="text-right text-ink-2">{PROJEKT.ausstattung}</dd>
                <dt className="text-ink-3">Budget je Küche</dt>
                <dd className="num text-right text-ink-2">{eur(PROJEKT.budgetVon)}–{eur(PROJEKT.budgetBis)}</dd>
                <dt className="text-ink-3">Arbeitshöhe</dt>
                <dd className="num text-right text-ink-2">{zahl(arbeitshoeheVon(typ))} mm OFF</dd>
                <dt className="text-ink-3">Raster</dt>
                <dd className="num text-right text-ink-2">600 / 450 / 150</dd>
                <dt className="text-ink-3">Geschirrspüler</dt>
                <dd className="text-right text-ink-2">{typ.id === "K-01" ? "nein" : "ja"}</dd>
              </dl>
            </Flaeche>

            <Flaeche className="px-3 py-3">
              <div className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">
                Gewichtung der Ziele
              </div>
              <p className="mt-1 text-[11px] leading-snug text-ink-3">
                Wirkt auf die Bewertung, nicht auf die Zulässigkeit. Harte Regeln bleiben hart.
              </p>
              <div className="mt-2.5 space-y-2.5">
                {ZIELE.map((z) => (
                  <div key={z.id}>
                    <label htmlFor={`g-${z.id}`} className="flex items-baseline justify-between text-[12px]">
                      <span className="text-ink-2">{z.label}</span>
                      <span className="num text-ink-3">{gewichtung[z.id]}</span>
                    </label>
                    <input
                      id={`g-${z.id}`}
                      type="range"
                      min={0}
                      max={50}
                      step={5}
                      value={gewichtung[z.id]}
                      onChange={(e) => setzeGewichtung({ [z.id]: Number(e.target.value) })}
                      style={{ ["--fuell" as string]: `${(gewichtung[z.id] / 50) * 100}%` }}
                      className="pro-schieber mt-1 w-full cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </Flaeche>
          </div>

          {/* Mitte: Pläne */}
          <div className="min-w-0">
            {!frei ? (
              <Flaeche className="px-6 py-10 text-center">
                <Lock size={20} strokeWidth={1.5} className="mx-auto text-flag" />
                <div className="mt-2.5 text-[14px] font-medium text-ink">Planung für {typ.id} gesperrt</div>
                <p className="mx-auto mt-1.5 max-w-[60ch] text-[12.5px] leading-relaxed text-ink-2">
                  {/* Gezaehlt werden nur die Punkte, die wirklich sperren —
                      sonst stand hier "Es fehlen 3 Bestaetigungen", waehrend
                      die Raumpruefung fuer denselben Typ "fehlen 2" sagte. */}
                  Es fehlen {blockierendeOffen.length}{" "}
                  {blockierendeOffen.length === 1 ? "Bestätigung" : "Bestätigungen"}:{" "}
                  {blockierendeOffen.map((p) => p.titel).join(", ")}. Ein Vorschlag auf
                  unbestätigten Maßen sähe gültig aus, ohne es zu sein — deshalb erzeugt das Werkzeug
                  hier keinen.
                  {weitereOffen.length > 0 && (
                    <>
                      {" "}Zusätzlich offen, sperrt aber nicht:{" "}
                      {weitereOffen.map((p) => p.titel).join(", ")}.
                    </>
                  )}
                </p>
                <div className="mt-4">
                  <Knopf href="/projects/demo/rooms" art="primaer">Zur Raumprüfung<ArrowRight size={13} strokeWidth={1.8} /></Knopf>
                </div>
              </Flaeche>
            ) : lauf !== null ? (
              <Flaeche className="px-6 py-10">
                <div className="mx-auto max-w-[440px]">
                  <div className="laufband relative h-[3px] w-full overflow-hidden rounded-full bg-line-2">
                    <div className="h-full bg-accent transition-[width] duration-400" style={{ width: `${((lauf + 1) / RECHENSCHRITTE.length) * 100}%` }} />
                  </div>
                  <ol className="mt-4 space-y-1.5">
                    {RECHENSCHRITTE.map((s, i) => (
                      <li key={s} className={`flex items-start gap-2 text-[12.5px] ${i <= lauf ? "text-ink-2" : "text-ink-3"}`}>
                        <span className={`num w-4 shrink-0 text-right ${i < lauf ? "text-good" : i === lauf ? "text-accent" : "text-ink-3"}`}>
                          {i < lauf ? "✓" : i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 text-[11.5px] text-flag">
                    Demo-Simulation. Es läuft kein echter Solver — die Varianten sind vorberechnet.
                  </p>
                </div>
              </Flaeche>
            ) : (
              <>
                <Flaeche className="p-3">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    {typ.zeilen.map((z) => (
                      <button
                        key={z.id}
                        onClick={() => setZeileWahl(z.id)}
                        aria-pressed={zeileWahl === z.id}
                        className={`rounded-sm px-2.5 py-1 text-[12px] transition-colors ${
                          zeileWahl === z.id ? "bg-ink text-paper" : "border border-line text-ink-2 hover:border-ink-3"
                        }`}
                      >
                        {z.bezeichnung} · {zahl(z.laenge)} mm
                      </button>
                    ))}
                    <span className="ml-auto text-[11.5px] text-ink-3">Modul anklicken für Details</span>
                  </div>
                  <Ansicht
                    typ={typ}
                    variante={gewaehlt}
                    zeileId={zeileWahl}
                    gewaehltesModul={modulWahl}
                    aufModul={setModulWahl}
                    hoehe={286}
                  />
                </Flaeche>

                <Flaeche className="mt-4 p-3">
                  <Grundriss
                    typ={typ}
                    variante={gewaehlt}
                    gewaehltesModul={modulWahl}
                    aufModul={setModulWahl}
                    volleBreite
                  />
                </Flaeche>

                {modulInfo && (
                  <Flaeche className="mt-4 px-4 py-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="text-[13.5px] font-medium text-ink">{modulInfo.m.bezeichnung}</div>
                      <Marke ton="ok">{modulInfo.m.artikel}</Marke>
                    </div>
                    <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 border-t border-line-2 pt-2 text-[12px] sm:grid-cols-4">
                      <div><dt className="text-ink-3">Breite</dt><dd className="num text-ink-2">{modulInfo.m.breite} mm</dd></div>
                      <div><dt className="text-ink-3">Position</dt><dd className="num text-ink-2">{zahl(modulInfo.p.von)}–{zahl(modulInfo.p.bis)} mm</dd></div>
                      <div><dt className="text-ink-3">Zeile</dt><dd className="text-ink-2">{modulInfo.zeile.bezeichnung}</dd></div>
                      <div><dt className="text-ink-3">Preis</dt><dd className="num text-ink-2">{eur(modulInfo.m.preis)}</dd></div>
                    </dl>
                  </Flaeche>
                )}
              </>
            )}
          </div>

          {/* Rechts: Varianten */}
          <div className="min-w-0">
            {frei && lauf === null && (
              <>
                <div className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">
                  Varianten für {typ.id}
                </div>
                <div className="space-y-3">
                  {varianten.map((v) => {
                    const k = kennzahlen(v, typ, gewichtung);
                    const ist = v.id === auswahl[typ.id];
                    return (
                      <Flaeche key={v.id} className={`px-3.5 py-3 ${ist ? "border-accent ring-1 ring-accent" : ""}`}>
                        <div className="flex items-baseline justify-between gap-2">
                          <div>
                            <span className="num text-[13.5px] font-semibold text-ink">{v.kurz}</span>
                            <span className="ml-1.5 text-[12.5px] text-ink-2">{v.bezeichnung}</span>
                          </div>
                          {ist ? <Marke ton="accent">gewählt</Marke> : <Marke ton="mute">{k.bewertung}</Marke>}
                        </div>

                        <dl className="mt-2.5 space-y-1 border-t border-line-2 pt-2.5 text-[12px]">
                          {[
                            ["Preis je Küche", eur(k.preis)],
                            ["Module in der Zeile", String(k.module)],
                            ["Stauraum", `${zahl(k.stauraum)} l`],
                            ["Arbeitsfläche Spüle ↔ Kochfeld", `${zahl(k.arbeitsflaeche)} mm`],
                            ["Weg zum Fallstrang", `${zahl(k.installationsweg)} mm`],
                            ["Passblenden", String(k.passblenden)],
                            ["Bewertung", `${k.bewertung} / 100`],
                          ].map(([a, b]) => (
                            <div key={a} className="flex items-baseline justify-between gap-3">
                              <dt className="text-ink-3">{a}</dt>
                              <dd className="num text-ink-2">{b}</dd>
                            </div>
                          ))}
                        </dl>

                        <ul className="mt-2.5 space-y-0.5 border-t border-line-2 pt-2.5 text-[11.5px]">
                          {v.staerken.map((s) => (
                            <li key={s} className="text-ink-2">+ {s}</li>
                          ))}
                          {v.schwaechen.map((s) => (
                            <li key={s} className="text-ink-3">− {s}</li>
                          ))}
                        </ul>

                        <p className="mt-2.5 border-l-2 border-line pl-2.5 text-[11.5px] leading-relaxed text-ink-2">
                          {v.begruendung}
                        </p>

                        <div className="mt-3">
                          <Knopf
                            art={ist ? "still" : "primaer"}
                            deaktiviert={ist}
                            onClick={() => {
                              waehle(typ.id, v.id);
                              setModulWahl(null);
                              melde(`${v.kurz} als Planung für ${typ.id} übernommen — wirkt auf ${typ.wohnungen.length} Einheiten.`);
                            }}
                          >
                            {ist ? <><Check size={13} strokeWidth={2} />Als Planung gespeichert</> : "Als Planung übernehmen"}
                          </Knopf>
                        </div>
                      </Flaeche>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {frei && lauf === null && (
          <Abschnitt titel={`Belegung der gewählten Variante ${gewaehlt.kurz}`}>
            <Flaeche>
              <Tabelle dicht>
                <thead>
                  <tr>
                    <Th breite="52px">Pos</Th>
                    <Th>Zeile</Th>
                    <Th>Modul</Th>
                    <Th rechts>Breite</Th>
                    <Th rechts>von</Th>
                    <Th rechts>bis</Th>
                    <Th>Artikel Partner</Th>
                    <Th rechts>Preis</Th>
                  </tr>
                </thead>
                <tbody>
                  {typ.zeilen.flatMap((z) =>
                    platzierung(gewaehlt, z.id).map((p) => {
                      const m = modul(p.modulId);
                      const schluessel = `${z.id}:${p.index}`;
                      return (
                        <tr
                          key={schluessel}
                          onClick={() => setModulWahl(modulWahl === schluessel ? null : schluessel)}
                          className={`cursor-pointer ${modulWahl === schluessel ? "bg-accent-soft" : "hover:bg-ground"}`}
                        >
                          <Td num stumm>{p.index + 1}</Td>
                          <Td stumm>{z.bezeichnung}</Td>
                          <Td>{m.bezeichnung}</Td>
                          <Td num rechts>{m.breite} mm</Td>
                          <Td num rechts stumm>{zahl(z.start + p.von)}</Td>
                          <Td num rechts stumm>{zahl(z.start + p.bis)}</Td>
                          <Td num stumm>{m.artikel}</Td>
                          <Td num rechts>{eur(m.preis)}</Td>
                        </tr>
                      );
                    }),
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <Td /><Td /><Td stumm>Summe der Korpusbreiten entspricht der Nischenlänge</Td>
                    <Td num rechts>
                      <strong>{zahl(typ.zeilen.reduce((s, z) => s + z.laenge, 0))} mm</strong>
                    </Td>
                    <Td /><Td /><Td /><Td />
                  </tr>
                </tfoot>
              </Tabelle>
            </Flaeche>
            <div className="mt-3">
              <Hinweisband art="ruhig" titel="Abgeleitete Anschlüsse">
                Aus dieser Belegung ergeben sich {anschluesse(gewaehlt, typ).length} Anschlusspositionen.
                Wird die Variante gewechselt, wandern sie mit.{" "}
                <Link href="/projects/demo/installations" className="text-accent underline underline-offset-2">
                  Zur Installationsplanung
                </Link>
              </Hinweisband>
            </div>
          </Abschnitt>
        )}
      </Inhalt>
    </>
  );
}
