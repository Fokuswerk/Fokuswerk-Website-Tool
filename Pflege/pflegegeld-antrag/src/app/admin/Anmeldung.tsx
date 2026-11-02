"use client";

import { useState } from "react";

export default function Anmeldung() {
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState(false);
  const [laeuft, setLaeuft] = useState(false);

  async function senden(e: React.FormEvent) {
    e.preventDefault();
    setLaeuft(true);
    setFehler(false);
    const antwort = await fetch("/api/admin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ passwort }),
    }).catch(() => null);
    setLaeuft(false);
    if (antwort?.ok) location.reload();
    else setFehler(true);
  }

  return (
    <form className="karte" onSubmit={senden} style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2 style={{ fontSize: "var(--t-h3)", marginBottom: 8 }}>Auswertung</h2>
      <p className="text-leise" style={{ marginBottom: 20 }}>
        Dieser Bereich ist nicht öffentlich.
      </p>
      <label className="feld">
        Passwort
        <input
          type="password"
          value={passwort}
          onChange={(e) => setPasswort(e.target.value)}
          autoFocus
          autoComplete="current-password"
        />
      </label>
      {fehler && (
        <p style={{ color: "var(--signal)", fontSize: "var(--t-4)", marginTop: -6 }}>
          Passwort stimmt nicht.
        </p>
      )}
      <button className="knopf" type="submit" disabled={laeuft || passwort.length === 0}>
        {laeuft ? "Prüfe …" : "Anmelden"}
      </button>
    </form>
  );
}
