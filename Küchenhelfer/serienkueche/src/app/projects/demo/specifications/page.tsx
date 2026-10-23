"use client";

import { useMemo, useState } from "react";
import { Lock, Printer } from "lucide-react";
import { KUECHENTYPEN, PROJEKT, WOHNUNGEN } from "@/data/projekt";
import { LIEFERANT, PREISSTAND, PREIS_GUELTIG_BIS } from "@/data/module";
import { eur, projektsumme, stueckliste, variante, zahl } from "@/lib/berechnung";
import { istFreigegeben } from "@/lib/ableitung";
import { useDemo } from "@/store/demo";
import {
  Abschnitt, Bestaetigung, Flaeche, Hinweisband, Inhalt, Knopf, Marke,
  Seitenkopf, Tabelle, Td, Th, melde,
} from "@/components/ui/kit";

const GRUPPEN = [
  { id: "alle", label: "Alle" },
  { id: "unterschrank", label: "Unterschränke" },
  { id: "hochschrank", label: "Hochschränke" },
  { id: "haengeschrank", label: "Hängeschränke" },
  { id: "geraet", label: "Geräte" },
  { id: "arbeitsplatte", label: "Flächen" },
  { id: "montage", label: "Leistungen" },
];

export default function Spezifikationen() {
  const { auswahl, freigaben, snapshots, schreibeFest } = useDemo();
  const [gruppe, setGruppe] = useState("alle");
  const [suche, setSuche] = useState("");
  const [frage, setFrage] = useState(false);
  const [detailTyp, setDetailTyp] = useState(KUECHENTYPEN[0].id);

  const summe = useMemo(() => projektsumme(auswahl), [auswahl]);
  const alleFrei = KUECHENTYPEN.every((t) => istFreigegeben(t, freigaben));
  const budget = Math.round((PROJEKT.budgetVon + PROJEKT.budgetBis) / 2) * PROJEKT.einheiten;

  const positionen = summe.positionen.filter((p) => {
    const g =
      gruppe === "alle" ||
      p.kategorie === gruppe ||
      (gruppe === "arbeitsplatte" && ["arbeitsplatte", "sockel", "blende", "spuele"].includes(p.kategorie)) ||
      (gruppe === "montage" && ["montage", "zuschlag"].includes(p.kategorie));
    const s =
      suche.trim() === "" ||
      p.bezeichnung.toLowerCase().includes(suche.toLowerCase()) ||
      p.artikel.toLowerCase().includes(suche.toLowerCase());
    return g && s;
  });

  const aktuell = snapshots[0];
  const abweichend = aktuell && aktuell.gesamt !== summe.gesamt;

  const festschreiben = () => {
    const nr = snapshots.length + 1;
    schreibeFest({
      version: `V${String(nr).padStart(2, "0")}`,
      datum: new Date().toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" }),
      preisstand: PREISSTAND,
      gesamt: summe.gesamt,
      einheiten: WOHNUNGEN.length,
      auswahl: { ...auswahl },
      freigegeben: "Mengengerüst, Modulauswahl, Anschlusspositionen",
      nichtFreigegeben: "Fertigungsmaße — erst nach dem Aufmaß",
    });
    setFrage(false);
    melde(`Spezifikation V${String(nr).padStart(2, "0")} festgeschrieben.`);
  };

  return (
    <>
      <Seitenkopf
        titel="Spezifikationen und Kosten"
        kontext={`${WOHNUNGEN.length} Einheiten · ${KUECHENTYPEN.length} Typen · Preisstand ${PREISSTAND}, gültig bis ${PREIS_GUELTIG_BIS} · ${LIEFERANT}`}
        aktionen={
          <>
            <Knopf onClick={() => window.print()}><Printer size={14} strokeWidth={1.7} />Druckansicht</Knopf>
            <Knopf art="primaer" deaktiviert={!alleFrei} onClick={() => setFrage(true)} titel={alleFrei ? undefined : "Erst wenn alle Typen bestätigt sind"}>
              <Lock size={14} strokeWidth={1.8} />Spezifikation festschreiben
            </Knopf>
          </>
        }
        hinweis={
          !alleFrei ? (
            <Hinweisband titel="Noch nicht festschreibbar">
              {KUECHENTYPEN.filter((t) => !istFreigegeben(t, freigaben)).map((t) => t.id).join(", ")} sind
              nicht bestätigt. Die Mengen unten rechnen mit der hinterlegten Standardwahl, sind aber
              noch nicht freigabefähig.
            </Hinweisband>
          ) : undefined
        }
      />

      <Inhalt breit>
        <Abschnitt titel="Projektsumme">
          <Flaeche>
            <Tabelle>
              <thead>
                <tr>
                  <Th breite="74px">Typ</Th>
                  <Th>Gewählte Variante</Th>
                  <Th rechts>Einheiten</Th>
                  <Th rechts>je Küche</Th>
                  <Th rechts>Summe</Th>
                  <Th rechts>Anteil</Th>
                </tr>
              </thead>
              <tbody>
                {summe.jeTyp.map((z) => {
                  const t = KUECHENTYPEN.find((x) => x.id === z.typId)!;
                  const v = variante(z.variantId);
                  return (
                    <tr key={z.typId} className="hover:bg-ground">
                      <Td num>{z.typId}</Td>
                      <Td>
                        <span className="num text-ink-2">{v.kurz}</span>{" "}
                        <span className="text-ink-3">{v.bezeichnung}</span>
                        {!istFreigegeben(t, freigaben) && <Marke ton="flag">nicht bestätigt</Marke>}
                      </Td>
                      <Td num rechts>{z.anzahl}</Td>
                      <Td num rechts>{eur(z.einzel)}</Td>
                      <Td num rechts>{eur(z.summe)}</Td>
                      <Td num rechts stumm>{Math.round((z.summe / summe.gesamt) * 100)} %</Td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <Td /><Td stumm>Spezifikation gesamt</Td>
                  <Td num rechts>{WOHNUNGEN.length}</Td>
                  <Td num rechts stumm>{eur(Math.round(summe.gesamt / WOHNUNGEN.length))}</Td>
                  <Td num rechts><strong>{eur(summe.gesamt)}</strong></Td>
                  <Td num rechts stumm>
                    {summe.gesamt <= budget ? "im Rahmen" : "über Rahmen"}
                  </Td>
                </tr>
              </tfoot>
            </Tabelle>
          </Flaeche>
          <p className="mt-2 text-[12px] text-ink-3">
            Budgetrahmen des Projekts: {eur(PROJEKT.budgetVon)} bis {eur(PROJEKT.budgetBis)} je Küche,
            über {WOHNUNGEN.length} Einheiten also bis {eur(PROJEKT.budgetBis * WOHNUNGEN.length)}.
          </p>
        </Abschnitt>

        <Abschnitt
          titel="Aggregierte Mengen über das Projekt"
          aktion={
            <div className="flex flex-wrap items-center gap-1.5">
              {GRUPPEN.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGruppe(g.id)}
                  aria-pressed={gruppe === g.id}
                  className={`rounded-sm px-2 py-[3px] text-[11.5px] transition-colors ${
                    gruppe === g.id ? "bg-ink text-paper" : "border border-line text-ink-2 hover:border-ink-3"
                  }`}
                >
                  {g.label}
                </button>
              ))}
              <input
                value={suche}
                onChange={(e) => setSuche(e.target.value)}
                placeholder="Artikel suchen"
                aria-label="Artikel suchen"
                className="num ml-1 w-[150px] rounded-sm border border-line bg-paper px-2 py-[3px] text-[11.5px] text-ink placeholder:text-ink-3"
              />
            </div>
          }
        >
          <Flaeche>
            <Tabelle dicht>
              <thead>
                <tr>
                  <Th>Artikeltyp</Th>
                  <Th rechts>Modulbreite</Th>
                  <Th>Typen</Th>
                  <Th>Artikel Partner</Th>
                  <Th rechts>Menge gesamt</Th>
                  <Th rechts>Einzelpreis</Th>
                  <Th rechts>Gesamtpreis</Th>
                </tr>
              </thead>
              <tbody>
                {positionen.map((p) => (
                  <tr key={p.modulId} className="hover:bg-ground">
                    <Td>{p.bezeichnung}</Td>
                    <Td num rechts stumm>{p.breite ? `${p.breite} mm` : "—"}</Td>
                    <Td num stumm>{p.typen.join(" ")}</Td>
                    <Td num stumm>{p.artikel}</Td>
                    <Td num rechts>
                      {p.einheit === "lfm" ? `${zahl(p.menge, 1)} lfm` : p.einheit === "psch" ? `${zahl(p.menge)} ×` : `${zahl(p.menge)} Stk`}
                    </Td>
                    <Td num rechts stumm>{eur(p.einzelpreis)}</Td>
                    <Td num rechts>{eur(p.gesamt)}</Td>
                  </tr>
                ))}
                {positionen.length === 0 && (
                  <tr><Td stumm>Keine Position zu diesem Filter.</Td><Td /><Td /><Td /><Td /><Td /><Td /></tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <Td stumm>{positionen.length} von {summe.positionen.length} Positionen</Td>
                  <Td /><Td /><Td /><Td /><Td />
                  <Td num rechts><strong>{eur(positionen.reduce((s, p) => s + p.gesamt, 0))}</strong></Td>
                </tr>
              </tfoot>
            </Tabelle>
          </Flaeche>
        </Abschnitt>

        <Abschnitt
          titel="Stückliste je Typ"
          aktion={
            <select
              value={detailTyp}
              onChange={(e) => setDetailTyp(e.target.value)}
              aria-label="Typ wählen"
              className="rounded-sm border border-line bg-paper px-2 py-[3px] text-[11.5px] text-ink"
            >
              {KUECHENTYPEN.map((t) => (
                <option key={t.id} value={t.id}>{t.id} · {t.bezeichnung}</option>
              ))}
            </select>
          }
        >
          <Flaeche>
            <Tabelle dicht>
              <thead>
                <tr>
                  <Th>Position</Th>
                  <Th rechts>Breite</Th>
                  <Th>Artikel</Th>
                  <Th rechts>Menge</Th>
                  <Th rechts>Einzelpreis</Th>
                  <Th rechts>Summe</Th>
                </tr>
              </thead>
              <tbody>
                {stueckliste(variante(auswahl[detailTyp])).map((p) => (
                  <tr key={p.modulId}>
                    <Td>{p.bezeichnung}</Td>
                    <Td num rechts stumm>{p.breite ? `${p.breite} mm` : "—"}</Td>
                    <Td num stumm>{p.artikel}</Td>
                    <Td num rechts>{p.einheit === "lfm" ? `${zahl(p.menge, 1)} lfm` : zahl(p.menge)}</Td>
                    <Td num rechts stumm>{eur(p.einzelpreis)}</Td>
                    <Td num rechts>{eur(p.gesamt)}</Td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <Td stumm>
                    {detailTyp} je Einheit ·{" "}
                    {KUECHENTYPEN.find((t) => t.id === detailTyp)!.wohnungen.length} Einheiten
                  </Td>
                  <Td /><Td /><Td /><Td />
                  <Td num rechts>
                    <strong>{eur(stueckliste(variante(auswahl[detailTyp])).reduce((s, p) => s + p.gesamt, 0))}</strong>
                  </Td>
                </tr>
              </tfoot>
            </Tabelle>
          </Flaeche>
        </Abschnitt>

        <Abschnitt titel="Festgeschriebene Spezifikationen">
          {snapshots.length === 0 ? (
            <Flaeche className="px-5 py-7 text-center">
              <div className="text-[13px] text-ink-2">Noch nichts festgeschrieben.</div>
              <p className="mx-auto mt-1 max-w-[60ch] text-[12px] text-ink-3">
                Beim Festschreiben entsteht ein unveränderlicher Stand der aktuellen Auswahl. Spätere
                Änderungen an der Planung verändern ihn nicht.
              </p>
            </Flaeche>
          ) : (
            <Flaeche>
              <Tabelle dicht>
                <thead>
                  <tr>
                    <Th>Version</Th>
                    <Th>Datum</Th>
                    <Th>Preisstand</Th>
                    <Th rechts>Einheiten</Th>
                    <Th rechts>Volumen</Th>
                    <Th>Stand</Th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((s, i) => (
                    <tr key={s.version}>
                      <Td num>{s.version}</Td>
                      <Td num stumm>{s.datum}</Td>
                      <Td num stumm>{s.preisstand}</Td>
                      <Td num rechts>{s.einheiten}</Td>
                      <Td num rechts>{eur(s.gesamt)}</Td>
                      <Td>
                        {i === 0 ? (
                          abweichend ? <Marke ton="flag">Planung geändert</Marke> : <Marke ton="ok">aktuell</Marke>
                        ) : (
                          <Marke ton="mute">abgelöst</Marke>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Tabelle>
              <div className="border-t border-line-2 px-4 py-3 text-[12px] leading-relaxed text-ink-2">
                <strong className="font-medium text-ink">Freigegeben sind Mengengerüst, Modulauswahl
                und Anschlusspositionen. Fertigungsmaße werden erst nach dem Aufmaß bestätigt.</strong>{" "}
                Arbeitsplattenlängen, Passblenden und Blendenzuschnitte entstehen aus den Ist-Maßen am
                fertigen Rohbau.
              </div>
            </Flaeche>
          )}
          {abweichend && (
            <div className="mt-3">
              <Hinweisband titel="Planung weicht vom festgeschriebenen Stand ab">
                Die aktuelle Auswahl ergibt {eur(summe.gesamt)}, der festgeschriebene Stand{" "}
                {aktuell.version} lautet {eur(aktuell.gesamt)}. Der Snapshot bleibt unverändert —
                für den neuen Stand ist eine neue Version festzuschreiben.
              </Hinweisband>
            </div>
          )}
        </Abschnitt>
      </Inhalt>

      <Bestaetigung
        offen={frage}
        titel="Spezifikation festschreiben"
        knopf="Festschreiben"
        abbrechen={() => setFrage(false)}
        bestaetigen={festschreiben}
        text={
          <>
            Es entsteht ein unveränderlicher Stand über {WOHNUNGEN.length} Einheiten mit einem Volumen
            von {eur(summe.gesamt)}, Preisstand {PREISSTAND}. Spätere Änderungen an der Planung
            verändern diesen Stand nicht, sondern erfordern eine neue Version.
          </>
        }
      />
    </>
  );
}
