"use client";

import { useState } from "react";
import { PackageCheck } from "lucide-react";
import { KUECHENTYPEN, WOHNUNGEN } from "@/data/projekt";
import { eur, stueckliste, variante, zahl } from "@/lib/berechnung";
import {
  abweichung, aufmassLage, BLENDE_MAX, BLENDE_MIN, fertigungsmasse, istFreigegeben, typMitFreigabe,
  type AufmassLage,
} from "@/lib/ableitung";
import { useDemo } from "@/store/demo";
import { Grundriss } from "@/components/plan/Grundriss";
import {
  Abschnitt, Flaeche, Hinweisband, Inhalt, Knopf, Marke,
  Seitenkopf, Tabelle, Td, Th, melde,
} from "@/components/ui/kit";

const LAGE: Record<AufmassLage, { ton: "ok" | "flag" | "mute" | "good"; text: string }> = {
  offen: { ton: "mute", text: "nicht begonnen" },
  laeuft: { ton: "ok", text: "Aufmaß läuft" },
  abweichung: { ton: "flag", text: "Abweichung" },
  bestaetigt: { ton: "good", text: "bestätigt" },
};

export default function Aufmass() {
  const { aufmass, setzeAufmass, auswahl, snapshots, freigaben } = useDemo();
  const [aktiv, setAktiv] = useState<string>(WOHNUNGEN[0].nr);
  const [filter, setFilter] = useState<"alle" | AufmassLage>("alle");

  const wohnung = WOHNUNGEN.find((w) => w.nr === aktiv)!;
  const typ = typMitFreigabe(KUECHENTYPEN.find((t) => t.id === wohnung.typId)!, freigaben);
  const v = variante(auswahl[typ.id]);
  const werte = aufmass[wohnung.nr] ?? {};
  const lage = aufmassLage(wohnung.messpunkte, werte);

  const gefiltert = WOHNUNGEN.filter(
    (w) => filter === "alle" || aufmassLage(w.messpunkte, aufmass[w.nr]) === filter,
  );

  const fertigung = fertigungsmasse(typ, v, werte, wohnung.messpunkte);
  /* Eine zurueckgenommene Bestaetigung muss bis in die Bestellung
     durchschlagen. Vorher gab das Aufmass eine Bestellvorbereitung fuer
     einen Typ heraus, den zwei Seiten weiter niemand mehr freigegeben hat. */
  const typFrei = istFreigegeben(typ, freigaben);
  const bestellbar = lage === "bestaetigt" && snapshots.length > 0 && typFrei;

  const zaehler = (l: AufmassLage) =>
    WOHNUNGEN.filter((w) => aufmassLage(w.messpunkte, aufmass[w.nr]) === l).length;

  return (
    <>
      <Seitenkopf
        titel="Aufmaß und Bestellung"
        kontext="Zweiter Einsatz des Werkzeugs, Monate nach der Planung. Erst mit dem Aufmaß am fertigen Rohbau entstehen Fertigungsmaße."
        aktionen={
          snapshots.length === 0 ? (
            <Marke ton="flag">Keine festgeschriebene Spezifikation</Marke>
          ) : (
            <Marke ton="ok">Grundlage {snapshots[0].version}</Marke>
          )
        }
      />

      <Inhalt breit>
        <div className="grid gap-4 xl:grid-cols-[286px_minmax(0,1fr)]">
          {/* Links: Wohnungsliste */}
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {([["alle", `Alle ${WOHNUNGEN.length}`], ["offen", `Offen ${zaehler("offen")}`], ["laeuft", `Läuft ${zaehler("laeuft")}`], ["abweichung", `Abw. ${zaehler("abweichung")}`], ["bestaetigt", `Fertig ${zaehler("bestaetigt")}`]] as const).map(
                ([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setFilter(id)}
                    aria-pressed={filter === id}
                    className={`num rounded-sm px-2 py-[3px] text-[11.5px] transition-colors ${
                      filter === id ? "bg-ink text-paper" : "border border-line text-ink-2 hover:border-ink-3"
                    }`}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
            <Flaeche className="max-h-[560px] overflow-y-auto">
              <ul>
                {gefiltert.map((w) => {
                  const l = aufmassLage(w.messpunkte, aufmass[w.nr]);
                  const m = LAGE[l];
                  return (
                    <li key={w.nr}>
                      <button
                        onClick={() => setAktiv(w.nr)}
                        aria-current={w.nr === aktiv ? "true" : undefined}
                        className={`flex w-full items-center gap-2 border-b border-line-2 px-3 py-2 text-left transition-colors ${
                          w.nr === aktiv ? "bg-accent-soft" : "hover:bg-ground"
                        }`}
                      >
                        <span className="num w-[52px] shrink-0 text-[12.5px] font-medium text-ink">{w.nr}</span>
                        <span className="num w-[40px] shrink-0 text-[11.5px] text-ink-3">{w.typId}</span>
                        <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-3">
                          {w.geschoss}{w.gespiegelt ? " · gesp." : ""}
                        </span>
                        <Marke ton={m.ton}>{m.text}</Marke>
                      </button>
                    </li>
                  );
                })}
                {gefiltert.length === 0 && (
                  <li className="px-3 py-6 text-center text-[12.5px] text-ink-3">Keine Einheit in diesem Stand.</li>
                )}
              </ul>
            </Flaeche>
          </div>

          {/* Rechts: Aufmaß der gewählten Wohnung */}
          <div className="min-w-0">
            <Flaeche className="px-4 py-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="num text-[16px] font-semibold text-ink">{wohnung.nr}</span>
                  <span className="ml-2 text-[12.5px] text-ink-2">
                    Haus {wohnung.haus} · {wohnung.geschoss} · Typ {typ.id}
                    {wohnung.gespiegelt && " · gespiegelt ausgeführt"}
                  </span>
                </div>
                <Marke ton={LAGE[lage].ton}>{LAGE[lage].text}</Marke>
              </div>
            </Flaeche>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Flaeche className="p-3">
                <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">
                  Grundriss des Typs {typ.id}
                </div>
                <Grundriss typ={typ} variante={v} volleBreite />
                <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3">
                  Die Messpunkte M1 bis M5 stehen in der Tabelle daneben — der Grundriss zeigt den
                  Typ, nicht die einzelne Einheit.
                </p>
              </Flaeche>

              <Flaeche className="overflow-hidden">
                <div className="border-b border-line px-3 py-2 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">
                  Ist-Maße eintragen
                </div>
                <Tabelle dicht>
                  <thead>
                    <tr>
                      <Th>Messpunkt</Th>
                      <Th rechts>Planmaß</Th>
                      <Th rechts>Aufmaß</Th>
                      <Th rechts>Abweichung</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {wohnung.messpunkte.map((mp) => {
                      const ist = werte[mp.id] ?? null;
                      const d = abweichung(mp.planmass, ist);
                      return (
                        <tr key={mp.id}>
                          <Td>
                            <div className="text-ink-2">{mp.bezeichnung}</div>
                            <div className="num mt-0.5 text-[11px] text-ink-3">{mp.id}</div>
                          </Td>
                          <Td num rechts stumm>{zahl(mp.planmass)}</Td>
                          <Td rechts>
                            <input
                              id={`mp-${wohnung.nr}-${mp.id}`}
                              type="number"
                              inputMode="numeric"
                              value={ist ?? ""}
                              placeholder="—"
                              aria-label={`${mp.bezeichnung} Ist-Maß in Millimeter`}
                              onChange={(e) => {
                                const t = e.target.value.trim();
                                setzeAufmass(wohnung.nr, mp.id, t === "" ? null : Math.round(Number(t)));
                              }}
                              className="num w-[92px] rounded-sm border border-line bg-paper px-2 py-1 text-right text-[12.5px] text-ink focus:border-accent"
                            />
                          </Td>
                          <Td num rechts>
                            {d === null ? (
                              <span className="text-ink-3">—</span>
                            ) : (
                              <span className={Math.abs(d) > 15 ? "text-flag" : "text-ink-2"}>
                                {d > 0 ? "+" : ""}{zahl(d)} mm
                              </span>
                            )}
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Tabelle>
                <div className="border-t border-line-2 px-3 py-2 text-[11px] text-ink-3">
                  Jede Abweichung ändert den Zuschnitt der Arbeitsplatte und der Passblende. Die
                  Modulauswahl muss erst dann angefasst werden, wenn die Passblende aus ihrem
                  Bereich von {BLENDE_MIN} bis {BLENDE_MAX} mm läuft — ab 15 mm lohnt deshalb der
                  Blick darauf.
                </div>
              </Flaeche>
            </div>

            {fertigung && (
              <Abschnitt titel="Wirkung auf die Fertigungsmaße">
                <Flaeche>
                  <Tabelle dicht>
                    <thead>
                      <tr>
                        <Th>Maß</Th>
                        <Th rechts>aus der Planung</Th>
                        <Th rechts>nach Aufmaß</Th>
                        <Th rechts nebensache>Differenz</Th>
                        <Th>Folge</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {fertigung.zeilen.map((f) => {
                        const d = f.ist - f.plan;
                        return (
                          <tr key={f.bezeichnung} className="align-top">
                            <Td>{f.bezeichnung}</Td>
                            <Td num rechts stumm>{zahl(f.plan)} mm</Td>
                            <Td num rechts>
                              <span className={f.kritisch ? "text-flag" : ""}>{zahl(f.ist)} mm</span>
                            </Td>
                            <Td num rechts nebensache stumm>
                              {d === 0 ? "—" : `${d > 0 ? "+" : "−"}${zahl(Math.abs(d))}`}
                            </Td>
                            <Td stumm>{f.folge}</Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Tabelle>
                </Flaeche>
                {fertigung.weg && (
                  <div className="mt-3">
                    <Hinweisband titel={fertigung.weg.titel}>{fertigung.weg.text}</Hinweisband>
                  </div>
                )}
              </Abschnitt>
            )}

            <Abschnitt titel="Bestellvorbereitung">
              {!bestellbar ? (
                <Hinweisband titel="Noch nicht bestellfähig">
                  {snapshots.length === 0
                    ? "Es ist keine Spezifikation festgeschrieben. Ohne festen Stand gibt es keine Bestellgrundlage."
                    : !typFrei
                      ? `Typ ${typ.id} ist nicht mehr bestätigt. Ein festgeschriebener Stand enthält ihn, die Bestätigung wurde danach zurückgenommen — erst wieder bestätigen, dann bestellen.`
                      : "Das Aufmaß dieser Einheit ist nicht vollständig bestätigt. Fertigungsmaße entstehen erst aus den Ist-Maßen — eine Bestellung aus Planmaßen passt mit hoher Wahrscheinlichkeit nicht."}
                </Hinweisband>
              ) : (
                <Flaeche>
                  <Tabelle dicht>
                    <thead>
                      <tr>
                        <Th>Position</Th>
                        <Th>Artikel</Th>
                        <Th rechts>Menge</Th>
                        <Th rechts>Summe</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {stueckliste(v).map((p) => (
                        <tr key={p.modulId}>
                          <Td>{p.bezeichnung}</Td>
                          <Td num stumm>{p.artikel}</Td>
                          <Td num rechts>{p.einheit === "lfm" ? `${zahl(p.menge, 1)} lfm` : zahl(p.menge)}</Td>
                          <Td num rechts>{eur(p.gesamt)}</Td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <Td stumm>{wohnung.nr} · Typ {typ.id} · Variante {v.kurz}</Td>
                        <Td /><Td />
                        <Td num rechts>
                          <strong>{eur(stueckliste(v).reduce((s, p) => s + p.gesamt, 0))}</strong>
                        </Td>
                      </tr>
                    </tfoot>
                  </Tabelle>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-2 px-4 py-3">
                    <span className="max-w-[62ch] text-[12px] text-ink-2">
                      Die Bestellung läuft über den Lieferanten, nicht über dieses Werkzeug. Er zeichnet
                      die Spezifikation gegen und übernimmt damit die Baubarkeit.
                    </span>
                    <Knopf onClick={() => melde("Demo: Bestellvorbereitung erzeugt. Es wird nichts bestellt.")}>
                      <PackageCheck size={14} strokeWidth={1.7} />
                      Bestellvorbereitung erzeugen
                    </Knopf>
                  </div>
                </Flaeche>
              )}
            </Abschnitt>
          </div>
        </div>
      </Inhalt>
    </>
  );
}
