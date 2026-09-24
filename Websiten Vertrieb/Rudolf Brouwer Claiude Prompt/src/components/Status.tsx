"use client";

import { useEffect, useState } from "react";
import { oeffnungszeiten } from "@/lib/daten";

const wochentage = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

function uhr(minuten: number) {
  const h = Math.floor(minuten / 60);
  const m = minuten % 60;
  return `${h}.${String(m).padStart(2, "0")} Uhr`;
}

function berlinJetzt() {
  const f = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const teile = Object.fromEntries(f.formatToParts(new Date()).map((p) => [p.type, p.value]));
  const kuerzel = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const tag = kuerzel.findIndex((k) => (teile.weekday ?? "").startsWith(k));
  return { tag, minuten: Number(teile.hour) * 60 + Number(teile.minute) };
}

/** Liest die Öffnungszeiten und sagt, was gerade gilt. */
export function lage() {
  const { tag, minuten } = berlinJetzt();
  const heute = oeffnungszeiten.find((t) => t.tag === tag);

  if (heute) {
    for (const [von, bis] of heute.bloecke) {
      if (minuten >= von && minuten < bis)
        return { offen: true, kurz: "Jetzt geöffnet", text: `Jetzt geöffnet · bis ${uhr(bis)}` };
    }
    const spaeter = heute.bloecke.find(([von]) => minuten < von);
    if (spaeter)
      return { offen: false, kurz: "Geschlossen", text: `Geschlossen · heute ab ${uhr(spaeter[0])}` };
  }

  for (let i = 1; i <= 7; i++) {
    const naechster = (tag + i) % 7;
    const eintrag = oeffnungszeiten.find((t) => t.tag === naechster);
    if (eintrag) {
      const label = i === 1 ? "morgen" : wochentage[naechster];
      return { offen: false, kurz: "Geschlossen", text: `Geschlossen · ${label} ab ${uhr(eintrag.bloecke[0][0])}` };
    }
  }
  return { offen: false, kurz: "Geschlossen", text: "Geschlossen" };
}

export default function Status({ klasse = "" }: { klasse?: string }) {
  const [zustand, setZustand] = useState<{ offen: boolean; kurz: string; text: string } | null>(null);

  useEffect(() => {
    setZustand(lage());
    const t = setInterval(() => setZustand(lage()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <span className={`flex items-center gap-4 ${klasse}`} aria-live="polite">
      <span
        aria-hidden
        className={`h-2 w-2 shrink-0 rounded-full ${
          zustand === null ? "bg-mittel" : zustand.offen ? "bg-[#5fbf8a]" : "bg-kupfer"
        }`}
      />
      {zustand === null ? (
        <span className="t-label">Öffnungszeiten</span>
      ) : (
        <>
          <span className="t-label md:hidden">{zustand.kurz}</span>
          <span className="t-label hidden md:inline">{zustand.text}</span>
        </>
      )}
    </span>
  );
}
