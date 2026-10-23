"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { KUECHENTYPEN } from "@/data/projekt";
import { variante, zahl } from "@/lib/berechnung";
import { anschluesse, istFreigegeben } from "@/lib/ableitung";
import { useDemo } from "@/store/demo";
import { Ansicht } from "@/components/plan/Ansicht";
import {
  Abschnitt, Flaeche, Hinweisband, Inhalt, Knopf, Marke,
  Seitenkopf, Tabelle, Td, Th,
} from "@/components/ui/kit";

const LEGENDE = [
  ["KW", "Kaltwasser"],
  ["WW", "Warmwasser"],
  ["AW", "Abwasser DN 50"],
  ["400V", "Kochfeld, eigener Stromkreis"],
  ["SD", "Steckdose Arbeitsplatte"],
  ["GS", "Geschirrspüler"],
  ["KS", "Kühlschrank"],
  ["DA", "Dunstesse"],
];

export default function Installationsplanung() {
  const { auswahl, freigaben } = useDemo();
  const [aktiv, setAktiv] = useState(
    KUECHENTYPEN.find((t) => istFreigegeben(t, freigaben))?.id ?? KUECHENTYPEN[0].id,
  );
  const typ = KUECHENTYPEN.find((t) => t.id === aktiv)!;
  const frei = istFreigegeben(typ, freigaben);
  const v = variante(auswahl[typ.id]);
  const liste = frei ? anschluesse(v, typ) : [];

  return (
    <>
      <Seitenkopf
        titel="Installationsplanung"
        kontext={`${typ.id} · ${typ.wohnungen.length} Einheiten erhalten dieselben Anschlusspositionen · Maße ab Zeilenanfang und über Oberkante Fertigfußboden`}
        aktionen={
          <>
            <select
              value={aktiv}
              onChange={(e) => setAktiv(e.target.value)}
              aria-label="Küchentyp wählen"
              className="rounded-sm border border-line bg-paper px-2.5 py-1.5 text-[12.5px] text-ink"
            >
              {KUECHENTYPEN.map((t) => (
                <option key={t.id} value={t.id}>{t.id} · {t.bezeichnung}</option>
              ))}
            </select>
            <Knopf onClick={() => window.print()}><Printer size={14} strokeWidth={1.7} />Druckansicht</Knopf>
          </>
        }
      />

      <Inhalt breit>
        {!frei ? (
          <Flaeche className="px-6 py-10 text-center">
            <div className="text-[14px] font-medium text-ink">Keine Anschlussplanung für {typ.id}</div>
            <p className="mx-auto mt-1.5 max-w-[60ch] text-[12.5px] text-ink-2">
              Der Typ ist nicht bestätigt. Anschlusspositionen ergeben sich aus der gewählten
              Modulbelegung — ohne bestätigte Geometrie gibt es keine.
            </p>
          </Flaeche>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 space-y-4">
              {typ.zeilen.map((z) => (
                <Flaeche key={z.id} className="p-3">
                  <div className="mb-2 flex items-baseline justify-between text-[12px]">
                    <span className="font-medium text-ink">{z.bezeichnung}</span>
                    <span className="num text-ink-3">{zahl(z.laenge)} mm</span>
                  </div>
                  <Ansicht
                    typ={typ}
                    variante={v}
                    zeileId={z.id}
                    anschluesse={liste.filter((a) => a.zeileId === z.id)}
                    hoehe={270}
                  />
                </Flaeche>
              ))}

              <Flaeche className="px-4 py-3">
                <div className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">Legende</div>
                <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] sm:grid-cols-4">
                  {LEGENDE.map(([k, t]) => (
                    <div key={k} className="flex items-baseline gap-2">
                      <dt className="num shrink-0 text-accent">{k}</dt>
                      <dd className="text-ink-2">{t}</dd>
                    </div>
                  ))}
                </dl>
              </Flaeche>
            </div>

            <div className="min-w-0">
              <Flaeche className="overflow-hidden">
                <div className="border-b border-line px-3 py-2 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">
                  Anschlussliste {typ.id}
                </div>
                <Tabelle dicht>
                  <thead>
                    <tr>
                      <Th>Anschluss</Th>
                      <Th rechts>X</Th>
                      <Th rechts>Höhe</Th>
                      <Th>Stand</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {liste.map((a) => (
                      <tr key={a.id} className="align-top">
                        <Td>
                          <div className="text-ink-2">{a.bezeichnung}</div>
                          <div className="mt-0.5 text-[11px] text-ink-3">{a.ausfuehrung}</div>
                          {a.hinweis && <div className="mt-0.5 text-[11px] text-flag">{a.hinweis}</div>}
                        </Td>
                        <Td num rechts>{zahl(a.x)}</Td>
                        <Td num rechts>{zahl(a.hoehe)}</Td>
                        <Td>
                          <Marke ton={a.freigabe === "bestaetigt" ? "ok" : "flag"}>
                            {a.freigabe === "bestaetigt" ? "fest" : "offen"}
                          </Marke>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <Td stumm>{liste.length} Positionen, Maße in mm</Td>
                      <Td /><Td /><Td />
                    </tr>
                  </tfoot>
                </Tabelle>
              </Flaeche>

              <div className="mt-4">
                <Hinweisband art="ruhig" titel="Wofür dieser Plan da ist">
                  Diese Positionen gehen an den TGA-Planer, bevor die Wände geschlossen werden. Weil
                  alle {typ.wohnungen.length} Einheiten des Typs dieselben Positionen erhalten, entsteht
                  kein Sonderfall je Geschoss. Die Angaben sind eine Vorgabe aus der Küchenplanung und
                  ersetzen weder eine TGA-Planung noch eine Ausführungsfreigabe.
                </Hinweisband>
              </div>

              <Flaeche className="mt-4 px-4 py-3">
                <div className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">
                  Grundlage
                </div>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12px]">
                  <dt className="text-ink-3">Variante</dt>
                  <dd className="num text-right text-ink-2">{v.kurz} · {v.bezeichnung}</dd>
                  <dt className="text-ink-3">Arbeitshöhe</dt>
                  <dd className="num text-right text-ink-2">910 mm OFF</dd>
                  <dt className="text-ink-3">Einheiten</dt>
                  <dd className="num text-right text-ink-2">{typ.wohnungen.length}</dd>
                  <dt className="text-ink-3">Fallstrang</dt>
                  <dd className="num text-right text-ink-2">
                    {typ.zwangspunkte.find((z) => z.art === "fallstrang")?.wand ?? "—"}
                  </dd>
                </dl>
              </Flaeche>
            </div>
          </div>
        )}
      </Inhalt>
    </>
  );
}
