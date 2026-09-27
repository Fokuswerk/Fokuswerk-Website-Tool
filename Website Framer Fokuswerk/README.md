# Fokuswerk — neue Website (Framer-Projekt „FW neu")

**Stand 27.09.2026: Die Startseite ist leer.** Sechs Entwurfsrunden sind abgerissen worden —
der Kunde hat auf Null gesetzt und sucht Referenzseiten heraus, an denen der Neubau sich
orientieren soll. Navigation, Fußzeile, Farbtoken, Textstile, Komponenten, CMS und alle Bilder
liegen unverändert im Projekt.

**→ Der vollständige Bestand steht in [`Bestand.md`](Bestand.md):** belegte Zahlen, die acht
gebauten Seiten mit Adressen, alle Bild-URLs, das freigegebene Kundenzitat, sämtliche Texte,
Token, Textstile und Komponenten. Wer neu anfängt, fängt dort an — nicht bei der Recherche.

**Vorschau:** https://frank-site-485713.framer.app/ · steht auf **noindex**
**Projekt:** https://framer.com/projects/FW-neu--YPv6DX0m4fRLwI6tlnjF-h7ell

Das Projekt ist eine Kopie der Live-Seite. fokuswerk.de bleibt unberührt. Die übrigen Seiten
(Über uns, Unsere Arbeit, Kontakt, Rechtstexte) hängen weiter am alten Seitenlayout „Main".

---

## Die Entscheidungen dahinter

**Positionierung.** Die alte Seite verkauft Social Media und Content. Die neue verkauft
Websites und Performance Marketing; Content steht als dritter Hebel dahinter und wird nicht
mehr beworben. Der Leitsatz oben — „Mehr Anfragen. Nicht mehr Follower.“ — grenzt bewusst
gegen Content-Agenturen ab und spricht das Zielkundenprofil aus `Strategie Fokuswerk/ICP.md`
an: hochpreisig, notwendiger Bedarf, Wachstumsabsicht.

**Farbe.** Creme-Weiß ist raus (Entscheidung des Kunden). Grund ist Weiß, Schrift ein warmes
Fast-Schwarz **#17161B**, Markenfarbe seit Runde 5 **Orange #FF6A1F** (vorher Zinnober
#E1341B). Orange darf eine ganze Fläche tragen; Primärknöpfe bleiben dunkel bzw. weiß —
knallige Pillen wirken billig. **Offen, ob das nach dem Abriss so bleibt** — das entscheidet
sich an den Referenzseiten.

**Schrift.** Inter und Source Serif 4, **mit exakt der Metrik der alten Seite** — die ist
an fokuswerk.de gemessen, nicht geschätzt: Überschriften −0,06 em, Serifen-Akzent kursiv in
Medium mit −0,08 em, Fließtext 18 px in **Medium** mit −0,04 em und Zeilenhöhe 1,5,
Navigation 14 px mit −0,04 em. Die enge Laufweite und das durchgehende Medium sind der
Grund, warum die alte Seite satter wirkt als ein Standardsatz. **Achtung beim Weiterbauen:**
Solange auf einem Textknoten ein Textstil liegt, ignoriert Framer die Inline-Schrift der
Textläufe. Alle Überschriften mit Serifen-Akzent sind deshalb ohne Stil gebaut, mit
Inline-Schrift und eigenen Größen je Breakpoint. Und: Ein `SET` einer Schrifteigenschaft auf
dem Elternknoten löscht sie aus allen Läufen — danach den Serifen-Lauf neu setzen, sonst
verschmelzen die Läufe.

**Aufbau.** Offen. FITZ67 war sechs Runden lang der Maßstab und hat nicht getragen. Der
Neubau richtet sich nach den Referenzseiten, die der Kunde aussucht.

---

## Was bisher versucht wurde (und warum es abgerissen wurde)

Sechs Runden, alle verworfen. Die Kurzfassung, damit der Neubau nicht dieselben Wege geht:

| Runde | Was gebaut wurde | Rückmeldung |
|---|---|---|
| 1 | Creme-Weiß, Typo-Auftakt auf flacher Fläche | Farbe raus, wirkt billig |
| 2 | Weiß + Zinnober, FITZ67-Aufbau, Bild-Auftakt | „extrem billig, zu unaufgeräumt" |
| 3 | Jede Sektion eigene Komposition, Nummerierung 01–09 | weiter nicht getroffen |
| 4 | Runde Ecken, Squircle, eingerückte Farbblöcke, Schatten | „alles noch so kantig" war damit erledigt, der Rest nicht |
| 5 | Orange statt Zinnober, Scroll-Bewegung, FITZ67-Stimme | Layout blieb unangetastet |
| 6 | Aufbau neu: 14 Bänder → 7 Abschnitte, Galerie als Rückgrat | „das ist noch nichts" — alles auf Null |

**Was daraus zu lernen ist:** Das Problem lag nie an Details, die nachgeschärft wurden. Sechs
Runden lang wurde innerhalb derselben Formensprache variiert. Der Neubau sollte deshalb an
**konkreten Referenzseiten** ansetzen, die der Kunde selbst aussucht — nicht an einer weiteren
Interpretation der bisherigen Richtung.

---

## Fallen beim Weiterbauen

Aus den Runden 1 bis 6 zusammengetragen — das kostet sonst jedes Mal wieder eine Stunde:

- **Ein `SET` einer Schrifteigenschaft auf einem Textknoten löscht sie aus allen Textläufen.**
  Werden zwei Läufe dadurch identisch, verschmilzt Framer sie und der Akzent ist weg. Läufe
  immer einzeln setzen, nie im selben Befehlsblock wie den Elternknoten.
- **Ein Textstil schlägt die Inline-Schrift der Läufe.** Zweifarbige Überschriften deshalb
  lieber als zwei gestapelte Textknoten mit Zeilenhöhe unter 1 bauen — so bleibt die
  responsive Stufung des Stils erhalten. Der zweiten Zeile `tag="p"` geben, sonst stehen zwei
  `h1` im Quelltext.
- **Ein `appearEffect` auf einem Container setzt Kinder mit eigener `opacity` dauerhaft auf 0.**
  Das Logoband deshalb nie in einen animierten Container hängen.
- **Parallax braucht Überstand.** Faustregel: Weg ≈ (Geschwindigkeit−100 %) × (Abschnittshöhe
  + Fensterhöhe). Im Auftakt: 112 % bei 780 px Bühne heißt 1080 px Bildhöhe und −150 px Versatz.
- **`gap` ist bei `stackDistribution="space-between"` ein Fehler, kein Hinweis.** Stattdessen
  `stackDistribution="start"` und ein Kind auf `width="1fr"`.
- **Links auf `/#anker` werden stillschweigend verworfen**, wenn das Ziel keine `elementId` hat.
  Anker zuletzt verdrahten und danach prüfen.
- **Menü-Links über `textStylePreset` mit `tag="h2"`** landen als h2 im Quelltext — für SEO
  auf `p` zwingen.
- **Bilder lassen sich über den Agenten nicht hochladen.** Sie kommen aus dem Projekt, aus der
  Unsplash-Suche oder als Bildschirmaufnahme externer Adressen.

## Woher die Zahlen stammen

Jede Zahl auf der Seite kommt aus eurem eigenen CMS oder aus den Strategieunterlagen:

- +156 % mehr Buchungen · Zwillis Padel — CMS, Case Study „Zwillis“
- +72 % längere Verweildauer · WinHadi — CMS, Case Study „WinHadi“
- 69 Bewerbungen · Patio — CMS, Case Study „Patio“
- ca. 2.000 € Wert eines Werkstattkunden — `Strategie Fokuswerk/ICP.md`

Das Rechenbeispiel im Performance-Block ist als Rechenbeispiel ausgewiesen, nicht als Zusage.
**Erfunden ist nichts.**

---

## Offene Punkte — bitte entscheiden

1. **Die Website-Galerie.** Von den acht gezeigten Seiten ist WAV ein zahlender Kunde unter
   eigener Domain. Die übrigen sieben sind Entwürfe und Pitches auf vercel.app-Adressen.
   Weil die Galerie jetzt die halbe Startseite trägt, steht unter ihr **ein ehrlicher
   Einzeiler**, der genau das sagt. Streichen Sie ihn, sobald die Seiten auf echten Domains
   liegen — oder sagen Sie Bescheid, wenn er raus soll.
2. **Preis.** Die FAQ sagt bewusst keine Zahl, weil in den Unterlagen keine steht. Eine
   Spanne („ab X €“) ist der stärkste einzelne Vertrauenshebel auf so einer Seite.
3. **Eigene Bilder fehlen.** Im Projekt liegt kein einziges echtes Fokuswerk-Foto — alle
   Bilder der alten Seite sind Stockmaterial aus der gekauften Vorlage. Über den Agenten
   lassen sich keine Dateien hochladen. Gebraucht werden, direkt im Framer-Editor hochgeladen:
   Porträts von euch beiden (liegen als `Desktop/Fokuswerk/Julius.jpg` und `Thees.jpg`),
   ein Showreel für den Auftakt (`Desktop/Fokuswerk/Ads/Videos/Website.mp4`), ein
   quadratisches Favicon und ein OG-Bild. **Favicon und OG-Bild sind aktuell noch das
   Zahnrad und das Motiv der gekauften Vorlage.**
4. **Die übrigen Seiten.** Über uns, Unsere Arbeit, Kontakt und die Rechtstexte sind noch alt.
5. **„Made in Framer“-Badge** — verschwindet mit einem bezahlten Plan.
6. **Strukturierte Daten** stehen in `strukturierte-daten.html`. Erst nach dem Livegang auf
   der echten Domain einfügen (Settings → General → Custom Code → End of head).
7. **Livegang-Schalter:** Alle Seiten stehen auf `noindex`, damit die Vorschau nicht gegen
   fokuswerk.de antritt. Vor dem Livegang auf der echten Domain entfernen.

---

## SEO und Auffindbarkeit in KI-Assistenten

- Genau ein `h1` (der Claim), darunter `h2` je Abschnitt, `h3` je Leistung. Die Menü-Einträge
  standen anfangs fälschlich als `h2` im Quelltext und sind auf `p` korrigiert.
- Titel und Beschreibung nennen Leistung + Ort: „Websites & Performance Marketing in Oldenburg“.
- Der Ort steht im Fließtext, nicht nur in der Fußzeile — Oldenburg, Ammerland, Ostfriesland,
  Bremen. Das ist das, was ChatGPT und Perplexity beim Zitieren aufgreifen.
- Die FAQ ist in ganzen Sätzen geschrieben und deckt die Fragen ab, die Leute tatsächlich
  eintippen. Zusammen mit dem FAQPage-Markup ist das der wirksamste GEO-Hebel auf der Seite.
- Alle Bilder haben Alternativtexte.
- Ladezeit: die acht Website-Aufnahmen sind die schwersten Elemente. Sie liegen unterhalb des
  ersten Bildschirms und werden von Framer verkleinert ausgeliefert; im Auftakt liegt bewusst
  kein Bild, damit der erste Bildschirm sofort steht.
