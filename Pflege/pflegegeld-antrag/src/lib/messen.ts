"use client";

import type { EreignisArt } from "./typen";

const SCHLUESSEL = "pga.sitzung";

/** Anonyme Sitzungskennung, nur im Browser, ohne Bezug zu einer Person. */
export function sitzung(): string {
  if (typeof window === "undefined") return "";
  try {
    let s = sessionStorage.getItem(SCHLUESSEL);
    if (!s) {
      s = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SCHLUESSEL, s);
    }
    return s;
  } catch {
    return "ohne-speicher";
  }
}

/**
 * Meldet ein Ereignis. Überträgt nie Angaben zur Gesundheit, nur Kennzahlen.
 * Schlägt die Meldung fehl, passiert nichts weiter — die Seite läuft normal.
 */
export function melden(art: EreignisArt, werte?: Record<string, string | number | null>): void {
  if (typeof window === "undefined") return;
  const koerper = JSON.stringify({
    art,
    pfad: window.location.pathname,
    sitzung: sitzung(),
    werte: werte ?? {},
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/ereignis", new Blob([koerper], { type: "application/json" }));
      return;
    }
  } catch {
    /* weiter mit fetch */
  }
  fetch("/api/ereignis", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: koerper,
    keepalive: true,
  }).catch(() => {});
}
