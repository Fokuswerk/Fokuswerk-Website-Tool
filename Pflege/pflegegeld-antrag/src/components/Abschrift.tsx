"use client";

import { useState } from "react";

/** Textblock mit Knopf zum Kopieren. */
export default function Abschrift({ text }: { text: string }) {
  const [kopiert, setKopiert] = useState(false);

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(text);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2600);
    } catch {
      setKopiert(false);
    }
  }

  return (
    <div className="abschrift">
      <pre>{text}</pre>
      <button type="button" className="knopf knopf-zweit" onClick={kopieren}>
        {kopiert ? "Kopiert" : "Text kopieren"}
      </button>
    </div>
  );
}
