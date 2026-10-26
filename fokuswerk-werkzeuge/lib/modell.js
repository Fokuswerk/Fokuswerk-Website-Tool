// Der Modellaufruf. Hier entscheidet sich, ob das Werkzeug trägt: Wer Werbung verkauft und
// dreimal „Werde Teil unseres Teams" ausliefert, hat den Beweis gegen sich selbst geschickt.
//
// Zwei Vorkehrungen dagegen:
//   1. Das Modell bekommt nur den echten Text des Betriebs und darf nichts hinzuerfinden —
//      keine Gehälter, keine Mitarbeiterzahlen, keine Zusagen, die der Betrieb nicht macht.
//   2. Die Budgetzeile kommt nicht aus dem Modell, sondern aus dem Code. Eine Zahl, die im
//      Verkauf vorgelesen wird, darf nicht je Aufruf anders lauten.

// Beim Import gelesen wäre falsch: Die Probeläufe laden .env erst nach den Importen,
// weil ESM alle Importe vorzieht. Also bei jedem Aufruf nachsehen.
export const modell = () => process.env.MODELL || "claude-sonnet-5-5";

// Preise je Million Token (Stand 26.10.2026). Nur für die Kostenanzeige im Probelauf.
const PREISE = {
  "claude-opus-5-5": { ein: 4, aus: 20 },
  "claude-opus-5": { ein: 5, aus: 25 },
  "claude-sonnet-5-5": { ein: 2, aus: 10 },
  "claude-haiku-5-5": { ein: 0.1, aus: 0.5 },
};

export function kosten(verbrauch, name = modell()) {
  const preis = PREISE[name];
  if (!preis || !verbrauch) return null;
  return (
    ((verbrauch.input_tokens || 0) * preis.ein +
      (verbrauch.output_tokens || 0) * preis.aus) /
    1_000_000
  );
}
const SCHNITTSTELLE = "https://api.anthropic.com/v1/messages";

export const BUDGETZEILE =
  "Erfahrungswert aus vergleichbaren Kampagnen: 400 bis 700 Euro Werbebudget im Monat, " +
  "dazu die Betreuung. Was in Ihrem Fall sinnvoll ist, hängt von Beruf und Umkreis ab — " +
  "das rechnen wir im Erstgespräch mit Ihren Zahlen durch.";

const AUFTRAG = `Du schreibst Stellenanzeigen für Facebook und Instagram, für inhabergeführte Betriebe in Norddeutschland. Auftraggeber ist die Werbeagentur Fokuswerk.

Du bekommst den Text, der auf der Website des Betriebs steht, und den gesuchten Beruf. Daraus schreibst du drei Anzeigen.

UNBEDINGT:
- Nur Tatsachen, die im gelieferten Text stehen. Nichts erfinden: keine Gehälter, keine Mitarbeiterzahlen, keine Gründungsjahre, keine Zertifikate, keine Leistungen, keine Arbeitszeiten. Steht es nicht da, kommt es nicht vor.
- Keine Zusagen im Namen des Betriebs, die er nicht selbst macht.
- Die drei Anzeigen sprechen Bewerber mit Du an. Das ist in diesen Berufen üblich.
- Keine Ausrufezeichen.
- Kein Englisch, wo es ein deutsches Wort gibt. Also kein Team-Spirit, kein Benefit, kein Job.
- Keine Floskeln: nicht "Werde Teil unseres Teams", nicht "Wir suchen Verstärkung", nicht "Du bist motiviert und zuverlässig".
- Jede Anzeige nennt den Ort des Betriebs, sobald er im Text steht.

DIE DREI WINKEL, genau in dieser Reihenfolge:
1. Die Hürde. Bewerbung ohne Mappe, ohne Anschreiben, ohne Lebenslauf — vier Fragen, zwei Minuten. Das ist der Grund, warum sich jemand meldet, der sich sonst nicht bewirbt.
2. Der Betrieb. Wer das ist, wie lange es ihn gibt, wie groß er ist, was ihn ausmacht — alles nur, soweit es im Text steht.
3. Die Arbeit. Was man dort konkret tut, an welchen Aufträgen, mit welcher Ausstattung.

FORM:
- titel: höchstens 60 Zeichen, keine Punkte am Ende.
- text: 35 bis 60 Wörter, kurze Sätze, Absätze mit \\n getrennt.

DIE VIER FRAGEN sind die Bewerberstrecke. Erste Frage nach der jetzigen Tätigkeit, zweite nach der Erfahrung, dritte nach dem möglichen Start, vierte nach der Entfernung zum Betrieb. Jede Frage eine Zeile, mit den Antwortmöglichkeiten dahinter, durch Mittelpunkte getrennt.

Antworte ausschließlich mit JSON, ohne Vor- und Nachwort:
{"betrieb":"…","anzeigen":[{"titel":"…","text":"…"},{"titel":"…","text":"…"},{"titel":"…","text":"…"}],"fragen":["…","…","…","…"]}

Passt der gesuchte Beruf erkennbar nicht zu dem Betrieb, antworte stattdessen mit:
{"fehler":"beruf_unklar"}`;

function jsonAus(text) {
  const roh = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(roh);
  } catch {}
  const von = roh.indexOf("{");
  const bis = roh.lastIndexOf("}");
  if (von < 0 || bis <= von) return null;
  try {
    return JSON.parse(roh.slice(von, bis + 1));
  } catch {
    return null;
  }
}

export async function frageModell({ beruf, betrieb, text }, { zeitgrenze = 60000 } = {}) {
  const schluessel = process.env.ANTHROPIC_API_KEY;
  if (!schluessel) throw new Error("ANTHROPIC_API_KEY fehlt");

  const abbruch = new AbortController();
  const uhr = setTimeout(() => abbruch.abort(), zeitgrenze);
  try {
    const antwort = await fetch(SCHNITTSTELLE, {
      method: "POST",
      signal: abbruch.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": schluessel,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: modell(),
        // Reichlich bemessen, weil das Modell vor der Antwort nachdenkt: Bei 2000 gingen
        // 1292 Zeichen für das Nachdenken drauf und das JSON brach mitten im dritten
        // Anzeigentext ab (stop_reason "max_tokens"). Abgerechnet wird, was gebraucht wird.
        max_tokens: 8000,
        system: AUFTRAG,
        messages: [
          {
            role: "user",
            content:
              `Gesuchter Beruf: ${beruf}\n` +
              (betrieb ? `Name laut Seitentitel: ${betrieb}\n` : "") +
              `\nText von der Website:\n\n${text}`,
          },
        ],
      }),
    });

    if (!antwort.ok) {
      throw new Error(`Modell antwortet ${antwort.status}: ${(await antwort.text()).slice(0, 300)}`);
    }

    const daten = await antwort.json();
    if (daten.stop_reason === "max_tokens") {
      throw new Error("Modellantwort abgeschnitten (max_tokens) — Grenze anheben");
    }
    // Kein Vorbelegen der Antwort: Opus nimmt keine vorbelegte Assistentennachricht an
    // ("does not support assistant message prefill"). jsonAus holt das Objekt auch aus
    // einer Antwort mit Vor- oder Nachwort heraus.
    return {
      antwort: jsonAus((daten.content || []).map((t) => t.text || "").join("")),
      verbrauch: daten.usage,
    };
  } finally {
    clearTimeout(uhr);
  }
}

