// Prüft alles, was ohne Modellaufruf prüfbar ist: Eingabekontrolle, Formkontrolle der
// Modellantwort und die Wege durch den Endpunkt, die kein Geld kosten.
//   node test/pruefung.mjs

import { ladeUmgebung } from "../lib/umgebung.js";
import { pruefeAntwort, pruefeEingabe } from "../lib/vertrag.js";
import handler from "../api/stellenanzeige.js";

let fehler = 0;
const soll = (name, bedingung) => {
  console.log(`${bedingung ? "ok  " : "FEHL"}  ${name}`);
  if (!bedingung) fehler++;
};

// --- Eingabe
soll("Domain fehlt", pruefeEingabe({ beruf: "Dachdecker" }).fehler === "domain_fehlt");
soll("Beruf zu kurz", pruefeEingabe({ domain: "a.de", beruf: "x" }).fehler === "beruf_fehlt");
soll("Beruf mit Steuerzeichen",
  pruefeEingabe({ domain: "a.de", beruf: "Dach<script>" }).fehler === "beruf_fehlt");
soll("Gültige Eingabe",
  pruefeEingabe({ domain: " Knolle-Harpstedt.de ", beruf: "Landschaftsgärtner" }).domain
    === "Knolle-Harpstedt.de");

// --- Modellantwort
const gut = {
  betrieb: "Gärtnerei Knolle",
  anzeigen: Array.from({ length: 3 }, (_, i) => ({
    titel: `Titel Nummer ${i + 1} für Harpstedt`,
    text: "Ein Text mit genügend Länge, damit die Prüfung ihn durchlässt. ".repeat(3),
  })),
  fragen: ["Was machst du gerade?", "Wie lange schon?", "Wann kannst du anfangen?", "Wie weit?"],
};
soll("Gute Antwort kommt durch", !pruefeAntwort(gut).fehler);
soll("Zwei Anzeigen reichen nicht",
  pruefeAntwort({ ...gut, anzeigen: gut.anzeigen.slice(0, 2) }).fehler === "modell_unvollstaendig");
soll("Drei Fragen reichen nicht",
  pruefeAntwort({ ...gut, fragen: gut.fragen.slice(0, 3) }).fehler === "modell_unvollstaendig");
soll("Beruf unklar wird durchgereicht",
  pruefeAntwort({ fehler: "beruf_unklar" }).fehler === "beruf_unklar");
soll("Unlesbares wird abgefangen", pruefeAntwort(null).fehler === "modell_unlesbar");

const mitFloskel = structuredClone(gut);
mitFloskel.anzeigen[1].text = "Werde Teil unseres Teams und zwar sofort, " + mitFloskel.anzeigen[1].text;
soll("Floskel wird verworfen", pruefeAntwort(mitFloskel).fehler === "modell_floskeln");

const mitRufzeichen = structuredClone(gut);
mitRufzeichen.anzeigen[0].text = "Jetzt bewerben! " + mitRufzeichen.anzeigen[0].text;
soll("Ausrufezeichen verschwindet",
  !pruefeAntwort(mitRufzeichen).anzeigen[0].text.includes("!"));

// --- Endpunkt, die kostenlosen Wege
function antwortAttrappe() {
  const a = { code: 0, inhalt: null, kopf: {} };
  a.setHeader = (k, v) => { a.kopf[k] = v; };
  a.status = (c) => { a.code = c; return a; };
  a.json = (d) => { a.inhalt = d; return a; };
  a.end = () => a;
  return a;
}
const anfrage = (method, body, headers = {}) => ({ method, body, headers, socket: {} });

let a = antwortAttrappe();
await handler(anfrage("OPTIONS", null, { origin: "https://fokuswerk.de" }), a);
soll("OPTIONS gibt 204", a.code === 204);
soll("Erlaubte Herkunft bekommt CORS-Kopf",
  a.kopf["Access-Control-Allow-Origin"] === "https://fokuswerk.de");

a = antwortAttrappe();
await handler(anfrage("OPTIONS", null, { origin: "https://fremde-seite.de" }), a);
soll("Fremde Herkunft bekommt keinen CORS-Kopf", !a.kopf["Access-Control-Allow-Origin"]);

a = antwortAttrappe();
await handler(anfrage("GET", null), a);
soll("GET gibt 405", a.code === 405);

a = antwortAttrappe();
await handler(anfrage("POST", '{"domain":"a.de"}'), a);
soll("Fehlender Beruf gibt 422", a.code === 422 && a.inhalt.fehler === "beruf_fehlt");

a = antwortAttrappe();
await handler(anfrage("POST", "kein json"), a);
soll("Unlesbarer Körper gibt 422", a.code === 422);

a = antwortAttrappe();
await handler(anfrage("POST", { domain: "127.0.0.1", beruf: "Dachdecker" }), a);
soll("Interne Adresse wird abgewiesen",
  a.code === 422 && a.inhalt.fehler === "seite_nicht_lesbar");

for (let i = 0; i < 8; i++) {
  a = antwortAttrappe();
  await handler(anfrage("POST", { domain: "nicht-existent-xyz.de", beruf: "Dachdecker" },
    { "x-forwarded-for": "203.0.113.9" }), a);
}
soll("Bremse greift nach sechs Abrufen", a.code === 429);

console.log(fehler ? `\n${fehler} Prüfung(en) fehlgeschlagen` : "\nAlle Prüfungen bestanden");
process.exit(fehler ? 1 : 0);
