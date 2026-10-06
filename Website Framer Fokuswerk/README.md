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

**Noch offen auf dem Handy:**

- Im Menü-Overlay fehlt „Projekt besprechen“. Das Overlay hängt an einem Framer-Event und ist
  über die Plugin-API nicht erreichbar (weder als Komponente noch als Frame auffindbar) — das
  muss im Framer-Editor von Hand ergänzt werden.
- Zwischen Kontaktkarte und Fuß-Handlungsaufruf steht rund ein halber Bildschirm leer.
- Die Fußzeile ist eine lange einspaltige Linkliste; zweispaltig wäre ruhiger.

## Offen

- Unterseiten und Rechtstexte sind leer (Texte für Impressum/AGB/Datenschutz in `Seitentexte.md`).
- Kontaktformular fehlt; „Projekt besprechen“ im Abschluss öffnet vorerst eine Mail.
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
