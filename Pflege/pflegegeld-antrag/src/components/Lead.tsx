"use client";

import { useState } from "react";
import { melden, sitzung } from "@/lib/messen";

type Props = {
  anlass: string;
  titel: string;
  text: string;
  knopf?: string;
  /** Nur Kennzahlen, keine einzelnen Antworten */
  befund?: Record<string, string | number | null>;
  /**
   * Beschriftung eines Datumsfeldes. Ohne dieses Datum koennen wir an keine
   * Frist erinnern - ein Versprechen ohne Datum waere keines.
   */
  datumsfeld?: string;
};

/**
 * Was nach dem Absenden dasteht. Ein pauschaler Satz waere fuer die Haelfte
 * der Anlaesse falsch - bei einem Widerspruch zaehlt nicht der 31. Dezember,
 * sondern die Monatsfrist ab Bekanntgabe des Bescheids.
 */
const BESTAETIGUNG: Record<string, string> = {
  bescheid:
    "Die Widerspruchsfrist beträgt einen Monat ab Bekanntgabe des Bescheids (§ 84 Abs. 1 SGG). " +
    "Wir erinnern Sie eine Woche vorher an das Datum, das Sie angegeben haben.",
  reform:
    "Sobald Bundestag und Bundesrat entschieden haben, schreiben wir Ihnen die endgültigen " +
    "Beträge für Ihren Pflegegrad.",
  stichtag:
    "Wir erinnern Sie im Dezember an den Stichtag und schreiben Ihnen, falls sich der Entwurf " +
    "im Verfahren noch ändert.",
  check:
    "Wir schicken Ihnen die Checkliste für den Begutachtungstermin und erinnern Sie an den " +
    "Stichtag am 31. Dezember.",
};
const BESTAETIGUNG_STANDARD =
  "Wir erinnern Sie an den Stichtag am 31. Dezember und schreiben Ihnen, sobald die " +
  "endgültigen Zahlen gelten.";

export default function Lead({ anlass, titel, text, knopf = "Erinnerung anfordern", befund, datumsfeld }: Props) {
  const [mail, setMail] = useState("");
  const [name, setName] = useState("");
  const [datum, setDatum] = useState("");
  const [einwilligung, setEinwilligung] = useState(false);
  const [stand, setStand] = useState<"offen" | "sendet" | "fertig" | "fehler">("offen");

  async function senden(e: React.FormEvent) {
    e.preventDefault();
    if (!einwilligung || !mail) return;
    setStand("sendet");
    // Ohne Abbruch haengt "Wird gesendet ..." bei schlechtem Netz unbegrenzt
    const abbruch = new AbortController();
    const uhr = setTimeout(() => abbruch.abort(), 15_000);
    try {
      const antwort = await fetch("/api/lead", {
        signal: abbruch.signal,
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          anlass,
          mail,
          name,
          befund: datumsfeld ? { ...(befund ?? {}), datum } : befund,
          sitzung: sitzung(),
        }),
      });
      setStand(antwort.ok ? "fertig" : "fehler");
      if (antwort.ok) melden("lead", { anlass });
    } catch {
      setStand("fehler");
    } finally {
      clearTimeout(uhr);
    }
  }

  if (stand === "fertig") {
    return (
      <div className="hinweis hinweis-gut" role="status">
        <div className="hinweis-titel">Notiert.</div>
        {BESTAETIGUNG[anlass] ?? BESTAETIGUNG_STANDARD}
        <br />
        <br />
        Ihre Adresse ist notiert. Bevor wir Ihnen etwas schicken, lassen wir Sie die Anmeldung
        per Mail bestätigen.
      </div>
    );
  }

  return (
    <form className="karte" onSubmit={senden}>
      <h3>{titel}</h3>
      <p className="text-leise" style={{ marginTop: 6 }}>{text}</p>
      <label className="feld">
        Name <span className="frei">(freiwillig)</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </label>
      {datumsfeld && (
        <label className="feld">
          {datumsfeld}
          <input
            type="date"
            required
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </label>
      )}
      <label className="feld">
        E-Mail
        <input
          type="email"
          required
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          autoComplete="email"
          placeholder="name@beispiel.de"
        />
      </label>
      <label className="schalter">
        <input
          type="checkbox"
          checked={einwilligung}
          onChange={(e) => setEinwilligung(e.target.checked)}
          required
        />
        <span>
          Ich möchte zum Verfahrensstand und zur Frist informiert werden und willige ein, dass
          dafür meine E-Mail-Adresse gespeichert wird. {befund ? (
            <>
              Mitgespeichert wird das Ergebnis als Zahl – Punkte und Pflegegrad. Das ist eine
              Gesundheitsangabe, deshalb brauchen wir dafür Ihre ausdrückliche Einwilligung
              (Art. 9 Abs. 2 Buchstabe a DSGVO). Die einzelnen Antworten bleiben in Ihrem Browser.
            </>
          ) : (
            <>Angaben zur Gesundheit werden dabei nicht übertragen.</>
          )} Widerruf jederzeit per Mail, danach löschen wir den Eintrag.
        </span>
      </label>
      <button
        className="knopf"
        type="submit"
        disabled={stand === "sendet"}
        aria-describedby={!einwilligung ? `${anlass}-bedingung` : undefined}
      >
        {stand === "sendet" ? "Wird gesendet …" : knopf}
      </button>
      {!einwilligung && (
        <p id={`${anlass}-bedingung`} className="quelle" style={{ marginTop: 10, marginBottom: 0 }}>
          Bitte setzen Sie zuerst das Häkchen.
        </p>
      )}
      {stand === "fehler" && (
        <p className="quelle" role="alert" style={{ marginTop: 10, color: "var(--signal)" }}>
          Das hat nicht geklappt – Ihre Adresse wurde <strong>nicht</strong> gespeichert. Bitte
          später erneut versuchen.
        </p>
      )}
    </form>
  );
}
