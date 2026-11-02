import { KRITERIEN, berechne, type Antworten } from "./nba.ts";
import { hebel, schritte, abstandSatz } from "./plan.ts";

let geprueft = 0;
let fehler = 0;

function gleich(was: string, ist: unknown, soll: unknown) {
  geprueft++;
  if (JSON.stringify(ist) !== JSON.stringify(soll)) {
    fehler++;
    console.error(`  FEHLER  ${was}\n          ist  ${JSON.stringify(ist)}\n          soll ${JSON.stringify(soll)}`);
  } else {
    console.log(`  ok      ${was} = ${JSON.stringify(soll)}`);
  }
}

function stimmt(was: string, bedingung: boolean, warum = "") {
  geprueft++;
  if (!bedingung) {
    fehler++;
    console.error(`  FEHLER  ${was}${warum ? " — " + warum : ""}`);
  } else {
    console.log(`  ok      ${was}`);
  }
}

const IDS = KRITERIEN.filter((k) => /^[1-6]\.\d+$/.test(k.id)).map((k) => k.id);
const alle = (wert: number): Antworten => Object.fromEntries(IDS.map((id) => [id, wert]));

console.log("\n1) Jeder genannte Hebel bewegt das Ergebnis wirklich");
{
  const a = Object.fromEntries(IDS.map((id, i) => [id, i % 3 === 0 ? 1 : 0]));
  const basis = berechne(a, "2026").gesamtpunkte;
  const h = hebel(a, "2026", 10);
  stimmt("es wird ueberhaupt ein Hebel gefunden", h.length > 0);
  let alleStimmen = true;
  for (const x of h) {
    const probe = { ...a, [x.id]: a[x.id] + 1 };
    const echt = berechne(probe, "2026").gesamtpunkte - basis;
    if (Math.abs(echt - x.gewinn) > 0.001) alleStimmen = false;
  }
  stimmt("der angegebene Gewinn stimmt bei jedem nachgerechnet", alleStimmen);
}

console.log("\n2) Was nichts bewegt, steht auch nicht drin");
{
  // Alles auf der hoechsten Stufe: da geht nichts mehr hoeher.
  const a: Antworten = {};
  for (const k of KRITERIEN) if (/^[1-6]\./.test(k.id)) a[k.id] = k.optionen.length - 1;
  gleich("bei voller Punktzahl gibt es keinen Hebel", hebel(a, "2026").length, 0);
}

console.log("\n3) Die Liste ist sortiert und begrenzt");
{
  const a = Object.fromEntries(IDS.map((id, i) => [id, i % 4 === 0 ? 1 : 0]));
  const h = hebel(a, "2026", 3);
  stimmt("hoechstens so viele wie verlangt", h.length <= 3);
  let absteigend = true;
  for (let i = 1; i < h.length; i++) if (h[i].gewinn > h[i - 1].gewinn) absteigend = false;
  stimmt("der groesste Hebel steht vorn", absteigend);
}

console.log("\n4) Das interne Tor zur Inkontinenz ist kein Kriterium");
{
  const a = alle(0);
  a["4.inko"] = 0;
  const h = hebel(a, "2026", 50);
  stimmt("4.inko taucht nicht als Hebel auf", !h.some((x) => x.id === "4.inko"));
}

console.log("\n5) Beide Rechtsstaende liefern eigene Hebel");
{
  const a = Object.fromEntries(IDS.map((id, i) => [id, i % 3 === 0 ? 1 : 0]));
  for (const stand of ["2026", "2027"] as const) {
    const basis = berechne(a, stand).gesamtpunkte;
    const h = hebel(a, stand, 10);
    const stimmig = h.every((x) => {
      const echt = berechne({ ...a, [x.id]: a[x.id] + 1 }, stand).gesamtpunkte - basis;
      return Math.abs(echt - x.gewinn) <= 0.001;
    });
    stimmt(`Rechtsstand ${stand}: jeder Gewinn ist in diesem Stand nachrechenbar`, h.length > 0 && stimmig);
  }
}

console.log("\n5b) Tatsachen stehen hinter Einschaetzungen");
{
  // Ein Fall, in dem die Sondenernaehrung (4.13) ein grosser Hebel ist und
  // trotzdem nicht als erster Pruef-Tipp erscheinen darf.
  const a = Object.fromEntries(IDS.map((id, i) => [id, i % 3 === 0 ? 1 : 0]));
  const h = hebel(a, "2026", 10);
  const ersteTatsache = h.findIndex((x) => x.art === "tatsache");
  const letzteEinschaetzung = h.map((x) => x.art).lastIndexOf("einschaetzung");
  stimmt(
    "keine Tatsache steht vor einer Einschaetzung",
    ersteTatsache === -1 || letzteEinschaetzung === -1 || ersteTatsache > letzteEinschaetzung,
    `erste Tatsache bei ${ersteTatsache}, letzte Einschaetzung bei ${letzteEinschaetzung}`,
  );
  stimmt("4.13 ist als Tatsache erkannt", h.every((x) => (x.id === "4.13") === (x.art === "tatsache")));
}

console.log("\n6) Die Schritte stehen in der richtigen Reihenfolge");
{
  const a = alle(1);
  const e = berechne(a, "2026");
  const s = schritte(e, hebel(a, "2026"), 59);
  gleich("der Antrag steht an erster Stelle", s[0].titel.includes("Antrag stellen"), true);
  gleich("der Bescheid steht am Schluss", s[s.length - 1].titel.includes("Bescheid"), true);
  stimmt("die Nummern laufen luckenlos", s.every((x, i) => x.nummer === i + 1));
  stimmt("der Stichtag wird genannt", s[0].text.includes("59 Tage"));
}

console.log("\n7) Ohne Hebel faellt der Hebel-Schritt weg");
{
  const a: Antworten = {};
  for (const k of KRITERIEN) if (/^[1-6]\./.test(k.id)) a[k.id] = k.optionen.length - 1;
  const e = berechne(a, "2026");
  const s = schritte(e, hebel(a, "2026"), 59);
  stimmt("kein Schritt zu den Kriterien", !s.some((x) => x.titel.includes("noch einmal")));
  stimmt("die Nummern laufen trotzdem lueckenlos", s.every((x, i) => x.nummer === i + 1));
}

console.log("\n8) Der Abstandssatz");
{
  const a = alle(0);
  gleich("ohne Punkte fehlt etwas bis Pflegegrad 1", abstandSatz(berechne(a, "2026")), "Es fehlen 12,5 Punkte bis Pflegegrad 1.");
  const voll: Antworten = {};
  for (const k of KRITERIEN) if (/^[1-6]\./.test(k.id)) voll[k.id] = k.optionen.length - 1;
  gleich("bei Pflegegrad 5 gibt es keine naechste Stufe", abstandSatz(berechne(voll, "2026")), null);
}

console.log(
  fehler === 0
    ? `\nALLES GRUEN: ${geprueft} von ${geprueft} Pruefungen bestanden.\n`
    : `\nNICHT GRUEN: ${fehler} von ${geprueft} Pruefungen fehlgeschlagen.\n`,
);
process.exit(fehler === 0 ? 0 : 1);
