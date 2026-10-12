# Referenzanalyse — was genau übernommen wird

Aufgenommen am 28.09.2026, jede Seite im Browser durchgegangen. Dies ersetzt die erste,
zu oberflächliche Auswertung.

## Spector — fünf Mechaniken

**1. Auftakt: Netz am Cursor.** Über dem randlosen Foto liegt ein Canvas. **Erst bei
Mausbewegung** erscheint ein trianguliertes Drahtnetz mit Knotenpunkten, das um den Zeiger
aufleuchtet und mit Abstand ausblendet. Dazu ein kleines Wort-Label am Cursor („ELEVATE").
→ Braucht eine Code-Komponente mit Canvas. Mit Framer-Bordmitteln nicht nachbaubar.

**2. Scroll-Text.** Eine sehr große Aussage über vier Zeilen, breiter als der Bildschirm.
Die Zeilen **färben sich beim Scrollen nacheinander von hellgrau auf schwarz** — nicht Wort
für Wort, sondern Zeile für Zeile. Zwischen den Zeilen Haarlinien.

**3. Bilder unter dem Auftakt: waagerechtes Akkordeon.** Sechs Bilder nebeneinander, randlos
über die volle Breite. **Beim Überfahren wird das Bild breit, die anderen schrumpfen** zu
schmalen Streifen. Weiche Breiten-Animation, im aufgeklappten Bild erscheint unten der Titel.

**4. Knöpfe.** Weiße Pille mit dünner Kontur, Label plus **langer, dünner Pfeil in Rot**, der
sich bewegt.

**5. Kunden: gezogenes Karussell.** Logos waagerecht, das mittlere groß und scharf, die
benachbarten **kleiner und zunehmend unscharf**. Pfeile links/rechts, Greifhand-Cursor —
also ziehbar. Kein Endlos-Marquee.

Dazu gesehen: Kennzahlen-Block mit sehr großen Ziffern, rotem Balken an der linken Kante und
Haarlinien zwischen den Zeilen.

## Norell — Bild-Hover

Standard: Bild scharf, Kundenlogo mittig, volle Größe.
Beim Überfahren: **Bild wird unscharf und dunkler**, das Logo **schrumpft und rutscht nach
unten**, darüber blendet ein **runder Knopf in Signalfarbe mit ↗** ein. Alles weich, ~0,4 s.

## Bauwerk Hamburg — Menü

Kein deckendes Panel. Ein **Vollbild-Overlay mit `backdrop-filter: blur(40px)`** und nur
**30 % dunkler Tönung** — die Seite bleibt sichtbar, aber vollständig unscharf. Das ist der
Grund, warum es hochwertig wirkt.
- Menüpunkte in **Serifenschrift**, groß, linksbündig, ohne Ziffern, ohne Trennlinien
- rechts ein **großes Outline-Monogramm** als Grafik
- oben rechts ein dünnes ✕
- unten klein: Telefon, Anschrift, Mitgliedschaften
- Einträge gleiten leicht nach oben ein, gestaffelt
Dazu im Auftakt: Bildschirm 50/50 geteilt (Navy / Foto), rechts wechseln Adjektive per
Überblendung mit leichtem Versatz.

## Bungee — Unschärfe am unteren Rand

**Sieben absolut positionierte Schichten**, je 180 px hoch, unten am Fenster fixiert.
Jede Schicht hat einen **doppelt so starken Blur** wie die vorige — 0,23 · 0,47 · 0,94 ·
1,88 · 3,75 · 7,5 · 15 px — und eine **Verlaufsmaske, deren sichtbares Band pro Schicht um
12,5 % nach unten wandert**. Dadurch läuft die Unschärfe stufenlos von null auf 15 px.
Das ist Apples Liquid-Glass-Prinzip, und es ist in Framer nachbaubar
(`backgroundBlur` + `masks.0.mask`).

## Norda — Ebenen im Auftakt

Auftakt ist ein randloser Bildwechsler (01—03, Pfeile, Projektname) mit sehr großer Wortmarke
darüber. **Beim Runterscrollen schrumpft das Vollbild in eine zentrierte Karte**, dahinter
werden gestapelte weitere Bilder sichtbar, deren Oberkanten hervorschauen. Scrollgebundene
Skalierung plus Radius.

## Agero — Überschriften und Blöcke

- Kleines Label **in runden Klammern**, zentriert, grau: `(Intro)`, `(Awards)`
- Dahinter eine **riesige Geister-Überschrift** in sehr hellem Grau, über die der Inhalt
  darunter hinwegscrollt
- Listen als **dreispaltige Zeilen mit Haarlinien**: links kleines graues Label, Mitte der
  Titel in Schwarz, rechts ein kleines graues Label. Keine Karten.

## Skala — Details

- Label in **eckigen Klammern**: `[ PROPERTIES ]`
- Überschrift mischt **Sans und Serif-Kursiv**: „Featured *Properties*"
- Karten: Bild füllt die Karte, Angaben liegen **auf dem Bild** unten, dazu eine Zeile mit
  kleinen Icons; rechts unten ein **weißer runder Knopf mit ↗, in die Ecke eingelassen**
- Kopfzeile: Hamburger links, Bildmarke mittig, dunkle Pille „Let's Talk ↗" rechts

## Homy — Leistungswähler

Bereits umgesetzt: aktives Feld breit mit Bild, inaktive schmal mit großer Geisterziffer.

---

## Was daraus für Fokuswerk gebaut wird

| # | Element | Quelle | Status |
|---|---|---|---|
| 1 | Netz am Cursor im Auftakt | Spector | Code-Komponente nötig |
| 2 | Arbeiten als waagerechtes Akkordeon | Spector | ersetzt das 2-Spalten-Raster |
| 3 | Bild-Hover: Blur, Dimmen, runder ↗-Knopf | Norell | ersetzt die Overlay-Leiste |
| 4 | Menü als Glas statt deckender Fläche | Bauwerk | Umbau |
| 5 | Progressive Unschärfe am unteren Rand | Bungee | sieben Schichten |
| 6 | Kunden als ziehbares Karussell mit Unschärfe-Abfall | Spector | ersetzt das Logoraster |
| 7 | Zeile-für-Zeile-Aufhellung beim Scrollen | Spector | ersetzt Wort-Reveal |
| 8 | Langer Pfeil in Signalfarbe am Knopf | Spector | Umbau |
| 9 | Labels in eckigen Klammern | Skala | durchgängig |
| 10 | Geister-Überschrift hinter dem Inhalt | Agero | in zwei Abschnitten |
| 11 | Auftaktbild schrumpft beim Scrollen in eine Karte | Norda | scrollgebunden |

---

## Umsetzungsstand nach Runde 2 (28.09.2026, Nachmittag)

Rückmeldung von Thees zur ersten Fassung: Netz zu wild, weißer Balken über dem Auftakt, Menü nicht
wie Bauwerk, Kunden nicht als Rad, Leistungen zu sprunghaft, Arbeiten gefallen nicht, es fehlt Tiefe,
Serifenschrift ganz raus, Abschluss ohne die rote Linie, Links ohne Farb-Wisch. Diesmal wurde bei
jeder Referenz **der Code der Effekte aus den JS-Bundles gelesen** statt nur hingeschaut.

| # | Element | Referenz | Umsetzung |
|---|---|---|---|
| 1 | Netz im Auftakt | Spector „Mesh“ | `code/Netzfeld.tsx` neu: Quadratraster 40 px mit Diagonalen (je Punkt die 6 nächsten Nachbarn), Linienhelligkeit aus dem Foto (0,03–0,55), Wölbung radial vom Zeiger weg (Radius 350 px, max. 60 px, Smoothstep), Linien am Zeiger bis 3× heller, Etikett mit Kanälen (META ADS, SEO …) läuft am Zeiger mit. Ohne Zeiger steht das Netz still. |
| 2 | Navigation | Wunsch Thees | Zustand „Oben“ ohne Balken mit heller Schrift, ab 40 px Scroll „Leiste“. Fixiert. Umschalten per Override `code/Navigation.tsx` (nur wenn die Seite einen Abschnitt `#auftakt` hat, sonst sofort Leiste). |
| 3 | Menü | Bauwerk | Milchglas 40 px Blur auf 30 % Tinte, gleitet in 1,5 s von rechts über die Seite (Seite bleibt sichtbar); Menüpunkte 56 px Inter, steigen gestaffelt aus Masken; Umriss-„F“ rechts; Kontaktzeile unten. Ebenen müssen `zIndex 10` haben (Framer hängt das Overlay ans Seitenende). |
| 4 | Knöpfe & Links | Spector „Default BTN“/„Small BTN“ | Orange Kopie der Beschriftung, per Masken-Verlauf von links nach rechts eingewischt; langer Pfeil (Spector-Form, `code/Pfeil.tsx`) fährt raus, zweiter fährt rein. Knopf als Pille. Bausteine: Knopf, Verweis, Navpunkt, Menüpunkt, Großlink. |
| 5 | Kunden | Spector „Magic Roundabout“ | `code/Kundenrad.tsx`: 3D-Ring, Radius 420, Perspektive 1700, eine Runde in 40 s, hintere Logos unscharf (bis 7,5 px) und blass, greifen/ziehen, Trackpad seitlich, Scrollen gibt einen Schubs, Überfahren rastet ein. |
| 6 | Tiefe im Auftakt | Norda | Auftakt klebt (`sticky`), der Kunden-Abschnitt schiebt sich darüber. Ein zusätzlicher Scroll-Effekt auf der Hülle wurde wieder entfernt (Framer wandte ihn auf den ganzen Auftakt an → milchig). |
| 7 | Aussage beim Scrollen | Spector „Line 1–4“ | Vier versetzt eingerückte Zeilen mit Haarlinien, Anfang grau, Pointe dunkel, jede Zeile gleitet von rechts ein. |
| 8 | Leistungen | Homy „Our Services“ | `code/Leistungsfelder.tsx`: Inhalte haben ihre Endbreite und werden nur freigelegt (kein Umbruch beim Aufziehen), gestaffelte Überblendung, Stichworte als Glas-Chips im Bild. Unter 760 px Akkordeon. |
| 9 | Arbeiten | Spector „Featured Projects“ | `code/Arbeitsraster.tsx`: 3×2, überfahrene Kachel doppelt so breit, ihre Reihe 64 %, Titel/Ort unten mittig, runder ↗-Knopf (Norell). Darunter Großlink „Ihr Projekt als Nächstes“. |
| 10 | Ergebnisse + Stimme | Agero „Testimonial“ | Geister-Überschrift „Ergebnisse“ mit Verlauf, Kennzahlen-Karte links, Bildkarte mit Zitat rechts (Inter statt Serif). |
| 11 | Abschluss + Standort | Vidaro CTA | Lichtlinie: rotierender Farbkegel (`conic-gradient`, Loop 12 s bzw. 16 s) hinter 2 px Rand, Karte darüber. |
| 12 | Serifenschrift | Wunsch Thees | Komplett entfernt (Stile „Zitat“, „Menü“ und alle Akzentläufe auf Inter). |
| 13 | Etiketten | Skala | Durchgehend in eckigen Klammern. |
| 14 | Handy/Tablet | — | Alle waagerechten Kopfzeilen, Kette, Beratung, Agentur, Standort, Fragen, Fußzeile auf Handy gestapelt (vorher Buchstabensalat). |

**Nicht umgesetzt / offen:** Unterseiten (/leistungen/*, /arbeiten, /agentur, /kontakt) und die
Rechtstexte (/impressum, /agb, /datenschutz) sind weiterhin leer — alle Links zeigen deshalb auf
Anker der Startseite, „Projekt besprechen“ im Abschluss öffnet eine Mail. Die Rechtstexte stehen
wörtlich in `Seitentexte.md`.

**Prüf-Hinweis:** Der eingebaute Browser liefert nur Bilder, solange sein Bereich sichtbar ist.
Verlässlich: `readProject` mit `{type:"screenshot", url}` (ganze Seite) bzw. mit der Breakpoint-ID
(Handy `DwpOhPzme`, Tablet `Np0vhDBkT`).

---

## Runde 3 (28.09.2026): Ergebnisse-Stil über die ganze Seite

Wunsch: den Aufbau von „07 Ergebnisse“ durchziehen. Das Muster besteht aus vier Teilen:
1. Etikett in eckigen Klammern, **mittig**, als Satz („[ BELEGT, NICHT BEHAUPTET ]“), nicht als Rubrik.
2. **Geisterwort** (Agero) — Inter 600, 232/150/84 px (Desktop/Tablet/Handy), −0,065 em,
   Verlauf von 16 % auf 0 % Tinte, in einer Zeile mit fester Höhe 150/104/60 px, damit die
   Karten darunter es überdecken. Das Geisterwort ist die h2 des Abschnitts.
3. **Kartenpaar**: dunkle Karte (Tinte, Radius 18, Haarlinien in Papier 16 %) + Bildkarte mit
   Verlauf von unten und Text auf dem Bild. Karten-Reihe `zIndex 1`, Einblenden 60 px von unten,
   zweite Karte 0,1 s später.
4. Graue Hinweiszeile mittig darunter.

| Abschnitt | Etikett | Geisterwort | Karten |
|---|---|---|---|
| 03 System | (unverändert) | — | Viererkette als dunkle Karte, Tablet 2×2 mit Trennlinien |
| 04 Leistungen | DREI DISZIPLINEN, EIN SYSTEM | Leistungen | Leistungsfelder unverändert, Kopftext wurde Hinweiszeile |
| 05 Arbeiten | AUSGEWÄHLTE PROJEKTE | Arbeiten (hell auf Tinte) | Raster unverändert, Vorlauf + Domain-Hinweis zu einer Hinweiszeile zusammengelegt |
| 06 Beratung | ERST FRAGEN, DANN BAUEN | Beratung | Bildkarte mit Aussage links, dunkle Karte mit den fünf Fragen rechts |
| 09 Agentur | AGENTUR · OLDENBURG | Agentur | dunkle Karte „Zwei Gründer“ + zwei Porträt-Bildkarten, Standort-Karte bleibt darunter |
| 10 Fragen | KLARHEIT VOR DEM ERSTGESPRÄCH | Fragen | dunkle Karte mit Titel + Telefon, weiße Karte mit dem Akkordeon (Abschnitt jetzt Papier statt Weiß) |

Auftakt, Kunden, Ergebnisse und Abschluss sind unverändert.

**Falle:** `DUPE` kopiert **keine Breakpoint-Überschreibungen** — Geisterzeile und -wort kamen auf
Tablet/Handy mit Desktopmaßen (232 px) an. Nach jedem Duplizieren die Replikate
(`Np0vhDBkT…`, `DwpOhPzme…`) explizit setzen.

## Runde 4 (28.09.2026): Glas, Netz, Kundenrad, Leistungen, Arbeiten, Beratung

| Punkt | Rückmeldung | Umsetzung |
|---|---|---|
| Glaskante unten | „muss noch geiler“ | Neue Code-Komponente `code/Glaskante.tsx` statt der sieben Framer-Schichten: 8 Schichten bis 32 px (Handy 24 px), 200/170/130 px hoch, Sättigung 1,7 + Aufhellung, Tönung übernimmt die Hintergrundfarbe des Abschnitts darunter (weiche Überblendung), in Chromium leichte Lichtbrechung (SVG-Displacement als `backdrop-filter: url()`), Schichten ragen seitlich 64 px über den Rand (keine dunklen Kanten). |
| Netz im Auftakt | „zu doll“ | Nur Instanzwerte: helle Linien 0,55 → 0,24, dunkle 0,03 → 0,01, Linie 0,7, Raster 46, Wölbung 38, Radius 440, Nachlauf 0,06, Etikett 70 % Deckkraft. |
| Leistungsfelder | Ziffer überlappt beim Aufziehen den Text | Ziffer blendet beim Wechsel aus, springt unsichtbar an den Endplatz (Box in Endbreite des Feldes), kommt nach 0,86 s zurück; offener Inhalt erst ab 0,5 s. |
| Kundenrad | „nicht geil genug“, Swipen | Logos auf hellen Karten, abgewandte Karten ausgeblendet (`backface hidden` + Deckkraftkurve), Ziehen 1:1 unter dem Finger (Grad pro Pixel aus dem Radius), Loslassen mit Federschwung aus der echten Geschwindigkeit. Kopf im Ergebnisse-Stil (Geisterwort „Kunden“). |
| Scrollen | „Swipen fühlt sich nicht geil an“ | Framers „Smooth Scroll“-Komponente, Intensität 12. |
| Arbeiten | „nicht 10/10“, Performance fehlt | Umschalter „Websites / Kampagnen“ im Arbeitsraster. Kampagnen: je Kunde Anzeigenvorschau im Handyrahmen + drei belegte Kennzahlen (Case Studies), zählen beim Einblenden hoch; schmal als wischbare Reihe. **Motive sind Unsplash-Beispiele, als „BEISPIELMOTIV“ markiert; Schlagzeilen sind Platzhalter.** Die Zahlen stammen aus Content-/Social-Arbeit, nicht ausdrücklich aus bezahlten Anzeigen. |
| Beratung | zu ähnlich wie Ergebnisse | Breites Bildband mit der Aussage oben, darunter fünf helle nummerierte Karten statt Bild- + dunkler Karte. |

## Runde 5 (28.09.2026): Unterseiten im selben Stil

Alle neun Unterseiten gebaut, je mit Tablet- (810) und Handy-Breakpoint (390), alle auf noindex mit
eigener Beschreibung. Bausteine wie auf der Startseite: Etikett in Klammern, Geisterwort (Größe aus
der Wortlänge), dunkle Karte + Bildkarte, helle nummerierte Karten, Hinweiszeile.

| Seite | Aufbau |
|---|---|
| /leistungen/performance-marketing | Kopf (H1 in dunkler Karte + Bild) · 3 Leistungen · Rechenbeispiel als Kette (als Beispiel ausgewiesen) · Kampagnen (Arbeitsraster, Start „Kampagnen“) · Ablauf · 4 Fragen · Abschluss |
| /leistungen/websites | Kopf (WAV-Bildschirmfoto) · 3 Leistungen · Arbeiten (Raster) · Ablauf · 4 Fragen · Abschluss |
| /leistungen/content | Kopf · 3 Leistungen · Ergebnisse mit Content-Zahlen (Hotel Alte Werft, Patio, Zwillis) · Ablauf · Abschluss |
| /arbeiten | Raster (dunkel, Geisterwort ist h1) · Liste aller 8 Seiten mit Status live/Entwurf · Ergebnisse · Abschluss |
| /agentur | Kopf · Gründer-Porträts · Haltung (3 Karten) · Standort-Karte · Abschluss |
| /kontakt | Dunkle Karte mit Telefon/Mail/Adresse + Formular (Framer Forms, Komponente „Senden“ mit Zuständen) · Standort · 4 Fragen |
| /impressum, /agb, /datenschutz | Geisterwort als h1, Text wörtlich aus `Seitentexte.md` in weißer Karte |

Glaskante und Smooth Scroll liegen jetzt im Layout-Template (gelten für alle Seiten), die Kopien auf
der Startseite sind entfernt. Navigation, Menü, Fußzeile und alle „Projekt besprechen“-Knöpfe zeigen
auf die neuen Seiten (Leistungen bleibt Anker `/#leistungen`).

**Werkzeug:** `code/_baukasten-unterseiten.js` erzeugt die Blöcke samt Breakpoint-Werten und
überträgt beim Duplizieren von Startseiten-Abschnitten deren Tablet-/Handy-Werte (DUPE tut das nicht).

**Framer-Fallen dieser Runde:**
- Seiten mit Layout-Template: `layout`/`fill` am Seiten-Breakpoint werden abgewiesen — die kommen aus
  dem Template-Breakpoint.
- Verlauf als Textfarbe nur am RichTextNode, nicht an TextRuns.
- `stylePresetHeading*`/`stylePresetParagraph` nur bei CMS-gebundenem Text — sonst Blöcke direkt formatieren.
- Formular: erst `formSubmitButtonId` am Formular setzen, dann die Zustände (`formButton*Variant`) am Knopf.
- `hoverEffect` geht nicht auf einer Komponenten-Variante (nur Gesture-Variante).

**Offen:** Empfänger der Formular-Mails im Framer-Editor prüfen (Forms → E-Mail an contact@fokuswerk.de).
Die Datenschutzerklärung ist wörtlich übernommen — sie erwähnt Hosting/Server-Logs bei Framer und
Google-Maps-Link nicht; vor dem Livegang von jemandem mit Rechtsblick prüfen lassen.

## Runde 6 (28.09.2026): Arbeitsschau statt Arbeitsraster

Wunsch: „ein paar Website-Elemente, ein paar Content-Elemente, wichtig sind die Performance-Marketing-
Elemente — erstmal Beispielwerte und Firmen, richtig gut visualisiert.“ Die geplanten zusätzlichen
Unterseiten (Leistungs-Tiefenseiten, Branchen, Fallstudien-CMS) wurden damit zurückgestellt.

Neue Code-Komponente `code/Arbeitsschau.tsx`: Bento-Raster (12/6/1 Spalten) mit Filter
Alle · Performance · Websites · Content, Kacheln blenden per Layout-Animation um.

| Kachel | Art | Inhalt (Beispielwerte) |
|---|---|---|
| Kampagnen-Cockpit | Performance | 4 Kennzahlen, Wochenkurve Anfragen + € je Anfrage, Hover-Tooltip, Kurve zeichnet sich |
| Meta-Anzeige | Performance | Handy mit Anzeige, schwebende Kennzahlen (schmal: Reihe darunter) |
| Google-Suchanzeige | Performance | nachgebautes Suchergebnis mit Sitelinks, Klickrate/CPC/Anfragen |
| Vom Klick zum Auftrag | Performance | Trichter Impressionen → Aufträge mit Übergangsquoten |
| Kosten je Anfrage | Performance | Balken über sechs Monate, −67 % |
| Recruiting | Performance | Bewerbungszähler + Verlaufslinie |
| Reel | Content | Hochformat mit Wiedergabe-Balken, Aufrufe |
| Bildwelt | Content | aufgefächerte Fotoserie, spreizt beim Überfahren |
| WAV, Hotel Kämper | Website | Browserrahmen, scrollt beim Überfahren durch die echte Seite |

Beispielfirmen: Werkstatt Harms, Dachtechnik Freese, Motorgeräte Harms, Praxis Lindenhof, Optik am
Wall, Autohaus Meinen, Tischlerei Wübbens — alle erfunden, Kacheln als „Beispiel“ markiert, Hinweis
unter dem Raster. Eingesetzt auf `/` (Alle), `/arbeiten` (Alle), `/leistungen/performance-marketing`
(Performance). `/leistungen/websites` behält das Arbeitsraster.

**Strukturdaten:** `code/Strukturdaten.tsx` schreibt JSON-LD. Organisation (ProfessionalService +
WebSite, aus `strukturierte-daten.html`) liegt im Layout-Template → auf jeder Seite. FAQPage auf `/`,
`/kontakt`, `/leistungen/websites`, `/leistungen/performance-marketing`, gelesen aus den
Frage-Instanzen der jeweiligen Seite. Live geprüft: gültiges JSON.

## Runde 7 (28.09.2026): Branchen-Landingpages nach Keyword-Analyse

Keyword-Daten und Zuordnung: `Keyword-Analyse.md`. Seiten: `/branchen` (Übersicht),
`/branchen/zahnaerzte`, `/branchen/aerzte`, `/branchen/handwerk`, `/branchen/werkstaetten`,
`/branchen/optiker`. Aufbau je Seite: Brotkrumen · Kopf (H1 mit Keyword) · Kurz gesagt (GEO-Antwort)
· Ausgangslage · Lösung (verlinkt) · Beispielkampagne (`code/Branchenbeispiel.tsx`, importiert
Cockpit/Meta/Google/Trichter aus `Arbeitsschau.tsx`) · Referenzen (wo vorhanden) · Ablauf · Fragen ·
weitere Branchen · Abschluss · JSON-LD (Service, BreadcrumbList, FAQPage).
Seitendaten: `code/_branchenseiten-daten.js`. Startseite auf „Werbeagentur Oldenburg“ ausgerichtet.
„Branchen“ in Navigation, Menü und Fußzeile (Fußzeile jetzt: Aussage oben, vier Spalten darunter).
Standort-Blöcke auf Startseite, Agentur und Kontakt entfernt (Wunsch).

Framer-Falle: Links auf Seiten, die noch nicht existieren, werden abgewiesen — erst alle Seiten
anlegen, dann bauen. Typecheck kennt Importe zwischen Code-Dateien nicht, Framer selbst schon.

## Runde 8 (28.09.2026, abends): Rückmeldung zur Startseite

| Punkt | Umsetzung |
|---|---|
| Wörter am Zeiger im Auftakt raus | Netzfeld: Etikett aus |
| Runterswipen im Auftakt „geiler“ | `code/Auftaktbewegung.tsx`: Auftakt tritt als Karte zurück (0,88, Radius 36), Foto zoomt gegenläufig + dunkler, Zeilen driften auseinander und lösen sich unscharf auf; Kunden-Abschnitt als Blatt mit runden Ecken + Schatten darüber |
| Kundenlogos enger, alle Logos | Kundenrad: Ring wird mit Wiederholungen dicht besetzt (16 Plätze für 8 Logos), Radius aus Kartenbreite + Abstand, vordere Karte 1:1 |
| Positionierung | 4 Zeilen + dunkle Kette ersetzt durch zentrierte Aussage + `Systemkette.tsx` |
| Leistungen + Fotos | `Leistungsbuehne.tsx` statt Leistungsfelder; Bilder: WAV/Glanzwerk-Screenshots + ausgesuchte Unsplash-Motive |
| „j“ in „Ihr Projekt als Nächstes“ | Maske schnitt Unterlängen ab (mask-clip = Box). Orange Kopie liegt jetzt in gepolsterter Hülle, Maske auf der Hülle |
| Porträts | Julius (`Sz9jcIEwrt…png`) und Thees (`NqvOvMvJ7R…png`) von fokuswerk.de, Startseite + /agentur |
| Abschluss | Laufband „Mehr Anfragen. Nicht mehr Follower.“, Karte zweigeteilt mit Kontaktkarte (Porträts, Telefon, Mail), `Lichtfeld.tsx`; Anschrift entfernt |
| Links landen mitten auf der Seite | Framers Smooth Scroll hielt die Scrollposition über den Seitenwechsel → `Sanftscroll.tsx` |
| Hover verbuggt (Karten, Projektliste) | 315 Hover-Effekte hatten `scale 1.1` → überall 1 |
| Glas verdeckt Fußzeile | Glaskante blendet auf den letzten ~280 px aus |
| „Branchen“ nicht nennen | Aus Navigation/Menü raus, Fußzeile „Marketing für“, Etiketten neutral, Pfade: `/marketing-fuer-zahnarztpraxen`, `/website-fuer-aerzte`, `/website-fuer-handwerker`, `/werbung-fuer-kfz-werkstaetten`, `/werbung-fuer-optiker`; `/branchen` ist Entwurf (nicht gelöscht) |
| Tiefere Leistungsseite | Neue Seite `/leistungen` (Auftakt + Leistungsbühne, Systemkette, je Leistung 5–6 Bestandteile, Ablauf, 5 Fragen + FAQPage, Abschluss); Navigation, Menü und Brotkrumen zeigen darauf |

Framer-Falle: Masken schneiden alles außerhalb der Box ab (mask-clip), `maskRepeat` hilft nicht — Unterlängen bei engem Zeilenabstand brauchen eine gepolsterte Hülle. Overrides werden nur als `export function withX(Component): ComponentType` erkannt, nicht als `export const withX = fabrik(...)`.

## Runde 9 (29.09.2026): Unterseiten im neuen Stil

| Seite | Änderung |
|---|---|
| alle Unterseiten mit Abschluss (10 + /leistungen) | Alter zentrierter Abschluss ersetzt durch Kopie des neuen (Laufband, Kontaktkarte mit Porträts, Lichtfeld), immer letzter Abschnitt vor den Strukturdaten — auf /website-fuer-handwerker und /werbung-fuer-kfz-werkstaetten stand „Auch für“ vorher dahinter |
| /leistungen/performance-marketing, /websites, /content | Stockfoto im Kopf ersetzt durch `code/Szenenkarte.tsx` (Anzeigen-Stapel, echte Seiten, Filmstreifen — importiert aus `Leistungsbuehne.tsx`) |
| /agentur | Kopfbild = gemeinsames Gründerfoto von fokuswerk.de (`t1CH7uFbaJ…png`, nur 690 px breit); „Beispielbild · Porträt folgt“ → „Gründer · Fokuswerk“ (auch Startseite) |
| /kontakt | Dunkle Karte mit Lichtfeld und Porträtzeile „Sie sprechen direkt mit Julius oder Thees“ |

Falle wieder zugeschlagen: temporäre IDs (`szk`) sitzungsweit — in Schleifen immer Zufallssuffix. Ein fehlgeschlagenes `+Node` im Batch hindert ein `DEL` im selben Batch nicht.

## Logo (29.09.2026)

Altes Logo von fokuswerk.de (`QSjrlcV7i9FA2Gti2IOOggshbk.png`, 2500 × 1000, #353535 auf transparent) freigestellt und
in Papier- bzw. Tintenfarbe per `framer.uploadImage` (Data-URL) hochgeladen: hell `42gH3mHn5IlpD08SdYTVCXNlUvA.png`,
dunkel `XPPzrspWd5J7uNOdFaWKZRNjr0.png`. Eingesetzt in Navigation (Variante „Oben“ hell, „Leiste“ dunkel, 87 × 34),
Menü-Overlay (hell) und Fußzeile (volle Breite, `height="fit-image"`, 10 % Deckkraft). Favicon und Apple-Touch-Icon =
`9ZZPpsDQjV7WcGQQTNZWRbHI.png` wie auf der alten Seite. **Upload über die Agent-API funktioniert.**

## Runde 10 (29.09.2026): Rückmeldung Auftakt, Navigation, Kunden, Verständlichkeit

| Punkt | Umsetzung |
|---|---|
| Auftaktbild zu handwerklich | Unsplash `photo-1761063198868-63111aa75ef3` (abstrakter orangefarbener Lichtbogen, 6000 px), auch als Helligkeitsvorlage fürs Netz; Alternative war `photo-1652952424461-fa9f593165a2` (Studio mit Kamera) |
| Weißer Balken / Navigation unsichtbar | Ursache: auch helle Unterseiten hatten `elementId="auftakt"`, die Navigation hielt sie für dunkle Auftakte. Startseiten-Auftakt heißt jetzt `auftakt-dunkel`; `Navigation.tsx` prüft bei Scroll, Seitenwechsel (MutationObserver) und direkt statt per rAF |
| Menü | Liste weiter rechts (Desktop 150 px, Tablet 56 px), Umriss-„F“ ersetzt durch helles Logo (460 px, Tablet 280, Handy aus); Scrollen hinter offenem Menü gestoppt (`Sanftscroll` hält Lenis an, solange der Knoten „Glas“ im Dokument hängt) |
| Kunden | + Universität Oldenburg, Vapiano (SVG von deren Seiten, hochgeladen), WAV Westerstede (Logo von wav-wst.de); Überfahren hält das Rad nicht mehr an; nach Einrasten dreht es nach 2,2 s weiter |
| Positionierung | Animation startet früher (fertig, wenn die Karte in der oberen Hälfte steht), Kopfzeile über den Bausteinen; Texte in Alltagssprache (Gesehen werden · Überzeugen · Anfrage bekommen · Besser werden) |
| Zu kompliziert | Einfache Sprache in Positionierung, Leistungen (Online-Werbung, Websites, Fotos & Videos), Arbeiten (jede Kachel: Überschrift + ein Satz, was man sieht; Rubriken Werbung/Websites/Fotos & Videos), Beratung (Fragen statt Fachbegriffe) |

Code-Steuerfelder mit Objekt-Arrays lassen sich per DSL nicht setzen und die Instanz speichert die alten Standardwerte → bei neuen Standardtexten das Steuerfeld umbenennen (Systemkette `stufen`, Leistungsbühne `werbung`/`website`/`fotos`).

## Runde 11 (29.09.2026): Auftakt „das gewisse Extra“

- Schärfezug beim Laden: Zeilen kommen aus 20 px Unschärfe (1,5 s, gestaffelt) — `Auftaktbewegung.tsx`.
- `code/Fokusklammer.tsx`: orange AF-Eckwinkel mit Etikett „FOKUS“, suchen „System.“ im Text des Claim-Rahmens
  (Überschrift bleibt echter Text), rasten nach 1,8 s mit Federschwung ein, blinken zweimal, stellen alle 6,5 s nach,
  folgen der Zeile beim Scrollen. Messung per rAF + direkte Zeitgeber (rAF läuft in Hintergrund-Tabs nicht).
- `code/Auftaktleiste.tsx` unten im Auftakt (Hülle absolut, bottom 40 / Handy 28): Scroll-Hinweis + drei belegte
  Ergebnisse (Zwillis +156 % Buchungen, Patio 69 Bewerbungen, WinHadi +72 % länger auf der Website), zählen hoch.
- Farbkorrektur: Fläche „Tönung“ (Signal-Orange, Mischmodus `color`, 60 %) über dem Foto — der Lichtbogen kippte ins Gelbgrüne.

## Runde 12 (29.09.2026): ruhiger, cleaner

- „Mehr Anfragen. Nicht mehr Follower.“ **mag er nicht mehr** — Laufband in allen 12 Abschlüssen gelöscht (Abstand oben wieder
  140 px, Handy 96 px), Bildkarte Performance → „Jeder Euro nachvollziehbar.“, JSON-LD-Slogan → „Sichtbarkeit ist kein Zufall. Sie ist ein System.“
- Auftakt-Scroll ruhiger: keine seitliche Drift, kaum Unschärfe, Zeilen sind bei p ≈ 0,35 weg; Karte 0,92 statt 0,88; Foto-Zoom 1,14;
  Feder fast direkt (Lenis glättet schon). Fokus-Klammern blenden per `withAuftaktKlammer` bis p = 0,12 aus, Einrasten nach 2 s.
- Kundenrad: Scrollschub 0,035 (vorher 0,12), gedeckelt auf ±10°, langsamer abklingend.
- Sanftscroll Stärke 15 (lerp ≈ 0,09) — gleitet ruhiger, große Wischer tragen weiter.

## Runde 13 (29.09.2026): Unterseiten in einfacher Sprache

Alle Unterseiten außer Rechtstexten: 463 Texte gesichtet, ~200 umgeschrieben. Liste: `code/_einfache-sprache-ersetzungen.json`
(exakte Texte, Geisterwörter, Teilsätze, Überschriften-Läufe, Knöpfe, Fragen). Wortwahl: Online-Werbung statt Performance
Marketing, Fotos & Videos statt Content, Google-Anzeigen / Facebook & Instagram statt Google/Meta Ads, „neue Mitarbeiter finden“
statt Recruiting, Auswertung statt Tracking, „bei Google gefunden werden“ statt (Local) SEO, „In ChatGPT & Co. auftauchen“ statt GEO,
„Seiten für einzelne Angebote“ statt Landingpages. Beispielkampagnen: „Ihr Monatsbericht auf einen Blick“, „Stellenanzeige auf Instagram“.
**Bewusst stehen gelassen:** Suchbegriffe in H1/Titel/Meta der SEO-Seiten und einzelne Fragen („Lohnt sich Google Ads …“), JSON-LD.
Falle: Lauf-Ersetzungen („beides“, „ lassen.“) greifen auch in Fließtext — drei Stellen danach zurückgesetzt. Lauf-Ersetzungen künftig auf Knoten-IDs begrenzen.

## Runde 14 (29.09.2026): Positionierungssatz, Glas, Vorspann, Formular

- **Auftakt-Claim neu:** „Performance Marketing, das messbar Kunden bringt.“ (H1 = Zeile 1, 90/58/40 px), Untertitel erklärt den
  Begriff: „Das heißt: Wir schalten Ihre Werbung bei Google und Instagram, bauen die passende Website und zeigen Ihnen jeden Monat,
  was eine Anfrage gekostet hat …“. Kennerzeile „WERBEAGENTUR IN OLDENBURG · PERFORMANCE MARKETING & WEBSITES“. Fokus-Klammern auf „Kunden“, ohne Etikett.
- **Glaskante:** blendet erst ab ~60 px Scrollweg ein (Kennzahlen im Auftakt frei), klarer: Tönung 0,22, Sättigung 1,9, Brechung 22, 9 Schichten bis 28 px.
- **`code/Vorspann.tsx`** im Layout-Template (fixed, zIndex 10, letzte Ebene): Logo zieht scharf, AF-Klammern rasten ein, Ladelinie
  „FOKUS xx %“ nach echtem Bildladestand, mind. 1,6 s (zweiter Besuch in der Sitzung 0,7 s), fährt per clip-path nach oben weg,
  sperrt solange das Scrollen, sendet `fokuswerk:vorspann-ende`. Auftaktbewegung, Fokusklammer und Auftaktleiste warten darauf
  (`nachVorspann`, Notaus 6 s). CSS-Notaus blendet die Fläche nach 5 s aus. Nur beim echten Laden, nicht bei Seitenwechseln.
- **Kontaktformular:** Telefon ist Pflicht („TELEFON *“), neues optionales Feld „IHRE WEBSITE (FALLS VORHANDEN)“ (Name „Website“, Typ Text).
- **Test:** Das verborgene Browser-Pane rendert gar nicht (auch CSS-Animationen stehen) — Animationen mit
  `code/_vorspann-test.py` im Headless-Chrome prüfen (Pfad zur vorhandenen chrome-headless-shell, Bilder geblockt).

## Runde 15 (29.09.2026): Klammern, Klicks, Fußzeile

- Fußzeile: Claim „Performance Marketing, das messbar **Kunden bringt.**“ (Akzent orange).
- Fokus-Klammern richten sich nach den sichtbaren Buchstaben (Canvas `measureText`: Versalhöhe bis Grundlinie) statt nach der
  Zeilenbox — die ragte bei Zeilenhöhe 0,94 in die obere Zeile. Etikett komplett ausgebaut.
- **Nichts war anklickbar:** Die leere Hülle des Vorspanns (fixed, 100vh, zIndex 10) blieb nach dem Ablauf über der Seite liegen und
  fing alle Klicks ab. Instanz jetzt `pointerEvents="none"`; der Vorspann selbst nimmt Klicks nur, solange er sichtbar ist.
- Prüfskript `code/_klick-test.py` (Headless-Chrome): Menü oben und ganz unten anklicken, Klammer-Ausschnitt fotografieren.

## Runde 16 (29.09.2026): gleich hohe Kartenpaare auf /leistungen

Die drei Leistungsblöcke (dunkle Übersicht + Liste) hatten feste Pixelhöhen und passten auf breiteren Fenstern nicht mehr.
Jetzt Raster: `layout="grid" gridColumnCount="3" gridRowHeightType="auto"`, dunkle Karte Spalte 1, Liste Spalten 2–3, beide
`height="1fr"` (Verhältnis 1 : 2). Tablet/Handy: wieder Stapel senkrecht, Höhe auto.
Framer-Falle: `height="1fr"` im Raster wird bei `gridRowHeightType="fit"` abgelehnt („only supported for relative children“) — mit
`auto` geht es; außerdem muss das Raster in einem eigenen Schritt vor den Kindern gesetzt werden.

## Runde 17 (29.09.2026): SEO-/GEO-Check und alles direkt Behebbare

Bericht: SEO-GEO-Check.md (Abschnitt „Behoben am 29.09.2026“ oben).
- FAQ-Antworten lagen im geschlossenen Zustand auf `visible=false` → fehlten im HTML. Jetzt sichtbar mit Höhe 0 + clip + Deckkraft 0; FAQPage-JSON-LD auf 10 Seiten aus den Frage-Instanzen neu erzeugt (48/48 wörtlich gleich).
- Textstil-Presets setzen das HTML-Tag und schlagen das Tag am TextBlock: neue Stile „Display XL (H2)“ (CTA-Titel) und „Marke (H1)“ (Kenner-Zeile Startseite = H1).
- Screenshots als WebP (6,1 → 0,77 MB), Hero-Text im Intro deckend (sonst zählt LCP erst nach der Einblendung): LCP 41,5 s → 6,0 s, Performance 55 → 68.
- Eigene 404 unter /404, og-bild.png überall, Organization-JSON-LD mit Logo/Bild/Slogan, Kontrast-Tokens angehoben.
- Framer liefert nach dem Veröffentlichen minutenlang eine 26-KB-Hülle ohne Inhalt/robots-Meta — erst prüfen, wenn `server-timing` `ssg-status="optimized"` meldet.

## Runde 18 (29.09.2026): SEO-Gesamtbewertung und Ratgeber

Bericht: `SEO-Gesamtbewertung.md` (Punktestand ≈ 60/100 nach Livegang; Engpass Local/Off-Page).
- Keyword-Recherche 130 Begriffe (Apify steadyfetch, DE) + Google-Top-20 für 12 Begriffe + Maps. fokuswerk.de nur bei „fokuswerk“ vorn.
  Google-Profil: „Fokuswerk – Marketing & Social Media“, 5,0 ★, 9 Bewertungen, Kategorie Online-Marketing-Unternehmen.
- **Ratgeber**: CMS-Sammlung „Ratgeber“ (U5PmsPpqa), Übersicht `/ratgeber` (q8OrTidx9), Vorlage `/ratgeber/:Ratgeber` (OBgoEqkRa),
  23 Artikel als Markdown in `Ratgeber/`, Import über `Ratgeber/_import.py` → `/tmp/fw_ratgeber_import.json` → `collection.addItems`
  mit `contentType:"markdown"`. Seitentitel der Vorlage `{{SEO Titel}}`, Beschreibung `{{Beschreibung}}`, JSON-LD je Artikel im Feld „Strukturdaten“.
- Neue Textstile: Artikel H1/H2/H3/Text, Linkstil „Artikel Link“ (Tinte, orange Unterstreichung).
- Abschnitt „Aus dem Ratgeber“ (3 Artikel, Filter `isIncludedIn` auf Slug) vor dem Abschluss auf 9 Seiten; Builder `code/_ratgeber-seiten.js`.
- Korrigiert: LinkedIn-Link zeigte auf fremde Firma (/company/fokuswerk = „Lukas Keller“) → /company/fokuswerk-media; Instagram → @fokuswerk.
- Framer-Fallen: CMS-Variablen erst binden, wenn `collectionList` am Vorfahren gesetzt ist (eigener Batch vorher);
  `toDateString` will `capitalize` als Boolean → weglassen; `textTransform` geht nicht bei gesetztem Textstil;
  `fill` an Seiten mit Layout-Vorlage verboten; neue CMS-Seiten stehen nach dem Veröffentlichen länger auf `spa-fallback`.
- **Welle 2 (29.09.2026):** 10 weitere Artikel (Datenschutz/Impressum, Cookie-Banner, GA4, Conversion-Rate, Website mieten/kaufen,
  Social Media, TikTok, Newsletter, Zielgruppe, Online-Marketing für kleine Unternehmen) → 33 Artikel. Import jetzt als Upsert:
  `code/_ratgeber-import.js` (per Slug aktualisieren, neue anlegen, Reihenfolge aus `REIHENFOLGE` in `Ratgeber/_import.py`).
- **Schlussprüfung (29.09.2026):** Ratgeber aus Leiste/Menü und von Start-/Leistungsseiten genommen (bleibt Fußzeile + SEO-Seiten).
  48× hoverEffect.scale 1.1 → 1. Vorspann-Logo als CSS-Maske statt `<img>` (war LCP-Element auf /kontakt, 6,2 s → 1,9 s).
  Einblendungen im ersten Abschnitt aller Unterseiten entfernt (LCP überall ≤ 2,4 s). Leere Menüzeile „Branchen“ gelöscht.

## Runde 19 (29.09.2026): Handy-Audit iPhone 17 (Safari im Simulator + Chromium-Test aller 50 Seiten)

- Startbereich Handy: 100svh statt 100vh (in `withAuftaktFlaeche`), Untertitel „Fließtext“, zweiter Knopf auf dem Handy aus,
  Abstände enger → die drei Ergebnisse stehen auf dem ersten iPhone-Bildschirm. „Patio Oldenburg“ → „Patio“ (wurde abgeschnitten).
- Filter in der Arbeitsschau: `whiteSpace: nowrap`, `flexShrink: 0`, auf schmalen Breiten ohne Zahlen → alle vier passen.
- Hintergrundwörter (Geist) auf Handy/Tablet neu berechnet (Faktor 0,56 statt 0,473), sonst rechts abgeschnitten.
- Fußzeile: eigene Variante „Handy“ (Copyright und Links untereinander, linksbündig).
- Menü-Glas 0,3 → 0,62 Deckkraft (auf hellen Seiten war weiße Schrift kaum lesbar).
- Artikel Handy: Angaben untereinander ohne „·“, Kurzantwort „Fließtext“.
- Seitenweiter Code (headEnd): `format-detection telephone=no` (iOS färbte Nummern blau) + `text-wrap: balance` für h1–h4 und
  `[data-framer-name="Titel|Aussage|Namen"] p`. **`text-wrap: pretty` auf Absätzen verschiebt in Safari die Knopf-Beschriftungen** — nicht verwenden.
- Rufnummer-Texte: „an — 0176 63307587“ mit geschützten Leerzeichen, damit der Strich nicht an den Zeilenanfang rutscht.
- **Hero-Unterzeile neu (29.09.2026, Thees):** Zielgruppe allgemein kleine und mittelständische Unternehmen, keine Branchenaufzählung,
  kein „Das heißt:“. Text: „Websites, Werbeanzeigen bei Google und Instagram, Fotos und Videos – alles aus einer Hand für kleine und
  mittelständische Unternehmen. Jeden Monat sehen Sie schwarz auf weiß, was ein neuer Kunde gekostet hat.“ Claim darüber unverändert.
- **Header entschlackt (29.09.2026, Thees: „überfüllt“, Performance Marketing muss nicht rein):** Kenner-Zeile (H1) nur noch
  „WERBEAGENTUR IN OLDENBURG“; Claim „Marketing, das messbar / Kunden bringt.“; Unterzeile „Websites, Werbeanzeigen, Fotos und
  Videos – aus einer Hand. Jeden Monat sehen Sie, was ein neuer Kunde gekostet hat.“ Fußzeile und Slogan im JSON-LD am selben Abend nachgezogen.
- **„Warum wir anders arbeiten“ am Handy (29.09.2026):** Systemkette hat unter 820 px eine eigene Kompaktfassung (`KompaktKette`:
  Zeitleiste mit Nummer, Titel, Text, Kennzahl; einmaliges Einblenden statt Scroll-Bindung, keine Unschärfe/Drehung/Minigrafiken).
  Aussage am Handy 26 px, „klingelt das Telefon.“ mit geschützten Leerzeichen. Glaskante am Handy ausgeblendet (spiegelte Text,
  Safari hat eigene Glasleiste). Textstil „Fließtext Groß“ auf dem Handy 18 → 17 px.
- **Leistungsbühne Desktop (29.09.2026, Thees: „räumliche Trennung nicht erkennbar“):** kurz ausprobiert: statt Bento (dunkel 7 / hell 5 / sand quer 12)
  jetzt drei gleich breite Karten (je span 4, Abstand 20 px), alle hell mit dunkler Bildfläche, Bild oben, Titel 28 px. Szenen im
  Kompaktmodus. Tablet: Werbung volle Breite, Website + Fotos je halb; Handy untereinander, gleicher Look.
  → **zurückgenommen:** Thees fand das Bento (dunkel 7 / hell 5 / sand quer) besser. Gelöst über die Überschriften: Leistungsname
  groß (44 px Desktop, 34 px sonst) als Überschrift, darunter der Nutzen-Satz (20/18 px), Nummer klein in Orange; Abstand 20 px.
- **Grau statt Tinte als Fläche (29.09.2026, Thees):** neuer Farbton „Grau“ #353535 (Token 4505153f…). 213 dunkle Flächen in Framer
  umgestellt (nicht: Menü-Striche, Plus-Linien), 42 Kontaktkarten rgb(17,14,13) → rgb(43,43,43), Code-Bausteine: Flächen GRAU,
  innere Bühnen rgb(42,42,42) (Leistungsbühne, Systemkette, Arbeitsschau, Szenenkarte), Vorspann-Grund und Menü-Glas grau.
  Schrift bleibt Tinte. Leistungsbühne: alle drei Karten grau, Werbung + Website je span 6, Fotos & Videos quer darunter (span 12).
- Textstil „Display“ am Handy 36 → 30 px („Ihr Projekt als Nächstes“ war abgeschnitten, große Überschriften zu wuchtig).
- **Falle:** `text-wrap: balance` auf Überschriften in Links (`a`) lässt auto-breite Framer-Bausteine auf das längste Wort schrumpfen
  → Regel mit `:not(a *)`; außerdem nur direkte Absätze (`>`) der benannten Ebenen.
