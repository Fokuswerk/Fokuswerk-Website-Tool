"use client";

import { useState } from "react";
import { ArrowRight, FlipHorizontal2 } from "lucide-react";
import { KUECHENTYPEN, nischenspanne, TOLERANZBAND, WOHNUNGEN } from "@/data/projekt";
import { eur, kennzahlen, variante, zahl } from "@/lib/berechnung";
import { istFreigegeben, offeneFreigaben, typMitFreigabe } from "@/lib/ableitung";
import { useDemo } from "@/store/demo";
import { Grundriss } from "@/components/plan/Grundriss";
import {
  Abschnitt, Flaeche, Hinweisband, Inhalt, Knopf, Marke,
  Seitenkopf, Tabelle, Td, Th,
} from "@/components/ui/kit";

export default function Kuechentypen() {
  const { auswahl, freigaben } = useDemo();
  const [detail, setDetail] = useState<string | null>(null);
  const typ = detail ? typMitFreigabe(KUECHENTYPEN.find((t) => t.id === detail)!, freigaben) : null;

  return (
    <>
      <Seitenkopf
        titel="Küchentypen"
        kontext={`${WOHNUNGEN.length} Wohnungen, ${KUECHENTYPEN.length} Typen. Geplant wird je Typ, ausgeführt in allen zugeordneten Einheiten.`}
        aktionen={
          detail ? <Knopf onClick={() => setDetail(null)}>Zurück zur Übersicht</Knopf> : undefined
        }
      />

      <Inhalt breit>
        {!typ && (
          <>
            <Abschnitt titel="Was die Typisierung leistet">
              <Flaeche className="px-5 py-5">
                <div className="flex flex-wrap items-center gap-5">
                  <div className="min-w-[150px]">
                    <div className="num text-[34px] leading-none tracking-[-0.03em] text-ink">{WOHNUNGEN.length}</div>
                    <div className="mt-1 text-[12.5px] text-ink-2">einzelne Wohnungsgrundrisse</div>
                  </div>
                  <div className="flex-1">
                    <svg viewBox="0 0 400 60" className="h-[52px] w-full max-w-[380px]" role="img" aria-label="Vierzig Grundrisse werden zu sechs Typen zusammengefasst">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <rect
                          key={i}
                          x={(i % 20) * 9}
                          y={i < 20 ? 4 : 17}
                          width={6}
                          height={9}
                          className="fill-ink-3/35"
                        />
                      ))}
                      <path d="M186 36 L196 44 L186 52" fill="none" strokeWidth="1.4" className="stroke-ink-3" />
                      {KUECHENTYPEN.map((t, i) => (
                        <rect key={t.id} x={210 + i * 16} y={38} width={12} height={14} className="fill-accent/70" />
                      ))}
                      <text x={310} y={49} fontSize="11" fontFamily="var(--font-data)" className="fill-ink-2">
                        6 Typen
                      </text>
                    </svg>
                  </div>
                  <div className="min-w-[180px] border-l border-line-2 pl-5">
                    <div className="num text-[34px] leading-none tracking-[-0.03em] text-accent">{KUECHENTYPEN.length}</div>
                    <div className="mt-1 text-[12.5px] text-ink-2">
                      Typen, davon{" "}
                      {KUECHENTYPEN.reduce((s, t) => s + t.gespiegelt.length, 0)} Einheiten gespiegelt
                    </div>
                  </div>
                </div>
                {/* Ein Band statt einer Zahl: man sieht sofort, welche Typen
                    das Projekt tragen und welche Randfälle sind. */}
                <div className="mt-5 border-t border-line-2 pt-4">
                  <div className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">
                    Verteilung der {WOHNUNGEN.length} Einheiten
                  </div>
                  <div className="mt-2 flex h-7 w-full overflow-hidden rounded-xs">
                    {KUECHENTYPEN.map((t, i) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setDetail(t.id)}
                        title={`${t.id} · ${t.bezeichnung} · ${t.wohnungen.length} Einheiten`}
                        style={{ width: `${(t.wohnungen.length / WOHNUNGEN.length) * 100}%` }}
                        className={`num flex items-center justify-center text-[10.5px] text-paper transition-opacity hover:opacity-80 ${
                          i % 2 === 0 ? "bg-accent" : "bg-accent-2"
                        }`}
                      >
                        {t.wohnungen.length >= 4 ? t.id : ""}
                      </button>
                    ))}
                  </div>
                  <div className="num mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11.5px] text-ink-3">
                    {KUECHENTYPEN.map((t) => (
                      <span key={t.id}>
                        {t.id} · {t.wohnungen.length}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="mt-4 border-t border-line-2 pt-3 text-[12.5px] leading-relaxed text-ink-2">
                  Gruppiert wird nicht nach exakter Gleichheit, sondern nach Planungsäquivalenz: zwei
                  Räume gehören zum selben Typ, wenn dieselbe Modulfolge in beiden zulässig ist.
                  Die Nischenlängen der {WOHNUNGEN.length} Einheiten liegen zwischen{" "}
                  <span className="num">{zahl(Math.min(...WOHNUNGEN.map((w) => w.nischenlaenge)))}</span> und{" "}
                  <span className="num">{zahl(Math.max(...WOHNUNGEN.map((w) => w.nischenlaenge)))}</span> mm;
                  keine weicht um mehr als{" "}
                  <span className="num">{Math.max(...WOHNUNGEN.map((w) => Math.abs(w.abweichung)))} mm</span>{" "}
                  vom Nennmaß ihres Typs ab — erlaubt sind ± {TOLERANZBAND} mm. Diese Differenz nimmt die
                  Passblende am Zeilenende auf. Gespiegelte Grundrisse werden über eine
                  Spiegelsignatur erkannt und erben die Planung ihres Typs.
                </p>
              </Flaeche>
            </Abschnitt>

            <Abschnitt titel="Typen">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {KUECHENTYPEN.map((t) => {
                  const frei = istFreigegeben(t, freigaben);
                  const v = variante(auswahl[t.id]);
                  const k = kennzahlen(v, t);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setDetail(t.id)}
                      className="rounded-md border border-line bg-paper p-3 text-left transition-colors hover:border-ink-3"
                    >
                      <div className="rounded-sm bg-ground p-2">
                        <Grundriss typ={t} variante={frei ? v : undefined} zeigeModule={frei} zeigeMasse={false} volleBreite />
                      </div>
                      <div className="mt-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="num text-[13.5px] font-semibold text-ink">{t.id}</div>
                          <div className="truncate text-[12.5px] text-ink-2">{t.bezeichnung}</div>
                        </div>
                        {frei ? <Marke ton="ok">bestätigt</Marke> : <Marke ton="flag">{offeneFreigaben(t, freigaben).length} offen</Marke>}
                      </div>
                      <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-line-2 pt-2.5 text-[12px]">
                        <dt className="text-ink-3">Einheiten</dt>
                        <dd className="num text-right text-ink-2">
                          {t.wohnungen.length}
                          {t.gespiegelt.length > 0 && <span className="text-ink-3"> · {t.gespiegelt.length} gesp.</span>}
                        </dd>
                        <dt className="text-ink-3">Nische</dt>
                        <dd className="num text-right text-ink-2">{t.zeilen.map((z) => zahl(z.laenge)).join(" / ")} mm</dd>
                        <dt className="text-ink-3">im Bestand</dt>
                        <dd className="num text-right text-ink-2">
                          {zahl(nischenspanne(t.id).von)}–{zahl(nischenspanne(t.id).bis)} mm
                        </dd>
                        <dt className="text-ink-3">Variante</dt>
                        <dd className="num text-right text-ink-2">{frei ? `${v.kurz} · ${v.bezeichnung}` : "—"}</dd>
                        <dt className="text-ink-3">je Küche</dt>
                        <dd className="num text-right font-medium text-ink">{frei ? eur(k.preis) : "—"}</dd>
                      </dl>
                    </button>
                  );
                })}
              </div>
            </Abschnitt>
          </>
        )}

        {typ && (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              <Flaeche className="p-3">
                <Grundriss
                  typ={typ}
                  variante={istFreigegeben(typ, freigaben) ? variante(auswahl[typ.id]) : undefined}
                  zeigeModule={istFreigegeben(typ, freigaben)}
                  volleBreite
                />
              </Flaeche>

              <Abschnitt titel={`Zugeordnete Einheiten (${typ.wohnungen.length})`}>
                <Flaeche>
                  <Tabelle dicht>
                    <thead>
                      <tr>
                        <Th>Einheit</Th>
                        <Th nebensache>Haus</Th>
                        <Th nebensache>Geschoss</Th>
                        <Th rechts nebensache>Wohnfläche</Th>
                        <Th rechts>Nische laut Plan</Th>
                        <Th rechts>gegen Typmaß</Th>
                        <Th>Ausführung</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {WOHNUNGEN.filter((w) => w.typId === typ.id).map((w) => (
                        <tr key={w.nr} className="hover:bg-ground">
                          <Td num>{w.nr}</Td>
                          <Td stumm nebensache>Haus {w.haus}</Td>
                          <Td stumm nebensache>{w.geschoss}</Td>
                          <Td num rechts nebensache>{(w.wohnflaeche / 10).toFixed(1).replace(".", ",")} m²</Td>
                          <Td num rechts>{zahl(w.nischenlaenge)} mm</Td>
                          <Td num rechts stumm={w.abweichung === 0}>
                            {w.abweichung === 0 ? "genau" : `${w.abweichung > 0 ? "+" : "−"}${Math.abs(w.abweichung)} mm`}
                          </Td>
                          <Td>
                            {w.gespiegelt ? (
                              <span className="inline-flex items-center gap-1.5 text-[12px] text-accent">
                                <FlipHorizontal2 size={13} strokeWidth={1.7} />
                                gespiegelt
                              </span>
                            ) : (
                              <span className="text-ink-3">wie Typ</span>
                            )}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <Td stumm>Nennmaß des Typs</Td>
                        <Td nebensache /><Td nebensache /><Td nebensache />
                        <Td num rechts><strong>{zahl(typ.zeilen[0].laenge)} mm</strong></Td>
                        <Td num rechts stumm>± {nischenspanne(typ.id).groesste} mm</Td>
                        <Td />
                      </tr>
                    </tfoot>
                  </Tabelle>
                </Flaeche>
                <p className="border-t border-line-2 px-3.5 py-3 text-[12px] leading-relaxed text-ink-2">
                  Geplant und bestellt wird das Nennmaß. Was eine Einheit davon abweicht, nimmt die
                  Passblende am Zeilenende auf — deshalb braucht nicht jede Wohnung eine eigene
                  Planung. Die Spalte „gegen Typmaß" zeigt, wie viel das jeweils ist.
                </p>
              </Abschnitt>
            </div>

            <div className="min-w-0">
              <Flaeche className="px-4 py-4">
                <div className="num text-[16px] font-semibold text-ink">{typ.id}</div>
                <div className="text-[13px] text-ink-2">{typ.bezeichnung}</div>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t border-line-2 pt-3 text-[12.5px]">
                  <dt className="text-ink-3">Grundform</dt>
                  <dd className="text-right text-ink-2">{typ.grundform}</dd>
                  <dt className="text-ink-3">Raum</dt>
                  <dd className="num text-right text-ink-2">{zahl(typ.raum.breite)} × {zahl(typ.raum.tiefe)} mm</dd>
                  <dt className="text-ink-3">Raumhöhe</dt>
                  <dd className="num text-right text-ink-2">{zahl(typ.raum.hoehe)} mm</dd>
                  <dt className="text-ink-3">Zeilen</dt>
                  <dd className="num text-right text-ink-2">{typ.zeilen.map((z) => zahl(z.laenge)).join(" / ")} mm</dd>
                  <dt className="text-ink-3">Nischen im Typ</dt>
                  <dd className="num text-right text-ink-2">
                    {zahl(nischenspanne(typ.id).von)}–{zahl(nischenspanne(typ.id).bis)} mm
                  </dd>
                  <dt className="text-ink-3">Größte Abweichung</dt>
                  <dd className="num text-right text-ink-2">
                    ± {nischenspanne(typ.id).groesste} mm von ± {TOLERANZBAND}
                  </dd>
                  <dt className="text-ink-3">Einheiten</dt>
                  <dd className="num text-right text-ink-2">{typ.wohnungen.length}</dd>
                  <dt className="text-ink-3">Gespiegelt</dt>
                  <dd className="num text-right text-ink-2">{typ.gespiegelt.length}</dd>
                </dl>
                <div className="mt-3 border-t border-line-2 pt-3">
                  {istFreigegeben(typ, freigaben) ? (
                    <Knopf href="/projects/demo/planning" art="primaer">Planung öffnen<ArrowRight size={13} strokeWidth={1.8} /></Knopf>
                  ) : (
                    <Knopf href="/projects/demo/rooms">Prüffälle bearbeiten<ArrowRight size={13} strokeWidth={1.8} /></Knopf>
                  )}
                </div>
              </Flaeche>

              {typ.hinweis && (
                <div className="mt-4">
                  <Hinweisband titel="Hinweis zum Typ">{typ.hinweis}</Hinweisband>
                </div>
              )}

              <Flaeche className="mt-4 px-4 py-3.5">
                <div className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">Prüfstand</div>
                <ul className="mt-2 space-y-1.5">
                  {typ.pruefpunkte.map((p) => {
                    const offen = offeneFreigaben(typ, freigaben).some((x) => x.id === p.id);
                    return (
                      <li key={p.id} className="flex items-start gap-2 text-[12px]">
                        <span className="mt-[1px]">{offen ? <Marke ton="flag">offen</Marke> : <Marke ton="ok">ok</Marke>}</span>
                        <span className="text-ink-2">{p.titel}</span>
                      </li>
                    );
                  })}
                </ul>
              </Flaeche>
            </div>
          </div>
        )}
      </Inhalt>
    </>
  );
}
