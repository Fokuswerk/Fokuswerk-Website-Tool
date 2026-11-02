/**
 * Weist nach, dass die Datenbank wirklich erreichbar ist und die beiden
 * Tabellen so aussehen, wie der Code sie erwartet.
 *
 * Der Unterschied zu "die Variablen sind gesetzt": dieses Skript schreibt
 * einen Probeeintrag, liest ihn zurueck und loescht ihn wieder. Erst damit ist
 * belegt, dass der Dienstschluessel auch schreiben darf - ein Schluessel mit
 * zu wenig Rechten faellt sonst erst dann auf, wenn der erste echte Lead
 * verlorengeht.
 *
 * Aufruf:  node pruefung/datenbank.mjs
 * Liest SUPABASE_URL und SUPABASE_DIENSTSCHLUESSEL aus der Umgebung oder,
 * falls dort nicht gesetzt, aus .env.local.
 */

import { readFile } from "node:fs/promises";

/** .env.local nachladen, damit das Skript ohne Vorgeplaenkel laeuft. */
async function ausDatei() {
  try {
    const roh = await readFile(new URL("../.env.local", import.meta.url), "utf8");
    for (const zeile of roh.split("\n")) {
      const treffer = /^\s*([A-Z_]+)\s*=\s*(.*)\s*$/.exec(zeile);
      if (treffer && !process.env[treffer[1]]) process.env[treffer[1]] = treffer[2].trim();
    }
  } catch {
    // keine .env.local - dann muss die Umgebung reichen
  }
}
await ausDatei();

const BASIS = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SCHLUESSEL = process.env.SUPABASE_DIENSTSCHLUESSEL;

if (!BASIS || !SCHLUESSEL) {
  console.error("\n  Es fehlt SUPABASE_URL oder SUPABASE_DIENSTSCHLUESSEL.");
  console.error("  Beide in .env.local eintragen oder als Umgebungsvariable setzen.\n");
  process.exit(1);
}

function rest(pfad, init = {}) {
  return fetch(`${BASIS}/rest/v1/${pfad}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: SCHLUESSEL,
      authorization: `Bearer ${SCHLUESSEL}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

let fehler = 0;
const sagen = (ok, text, zusatz = "") => {
  if (!ok) fehler++;
  console.log(`  ${ok ? "ok     " : "FEHLER "} ${text}${zusatz ? "  —  " + zusatz : ""}`);
};

console.log(`\nDatenbank: ${BASIS}\n`);

// 1) Sind die Tabellen da und lesbar?
for (const tabelle of ["ereignisse", "leads"]) {
  try {
    const a = await rest(`${tabelle}?select=id&limit=1`);
    sagen(a.ok, `Tabelle ${tabelle} lesbar`, a.ok ? "" : `HTTP ${a.status}: ${(await a.text()).slice(0, 120)}`);
  } catch (e) {
    sagen(false, `Tabelle ${tabelle} lesbar`, String(e.message).slice(0, 120));
  }
}

// 2) Darf der Schluessel auch schreiben? Probeeintrag mit einer Adresse auf
//    .invalid - diese Endung ist reserviert und kann nie jemandem gehoeren.
const probe = `pruefung-${Date.now()}@pflegegeld-antrag.invalid`;
let angelegt = false;
try {
  const a = await rest("leads", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({
      zeit: new Date().toISOString(),
      anlass: "pruefung",
      mail: probe,
      name: "Probeeintrag",
      befund: { pruefung: true },
      quelle: "pruefung/datenbank.mjs",
      sitzung: null,
      bestaetigt: false,
    }),
  });
  angelegt = a.ok;
  sagen(a.ok, "Lead schreibbar", a.ok ? "" : `HTTP ${a.status}: ${(await a.text()).slice(0, 160)}`);
} catch (e) {
  sagen(false, "Lead schreibbar", String(e.message).slice(0, 120));
}

// 3) Kommt er auch zurueck?
if (angelegt) {
  const a = await rest(`leads?mail=eq.${encodeURIComponent(probe)}&select=id,anlass,bestaetigt`);
  const zeilen = a.ok ? await a.json() : [];
  sagen(zeilen.length === 1, "Probeeintrag wieder lesbar", zeilen.length === 1 ? "" : `${zeilen.length} Treffer`);
  sagen(zeilen[0]?.bestaetigt === false, "bestaetigt steht auf false", "Double Opt-in ist Pflicht vor dem ersten Mailversand");

  // 3b) Dasselbe noch einmal schicken - es darf keine zweite Zeile entstehen.
  const nochmal = await rest("leads?on_conflict=mail,anlass", {
    method: "POST",
    headers: { prefer: "return=minimal,resolution=ignore-duplicates" },
    body: JSON.stringify({
      zeit: new Date().toISOString(), anlass: "pruefung", mail: probe,
      name: "Zweiter Versuch", befund: {}, quelle: "pruefung", sitzung: null, bestaetigt: false,
    }),
  });
  const b = await rest(`leads?mail=eq.${encodeURIComponent(probe)}&select=id`);
  const danach = b.ok ? await b.json() : [];
  sagen(
    nochmal.ok && danach.length === 1,
    "Doppelanmeldung erzeugt keine Dublette",
    nochmal.ok ? (danach.length === 1 ? "" : `${danach.length} Zeilen`) : `HTTP ${nochmal.status} — fehlt der Index leads_mail_anlass_idx?`,
  );

  // 4) Wieder weg damit - in der echten Tabelle soll nichts von mir liegen.
  const w = await rest(`leads?mail=eq.${encodeURIComponent(probe)}`, {
    method: "DELETE",
    headers: { prefer: "return=minimal" },
  });
  sagen(w.ok, "Probeeintrag wieder geloescht", w.ok ? "" : `HTTP ${w.status}`);
}

// 5) Dasselbe kurz fuer die Ereignisse, die den Trichter in /admin fuellen.
try {
  const sitzung = `pruefung-${Date.now()}`;
  const a = await rest("ereignisse", {
    method: "POST",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({ zeit: new Date().toISOString(), art: "seite", pfad: "/pruefung", sitzung, werte: {} }),
  });
  sagen(a.ok, "Ereignis schreibbar", a.ok ? "" : `HTTP ${a.status}: ${(await a.text()).slice(0, 160)}`);
  if (a.ok) {
    const w = await rest(`ereignisse?sitzung=eq.${sitzung}`, { method: "DELETE", headers: { prefer: "return=minimal" } });
    sagen(w.ok, "Probeereignis wieder geloescht", w.ok ? "" : `HTTP ${w.status}`);
  }
} catch (e) {
  sagen(false, "Ereignis schreibbar", String(e.message).slice(0, 120));
}

console.log(
  fehler === 0
    ? "\nALLES GRUEN: die Datenbank nimmt Leads an und gibt sie zurueck.\n"
    : `\nNICHT GRUEN: ${fehler} Prüfung(en) fehlgeschlagen.\n`,
);
process.exit(fehler === 0 ? 0 : 1);
