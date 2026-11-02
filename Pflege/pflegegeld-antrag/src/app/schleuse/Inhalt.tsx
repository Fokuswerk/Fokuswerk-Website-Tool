"use client";

import { useState } from "react";

export default function Inhalt({ weiter }: { weiter: string }) {
  const [passwort, setPasswort] = useState("");
  const [stand, setStand] = useState<"offen" | "prueft" | "falsch">("offen");

  async function senden(e: React.FormEvent) {
    e.preventDefault();
    if (!passwort) return;
    setStand("prueft");
    try {
      const antwort = await fetch("/api/schleuse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ passwort }),
      });
      if (antwort.ok) {
        // Harter Wechsel statt router.push: die Middleware soll den frischen
        // Keks sehen, und der steht erst beim naechsten echten Aufruf fest.
        window.location.href = weiter || "/";
        return;
      }
      setStand("falsch");
    } catch {
      setStand("falsch");
    }
  }

  return (
    <form className="karte" onSubmit={senden}>
      <label className="feld">
        Passwort
        <input
          type="password"
          value={passwort}
          onChange={(e) => {
            setPasswort(e.target.value);
            if (stand === "falsch") setStand("offen");
          }}
          autoFocus
          autoComplete="current-password"
          aria-invalid={stand === "falsch"}
          aria-describedby={stand === "falsch" ? "schleuse-fehler" : undefined}
        />
      </label>
      <button className="knopf" type="submit" disabled={stand === "prueft" || !passwort}>
        {stand === "prueft" ? "Wird geprüft …" : "Weiter"}
      </button>
      {stand === "falsch" && (
        <p id="schleuse-fehler" role="alert" className="quelle" style={{ marginTop: 12, marginBottom: 0, color: "var(--signal)" }}>
          Das Passwort stimmt nicht.
        </p>
      )}
    </form>
  );
}
