# Pflegegeld-Antrag — Übergabe

**Live:** https://pflegegeld-antrag.vercel.app
**Auswertung:** https://pflegegeld-antrag.vercel.app/admin
**Stand:** 2. November 2026

**Eigene Note:** Rechnen und Recht halte ich jetzt für belastbar — der Rechenkern ist gegen Anlage 1 und 2 geprüft, jede Rechtsaussage gegen die Primärquelle. Gestalterisch liegt die Seite bei einer **3−**: die Fehler sind raus, aber Typografie und Abstände haben noch kein System, und alle zehn Bänder fangen gleich an. Was dafür nötig wäre, steht unter Punkt 5.

---

## 1. Der wichtigste Fund der Nacht

**Modul 5 wurde falsch gerechnet — bis zu 20 von 100 Punkten zu viel, also bis zu zwei Pflegegrade.**

Anlage 1 zu § 15 SGB XI bildet für die Kriterien 5.1 bis 5.7 **einen einzigen** Einzelpunktwert von 0 bis 3, und zwar aus der **Summe aller Maßnahmen pro Tag** über die ganze Gruppe. Dasselbe noch einmal für 5.8 bis 5.11. Der Rechner vergab stattdessen 0 bis 3 Punkte **je Kriterium** und addierte sie: gesetzliches Maximum 15, erreichtes Maximum 42.

Beispiel: dreimal täglich Tabletten (5.1) und einmal täglich Blutzucker messen (5.6) sind nach dem Gesetz **vier Maßnahmen pro Tag → 2 Einzelpunkte**. Der alte Code gab dafür 1 + 1 = 2 Punkte — zufällig richtig. Bei sieben belegten Kriterien gab er 7 statt 2.

Behoben in `src/lib/nba.ts`: die Gruppen summieren jetzt Maßnahmenzahlen und rechnen sie erst danach in Punkte um (Woche ÷ 7, Monat ÷ 30, genau wie der Gutachter). Die Fragen in Modul 5 fragen deshalb jetzt nach **Anzahlen** („zweimal täglich"), nicht mehr nach Stufen. 70 Prüfungen in `src/lib/nba.test.ts` laufen grün, darunter die Intervallgrenzen beider Rechtsstände und das gesetzliche Maximum von 15.

> Konsequenz für dich: Wenn du vorher irgendwem ein Ergebnis gezeigt hast, war es in Modul 5 womöglich zu hoch.

---

## 2. Deine Frage, neutral beantwortet

### „Sind solche Blöcke geil?"

**Nein — aber nicht, weil es Karten sind.** Das Vorbild besteht auch aus Karten. Der messbare Unterschied: die Karten hier wurden von einer Kante bei **1,2:1** gehalten statt von Tiefe. Elf von zwölf Kartenfamilien hatten gar keinen Schatten, und der einzige vorhandene hatte Alpha 0,04 ohne negativen Spread — weniger als die Hälfte dessen, was wohnsitzmelder.de unter seine Karten legt. Eine Kante bei 1,2:1 trennt nicht, sie trübt. Genau das liest sich als „billig".

Geändert: zwei Schattentoken mit negativem Spread, auf **alle** Kartenfamilien gelegt, `--linie` auf 0,07 gesenkt. Dazu ein redundantes Band gestrichen, ein randabfallendes Bildband eingezogen und fünf von neun identischen Pillen durch eine kurze Akzentlinie ersetzt.

**Was bleibt:** Die Seite ist immer noch 12.010 px hoch mit zehn Textbändern. Das ist zu viel. Mein Urteil: zwei weitere Bänder gehören zusammengelegt („Worum es geht" und „Der häufigste Fehler" machen dieselbe Arbeit). Das habe ich nicht gemacht, weil es Inhalte zusammenschiebt, über die du entscheiden solltest.

### „Sind hellblaue Texte auf Weiß geil?"

**Nein, und es gab genau eine solche Stelle.** Die Ziffern „01 02 03" im Ablaufband standen bei **1,35:1** — nicht dezent, sondern unsichtbar. Du hattest sachlich recht. Sie sind jetzt gefüllte Scheiben wie die Ziffern daneben.

Alles andere, was wie „hellblau" aussah, ist dunkles Petrol bei 7,8 bis 9,2:1 — kontrastseitig einwandfrei. Dass es trotzdem als Schwäche auffiel, hatte einen anderen Grund: Es waren **26 kleine akzentfarbige Elemente** auf einer Seite, alle in derselben Rolle, neun davon identische Pillen — und in zwei Abschnitten verschwand deren Füllung bei 1,03:1, sodass tatsächlich nur freistehender blauer Text übrig blieb. Zusätzlich war das Warnrot gesättigter als die Markenfarbe selbst, wodurch das Blau blass wirkte.

Geändert: Akzent auf `#004c72` (satter, Kontrast unverändert), Signalrot entsättigt, Pillenfüllung auf hellem Grund sichtbar, Zahl der Akzentelemente deutlich reduziert.

**Antwort in einem Satz:** Hellblaue Schrift auf Weiß — nie. Dunkles Petrol als Textfarbe — ja, aber sparsam.

---

## 3. Was sonst korrigiert wurde

**Recht und Fakten** (alles gegen den Kabinettsentwurf-PDF des BMG und gesetze-im-internet.de geprüft):

| Vorher | Jetzt |
|---|---|
| Drei „Zitate im Wortlaut", davon zwei Paraphrasen und eins abgeschnitten | Echter Wortlaut von § 142b Abs. 1–3, Zusammenfassungen sind als solche gekennzeichnet |
| § 142b Abs. 1 ohne Halbsatz 2 | **Wiederholungsbegutachtung: der Tag des Termins zählt, nicht der Antragstag** — das war die Kernbotschaft der Seite, und für diese Gruppe war sie falsch |
| „Keine Entscheidungsfrist von Januar bis April" | …außer bei besonders dringlichem Entscheidungsbedarf (§ 142b Abs. 3 S. 2) |
| „Ihr bewilligter Pflegegrad bleibt" | Er fällt nicht **wegen der Reform**; wird die Person wieder selbständiger, schützt die Regel nicht. Der Schutz deckt auch die Bewertungssystematik in Anlage 2 ab |
| Verhinderungspflege 3.539 € | Durch nahe Angehörige: Pflegegeld für **zwei Monate** (§ 39 Abs. 3 S. 2). 3.539 € gibt es nur beim Pflegedienst. Ab 2027 ersetzt das Überbrückungsbudget (2.285 €) die Verhinderungspflege ganz |
| „12–22 % weniger Anerkennungen" | **22 %** — das Gesetz ändert Schwellen *und* Intervalle, also gilt die größere Zahl. Fundstelle korrigiert auf „zu Nummer 16 (§ 15)" |
| „Entlastungsbetrag fällt ersatzlos weg" | Es bleiben die Beratungseinsätze nach § 37 Abs. 3; die Pflegebegleitung kommt erst 2029. Betroffen: 860.877 Menschen |
| Am 31.12.2026 hätte die Seite behauptet, das neue Recht gelte schon | `stichtagVorbei()` schaltet erst am 1.1.2027 um |
| /bescheid erhob Modul 2 und addierte es nicht | Fünf Werte wie im Gutachten, Module 2 und 3 gemeinsam |

**Datenschutz:**
- Der Lead-Endpunkt schrieb **die E-Mail-Adresse ins Vercel-Log**. Tut er nicht mehr.
- Der Fußtext behauptete „An uns übertragen wird nichts davon". Das stimmte nicht mehr, seit die Messung läuft. Jetzt steht dort, was wirklich übertragen wird: Seitenaufruf und Trichterschritt, ohne Inhalte und ohne Cookie.
- Der Befund im Lead-Formular enthält den Pflegegrad, also eine Gesundheitsangabe. Die Einwilligung nennt jetzt Art. 9 Abs. 2 lit. a DSGVO ausdrücklich.

**Bedienung und Gestaltung:**
- Der Absendeknopf stand im Ausgangszustand bei **2,2:1** — der Conversion-Knopf wurde zuerst in seinem schwächsten Zustand gesehen. Jetzt 5,3:1.
- Fokusringe auf dunklen Bändern: 1,7:1 → 8,7:1. Tastaturbedienung war dort blind.
- Quellenzeile im Fuß: 2,9:1 → 7,6:1.
- Feldrahmen: 1,5:1 → 3,4:1 (WCAG 1.4.11 verlangt 3:1). Felder haben jetzt Hover, Mausfokus und Fehlerzustand.
- Kein Farbpaar im System liegt noch unter 4,5:1.
- Sprungziele landeten unter der Kopfleiste. Behoben.
- Auf dem Handy stand vor der ersten Frage ein 400 px hoher Rechtshinweis. Die Frage steht jetzt davor.

**Conversion:**
- Die leichteste Frage steht auf Position 1 des Schnellchecks.
- Das Ergebnis nennt einen **Korridor** („Pflegegrad 2 bis 3"). Sieben Angaben können 65 Kriterien nicht ersetzen; eine Punktzahl auf zwei Stellen täuscht Genauigkeit vor, die nicht da ist.
- `/antrag` ist jetzt verlinkt — vorher war die Seite gebaut, aber von nirgends erreichbar.

---

## 3a. Zweiter Prüflauf: was vier Agents danach noch fanden

Nach allen Änderungen habe ich die Seite noch einmal von vier Seiten durchprüfen lassen — Fakten, Conversion, Bedienbarkeit, Gestaltung. Was sie fanden und was davon behoben ist:

**Ein Datenfehler, den niemand gemeldet hätte:** Ein zweiter Tipp auf dieselbe Stelle, 250 ms nach dem ersten, beantwortete im Schnellcheck die **nächste, noch nicht gesehene Frage**. Man landete bei Frage 4 statt 3 — mit einer Antwort, die man nie gegeben hat. Genau das tut die Zielgruppe ständig. Behoben: die Antwortgruppe nimmt während des Fragenwechsels keine Eingabe an.

**Der Schnellcheck beruhigte systematisch.** Bei allen 15.625 möglichen Antwortkombinationen zeigte er **kein einziges Mal** die verschobenen Punktspannen in den Modulen 1, 4 und 6 — weil die Schätzwerte bauartbedingt mittig liegen. Er bildete also nur die Schwellenwerte ab (knapp 12 %), nie den vollen Effekt (22 %), und sagte in 92 % der Fälle „ändert nichts". Jetzt steht dort, was der Schnellcheck kann und was nicht, und warum sich der genaue Rechner trotzdem lohnt.

**Zwei verwechselte Begriffe kosteten Partnerqualität.** Die Hilfsmittelvorschläge richteten sich nach dem Modul mit der größten Punktlücke — also dort, wo die Person am **selbständigsten** ist. Wer problemlos Treppen stieg, bekam einen Treppenlift angeboten. Jetzt sind „wo fehlen noch Punkte" und „wo ist der Bedarf" zwei getrennte Funktionen, beide mit Test.

**Eine falsche Aussage über ein Gerichtsurteil.** Auf `/widerspruch` stand, das Bundessozialgericht habe entschieden, ein Widerspruchsverfahren sei keine Nebenleistung einer Pflegeberatung. Tatsächlich ging es um Schwerbehindertenrecht, und das Gericht hat die Sachfrage nicht entschieden — die Beschwerde war unzulässig. Jetzt steht da, was wirklich passiert ist.

**Weiter behoben:** § 63 SGB X erstattet nur notwendige Aufwendungen und nur bei Erfolg (stand als Garantie da) · Widerspruchsfrist läuft ab **Bekanntgabe**, nicht ab Zugang, und beträgt ein Jahr ohne Rechtsbehelfsbelehrung · „rückwirkend ab dem Tag der Antragstellung" → ab Beginn des Monats · „häufigster Grund für einen erfolgreichen Widerspruch" war unbelegt und stand direkt über dem Preis, ist raus · die Kennzahl „380–1.080 €" waren Entwurfszahlen für 2027, heute sind es 347–990 € · § 18c Abs. 5: die Kasse muss die 70 € von sich aus zahlen, es stand „Sie müssen es verlangen" · Formfreiheit des Antrags folgt aus § 9 SGB X, nicht aus § 33 SGB XI · Wohnumfeldzuschuss ist eine Kann-Leistung · das Sozialraubudget ab 2027 gilt nur für anerkannte Anbieter · die internen Partnerwerte heißen jetzt „Annahmen", nicht „belegte Marktwerte".

**Bedienung:** Nach einem Teilwechsel war der Fokus verloren — mit der Tastatur kam man nur rückwärts durch alle Fragen zur nächsten. Jetzt springt er auf die Überschrift, mit Ansage für Vorleseprogramme. Das Versprechen „Sie machen später genau hier weiter" stimmte nicht; die Stelle wird jetzt mitgespeichert. Die Antwortskala („überwiegend selbständig") gilt für 45 der 65 Fragen und war **nirgends erklärt** — jetzt steht ein ausklappbares Beispiel über jedem betroffenen Teil. Das Lead-Formular hängt nicht mehr unbegrenzt (15 s Zeitablauf), der Absendeknopf ist mit der Tabulatortaste erreichbar und sagt, was fehlt. Die Kopfleiste lief bei großer Systemschrift über den Bildschirm hinaus.

**Gestaltung:** Drei sichtbare Fehler, einen davon hatte ich selbst eingebaut — ein weißer Balken hinter „Drei Werkzeuge", weil eine alte Regel die neue Akzentlinie überschrieb. Dazu zwei im Raster um 16 px versetzte Karten, eine am Handy mitten im Wort brechende Tabelle, ein Knopf, der einen Absatz auseinanderriss, und ein Abschlussband, das farblich mit dem Fuß verschmolz. Alle behoben. Der Prüfstempel war grün — die einzige grüne Fläche in einer Seite ohne Grün.

**Dagegen gab es eine neue Prüfung:** `npm run seiten` lädt jede der zehn Seiten in einem echten Browser und meldet jeden Absturz. Gebaut, weil ich beim Fokus-Fix einen React-Hook hinter ein vorzeitiges `return` gesetzt hatte: Typprüfung und Build waren grün, `/check` war im Browser trotzdem eine weiße Fehlerseite. Das darf nicht noch einmal unbemerkt bleiben.

---

## 3b. Dritte Runde: Bilder, Staffel, Antragsweg

### Bilder

Vorher lagen vier Fotos aus vier Lichtsituationen auf der Seite: ein ausgebranntes
Fensterbild, ein Sepia-Motiv aus dem Bestattungsgewerbe, ein Sofa mit grünem Kissen in einer
Seite, die sonst nur Petrol und Hellblau kennt. Nebeneinander lesen sich die als vier
Einkäufe, nicht als eine Bildsprache.

Jetzt sind es **zwei** dokumentarische Motive durch **dieselbe Duotone-Rechnung** — Tiefen
Petrol `rgb(10 43 64)`, Lichter fast neutral, Kontrast 1,08. Das reine Dekoband mit dem
schwächsten Motiv ist ersatzlos weg. Neu bauen mit `npm run bilder`; die Originale liegen in
`.bilder-roh/` und bleiben außerhalb des Repos.

Dazu kam ein **Vorschaubild für geteilte Links** (`npm run vorschau`, 1200 × 630, 87 kB).
Gerendert wird es mit Playwright aus einer kleinen HTML-Datei, damit dieselben Schriften
greifen wie auf der Seite. Als PNG lag es bei 308 kB — WhatsApp lädt Vorschaubilder über rund
300 kB gar nicht erst, deshalb JPEG. **Achtung:** solange die Seite auf `noindex` steht, zeigt
WhatsApp trotzdem keine Vorschau. Das wird erst mit der Veröffentlichung sichtbar.

### Staffel

34 Schriftgrößen, davon 15 in einer Spanne von 0,14 rem, auf **neun Stufen** gezogen
(`--t-1` bis `--t-7` plus die Display-Größen). 35 verschiedene px-Abstände mit Einzelgängern
wie 7, 13, 26, 42 und 52 auf eine **Skala** gesnappt — 91 Werte, meist um 1 bis 4 px. Beides
steht als Token am Anfang von `globals.css`.

### Der Knopf in der Mitte

Zwischen dem Ende des Schnellchecks und dem nächsten Handlungsaufruf lagen **7.860 px**,
knapp zehn Handyschirme Lesestoff ohne eine Möglichkeit zu handeln. Das neue Band
`.zwischenruf` sitzt direkt hinter der Reform-Erklärung und bietet beide Wege an: den
genauen Rechner und den 90-Sekunden-Schnellcheck.

### Was die Prüfagents fanden — und was davon ein Fehler von mir war

**Pflegegrad 1 bekommt nach dem Entwurf kein Sozialraumbudget.** Das gibt es erst ab
Pflegegrad 2 (§ 45b Abs. 1 Satz 1 neu). Ich hatte „175 € Sozialraumbudget" aus dem Gedächtnis
geschrieben, obwohl der eigene Datensatz zwei Dateien weiter `sozialraumbudget: [0, 175, …]`
sagt und `/reform` das Gegenteil erklärt. Das ist der Fehlertyp, der am teuersten ist: eine
Rechtsaussage aus dem Kopf statt aus der Quelle.

**Die Geldbeträge hängen nicht am Antragstag.** § 142b schützt den Pflegegrad, gezahlt wird
nach dem Recht des Leistungsmonats. Eine Euro-Zahl im Kasten „Antrag bis 31.12.2026" behauptet
das Gegenteil — und nebenbei, ein späterer Antrag bringe mehr Geld. Die Beträge stehen jetzt
in einem eigenen Block unter dem Paar, mit dem Hinweis, dass die höhere Zahl ab 2027 nicht
mehr Geld bedeutet: Verbrauchshilfsmittel und Verhinderungspflege entfallen als eigene
Ansprüche.

**Das Ergebnis verwies nirgends auf `/antrag`.** Bei einer Seite, deren Kernbotschaft „der
Antragstag entscheidet" lautet, führten die ersten Knöpfe unter dem Ergebnis zur
39-Euro-Mappe und zu Partnerangeboten. Jetzt steht der kostenlose Antrag bei y = 1.581 statt
des Produkts bei y = 2.997.

**Der Kopfknopf war auf `/check` tot** — er zeigte auf `/check`, während man dort stand. Er
führt jetzt zum Antrag.

Dazu: „90 Sekunden" im Zwischenruf war für den 63-Fragen-Rechner unwahr. Anlage 1 hat
**64** Kriterien, nicht 65; der Zähler im Rechner sagt jetzt „Fragen", weil er die sichtbaren
zählt (63 am Anfang, 65 mit den Inkontinenz-Folgefragen). Die Partnerzeilen nannten
2027er-Beträge ohne Entwurfskennzeichnung und den Pflegegrad-5-Höchstwert als Regelfall.

**Ein Agent lag daneben:** Die Werkzeugkarten seien nicht klickbar. Gemessen ist die ganze
Karte ein Ziel von 335 × 252 px (`.ablauf-schritt a::after { inset: 0 }`). Geändert habe ich
nur das dreifache nichtssagende „Öffnen" — drei gleiche Linktexte sind für einen Screenreader,
der sich die Links auflisten lässt, dreimal dasselbe.

### Ein Fehler, den nur der Simulator zeigte

Beim Laden von `/check` lag ein Fokusrahmen um die Überschrift „Mobilität". Grund: `ersterAufbau`
taugte nicht als Wache, weil der Hash-Effekt die Marke löscht, bevor `geladen` umspringt. Jetzt
merkt sich der Effekt den zuletzt gezeigten Teil und fokussiert nur bei einem echten Wechsel.
Im Browserfenster war davon nichts zu sehen.

### Was der dritte Prüflauf noch fand

Zwei Agents fanden unabhängig voneinander denselben Fehler, und das war der schwerste:
**Der Fokusring war auf den beiden neuen petrolfarbenen Bändern unsichtbar** — der Ring hat die
Farbe `--akzent`, und die Bänder haben `--akzent` als Hintergrund. 1:1. Wer mit der Tastatur
bedient, sah auf genau den Handlungsaufrufen nichts, die ich gerade erst eingebaut hatte. Dazu
kam: bei allen sieben Aufklappern (`<summary>`) lag der Ring außerhalb des Elements und wurde
vom `overflow: hidden` der Hülle abgeschnitten.

Weiter behoben:

- **Überschriften klebten an ihrem Inhalt.** `h1, h2, h3 { margin: 0 }` ohne Abstand nach unten
  ergab an rund fünfzehn Stellen 0 px zwischen Überschrift und Text. Jetzt 16 px unter der h2,
  8 px unter der h3 — die kollabieren mit vorhandenen Abständen, es wird also nirgends doppelt.
- **Zwei Regressionen meiner eigenen Staffel:** `.vorspann` war mit 16,8 px *kleiner* geworden
  als der Fließtext, den er einleitet (18 px), und `.preis` war auf 32 px gewachsen und damit
  größer als die Überschrift darüber.
- Zwischenruf und Antragsruf brachen den Knopf unter den Text, weil der Text keine
  Breitenbegrenzung hatte.
- Die Augenbraue des dunklen Bandes stand 214 px über ihrer Überschrift (`align-items: center`).
- Nach „Ergebnis anzeigen" fiel der Fokus auf den Body — ein Screenreader las nichts vor,
  obwohl sich die ganze Seite ausgetauscht hatte.
- „PG 2" steht jetzt als „Pflegegrad 2" da, und „kein Pflegegrad" statt eines Gedankenstrichs,
  den ein Screenreader als „Strich" vorliest.
- Der Nenner im Rechner wuchs mitten im Durchgang von 63 auf 65, sobald die Inkontinenz-
  Folgefragen dazukamen. Jetzt zählt er nur noch die beantworteten Fragen.

**Was ich bewusst nicht gemacht habe:** Die Seite ist mit rund 12.400 px weiterhin lang, und
`/check` hat im Modul 5 eine Strecke von 9.200 px ohne Knopf. Das sind Inhaltsentscheidungen —
welche Bänder zusammengelegt werden, gehört dir. Ebenso offen: ein zweites, kurzes
Mailfeld direkt am Schnellcheck-Ergebnis (dort ist die Absicht am höchsten, das Formular steht
aber bei 92 % Seitentiefe), und ein Zwischenergebnis nach Modul 4.

## 3c. Vierte Runde: gekürzt

Von **12.658 px auf 10.630 px** (15,6 → 13,1 Handyschirme), **elf Bänder auf neun**. Dabei ist
kein Inhalt verlorengegangen, nur Dopplung.

**Was zusammengelegt wurde:**

- **„Drei Änderungen" und „Die Grenzen verschieben sich" sagten dasselbe.** Punkt 01 des einen
  Bandes nannte im Fließtext „Pflegegrad 1 ab 15 statt 12,5, Pflegegrad 2 ab 30 statt 27" — und
  die Tabelle im anderen Band zeigte genau diese Zahlen noch einmal. Zusammen 2.621 px für eine
  Tatsache. Jetzt ein Band: die Tabelle als Beleg, daneben die beiden Änderungen, die sie
  *nicht* zeigt (verschobene Punktspannen, ausgesetzte Entscheidungsfrist).
- **„Nicht Übertreibung. Bescheidenheit."** war ein eigenes Band mit eigener Augenbraue und
  eigener Überschrift: 761 px für 35 Wörter. Es geht um dieselbe Stunde am Küchentisch wie das
  Band davor, also steht es jetzt darin.
- **Der Vertrauensblock war eine Dopplung des Heros.** Drei seiner vier Punkte standen oben
  schon fast wortgleich („Sieben Fragen, keine Anmeldung", „Gerechnet wird im Browser",
  „Anlage 1 zu § 15 SGB XI"). Den vierten — „Quellen offen" — beweist die Quellenleiste direkt
  darunter, statt ihn zu behaupten. Raus, samt totem CSS.
- **„Drei Werkzeuge" waren drei hohe Karten für 1.123 px und 48 Wörter**, und alle drei Ziele
  sind im Hero, in der Kopfleiste und im Zwischenruf ohnehin verlinkt. Jetzt eine Zeile mit
  349 px — alles bleibt erreichbar und beschrieben.
- Das Abschnittspolster am Handy von 64 auf 48 px.

**Eine Falle dabei, falls du das Muster wiederverwendest:** In einem Flex-Container mit
`flex-direction: column` ist `flex-basis` die **Höhe**. Ein `flex: 1 1 16ch` am Text machte aus
jeder Zeile einen Kasten mit 16 Zeichenbreiten Leerraum darunter. Die Regel gehört in die
Breitenabfrage, nicht davor.

**Was weiterhin lang ist und warum:** Der Hero (1.255 px) trägt das Bild unter der Falz, der
Schnellcheck (1.226 px) ist das Produkt, und „So wird gerechnet" (1.187 px) zeigt die sechs
Modulgewichte. Das sind drei Dinge, die ihren Platz verdienen. Kürzer geht nur noch, indem man
Inhalt streicht — nicht Dopplung.

## 4. Das Backend

`/admin`, passwortgeschützt. Zeigt:

- Besucher, Seitenaufrufe, gestartete und beendete Rechner, Leads, Klicks auf Partnerangebote — jeweils mit Quote
- Besucher und Leads je Tag
- **Wo der Schnellcheck abbricht**, Frage für Frage
- Woher die Leads kommen, nach Anlass
- Die letzten 25 eingetragenen Personen mit Name, Mail, Anlass, Befund und Double-Opt-in-Stand
- CSV-Export der vollständigen Liste

**Was echt ist und was Demo:**

Die Messung läuft wirklich: jede Seite meldet den Aufruf, der Rechner meldet Start, Modulfortschritt und Abschluss, das Formular meldet den Lead. Übertragen werden nur Kennzahlen, nie eine Antwort.

**Es ist noch keine Datenbank hinterlegt.** Solange das so ist, zeigt `/admin` erfundene Zahlen — und, wichtiger: **eingehende Leads gehen verloren.** Sie werden weder gespeichert noch protokolliert, denn eine Mailadresse gehört nicht ins Server-Log. Der Hinweis steht fett oben auf der Auswertungsseite.

Scharf schalten: Supabase-Projekt anlegen, `datenbank/schema.sql` einspielen, dann

```bash
cd "/Users/thees/Desktop/Claude/Pflege/pflegegeld-antrag" && npx vercel env add SUPABASE_URL production
```

```bash
cd "/Users/thees/Desktop/Claude/Pflege/pflegegeld-antrag" && npx vercel env add SUPABASE_DIENSTSCHLUESSEL production
```

**Das Zugangspasswort konnte ich nicht selbst bei Vercel hinterlegen** — das Schreiben von Secrets war in dieser Sitzung gesperrt. Lokal steht es in `.env.local`. Für die Live-Seite einmal ausführen und das Passwort aus `.env.local` einfügen:

```bash
cd "/Users/thees/Desktop/Claude/Pflege/pflegegeld-antrag" && npx vercel env add ADMIN_PASSWORT production
```

Danach einmal neu ausrollen:

```bash
cd "/Users/thees/Desktop/Claude/Pflege/pflegegeld-antrag" && npx vercel --prod
```

Bis dahin ist `/admin` im Demo-Modus und zeigt grundsätzlich keine echten Daten — so kann dort nichts versehentlich offenstehen.

---

## 4a. Datenbank: was vorbereitet ist und was du tun musst

Das Supabase-Projekt konnte ich nicht anlegen. Der Free-Tarif erlaubt **zwei aktive Projekte
je Besitzer**, und beide Plätze sind belegt: „Gigis Gourmet Kitchen" (in Betrieb — 8
Presseartikel, Kurse, eine Anfrage) und „Wohnsitzmelder" (zwei Tabellen, zusammen ein
Eintrag). Du legst dafür ein eigenes Konto an — für Gesundheitsangaben nach Art. 9 DSGVO ist
eine eigene Datenbank ohnehin die sauberere Lösung als eine geteilte.

**Deine vier Schritte:**

1. Projekt anlegen, Region **Frankfurt (eu-central-1)**.
2. `datenbank/schema.sql` im SQL-Editor einmal ausführen.
3. Unter *Project Settings → API* die Projekt-URL und den **`service_role`**-Schlüssel holen
   — nicht den `anon`-Schlüssel. Beide Tabellen stehen unter Row Level Security **ohne**
   Policy; der öffentliche Schlüssel sieht dadurch nichts, selbst wenn er im Browser landet.
4. Drei Werte bei Vercel hinterlegen (Secrets zu schreiben war mir in dieser Sitzung
   gesperrt): `SUPABASE_URL`, `SUPABASE_DIENSTSCHLUESSEL`, `ADMIN_PASSWORT`. Das
   Admin-Passwort steht in `.env.local`. Die Befehle stehen in der README.

**Danach beweist `npm run datenbank`, dass es wirklich läuft.** Das Skript schreibt einen
Probeeintrag auf eine `.invalid`-Adresse, liest ihn zurück, schickt ihn ein zweites Mal
(der Dublettenschutz muss greifen) und löscht ihn wieder. Der Unterschied zu „die Variablen
sind gesetzt": ein Schlüssel mit zu wenig Rechten fällt sonst erst auf, wenn der erste echte
Lead verlorengeht.

**Neu dazugekommen:** ein Dublettenschutz. Eine Adresse steht je Anlass nur einmal in der
Liste (`leads_mail_anlass_idx` plus `resolution=ignore-duplicates`). Wer zweimal abschickt,
weil keine Mail ankam, erzeugt keine zweite Zeile — und ein schon bestätigter Eintrag wird
dabei nicht wieder auf unbestätigt zurückgesetzt.

**Was sofort danach dringend wird:** Jeder Eintrag steht auf `bestaetigt = false`, und die
Bestätigungsmail gibt es nicht. Sobald die Datenbank läuft, tragen sich Leute ein und hören
nichts. Das ist die sichere Richtung — es geht nichts Unverlangtes raus — aber die Schleife
ist offen. Das ist der nächste Baustein.

**Geprüft:** `/admin` bleibt ohne gesetztes `ADMIN_PASSWORT` zu; `angemeldet()` gibt dann
immer `false` zurück, es kann also nichts versehentlich offenstehen. Und `/api/lead`
antwortet ohne Datenbank mit `{"ok":false,"grund":"speicher"}` und 503, das Formular sagt
ehrlich, dass die Adresse **nicht** gespeichert wurde.

## 4b. Bestätigungsmail (Double Opt-in)

Gebaut und geprüft, aber **bewusst noch nicht scharf**.

**Wie es läuft:** Jede Anmeldung erzeugt einen Zufallstoken aus 32 Byte, speichert ihn mit
sieben Tagen Gültigkeit und löst die Bestätigungsmail aus. `/bestaetigen?t=…` löst sie ein,
setzt `bestaetigt = true` und **löscht den Token** — ein Link, der zweimal funktioniert, lässt
sich aus einem weitergeleiteten Postfach erneut einlösen.

**Der Schalter:** Ohne `FEATURE_MAILVERSAND=true` wird der Text nur gerendert und
protokolliert, es geht nichts raus. Das Formular sagt dann auch nicht „achten Sie auf unsere
Mail", sondern nur, dass die Adresse notiert ist — der Endpunkt meldet zurück, was wirklich
passiert ist, und die Oberfläche richtet sich danach.

**Was am Text wichtig ist:** keine Werbung. Eine Bestätigungsanfrage mit Werbung darin ist
selbst die unerlaubte Zusendung, die das Verfahren verhindern soll (BGH, 10.02.2011,
I ZR 164/09). `npm run mailtext` zeigt alle drei Varianten und prüft genau darauf — ohne eine
Mail zu verschicken. Der Text nennt außerdem die Gültigkeit und sagt denen, die sich nicht
angemeldet haben, ausdrücklich, dass sie nichts tun müssen.

**Nachweis:** Die Tabelle hält Zeitpunkt und IP von Anmeldung *und* Bestätigung
(Art. 7 Abs. 1 DSGVO). Ohne diese Felder ist die Liste im Streitfall wertlos.

**Eine Entscheidung liegt bei dir: von welcher Domain.** Bei Resend ist bisher nur
`email.fokuswerk.de` verifiziert — die Subdomain für Kaltakquise. Eine Bestätigungsmail geht
an jemanden, der sie erwartet; die gehört nicht auf dieselbe Reputation. Besser eine eigene
Subdomain, sobald `pflegegeld-antrag.de` steht.

**Vier Werte bei Vercel**, wenn es scharf werden soll: `RESEND_SCHLUESSEL`, `MAIL_ABSENDER`,
`FEATURE_MAILVERSAND=true` und — sobald eine eigene Domain davorsteht — `OEFFENTLICHE_ADRESSE`.
Ohne den letzten Wert zeigen die Links in der Mail auf `*.vercel.app`.

**Ich habe keine einzige Mail verschickt.** Geprüft wurde über den Trockenlauf.

## 4c. Stand der Datenbank (2. November 2026)

**Lokal läuft alles.** `npm run datenbank` ist grün, und der komplette Weg wurde einmal
durchgespielt: Anmeldung über den echten Endpunkt → Eintrag unbestätigt mit 64-Zeichen-Token
→ Bestätigungslink → `bestaetigt = true` mit Zeitpunkt und IP → Token verbraucht. Probeeintrag
danach gelöscht. Verschickt wurde nichts.

**Live noch nicht.** Bei Vercel steht keine Umgebungsvariable, `/api/lead` antwortet dort
weiterhin mit 503. Secrets zu schreiben war mir gesperrt. Ein Befehl erledigt alle drei auf
einmal, er liest die Werte aus `.env.local`:

```bash
cd "/Users/thees/Desktop/Claude/Pflege/pflegegeld-antrag" && for V in SUPABASE_URL SUPABASE_DIENSTSCHLUESSEL ADMIN_PASSWORT; do grep "^$V=" .env.local | cut -d= -f2- | tr -d '\n' | npx vercel env add "$V" production; done && npx vercel --prod
```

Der Neuaufbau am Ende ist nötig: Vercel zieht geänderte Variablen erst mit dem nächsten
Deployment.

**Eine Spalte fehlt in der Datenbank, mit Absicht liegengelassen:** `token_eingeloest`. Ohne
sie liest jemand, der den Bestätigungslink ein zweites Mal anklickt, „Diesen Link kennen wir
nicht" statt „war schon bestätigt". Die Bestätigung selbst ist davon nicht betroffen — der
Code ist so gebaut, dass die fehlende Spalte folgenlos bleibt (geprüft gegen die echte
Datenbank). Falls es dich später stört, sind es zwei Zeilen am Ende von `datenbank/schema.sql`.

## 5. Was vor der Veröffentlichung noch fehlt

Die Seite steht auf `noindex`. Das muss so bleiben, bis diese drei Punkte erledigt sind:

1. **Impressum nach § 5 DDG und Datenschutzerklärung nach Art. 13 DSGVO.** Ohne sie darf die Seite nicht öffentlich erreichbar sein. Der Platzhalter steht auf `/rechtliches`.
2. **Bestätigungsmail (Double Opt-in).** Das Formular sagt zu, dass vor dem ersten Versand bestätigt wird. Diese Mail gibt es noch nicht. Jeder Eintrag steht auf „Bestätigt: offen" — an diese Adressen darf nichts verschickt werden.
3. **Datenbank**, siehe oben. Sonst sammelst du keine Leads, sondern verlierst sie.

Dazu die Punkte, die ich bewusst offengelassen habe, weil sie eine Entscheidung von dir brauchen oder ein eigener Auftrag sind:

- **Die Seite ist zu lang.** Zehn Textbänder, rund 12.000 px am Handy. Der Conversion-Bericht schlägt vor, auf etwa 6.500 px zu kürzen: „So wird gerechnet" und „Drei Werkzeuge" streichen, „Worum es geht" und „Der häufigste Fehler" zusammenlegen. Ich habe nur ein Band gestrichen, weil die übrigen Inhalte dir gehören.
- **Alle zehn Bänder öffnen gleich** — Label, dann Überschrift, linksbündig, immer dieselbe Größe. Das ist der Hauptgrund für „zu langweilig". Ein echter Rhythmus braucht eine Typ- und Abstandsskala (es sind aktuell 34 Schriftgrade und 26 Innenabstände) und zwei, drei Bänder, die anders anfangen.
- **Die Fotos passen nicht zueinander.** Drei Unsplash-Platzhalter in drei verschiedenen Graduierungen, eines bringt Grün in eine Seite ohne Grün, und das Vollbild ist mit 1.300 px für die volle Breite zu klein. Eine gemeinsame Tönung und echte Bilder wären der sichtbarste einzelne Sprung.
- **Der Weg zum Geld ist zu lang.** Wer den Bescheid in der Hand hat, muss heute erst die 65 Fragen durchgehen, bevor `/bescheid` etwas zeigt. Richtig wäre: fünf Werte plus Bescheiddatum eingeben, sofort „Es fehlen X Punkte bis Pflegegrad n", und direkt weiter zum Widerspruch.
- **Das Ergebnis nennt keinen Euro-Betrag.** „Pflegegrad 3" sagt niemandem etwas; „599 € im Monat, jeder Monat ohne Antrag ist weg" schon. Die Zahlen liegen im Code bereit.

**Kinder bis 18 Monate** werden nach § 15 Abs. 7 SGB XI anders eingestuft — ab 12,5 Punkten Pflegegrad 2 statt 1, und in Modul 4 ersetzt Kriterium 4.K alle anderen. Der Rechner kann das nicht und würde ein zu niedriges Ergebnis zeigen. Er **warnt jetzt ausdrücklich davor** und schickt diese Gruppe direkt zu `/antrag`. Das Verfahren einzubauen wäre ein eigener Auftrag.

---

## 6. Befehle

Alles prüfen (Rechenkern, Klassenabdeckung, Kontraste):

```bash
cd "/Users/thees/Desktop/Claude/Pflege/pflegegeld-antrag" && npm run pruefen
```

Jede Seite im echten Browser laden und auf Abstürze prüfen (Server muss laufen):

```bash
cd "/Users/thees/Desktop/Claude/Pflege/pflegegeld-antrag" && npm run seiten
```

Lokal ansehen:

```bash
cd "/Users/thees/Desktop/Claude/Pflege/pflegegeld-antrag" && npm run build && npx next start -p 3311
```

Bilder neu bauen (laedt die Originale und legt die Duotone darueber):

```bash
cd "/Users/thees/Desktop/Claude/Pflege/pflegegeld-antrag" && npm run bilder
```

Vorschaubild fuer geteilte Links neu bauen:

```bash
cd "/Users/thees/Desktop/Claude/Pflege/pflegegeld-antrag" && npm run vorschau
```

Ausrollen:

```bash
cd "/Users/thees/Desktop/Claude/Pflege/pflegegeld-antrag" && npx vercel --prod
```

---

## 7. Wo was liegt

| Datei | Wofür |
|---|---|
| `src/lib/nba.ts` | Rechenkern, 64 Kriterien aus Anlage 1 plus ein internes Tor, beide Rechtsstände |
| `src/lib/nba.test.ts` | 75 Prüfungen, mit `node --no-warnings` ausführbar |
| `src/lib/recht.ts` | Zitierte Rechtsfakten, Wortlaut gekennzeichnet |
| `src/lib/leistungen.ts` | Leistungsbeträge 2026 und 2027 |
| `src/lib/speicher.ts` | Datenbank oder Demo — eine Stelle entscheidet das |
| `src/lib/zugang.ts` | Zugangsschutz der Auswertung |
| `datenbank/schema.sql` | Tabellen für Ereignisse und Leads, mit RLS |
| `pruefung/klassen.mjs` | Findet CSS-Klassen im Markup ohne Regel |
| `pruefung/kontrast.mjs` | Rechnet alle Farbpaare nach |
| `pruefung/seiten.mjs` | Lädt alle zehn Seiten im Browser, meldet jeden Absturz |
| `werkzeug/bilder.mjs` | Duotone-Pipeline, eine Graduierung für alle Fotos |
| `werkzeug/vorschaubild.mjs` | Vorschaubild für geteilte Links, 1200 × 630 |
| `public/bilder/HERKUNFT.md` | Bildquellen und die Werte der Graduierung |
| `../Strategie-Pflege-zu-Hause.md` | Die Analyse, auf der das Produkt beruht |
