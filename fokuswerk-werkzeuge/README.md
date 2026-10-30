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

## 30.10.2026 — Zeichen der Kanäle im PDF, und ein Abbruch kurz vor dem Ziel

**Die Kanäle tragen jetzt ihre Zeichen.** Auf dem Deckblatt als Kachelreihe unter dem
Titel, und jeder Abschnitt beginnt mit einem hellen Band über die ganze Breite: links die
Bezeichnung, rechts das Zeichen. Vorher trennte dort eine Haarlinie — auf einer Seite mit
vier Feldern, drei Fassungen und zehn Anleitungsschritten verschwindet die. Gezeichnet
wird mit `svg-to-pdfkit` aus `lib/marken.js`, also als echte Pfade: Ein PNG müsste für den
Druck in dreifacher Auflösung mitreisen und wäre an den Kanten trotzdem weich. Die Pfade
stammen unverändert von kleinanzeigen.de und arbeitsagentur.de, die beiden Meta-Dienste
aus simple-icons; „Ihre eigene Seite" bekommt ein selbst gezeichnetes Fenster. Der
Markenhinweis steht auf dem Deckblatt über der Fußzeile.

**Drei Satzfehler dabei gefunden:**

- `d.page.margins` und `d.options.margins` sind in pdfkit **dieselbe Referenz**. Ein
  `d.page.margins.top = 0` fürs Deckblatt machte jede spätere Seite randlos, der Kopftext
  von Seite 2 lief in die Kopfzeile. Jetzt bekommt jede Seite ein eigenes Objekt.
- `lineBreak: false` verhindert den Umbruch nicht, wenn ein Wort nicht mehr hineinpasst.
  Im Wegweiser lief die Beschreibung dadurch in die Zeile darunter. `aufBreite()` misst
  jetzt und kürzt mit „…".
- „Fertig für einen Kanäle": Das Zahlwort war ungebeugt. Bei einem einzigen Kanal — wenn
  die Jobbörse nicht taugt — stand das auf dem Blatt.

**Und derselbe Tag noch einmal, eine Stufe feiner.** Nach „das geht noch geiler":

- **Textkarten.** Was der Betrieb übernimmt — Titel, Anzeigentext, Primärtexte,
  Überschriften — steht jetzt in einer hellen Karte mit schmaler Akzentkante links. Was er
  nur liest (`ohneKopie`: Anleitung, Drehbuch, Wochenplan), steht frei im Satz. Die Karte
  wird nur gezeichnet, wenn der Text auf die Seite passt; sonst hätte sie oben einen
  Deckel und unten keinen.
- **Laufender Kolumnentitel.** Oben links steht der Abschnitt, in dem die Seite beginnt —
  gesetzt vom ersten Band der Seite, auf Folgeseiten fortgeführt.
- **Eigener Zeilenumbruch** (`zeilenBrechen`). pdfkit trennt nach den Unicode-Regeln auch
  am Schrägstrich: „Landschaftsgärtner (m/" am Zeilenende, „w/d)." in der nächsten. In
  einem Text, der kopiert und als Anzeige eingestellt wird, liest sich das wie ein
  Tippfehler. Zwei Alternativen verworfen: Der Wortbinder U+2060 fehlt in Inter und
  erscheint als Kästchen, ein Bruchstrich (U+2044) statt Schrägstrich wäre im kopierten
  Text das falsche Zeichen. Der Schnittmarker für Meta läuft jetzt über die selbst
  gebrochenen Zeilen, mit der Grenze als Zeichenposition im Gesamtwert.
- **Keine Trennlinien im Wegweiser.** Acht Haarlinien quer über das Deckblatt, die nichts
  trugen — die Zuordnung macht die Spalte. Gegliedert wird über den Abstand, die vier
  Kanäle tragen orange Nummern, danach eine Lücke für die Beigaben.
- Die Fußzone des Deckblatts (Quelle, Markenhinweis, Absender) lag auf einem Zentimeter;
  der Markenhinweis ist einzeilig und alle drei haben Abstand.

**`betrieb_unbekannt` beim letzten Schritt des Wettbewerbs.** Gemeldet mit ausgefülltem
Kontaktformular, also an der teuersten Stelle, die dieses Werkzeug hat. Zwei Ursachen,
beide behoben:

1. Die Namenssuche (`?suche=1`) legt das gefundene Profil in `inSpeicher(gesucht(...))` —
   dem Prozessspeicher **einer** Lambda-Instanz. Der Abschluss traf eine andere, fand
   nichts und hängte den Betrieb nicht in seine eigene Liste. `einhaengen` sucht das
   Profil jetzt notfalls selbst über `betriebSuchen`.
2. `bewerte` verglich den eigenen Namen per `===`. „Fokuswerk" gegen „Fokuswerk –
   Marketing & Social Media" war damit ein anderer Betrieb. `nameGleich()` normalisiert
   Groß- und Kleinschreibung, Umlaute und Interpunktion und erlaubt den kürzeren Namen als
   Anfang des längeren (ab vier Zeichen).

Gegengeprüft im Trockenlauf: Fokuswerk/Oldenburg liefert jetzt Platz 9 von 19 statt 422.

## 29.10.2026 — vier Fehler aus einem eigenen Durchlauf

**Doppeltes Impressum in der Kundenmail.** Die Absenderzeile stand einmal unter der
Unterschrift im Brief und ein zweites Mal unter der Trennlinie der Hülle. Die im Brief
ist raus — `huelle()` setzt sie ohnehin unter jede Mail. Dasselbe galt für die
SEO-Auswertung.

**Zeilenumbruch mitten in der Mailadresse.** Die internen Meldungen setzten Beschriftung
und Wert zweispaltig, die Beschriftungsspalte mit fester Breite und `white-space:nowrap`.
Auf dem Handy blieben dem Wert daneben rund 140 px, und `thees0901@icloud.com` brach zu
`…icloud.co / m`. Jetzt steht die Beschriftung klein über dem Wert, der Wert hat die
ganze Zeile: eine gemeinsame `angabe()` in `lib/mail-vorlagen.js`, benutzt von allen drei
Meldungen (Stellenanzeige, SEO-Analyse, Wettbewerb). Sie maskiert selbst und baut auf
Wunsch den `tel:`/`mailto:`-Verweis — vorher hatte jede der drei ihre eigene Fassung mit
einem anderen Vertrag.

**„… mehr" im PDF.** Die Nachbildung des Facebook-Knopfes sah auf Papier aus wie eine
Schaltfläche, auf die man drücken soll. Die Grenze trägt jetzt ein grauer Strich, und
einmal je Dokument steht darunter, was das Grau bedeutet.

**Das Deckblatt ohne Inhaltsangabe.** Ohne Marktlage (Beruf keiner amtlichen
Berufsgruppe zuzuordnen) standen dort drei Zeilen Fließtext und zwei Drittel Leere. Jetzt
trägt es den Wegweiser „Was in diesem Dokument steht": jeder Kanal mit dem, was drinsteht,
dazu Bewerberfragen, Anleitung und Budget, jeweils mit Seitenzahl. Gesetzt wird er
zuletzt über `switchToPage(0)` — die Seitenzahlen stehen erst fest, wenn alles umbrochen
ist. Ohne Marktlage kommt darunter noch der Umfang (Seiten, Kanäle, Fragen).

Dazu: Die Überschrift „Ihre Texte, fertig für drei Kanäle" stand über vier Blöcken,
seit die Jobbörse der Arbeitsagentur dazukam. Die Zahl kommt jetzt aus dem Ergebnis.

Probelauf ohne Versand: `node test/stellen-pdf-probe.mjs <ordner> [ohne-marktlage]`.

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
