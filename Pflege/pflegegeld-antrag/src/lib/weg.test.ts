import { LAGEN, STATIONEN, wegFuer, naechsteStation, lageFinden } from "./weg.ts";

let geprueft = 0;
let fehler = 0;

function stimmt(was: string, bedingung: boolean, warum = "") {
  geprueft++;
  if (!bedingung) {
    fehler++;
    console.error(`  FEHLER  ${was}${warum ? " — " + warum : ""}`);
  } else {
    console.log(`  ok      ${was}`);
  }
}

console.log("\n1) Jede Lage findet ihre Station");
for (const lage of LAGEN) {
  stimmt(
    `${lage.id} steht bei einer Station, die es gibt`,
    STATIONEN.some((s) => s.id === lage.steht),
    `steht bei "${lage.steht}"`,
  );
}

console.log("\n2) In jedem Weg gibt es genau ein „hier“");
for (const lage of LAGEN) {
  const hier = wegFuer(lage).filter((a) => a.stand === "hier");
  stimmt(`${lage.id}: genau eine aktuelle Station`, hier.length === 1, `${hier.length} gefunden`);
}

console.log("\n3) Was übersprungen wird, gilt als erledigt — und liegt davor");
for (const lage of LAGEN) {
  const weg = wegFuer(lage);
  const hierIndex = weg.findIndex((a) => a.stand === "hier");
  const falsch = weg.filter((a, i) => a.stand === "erledigt" && i > hierIndex);
  stimmt(
    `${lage.id}: nichts Erledigtes steht hinter der aktuellen Station`,
    falsch.length === 0,
    falsch.map((f) => f.station.id).join(", "),
  );
}

console.log("\n4) Entfallene Stationen sind wirklich entfallen");
for (const lage of LAGEN) {
  const weg = wegFuer(lage);
  const alleErledigt = (lage.entfaellt ?? []).every(
    (id) => weg.find((a) => a.station.id === id)?.stand === "erledigt",
  );
  stimmt(`${lage.id}: alle genannten Stationen sind erledigt`, alleErledigt);
}

console.log("\n5) Die nächste Station passt zur Lage");
for (const lage of LAGEN) {
  stimmt(`${lage.id}: naechsteStation stimmt mit dem Weg ueberein`, naechsteStation(lage).id === lage.steht);
}

console.log("\n6) Der Antrag steht nie hinter der Begutachtung");
{
  const i = (id: string) => STATIONEN.findIndex((s) => s.id === id);
  stimmt("Antrag vor Rechnen", i("antrag") < i("rechnen"));
  stimmt("Vorbereiten vor dem Termin", i("vorbereiten") < i("termin"));
  stimmt("Termin vor dem Bescheid", i("termin") < i("bescheid"));
  stimmt("Bescheid vor dem Widerspruch", i("bescheid") < i("widerspruch"));
}

console.log("\n7) Jede Station mit Ziel zeigt auf eine Seite, die es gibt");
{
  const seiten = new Set(["/antrag", "/check", "/mappe", "/bescheid", "/widerspruch", "/reform"]);
  for (const s of STATIONEN) {
    if (!s.ziel) continue;
    stimmt(`${s.id} -> ${s.ziel.pfad}`, seiten.has(s.ziel.pfad), "diese Seite gibt es nicht");
  }
}

console.log("\n8) lageFinden");
{
  stimmt("findet eine bekannte Lage", lageFinden("bescheid-da")?.id === "bescheid-da");
  stimmt("gibt bei Unsinn null", lageFinden("quatsch") === null);
  stimmt("gibt bei null auch null", lageFinden(null) === null);
}

console.log(
  fehler === 0
    ? `\nALLES GRUEN: ${geprueft} von ${geprueft} Pruefungen bestanden.\n`
    : `\nNICHT GRUEN: ${fehler} von ${geprueft} Pruefungen fehlgeschlagen.\n`,
);
process.exit(fehler === 0 ? 0 : 1);
