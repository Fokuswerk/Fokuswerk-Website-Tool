"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LAGEN, lageFinden, wegFuer, naechsteStation, type Lage } from "@/lib/weg";
import { Haken } from "@/components/Icon";
import { melden } from "@/lib/messen";

const SPEICHER = "pflegegeld-antrag.lage";

export default function Inhalt() {
  const [lage, setLage] = useState<Lage | null>(null);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    try {
      setLage(lageFinden(localStorage.getItem(SPEICHER)));
    } catch {
      /* ohne Speicher geht es auch, dann fragt die Seite eben jedes Mal */
    }
    setGeladen(true);
  }, []);

  function waehle(l: Lage) {
    setLage(l);
    try {
      localStorage.setItem(SPEICHER, l.id);
    } catch {}
    melden("klick", { was: "lage", lage: l.id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function zuruecksetzen() {
    setLage(null);
    try {
      localStorage.removeItem(SPEICHER);
    } catch {}
  }

  if (!geladen) {
    return <div role="status" className="quelle">Lädt …</div>;
  }

  if (!lage) {
    return (
      <>
        <h1>Wo stehen Sie gerade?</h1>
        <p className="vorspann abstand-s">
          Je nachdem ist etwas anderes das Dringendste. Eine Antwort genügt – danach sehen Sie
          den ganzen Weg und wo Sie darauf stehen.
        </p>
        <ul className="lagen abstand-m">
          {LAGEN.map((l) => (
            <li key={l.id}>
              <button type="button" onClick={() => waehle(l)}>
                {l.frage}
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  }

  // Ausgeschrieben statt zusammengesetzt: `weg-${stand}` waere fuer den
  // Klassenpruefer nur "weg-", und eine Klasse ohne Regel faellt dann nicht auf.
  const KLASSE = { erledigt: "weg-erledigt", hier: "weg-hier", offen: "weg-offen" } as const;

  const weg = wegFuer(lage);
  const jetzt = naechsteStation(lage);
  const offen = weg.filter((a) => a.stand !== "erledigt").length;

  return (
    <>
      <div className="auge auge-strich">Ihr Weg</div>
      <h1>{jetzt.titel}</h1>
      <p className="vorspann abstand-s">{lage.dringend}</p>

      {jetzt.ziel && (
        <div className="knopf-reihe abstand-s">
          <Link className="knopf" href={jetzt.ziel.pfad}>{jetzt.ziel.text}</Link>
        </div>
      )}

      <h2 className="abstand-l">
        Der ganze Weg
        <span className="weg-zahl">noch {offen} von {weg.length}</span>
      </h2>

      <ol className="weg">
        {weg.map(({ station, stand }) => (
          <li key={station.id} className={KLASSE[stand]} aria-current={stand === "hier" ? "step" : undefined}>
            <span className="weg-marke" aria-hidden="true">
              {stand === "erledigt" ? <Haken size={15} /> : null}
            </span>
            <div>
              <h3>
                {station.titel}
                {stand === "hier" && <> <span className="weg-hier">Sie sind hier</span></>}
                {stand === "erledigt" && <span className="nur-vorlesen"> – erledigt</span>}
              </h3>
              <span className="weg-dauer">{station.dauer}</span>
              <p>{station.text}</p>
              {station.ziel && stand !== "erledigt" && (
                <Link className="textlink" href={station.ziel.pfad}>{station.ziel.text}</Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="quelle abstand-l">
        Etwas anderes trifft zu?{" "}
        <button type="button" className="knopf-still" onClick={zuruecksetzen}>
          Lage neu wählen
        </button>
      </p>
    </>
  );
}
