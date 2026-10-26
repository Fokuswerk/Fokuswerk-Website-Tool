# Auftrag: Stellenanzeigen-Generator auf fokuswerk.de

Für den Chat, der am Framer-Projekt „FW neu" arbeitet.
Der Endpunkt dahinter ist fertig und erprobt; gebaut werden muss die Seite davor.

## Worum es geht

Ein Betrieb gibt seine Website und den gesuchten Beruf ein und bekommt sofort drei
fertige Anzeigentexte für Facebook und Instagram, dazu vier Bewerberfragen und eine
Budgetzeile. Das ist das kostenlose Werkzeug, mit dem Fokuswerk in der Kaltakquise
vorlegt: Der Link steht später in Mails und Anzeigen.

Die Texte entstehen aus dem echten Inhalt der Website des Betriebs. Nichts wird erfunden.

## Wo

- **Eigene Seite `/stellenanzeige`**, damit sie verlinkbar ist.
- **Teaserblock auf `/leistungen`** unter dem Recruiting-Abschnitt, der dorthin führt.
- Die Startseite bleibt unberührt.

## Aufbau der Seite

1. Überschrift, ein Satz Erklärung, zwei Eingabefelder (Website, Beruf), ein Knopf.
   Mehr nicht — keine Felder auf Vorrat.
2. **Wartezustand: Die Antwort braucht rund 30 Sekunden.** Das ist kein Fehler, sondern
   die Zeit, in der die Website des Betriebs gelesen und die Texte geschrieben werden.
   Kein Zeitlimit unter 60 Sekunden einbauen. Dem Nutzer in der Zwischenzeit zeigen, was
   gerade passiert („Wir lesen Ihre Seite …", „Wir schreiben die Anzeigen …"), ruhig,
   kein Spinner-Kreisel.
3. Ergebnis: drei Anzeigentexte in drei Karten, je mit Kopieren-Knopf. Darunter die vier
   Bewerberfragen und die Budgetzeile.
4. **Erst unter dem Ergebnis** ein E-Mail-Feld: „Sollen wir Ihnen das zuschicken?"
   Das Ergebnis ist vorher vollständig sichtbar. Nichts wird hinter der Adresse
   eingesperrt — erst geben, dann fragen.
5. Ganz unten der Abzweig ins Angebot, zurückhaltend.

## Der Endpunkt

Läuft seit dem 26.10.2026 unter

```
https://fokuswerk-werkzeuge.vercel.app/api/stellenanzeige
```

CORS ist dort geprüft: `https://fokuswerk.de` und
`https://frank-site-485713.framer.app` bekommen den Freigabekopf, fremde Seiten nicht.
Die Zieladresse gehört als **Eigenschaft der Komponente** ins rechte Bedienfeld, nicht
fest in den Code — später zieht sie auf `werkzeuge.fokuswerk.de` um.

```
POST /api/stellenanzeige
{ "domain": "knolle-harpstedt.de", "beruf": "Landschaftsgärtner" }
```

Antwort 200:

```json
{
  "betrieb": "Knolle Harpstedt",
  "anzeigen": [
    { "titel": "…", "text": "…" },
    { "titel": "…", "text": "…" },
    { "titel": "…", "text": "…" }
  ],
  "fragen": ["…", "…", "…", "…"],
  "budget": "…"
}
```

Immer genau drei Anzeigen und genau vier Fragen. `text` enthält Absätze mit `\n`.

Fehler, alle als JSON mit einem Feld `fehler`:

| Status | `fehler` | Was die Seite sagen soll |
|---|---|---|
| 422 | `domain_fehlt` / `beruf_fehlt` | Eingabe prüfen |
| 422 | `seite_nicht_lesbar` | „Wir konnten diese Seite nicht abrufen. Stimmt die Adresse?" |
| 422 | `beruf_unklar` | „Dieser Beruf passt nicht zu dem Betrieb auf dieser Seite." |
| 429 | `zu_viele_abrufe` | „Bitte in ein paar Minuten noch einmal." |
| 502 | `modell_*` | „Da ist bei uns etwas schiefgegangen. Bitte noch einmal versuchen." |

Alle Fehlerfälle sichtbar bauen, nicht nur den Erfolgsfall.

## Du hast Vercel-Zugang — nutze ihn dafür

Das Vercel-Projekt heißt `fokuswerk-werkzeuge`. **Es ist fertig eingerichtet und
geprüft** — `ANTHROPIC_API_KEY`, `MODELL` und `ORIGINS` sind gesetzt, der Endpunkt
liefert. Du musst dort nichts einrichten, um anzufangen.

Wofür du den Zugang trotzdem brauchst:

- **`ORIGINS` ergänzen, falls deine Framer-Vorschau anders heißt.** In der Liste stehen
  `https://fokuswerk.de`, `https://www.fokuswerk.de` und
  `https://frank-site-485713.framer.app`. Arbeitest du unter einer anderen
  Vorschauadresse, trag sie dazu — sonst antwortet der Endpunkt deinem Browser nicht,
  und zwar wortlos. Das sieht aus wie ein Fehler in deiner Komponente, ist aber der
  Türsteher. Nach jeder Änderung an Umgebungsvariablen einmal `npx vercel --prod`,
  sonst greift sie nicht.
- **Die Laufzeitprotokolle lesen**, wenn ein Aufruf scheitert. Dort steht, ob die
  Website nicht lesbar war oder das Modell gestreikt hat.
- **`MODELL`** steht auf `claude-sonnet-5-5`. Nicht ändern.

**Den `ANTHROPIC_API_KEY` nicht anfassen.** Nicht auslesen, nicht kopieren, nicht
irgendwo hineinschreiben, nicht danach fragen. Er ist gesetzt.

## Du baust gegen den echten Endpunkt

Keine Platzhalterdaten nötig — der Dienst läuft. So prüfst du von der Kommandozeile,
dass er antwortet, bevor du die erste Zeile Komponente schreibst:

```bash
curl -X POST https://fokuswerk-werkzeuge.vercel.app/api/stellenanzeige \
  -H "content-type: application/json" \
  -d '{"domain":"knolle-harpstedt.de","beruf":"Landschaftsgärtner"}'
```

Erster Aufruf rund 30 Sekunden, derselbe Aufruf danach kommt in unter einer Sekunde
aus dem Zwischenspeicher. Beim Entwickeln also ruhig dieselbe Domain nehmen — das
kostet nur einmal.

## Code-Komponente

Neue Datei `code/Stellenanzeiger.tsx`, Namensgebung und Aufbau wie die vorhandenen
Komponenten (`Belegzahlen.tsx` als Vorbild). Der Aufruf ist ein einzelnes `fetch`:

```ts
const antwort = await fetch(ZIEL, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ domain, beruf }),
})
const daten = await antwort.json()
```

Mehr passiert zwischen Framer und dem Endpunkt nicht.

## Regeln aus diesem Projekt, die hier gelten

- **Handy zuerst.** Zwei Felder und der Knopf müssen ohne Scrollen sichtbar sein.
- **Kein leeres HTML:** Was im Auslieferungszustand sichtbar sein soll, steht im
  Anfangszustand — nicht erst nach `useEffect`. Das war der Fehler in
  `Auftaktleiste.tsx` und `Arbeitsschau.tsx` („0 Kontaktaufnahmen" im ausgelieferten
  HTML).
- **Kleine Akzentschrift** über den Stil `fokuswerk-lesbarkeit`: `#CE3600` auf Papier,
  `#FF7341` auf dunklen Flächen. Markenorange erreicht als Kleintext den Kontrast nicht.
- **Antippflächen** mindestens 44 px.
- **H1 je Knoten und je Breakpoint** ausdrücklich setzen. Der Textstil „Display" meldet
  beim Auslesen `h1`, ausgeliefert wird aber `h2`.
- **Die neue Seite ist standardmäßig gesperrt.** Freigeben mit
  `SET <seitenId> metadata.noIndex="false" metadata.noIndexSite="false"` über die DSL —
  `setAttributes` wird still verworfen.
- **`framer.agent.serialize({id},{pagePath})` scopet nicht zuverlässig.** Vom
  `WebPageNode` über `$breakpoints` absteigen und am Seitentitel gegenprüfen, sonst
  landet der Block auf der falschen Seite.
- **Temporäre IDs aus `applyChanges` gelten nur in derselben Sitzung.**
- **Beim Kopieren eines Blocks alle Attribute beider Bäume vergleichen**, nicht eine
  Auswahl. Sonst steht er auf dem Handy sechsspaltig (`gridColumnCount`).

## Texte

Sie-Form auf der Seite. Keine Ausrufezeichen. Kein Englisch, wo es ein deutsches Wort
gibt — also „Stellenanzeige", nicht „Job Ad". Nichts versprechen: Das Werkzeug schreibt
Anzeigen, es garantiert keine Bewerber.

## Datenschutz

Der Endpunkt ruft eine fremde Website ab und schickt deren Text an Anthropic. Das muss
in die Datenschutzerklärung, bevor die Seite live geht. Das E-Mail-Feld braucht eine
Einwilligung mit Zweckbindung; die Einwilligungslogik liegt in
`code/custom/einwilligung-body-end.html`.

## Zum Schluss

Vorschau prüfen: Handy und Schreibtisch, Erfolgsfall und jeder Fehlerfall aus der
Tabelle. Dann berichten, was gebaut wurde und was offen ist.
