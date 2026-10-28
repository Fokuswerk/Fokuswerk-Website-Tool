// Vorgerechnete Messungen, als Dateien im Projekt.
//
// Warum als Datei und nicht in einer Datenbank: Dasselbe Muster wie `marktlage.js` mit der
// Engpassanalyse der Bundesagentur — einmal abgerufen, abgelegt, kein Dienst zur Laufzeit,
// nichts, was zur Unzeit bricht. `vercel.json` liefert den Ordner `daten/` ohnehin mit aus.
//
// Was das löst: Eine frische Messung dauert rund 35 Sekunden (Apify braucht allein für den
// Start des Abrufs den größten Teil davon). Diese Wartezeit war in allen fünf Prüfungen vom
// 28.10.2026 der stärkste Abbruchpunkt der Seite. Wer einen vorgerechneten Ort anklickt,
// bekommt die Zahlen jetzt sofort.
//
// Was das kostet: nichts zur Laufzeit. Das Vorrechnen selbst kostet rund 10 Cent je Ort und
// Gewerk, einmalig, über `node test/vorrechnen.mjs`.
//
// Wie alt darf das sein: Bewertungszahlen bewegen sich über Wochen, nicht über Stunden. Vier
// Wochen sind unkritisch; danach gilt der Vorrat als abgelaufen und es wird frisch gemessen,
// damit auf der Seite nie eine Zahl steht, die niemand mehr nachvollziehen kann.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = dirname(dirname(fileURLToPath(import.meta.url)));
const ORDNER = join(WURZEL, "daten", "vorgerechnet");

/** Höchstalter einer vorgerechneten Messung in Tagen. */
export const HALTBAR_TAGE = 28;

/** Aus Gewerk und Ort ein Dateiname, der auf jedem Dateisystem funktioniert. */
export function schluessel(gewerk, ort) {
  const sauber = (t) =>
    String(t || "")
      .toLowerCase()
      .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  return `${sauber(gewerk)}__${sauber(ort)}`;
}

/**
 * Eine vorgerechnete Messung holen — oder null.
 *
 * Gibt die Messung in genau der Form zurück, die `sammle()` liefert, damit der Endpunkt
 * nicht unterscheiden muss, woher sie kommt.
 */
export function ausVorrat(gewerk, ort) {
  const datei = join(ORDNER, schluessel(gewerk, ort) + ".json");
  if (!existsSync(datei)) return null;
  try {
    const d = JSON.parse(readFileSync(datei, "utf8"));
    const alter = (Date.now() - new Date(d.gemessenAm).getTime()) / 86400000;
    if (!(alter >= 0) || alter > HALTBAR_TAGE) return null;
    return { ...d, ausVorrat: true, alterTage: Math.round(alter) };
  } catch {
    return null;
  }
}

/** Was liegt im Vorrat? Für das Vorrechnen-Skript und zum Nachsehen. */
export function vorratsListe() {
  if (!existsSync(ORDNER)) return [];
  return readdirSync(ORDNER)
    .filter((n) => n.endsWith(".json"))
    .map((n) => {
      try {
        const d = JSON.parse(readFileSync(join(ORDNER, n), "utf8"));
        return {
          datei: n,
          gewerk: d.gewerk,
          ort: d.ort,
          betriebe: d.betriebe?.length ?? 0,
          anzeigen: d.anzeigenVerfuegbar,
          alterTage: Math.round((Date.now() - new Date(d.gemessenAm).getTime()) / 86400000),
        };
      } catch {
        return { datei: n, kaputt: true };
      }
    });
}
