"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const TITEL: Record<string, string> = {
  treppenlift: "Treppenlift oder Rampe",
  badumbau: "Barrierefreies Bad",
  betreuung24: "Betreuung im Haushalt",
  tagespflege: "Tagespflege in der Nähe",
  pflegedienst: "Ambulanter Pflegedienst",
  pflegebett: "Pflegebett und Hilfsmittel",
  hausnotruf: "Hausnotruf",
  alltagsbegleitung: "Alltagsbegleitung",
};

export default function Inhalt_Anfrage() {
  const [ziel, setZiel] = useState("");
  const [ort, setOrt] = useState("");
  const [name, setName] = useState("");
  const [telefon, setTelefon] = useState("");
  const [mail, setMail] = useState("");
  const [ok, setOk] = useState(false);
  const [sendet, setSendet] = useState(false);
  const [einwilligung, setEinwilligung] = useState(false);
  const [fehler, setFehler] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setZiel(p.get("ziel") ?? "");
  }, []);

  async function senden(e: React.FormEvent) {
    e.preventDefault();
    setSendet(true);
    setFehler(false);
    const antwort = await fetch("/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ anlass: `anfrage:${ziel}`, mail, name, befund: { ort, telefon } }),
    }).catch(() => null);
    setSendet(false);
    if (antwort?.ok) setOk(true);
    else setFehler(true);
  }

  if (ok) {
    return (
      <main className="band">
        <div className="huelle-schmal">
          <div className="hinweis hinweis-gut">
            <div className="hinweis-titel">Anfrage ist da.</div>
            Wir melden uns mit zwei bis drei Angeboten aus Ihrer Region. Sie entscheiden, ob und mit
            wem Sie sprechen.
          </div>
          <div className="knopf-reihe">
            <Link className="knopf knopf-zweit" href="/check">Zurück zum Rechner</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="band">
      <div className="huelle-schmal">
        <div className="auge">Unverbindlich</div>
        <h1>
          {TITEL[ziel] ?? "Anfrage"}
        </h1>
        <p className="vorspann" style={{ marginTop: 12 }}>
          Wir fragen bei zwei bis drei Anbietern in Ihrer Region an und schicken Ihnen die
          Angebote. Für vermittelte Anfragen erhalten wir eine Vergütung von den Anbietern.
        </p>

        <form className="karte abstand-m" onSubmit={senden}>
          <label className="feld">
            Postleitzahl oder Ort
            <input type="text" required value={ort} onChange={(e) => setOrt(e.target.value)} autoComplete="postal-code" />
          </label>
          <label className="feld">
            Name
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label className="feld">
            Telefon <span className="frei">(freiwillig, geht schneller)</span>
            <input type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} autoComplete="tel" />
          </label>
          <label className="feld">
            E-Mail
            <input type="email" required value={mail} onChange={(e) => setMail(e.target.value)} autoComplete="email" />
          </label>
          <label className="schalter">
            <input type="checkbox" required checked={einwilligung} onChange={(e) => setEinwilligung(e.target.checked)} />
            <span>
              Meine Angaben dürfen an passende Anbieter in meiner Region weitergegeben werden, damit
              diese mir ein Angebot machen. Widerruf jederzeit.
            </span>
          </label>
          {fehler && (
            <p role="alert" style={{ color: "var(--signal)", fontSize: "var(--t-4)" }}>
              Das hat nicht geklappt. Ihre Angaben stehen noch im Formular – bitte senden Sie
              noch einmal.
            </p>
          )}
          <button className="knopf" type="submit" disabled={sendet || !einwilligung}>
            {sendet ? "Wird gesendet …" : "Angebote anfordern"}
          </button>
        </form>

        <p className="quelle abstand-s">
          Es werden keine Angaben zur Gesundheit übermittelt, nur Kontaktdaten und das angefragte
          Thema.
        </p>
      </div>
    </main>
  );
}
