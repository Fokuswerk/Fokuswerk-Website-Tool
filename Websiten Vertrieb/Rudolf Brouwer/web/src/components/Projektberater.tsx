"use client";

import Link from "next/link";
import { useState } from "react";
import { betrieb } from "@/daten/betrieb";

/**
 * Der Projektberater ordnet ein und qualifiziert — er ersetzt keine Beratung.
 * Deshalb: keine Preise, keine verbindliche Produktempfehlung, kein Ergebnis,
 * das nach einem Angebot aussieht. Am Ende steht ein nächster Schritt.
 */

type Bereich = "bad" | "heizung" | "energie" | "pool" | "service";
type Stand = "neubau" | "umbau" | "defekt" | "anfang";
type Zeit = "sofort" | "monate" | "jahr" | "offen";

const bereiche: { wert: Bereich; name: string; zusatz: string }[] = [
  { wert: "bad", name: "Ein Bad", zusatz: "neu oder umgebaut" },
  { wert: "heizung", name: "Die Heizung", zusatz: "erneuern oder warten" },
  { wert: "energie", name: "Energie", zusatz: "Solarwärme, regenerative Technik" },
  { wert: "pool", name: "Pool oder Wellness", zusatz: "Becken, Technik, Dampfdusche" },
  { wert: "service", name: "Etwas ist kaputt", zusatz: "Störung, Reparatur, Wartung" },
];

const staende: { wert: Stand; name: string; zusatz: string }[] = [
  { wert: "neubau", name: "Neubau", zusatz: "Das Gebäude entsteht gerade" },
  { wert: "umbau", name: "Bestand", zusatz: "Vorhanden, soll erneuert werden" },
  { wert: "defekt", name: "Defekt", zusatz: "Läuft nicht mehr richtig" },
  { wert: "anfang", name: "Noch offen", zusatz: "Erst einmal Ideen sammeln" },
];

const zeiten: { wert: Zeit; name: string }[] = [
  { wert: "sofort", name: "So schnell wie möglich" },
  { wert: "monate", name: "In den nächsten Monaten" },
  { wert: "jahr", name: "Irgendwann dieses Jahr" },
  { wert: "offen", name: "Noch nicht terminiert" },
];

const ziele: Record<Bereich, { titel: string; weg: string; satz: string }> = {
  bad: { titel: "Badsanierung", weg: "/leistungen/badsanierung", satz: "Brouwer plant das Bad und koordiniert Maurer, Fliesenleger, Elektriker, Maler und Innenausbau mit." },
  heizung: { titel: "Heizung", weg: "/leistungen/heizung", satz: "Vor der Technik steht die Berechnung des tatsächlichen Wärmebedarfs Ihres Gebäudes." },
  energie: { titel: "Energie und Solarwärme", weg: "/leistungen/energie", satz: "Solarthermie erwärmt Brauchwasser und unterstützt die Heizung — was Ihr Dach hergibt, klärt die Beratung." },
  pool: { titel: "Pool und Wellness", weg: "/leistungen/pool-wellness", satz: "Becken, Technik und Beheizung kommen aus einem Haus. Zuständig ist die Brouwer Pool & Wellness GmbH an derselben Adresse." },
  service: { titel: "Kundendienst", weg: "/leistungen/kundendienst", satz: "Wartung, Reparatur und Störungsbeseitigung übernimmt der eigene Kundendienst." },
};

export default function Projektberater() {
  const [bereich, setBereich] = useState<Bereich | null>(null);
  const [stand, setStand] = useState<Stand | null>(null);
  const [zeit, setZeit] = useState<Zeit | null>(null);

  const fertig = bereich && stand && zeit;
  const eilig = stand === "defekt" || zeit === "sofort";
  const notfall = bereich === "service" && stand === "defekt";
  const schritt = bereich ? (stand ? (zeit ? 3 : 2) : 1) : 0;

  const zuruecksetzen = () => { setBereich(null); setStand(null); setZeit(null); };

  const naechsterSchritt = () => {
    if (notfall) return "Rufen Sie an. Bei einem Heizungsausfall ist der Notdienst rund um die Uhr erreichbar — ein Formular hilft hier nicht.";
    if (eilig) return "Rufen Sie an. Bei kurzen Fristen entscheidet ein Telefonat schneller, als ein Formular es kann.";
    if (bereich === "bad" || bereich === "pool") return "Vereinbaren Sie einen Termin in der Ausstellung. Oberflächen und Armaturen entscheidet man besser im Raum als am Bildschirm.";
    if (stand === "anfang") return "Vereinbaren Sie ein erstes Gespräch. Am Anfang geht es weniger um Technik als um das, was das Gebäude hergibt.";
    return "Stellen Sie eine Anfrage. Für den Termin vor Ort genügen ein paar Angaben zum Gebäude.";
  };

  return (
    <div className="berater">
      <div className="berater-kopf">
        <h2 className="satz-eng">Sagen Sie kurz, worum es geht.</h2>
        <p className="still satz berater-blei">
          Drei Fragen, dann wissen Sie, welcher Bereich zuständig ist und welcher
          Schritt sich als nächstes lohnt. Keine Preisangabe — die gibt es erst,
          wenn jemand das Gebäude gesehen hat.
        </p>
      </div>

      <div className="berater-tafel">
        <ol className="berater-fragen">
          <li className="berater-frage" data-an={schritt >= 0 ? "ja" : "nein"}>
            <div className="berater-zeile">
              <span className="kennziffer">01</span>
              <h3 className="berater-titel" id="berater-f1">Worum geht es?</h3>
            </div>
            <div className="berater-wahl" role="group" aria-labelledby="berater-f1">
              {bereiche.map((b) => (
                <button
                  key={b.wert}
                  type="button"
                  className="berater-knopf"
                  data-an={bereich === b.wert ? "ja" : "nein"}
                  aria-pressed={bereich === b.wert}
                  onClick={() => { setBereich(b.wert); setStand(null); setZeit(null); }}
                >
                  <span className="berater-name">{b.name}</span>
                  <span className="berater-zusatz">{b.zusatz}</span>
                </button>
              ))}
            </div>
          </li>

          <li className="berater-frage" data-an={bereich ? "ja" : "nein"} aria-hidden={!bereich}>
            <div className="berater-zeile">
              <span className="kennziffer">02</span>
              <h3 className="berater-titel" id="berater-f2">Wie ist der Stand?</h3>
            </div>
            <div className="berater-wahl" role="group" aria-labelledby="berater-f2">
              {staende.map((s) => (
                <button
                  key={s.wert}
                  type="button"
                  className="berater-knopf"
                  data-an={stand === s.wert ? "ja" : "nein"}
                  aria-pressed={stand === s.wert}
                  tabIndex={bereich ? 0 : -1}
                  onClick={() => { setStand(s.wert); setZeit(null); }}
                >
                  <span className="berater-name">{s.name}</span>
                  <span className="berater-zusatz">{s.zusatz}</span>
                </button>
              ))}
            </div>
          </li>

          <li className="berater-frage" data-an={stand ? "ja" : "nein"} aria-hidden={!stand}>
            <div className="berater-zeile">
              <span className="kennziffer">03</span>
              <h3 className="berater-titel" id="berater-f3">Wann soll es losgehen?</h3>
            </div>
            <div className="berater-wahl berater-wahl-eng" role="group" aria-labelledby="berater-f3">
              {zeiten.map((z) => (
                <button
                  key={z.wert}
                  type="button"
                  className="chip"
                  data-an={zeit === z.wert ? "ja" : "nein"}
                  aria-pressed={zeit === z.wert}
                  tabIndex={stand ? 0 : -1}
                  onClick={() => setZeit(z.wert)}
                >
                  {z.name}
                </button>
              ))}
            </div>
          </li>
        </ol>

        <div className="berater-ergebnis" data-an={fertig ? "ja" : "nein"} aria-live="polite">
          {fertig && bereich ? (
            <>
              <div className="niveau berater-ergebnis-kopf">
                <p className="marke marke-akzent">Ihr Ergebnis</p>
                <button type="button" className="kennziffer berater-neu" onClick={zuruecksetzen}>
                  Neu beginnen
                </button>
              </div>
              <h3 className="berater-ziel">{ziele[bereich].titel}</h3>
              <p className="still satz berater-ziel-satz">{ziele[bereich].satz}</p>

              <p className="marke berater-schritt-marke">Nächster Schritt</p>
              <p className="berater-schritt">{naechsterSchritt()}</p>

              <div className="berater-aktionen">
                {notfall || eilig ? (
                  <a href={`tel:${betrieb.telefonRoh}`} className="knopf">{betrieb.telefon} anrufen</a>
                ) : (
                  <Link href={`/kontakt#anfrage`} className="knopf">Anfrage stellen</Link>
                )}
                <Link href={ziele[bereich].weg} className="knopf knopf-still">
                  {ziele[bereich].titel} ansehen
                </Link>
              </div>

              <p className="berater-hinweis still">
                Diese Einordnung ersetzt keine Fachberatung. Welche Anlage zu Ihrem Gebäude passt,
                entscheidet sich vor Ort — nicht aus drei Antworten.
              </p>
            </>
          ) : (
            <p className="still berater-warte">
              {schritt === 0 && "Wählen Sie oben aus, worum es geht."}
              {schritt === 1 && "Noch zwei Fragen."}
              {schritt === 2 && "Noch eine Frage."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
