/**
 * Die Schleuse vor der ganzen Seite.
 *
 * Läuft auch in der Middleware, also im Edge-Runtime — dort gibt es kein
 * `node:crypto`, aber `crypto.subtle`. Deshalb ist das Merkmal asynchron.
 *
 * Das Passwort steht als Rückfallwert im Code, damit die Schleuse ohne
 * weiteres Zutun greift. Das ist hier vertretbar: sie hält die unfertige Seite
 * vor zufälligen Besuchern zurück, sie schützt keine Daten. Was Daten schützt,
 * ist der getrennte Zugang zur Auswertung mit eigenem, langem Passwort.
 * Über `SEITEN_PASSWORT` lässt sich der Wert jederzeit überschreiben.
 */

export const SCHLEUSE_KEKS = "pga_schleuse";

export function schleusenPasswort(): string {
  return process.env.SEITEN_PASSWORT || "qwer1234";
}

/**
 * Was im Keks steht. Nicht das Passwort selbst — ein Blick in die
 * Entwicklerwerkzeuge soll es nicht verraten.
 */
export async function schleusenMerkmal(): Promise<string> {
  const roh = new TextEncoder().encode(`pflegegeld-antrag:schleuse:${schleusenPasswort()}`);
  const verdaut = await crypto.subtle.digest("SHA-256", roh);
  return [...new Uint8Array(verdaut)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Vergleich ohne frühen Abbruch, damit die Laufzeit nichts verrät. */
export function gleich(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let unterschied = 0;
  for (let i = 0; i < a.length; i++) unterschied |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return unterschied === 0;
}
