# Fokuswerk — neue Website (Framer-Projekt „FW neu")

**Stand 27.09.2026: Das Projekt ist vollständig leer.** Auf Ansage des Kunden („hau das
Design komplett leer und lösche alle Daten, wir fangen komplett neu an") wurde alles
entfernt — nicht nur die Startseite, sondern das gesamte Designsystem und das CMS.

**fokuswerk.de ist davon nicht betroffen.** „FW neu" war immer nur eine Kopie auf einer
noindex-Vorschau.

**Vorschau:** https://frank-site-485713.framer.app/ (leer)
**Projekt:** https://framer.com/projects/FW-neu--YPv6DX0m4fRLwI6tlnjF-h7ell

---

## Was gelöscht wurde

| | |
|---|---|
| Seiteninhalte | alle 9 Seiten geleert (Startseite, Über uns, Kontakt, Unsere Arbeit, Case-Study-Detailseite, Impressum, AGB, DSGVO, 404) |
| Layout-Templates | „FW 2026" und „Main" — damit sind Navigation und Fußzeile weg |
| Komponenten | 33 Stück: FW Knopf, FW Navigation, FW Fußzeile, FW Frage, FW Registerzeile, Preloader, Logo, Cursor, Buttons, Karten, Akkordeons |
| Farbtoken | alle 36 |
| Textstile | alle 62, inklusive der an fokuswerk.de gemessenen FW-Metrik |
| Linkstile | alle 5 |
| CMS | Collection „Case Studies" mit vier Einträgen |
| Canvas-Seiten | Branding, Gallery, Documentation, Start Here |
| Favicon & OG-Bild | die Reste der gekauften Vorlage |

Übrig sind nur noch die leeren Seitengerüste mit ihren drei Breakpoints. Titel und
Beschreibung der Seite stehen noch — die waren inhaltlich richtig.

## Was ich nicht löschen konnte

- **Die Seiten selbst.** Framer lässt den Agenten keine Seiten entfernen. Wenn die Struktur
  auch weg soll, musst du die Seiten im Editor löschen.
- **Die Detailseite `/unsere-arbeit/:Case Studies`** hängt jetzt an einer gelöschten
  Collection und ist damit kaputt. Die sollte als Erstes raus.
- **Die Bilddateien** liegen weiter im Medienbereich des Projekts. Der Agent kommt an den
  Medienbereich nicht heran; wegwerfen geht nur im Editor.

---

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
