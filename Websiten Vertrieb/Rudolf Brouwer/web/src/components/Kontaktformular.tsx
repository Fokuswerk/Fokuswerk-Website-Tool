"use client";

import { useState } from "react";
import { betrieb } from "@/daten/betrieb";

/**
 * Auswahl zuerst, dann nur die nötigen Felder.
 * Abgeschickt wird über das E-Mail-Programm der Besucherin — so verlässt kein
 * Datensatz die Seite in Richtung eines Dritten, und es braucht keinen Server.
 * TODO: vom Kunden bestätigen — sobald ein Postfach oder ein Formulardienst
 * feststeht, wird das hier durch einen echten Endpunkt ersetzt.
 */

const themen = ["Bad", "Heizung", "Energie", "Pool", "Service", "Karriere", "Sonstiges"] as const;
type Thema = (typeof themen)[number];

export default function Kontaktformular() {
  const [thema, setThema] = useState<Thema>("Bad");
  const [name, setName] = useState("");
  const [kontakt, setKontakt] = useState("");
  const [ort, setOrt] = useState("");
  const [text, setText] = useState("");
  const [gesendet, setGesendet] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  const absenden = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setFehler("Bitte tragen Sie Ihren Namen ein.");
    if (!kontakt.trim()) return setFehler("Bitte tragen Sie eine Telefonnummer oder E-Mail-Adresse ein, damit wir antworten können.");
    setFehler(null);

    const betreff = `Anfrage ${thema} — ${name}`;
    const rumpf = [
      `Thema: ${thema}`,
      `Name: ${name}`,
      `Erreichbar unter: ${kontakt}`,
      ort.trim() ? `Ort des Vorhabens: ${ort}` : null,
      "",
      text.trim() || "(keine weitere Nachricht)",
    ].filter(Boolean).join("\n");

    window.location.href =
      `mailto:${betrieb.mail}?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(rumpf)}`;
    setGesendet(true);
  };

  if (gesendet) {
    return (
      <div className="formular-fertig" role="status">
        <p className="marke marke-akzent">Fast geschafft</p>
        <h3>Ihr E-Mail-Programm ist geöffnet.</h3>
        <p className="still satz">
          Schicken Sie die vorbereitete Nachricht ab — dann liegt Ihre Anfrage bei {betrieb.mail}.
          Wenn sich nichts geöffnet hat, rufen Sie einfach an.
        </p>
        <div className="formular-fertig-aktionen">
          <a href={`tel:${betrieb.telefonRoh}`} className="knopf">{betrieb.telefon} anrufen</a>
          <button type="button" className="knopf knopf-still" onClick={() => setGesendet(false)}>
            Zurück zum Formular
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="formular" onSubmit={absenden} noValidate>
      <fieldset className="formular-teil">
        <legend className="feldname">Ich interessiere mich für</legend>
        <div className="formular-chips">
          {themen.map((t) => (
            <button
              key={t}
              type="button"
              className="chip"
              aria-pressed={thema === t}
              onClick={() => setThema(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="formular-paar">
        <div>
          <label className="feldname" htmlFor="k-name">Name</label>
          <input id="k-name" className="feld" value={name} onChange={(e) => setName(e.target.value)}
                 autoComplete="name" required />
        </div>
        <div>
          <label className="feldname" htmlFor="k-kontakt">Telefon oder E-Mail</label>
          <input id="k-kontakt" className="feld" value={kontakt} onChange={(e) => setKontakt(e.target.value)}
                 autoComplete="tel" required />
        </div>
      </div>

      <div>
        <label className="feldname" htmlFor="k-ort">Ort des Vorhabens <span className="feldname-still">optional</span></label>
        <input id="k-ort" className="feld" value={ort} onChange={(e) => setOrt(e.target.value)} autoComplete="address-level2" />
      </div>

      <div>
        <label className="feldname" htmlFor="k-text">Worum geht es? <span className="feldname-still">optional</span></label>
        <textarea id="k-text" className="feld" value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="Ein paar Sätze genügen — Baujahr, Größe, was Sie vorhaben." />
      </div>

      {fehler ? <p className="formular-fehler" role="alert">{fehler}</p> : null}

      <div className="formular-fuss">
        <button type="submit" className="knopf">Anfrage abschicken</button>
        <p className="still formular-hinweis">
          Öffnet Ihr E-Mail-Programm mit den Angaben. Schneller geht es unter{" "}
          <a href={`tel:${betrieb.telefonRoh}`} className="formular-ruf">{betrieb.telefon}</a>.
        </p>
      </div>
    </form>
  );
}
