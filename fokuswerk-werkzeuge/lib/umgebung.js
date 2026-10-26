// Lädt .env für die Probeläufe. Der Endpunkt braucht das nicht — auf Vercel kommen die
// Werte aus den Projekteinstellungen. Hier geht es nur darum, dass ein Schlüssel in .env
// gefunden wird, egal aus welcher Schale das Skript gestartet wurde.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function ladeUmgebung() {
  const datei = join(dirname(dirname(fileURLToPath(import.meta.url))), ".env");
  let inhalt;
  try {
    inhalt = readFileSync(datei, "utf-8");
  } catch {
    return false;
  }
  for (const zeile of inhalt.split("\n")) {
    const treffer = zeile.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!treffer) continue;
    const [, name, roh] = treffer;
    if (process.env[name]) continue; // Was in der Umgebung steht, gewinnt.
    process.env[name] = roh.replace(/^(['"])(.*)\1$/, "$2").trim();
  }
  return true;
}
