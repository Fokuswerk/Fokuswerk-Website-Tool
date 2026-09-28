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

## Umsetzungsstand (28.09.2026)

| # | Element | Stand |
|---|---|---|
| 1 | Netz am Cursor im Auftakt | **fertig** — Code-Komponente `Netzfeld.tsx`, Canvas, trianguliertes Gitter, leuchtet am Zeiger auf (gemessen: Alpha 133 am Zeiger gegen 13 in der Ferne) |
| 2 | Arbeiten als waagerechtes Akkordeon | **fertig** — Komponente `Arbeitsband`, sechs Varianten, Überfahren klappt auf, Farbe kommt zurück, Ziffer verschwindet |
| 3 | Menü als Glas | **fertig** — 42 px Backdrop-Blur auf 58 % Tinte, Einträge in Source Serif |
| 4 | Progressive Unschärfe unten | **fertig** — sieben fixierte Schichten, Blur 0,23 → 15 px, Maskenband wandert je 12,5 % |
| 5 | Langer Signalpfeil am Knopf | **fertig** |
| 6 | Bild-Hover nach Norell | offen — Blur/Dimmen und runder ↗-Knopf fehlen noch auf den Karten außerhalb des Bands |
| 7 | Kunden als ziehbares Karussell | offen |
| 8 | Zeile-für-Zeile-Aufhellung beim Scrollen | offen |
| 9 | Labels in eckigen Klammern | offen |
| 10 | Geister-Überschrift hinter dem Inhalt | offen |
| 11 | Auftaktbild schrumpft beim Scrollen (Norda) | offen |

**Wichtig fürs Prüfen:** Der eingebaute Browser komponiert diese Seite falsch — Text fehlt im
Bildschirmfoto, obwohl er im DOM deckend und sichtbar ist. Verlässlich sind nur
`framer.agent.readProject` mit `{type:"screenshot", url}` auf die veröffentlichte Adresse
oder Messungen per JS (`getBoundingClientRect`, `getComputedStyle`, Canvas-Pixel).
