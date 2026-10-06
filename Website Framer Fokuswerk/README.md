# Fokuswerk — neue Website (Framer-Projekt „FW neu")

**Stand 28.09.2026: Startseite neu gebaut nach dem Relaunch-Prompt und neun Referenzseiten,
Runde 2 nach Rückmeldung umgesetzt.** Details je Referenz und Mechanik: [`Referenzen.md`](Referenzen.md).

**Vorschau:** https://frank-site-485713.framer.app/ (noindex)
**Projekt:** https://framer.com/projects/FW-neu--YPv6DX0m4fRLwI6tlnjF-h7ell
**fokuswerk.de ist davon nicht betroffen.**

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
