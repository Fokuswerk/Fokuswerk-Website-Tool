"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { vergleiche, euro, type Pflegegrad } from "@/lib/leistungen";
import Lead from "@/components/Lead";

export default function Inhalt_Reform() {
  const [grad, setGrad] = useState<Pflegegrad>(2);
  const [anteil, setAnteil] = useState(1);
  const [entlastung, setEntlastung] = useState(true);
  const [box, setBox] = useState(true);
  const [ersatz, setErsatz] = useState(false);
  const [ersatzAngehoerige, setErsatzAngehoerige] = useState(true);
  const [unter25, setUnter25] = useState(false);

  const v = useMemo(
    () => vergleiche({
      pflegegrad: grad, anteilPflegegeld: anteil,
      nutztEntlastungsbetrag: entlastung, nutztHilfsmittelbox: box,
      nutztErsatzpflege: ersatz, ersatzpflegeDurchAngehoerige: ersatzAngehoerige, unter25,
    }),
    [grad, anteil, entlastung, box, ersatz, ersatzAngehoerige, unter25],
  );

  return (
    <main className="band">
      <div className="huelle-schmal">
        <div className="auge">Leistungen im Monat</div>
        <h1>Was sich für Ihren Haushalt ändert</h1>
        <p className="vorspann" style={{ marginTop: 12 }}>
          Vier Angaben genügen. Verglichen werden die Beträge für 2026 mit denen, die der
          Regierungsentwurf für 2027 vorsieht.
        </p>

        <div className="karte abstand-m">
          <label className="feld">
            Pflegegrad
            <select value={grad} onChange={(e) => setGrad(Number(e.target.value) as Pflegegrad)}>
              {[1, 2, 3, 4, 5].map((g) => <option key={g} value={g}>Pflegegrad {g}</option>)}
            </select>
          </label>
          <label className="feld">
            Wer pflegt?
            <select value={anteil} onChange={(e) => setAnteil(Number(e.target.value))}>
              <option value={1}>Nur Angehörige – Pflegegeld</option>
              <option value={0.5}>Beides zur Hälfte</option>
              <option value={0}>Nur Pflegedienst – Sachleistung</option>
            </select>
          </label>
          <label className="schalter">
            <input type="checkbox" checked={entlastung} onChange={(e) => setEntlastung(e.target.checked)} />
            <span>Entlastungsbetrag wird genutzt (131 € im Monat)</span>
          </label>
          <label className="schalter">
            <input type="checkbox" checked={box} onChange={(e) => setBox(e.target.checked)} />
            <span>Pflegehilfsmittel zum Verbrauch werden bezogen (42 € im Monat)</span>
          </label>
          <label className="schalter">
            <input type="checkbox" checked={ersatz} onChange={(e) => setErsatz(e.target.checked)} />
            <span>Verhinderungs- oder Kurzzeitpflege wird genutzt</span>
          </label>
          {ersatz && (
            <label className="feld">
              Wer übernimmt die Ersatzpflege?
              <select
                value={ersatzAngehoerige ? "angehoerige" : "dienst"}
                onChange={(e) => setErsatzAngehoerige(e.target.value === "angehoerige")}
              >
                <option value="angehoerige">Nahe Angehörige, nicht erwerbsmäßig</option>
                <option value="dienst">Pflegedienst oder fremde Ersatzperson</option>
              </select>
            </label>
          )}
          <label className="schalter">
            <input type="checkbox" checked={unter25} onChange={(e) => setUnter25(e.target.checked)} />
            <span>Die pflegebedürftige Person ist unter 25 Jahre alt</span>
          </label>
        </div>

        <div className="tabelle-huelle abstand-m">
          <table className="daten">
            <thead>
              <tr><th>Leistung</th><th>2026</th><th>2027 laut Entwurf</th><th>Differenz</th></tr>
            </thead>
            <tbody>
              {v.posten.map((p) => {
                const d = Math.round((p.neu - p.alt) * 100) / 100;
                return (
                  <tr key={p.name} className={d < 0 ? "geaendert" : undefined}>
                    <td>
                      {p.name}
                      {p.hinweis && <div className="quelle">{p.hinweis}</div>}
                    </td>
                    <td className="zahl">{euro(p.alt)}</td>
                    <td className="zahl">{euro(p.neu)}</td>
                    <td className={`zahl ${d < 0 ? "minus" : d > 0 ? "plus" : ""}`}>
                      {d > 0 ? "+" : ""}{euro(d)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td>Summe im Monat</td>
                <td className="zahl">{euro(v.summeAlt)}</td>
                <td className="zahl">{euro(v.summeNeu)}</td>
                <td className={`zahl ${v.differenz < 0 ? "minus" : v.differenz > 0 ? "plus" : ""}`}>
                  {v.differenz > 0 ? "+" : ""}{euro(v.differenz)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className={`${`hinweis ${v.differenz < 0 ? "hinweis-signal" : v.differenz > 0 ? "hinweis-gut" : ""}`} abstand-s`}>
          <div className="hinweis-titel">
            {v.differenz < 0
              ? `${euro(Math.abs(v.differenz))} weniger im Monat`
              : v.differenz > 0
                ? `${euro(v.differenz)} mehr im Monat`
                : "Unverändert"}
          </div>
          {grad === 1
            ? "Pflegegrad 1 verliert den Entlastungsbetrag und erhält kein Sozialraumbudget. Es bleiben die Beratungseinsätze nach § 37 Abs. 3; die neue Pflegebegleitung kommt erst 2029. Betroffen sind 860.877 Menschen in ambulanter Versorgung."
            : v.differenz < 0
              ? "Das Entlastungsbudget liegt für die unteren Pflegegrade unter der bisherigen Summe aus Pflegegeld und Hilfsmittelpauschale."
              : "Rechnerisch bleibt mehr. Beachten Sie, dass das Sozialraumbudget zweckgebunden ist und gegen Belege erstattet wird."}
        </div>

        <p className="quelle abstand-s">
          Beträge 2026 nach der Leistungsübersicht des Bundesgesundheitsministeriums, Stand
          4. November 2025. Beträge 2027 nach §§ 36, 37, 39 und 45b SGB XI in der Fassung des
          Regierungsentwurfs vom 30. September 2026. Noch nicht beschlossen.
        </p>

        <div className="knopf-reihe">
          <Link className="knopf" href="/check">Punkte genau rechnen</Link>
        </div>

        <div className="abstand-m">
          <Lead
            anlass="reform"
            titel="Melden, wenn die Beträge feststehen"
            text="Bundestag und Bundesrat haben noch nicht entschieden. Wir schreiben Ihnen, sobald die endgültigen Zahlen im Bundesgesetzblatt stehen."
            befund={{ pflegegrad: grad, differenz: v.differenz }}
          />
        </div>
      </div>
    </main>
  );
}
