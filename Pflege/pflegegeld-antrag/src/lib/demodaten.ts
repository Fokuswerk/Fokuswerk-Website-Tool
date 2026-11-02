import type { Auswertung, Lead, Tageswert } from "./typen";

/**
 * Nachgebildete Daten für die Auswertung, solange keine Datenbank hinterlegt ist.
 * Die Zahlen sind plausibel gewählt, aber erfunden — die Oberfläche kennzeichnet das.
 * Erzeugt wird alles aus einem festen Startwert, damit die Ansicht stabil bleibt.
 */

let keim = 20261102;
function zufall(): number {
  keim = (keim * 1103515245 + 12345) % 2147483648;
  return keim / 2147483648;
}

const VORNAMEN = ["Sabine", "Andreas", "Petra", "Michael", "Gabriele", "Thomas", "Ulrike", "Matthias", "Claudia", "Stefan", "Birgit", "Jörg", "Monika", "Frank", "Heike", "Dirk", "Anja", "Rainer"];
const NACHNAMEN = ["Brinkmann", "Hoffmann", "Janßen", "Meyer", "Kramer", "Lüders", "Tholen", "Oltmanns", "Bruns", "Siefken", "Ahlers", "Rohde", "Wendt", "Kuhlmann"];
const ANLAESSE = [
  { anlass: "startseite", gewicht: 34 },
  { anlass: "ergebnis-genau", gewicht: 26 },
  { anlass: "bescheid", gewicht: 14 },
  { anlass: "mappe-vormerken", gewicht: 10 },
  { anlass: "widerspruch-fall", gewicht: 7 },
  { anlass: "reform", gewicht: 5 },
  { anlass: "anfrage:treppenlift", gewicht: 3 },
  { anlass: "anfrage:hausnotruf", gewicht: 1 },
];

function anlassZiehen(): string {
  const summe = ANLAESSE.reduce((s, a) => s + a.gewicht, 0);
  let x = zufall() * summe;
  for (const a of ANLAESSE) {
    x -= a.gewicht;
    if (x <= 0) return a.anlass;
  }
  return ANLAESSE[0].anlass;
}

function tagRueckwaerts(n: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function leadBauen(tagOffset: number): Lead {
  const vor = VORNAMEN[Math.floor(zufall() * VORNAMEN.length)];
  const nach = NACHNAMEN[Math.floor(zufall() * NACHNAMEN.length)];
  const anlass = anlassZiehen();
  const d = tagRueckwaerts(tagOffset);
  d.setHours(8 + Math.floor(zufall() * 13), Math.floor(zufall() * 60), 0, 0);

  const alt = 1 + Math.floor(zufall() * 4);
  const verliert = zufall() < 0.38;
  const befund: Record<string, string | number | null> =
    anlass === "ergebnis-genau" || anlass === "startseite"
      ? {
          pflegegradAlt: alt,
          pflegegradNeu: verliert ? Math.max(0, alt - 1) : alt,
          punkteAlt: Math.round((12 + zufall() * 70) * 4) / 4,
          hebelmodul: 1 + Math.floor(zufall() * 6),
        }
      : anlass === "bescheid"
        ? { summeGutachten: Math.round(zufall() * 60), abweichung: Math.round((zufall() * 22 - 4) * 4) / 4 }
        : {};

  return {
    id: `demo-${tagOffset}-${Math.floor(zufall() * 100000)}`,
    zeit: d.toISOString(),
    anlass,
    mail: `${vor.toLowerCase().replace(/[^a-z]/g, "")}.${nach.toLowerCase().replace(/[^a-z]/g, "")}@beispiel.de`,
    name: `${vor} ${nach}`,
    befund,
    quelle: zufall() < 0.55 ? "/" : zufall() < 0.6 ? "/check" : "/bescheid",
    sitzung: `demo-${Math.floor(zufall() * 1e9).toString(36)}`,
    // Etwa drei von vier bestaetigen den Double-Opt-in - so sieht die Liste echt aus
    bestaetigt: zufall() < 0.74,
  };
}

export function demoAuswertung(tage = 30): Auswertung {
  keim = 20261102;

  const verlauf: Tageswert[] = [];
  const leads: Lead[] = [];
  let besucherGesamt = 0;

  for (let i = tage - 1; i >= 0; i--) {
    const d = tagRueckwaerts(i);
    const wochentag = d.getDay();
    const grund = wochentag === 0 || wochentag === 6 ? 0.62 : 1;
    // Die Nachfrage zieht zum Stichtag hin an
    const naehe = 1 + (tage - i) / tage;
    const besucher = Math.round((58 + zufall() * 46) * grund * naehe);
    besucherGesamt += besucher;

    const tagesLeads = Math.max(0, Math.round(besucher * (0.055 + zufall() * 0.045)));
    for (let k = 0; k < tagesLeads; k++) leads.push(leadBauen(i));
    verlauf.push({ tag: d.toISOString().slice(0, 10), besucher, leads: tagesLeads });
  }

  leads.sort((a, b) => (a.zeit < b.zeit ? 1 : -1));

  const seitenaufrufe = Math.round(besucherGesamt * 2.4);
  const checksGestartet = Math.round(besucherGesamt * 0.47);
  const checksBeendet = Math.round(checksGestartet * 0.63);
  const klicks = Math.round(besucherGesamt * 0.09);

  const anzahlProAnlass = new Map<string, number>();
  for (const l of leads) anzahlProAnlass.set(l.anlass, (anzahlProAnlass.get(l.anlass) ?? 0) + 1);

  // Abbruch je Frage: typischer Schwund über sieben Schritte
  const schwund = [1, 0.93, 0.88, 0.84, 0.79, 0.72, 0.66];
  const trichter = schwund.map((q, i) => ({
    schritt: `Frage ${i + 1}`,
    anzahl: Math.round(checksGestartet * q),
  }));

  return {
    demo: true,
    stand: new Date().toISOString(),
    kennzahlen: {
      besucher: besucherGesamt,
      seitenaufrufe,
      checksGestartet,
      checksBeendet,
      leads: leads.length,
      klicks,
      startquote: besucherGesamt ? checksGestartet / besucherGesamt : 0,
      abschlussquote: checksGestartet ? checksBeendet / checksGestartet : 0,
      leadquote: besucherGesamt ? leads.length / besucherGesamt : 0,
    },
    verlauf,
    anlaesse: [...anzahlProAnlass.entries()]
      .map(([anlass, anzahl]) => ({ anlass, anzahl }))
      .sort((a, b) => b.anzahl - a.anzahl),
    leads: leads.slice(0, 200),
    trichter,
  };
}
