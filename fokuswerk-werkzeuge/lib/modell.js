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

// Die Budgetzeile. Vorher stand hier eine Konstante — jeder Betrieb bekam denselben
// Satz, obwohl der Trichter unter drei Fragen verspricht, dass genau diese Zeile sich
// nach den Antworten richtet. Der Erfahrungswert 400–700 Euro gilt je Stelle; alles
// andere ist eine offen benannte Rechenregel, keine gemessene Zahl.
const SPANNE = { eine: "400 bis 700", zwei_drei: "700 bis 1.200", mehr: "1.000 bis 1.800" };

const MEHRSTELLIG = {
  eine: "",
  zwei_drei:
    " Zwei bis drei Stellen kosten nicht das Doppelte: Sie laufen in derselben Anzeige " +
    "und teilen sich die Reichweite.",
  mehr:
    " Ab vier Stellen trennen wir nach Beruf oder Standort, sonst bewirbt sich alles auf " +
    "dieselbe Anzeige.",
};

const TEMPO = {
  sofort:
    "Weil es schnell gehen soll, würden wir dasselbe Geld auf vier bis sechs Wochen " +
    "zusammenziehen statt es über ein Quartal zu strecken.",
  wochen: "Über zwei bis drei Monate verteilt läuft das am ruhigsten.",
  planung:
    "Weil Sie vorplanen, kann die Anzeige mit kleinem Tagesbudget dauerhaft mitlaufen — " +
    "das ist der günstigste Weg zu Bewerbungen.",
};

const STAND = {
  laeuft:
    "Sie werben bereits — dann kommt kein neues Konto dazu, die Kampagne wird in Ihrem " +
    "bestehenden aufgebaut.",
  probiert:
    "Dass der erste Versuch wenig gebracht hat, liegt selten am Budget. Meistens fehlte " +
    "die Bewerberstrecke dahinter: Wer auf ein Kontaktformular stößt, bewirbt sich nicht.",
  nie:
    "Die ersten ein bis zwei Wochen lernt die Auslieferung, wer reagiert. Vorher lohnt " +
    "es nicht, die Zahlen zu bewerten.",
};

export function budgetzeile({ stellen, dringlichkeit, erfahrung } = {}) {
  const spanne = SPANNE[stellen] || SPANNE.eine;
  const teile = [
    `Erfahrungswert aus vergleichbaren Kampagnen: ${spanne} Euro Werbebudget im Monat, ` +
      "dazu die Betreuung." + (MEHRSTELLIG[stellen] || ""),
    TEMPO[dringlichkeit],
    STAND[erfahrung],
    "Was in Ihrem Fall sinnvoll ist, hängt von Beruf und Umkreis ab — das rechnen wir im " +
      "Erstgespräch mit Ihren Zahlen durch.",
  ];
  // Mit Leerzeichen verbunden wurde daraus auf dem Handy eine graue Textwand aus sieben
  // Sätzen. Die Ergebnisseite setzt den Wert über <Absaetze>, das an Zeilenumbrüchen
  // trennt — also je Gedanke ein Absatz: Zahl, Tempo, Stand, Vorbehalt.
  return teile.filter(Boolean).join("\n\n");
}

// Bleibt als Rückfall für Aufrufer ohne Antworten.
export const BUDGETZEILE = budgetzeile();

// Die Klartexte zu den Antwortcodes des Trichters. Der Trichter schickt Codes
// ("bezahlung"), das Modell braucht Worte.
const STAERKE_WORT = {
  bezahlung: "Bezahlung über dem Üblichen",
  feierabend: "Geregelter Feierabend, keine Dauer-Überstunden",
  team: "Kleines, eingespieltes Team",
  technik: "Moderne Ausrüstung, Werkzeug und Maschinen auf Stand",
  aufstieg: "Weiterbildung und Aufstieg: Meister, Lehrgänge, mehr Verantwortung",
  sicherheit: "Sicherer Arbeitsplatz, volle Auftragsbücher, unbefristet",
};

const DRINGLICHKEIT_WORT = {
  sofort: "So schnell wie möglich — die Arbeit liegt schon da.",
  wochen: "In den nächsten Wochen. Es drückt, aber es brennt nicht.",
  planung: "Der Betrieb plant vor, für die kommende Saison.",
};

const STELLEN_WORT = {
  eine: "Eine Stelle.",
  zwei_drei: "Zwei bis drei Stellen.",
  mehr: "Mehr als drei Stellen — der Betrieb baut auf.",
};

const AUFTRAG = `Du schreibst Stellenausschreibungen für inhabergeführte Betriebe in Norddeutschland. Auftraggeber ist die Werbeagentur Fokuswerk.

Du bekommst den Text von der Website des Betriebs, den gesuchten Beruf und die Antworten, die der Inhaber gerade gegeben hat. Daraus schreibst du **drei Fassungen für drei Kanäle**. Es ist dieselbe Stelle — aber auf Kleinanzeigen liest man anders als auf Instagram, und auf der eigenen Seite anders als in einer Anzeige.

UNBEDINGT, für alle drei:
- Nur Tatsachen, die im gelieferten Text oder in den Antworten des Inhabers stehen. Nichts erfinden: keine Gehälter, keine Mitarbeiterzahlen, keine Gründungsjahre, keine Zertifikate, keine Leistungen, keine Arbeitszeiten. Steht es nicht da, kommt es nicht vor.
- Keine Zusagen im Namen des Betriebs, die er nicht selbst macht.
- Bewerber werden mit Du angesprochen. Das ist in diesen Berufen üblich.
- Keine Ausrufezeichen.
- Kein Englisch, wo es ein deutsches Wort gibt. Also kein Team-Spirit, kein Benefit, kein Job.
- Keine Floskeln: nicht "Werde Teil unseres Teams", nicht "Wir suchen Verstärkung", nicht "Du bist motiviert und zuverlässig".
- Der Ort des Betriebs kommt vor, sobald er im Text steht.
- Steht bei der Dringlichkeit "so schnell wie möglich", darf das vorkommen ("ab sofort") — ohne Druck aufzubauen. Plant der Betrieb vor, klingt es ruhiger. Sind mehrere Stellen offen, schreibst du im Plural.

────────────────────────────────────────────────────────────
KANAL 1 — KLEINANZEIGEN (kleinanzeigen.de)

Dort sucht man wie früher in der Zeitung: sachlich, vollständig, ohne Werbeton. Wer dort liest, will wissen, was zu tun ist, was es bringt und wie man sich meldet.

- titel: **höchstens 65 Zeichen** (harte Grenze der Plattform). Beruf und Ort müssen darin vorkommen — danach wird gesucht. Kein Punkt am Ende.
- text: 120 bis 220 Wörter, Fließtext, Absätze mit \n getrennt. Keine Aufzählungszeichen, keine Sternchen, keine Formatierung — die Plattform kann das nicht.
- In den Text gehört **als eigener Absatz** diese Lücke, wortwörtlich:
  [Bitte eintragen: Verdienst, z. B. "ab 3.400 Euro brutto" oder "übertariflich nach Absprache"]
  Auf Kleinanzeigen wird nach Geld gefiltert. Eine Anzeige ohne Zahl wird überblättert.

────────────────────────────────────────────────────────────
KANAL 2 — FACEBOOK UND INSTAGRAM (bezahlte Anzeige)

Hier scrollt jemand, der gar nicht sucht. Der erste Satz muss ihn anhalten.

Drei Varianten, genau in dieser Reihenfolge:
  A. Was die Stelle bietet — gebaut aus den Stärken, die der Inhaber angekreuzt hat, in seinen Worten. Hat er keine angekreuzt, nimm stattdessen: Bewerbung ohne Mappe, ohne Anschreiben, ohne Lebenslauf.
  B. Die Arbeit — was man dort konkret tut, an welchen Aufträgen, mit welcher Ausstattung.
  C. Der Betrieb — wer das ist, wie lange es ihn gibt, was ihn ausmacht.

Je Variante:
- primaertext: 35 bis 60 Wörter, Absätze mit \n. **Die ersten 125 Zeichen entscheiden** — danach schneidet Facebook ab und setzt "… mehr". Der erste Satz muss allein stehen können. Verschwende ihn nicht auf Firmengeschichte, auf "Wir suchen" oder auf eine Begrüßung.
- ueberschrift: höchstens 40 Zeichen, kein Punkt am Ende.
- beschreibung: höchstens 30 Zeichen.
- Die letzte Zeile des primaertext ist der Hinweis zur Bewerbung: vier Fragen, zwei Minuten, keine Mappe. Dreimal anders formuliert. Nie der erste Satz.
- Keine Verdienst-Lücke hier. Dafür sind die Texte zu kurz.

────────────────────────────────────────────────────────────
KANAL 3 — DIE EIGENE KARRIERESEITE

Das Dokument, das stehen bleibt. Vollständig und sachlich, kein Anzeigenton. Wer hier liest, hat schon Interesse und will Einzelheiten.

- ueberschrift: der Stellentitel, höchstens 70 Zeichen.
- einleitung: zwei bis drei Sätze. Wer der Betrieb ist und worum es bei der Stelle geht.
- aufgaben: 4 bis 6 Einträge, je ein kurzer Satz oder eine Wortgruppe. Was man dort wirklich tut.
- anforderungen: 3 bis 5 Einträge. Nur, was im Text des Betriebs steht oder sich zwingend aus dem Beruf ergibt. Lieber zu wenig als eine erfundene Hürde.
- wirBieten: 3 bis 5 Einträge, zuerst die angekreuzten Stärken. **Der erste Eintrag ist wortwörtlich diese Lücke:**
  [Bitte eintragen: Verdienst, z. B. "ab 3.400 Euro brutto" oder "übertariflich nach Absprache"]
- bewerbung: zwei Sätze. Wie man sich meldet, und dass vier Fragen in zwei Minuten reichen.

────────────────────────────────────────────────────────────
KANAL 4 — DIE JOBBÖRSE DER BUNDESAGENTUR FÜR ARBEIT

Kostenlos, die größte Stellenbörse Deutschlands, und von dort laufen die Anzeigen
automatisch weiter nach EURES. Gelesen wird sie von zwei Seiten: von Bewerbern — und von
Arbeitsvermittlern, die passende Leute heraussuchen und anrufen. Das ist der Unterschied zu
allen anderen Kanälen: Hier arbeitet ein Mensch für den Betrieb, wenn er versteht, was
gesucht wird. Eine Vermittlerin, die aus dem Text nicht erkennt, welche Qualifikation
gebraucht wird, schickt niemanden.

- berufsbezeichnung: die Stelle in sachlicher Form, höchstens 60 Zeichen. Nur der Beruf,
  kein Werbezusatz, kein Ort, kein "ab sofort". Also "Kfz-Mechatroniker (m/w/d)" — nicht
  "Schrauber mit Herz gesucht".
- stellenbeschreibung: 150 bis 250 Wörter, Fließtext, Absätze mit \n getrennt. Keine
  Aufzählungszeichen, keine Sternchen. In dieser Reihenfolge: wer der Betrieb ist, was zu
  tun ist, was gebraucht wird, was geboten wird, wie man sich meldet.
- In die Beschreibung gehört **als eigener Absatz** wortwörtlich dieselbe Lücke wie bei
  Kleinanzeigen:
  [Bitte eintragen: Verdienst, z. B. "ab 3.400 Euro brutto" oder "übertariflich nach Absprache"]
  Das Portal hat ein eigenes Feld für die Vergütung, und ohne Angabe sortieren Suchende die
  Anzeige aus.
- Kein Werbeton, keine Ausrufezeichen, keine Superlative. Die Behörde sieht die Anzeigen an.

────────────────────────────────────────────────────────────
DAS VIDEO-DREHBUCH

Eine Anzeige ohne Bewegtbild wird überscrollt. Der Inhaber dreht es selbst, mit dem Handy, in etwa zwanzig Minuten. Dein Drehbuch muss so konkret sein, dass er es abarbeiten kann, ohne nachzudenken — und es darf nur Motive nennen, die es bei ihm laut Website wirklich gibt.

ANREDE IM DREHBUCH: Die Anweisungen richten sich an den Inhaber, nicht an Bewerber — sie siezen ihn ("Sie stehen auf der Baustelle", "eine Fläche, die Sie selbst gebaut haben"). Nur die ansage, die er in die Kamera spricht, duzt wie der Rest.

- hinweis: ein Satz zur Aufnahme. Hochkant, Ton an oder aus, Tageslicht.
- einstellungen: genau vier. Je Eintrag:
  - was: was zu sehen ist, als Anweisung. Nicht "Impressionen der Arbeit", sondern "Der Bagger fährt an, Kamera steht fest".
  - dauer: "3 Sekunden", "5 Sekunden".
  - hinweis: worauf dabei zu achten ist.
  Reihenfolge: zuerst das, was im Scrollen anhält, zuletzt die Aufforderung.
- ansage: der eine Satz, den der Inhaber selbst in die Kamera sagt. In seiner Sprache, höchstens zwanzig Wörter, kein Werbesatz.

────────────────────────────────────────────────────────────
DIE ERSTEN ANTWORTEN

Im Handwerk gehen die Guten verloren, weil zwei Tage niemand zurückruft. Schreibe drei kurze Nachrichten zum Abschicken per WhatsApp oder SMS, je zwei bis vier Sätze, geduzt, ohne Floskeln:
  1. anlass "Er passt — Termin ausmachen"
  2. anlass "Er meldet sich, aber es fehlen Angaben"
  3. anlass "Absage" — freundlich, ohne Vertröstung, ohne "wir melden uns bei Gelegenheit"
Keine Namensplatzhalter erfinden: Schreibe so, dass die Nachricht ohne Einsetzen funktioniert.

────────────────────────────────────────────────────────────
DIE VIER FRAGEN sind die Bewerberstrecke. Erste Frage nach der jetzigen Tätigkeit, zweite nach der Erfahrung, dritte nach dem möglichen Start, vierte nach der Entfernung zum Betrieb. Jede Frage eine Zeile, mit den Antwortmöglichkeiten dahinter, durch Mittelpunkte getrennt.

DIE BERUFSGRUPPE: Unten bekommst du eine nummerierte Liste amtlicher Berufsgruppen. Gib in "berufsgruppe" die dreistellige Nummer der Gruppe an, in die der gesuchte Beruf fällt. Nimm die fachlich richtige, nicht die namensähnlichste: Ein Anlagenmechaniker SHK gehört zu Klempnerei/Sanitär/Heizung, nicht zum Maschinenbau. Passt keine Gruppe eindeutig, gib null — eine falsche Zuordnung wäre schlimmer als gar keine.

DER ORT: Gib zusätzlich "ort" an — die Stadt oder Gemeinde, in der der Betrieb sitzt, so wie man sie in eine Umkreissuche eintippt. Nur den Ortsnamen, ohne Postleitzahl und ohne Straße. Steht er nirgends, gib null.

Antworte ausschließlich mit JSON, ohne Vor- und Nachwort:
{"betrieb":"…","ort":"…","berufsgruppe":"…",
 "kleinanzeigen":{"titel":"…","text":"…"},
 "meta":[{"winkel":"…","primaertext":"…","ueberschrift":"…","beschreibung":"…"},{…},{…}],
 "karriereseite":{"ueberschrift":"…","einleitung":"…","aufgaben":["…"],"anforderungen":["…"],"wirBieten":["…"],"bewerbung":"…"},
 "jobboerse":{"berufsbezeichnung":"…","stellenbeschreibung":"…"},
 "drehbuch":{"hinweis":"…","einstellungen":[{"was":"…","dauer":"…","hinweis":"…"}],"ansage":"…"},
 "antworten":[{"anlass":"…","text":"…"},{"anlass":"…","text":"…"},{"anlass":"…","text":"…"}],
 "fragen":["…","…","…","…"]}

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

// `system` und `nachricht` überschreiben Auftrag und Nutzertext. Ohne sie verhält sich die
// Funktion wie bisher — der Stellenanzeiger merkt von der Erweiterung nichts.
export async function frageModell(
  { beruf, betrieb, text, dringlichkeit = null, stellen = null, staerken = [], berufsgruppen = [] },
  { zeitgrenze = 240000, system = AUFTRAG, nachricht = null } = {},
) {
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
        max_tokens: 20000,
        system,
        messages: [
          {
            role: "user",
            content:
              nachricht ||
              (beruf ? `Gesuchter Beruf: ${beruf}\n` : "") +
                (betrieb ? `Name laut Seitentitel: ${betrieb}\n` : "") +
                // Die Antworten aus dem Trichter. Ohne sie schrieb das Modell für jeden
                // Betrieb dasselbe, obwohl der Inhaber gerade angekreuzt hatte, was seine
                // Stelle ausmacht — und die Seite ihm zusagt, genau das stehe nachher drin.
                (dringlichkeit && DRINGLICHKEIT_WORT[dringlichkeit]
                  ? `Dringlichkeit: ${DRINGLICHKEIT_WORT[dringlichkeit]}\n`
                  : "") +
                (stellen && STELLEN_WORT[stellen] ? `Offene Stellen: ${STELLEN_WORT[stellen]}\n` : "") +
                (berufsgruppen && berufsgruppen.length
                  ? "\nAmtliche Berufsgruppen zur Auswahl (Nummer + Name):\n" + berufsgruppen.join("\n") + "\n"
                  : "") +
                ((staerken || []).map((k) => STAERKE_WORT[k]).filter(Boolean).length
                  ? "Das spricht laut Inhaber für die Stelle (seine eigene Auswahl):\n" +
                    (staerken || [])
                      .map((k) => STAERKE_WORT[k])
                      .filter(Boolean)
                      .map((w) => `- ${w}`)
                      .join("\n") +
                    "\n"
                  : "") +
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

