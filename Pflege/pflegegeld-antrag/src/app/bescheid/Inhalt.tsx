"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { berechne, MODUL_NAMEN, type Antworten, type ModulId } from "@/lib/nba";
import { punkte } from "@/lib/leistungen";
import Lead from "@/components/Lead";

/** Gewichtete Punkte, die im Gutachten je Modul stehen koennen. */
const MOEGLICH: Record<ModulId, number[]> = {
  1: [0, 2.5, 5, 7.5, 10],
  2: [0, 3.75, 7.5, 11.25, 15],
  3: [0, 3.75, 7.5, 11.25, 15],
  4: [0, 10, 20, 30, 40],
  5: [0, 5, 10, 15, 20],
  6: [0, 3.75, 7.5, 11.25, 15],
};
/**
 * Im Gutachten stehen fuenf Werte: Modul 1, ein gemeinsamer Wert fuer die
 * Module 2 und 3 (der hoehere von beiden zaehlt, § 15 Abs. 3 Satz 2 SGB XI), dann
 * Modul 4, 5 und 6. Modul 2 wird deshalb NICHT einzeln gefragt.
 */
const MODULE: ModulId[] = [1, 4, 5, 6];

/** Die Zeilen der Vergleichstabelle, in der Reihenfolge des Gutachtens. */
const ZEILEN: { titel: string; module: ModulId[] }[] = [
  { titel: "1 Mobilität", module: [1] },
  { titel: "2 und 3 Kognition und Verhalten", module: [2, 3] },
  { titel: "4 Selbstversorgung", module: [4] },
  { titel: "5 Krankheitsbewältigung", module: [5] },
  { titel: "6 Alltagsleben", module: [6] },
];

export default function Inhalt_Bescheid() {
  const [eigen, setEigen] = useState<Antworten | null>(null);
  const [gutachten, setGutachten] = useState<Partial<Record<ModulId, number>>>({});
  const [m23, setM23] = useState<number | undefined>(undefined);
  /** Nach welchem Recht der Bescheid ergangen ist. */
  const [rechtsstand, setRechtsstand] = useState<"2026" | "2027">("2026");

  useEffect(() => {
    try {
      const roh = localStorage.getItem("pflegegeld-antrag.antworten");
      if (roh) setEigen(JSON.parse(roh) as Antworten);
    } catch {}
  }, []);

  const eigenErgebnis = useMemo(() => (eigen ? berechne(eigen, rechtsstand) : null), [eigen, rechtsstand]);

  /** Erst rechnen, wenn wirklich alle sechs Werte dastehen. */
  const gesetzt = MODULE.filter((m) => gutachten[m] !== undefined).length + (m23 !== undefined ? 1 : 0);
  const vollstaendig = gesetzt === MODULE.length + 1;

  const summeGutachten = useMemo(() => {
    if (!vollstaendig) return 0;
    return MODULE.reduce((s, m) => s + (gutachten[m] ?? 0), 0) + (m23 ?? 0);
  }, [gutachten, m23, vollstaendig]);

  const schwellen = rechtsstand === "2026" ? [12.5, 27, 47.5, 70, 90] : [15, 30, 50, 70, 90];
  const gradGutachten = gradAus(summeGutachten, schwellen);
  const naechsteSchwelle = schwellen.find((x) => x > summeGutachten);
  const bisNaechste = naechsteSchwelle === undefined ? null : Math.round((naechsteSchwelle - summeGutachten) * 100) / 100;

  const abweichung =
    vollstaendig && eigenErgebnis
      ? Math.round((eigenErgebnis.gesamtpunkte - summeGutachten) * 100) / 100
      : null;

  return (
    <main className="band">
      <div className="huelle-schmal">
        <div className="auge">Schritt für Schritt</div>
        <h1>Bescheid prüfen</h1>
        <p className="vorspann" style={{ marginTop: 12 }}>
          Im Gutachten steht für jedes Modul ein Wert unter „gewichtete Punkte“. Tragen Sie diese
          Werte ein. Wir vergleichen sie mit Ihrer eigenen Bewertung und zeigen, wo der Unterschied
          liegt.
        </p>

        {!eigenErgebnis && (
          <div className="hinweis hinweis-gelb abstand-s">
            <div className="hinweis-titel">Noch kein eigener Durchgang</div>
            Für den Vergleich brauchen wir Ihre eigene Einschätzung.{" "}
            <Link href="/check">Erst den genauen Rechner ausfüllen</Link> – das dauert etwa zehn
            Minuten und bleibt in diesem Browser.
          </div>
        )}

        <div className="karte abstand-m">
          <h3>Werte aus dem Gutachten</h3>
          <label className="feld" style={{ marginTop: 14 }}>
            Wann wurde der Antrag gestellt?
            <select value={rechtsstand} onChange={(e) => setRechtsstand(e.target.value as "2026" | "2027")}>
              <option value="2026">bis 31. Dezember 2026 – heutige Punktgrenzen</option>
              <option value="2027">ab 1. Januar 2027 – neue Punktgrenzen</option>
            </select>
          </label>
          {MODULE.map((m) => (
            <label className="feld" key={m} style={{ marginTop: 12 }}>
              Modul {m} · {MODUL_NAMEN[m]}
              <select
                value={gutachten[m] ?? ""}
                onChange={(e) =>
                  setGutachten((g) => {
                    const neu = { ...g };
                    if (e.target.value === "") delete neu[m];
                    else neu[m] = Number(e.target.value);
                    return neu;
                  })
                }
              >
                <option value="">bitte wählen</option>
                {MOEGLICH[m].map((w) => (
                  <option key={w} value={w}>{punkte(w)} Punkte</option>
                ))}
              </select>
            </label>
          ))}
          <label className="feld" style={{ marginTop: 12 }}>
            Module 2 und 3 gemeinsam
            <span className="frei"> – im Gutachten steht nur ein Wert für beide</span>
            <select
              value={m23 ?? ""}
              onChange={(e) => setM23(e.target.value === "" ? undefined : Number(e.target.value))}
            >
              <option value="">bitte wählen</option>
              {MOEGLICH[2].map((w) => (
                <option key={w} value={w}>{punkte(w)} Punkte</option>
              ))}
            </select>
          </label>
        </div>

        {vollstaendig ? (
          <>
            <div className="ergebnis-paar abstand-m">
              <div className="ergebnis-feld jetzt">
                <div className="label">Laut Gutachten</div>
                <div className="zahl-gross">{gradGutachten === 0 ? "–" : `PG ${gradGutachten}`}</div>
                <div className="zahl-zusatz">{punkte(summeGutachten)} von 100 Punkten</div>
              </div>
              <div className="ergebnis-feld kuenftig">
                <div className="label">Ihre eigene Bewertung</div>
                <div className="zahl-gross">
                  {eigenErgebnis ? (eigenErgebnis.pflegegrad === 0 ? "–" : `PG ${eigenErgebnis.pflegegrad}`) : "?"}
                </div>
                <div className="zahl-zusatz">
                  {eigenErgebnis ? `${punkte(eigenErgebnis.gesamtpunkte)} von 100 Punkten` : "noch nicht gerechnet"}
                </div>
              </div>
            </div>

            {eigenErgebnis && abweichung !== null && (
              <div
                className={`${`hinweis ${abweichung >= 5 ? "hinweis-signal" : abweichung <= -5 ? "hinweis-gelb" : "hinweis-gut"}`} abstand-s`}
              >
                <div className="hinweis-titel">
                  {abweichung >= 5
                    ? `${punkte(abweichung)} Punkte Unterschied zu Ihren Gunsten`
                    : abweichung <= -5
                      ? "Das Gutachten liegt über Ihrer eigenen Bewertung"
                      : "Gutachten und eigene Bewertung liegen dicht beieinander"}
                </div>
                {abweichung >= 5
                  ? "Ob ein Widerspruch Erfolg hat, hängt vom Einzelfall ab – eine Statistik dazu liegt uns nicht vor. Nachprüfbar ist nur: Ihre Bewertung liegt um diesen Betrag höher. Die Frist beträgt einen Monat ab Bekanntgabe des Bescheids (§ 84 Abs. 1 SGG)."
                  : abweichung <= -5
                    ? "Prüfen Sie, ob Sie bei der eigenen Bewertung Hilfe unterschätzt haben, die Sie gewohnheitsmäßig leisten."
                    : "Ein Widerspruch hat hier wenig Aussicht, solange sich die Lage nicht verändert hat."}
              </div>
            )}

            {eigenErgebnis && (
              <>
                <h2 className="abstand-l">Wo die Differenz sitzt</h2>
                <div className="tabelle-huelle" style={{ marginTop: 10 }}>
                  <table className="daten">
                    <thead>
                      <tr>
                        <th>Modul</th>
                        <th>Gutachten</th>
                        <th>Ihre Bewertung</th>
                        <th>Differenz</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ZEILEN.map((z) => {
                        const meins = z.module
                          .map((m) => eigenErgebnis.module.find((x) => x.modul === m)!.gewichtetePunkte)
                          .reduce((x, y) => x + y, 0);
                        const ihr = (z.module.length > 1 ? m23 : gutachten[z.module[0]]) ?? 0;
                        const d = Math.round((meins - ihr) * 100) / 100;
                        return (
                          <tr key={z.titel} className={d >= 5 ? "geaendert" : undefined}>
                            <td>{z.titel}</td>
                            <td className="zahl">{punkte(ihr)}</td>
                            <td className="zahl">{punkte(meins)}</td>
                            <td className={`zahl ${d > 0 ? "plus" : d < 0 ? "minus" : ""}`}>
                              {d > 0 ? "+" : ""}{punkte(d)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {abweichung !== null && abweichung >= 5 && (
              <div className="karte abstand-m">
                <h3>Widerspruch prüfen lassen</h3>
                <p style={{ fontSize: "var(--t-4)", color: "var(--tinte-2)" }}>
                  Die Begründung eines Widerspruchs ist eine rechtliche Bewertung Ihres Einzelfalls.
                  Das darf nur eine Anwältin oder ein Anwalt für Sie übernehmen, nicht wir.
                </p>
                <div className="preis">350 €</div>
                <div className="preis-zusatz">nur bei Erfolg, sonst nichts</div>
                <Link className="knopf" href="/widerspruch" style={{ marginTop: 12 }}>
                  So läuft es ab
                </Link>
              </div>
            )}

            <div className="abstand-m">
              <Lead
                anlass="bescheid"
                titel="Fristerinnerung für den Widerspruch"
                text="Die Widerspruchsfrist beträgt einen Monat ab Bekanntgabe des Bescheids. Sagen Sie uns, wann er bei Ihnen ankam – wir erinnern Sie eine Woche vor Fristende."
                datumsfeld="Wann kam der Bescheid bei Ihnen an?"
                befund={{ summeGutachten, gradGutachten, abweichung }}
                knopf="Frist merken"
              />
            </div>
          </>
        ) : (
          <div className="hinweis abstand-m">
            <div className="hinweis-titel">
              {gesetzt} von {MODULE.length + 1} Werten eingetragen
            </div>
            Sobald alle fünf Werte dastehen, rechnen wir die Summe und zeigen, wo die größte
            Abweichung liegt. Vorher wäre jede Zahl geraten.
          </div>
        )}

        <div className="rdg abstand-m">
          Dieser Vergleich rechnet Zahlen gegeneinander. Er bewertet Ihren Fall nicht rechtlich und
          sagt nichts über die Erfolgsaussichten eines Widerspruchs.
        </div>
      </div>
    </main>
  );
}

function gradAus(summe: number, schwellen: number[]): number {
  let g = 0;
  for (let i = 0; i < schwellen.length; i++) if (summe >= schwellen[i]) g = i + 1;
  return g;
}
