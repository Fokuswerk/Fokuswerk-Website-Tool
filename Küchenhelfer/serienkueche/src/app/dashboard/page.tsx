"use client";

import Link from "next/link";
import { ArrowRight, Check, Dot } from "lucide-react";
import { KUECHENTYPEN, PROJEKT, WOHNUNGEN } from "@/data/projekt";
import { eur, kennzahlen, preis, projektsumme, variante, zahl } from "@/lib/berechnung";
import { aufmassLage, istFreigegeben, offeneFreigaben } from "@/lib/ableitung";
import { useDemo } from "@/store/demo";
import {
  Abschnitt, Flaeche, Hinweisband, Inhalt, Knopf, Marke,
  Seitenkopf, Tabelle, Td, Th, Zahlenreihe,
} from "@/components/ui/kit";

const PHASEN = [
  { id: "unterlagen", label: "Unterlagen", ziel: "/projects/demo/documents" },
  { id: "raeume", label: "Raumprüfung", ziel: "/projects/demo/rooms" },
  { id: "planung", label: "Küchenplanung", ziel: "/projects/demo/planning" },
  { id: "spezifikation", label: "Spezifikation", ziel: "/projects/demo/specifications" },
  { id: "rohbau", label: "Rohbau", ziel: null },
  { id: "aufmass", label: "Aufmaß & Bestellung", ziel: "/projects/demo/survey" },
];

export default function Dashboard() {
  const { auswahl, freigaben, aufmass, snapshots } = useDemo();

  const freigegeben = KUECHENTYPEN.filter((t) => istFreigegeben(t, freigaben));
  const offen = KUECHENTYPEN.filter((t) => !istFreigegeben(t, freigaben));
  const offenePunkte = KUECHENTYPEN.reduce((s, t) => s + offeneFreigaben(t, freigaben).length, 0);
  const summe = projektsumme(auswahl);
  const aufgemessen = WOHNUNGEN.filter(
    (w) => aufmassLage(w.messpunkte, aufmass[w.nr]) === "bestaetigt",
  ).length;

  const phaseAktiv = offen.length > 0 ? "raeume" : snapshots.length === 0 ? "spezifikation" : "aufmass";

  const naechster =
    offen.length > 0
      ? {
          text: `${offen.length} ${offen.length === 1 ? "Typ wartet" : "Typen warten"} auf Bestätigung — ${offen.map((t) => t.id).join(", ")}. Ohne Bestätigung keine Planung.`,
          label: "Zur Raumprüfung",
          ziel: "/projects/demo/rooms",
        }
      : snapshots.length === 0
        ? {
            text: "Alle Typen sind bestätigt und geplant. Die Spezifikation kann festgeschrieben werden.",
            label: "Zu den Spezifikationen",
            ziel: "/projects/demo/specifications",
          }
        : {
            text: `Spezifikation ${snapshots[0].version} ist festgeschrieben. Nach dem Rohbau folgt das Aufmaß — ${WOHNUNGEN.length - aufgemessen} von ${WOHNUNGEN.length} Einheiten offen.`,
            label: "Zum Aufmaß",
            ziel: "/projects/demo/survey",
          };

  return (
    <>
      <Seitenkopf
        titel={PROJEKT.name}
        kontext={
          <>
            {PROJEKT.ort} · {PROJEKT.art} · Bauherr {PROJEKT.bauherr}
          </>
        }
        aktionen={
          <>
            <Marke ton="mute">{PROJEKT.status}</Marke>
            <Knopf href={naechster.ziel} art="primaer">
                {naechster.label}
                <ArrowRight size={14} strokeWidth={1.8} />
              </Knopf>
          </>
        }
      />

      <Inhalt>
        <Zahlenreihe
          werte={[
            { label: "Wohneinheiten", wert: WOHNUNGEN.length, zusatz: `${PROJEKT.gebaeude} Gebäude, alle mit Küche` },
            { label: "Küchentypen", wert: KUECHENTYPEN.length, zusatz: `aus ${WOHNUNGEN.length} Grundrissen gebildet` },
            {
              label: "Spezifikation",
              wert: eur(summe.gesamt),
              zusatz: `netto · Rahmen ${eur(PROJEKT.budgetVon * WOHNUNGEN.length)}–${eur(PROJEKT.budgetBis * WOHNUNGEN.length)}`,
            },
            {
              label: "Typen bestätigt",
              wert: `${freigegeben.length} / ${KUECHENTYPEN.length}`,
              zusatz:
                offen.length > 0
                  ? `${offen.length} ${offen.length === 1 ? "Typ" : "Typen"} offen · ${offenePunkte} Prüfpunkte`
                  : "alle Typen bestätigt",
              ton: offen.length > 0 ? "flag" : undefined,
            },
            {
              label: "Aufmaß",
              wert: `${aufgemessen} / ${WOHNUNGEN.length}`,
              zusatz: aufgemessen === 0 ? "nach Rohbaufertigstellung" : "Einheiten bestätigt",
            },
          ]}
        />

        <Abschnitt titel="Projektphase">
          <Flaeche className="px-4 py-4">
            <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
              {PHASEN.map((p, i) => {
                const index = PHASEN.findIndex((x) => x.id === phaseAktiv);
                const zustand = i < index ? "fertig" : i === index ? "aktiv" : "offen";
                const inhalt = (
                  <span
                    className={`flex items-center gap-1.5 rounded-sm px-2 py-1 text-[12.5px] ${
                      zustand === "aktiv"
                        ? "bg-accent-soft font-medium text-accent"
                        : zustand === "fertig"
                          ? "text-ink-2"
                          : "text-ink-3"
                    }`}
                  >
                    {zustand === "fertig" ? (
                      <Check size={13} strokeWidth={2} className="text-good" />
                    ) : (
                      <Dot size={13} strokeWidth={3} className={zustand === "aktiv" ? "text-accent" : "text-ink-3"} />
                    )}
                    {p.label}
                  </span>
                );
                return (
                  <li key={p.id} className="flex items-center">
                    {p.ziel ? <Link href={p.ziel} className="hover:underline">{inhalt}</Link> : inhalt}
                    {i < PHASEN.length - 1 && <span className="px-1 text-ink-3">›</span>}
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 border-t border-line-2 pt-3 text-[12.5px] text-ink-2">
              {WOHNUNGEN.length} Wohnungen erfasst. {KUECHENTYPEN.length} Küchentypen gebildet.{" "}
              {freigegeben.length} {freigegeben.length === 1 ? "Typ" : "Typen"} bestätigt.{" "}
              {offen.length > 0
                ? `${offen.length} ${offen.length === 1 ? "Typ muss" : "Typen müssen"} geprüft werden.`
                : "Keine offenen Prüfungen."}
            </p>
          </Flaeche>
        </Abschnitt>

        <Abschnitt
          titel="Küchentypen"
          aktion={
            <Link href="/projects/demo/types" className="text-[12px] text-accent hover:underline">
              Alle Typen ansehen
            </Link>
          }
        >
          <Flaeche>
            <Tabelle>
              <thead>
                <tr>
                  <Th breite="74px">Typ</Th>
                  <Th>Grundform</Th>
                  <Th rechts>Einheiten</Th>
                  <Th rechts nebensache>Nische</Th>
                  <Th>Gewählte Variante</Th>
                  <Th rechts>je Küche</Th>
                  <Th rechts>Summe</Th>
                  <Th>Stand</Th>
                </tr>
              </thead>
              <tbody>
                {KUECHENTYPEN.map((t) => {
                  const v = variante(auswahl[t.id]);
                  const frei = istFreigegeben(t, freigaben);
                  const offene = offeneFreigaben(t, freigaben).length;
                  const k = kennzahlen(v, t);
                  return (
                    <tr key={t.id} className="hover:bg-ground">
                      <Td num>
                        <Link href="/projects/demo/types" className="font-medium text-accent hover:underline">
                          {t.id}
                        </Link>
                      </Td>
                      <Td>{t.bezeichnung}</Td>
                      <Td num rechts>{t.wohnungen.length}</Td>
                      <Td num rechts stumm nebensache>
                        {t.zeilen.map((z) => zahl(z.laenge)).join(" / ")}
                      </Td>
                      <Td>
                        {frei ? (
                          <span>
                            <span className="num text-ink-2">{v.kurz}</span>{" "}
                            <span className="text-ink-3">{v.bezeichnung}</span>
                          </span>
                        ) : (
                          <span className="text-ink-3">gesperrt bis zur Bestätigung</span>
                        )}
                      </Td>
                      <Td num rechts>{frei ? eur(k.preis) : "—"}</Td>
                      <Td num rechts>{frei ? eur(k.preis * t.wohnungen.length) : "—"}</Td>
                      <Td>
                        {frei ? (
                          <Marke ton="ok">bestätigt</Marke>
                        ) : (
                          <Marke ton="flag">{offene} offen</Marke>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <Td />
                  <Td stumm>Summe über alle Einheiten</Td>
                  <Td num rechts>{WOHNUNGEN.length}</Td>
                  <Td nebensache /><Td /><Td />
                  <Td num rechts>
                    <strong>{eur(summe.gesamt)}</strong>
                  </Td>
                  <Td />
                </tr>
              </tfoot>
            </Tabelle>
          </Flaeche>
          <p className="mt-2 text-[12px] text-ink-3">
            Alle Beträge sind aus dem Modulkatalog und der gewählten Variante gerechnet. Wird eine
            Variante gewechselt, ändern sich Mengen und Summen in der ganzen Anwendung mit.
          </p>
        </Abschnitt>

        <Abschnitt titel="Nächster Schritt">
          <Hinweisband art={offen.length > 0 ? "flag" : "ruhig"} titel={offen.length > 0 ? "Prüfung offen" : "Bereit"}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="max-w-[72ch]">{naechster.text}</span>
              <Knopf href={naechster.ziel}>
                  {naechster.label}
                  <ArrowRight size={13} strokeWidth={1.8} />
                </Knopf>
            </div>
          </Hinweisband>
        </Abschnitt>
      </Inhalt>
    </>
  );
}
