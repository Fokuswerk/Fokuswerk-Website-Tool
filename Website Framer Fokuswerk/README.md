# Fokuswerk — neue Website (Framer-Projekt „FW neu")

## 30.10.2026 — der Wettbewerbs-Trichter wartet nicht mehr stumm

Nach dem Absenden stand der Knopf zweieinhalb Minuten auf „Wird gerechnet …", das
ausgefüllte Formular daneben. „Psychologisch nicht gut, man denkt, das hängt." Stimmt —
und die Rechenzeit ist durch die gründlichere Google-Prüfung eher länger geworden.

Jetzt wechselt die Karte sofort: Überschrift „Wir zählen in <Ort> durch", die ehrliche
Dauer (zwei bis vier Minuten, mit dem Grund: jedes Profil einzeln, danach zwei
Werbeverzeichnisse), eine Stufenanzeige mit Sekundenzähler und ein Balken, der auf 96 %
zuläuft und dort wartet. Darunter der Satz, der den Druck herausnimmt: Die vollständige
Auswertung geht als PDF an die angegebene Adresse — wer bleibt, sieht sie zusätzlich hier.

Das Formular verschwindet dabei. Ein stehengebliebenes Formular neben einem grauen Knopf
sieht aus, als sei etwas kaputt. Bei einem Fehler geht es zurück auf den Kontaktschritt,
wo die Meldung im Zusammenhang steht.

Dazu nennt die Rangtabelle jetzt den Kanal statt eines blossen „ja" — „Meta", „Google",
„Meta + Google", „Stellen" —, und ein Strich steht da, wo eine der beiden Quellen zu
diesem Betrieb nicht geantwortet hat.

## 29.10.2026 — Stellenanzeigen-Werkzeug: vier gemeldete Fehler, und was man bekommt

Gemeldet nach einem eigenen Durchlauf, alles am selben Tag behoben und live.

**Die Seite sprang beim Absenden nicht zurück.** Wer im Trichter weit unten stand und
absendete, blieb dort stehen — oben lief der Fortschrittsbalken, im Bild stand der
Beweisblock mit dem Beispielergebnis samt Kopieren-Knöpfen. Gelesen wurde das als „das
ist ja schon fertig". `nachfuehren()` dockte nur an, wenn der Kasten schlecht stand;
beim Wechsel auf `laeuft` und `fertig` dockt es jetzt immer an. Gemessen auf dem Handy:
Scrollposition 4800 → 204.

**Der Beweisblock fällt im Trichter weg.** Vor dem ersten Antippen ist er der Beleg,
danach eine Verwechslung — auf dem Handy stand er direkt unter der offenen Frage. Wo er
steht, trägt er jetzt oben eine Marke „Beispiel — ein echter Durchlauf für einen anderen
Betrieb, nicht Ihre Seite".

**Die Kanäle stehen jetzt unter dem Feld**, als Leiste mit Kleinanzeigen,
Arbeitsagentur, Facebook & Instagram und Ihrer eigenen Seite, jeder mit „kostenlos" oder
„bezahlt", darunter ein Satz zu Bewerberfragen, Anleitung, Drehbuch und Budget. Die drei
Belegzahlen darunter wurden neu belegt (0 Euro, 10 Schritte, 4 Bewerberfragen), weil
„4 Kanäle" sonst zweimal dastand. Der Etikett-Chip „Kostenlos, kein Konto" ist aus
demselben Grund weg.

**Nach dem Ergebnis steht der Stand:** „4 von 7 Schritten bis zur besetzten Stelle sind
erledigt" — Texte, Fragen, Budget und Drehbuch stehen, offen bleiben Video, Ausspielung
und die Antwort am selben Tag. Das ist der eingebaute Gesprächsanlass, das Gegenstück
zum Deckel von 75 Punkten in der SEO-Analyse, und es stimmt: Texte allein besetzen keine
Stelle.

Am Rechenwerk (`fokuswerk-werkzeuge`) hingen dieselbe Runde: doppeltes Impressum in der
Kundenmail, Zeilenumbruch mitten in der Mailadresse der internen Meldung, „… mehr" als
toter Aufklapp-Knopf im PDF und ein Deckblatt ohne Inhaltsangabe. Steht dort im README.

## 29.10.2026 — der Wettbewerbs-Trichter fragt jetzt den Namen, nicht die Branche

Thees fand sich im eigenen Freebie nicht. Drei Anläufe über Werbeagentur, Marketingagentur
und Social-Media-Agentur, jedes Mal ins Leere. **Google führt Fokuswerk als
„Online-Marketing-Unternehmen"** — auf den Begriff kommt niemand.

Die Reihenfolge war falsch herum: Der Trichter fragte zuerst nach dem Gewerk, aber die
Kategorie vergibt Google, nicht der Betrieb. Jetzt: **Ort → Betriebsname → Zahlen.** Die
Branche holt `betriebSuchen()` aus seinem Google-Profil (`?suche=1`, Places-Suche nach dem
Namen). Bei mehreren Gleichnamigen wählt der Mensch, mit Kategorie und Anschrift daneben.

**Der zweite Fehler, den erst der Live-Test zeigte:** Die Kategorie zu kennen genügt nicht.
`searchStringsArray` ist bei Google eine **Textsuche, kein Filter** — „Online-Marketing-Unternehmen"
in Oldenburg lieferte 17 Betriebe, und Fokuswerk war nicht dabei, obwohl genau diese Kategorie
an seinem Profil steht. Der Umbau allein hätte also wieder ins Leere geführt, eine Stufe
später. Deshalb hängt `einhaengen()` im Endpunkt den selbst gesuchten Betrieb in die Liste,
wenn die Kategoriesuche ihn nicht mitbringt. Das Profil dafür liegt aus dem `?suche=1`-Aufruf
im Speicher; `betriebSuchen` liefert seit dem dieselben Felder wie `profileHolen`.

Kosten: ein Apify-Aufruf mehr je Lead (~30 s). `GEWERKE` im Baustein ist weg.

### Dabei repariert

- **Der Scroll-Sprung nach jedem Schritt.** Die Karte wurde IMMER unter die Kopfleiste
  gezogen — auf dem Schreibtisch schnitt das die Überschrift weg und ließ unter der kurzen
  Karte eine leere schwarze Fläche. Jetzt wird nur so weit gescrollt, dass die Karte ins Bild
  passt; passt sie ohnehin, passiert nichts.
- **Die Meldung an uns ging als nackter Text raus**, während die anderen beiden Freebies
  Karten schicken. Jetzt dieselbe Hülle, mit Textfassung als zweiter Spur.
- **Die PDF hatte 7 Seiten, 3 davon fast leer.** Der Kennzahlen-Block stand auf einer festen
  `yFeld = 686` für genau vier Felder; die neue Google-Zahl fiel über den Seitenrand, der Wert
  landete auf Seite 2, die Beschriftung auf Seite 3. Der Block wächst jetzt nach oben, der Fuß
  bleibt fest. **Wer eine Kennzahl ergänzt, soll das Layout nicht von Hand nachrechnen.**
- **Lange Betriebsnamen liefen in die nächste Tabellenzeile.** `lineBreak: false` mit
  `ellipsis` hat pdfkit nicht davon abgehalten umzubrechen; jetzt wird mit `widthOfString`
  selbst gekürzt.
- **Die Anzeigenspalte sagte nur „ja" oder „keine".** Jetzt steht dort der Kanal: Meta,
  Google oder beides. Fußnote und Quellenangaben nachgezogen.

## 29.10.2026 — Google Ads kommt zum Werbe-Check dazu

Der Wettbewerb prüfte bisher nur Meta. Jetzt zusätzlich Google Ads Transparency, über den
Apify-Actor `scrapesage~google-ads-transparency-scraper` im Modus `advertisers`: Liste von
Domains rein, je Werbetreibendem eine Zeile raus. **0,3 Cent je gefundenem Werber** — wer
nicht wirbt, kostet nichts.

**Was dafür umgebaut werden musste:** Der Vorrat speicherte `website: true`, nicht die
Adresse (`rangliste-messen.js:253`). Ohne Domain kein Google-Check. Jetzt steht `domain`
daneben, gefiltert über `reineDomain()` — Facebook-Seiten, `business.site` und
Branchenbucheinträge zählen nicht als eigene Website.

**Die Falle, im Probelauf gesehen:** Auf `euromaster.de` kamen fünf Werbetreibende zurück,
vier davon fremde Agenturen und Partner aus AT, DK und SE, die auf dieselbe Seite werben.
Ungefiltert hätte der Bericht vier werbende Autowerkstätten in Westerstede gemeldet, die es
nicht gibt. Jede Zeile läuft deshalb durch dasselbe `zuordnen()` wie bei Meta.

**Bezugsgröße ist `googlePruefbar`, nicht die Gesamtzahl.** In Westerstede haben 7 von 15
Betrieben keine Website; über die kann der Check nichts sagen. „0 von 15" wäre eine Behauptung
über sieben ungeprüfte Betriebe. Ist `googlePruefbar` null, fällt der ganze Google-Block
aus Bericht und PDF — nicht als Nullzahl.

Beide Abrufe laufen in `anzeigenErgaenzen` nebeneinander (`Promise.all`); fällt Google aus,
steht die Meta-Zahl trotzdem. Neu im Bericht: eine Kennzahl im PDF, ein eigener Befund
(`anzeigen.googleBefund`) in PDF und Baustein.

**Erster echter Treffer:** `wav-wst.de` schaltet 8 Google-Anzeigen — und bei Meta nichts. Der
Kanal war schlicht blind.

**Ein Fehler im Abgleich, beim ersten Lauf in Oldenburg gefunden:** „König39" gegen „König 39"
wurde verworfen. `zuordnen()` sah einmal `koenig39` als ein Wort und einmal `koenig` plus eine
Zahl, die als zu kurz herausfiel. Jetzt vergleicht die Prüfung zusätzlich beide Namen ohne
Leerzeichen — gleiche Zeichen, andere Schreibweise, derselbe Betrieb.

### Blockiert: Apify-Guthaben ist leer

```
compass~crawler-google-places antwortete 402: not-enough-usage-to-run-paid-actor
"Your remaining usage of $0.156972 this billing cycle isn't enough for this run."
```

Jede frische Messung scheitert daran — Google-Check hin oder her. Der Vorrat liefert weiter
aus, aber ohne Domains, also ohne Google-Block. **Zwei Dinge fehlen, bevor das sichtbar wird:**
Guthaben aufladen, und `APIFY_TOKEN` in die lokale `.env` (steht nur auf Vercel), weil
`test/vorrechnen.mjs` lokal läuft.

**Neu beim Suchen:** `sammle()` hängt den Originaltext von Apify als `grund` ans Ergebnis, und
`?placesprobe=1&diagnose=…` gibt ihn heraus. Vorher stand überall nur `profile_nicht_lesbar`,
und der Unterschied zwischen „kein Guthaben" und „Actor kaputt" war nicht zu sehen.

## 29.10.2026 — die SEO-Analyse bewertet deutlich strenger

Anlass: `pferdehof-mansie.de` bekam 65 von 100. Eine Wix-Seite, die 1,2 MB ausliefert, um
254 Wörter zu zeigen, deren Titel aus zehn aneinandergereihten Suchbegriffen besteht und auf
deren Startseite keine Anschrift steht. Dieselbe Seite steht heute bei **43**.

Die Ursache war nicht die Arithmetik, sondern der Prüfungskatalog: Er belohnte das Ausbleiben
von Sabotage. Kein `noindex`, https, viewport, eine saubere 404 — das bringt jeder Baukasten
mit, und es stand mit vollem Gewicht als „gut" in der Wertung. Vier von fünf gemessenen Seiten
hatten **Technik 100**.

| Was | Vorher | Jetzt |
|---|---|---|
| Punktwert einer Lücke | 0,35 | 0,20 |
| Punktwert „unbekannt" | 0,50 | 0,30 |
| Feldgewichte (technik/google/ort/ki) | 25/28/27/20 | 22/28/30/20 |
| Gewicht `handy`, `kiZugang`, `robotsdatei` | 8 / 12 / 2 | 5 / 10 / 1 |
| Obergrenze für eine fremde Domain | keine | **75** |

**Sechs neue Prüfungen**, alle aus Messwerten, die schon vorlagen und nicht gezählt wurden:

- `googlesicht` (10) — Abruf mit der Googlebot-Kennung gegen den Browser-Abruf. Das war die
  größte Lücke: Eine Seite, deren Text erst im Browser entsteht, bekam in der Google-Bewertung
  keinen Punkt Abzug. `botsicht.google` wurde seit jeher gemessen und nie benutzt.
- `seitengewicht` (8) — Quelltext-Bytes und Zahl der Skripte gegen die Wortzahl.
- `canonical` (4), `sprache` (3), `bildmasse` (4, Bilder ohne Höhe/Breite), `mailadresse` (3).
- `ortsmarkup` prüft zusätzlich Koordinaten und `sameAs`; ein **kaputter** JSON-LD-Block ist
  jetzt ein Mangel (vorher unbemerkt, obwohl `struktur.kaputt` gemessen wurde).

**Verschärfte Schwellen:** Titel über 100 Zeichen oder mit ≥ 4 Trennzeichen ist ein Mangel
statt einer Lücke; Beschreibung über 250 Zeichen ebenso; ab drei `h1` Mangel; Alternativtexte
unter 50 % Mangel (gut erst ab 90 %); Textmenge gut erst ab 450 Wörtern; Antwortzeit gut unter
400 ms; `aktualitaet` verlangt ein vollständiges Datum — vorher genügte „© 2024" in der Fußzeile.
`impressum` zählt nur noch einen verlinkten Pfad, nicht das Wort im Text. **Kein Ort auf der
Startseite** ist ein Mangel statt „unbekannt" — das ist der Befund, nicht das Fehlen eines
Befunds.

**Ein Widerspruch, den erst der Live-Lauf zeigte:** Derselbe überladene Titel galt oben als
Mangel („Google verwirft solche Aufzählungen") und zwei Absätze weiter zweimal als Stärke
(„Ihr Suchbegriff steht im Seitentitel", „Ihr Ort steht im Seitentitel") — zusammen 22
Gewichtspunkte in voller Höhe. Die beiden Passungsprüfungen fragen jetzt über
`titelUeberladen()` mit, ob der Titel überhaupt etwas taugt. Mansie fiel dadurch von 54 auf 43.

**Die Obergrenze 75** (`DECKEL` in `seo-analyse-urteil.js`): Die Prüfung liest den
ausgelieferten Quelltext der Startseite und nur den. Google-Profil, Bewertungen, Verweise von
anderen Seiten, die tatsächliche Platzierung — nichts davon sieht sie. Die Grenze ist im
Bericht **nicht benannt** (Entscheidung Thees, 29.10.2026); sie steht und fällt mit der Ausnahme.

**`fokuswerk.de` steht fest auf 100** (`VOLLE_PUNKTZAHL`, Entscheidung Thees, 29.10.2026). Die
eigene Seite ist der Maßstab, den wir im Gespräch danebenlegen; 93 gegen 43 wirft die Frage auf,
was denn bei uns fehlt. Gemessen steht sie bei 91 bis 93 mit fünf offenen Punkten. Drei davon
wären behebbar — Erreichbarkeitszeiten auf die Startseite, `llms.txt` als echte Textdatei,
Antwortzeit. **Zwei nicht:** Seitengewicht (523 KB) und fehlende Bildmaße liefert Framer so aus.
Ein ehrlich gemessenes 100 ist auf dieser Plattform nicht erreichbar.

Gesetzt wird nicht nur die Zahl: Die offenen Punkte werden **aussortiert**, nicht auf „gut"
gedreht — ein grüner Haken neben „Beim Laden springt Ihre Seite" wäre schlimmer als die Lücke.
Damit kommen die vier Feldnoten von selbst auf 100 und es steht kein Baustein zum Einsetzen
darunter. **Der eigene Blick bleibt:** `?roh=1` hinter dem Diagnoseschlüssel rechnet ungeschönt.
Eigener Schalter, nicht an den Schlüssel gehängt — der öffnet auch den Trockenlauf, und sonst
wäre der einzige Weg, die öffentliche Darstellung zu prüfen, ein Aufruf mit echtem Mailversand.

```
# öffentlich, nichts verschickt
curl -s -X POST ".../api/seo-analyse?trocken=1&diagnose=fw-probe-2610"        -d '{"domain":"fokuswerk.de",…}'   # 100
# ungeschönt
curl -s -X POST ".../api/seo-analyse?trocken=1&roh=1&diagnose=fw-probe-2610"  -d '{"domain":"fokuswerk.de",…}'   #  93
```

**Zwei Folgewirkungen:**

- Das Beispiel auf `/seo-analyse` ist eine echte Messung und musste nachgemessen werden:
  aus 63 wurde 61, die Feldnoten und vier Messwerte haben sich geändert. Wer die Bewertung
  anfasst, misst dieses Beispiel nach — sonst steht dort eine Note, die das Werkzeug für
  dieselbe Seite nicht mehr vergeben würde.
- Leads von vor dem 29.10.2026 tragen Noten der alten Skala. Zarate steht mit 88 in der
  Pipeline und käme heute auf 75. Die beiden Zahlen sind nicht vergleichbar.

**Nebenbei behoben:** Der Deckel des PDF kürzt lange Seitentitel. Der 198-Zeichen-Titel von
Mansie lief über sieben Zeilen mitten durch die Note. Vor dem ersten Trennstrich steht in
solchen Titeln fast immer der Name des Betriebs; der genügt dort.

**Noch offen:** Bei Wix schwankt die ausgelieferte Wortzahl zwischen zwei Abrufen (851 und
254 im selben Durchgang gemessen). Die Sicht-Prüfungen vergleichen zwei getrennte Abrufe und
können dadurch um eine Stufe springen. Abgefedert über eine absolute Untergrenze von 300
Wörtern, aufgehoben ist es nicht.

## 28.10.2026 — Typprüfung ist jetzt Pflicht vor jeder Veröffentlichung

Nach dem leeren Arbeiten-Block auf `/leistungen/websites`: Der Ablauf ist festgeschrieben, die
Regeln stehen in `CLAUDE.md` und werden damit in jedem Chat geladen, der in diesem Ordner arbeitet.

```
npx @framer/agent@latest exec -s <sitzung> < werkzeuge/publizieren.js   # prüfen, dann veröffentlichen
npx @framer/agent@latest exec -s <sitzung> < werkzeuge/pruefen.js       # nur prüfen
```

`werkzeuge/publizieren.js` geht alle Code-Bausteine mit `typecheck()` durch und bricht ab, sobald
eine Meldung dabei ist, die zur Laufzeit kracht (`Cannot find name …`). Harmlose Typhinweise —
`textWrap`, Baustein-Importe `./X.tsx`, URL-Importe von esm.sh — werden gelistet, blockieren aber
nicht.

Hinter „Änderungen: 0" stecken zwei sehr verschiedene Lagen, deshalb merkt sich das Skript in
`werkzeuge/.code-stand.json` den Fingerabdruck jedes Bausteins (Leerraum normalisiert, weil Framer
Dateien gelegentlich selbst umformatiert):

- **Stand bereits live** → nichts veröffentlichen, kurze Meldung. Vorher entstand hier eine leere
  Fassung samt irreführender Warnung.
- **Code geändert, Leinwand unberührt** → Abbruch mit Nennung der betroffenen Dateien. Framer baut
  das Paket sonst nicht neu und die alte, womöglich kaputte Fassung bliebe live.

`process` gibt es in der Agenten-Umgebung nicht; der Pfad zur Standdatei läuft deshalb über
`os.homedir()`. Erlaubt sind dort nur `path`, `url`, `fs`, `fs/promises`, `crypto`, `buffer`,
`util`, `os`.

**Der erste Lauf hat sofort einen zweiten Fehler derselben Art gefunden:** In `Rangliste.tsx`
(Werkzeug `/wettbewerb`) griff `TrichterRahmen` in Schritt 3 auf `anzeigen` zu — eine Variable,
die im Hauptbaustein lebt und nicht durchgereicht war. Aufgefallen wäre das erst, wenn ein
Interessent den Trichter bis zur Ortsauswertung durchläuft; dann wäre die Karte leer geblieben.
Behoben wie beim Arbeitsraster: Prop in die Signatur und an die Aufrufstelle. Veröffentlicht als
Fassung f2d99422d.

## 28.10.2026 — leerer Block auf `/leistungen/websites`: ein Absturz im Arbeitsraster

Rückmeldung: „wieso lädt das hier nicht." Auf `/leistungen/websites` stand nur noch das
Geisterwort „Arbeiten" und der Hinweissatz darunter — die Kachelgalerie fehlte.

**Ursache:** In `Arbeitsraster.tsx` nutzte der Umschalter (`Schalter`, Websites/Kampagnen) in
seinem `padding` die Variable `schmal`, die in dieser Funktion nie ankam — sie wird im Aufrufer
berechnet und war als Prop nicht durchgereicht. Im Browser `ReferenceError: schmal is not defined`,
Framer fängt das ab und lässt den Bereich leer. Der Fehler lag im Code und wurde erst sichtbar,
als ein Publish das Bausteinpaket neu baute.

**Behoben:** `schmal: boolean` in die Signatur von `Schalter` und `schmal={schmal}` an die
Aufrufstelle. `typecheck()` meldet die Datei jetzt sauber.

**Zwei Dinge fürs nächste Mal:**

- **`typecheck()` über alle Code-Dateien laufen lassen, bevor man publiziert.** Der Fehler stand
  schwarz auf weiß in der Prüfung (`Cannot find name 'schmal'`), nur hatte sie niemand gelesen.
  Alle anderen 28 Dateien melden nur harmlose Typhinweise (`textWrap`, Modulpfade).
- **Eine Code-Änderung allein löst keinen Neubau aus.** Der Publish direkt nach der Reparatur
  meldete „changes: 0" und lieferte weiter das alte, kaputte Paket aus. Erst eine echte
  Canvas-Änderung (hier: den Knoten umbenannt) baut das Paket neu. Danach geprüft: keine Seite der
  Sitemap verweist mehr auf das alte Paket.

## 28.10.2026 — die drei Werkzeuge sind jetzt auf der Seite verlinkt

Vorher führte **kein einziger Link** auf `/seo-analyse`, `/wettbewerb` oder `/stellenanzeige` —
die Seiten waren nur über die Sitemap und über Anzeigen erreichbar. Jetzt hängen sie an dem
Dienst, zu dem sie gehören:

- **`/leistungen`** — der frühere Einzelblock „Werkzeug Stellenanzeige" ist eine Dreier-Reihe
  geworden: SEO- und GEO-Analyse, Platz im Wettbewerb, Stellenanzeige. Raster 3 Spalten (Desktop),
  2 (Tablet), 1 (Handy).
- **`/leistungen/websites`** — ein Block zur SEO- und GEO-Analyse, zwischen „Arbeiten" und „Ablauf".
- **`/leistungen/performance-marketing`** — zwei Werkzeuge (Wettbewerb, Stellenanzeige) nach
  „Kampagnen".
- **Fußzeile** — unter den Leistungen eine Gruppe „KOSTENLOSE WERKZEUGE" mit allen drei Seiten,
  also von jeder Seite aus erreichbar.
- **Öffnungszeiten im Fuß** sitzen jetzt in einer eigenen Hülle mit 10 px Abstand und in Papier 40
  statt in voller Textfarbe — vorher klebten sie an der Adresse und lasen sich wie ein Teil davon.

**Drei Sachen, die dabei Zeit gekostet haben:**

- **`borderColor` Papier 16 ist auf hellem Grund unsichtbar.** Die Haarlinien des Hausstils gibt es
  in zwei Fassungen: Papier 16 auf dunklem Grund (Fuß), **Tinte 16** auf Papier. Der alte
  Werkzeugblock hatte die falsche — gemessen im Browser über `getComputedStyle`, nicht geschätzt.
- **`padding` lässt sich auf `RichTextNode` nicht setzen** („Cannot apply padding"). Abstände
  brauchen eine Frame-Hülle um den Text.
- **Löschen geht nicht über die DSL** (`-id`, `DELETE id` kennen beide keinen Befehl), sondern nur
  über `(await framer.getNode(id)).remove()`. Und **DSL-Namen bleiben in der Sitzung belegt**: ein
  zweites `+Node name=…` mit demselben Namen schlägt still fehl, auch wenn der erste Knoten
  inzwischen gelöscht ist — dann einen neuen Namen nehmen.

Die Verweise entstehen als `link.href`; Framer macht daraus relative Adressen (`./seo-analyse`).
Ein echter Seitenbezug (`link.webPageId`) lässt sich über die Schnittstelle **nicht** setzen — der
Wert wird still verworfen. Geprüft: `/leistungen/` leitet auf `/leistungen` um, die relativen Links
lösen also richtig auf, und ein Klicktest im Browser landet auf `/seo-analyse`.

## 28.10.2026 — Monatsberichte raus, drei SEO-Befunde umgesetzt

**Keine Aussage über Monatsberichte mehr.** Rückmeldung: „monatsberichte machen wir so auch nicht,
also schreibe da nichts drüber." Gesucht über alle 57 Seiten der Sitemap, geändert an 44 Textknoten
und 27 Steuerwerten:

- Ablaufschritt „Schalten und messen" auf acht Seiten: jetzt „Die Anzeigen laufen an. Was Anfragen
  bringt, bekommt mehr Budget — der Rest wird geändert oder abgeschaltet."
- `/leistungen`: Karte 06 heißt „Nachsteuern" statt „Monatsbericht"; der Satz „Am Monatsende steht
  fest, was ein Kunde gekostet hat" ist gestrichen.
- `/leistungen/performance-marketing`: Vorspann endet auf „Messbar statt auf gut Glück",
  „Auswertung & Bericht" heißt nur noch „Auswertung".
- Leistungspunkte der Online-Werbung ohne „· Monatsbericht"; die Beispielkachel auf den fünf
  Branchenseiten heißt „Die Zahlen auf einen Blick".

**Falle dabei:** Zwei Stellen standen *nicht* im Code-Standardwert, sondern als Instanzwerte in
Objekt-Controls (`$control__werbung` bei der Leistungsbühne, `$control__datenJSON` beim
Branchenbeispiel) — je Breakpoint eigen. Der erste Publish sah sauber aus, live stand der alte Text
trotzdem. Objekt-Controls lassen sich **nicht** über die DSL schreiben (`SET … $control__werbung=…`
läuft ohne Fehler durch und ändert nichts, Teilpfade werden abgelehnt) — nur über
`getNode(id).setAttributes({ controls: { werbung: … } })` mit dem **Code**-Schlüssel. Reine
String-Controls wie `datenJSON` gehen dagegen per DSL.

**Drei Befunde aus dem eigenen Werkzeug `/seo-analyse` abgearbeitet:**

1. **Öffnungszeiten als Text:** „Erreichbar Mo–Fr 9–17 Uhr" steht jetzt im Fuß (Layout-Template,
   also auf jeder Seite).
2. **Öffnungszeiten in den strukturierten Daten:** `openingHoursSpecification` sitzt jetzt in der
   `ProfessionalService`-Entität selbst. Der frühere Behelf — ein eigener JSON-LD-Block im
   `headEnd` mit gleicher `@id`, aber ohne `@type` — ist entfernt. Der Weg ins Haupt-Markup führt
   über die DSL auf das **String**-Control: `SET ulqLQepzP $control__jSONLD="…"`, und zwar für alle
   drei Breakpoint-IDs (`ulqLQepzP`, `WQlUT7pJkulqLQepzP`, `nTupyIOA7ulqLQepzP`). `getNode()`
   erreicht diese Knoten im Layout-Template nicht.
3. **llms.txt:** Framer liefert keine statischen Textdateien aus. Deshalb gibt es die Seite
   `/llms.txt` mit dem Code-Baustein `Llms.tsx`, der den Markdown-Klartext in ein `<pre>` schreibt.
   Sie antwortet mit 200, Inhaltstyp ist `text/html`, nicht `text/plain`.

**Stand 28.09.2026: Startseite neu gebaut nach dem Relaunch-Prompt und neun Referenzseiten,
Runde 2 nach Rückmeldung umgesetzt.** Details je Referenz und Mechanik: [`Referenzen.md`](Referenzen.md).

**Vorschau:** https://frank-site-485713.framer.app/ (noindex)
**Projekt:** https://framer.com/projects/FW-neu--YPv6DX0m4fRLwI6tlnjF-h7ell
**fokuswerk.de ist davon nicht betroffen.**

## Livegang 19.10.2026 und Audit-Punkte 7 bis 12

**Die Seite läuft jetzt unter fokuswerk.de.** Dabei drei Startblocker gefunden und behoben:

- **`noindex` lag auf 20 Seiten** und wäre mit dem Domainumzug live gegangen — Google hätte die
  Seite nie indexiert. Über die Agenten-DSL doch setzbar: `SET <seitenId> metadata.noIndex="false"
  metadata.noIndexSite="false"` (nicht über `setAttributes`, das wird still verworfen). 18 Seiten
  freigegeben, `/404` und der Entwurf `/branchen` bleiben gesperrt. Sitemap jetzt 53 statt 3 URLs.
- **Canonical zeigte auf die Vorschauadresse** (`frank-site-485713.framer.app`). Mit dem ersten
  Publish nach dem Domainumzug zieht Framer das nach — jetzt `https://fokuswerk.de/`, og:url ebenso.
- **Das Framer-Abzeichen** war noch im Markup, obwohl der Tarif lief: Der letzte Publish stammte
  von *vor* der Umstellung. Ein Republish entfernt es; im Browser ist weder Element noch Container
  übrig.

Danach die Audit-Punkte 7 bis 12 (Details in [`Audit-16-10-2026.md`](Audit-16-10-2026.md)):
Abzweig unter den Fallstudien-Kennzahlen, Rechenbeispiel auf der Startseite, einheitliche
Knopfbeschriftung, Formularknopf plus Antwortzeit, Vorspann aus bei Anzeigenklicks. Offen bleiben
Preisspanne (Entscheidung) und zwei Kundenzitate (Telefonate).

**Zwei Fallen beim Arbeiten mit dem Agenten, die hier Zeit gekostet haben:**

- `framer.agent.serialize({id}, {pagePath})` **scopet nicht zuverlässig auf die angegebene Seite** —
  es liefert, was gerade geöffnet ist. Dadurch landete ein Abzweig-Block auf der falschen
  Fallstudie. Verlässlich ist nur: vom `WebPageNode` über `$breakpoints` absteigen und das Ergebnis
  an einem seitenspezifischen Text gegenprüfen (hier die Überschrift).
- **Temporäre IDs aus `applyChanges` gelten nur in derselben Sitzung.** Nach einem Sitzungswechsel
  heißt der Knoten anders (`fwRechnungStart` → `trKkSeZtk`); dann liest man ins Leere, ohne Fehler.
- Beim Kopieren eines Abschnitts auf eine andere Seite fehlte am Ende genau **eine** Eigenschaft
  (`gridColumnCount`), und der Block stand auf dem Handy sechsspaltig. Ein Abgleich über eine
  Auswahl von Feldern reicht nicht — alle Attribute beider Bäume vergleichen.

## Audit 16.10.2026 — sechs Punkte abgearbeitet

Vollständiger Befund: [`Audit-16-10-2026.md`](Audit-16-10-2026.md). Umgesetzt wurde die Pflichtliste:

- **Zähler liefern wieder Zahlen.** `Auftaktleiste.tsx` und `Arbeitsschau.tsx` starteten im State
  bei 0 und zählten erst im Browser hoch — im ausgelieferten HTML stand damit „0 Kontaktaufnahmen",
  „Klickrate 0,0 %". Jetzt ist der Endwert der Anfangszustand; auf 0 gesetzt wird erst im Browser
  in `useLayoutEffect` (vor dem ersten Bild, sonst blitzt die Zahl auf). Im HTML stehen 439, 69,
  17.100, 3,3 %, 0,33 €, 1.150.458, 36.842.
- **H1 auf den drei Fallstudien** (vorher keine; der Titel war ein H2). Achtung: Der Textstil
  „Display" meldet beim Auslesen `tag: h1`, ausgeliefert wird aber h2 — der Tag muss **je Knoten
  und je Breakpoint ausdrücklich** gesetzt werden, sonst ändert sich nichts.
- **Alt-Texte** für die zwei Fahrzeugaufnahmen auf `/leistungen` und die drei Titelbilder auf
  `/arbeiten` (`SET <id> altText="…"` über die DSL funktioniert, anders als `setAttributes`).
- **Kontrast der kleinen Akzentschrift:** Markenorange erreicht als Kleintext weder auf Papier
  (2,81 : 1) noch auf Dunkelgrau (3,93 : 1) die 4,5 : 1. Statt die Markenfarbe zu ändern, bekommt
  nur die Schrift einen eigenen Ton je Grundfläche: `#CE3600` auf Papier, `#FF7341` auf dunklen
  Karten (Stil `fokuswerk-lesbarkeit`). Nachgemessen: 0 sichtbare Verstöße auf vier Seiten.
- **Antippfläche** der Rechtszeile im Fuß auf mindestens 44 px („AGB" war 30 px).
- **Nicht möglich über die Schnittstelle:** der `noindex`-Schalter. Weder DSL noch `setAttributes`
  kennen das Feld — das bleibt ein Editor-Schritt beim Livegang (Liste im Audit).

## Seitenwechsel (15.10.2026)

Rückmeldung: „die Übergänge, wenn ich auf einen Link klicke, sind noch nicht ganz clean — es wird
manchmal erst weiß, dann sieht man nochmal die alte Seite und dann kommt die neue."

Dahinter lagen **zwei verschiedene Fehler**, gemessen mit Einzelbildaufnahmen (Chromium-Screencast,
60 Bilder/s, Handybreite):

**1. Verweise aus den Code-Bausteinen laden die ganze Seite neu.** Framers eigene Verweise
(Menü, Fuß, Knöpfe auf der Leinwand) wechseln die Seite im Browser. Die `<a href>` in unseren
Code-Bausteinen (Leistungsbühne, Arbeitsschau, Kundenrad) kennt Framers Router nicht — sie lösen
einen vollen Dokumentwechsel aus. Dabei lief jedes Mal der **Vorspann erneut** (Kurzfassung):
gemessen 2 Bilder weiß, danach 600 ms grauer Grund, dann fuhr die Fläche hoch. Rund eine Sekunde
Zwischenspiel pro Klick.

**2. Der eingestellte Seitenübergang hatte eine Lücke.** Framer baut seinen Übergang beim Wechsel
als `<style id="view-transition-styles">` in den Kopf. Ausgelesen: die alte Seite wischte in
**0,6 s** nach oben weg (Deckkraft 1 → 0, Maske), die neue blendete **erst 0,6 s später** ein.
Dazwischen war der Bildschirm leer. Genau das ist „erst weiß, dann nochmal die alte Seite".

**Jetzt (Custom Code, drei Stellen):**

| Baustein | Was er tut |
|---|---|
| `fokuswerk-vorspann-schalter` (headStart) | Vorspann nur noch beim ersten Aufruf einer Sitzung. Kommt der Besucher von unserer eigenen Seite (Verweis gleicher Herkunft), bleibt er aus — `html.fw-ohne-vorspann`. |
| `fokuswerk-vorspann-takt` (bodyStart) | Bei gesetzter Klasse wird die Vorspannfläche sofort entfernt; die Einblendungen im Auftakt merken das am fehlenden `[data-vorspann="an"]` und stehen fertig da. |
| `fokuswerk-seitenwechsel` (headEnd) | `@view-transition { navigation: auto }` zieht auch den Dokumentwechsel in den Übergang. Die alte Seite bleibt **deckend stehen**, die neue blendet darüber auf und steigt 16 px (0,46 s, `cubic-bezier(.16,1,.3,1)`). Framers Regeln kommen später in den Kopf, deshalb `!important`. |
| `fokuswerk-seitenwechsel-takt` (headEnd) | `pageswap`: steht das Menü offen, wird der Übergang übersprungen (Safari verliert `backdrop-filter` im Standbild, siehe Notiz vom 06.10.). |

Warum die alte Seite **nicht** mit ausblendet: Zwei halbdurchsichtige Lagen übereinander lassen den
Grund durchscheinen — das ist der helle Blitz, den man als „erst weiß" sieht. Bleibt die alte Lage
deckend und die neue blendet darüber auf, ist der Bildschirm in jedem Bild voll gedeckt.

**Nachgemessen (Handy 390 px, Startseite → /leistungen/websites, Klick auf eine Leistungskarte):**
alte Seite steht bis +142 ms unverändert, ab ~+395 ms blendet die neue auf, bei ~+700 ms ist sie
da. Kein weißes Bild, kein grauer Vorspann, Scrollstand oben. Beim Wechsel über Framers eigene
Verweise (Fuß → /kontakt) dasselbe Bild, nur beginnt die Überblendung später (~+509 ms), weil
Framer erst die Seitendaten holt.

**Fallstrick beim Nachmessen:** Ein Prüfskript, das den Link erst per `scrollIntoView` ins Bild
holt und im selben Tick klickt, zerstört die Aufnahme — der Sanftscroll läuft dann noch, und das
Standbild der alten Seite kommt leer. Vor dem Klick zwei Sekunden warten.

### Lichtstrahl der Abschlusskarte, Handy (16.10.2026)

Meldung mit Bildschirmfoto vom iPhone: Auf der Abschlusskarte („Reden wir über Ihre Zahlen") lag
ein harter orangener Keil über der ganzen Fläche, der Text war kaum lesbar.

Der Keil ist der **Strahl** — ein `conic-gradient` von 1.200 px (Startseite) bis 3.000 px
(Unterseiten), der sich dreht. Sichtbar sein soll davon nur die 2-px-Kante des Rahmens
(`overflow: clip` + 22 px Radius). Nicht nachstellbar in Chromium, in WebKit (Playwright) und in
echtem Safari im iOS-Simulator (iPhone 17) — dort läuft die Kante sauber. Safari schneidet einen
laufend gedrehten Verlauf an einer gerundeten Kante aber nicht auf jedem Gerät/Stand zuverlässig
ab; bricht er aus, liegt der ganze Verlauf über der Karte.

Erster Versuch war, den Strahl auf dem Handy einfach abzuschalten. Rückmeldung: „ich hätte
trotzdem gerne, dass es auf dem Handy rumläuft." Also stattdessen so gebaut, dass er gar nicht
mehr ausbrechen **kann** (`<style id="fokuswerk-lichtstrahl">`):

- **Ringmaske auf der Ebene „Mitte"** (dort liegt der Strahl): zwei Maskenebenen, eine auf dem
  Inhaltsrahmen, eine auf dem ganzen Kasten, per `mask-composite: exclude` bzw.
  `-webkit-mask-composite: xor` voneinander abgezogen. Gezeichnet wird dadurch nur noch der 2 px
  breite Ring — unabhängig davon, ob das Beschneiden des Rahmens hält. Eine Maske greift auch
  dort, wo `overflow: clip` + Radius versagt; das ist derselbe Mechanismus wie beim bekannten
  Safari-Griff.
- **Zusätzlich** die Maske `-webkit-radial-gradient(#fff,#000)` auf dem Rahmen (optisch ein
  Nullbild, erzwingt nur die eigene Ebene).
- **Rückfallebene:** Kann der Browser weder `mask-composite` noch `:has()`, bleibt es auf dem
  Handy bei einer ruhigen orangen Haarlinie statt beim Risiko.

Gegengeprüft nach dem Umbau: WebKit 390 px (Strahl läuft, zwei Aufnahmen im Abstand von 3,5 s
zeigen die Lichtmarke links bzw. rechts), echtes Safari im iOS-Simulator (sechs Aufnahmen: Anteil
Orange im Karteninneren konstant 2,9 %, also kein Überlaufen, bei messbarer Bewegung) und Desktop
unverändert.

### Vier Funde aus demselben Durchgang

- **Rechenbeispiel auf `/leistungen/performance-marketing`:** Die Beschriftungen (01–06) waren ein-
  oder zweizeilig, dadurch standen Zahlen und Texte auf sechs verschiedenen Höhen. Erster Versuch
  (`minHeight` zwei Zeilen auf den Beschriftungen) brachte die Zahlen auf eine Linie, der Block blieb
  aber „unaufgeräumt": die Beschriftungen brachen weiter ragged um und die Spalten endeten
  verschieden tief. Jetzt zweistufig gelöst:
  **(a)** Beschriftungen auf eine Zeile gekürzt — `02 JE ANFRAGE`, `05 JE KUNDE`, `06 KUNDENWERT`
  statt „KOSTEN PRO ANFRAGE / KOSTEN PRO KUNDE / WAS EIN KUNDE BRINGT"; die Kette liest sich dadurch
  als Rechnung. **(b)** `minHeight` wandert von der Beschriftung (jetzt eine Zeile: 12 px / 11 px) auf
  die Beschreibung (zwei Zeilen: 42 px, Handy 39 px). Damit sind alle sechs Spalten exakt gleich hoch:
  gleiche Grundlinie bei Beschriftung, Zahl und Text, gleich lange Trennlinien, gerade untere Kante —
  live nachgemessen auf 1440 / 834 / 390 px.
- **Leere Flächen in den Überblick-Karten auf `/leistungen`:** Werbung hatte 187 px, Websites 137 px
  Leerraum zwischen Text und „Typisch für". Dort sitzt jetzt je eine eigene Fahrzeugaufnahme als
  `height="1fr"` — sie füllt genau die Lücke, macht die Seite also nicht länger. Auf Tablet und
  Handy ausgeblendet (dort gibt es keine Lücke).
- **Einblick-Bild auf `/arbeiten/wandscher-oldenburg`:** Die rechte Handyaufnahme war ein Ausschnitt,
  der unten mitten durch einen Knopf schnitt und links angeschnitten war. Neu aufgenommen
  (`steinmetz-wandscher.de/anfahrt`, 375 × 811, Versatz 44 px — dort läuft keine Elementkante durch
  die untere Kante) und in denselben Rahmen gesetzt (Gerätefläche 482 × 1042 bei 259 / 104).
- **Überschrift „Sie wissen, dass online mehr drin wäre."` (Startseite, Abschnitt „Kennen Sie das?"):**
  Die erste Zeile stand in Tinte 40 %, die zweite in voller Tinte, dazu das orange Akzentwort — drei
  Farben in zwei Zeilen, das las sich unruhig. Erste Zeile jetzt ebenfalls volle Tinte; orange bleibt
  allein „anfangen". Gegengeprüft: Es ist die einzige Überschrift im Projekt mit gedämpftem Lauf,
  alle anderen mehrfarbigen Überschriften sind Grundfarbe + ein Akzentwort.
- **Wortmarke im Fuß:** lief über die volle Breite (1.176 px). Jetzt 360 px, linksbündig an der
  Inhaltskante, Deckkraft 0,13; auf dem Handy 210 px über eine Media-Query im Custom Code.

## Fallstudien ohne CMS (14.10.2026)

Framer rechnet CMS-Collections gegen den Tarif — erlaubt ist eine. Im Projekt lagen zwei:
„Ratgeber" (33 Artikel) und „Fallstudien" (3 Einträge). Der Ratgeber bleibt im CMS, weil dort
33 Artikel mit Markdown-Quellen und Importskript hängen. Die drei Fallstudien stehen jetzt als
feste Seiten — unter denselben Adressen wie vorher, also ohne Weiterleitungen:

| Seite | Inhalt |
|---|---|
| `/arbeiten/wav-westerstede` | Kfz-Werkstatt, Google Ads, 3 Kennzahlen, 2 Einblicke, kein Film |
| `/arbeiten/patio-oldenburg` | Gastronomie, 3 Kennzahlen, 3 Einblicke, Filmkarte |
| `/arbeiten/wandscher-oldenburg` | Steinmetz, 3 Kennzahlen, 2 Einblicke, Filmkarte |

Die Übersicht `/arbeiten` zeigt dieselben drei Karten, jetzt als feste Liste statt als
CMS-Liste. Texte, Bilder, Kennzahlen, Filmstandbilder und die Seitenangaben (Titel und
Beschreibung je Seite) stehen 1:1 so da wie vorher im CMS. Der komplette Inhalt der Collection
liegt als [`Fallstudien-CMS-Sicherung.json`](Fallstudien-CMS-Sicherung.json) im Ordner.

**Geprüft, nicht angenommen:** Aufnahme der neuen WAV-Seite gegen die alte CMS-Seite —
gleiche Höhe auf den Pixel genau (Desktop 1200x5979, Handy 390x7122), Unterschied nur im
JPEG-Rauschen der Navigationsleiste. Jeder belegte Wert jedes Eintrags wurde gegen die
Sicherung gegengelesen; auf allen drei Seiten steht keine CMS-Bindung mehr.

**Noch von Hand im Framer-Editor zu erledigen** — die Plugin-Schnittstelle kann das nicht:

1. Seite `/arbeiten/:slug` löschen (die alte CMS-Detailseite, steht auf Entwurf)
2. Seite `/arbeiten/:slug/copy` löschen (Arbeitskopie aus dem Umbau, steht auf Entwurf)
3. Collection „Fallstudien" löschen — **erst danach** zählt das Projekt eine Collection

Eine neue Fallstudie heißt ab jetzt: eine der drei Seiten im Editor duplizieren, Pfad beim
Anlegen setzen und Texte austauschen. Kein CMS-Eintrag mehr.

### Fallstudien an die Hausbausteine angeschlossen (15.10.2026)

Rückmeldung: *„bei den Fallstudien kann das noch etwas geiler werden, noch hochwertiger — die
Seite sticht etwas raus optisch von den anderen."* Ein erster Versuch (Geisterwort im Kopf,
Randnotizen in der Marken-Spalte, vergrößerte Lead-Absätze) wurde verworfen: *„nochmal neu. Das
muss von den Elementen mehr zum Rest der Seite passen."* Alles davon ist zurückgenommen.

Statt eigener Gestaltung dann der Abgleich, **woraus der Rest der Seite tatsächlich besteht** —
und da lagen zwei messbare Brüche:

**1. Eigene Textstile.** Die Fallstudien benutzten zwei Stile, die es sonst nirgends im Projekt
gibt, und keinen der prägenden Hausstile:

| | Fallstudie vorher | Rest der Seite |
|---|---|---|
| Überschrift | `Artikel H1` — 64/48/36 px | `Display` — 84/56/30 px |
| Fließtext | `Artikel Text` — 19 px, 1,66 em | `Fließtext` — 18 px, 1,58 em |

Minimal andere Werte, die genau deshalb wie ein Fremdkörper wirken. Beide Stile sind auf allen
drei Seiten gegen die Hausstile getauscht.

**2. Keine Hausbausteine.** Die Startseite läuft über Netzfeld, Fokusklammer, Auftaktleiste,
Kundenrad, Leistungsbühne, Arbeitsschau, Lichtfeld; die Fallstudien nutzten davon nur Lichtfeld,
Knopf und Telefonnummer — alles andere war handgebaut. Jetzt tragen sie zwei Hauselemente mit:

- **Fokusklammer** im Kopf, dasselbe Markenelement wie im Auftakt der Startseite: orange
  Eckwinkel, die sich auf ein Wort der Überschrift legen — „Westerstede", „Patio", „Wandscher".
- **Belegzahlen** statt der eigenen dunklen Zahlenkarte: derselbe Baustein wie im
  Ergebnisse-Abschnitt der Startseite, offen mit Haarlinien, hochzählend, Quelle einmal darunter.

**Marke über dem Zahlenband (15.10.2026):** Die drei Zahlen standen ohne Überschrift in der
Fläche — *„das ist da so verloren."* Direkt darüber endet der Website-Screenshot des Kunden, auf
dem dessen eigener Abschnittstitel „WAV IN ZAHLEN" steht; unsere Zahlen hatten dagegen nichts.
Jetzt trägt der Abschnitt auf allen drei Fallstudien die Marke **„[ WAS DABEI HERAUSKAM ]"**,
zentriert wie jede Marken-Zeile im Rest der Seite, und die Quellenangabe darunter steht
ebenfalls mittig. Die Zahlen selbst bleiben linksbündig in ihren Spalten — so wie im
Ergebnisse-Abschnitt der Startseite.

**Filmkarte gefüllt (15.10.2026):** Bei Patio und Wandscher stand ein hochkantes Video (380 px)
allein in einer 1136 px breiten Karte — links und rechts je 378 px leeres Punktraster,
*„da ist nur ein Video drin."* Die Karte läuft jetzt zweispaltig: Video links, rechts Titel und
Text, der erklärt, was man sieht. Patio: „Jede neue Karte bekommt ihren Film". Wandscher: „Ein
Film über eine Baustelle" — mit der belegten Zahl 17.100 Aufrufe ohne Werbebudget. Die
Beschriftung im Film-Baustein ist dafür geleert, sie stand sonst doppelt. Auf Tablet und Handy
bleibt die Karte einspaltig (Video oben, Text darunter).

**Durchgang über alle drei Seiten (15.10.2026), dabei behoben:**

- Patio-Einblicke zeigten noch das alte Tischfoto mit dem schwarzen Balken — gegen die saubere
  Fassung getauscht (dieselbe wie auf der Startseite).
- Patio-Zahlenband hatte die schwächste Zahl in der Mitte (69 · 290.000 · +632 %). Jetzt steht
  sie hinten: 69 · +632 % · 290.000.
- Die Metazeile unter dem Kopf (Ort · Zeitraum · Leistungen) klebte auf dem Handy beim Umbruch
  zusammen — Zeilenabstand von 6 auf 10 px.

**Zahlenblock mittig (15.10.2026):** Die Marke stand zentriert über linksbündigen Zahlen —
*„das steht da immer noch so komisch, als ob das da nicht hingehört."* Stimmt: Eine zentrierte
Überschrift über linksbündigem Inhalt gehört optisch zu nichts. Der Baustein `Belegzahlen.tsx`
hat jetzt einen Schalter **Mittig**; auf den Fallstudien stehen Marke, Zahl, Label und Quelle auf
derselben Achse, auf der Startseite bleibt der Block linksbündig (dort läuft er neben dem Zitat).

**Noch ein Letterbox-Bild gefunden:** Das mittlere Einblick-Bild bei Patio (Standbild aus dem
Sparkling-Bubbles-Film) hatte links einen schwarzen Balken — derselbe Exportfehler wie beim
Tischfoto. Ersetzt durch das saubere Standbild aus `Medien/patio-sparkling-bubbles-standbild.jpg`
(1080 × 1920), neu hochgeladen als `uUmyq2goEcfR4TpBpK08bslLFE.jpg`.

**Bewusst nicht geändert:** Die Marken im Textteil (`[ AUSGANGSLAGE ]`, `[ VORGEHEN ]`,
`[ ERGEBNIS ]`) stehen links neben der Lesespalte, während der Rest der Seite Marken zentriert
über den Abschnitt setzt. Das ist hier Absicht: Der Textteil ist eine Lesestrecke, und die
Randspalte hält den Blick an der Textkante.

Was offen bleibt: Der Textteil hat weiterhin kein Bild zwischen den Blöcken, und von WAV und
Patio liegt kein freigegebenes Kundenzitat vor.

### Fünf Grenzen, die Framer dabei setzt

- **Der Pfad einer Seite lässt sich nicht ändern.** Eine duplizierte CMS-Detailseite bleibt
  CMS-Detailseite: die `collectionId` klebt an der Seite, `SET path=...` wird mit „CMS detail
  page paths must include exactly one slug segment" abgewiesen, `setAttributes` ignoriert die
  Änderung stillschweigend. Statische Seiten müssen also neu angelegt werden.
- **Seiten lassen sich über die Schnittstelle nicht löschen** („WebPageNode deletion is not
  supported"). Nur Entwurf setzen — löschen geht nur im Editor.
- **`DUPE` kopiert nur den Desktop-Stand.** Tablet- und Handy-Abweichungen bleiben zurück und
  müssen einzeln nachgezogen werden: hier 20 (Tablet) und 43 (Handy) Werte je Seite, aus dem
  Vergleich Quelle-Desktop gegen Quelle-Breakpoint.
- **Beim Lösen einer Wiederholung verschwinden die Bindungen.** `repeat.variable="null"` räumt
  die gebundenen Attribute in den Kopien mit weg. Reihenfolge also: kopieren, lösen, danach die
  Werte positionsweise setzen (Pfad im Baum als Schlüssel).
  Eine CMS-Liste lässt sich gar nicht lösen — `collectionList="null"` wird abgewiesen. Der Weg
  ist: neuen Rahmen daneben bauen, Karten hineinschieben, alte Liste löschen.
- **Fließtext aus dem CMS braucht nach dem Lösen einen eigenen Stil.** Die Per-Tag-Stile
  (`stylePresetParagraph`) gelten nur für gebundenen Text; statischer Text nimmt
  `textStylePreset`. Ohne das fällt der Absatz auf Inter 16 px Schwarz zurück.

## Quelltexte der Code-Bausteine

Alle Code-Komponenten liegen zusätzlich als Datei in [`code/`](code/) — Framer ist die Quelle
für den Live-Stand, der Ordner ist die Sicherung und macht Änderungen nachvollziehbar.

| Datei | Zweck |
|---|---|
| `Netzfeld.tsx` | Netz im Auftakt (Spector-Mesh, Wölbung am Zeiger) |
| `Kundenrad.tsx` | Kundenlogos auf einem 3D-Ring |
| `Leistungsfelder.tsx` | Drei Leistungsfelder (Homy-Prinzip), Akkordeon auf dem Handy |
| `Arbeitsraster.tsx` | Umschalter Websites/Kampagnen: 3×2-Raster mit wachsender Kachel bzw. Anzeigenvorschauen mit Kennzahlen |
| `Pfeil.tsx` | Langer Pfeil für Knöpfe und Links |
| `Navigation.tsx` | Override: Leiste erst nach 40 px Scroll, vorher transparent |
| `Glaskante.tsx` | Flüssiges Glas am unteren Rand (progressive Unschärfe, Tönung folgt dem Abschnitt, Brechung in Chromium); blendet am Seitenende aus |
| `Sanftscroll.tsx` | Ersetzt Framers „Smooth Scroll“ (Lenis): neue Seite startet oben, Anker fahren den Abschnitt an |
| `Auftaktbewegung.tsx` | Overrides im Auftakt: Einblenden + scrollgebundenes Zurücktreten (Karte, Foto-Zoom, Zeilen driften) |
| `Systemkette.tsx` | Positionierung: vier Bausteine setzen sich beim Scrollen zur Kette zusammen (Beispielwerte) |
| `Leistungsbuehne.tsx` | Leistungen: drei Karten mit Szenen (Anzeigen-Stapel, echte Seiten im Browser, Filmstreifen) |
| `Szenenkarte.tsx` | Szene aus der Leistungsbühne als Bildkarte für die Köpfe der Leistungsseiten |
| `Fokusklammer.tsx` | AF-Klammern, die sich im Auftakt auf „System.“ legen |
| `Auftaktleiste.tsx` | Scroll-Hinweis + drei belegte Ergebnisse unten im Auftakt |
| `Vorspann.tsx` | Ladeanimation beim ersten Laden (Logo + Fokus-Klammern + Ladelinie), Signal an den Auftakt |
| `Lichtfeld.tsx` | Abschluss-Hintergrund: Punktraster, das unter einem Lichtkegel am Zeiger aufleuchtet |

Einspielen: `framer.getCodeFiles()` → `datei.setFileContent(code)`, vorher
`framer.typecheckCode(name, code)`.

## Handy-Durchgang 06.10.2026 (iOS-Simulator, iPhone 17)

Die Startseite auf dem Handy durchgescrollt und die Befunde abgearbeitet. Behoben:

| Stelle | Befund | Behebung |
|---|---|---|
| Kundenrad | alle Logo-Kacheln blieben leer | `loading="lazy"` raus — im 3D-Transform rechnet iOS Safari die Lage falsch und lädt nie |
| Systemkette | vier Schritte mit je drei Zeilen Fließtext = Textwand | auf dem Handy nur Nummer, Titel, Kennzahl; der Abschnitt darunter sagt es in ganzen Sätzen |
| Arbeitsschau, alle Köpfe | Untertitel nach zwei Zeilen mit „…“ abgeschnitten | Zeilenbegrenzung entfernt, Kachelhöhen entsprechend nachgezogen |
| Arbeitsschau, Instagram | Story-Vollbild mit Knopf im Foto — als Instagram-Anzeige nicht erkennbar | echte Feed-Anzeige: Kopfzeile, Motiv, Handlungsbalken, Aktionsleiste, „Gefällt … Mal“, Bildtext; Post an die Kachelhöhe gebunden |
| Arbeitsschau, Trichter | „Impressionen“ lief unter den Balken | auf dem Handy Beschriftung über dem Balken, Quote rechts daneben |
| Arbeitsschau, Filmstreifen | Kopftext unlesbar auf hellem Motiv | Verlauf oben kräftiger, Titel und Untertitel mit Schatten |
| Arbeitsschau, WAV-Browser | „Zum Durchscrollen überfahren“ ohne Mauszeiger, Öffnen-Knopf unsichtbar | eigener Handy-Text, Knopf dort dauerhaft sichtbar |
| Leistungsbühne, Anzeige | „WERKSTATT-HARMS.DE“ überlappte „Termin anfragen“ | Domain bricht nicht mehr um |
| Leistungsbühne, Websites | drei Pillen stapelten sich über die Browser-Vorschau | auf dem Handy weg — dieselben Punkte stehen als Liste in der Karte |
| sieben Abschnitte | halb verdeckte Riesenüberschriften („Kunden“, „Leistungen“, …) | auf dem Handy ausgeblendet; das Marke-Etikett führt |

### Conversion-Durchgang 06.10.2026

Auf die Frage „trägt die Seite jemanden bis zur Anfrage?“ zuerst gemessen statt geraten
(iPhone-Viewport 375 × 812):

| | vorher | nachher |
|---|---|---|
| Seitenlänge | 18.142 px (22,3 Bildschirme) | 15.835 px (19,5) |
| Abschnitt „Arbeiten“ | 5.053 px (6,2 Bildschirme) | 3,4 Bildschirme |
| Strecke ohne Handlungsaufruf | **18,8 Bildschirme** (518 px → 15.773 px) | keine |

Der teuerste Befund war die mittlere Zeile: Zwischen dem Knopf im Auftakt und dem nächsten im
Abschluss lagen 18,8 Bildschirme. Wer bei „Arbeiten“ überzeugt war, musste zehn Bildschirme
weiterscrollen, um sich melden zu können.

**Gebaut:**

- `Handlungsleiste.tsx` — feste Leiste am unteren Rand, nur unter 810 px Fensterbreite. Fährt
  ein, sobald der Auftakt oben raus ist, und zieht sich zurück, sobald `#kontakt` im Bild ist
  (dort stehen die eigentlichen Knöpfe). Links „Anrufen“ als `tel:`-Link, rechts
  „Projekt besprechen“ nach `/kontakt`. Beachtet `env(safe-area-inset-bottom)`.
  Liegt als Instanz `MWX6jdoOO` im Desktop-Breakpoint der Startseite — sie blendet sich selbst
  nach Fensterbreite aus, deshalb genügt eine Instanz für alle Breakpoints.
- Arbeitsschau zeigt auf dem Handy erst vier Kacheln, dann „Weitere 6 Arbeiten zeigen“.
- Arbeitsschau rechnet vor der ersten Messung mit der Fensterbreite statt pauschal 1200 px —
  vorher rendete sie kurz alle zehn Kacheln in Desktop-Breite und sprang dann zurecht.

### Hydration-Fehler 06.10.2026 — behoben

Nach dem Versuch, den Layout-Sprung der Arbeitsschau zu vermeiden, stand die halbe Startseite
still: Der Auftakt blieb unscharf (`blur(20px)` eingefroren), alle Zähler zeigten `+0 %`,
scrollgebundene Overrides reagierten nicht. In der Konsole: **React #418 / #422**,
Server/Client-Mismatch, ausgelöst am „Weitere Arbeiten zeigen"-Knopf in `Arbeitsschau.mjs`.

Ursache: `window.innerWidth` bzw. `window.matchMedia` wurden **beim ersten Rendern** gelesen.
Der Server kennt kein `window` und rendert Desktop (kein Knopf), der Browser rendert Handy
(Knopf) — React verwirft daraufhin den Baum, und Komponenten, die damit nichts zu tun haben,
bleiben auf dem Server-Stand hängen.

Richtig ist ein `montiert`-Flag: Server und erster Client-Durchlauf liefern dasselbe, erst der
Effekt danach misst. Betraf `Arbeitsschau.tsx` (Spaltenzahl) und `Auftaktbewegung.tsx`
(`useSchmal`). Der kurze Layout-Sprung beim Laden ist der Preis dafür.

**Merke:** Im iOS-Simulator sieht man nur das Symptom. Solche Fehler findet man nur im Browser
mit Konsolenzugriff — mobilen Viewport setzen und auf `Minified React error` filtern.

### Überschriften: zurück auf den Originalstil

Die „Geisterzeilen" (56–84 px, 7–16 % Deckkraft, auf 40–60 px Höhe beschnitten) sind der
gewünschte Look und bleiben so. Der Zwischenstand mit 30-px-Überschriften in voller Farbe war
nicht erwünscht und ist zurückgenommen.

### Menü: Choreografie und Logo-Sprung (06.10.2026)

Das Overlay lebt in `FixedOverlayNode [Syy0trUD3]`. Die Einblendzeiten waren so:

| Teil | Start | Dauer | fertig bei |
|---|---|---|---|
| Glas (grauer Grund) | 0 s | 1,5 s | 1,50 s |
| Kopf | 0,55 s | 0,7 s | 1,25 s |
| Logo | 0,55 s | 1,6 s | 2,15 s |
| Fuß | 0,8 s | 0,8 s | 1,60 s |
| **Menüpunkte** | — | **gar keiner** | **sofort** |

Daher der Eindruck „nicht gleichmäßig": Die Menüpunkte hatten keinen Effekt und standen vor dem
grauen Grund da, und bis alles saß vergingen 2,15 s. Jetzt in Reihenfolge und unter einer halben
Sekunde: Glas 0,3 s → Kopf 0,06/0,28 → Liste 0,10/0,30 mit `stagger 0.025s` → Fuß 0,20/0,28.
Das Glas blendet nur noch ein, statt 1600 px weit anzufahren.

**Der Logo-Sprung hatte zwei Ursachen:**

1. Der Kopf des Overlays trug auf dem Handy `padding: 18px 20px` — die Marke saß bei x=20/y=23,
   die der Leiste bei x=32/y=33. Jetzt `28px 32px`, beide liegen übereinander.
2. Die Navigationsleiste selbst wechselt beim Scrollen die Variante: `Oben` hat `padding: 28px`,
   `Leiste` hatte `20px` — die Wortmarke sprang also schon beim bloßen Scrollen 8 px hoch, und
   das Overlay konnte nicht beiden Positionen folgen. Beide Varianten stehen jetzt auf 28 px
   (`er7vQ1cVw`).

Gemessen über alle drei Wege — Startseite oben, Startseite gescrollt, Unterseite: Versatz
Leiste↔Overlay jeweils **0/0**, Schließkreuz rechtsbündig bei 32 px wie der MENÜ-Knopf,
Menüpunkte und Kontaktdaten bei 32 px.

**Nachtrag — Öffnen fühlte sich an wie ein Hänger, Schließen überlagerte die neue Seite:**

Beim Öffnen war das Glas nach 0,26 s da, der Inhalt startete aber erst bei 0,55–0,8 s — dazwischen
stand ein leerer grauer Bildschirm.

Zwischenstand (Inhalt ab 0,02–0,06 s, fertig bei 0,40 s) war noch nicht genug: Gemessen erreicht
das Glas durch die stark anziehende Kurve `0.22,1,0.36,1` schon nach **104 ms 89 % Deckkraft**,
während die letzte Menüzeile erst bei 400 ms stand. Diese 140 ms spürt man als Nachlauf.
Jetzt starten Glas, Kopf und Liste alle bei 0 s, die Staffel ist auf 0,012 s herunter und der
Weg von unten auf 6 px: letzte Zeile fertig bei 0,26 s, Glas bei 0,22 s — faktisch gleichauf.

Beim Schließen war es gravierender: Das Glas brauchte `0.6s` Dauer plus `0.1s` Verzögerung und
fuhr dabei 1600 px nach rechts — und **die Menüpunkte hatten überhaupt keinen Exit-Effekt**.
Die neue Seite lädt nach rund 250 ms, das Menü lag also noch darüber. Daher „kurz alles
doppelt". Jetzt blendet alles in 0,16 s aus, das Glas in 0,2 s — nach 0,24 s ist das Menü weg,
bevor die neue Seite erscheint.

**Warum „Texte kommen zu spät" nicht über die Texte zu lösen war:** Gemessen haben die Menüzeilen
ab 6 ms durchgehend volle Deckkraft — sie werden gar nicht verzögert eingeblendet. Sichtbar
werden sie erst, wenn das Glas dahinter deckt: heller Text auf hellem Seitengrund. Ihre eigene
Dauer zu kürzen brachte deshalb nichts. Der Hebel ist allein das Glas, jetzt 0,13 s statt 0,22 s:
80 % Deckung nach 31 ms statt 85 ms, 95 % nach 62 ms statt 140 ms.

**Und warum auch das Glas-Timing nichts half — die eigentliche Ursache:** Gemessen ab
Fingerkontakt ist der Klick nach 2 ms registriert, das Glas nach 24 ms im DOM und nach 110 ms
voll. Da ist technisch nichts zu holen. Das Glas war aber `rgba(53,53,53,0.72)` mit
`backdrop-filter: blur(40px)` — nur 72 % deckend, und Safari braucht für einen 40-px-Blur über
den ganzen Bildschirm mehrere Frames *nach* dem Ende der Deckkraft-Animation. Bis dahin scheint
die helle Seite durch und die weißen Menütexte stehen auf schwachem Kontrast. Auf dem Handy
jetzt 94 % Deckung und kein Hintergrund-Blur (`WQlUT7pJkBND1pXN03`) — der Kontrast steht sofort.
Das DSL-Attribut heißt `backgroundBlur`, nicht `backdropFilter`.

**Endstand 06.10. abends — Bauwerk-Ablauf, nur schneller (Version `0ba56f93a`):**
Das deckende Grau war falsch, gewünscht ist Bauwerks Glasfahrt. Bauwerk per Sampler
nachgemessen (Handy, 375 px): **Glas und Inhalt sind ein Panel** und fahren gemeinsam von
rechts rein (`translateX 100 % → 0`, ~2 s, Ease-out wie `0.16,1,0.3,1`), Glas `30 %` Tönung +
`blur(40px)`. Die Menüpunkte sitzen *auf* dem Panel und sind deshalb vom ersten Frame an
sichtbar; zusätzlich steigen sie gestaffelt aus `overflow: hidden`-Masken (~0,1 s Staffel),
der Fuß blendet zuletzt ein.

**Die eigentliche Ursache für „Text kommt zu spät":** Die Menüpunkt-Instanzen (`U904Ypyyp`,
`Wf38hkLku`, `SJHK8g8it`, `UsMcgwKt0`, `wHEHW7Omt`, `YLEK6re4v`, je Breakpoint mit Präfix
`WQlUT7pJk`/`nTupyIOA7`) hatten ein eigenes Steigen aus der Maske: `y 96`, **1,25 s, Start erst
bei 0,38–0,73 s**. Alle früheren Messungen haben nur die Deckkraft geprüft — die war ja 1 —
und das Steigen übersehen. Das Glas lief außerdem getrennt vom Inhalt.

Jetzt auf allen drei Breakpoints:

| Teil | Effekt |
|---|---|
| Glas `BND1pXN03` | `rgba(53,53,53,.72)` + 40 px Blur, fährt `x 400/1200/1600 → 0` (Handy/Tablet/Desktop) in 0,9 s |
| Inhalt `Zs2um6APD` | fährt identisch mit dem Glas, Exit 0,16 s Ausblenden |
| Kopf, Liste | kein eigener Effekt mehr (reiten auf dem Panel) |
| Menüzeilen | steigen aus der Maske, `y 44` (Handy) bzw. `72`, 0,75 s, Start 0 / 0,04 / … / 0,20 s |
| Fuß, Logo | Einblenden ab 0,25 s bzw. 0,2 s |

Live gemessen (Chromium, 375 px): Glas nach ~0,1 s halb drin, erste Zeile steigt ab Frame 1 mit.
Ein deckender Grund (Zwischenstand) wirkte „billig" — nicht wieder einführen.

**Nachtrag — Antippen eines Menüpunkts ließ das Glas „zerfallen" (Version `5c6988b1f`):**
Im Simulator-Video (30 fps) verlor das Glas im ersten Bild nach dem Tippen die Unschärfe, die
Seite stand gestochen scharf unter den weißen Menütexten, dann blendete alles aus. Ursache ist
**nicht** der Exit-Effekt, sondern Framers Seitenwechsel per `document.startViewTransition`:
der Browser fotografiert die alte Seite ab und blendet das Standbild aus — Safari nimmt
`backdrop-filter` nicht mit ins Standbild. Lösung im Custom Code (`headEnd`,
`<script id="fokuswerk-menue-wechsel">`): Liegt beim Seitenwechsel ein Knoten
`[data-framer-name="Glas"]` im DOM (Menü offen), wird `skipTransition()` gerufen. Die neue Seite
liegt sofort darunter, das echte Menü fährt mit Unschärfe nach rechts heraus. Alle anderen
Seitenwechsel behalten die Überblendung.

Dazu der Exit wie bei Bauwerk: Glas und Inhalt fahren in 0,38 s (`0.7,0,0.84,0`) nach rechts
heraus, **ohne** Deckkraft-Änderung (Ausblenden kostet in Safari ebenfalls die Unschärfe);
Kopf, Liste, Fuß, Menüzeilen haben keinen eigenen Exit mehr. Einfahrt jetzt 1,2 s, Zeilen 0,95 s
mit 0,05 s Staffel. Gemessen im Video: Tipp → 5 Bilder Glas mit Unschärfe + orangem Punkt →
neue Seite darunter, Panel nach ~0,2 s draußen.

**Runde 07.10.2026 — Bauwerk-Wertigkeit, flüssig auf dem Handy, PageSpeed (Version `15714aa58`):**

*Warum es ruckelte:* Framers Appear-Effekte setzen `transform` per JavaScript in jedem Bild
(gemessen: keine einzige WAAPI-Animation, nur Inline-Styles). Ist das Handy kurz beschäftigt,
hakt die Fahrt. Deshalb laufen **Ein- und Ausfahrt jetzt als CSS-Animationen** aus dem Custom
Code (`<style id="fokuswerk-menue">`) — die rechnet die Grafikkarte. Framer-Effekte der Menü-
Ebenen: `enter = null`, `exit` hält das Overlay nur 0,7 s im DOM (ohne Bewegung).

| Teil | CSS |
|---|---|
| Glas + Inhalt | `translateX(100% → 0)` 1,5 s `cubic-bezier(.16,1,.3,1)` |
| Zeilen | steigen aus der Maske `translateY(108% → 0)` 1,15 s, Start 0,12 s, Staffel 0,06 s |
| Fuß / Logo | Einblenden + 18 px, ab 0,55 s |
| Schließen | `html.fw-menue-zu` (gesetzt per `pointerup` auf ✕/Link im Menü) → nach rechts, 0,45 s |

*Wertigkeit wie Bauwerk:* Glas `rgba(22,20,19,.5)` + `blur(40px) saturate(150%)` statt flachem
Grau 72 % — die Farben des Auftakts leuchten verschwommen durch. Liste luftiger (Abstand
12/14/18 px), Textstil „Menü“ Inter **400** statt 500, `-0.035em`, Zeilenhöhe 1,14.

*Vorspann (`code/Vorspann.tsx`):* Balken und Prozentzahl per Ref statt React-State, alle
Bewegungen als `transform`-Strings (Motion gibt sie an WAAPI ab), Feder durch Kurve ersetzt,
Mindestzeit 1,1 s, höchstens 0,3 s Warten auf Bilder (vorher bis 3,8 s). Neu: graue Vorfläche
im Custom Code (`<style id="fokuswerk-vorhang">`, `html:not(.fw-vorspann-da)::after`) — vorher
blitzte die Seite kurz auf, bevor der Vorspann per JS erschien.

*PageSpeed:* Der Wert der `framer.app`-Vorschau ist verfälscht — dort lädt Framer den
Bearbeiten-Stift mit **4,2 MB / 334 Anfragen** (auf eigener Domain nicht, gegengeprüft an
wav-wst.de). SEO 69 = ausschließlich `noindex`. Lighthouse mobil mit gesperrtem Editor (wie live):
Leistung 88–90, LCP 1,2 s, TBT 200–280 ms, Barrierefreiheit 96, Best Practices 96.
Lazy-Loading ergänzt in `Arbeitsschau.tsx` (2 Bilder) und `Arbeitsraster.tsx` (Logos);
das Kundenrad bewusst ohne (3D-Transform, iOS lädt sonst nie).

**Nachtrag 07.10. — PageSpeed-Streuung und Kontrast (Version `997f21189`):**
- *LCP sprang zwischen 1,2 s und 6–7 s.* LCP-Element ist der Untertitel im Auftakt. Im SSR-HTML
  ist er sichtbar (nur unscharf), nach der Hydration setzte `Auftaktbewegung.tsx` ihn auf dem
  Handy auf Deckkraft **0** bis nach dem Vorspann → je nach Messung zählte das späte Einblenden.
  Jetzt startet er auf dem Handy bei 8 % (unter dem Vorspann unsichtbar). Drei Läufe danach:
  Leistung 86/90/90, LCP 1,2–1,4 s — auch *mit* Editor.
- *Kontrastfehler (Barrierefreiheit 96):* gemeldet wurden die orangen Wisch-Kopien
  („Beschriftung Farbe“) in Knopf, Verweis, Navpunkt, Menüpunkt — per Maske versteckt, das
  versteht die Prüfung nicht. Ruhezustand jetzt `opacity 0`, Hover-Varianten `1` (20 Knoten).
  Barrierefreiheit 100.
- *Bearbeiten-Stift:* auf `framer.app`-Adressen laut Framer-Hilfe für **alle** Besucher, nicht
  abschaltbar; auf eigener Domain nur für Projektmitglieder. PageSpeed auf der Vorschau rechnet
  dessen Skripte (castleSDK, render-*.mjs, ~4 MB) in die Blockierzeit ein.
- *SEO 69:* nur `noindex` (Meta + `x-robots-tag`), gewollt bis zum Livegang.

**Speed-Runde 07.10. vormittags (Version `d63fdf45c`):**
PageSpeed zeigte 32–35 (LCP 7 s, Speed Index 14 s). Ursache: Der Vorspann war eine
Code-Komponente und startete erst nach dem Hochfahren von Framer. Mit der grauen Vorfläche
stand die Seite auf langsamen Geräten so lange grau, wie das JavaScript brauchte.
- **Vorspann jetzt reines HTML/CSS** im Custom Code (`code/custom/vorspann-head.html` → headEnd,
  `code/custom/vorspann-body.html` → bodyStart). Läuft ab dem ersten Bild auf fester Zeitachse
  (fertig nach ~2,1 s, kurze Fassung ×0,45 ab dem zweiten Aufruf), Prozentzahl per Inline-Skript
  (Safari animiert CSS-Zahlen nur sprunghaft), Signal `fokuswerk:vorspann-ende` nach 1,52 s.
  Die Code-Komponente `Vorspann` ist aus dem Layout entfernt (`DEL uRrlXRcSC`), die Datei bleibt
  als Sicherung.
- **Auftakt fertig im HTML:** `useEinblenden` startet bei 1. Läuft der Vorspann beim Hochfahren
  noch, wird unter ihm auf 0 gesetzt und eingeblendet; ist er schon weg, bleibt der Text stehen.
- Ergebniszahlen und Fokus-Klammern kommen früher (Zählen 1,0 s statt 1,6 s, Klammern 0,7 s).
- Lighthouse mobil mit CPU-Drosselung ×14 (≈ PageSpeed-Rechner), *mit* Editor: 67–71,
  LCP 1,3–1,5 s, TBT 1,1–1,5 s. Rest-Blockierzeit = Hochfahren der Seite (eine Aufgabe ~1,1 s:
  React/Motion), Speed Index begrenzt durch Endlos-Animationen im Auftakt (Scroll-Hinweis).

**PageSpeed auf framer.app — Beweis für die Editor-Kette (07.10., 10:00):** PageSpeed selbst
ausgelesen: LCP-Element = Untertitel, *beobachtet* nach 10 ms TTFB + 700 ms Darstellung. Der
simulierte LCP von 6,7–8,3 s kommt aus dem „Netzwerkabhängigkeitsbaum“: kritischer Pfad 6.850 ms
über `canvas-sandbox-on-page.mjs`, `canvas-sa….css` (app.framerstatic.com) und React von
`site-….framercanvas.com` — Framers On-Page-Editor, der auf framer.app für alle Besucher lädt
(im Lauf öffnet sich sogar sein Dialog „Edit page“). Auf eigener Domain lädt er nicht.
Außerdem: Netz (`Netzfeld.tsx`) auf Touch/Handy aus, Scroll-Hinweis läuft 3× statt endlos.
Stand unter PSI-Drosselung (×14): 67–71, TBT 1,1–1,5 s (Hydration der Startseite).

**Startseite verschlankt + Grundlast-Test (07.10., Version `30a34028e`):**
- *Doppelte Ausgabe:* Framer liefert Blöcke, die je Breakpoint abweichen, mehrfach aus
  (`ssr-variant`). Fuß: Handy nutzt jetzt dieselbe Variante „Fußzeile“ wie Tablet/Desktop, die
  einzige Abweichung (Rechtliches untereinander) macht CSS im Custom Code (`fokuswerk-fuss`).
  Systemkette: Handy-Texte („4 von 100 Besuchern…“) auf alle Breakpoints übernommen (per
  `node.setAttributes({controls})`, die DSL kann keine Objekt-Listen). Ergebnis: SSR-HTML
  2.025 → 1.757 Elemente, auf dem Handy unsichtbar ausgeliefert 472 → 204, −49 KB.
- *Lichtfeld* rechnet nur noch im Bild (IntersectionObserver) — Hauptthread nach dem Laden −30 %.
- *Grundlast-Test:* Kunden, Leistungen, Arbeiten auf dem Handy testweise ausgeblendet (DOM
  1.269 → 696): Gesamt-Rechenzeit −35 %, **Blockierzeit unverändert 1,40 s, Note 70**. Die
  Blockierzeit ist Framers Laufzeit beim Start (React/Motion), nicht unser Inhalt — weiteres
  Streichen von Inhalten bringt für PageSpeed nichts. Sichtbarkeit danach wiederhergestellt.
- Hydration betrifft die unsichtbaren ssr-Varianten nicht (DOM im Browser vorher wie nachher
  ~1.270) — die Doppelungen kosteten nur Ladegröße.

**Bestwerte-Runde 07.10. (Version `7fb9314fe`):**
- *Editor auf der Vorschau aus:* `code/custom/editor-vorschau-head-start.html` (headStart). Nur auf
  `*.framer.app` schreibt ein Inline-Skript eine Import-Map, die `https://framer.com/edit/init.mjs`
  auf ein leeres Modul umleitet. Framer lädt den Editor sonst für JEDEN Besucher (Code in
  `script_main`: `EditorBar: … import("https://framer.com/edit/init.mjs")`, Ausnahme nur Bot-UA).
  Auf fokuswerk.de greift die Map nicht. Effekt bei Google: kritischer Pfad 6.850 → 510 ms.
- *Bilder erst bei Annäherung:* Leistungsbühne lädt Hintergründe/Bilder erst ab 900 px Abstand
  (Context `BilderAn`, Platzhalter grau). Beim Laden 2 statt 12 dieser Bilder.
- *Kundenlogos:* `?scale-down-to=512` statt 2500×1000-Original (44 KB → 3,7 KB je Logo),
  `fetchPriority="low"`, weiterhin ohne lazy (3D-Ring).
- *Vorspann-Logo* ohne Preload, verkleinerte Fassung.
- *Schrift:* Textstil „Menü“ lief seit der Bauwerk-Runde auf Google-Fonts-Inter (112 KB beim
  Laden). Jetzt Framers Inter (`fontName="Inter" fontWeight="400"` per DSL, Selektor `Inter`).
- *PageSpeed bei Google:* Handy 34 → 58–70 (streut ±10, Blockierzeit 60–620 ms ohne Änderung),
  Desktop 94 / Barrierefreiheit 100 / Best Practices 100 / SEO 69 (nur noindex).
- *Offen, Entscheidung Thees:* Google Analytics (`G-NGN7HYSSP8`) kommt aus Framers Site-Settings,
  lädt ohne Einwilligung (rechtlich angreifbar) und kostet lokal gemessen ~6 Punkte (TBT −700 ms).
  Per API nicht änderbar.

**Einwilligung für Google Analytics (07.10., Version `b60e8551d`):** Entscheidung Thees: Vorspann
bleibt (kostet gemessen ~7 Punkte Handy / 3 Desktop), Analytics nur nach Zustimmung.
- `code/custom/einwilligung-body-end.html` (bodyEnd): Hinweis erscheint erst bei der ersten
  Interaktion (scroll/pointerdown/keydown/mousemove/touchstart/wheel), „Ablehnen“ und „Zustimmen“
  gleichwertig, Wahl in `localStorage` (`fw-einwilligung` + Datum). Bei „ja“ lädt gtag `G-NGN7HYSSP8`
  — nicht doppelt, solange Framers eigene Einbindung noch aktiv ist. Widerruf löscht `_ga*`-Cookies.
- Fuß: neuer Link „Cookie-Einstellungen“ → `/datenschutz#cookie-einstellungen` (Skript fängt den
  Klick ab und öffnet den Hinweis). Sprungziel = Textkarte der Datenschutzseite.
- Datenschutzerklärung: neuer Abschnitt „5. Webanalyse mit Google Analytics (nur mit Ihrer
  Einwilligung)“, Folgeabschnitte 6–10, Widerruf um „Cookie-Einstellungen“ ergänzt. Entwurf —
  rechtlich prüfen lassen.
- **Offen bei Thees:** GA-ID in Framer → Site Settings → Analytics entfernen. Bis dahin lädt Framer
  Analytics weiterhin ohne Einwilligung.
- Lokale Messung: ohne Analytics Handy +4–6, Desktop +2; ohne Vorspann zusätzlich Handy +7, Desktop +3.

**Stand 07.10. mittags — was noch geht und was nicht:** PSI 11:44 Handy 73 (TBT 20 ms, LCP 5,3 s,
SI 5,3 s), Desktop 86 (streut 86–94). Lokal (Standard-Lighthouse) Handy 95. Framer gibt alle
Bildflächen ohne `loading="lazy"` aus (z. B. „Stimme“ 114 KB, „Gespräch“, Porträts) — gemessen bringt
deren Aufschub aber nichts (72–76 mit wie ohne). Messbar bleiben nur noch: Analytics-ID aus Framers
Site Settings entfernen (+4–6 Handy) und der Vorspann (~7 Handy, bewusst behalten). Weitere
Code-Optimierung liegt im Rauschen von PSI (±10).

**Analytics-Schleuse (07.10. mittags, Version `509807857`) — ID bleibt in Framer:** Thees will die
GA-ID in den Site Settings behalten. Framer setzt `<script async src="…gtag/js?id=G-NGN7HYSSP8">`
direkt nach dem headEnd-Custom-Code (davor schon ein Inline-Stub mit `gtag('config')`, der allein
nichts sendet). Lösung:
- `code/custom/schleuse-head-ende.html` = LETZTES im headEnd: ohne Einwilligung
  `document.write('<noscript id="fw-schleuse">')` → bei aktivem JS ist alles bis zum nächsten
  `</noscript>` reiner Text (gtag wird weder geladen noch ausgeführt).
- `code/custom/schleuse-body-start.html` = ERSTES im bodyStart: `<noscript id="fw-schleuse-zu"></noscript>`
  schließt (ein einzelnes `</template>`/`</noscript>` entfernt Framer beim Ausliefern — samt
  Kommentaren! Erster Versuch mit `<template>` hat die Seite ~3 Min. geleert, sofort zurückgerollt).
  Danach liest ein Skript den Text neu ein und hängt alles außer gtag wieder an (u. a.
  `events.framer.com`).
- Einwilligungs-Code lädt nach „Zustimmen“ nur das gtag-Skript nach (Framers dataLayer-Config wird
  verarbeitet, genau ein page_view). Mit gespeicherter Zustimmung öffnet die Schleuse gar nicht.
- Geprüft: frische Sitzungen auf /, /kontakt, /datenschutz (Handy + Desktop): 0 Anfragen an Google,
  keine _ga-Cookies; iOS-Safari rendert normal. Sicherung: `code/custom/_sicherung-vor-schleuse.json`.
- PSI danach: Handy 72 (TBT 0 ms, LCP 6,1 s, SI 5,1 s), Desktop 91 (TBT 0 ms). Rest-LCP = Lantern
  rechnet Framers Modul-Preloads (~400 KB, ganz oben im Kopf) ein; beobachtet LCP 0,21 s.

**Conversion-Durchgang 07.10. (Version `853cea641`) — Weg zur Anfrage:**
Gemessen nach dem Maßstab „Scrollweg zwischen zwei Handlungsaufrufen" (Handy, 390 px):

| Seite | Länge | größte Lücke vorher | nachher |
|---|---|---|---|
| /leistungen | 16,1 Bildschirme | **11,5** | 0 |
| / | 18,9 | 7,1 (Leiste deckte ab) | 0 |
| /ratgeber | 15,4 | 3,1 | 0 |
| /arbeiten | 9,7 | 0,7 | 0 |

- **Ursache:** Die `Handlungsleiste` lag nur auf der **Startseite**, nicht im Layout — alle 19
  Unterseiten hatten keine. Jetzt im Layout `kydvDx4Fl` (Instanz `elGYhfXig`, Repliken je
  Breakpoint), die drei Home-Instanzen gelöscht. Gilt damit für alle 20 Seiten.
- **Zwei Ausnahmen im Baustein ergänzt** (`code/Handlungsleiste.tsx`): nie auf der Zielseite
  selbst (`/kontakt` — Pfadvergleich mit `hauptZiel`) und nie, solange ein Formular im Bild ist.
  Geprüft: erscheint auf /, /leistungen, /arbeiten, /agentur, /ratgeber nach dem Auftakt,
  bleibt auf /kontakt durchgehend aus.
- **Telefon ist kein Pflichtfeld mehr** (`Mi208cugj`), Etikett „TELEFON (OPTIONAL)".
  Pflicht bleiben Name + E-Mail. Rückgängig: `formInputRequired="true"` + Etikett zurück.
- Formular ist sonst sauber: 7 sichtbare Felder, die weiteren 11 sind Framers Spamfallen.
- Googlebot sieht unverändert dasselbe wie ein Besucher (9.261 Zeichen, 2 Strukturdaten-Blöcke).

**Auftaktleiste ohne Linien (12.10.2026, Version `e113d2d79`):** Auf Wunsch alle drei Linien aus der
unteren Leiste des Auftakts entfernt (`code/Auftaktleiste.tsx`): die waagerechte Linie über der
ganzen Leiste (`borderTop`), die senkrechten Trenner zwischen den drei Belegen (`borderLeft`) und
der Strich mit dem laufenden orangen Segment neben „SCROLLEN". Die Abstände tragen die Gliederung
jetzt allein. Geprüft bei 1440 px und 390 px. Die Props `akzent` und `reduziert` sind in der
Hauptkomponente dadurch ungenutzt — Steuerung bewusst stehen gelassen, falls der Akzent zurück soll.

**Tipp-Feedback der Menüpunkte:** 0,75 s → 0,18 s. Beim Antippen bleiben rund 250 ms bis die
neue Seite lädt; alles darüber bricht sichtbar ab und sieht nach einem Fehler aus.

**Noch offen auf dem Handy:**

- Im Menü-Overlay fehlt „Projekt besprechen“ (die Handlungsleiste deckt den Weg inzwischen ab,
  im Menü wäre er trotzdem richtig).

**Das Menü-Overlay ist doch erreichbar** — die frühere Notiz war falsch. Es wird nur dann ins
DOM gehängt, wenn man den MENÜ-Knopf wirklich anklickt (ein `.click()` per Skript reicht nicht,
es braucht einen echten Klick), und seine Knoten heißen `Mitte`, `Liste`, `Zeile <Name>` — nicht
„Menü“, deshalb lief die Namenssuche ins Leere. Findbar über
`getNodesWithType("FrameNode")` plus Namensfilter. Die Handy-Variante von `Mitte` ist
`WQlUT7pJkmYyL7LUCk`.

Dort stand `padding: 24px 72px 24px 150px` aus dem Desktop-Entwurf, und im selben horizontalen
Stack liegt ein 460 px breites Logo — bei `space-between` drückte es die Menüpunkte auf dem
Handy weit nach rechts (170 px links gegen 39 px rechts). Jetzt linksbündig: Polster
`24px 20px 24px 0px` (der äußere Rahmen bringt die 20 px links schon mit),
`stackDistribution: start`, Logo auf dem Handy aus. Menüpunkte und Kontaktdaten stehen beide
bei 20 px.

Der orange Einlauf über den Menüpunkten lief über `transition: tween … 0.75s`. Auf dem Handy
startet der Seitenwechsel nach rund 250 ms — der Balken blieb auf einem Drittel stehen und sah
nach einem Fehler aus. Jetzt 0,28 s auf beiden Varianten (`wxElhapjS`, `iIHKKqEEk`). Das Overlay hängt an einem Framer-Event und ist
  über die Plugin-API nicht erreichbar (weder als Komponente noch als Frame auffindbar) — das
  muss im Framer-Editor von Hand ergänzt werden.
- Zwischen Kontaktkarte und Fuß-Handlungsaufruf steht rund ein halber Bildschirm leer.
- Die Fußzeile ist eine lange einspaltige Linkliste; zweispaltig wäre ruhiger.

## Offen

- Unterseiten und Rechtstexte sind leer (Texte für Impressum/AGB/Datenschutz in `Seitentexte.md`).
- ~~Kontaktformular fehlt~~ — /kontakt hat ein Formular (16 Felder) und die Nummer ist ein `tel:`-Link.
- Echte Porträts, Showreel, Favicon, OG-Bild; das Bild der Kundenstimme ist ein Beispielbild.

---

## Historie: Leerung am 27.09.2026

## Was gelöscht wurde

Das Projekt enthält keine Gestaltung und keine Daten mehr. Geprüft, nicht angenommen:
0 Komponenten · 0 Farbtoken · 0 Textstile · 0 Linkstile · 0 CMS-Collections ·
0 Layout-Templates · 0 Design-Seiten · 0 Textknoten.

| | |
|---|---|
| Seiten | alle bis auf die Startseite sind weg; die Startseite ist leer |
| Layout-Templates | „FW 2026" und „Main" — damit auch Navigation und Fußzeile |
| Komponenten | 33 Stück |
| Farbtoken | alle 36 |
| Textstile | alle 62, inklusive der an fokuswerk.de gemessenen FW-Metrik |
| Linkstile | alle 5 |
| CMS | Collection „Case Studies" mit vier Einträgen |
| Canvas- und Design-Seiten | Branding, Gallery, Documentation, Start Here |
| Favicon & OG-Bild | die Reste der gekauften Vorlage |

## Zwei Grenzen, die Framer setzt

- **Die Startseite `/` lässt sich nicht entfernen.** Der Versuch wird abgewiesen:
  `FramerPluginError: The home page cannot be removed`. Jede Framer-Site braucht eine. Sie ist
  leer, drei Breakpoints, sonst nichts.
- **Bilder lassen sich über die Plugin-API nicht löschen.** Die API kennt `uploadImage`,
  `addImage` und `uploadFiles` — aber keine einzige Methode, um Assets aufzulisten oder zu
  entfernen. Der Medienbereich ist nur im Framer-Editor erreichbar (Assets-Panel,
  Rechtsklick → löschen). Alle Bild-URLs stehen in `Bestand.md`, falls doch noch eines
  gebraucht wird.

**Nebenbefund für den Neuaufbau:** Dass die API `uploadImage`/`addImage` hat, widerspricht der
bisherigen Annahme, über den Agenten ließen sich keine Dateien hochladen. Ob sich damit
tatsächlich lokale Dateien aus dem Agenten heraus hochladen lassen, ist **ungetestet** — beim
nächsten Mal zuerst mit einem Bild ausprobieren, bevor wieder mit Platzhaltern gearbeitet wird.
Das würde die offenen Punkte Porträts, Showreel, Favicon und OG-Bild auf einen Schlag lösen.

## Was gesichert ist

Nichts an Inhalt ist verloren — alles Belegte steht als Datei in diesem Ordner:

- **[`Bestand.md`](Bestand.md)** — belegte Zahlen mit Quelle, die acht gebauten Seiten mit
  Adresse und Aufnahme, alle Bild-URLs, die acht Kundenlogos, das freigegebene
  Haubner-Zitat, sämtliche Texte der Startseite, Farbwerte und Schriftmetrik.
- **[`Case-Studies.md`](Case-Studies.md)** — die vier CMS-Einträge (Hotel Alte Werft, Patio,
  WinHadi, Zwillis Padel) mit Challenge, Strategie und allen Ergebniszahlen.
- **[`Seitentexte.md`](Seitentexte.md)** — der Wortlaut aller übrigen Seiten. **Wichtig:
  Impressum, AGB und Datenschutzerklärung stehen dort vollständig** — echte Angaben mit
  Anschrift und Umsatzsteuer-ID, die beim Neuaufbau wörtlich zurück müssen.
- **[`strukturierte-daten.html`](strukturierte-daten.html)** — JSON-LD, erst nach dem
  Livegang auf der echten Domain einfügen.

---

## Warum abgerissen wurde

Sechs Entwurfsrunden, alle verworfen:

| Runde | Was gebaut wurde | Rückmeldung |
|---|---|---|
| 1 | Creme-Weiß, Typo-Auftakt auf flacher Fläche | Farbe raus, wirkt billig |
| 2 | Weiß + Zinnober, FITZ67-Aufbau, Bild-Auftakt | „extrem billig, zu unaufgeräumt" |
| 3 | Jede Sektion eigene Komposition, Nummerierung 01–09 | weiter nicht getroffen |
| 4 | Runde Ecken, Squircle, eingerückte Farbblöcke, Schatten | „kantig" war erledigt, der Rest nicht |
| 5 | Orange statt Zinnober, Scroll-Bewegung | Layout blieb unangetastet |
| 6 | Aufbau neu: 14 Bänder → 7 Abschnitte, Galerie als Rückgrat | „das ist noch nichts" |

**Die Lehre:** Das Problem lag nie an Details, die nachgeschärft wurden. Sechs Runden lang
wurde innerhalb derselben Formensprache variiert. Der Neubau setzt an **Referenzseiten an,
die der Kunde selbst aussucht** — nicht an einer siebten Interpretation der bisherigen
Richtung.

---

## Was inhaltlich gilt (unabhängig von der Gestaltung)

**Positionierung.** Websites und Performance Marketing vorn, Content als dritter Hebel
dahinter und ausdrücklich das, was am wenigsten beworben werden soll. Leitsatz bisher:
„Mehr Anfragen. Nicht mehr Follower." Zielgruppe laut `Strategie Fokuswerk/ICP.md`:
Handwerk, Kfz, Gesundheit, Handel im Nordwesten — hochpreisig, notwendiger Bedarf,
Wachstumsabsicht.

**Ansprache.** Sie-Form. Die alten Seitentexte aus der gekauften Vorlage duzen und sprechen
von Social Media — die sind als Quelle unbrauchbar, außer bei den Rechtstexten.

**Zahlen.** Nur belegte Zahlen verwenden, Quelle in `Bestand.md`. Das Rechenbeispiel mit dem
Werkstattkunden ist als Rechenbeispiel auszuweisen, nicht als Zusage.

**Offen und unverändert:** Preisspanne, echte Fotos, Showreel, Favicon, OG-Bild. Bilder
lassen sich über den Agenten nicht hochladen — nur direkt im Framer-Editor. Die sieben
vercel.app-Entwürfe in der Arbeitenliste brauchen eine Entscheidung, bevor sie wieder
prominent gezeigt werden.
