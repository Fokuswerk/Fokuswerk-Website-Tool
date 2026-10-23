"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { KUECHENTYPEN } from "@/data/projekt";
import { zahl } from "@/lib/berechnung";
import { istFreigegeben, offeneFreigaben, pruefpunkte } from "@/lib/ableitung";
import { useDemo } from "@/store/demo";
import { Grundriss } from "@/components/plan/Grundriss";
import {
  Abschnitt, Flaeche, Hinweisband, Inhalt, Knopf, Marke,
  Seitenkopf, Tabelle, Td, Th, melde,
} from "@/components/ui/kit";
import type { Herkunft } from "@/lib/typen";

const HERKUNFT: Record<Herkunft, string> = {
  gelesen: "gelesen",
  gerechnet: "gerechnet",
  erfasst: "erfasst",
  angenommen: "angenommen",
};

const LABEL: Record<string, string> = {
  nischenlaenge: "Nischenlänge Hauptzeile",
  nischenlaenge2: "Nischenlänge zweite Zeile",
  raumtiefe: "Raumtiefe",
  raumhoehe: "Raumhöhe",
  bruestungshoehe: "Brüstungshöhe Fenster",
  tuerbreite: "Türbreite",
  wasseranschluss: "Position Wasser und Abwasser",
  flaeche: "Grundfläche",
  gangbreite: "Gangbreite zwischen den Zeilen",
  eckausbildung: "Eckabstand",
  bewegungsflaeche: "Bewegungsfläche",
  arbeitshoehe: "Arbeitshöhe",
};

export default function Raumpruefung() {
  const { freigaben, setzeFreigabe } = useDemo();
  const [aktiv, setAktiv] = useState(KUECHENTYPEN.find((t) => !istFreigegeben(t, freigaben))?.id ?? KUECHENTYPEN[0].id);
  const typ = KUECHENTYPEN.find((t) => t.id === aktiv)!;
  const punkte = pruefpunkte(typ, freigaben);
  const frei = istFreigegeben(typ, freigaben);
  const offeneBlocker = punkte.filter((p) => p.blockierend && p.freigabe === "offen");

  const bestaetigeAlle = () => {
    for (const p of punkte) setzeFreigabe(typ.id, p.id, true);
    melde(`${typ.id} bestätigt. Die Bestätigung gilt für alle ${typ.wohnungen.length} Wohnungen dieses Typs.`);
  };

  return (
    <>
      <Seitenkopf
        titel="Raumprüfung"
        kontext="Geprüft und bestätigt wird je Typ, nicht je Wohnung. Eine Bestätigung wirkt auf alle zugeordneten Einheiten."
        aktionen={
          frei ? (
            <Marke ton="ok">Typ bestätigt</Marke>
          ) : (
            <Knopf art="primaer" onClick={bestaetigeAlle}>
              <Check size={14} strokeWidth={2} />
              {typ.id} bestätigen
            </Knopf>
          )
        }
      />

      <Inhalt breit>
        <div className="grid gap-4 xl:grid-cols-[232px_minmax(0,1fr)_320px]">
          {/* Links: Typenliste */}
          <Flaeche className="h-fit overflow-hidden">
            <div className="border-b border-line px-3 py-2 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">
              Erkannte Küchenräume
            </div>
            <ul>
              {KUECHENTYPEN.map((t) => {
                const tFrei = istFreigegeben(t, freigaben);
                const offen = offeneFreigaben(t, freigaben).length;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => setAktiv(t.id)}
                      aria-current={t.id === aktiv ? "true" : undefined}
                      className={`flex w-full items-start gap-2 border-b border-line-2 px-3 py-2.5 text-left transition-colors ${
                        t.id === aktiv ? "bg-accent-soft" : "hover:bg-ground"
                      }`}
                    >
                      <span className="num text-[12.5px] font-medium text-ink">{t.id}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] text-ink-2">{t.bezeichnung}</span>
                        <span className="num mt-0.5 block text-[11px] text-ink-3">{t.wohnungen.length} Einheiten</span>
                      </span>
                      {tFrei ? <Marke ton="ok">ok</Marke> : <Marke ton="flag">{offen}</Marke>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Flaeche>

          {/* Mitte: Grundriss */}
          <div className="min-w-0">
            <Flaeche className="p-3">
              <Grundriss typ={typ} zeigeModule={false} hoehe={430} />
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-line-2 pt-2 text-[11.5px] text-ink-3">
                <span><i className="mr-1.5 inline-block h-[3px] w-4 bg-ink align-middle" />Wandkontur</span>
                <span><i className="mr-1.5 inline-block h-[3px] w-4 bg-accent align-middle" />Fenster</span>
                <span><i className="mr-1.5 inline-block h-[3px] w-4 bg-ink-3 align-middle" />Tür mit Anschlag</span>
                <span><i className="mr-1.5 inline-block h-[3px] w-4 bg-flag align-middle" />Zwangspunkt ungeprüft</span>
              </div>
            </Flaeche>

            <Abschnitt titel="Prüffälle">
              <Flaeche>
                <ul>
                  {punkte.map((p) => (
                    <li key={p.id} className="flex items-start gap-3 border-b border-line-2 px-4 py-3 last:border-b-0">
                      <span className="mt-[2px] shrink-0">
                        {p.freigabe === "bestaetigt" ? <Marke ton="ok">bestätigt</Marke> : <Marke ton="flag">offen</Marke>}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium text-ink">
                          {p.titel}
                          {p.blockierend && p.freigabe === "offen" && (
                            <span className="ml-2 text-[11px] font-normal text-flag">blockiert die Planung</span>
                          )}
                        </div>
                        <p className="mt-0.5 max-w-[78ch] text-[12px] leading-relaxed text-ink-2">{p.beschreibung}</p>
                      </div>
                      <div className="shrink-0">
                        {p.freigabe === "offen" ? (
                          <Knopf onClick={() => { setzeFreigabe(typ.id, p.id, true); melde(`„${p.titel}" bestätigt.`); }}>
                            Bestätigen
                          </Knopf>
                        ) : (
                          <Knopf art="klar" onClick={() => setzeFreigabe(typ.id, p.id, false)}>
                            Zurücknehmen
                          </Knopf>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Flaeche>
            </Abschnitt>

            {offeneBlocker.length > 0 && (
              <div className="mt-4">
                <Hinweisband titel="Planung gesperrt">
                  Für {typ.id} fehlen {offeneBlocker.length} Bestätigungen:{" "}
                  {offeneBlocker.map((p) => p.titel).join(", ")}. Solange ein Pflichtattribut den Stand
                  „angenommen" trägt, erzeugt das Werkzeug keinen Küchenvorschlag für diesen Typ —
                  ein Vorschlag auf unbestätigten Maßen sähe gültig aus, ohne es zu sein.
                </Hinweisband>
              </div>
            )}

            {frei && (
              <div className="mt-4">
                <Hinweisband art="ruhig" titel="Bereit zur Planung">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span>Alle Pflichtattribute von {typ.id} sind bestätigt. Die Planung ist freigegeben.</span>
                    <Link href="/projects/demo/planning">
                      <Knopf>Zur Küchenplanung<ArrowRight size={13} strokeWidth={1.8} /></Knopf>
                    </Link>
                  </div>
                </Hinweisband>
              </div>
            )}
          </div>

          {/* Rechts: Eigenschaften */}
          <div className="min-w-0">
            <Flaeche className="overflow-hidden">
              <div className="border-b border-line px-3 py-2 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">
                Eigenschaften {typ.id}
              </div>
              <Tabelle dicht>
                <thead>
                  <tr>
                    <Th>Merkmal</Th>
                    <Th rechts>Wert</Th>
                    <Th>Herkunft</Th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(typ.attribute).map(([schluessel, a]) => (
                    <tr key={schluessel} className="align-top">
                      <Td>
                        <div className="text-ink-2">{LABEL[schluessel] ?? schluessel}</div>
                        <div className="mt-0.5 text-[11px] text-ink-3">{a.quelle}</div>
                        {a.hinweis && <div className="mt-1 text-[11px] text-flag">{a.hinweis}</div>}
                      </Td>
                      <Td num rechts>
                        {a.einheit === "m2" ? `${(a.wert / 100).toFixed(2).replace(".", ",")} m²` : `${zahl(a.wert)} ${a.einheit}`}
                      </Td>
                      <Td>
                        <Marke ton={a.freigabe === "bestaetigt" ? "ok" : "flag"}>
                          {a.freigabe === "bestaetigt" ? "bestätigt" : HERKUNFT[a.herkunft]}
                        </Marke>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Tabelle>
              <div className="border-t border-line-2 px-3 py-2.5 text-[11px] leading-relaxed text-ink-3">
                Herkunft und Freigabe sind getrennt geführt: woher ein Wert stammt, sagt noch nicht,
                ob ihn jemand bestätigt hat.
              </div>
            </Flaeche>

            <Flaeche className="mt-4 overflow-hidden">
              <div className="border-b border-line px-3 py-2 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">
                Öffnungen und Zwangspunkte
              </div>
              <Tabelle dicht>
                <tbody>
                  {typ.oeffnungen.map((o) => (
                    <tr key={o.id}>
                      <Td stumm>{o.art === "tuer" ? "Tür" : "Fenster"}, {o.wand}</Td>
                      <Td num rechts>
                        {zahl(o.breite)} mm
                        {o.anschlag && <span className="ml-1 text-ink-3">{o.anschlag}</span>}
                        {o.bruestung !== undefined && <span className="ml-1 text-ink-3">BRH {zahl(o.bruestung)}</span>}
                      </Td>
                    </tr>
                  ))}
                  {typ.zwangspunkte.map((z) => (
                    <tr key={z.id}>
                      <Td stumm>{z.bezeichnung}</Td>
                      <Td rechts>
                        <Marke ton={z.freigabe === "bestaetigt" ? "mute" : "flag"}>
                          {z.wand}, {zahl(z.von)} mm
                        </Marke>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Tabelle>
            </Flaeche>

            <Flaeche className="mt-4 px-3 py-2.5">
              <div className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">
                Zugeordnete Einheiten
              </div>
              <p className="num mt-1.5 text-[11.5px] leading-relaxed text-ink-2">
                {typ.wohnungen.join(" · ")}
              </p>
              {typ.gespiegelt.length > 0 && (
                <p className="mt-2 text-[11px] text-ink-3">
                  Davon gespiegelt ausgeführt: <span className="num">{typ.gespiegelt.join(", ")}</span>
                </p>
              )}
            </Flaeche>
          </div>
        </div>
      </Inhalt>
    </>
  );
}
