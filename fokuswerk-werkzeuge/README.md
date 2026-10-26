# Fokuswerk Werkzeuge

Endpunkte hinter den kostenlosen Werkzeugen auf fokuswerk.de. Zurzeit eines:
der **Stellenanzeigen-Generator**.

Gedacht für `werkzeuge.fokuswerk.de` als eigenes Vercel-Projekt — getrennt von der
Framer-Seite, weil Seitenabruf und Modellaufruf nicht im Browser stattfinden können:
Fremde Seiten lassen sich von dort nicht lesen (CORS), und der Schlüssel stünde offen
im Quelltext.

## Der Vertrag

```
POST /api/stellenanzeige
{ "domain": "knolle-harpstedt.de", "beruf": "Landschaftsgärtner" }

200 →
{
  "betrieb":  "Gärtnerei Knolle",
  "anzeigen": [ { "titel": "…", "text": "…" }, … genau drei ],
  "fragen":   [ "…", "…", "…", "…" ],
  "budget":   "…"
}

422 → { "fehler": "domain_fehlt" | "beruf_fehlt" | "seite_nicht_lesbar" | "beruf_unklar" }
429 → { "fehler": "zu_viele_abrufe" }
502 → { "fehler": "modell_nicht_erreichbar" | "modell_unlesbar"
                | "modell_unvollstaendig" | "modell_floskeln" }
```

Die Framer-Komponente baut gegen genau diese Form.

## Aufbau

| Datei | Aufgabe |
|---|---|
| `api/stellenanzeige.js` | Endpunkt: CORS, Bremse, Zwischenspeicher, Reihenfolge |
| `lib/seite-lesen.js` | Website abrufen und Text gewinnen |
| `lib/modell.js` | Auftrag ans Modell, Budgetzeile |
| `lib/vertrag.js` | Eingabe- und Formkontrolle |
| `test/lokal.mjs` | Probelauf gegen einen echten Betrieb |
| `test/pruefung.mjs` | Alles, was ohne Modellaufruf prüfbar ist |

### Wie die Seite gelesen wird

Nach denselben Regeln wie der Rechercheagent, weil dieselben Fallen zuschlagen:

- **Alle vier Varianten** (apex/www × https/http). Wer nur `https://domain` probiert, hält
  jede zweite Handwerkerseite für tot.
- **Unterseiten aus der Sitemap oder den internen Links**, nie geraten, und jede gegen die
  Startseite per Prüfsumme geprüft — viele Seiten antworten auf unbekannte Pfade mit
  HTTP 200 und der Startseite.
- **Karriere- und Über-uns-Seiten stehen im Text vor der Startseite.** Wird es zu lang,
  fehlt hinten der Begrüßungstext und nicht die Stellenbeschreibung.
- **Navigation und Fußzeile fliegen raus**: Was auf mindestens drei Seiten wortgleich
  vorkommt und kurz ist, ist Beiwerk.
- **`robots.txt` gilt.**
- **Interne Adressen sind gesperrt** (IP-Literale, `.local`, `.internal`). Das Feld ist
  offen im Netz; ohne diese Sperre zeigt jemand den Server auf das eigene Netz.

### Was das Modell darf und was nicht

Es bekommt nur den echten Text des Betriebs und schreibt daraus drei Anzeigen in drei
Winkeln — Hürde, Betrieb, Arbeit. Verboten sind erfundene Gehälter, Mitarbeiterzahlen,
Gründungsjahre und Zusagen, die der Betrieb nicht selbst macht.

**Die Budgetzeile kommt nicht aus dem Modell**, sondern als fester Text aus
`lib/modell.js`. Eine Zahl, die später im Verkauf vorgelesen wird, darf nicht je Aufruf
anders lauten.

Die Formkontrolle verwirft Antworten mit Floskeln („Werde Teil unseres Teams") und
entfernt Ausrufezeichen.

## Einrichten

```bash
cp .env.example .env
# ANTHROPIC_API_KEY eintragen
```

| Variable | Pflicht | Vorgabe |
|---|---|---|
| `ANTHROPIC_API_KEY` | ja | — |
| `MODELL` | nein | `claude-sonnet-5-5` |
| `ORIGINS` | nein | fokuswerk.de, www, Framer-Vorschau |
| `LEAD_WEBHOOK` | nein | leer — dann wird nichts gemeldet |

**Zum Modell:** Vorgabe ist `claude-sonnet-5-5`. Am 26.10.2026 gegen `claude-opus-5-5`
an zwei Betrieben verglichen: Opus formuliert eine Spur knapper, Sonnets Texte sind
sauber und vollständig belegt. Kosten je Generierung 5 bis 6 Cent gegen 10. Für diese
Aufgabe — Werbetext aus einem gelieferten Seitentext — reicht Sonnet.

Wenn die Texte im Alltag flacher wirken als in den Probeläufen: `MODELL=claude-opus-5-5`
in `.env` oder in den Vercel-Projekteinstellungen.

## Probelauf

```bash
node test/pruefung.mjs                                    # kostet nichts
node test/lokal.mjs knolle-harpstedt.de "Landschaftsgärtner"
```

Ohne `ANTHROPIC_API_KEY` läuft nur der Seitenabruf — das zeigt schon, ob die richtigen
Unterseiten gefunden werden.

## Bereitstellen

**Läuft seit 26.10.2026:** https://fokuswerk-werkzeuge.vercel.app/api/stellenanzeige
Vercel-Projekt `fokuswerk-werkzeuge` (Konto bodenstab-1670).

Gesetzt sind dort `ANTHROPIC_API_KEY`, `MODELL` und `ORIGINS`.

**Live geprüft am 26.10.2026:**

| Prüfung | Ergebnis |
|---|---|
| Erster Aufruf, `knolle-harpstedt.de` | 200, drei Anzeigen, 31 s |
| Derselbe Aufruf noch einmal | 200 aus dem Zwischenspeicher, 0,3 s |
| Unerreichbare Domain | 422 `seite_nicht_lesbar` |
| Freigabekopf für fokuswerk.de und die Framer-Vorschau | gesetzt |
| Freigabekopf für eine fremde Herkunft | nicht gesetzt |

Nach jeder Änderung an Code oder Umgebungsvariablen: `npx vercel --prod`.

Neu bereitstellen nach Änderungen: `npx vercel --prod`.
Eigene Adresse `werkzeuge.fokuswerk.de` später unter *Domains* eintragen; bis dahin gilt
die `vercel.app`-Adresse.

`.vercelignore` hält `.env`, den Ordner `test` und die Textdateien aus dem Paket heraus.

## Was offen ist

- **Erprobt am 26.10.2026** gegen `knolle-harpstedt.de` (Landschaftsgärtner) und
  `brouwer-gmbh.de` (Anlagenmechaniker SHK). Beide Durchläufe rund 11 Sekunden, alle
  Tatsachenbehauptungen in den Anzeigen im Seitentext nachweisbar. Dabei zwei Fehler
  gefunden und behoben: Opus nimmt keine vorbelegte Assistentennachricht an, und
  `max_tokens: 2000` reichte nicht, weil das Nachdenken allein 1.292 Zeichen verbrauchte
  und das JSON mittendrin abbrach.
- **Die Anzeigen sagen „Danach meldet sich der Betrieb bei dir".** Das steht so auf keiner
  Kundenseite — es ist die Zusage des Verfahrens, nicht des Betriebs. Wer das nicht
  mitversprechen will, streicht den Satz im Auftrag in `lib/modell.js`.
- **Die Bremse ist eine Bremse, keine Sperre.** Sie zählt je Instanz, und Vercel startet
  mehrere. Sobald das Werkzeug beworben wird, gehört der Zähler in einen gemeinsamen
  Speicher.
- **Datenschutz.** Der Endpunkt ruft eine fremde Website ab und schickt deren Text an
  Anthropic. Das muss in die Datenschutzerklärung, bevor die Seite live geht.
- **Der Lead-Weg.** `LEAD_WEBHOOK` meldet Domain, Beruf und Betrieb. Wohin, ist noch nicht
  entschieden — naheliegend ist das Outreach-Werkzeug.
