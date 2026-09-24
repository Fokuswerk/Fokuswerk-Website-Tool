"use client";

import { useState } from "react";
import { betrieb } from "@/daten/betrieb";
import { stellen } from "@/daten/stellen";

/** Bewusst kurz: Name, ein Weg Sie zu erreichen, die Stelle. Alles andere
 *  ist freiwillig — ein Lebenslauf ist für das erste Gespräch nicht nötig. */
export default function Bewerbungsformular() {
  const [stelle, setStelle] = useState(stellen[0].titel);
  const [name, setName] = useState("");
  const [kontakt, setKontakt] = useState("");
  const [text, setText] = useState("");
  const [gesendet, setGesendet] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  const absenden = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setFehler("Bitte tragen Sie Ihren Namen ein.");
    if (!kontakt.trim()) return setFehler("Bitte tragen Sie eine Telefonnummer oder E-Mail-Adresse ein.");
    setFehler(null);

    const rumpf = [
      `Stelle: ${stelle}`,
      `Name: ${name}`,
      `Erreichbar unter: ${kontakt}`,
      "",
      text.trim() || "(keine weitere Nachricht)",
    ].join("\n");

    window.location.href =
      `mailto:${betrieb.mail}?subject=${encodeURIComponent(`Bewerbung — ${stelle}`)}&body=${encodeURIComponent(rumpf)}`;
    setGesendet(true);
  };

  if (gesendet) {
    return (
      <div className="formular-fertig" role="status">
        <p className="marke marke-akzent">Fast geschafft</p>
        <h3>Ihr E-Mail-Programm ist geöffnet.</h3>
        <p className="still satz">
          Schicken Sie die Nachricht ab — oder rufen Sie an, das geht genauso.
        </p>
        <div className="formular-fertig-aktionen">
          <a href={`tel:${betrieb.telefonRoh}`} className="knopf">{betrieb.telefon} anrufen</a>
        </div>
      </div>
    );
  }

  return (
    <form className="formular" onSubmit={absenden} noValidate>
      <div>
        <label className="feldname" htmlFor="b-stelle">Auf welche Stelle?</label>
        <select id="b-stelle" className="feld" value={stelle} onChange={(e) => setStelle(e.target.value)}>
          {stellen.map((s) => <option key={s.weg}>{s.titel}</option>)}
          <option>Initiativbewerbung</option>
          <option>Praktikum</option>
        </select>
      </div>

      <div className="formular-paar">
        <div>
          <label className="feldname" htmlFor="b-name">Name</label>
          <input id="b-name" className="feld" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </div>
        <div>
          <label className="feldname" htmlFor="b-kontakt">Telefon oder E-Mail</label>
          <input id="b-kontakt" className="feld" value={kontakt} onChange={(e) => setKontakt(e.target.value)} autoComplete="tel" required />
        </div>
      </div>

      <div>
        <label className="feldname" htmlFor="b-text">Etwas über Sie <span className="feldname-still">optional</span></label>
        <textarea id="b-text" className="feld" value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="Zwei Sätze genügen. Ein Lebenslauf ist für das erste Gespräch nicht nötig." />
      </div>

      {fehler ? <p className="formular-fehler" role="alert">{fehler}</p> : null}

      <div className="formular-fuss">
        <button type="submit" className="knopf">Bewerbung abschicken</button>
        <p className="still formular-hinweis">
          Lieber direkt sprechen? <a href={`tel:${betrieb.telefonRoh}`} className="formular-ruf">{betrieb.telefon}</a>
        </p>
      </div>
    </form>
  );
}
