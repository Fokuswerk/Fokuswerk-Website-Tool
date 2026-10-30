// Messungen vorrechnen und als Datei ablegen.
//
// Jeder Lauf kostet Geld (rund 10 Cent je Gewerk und Ort), deshalb fragt das Skript vorher
// das Apify-Guthaben ab und rechnet nur so viele Kombinationen, wie hineinpassen. Was schon
// im Vorrat liegt und frisch genug ist, wird übersprungen.
//
//   node test/vorrechnen.mjs                 — zeigt, was anstünde, rechnet nichts
//   node test/vorrechnen.mjs --los           — rechnet, bis das Guthaben knapp wird
//   node test/vorrechnen.mjs --los --max 5   — höchstens fünf Läufe
//   node test/vorrechnen.mjs --liste         — was liegt im Vorrat
//   node test/vorrechnen.mjs --los --neu     — alles neu, auch was noch frisch ist
//
// Sinnvoll als monatlicher Lauf: Das Guthaben setzt sich am Monatsersten zurück, und nach
// vier Wochen gilt eine Messung ohnehin als abgelaufen.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ladeUmgebung } from "../lib/umgebung.js";
import { sammle } from "../lib/rangliste-messen.js";
import { ausVorrat, vorratsListe, schluessel, HALTBAR_TAGE } from "../lib/rangliste-vorrat.js";

ladeUmgebung();

const WURZEL = dirname(dirname(fileURLToPath(import.meta.url)));
const ORDNER = join(WURZEL, "daten", "vorgerechnet");

// Die sechs Gewerke, die auf der Seite als Knopf stehen. Freitext lässt sich nicht
// vorrechnen — dort bleibt es bei der Live-Messung.
const GEWERKE = ["Autowerkstatt", "Dachdecker", "Elektriker", "Maler", "Sanitär", "Tischlerei"];

// Nach Wahrscheinlichkeit sortiert: erst die Orte, aus denen die meisten Betriebe kommen,
// und innerhalb davon das Kerngewerk zuerst. Was das Guthaben nicht mehr hergibt, fällt
// hinten herunter und wird beim nächsten Lauf nachgeholt.
const ORTE = [
  "Oldenburg", "Westerstede", "Bad Zwischenahn", "Delmenhorst", "Rastede",
  "Wardenburg", "Edewecht", "Ganderkesee", "Varel", "Hude", "Wildeshausen", "Jever",
];

const KOSTEN_JE_LAUF = 0.15; // gemessen am 28.10.2026: 0,088 Profile + 0,055 Anzeigen, plus Luft
const PUFFER = 0.15; // so viel bleibt stehen

function paare() {
  const liste = [];
  for (const ort of ORTE) for (const gewerk of GEWERKE) liste.push({ gewerk, ort });
  // Das Kerngewerk zuerst, danach ortsweise auffüllen.
  return liste.sort((a, b) => (a.gewerk === "Autowerkstatt" ? -1 : 0) - (b.gewerk === "Autowerkstatt" ? -1 : 0));
}

async function guthaben(token) {
  const antwort = await fetch("https://api.apify.com/v2/users/me/limits", {
    headers: { Authorization: "Bearer " + token },
  });
  const d = (await antwort.json())?.data || {};
  const frei = (d.limits?.maxMonthlyUsageUsd || 0) - (d.current?.monthlyUsageUsd || 0);
  return { frei, verbraucht: d.current?.monthlyUsageUsd || 0, limit: d.limits?.maxMonthlyUsageUsd || 0 };
}

const args = process.argv.slice(2);
const los = args.includes("--los");
const grenze = Number(args[args.indexOf("--max") + 1]) || Infinity;
// Alles neu rechnen, auch was noch frisch ist. Gebraucht, wenn sich die MESSUNG geaendert
// hat und nicht nur gealtert ist: Am 29.10.2026 kam der Google-Ads-Check dazu, und die
// vorhandenen Messungen hatten die Domains nicht, die er braucht. Ohne diesen Schalter
// haette der Vorrat die neue Zahl bis zum Ablauf nach vier Wochen nicht gezeigt.
const alleNeu = args.includes("--neu");

if (args.includes("--liste")) {
  const v = vorratsListe();
  console.log(`Vorrat: ${v.length} Messungen (haltbar ${HALTBAR_TAGE} Tage)\n`);
  for (const e of v.sort((a, b) => (a.gewerk || "").localeCompare(b.gewerk || ""))) {
    if (e.kaputt) { console.log(`  ▲ ${e.datei} — nicht lesbar`); continue; }
    const alt = e.alterTage > HALTBAR_TAGE ? " ABGELAUFEN" : "";
    console.log(`  ${e.gewerk.padEnd(15)} ${e.ort.padEnd(18)} ${String(e.betriebe).padStart(3)} Betriebe · ${e.alterTage} Tage alt${alt}`);
  }
  process.exit(0);
}

const token = process.env.APIFY_TOKEN;
if (!token) {
  console.error("APIFY_TOKEN fehlt. In .env eintragen oder vor dem Aufruf setzen.");
  process.exit(1);
}

const g = await guthaben(token);
const moeglich = Math.max(0, Math.floor((g.frei - PUFFER) / KOSTEN_JE_LAUF));
const offen = paare().filter(({ gewerk, ort }) => alleNeu || !ausVorrat(gewerk, ort));

console.log(`Guthaben: ${g.verbraucht.toFixed(2)} von ${g.limit} USD verbraucht, ${g.frei.toFixed(2)} frei`);
console.log(`Offen:    ${offen.length} Kombinationen, davon passen ${moeglich} ins Guthaben`);
console.log(`Geplant:  ${Math.min(moeglich, offen.length, grenze)} Läufe\n`);

if (!los) {
  for (const p of offen.slice(0, Math.min(moeglich, grenze))) console.log(`  würde rechnen: ${p.gewerk} in ${p.ort}`);
  console.log("\nMit --los wirklich rechnen.");
  process.exit(0);
}

mkdirSync(ORDNER, { recursive: true });
let gerechnet = 0;
let leerlauf = 0;
let ausgegeben = 0;

for (const { gewerk, ort } of offen) {
  if (gerechnet >= Math.min(moeglich, grenze)) break;
  process.stdout.write(`  ${gewerk} in ${ort} … `);
  const start = Date.now();
  try {
    const messung = await sammle({ gewerk, ort });
    if (messung.fehler) {
      console.log(`übersprungen (${messung.fehler})`);
      // `profile_nicht_lesbar` kommt auch bei erschoepftem Guthaben. Zweimal hintereinander
      // heisst: weitermachen bringt nichts.
      if (messung.fehler === "profile_nicht_lesbar" && ++leerlauf >= 2) {
        console.log("\n  Zweimal keine Profile — Lauf hier beendet (meist leeres Guthaben).");
        break;
      }
      continue;
    }
    leerlauf = 0;
    writeFileSync(join(ORDNER, schluessel(gewerk, ort) + ".json"), JSON.stringify(messung));
    gerechnet += 1;
    ausgegeben += KOSTEN_JE_LAUF;
    const werbend = messung.betriebe.filter((b) => b.anzeigen.length).length;
    console.log(`${messung.betriebe.length} Betriebe, ${werbend} werben (${((Date.now() - start) / 1000).toFixed(0)} s)`);
  } catch (fehler) {
    const text = String(fehler?.message || "");
    console.log("FEHLER:", text.slice(0, 80));
    // Reicht das Guthaben nicht mehr, meldet Apify 402 — und zwar fuer jeden weiteren
    // Versuch genauso. Ohne diesen Abbruch lief das Skript die restliche Liste durch und
    // sammelte Fehlversuche, am 28.10.2026 sechs Stueck hintereinander.
    if (text.includes("402") || text.includes("not-enough-usage")) {
      console.log("\n  Guthaben aufgebraucht — Lauf hier beendet.");
      break;
    }
  }
}

const nachher = await guthaben(token);
console.log(`\n${gerechnet} Messungen abgelegt. Verbraucht: ${(nachher.verbraucht - g.verbraucht).toFixed(2)} USD.`);
console.log(`Noch frei: ${nachher.frei.toFixed(2)} USD.`);
if (offen.length > gerechnet) {
  console.log(`\n${offen.length - gerechnet} Kombinationen bleiben offen — nächster Lauf, wenn das Guthaben zurückgesetzt ist.`);
}
console.log("\nNicht vergessen: Die Dateien gehören ins Deployment (vercel deploy --prod).");
