# Fokuswerk — Website

Next.js 16, React 19, Tailwind 4. Statisch vorgerendert, eine Serverfunktion
für das Anfrageformular.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run typecheck
npm run qa           # Barrierefreiheit, tote Links, Überlauf, Meta
npm run shots        # Bildschirmfotos nach qa/shots/
```

`qa` und `shots` erwarten einen laufenden Server; Standard ist
`http://localhost:4341` bzw. `4340`, abweichend über `BASIS=…`.

---

## 1. Die Idee, auf der alles steht

**Die Seite ist selbst der Beweis.** Fokuswerk verkauft Content, Kampagnen und
Websites — also wird nicht behauptet, dass wir das können, sondern vorgeführt.
Drei Schaustücke tragen die Seite:

| Baustein | Was es beweist |
|---|---|
| `Buehne` | Browserfenster mit einer Karriereseite, davor das Telefon mit der Anzeige, die darauf führt. Content, Ads und Web in einem Bild. |
| `Vorgehen` | Scroll-Sequenz über fünf Schritte: links laufen die Schritte durch, rechts steht ein Rahmen fest und wechselt vom Foto über Anzeige und Seite bis zum Werbekonto. |
| `Produktion` | Filmstreifen mit Perforation und Zeitcode, vom Scrollstand gezogen statt von einer Uhr. Kein Karussell — er bewegt sich nur, solange gescrollt wird. |
| `Werbekonto` | Zwei gemessene Varianten, 4,92 € gegen 218 € je Bewerbung — und der Moment, in dem die teure abgeschaltet wird. |
| `Rechner` | Zwei Regler, ein Ergebnis: was eine unbesetzte Stelle diesen Betrieb im Jahr kostet. Seine Zahlen, nicht unsere. |

### Aufbau der Startseite

**Titelbereich** (dunkel, mit dem Beleg im selben Band) · **01 Was wir machen** ·
**02 Das Vorgehen** (Scroll-Sequenz) · Zwischenstopp · Filmstreifen ·
**03 Warum das trägt** · **04 Die Fälle** · **05 Die Rechnung** · Abschluss.

Dunkel wird es dreimal, und nie zweimal hintereinander: Titelbereich,
Filmstreifen, sowie Rechnung und Abschluss als ein zusammenhängender Block.

**Die Seite verkauft Performance Marketing, nicht Recruiting.** Kunden und
Mitarbeiter stehen gleichwertig nebeneinander — Kampagnen zuerst, Produktion
und Seiten als das, was ihnen zuliefert. WAV ist der eine Fall mit
freigegebenen Zahlen, nicht das Thema der Seite.

### Der Titelbereich

Dunkel, weil der Rest hell ist: der Bruch beim ersten Scrollen ist der stärkste
Takt, den eine Seite hat. Darüber liegen zwei Ebenen, die sich langsam bewegen —
ein Punktraster und zwei warme Lichter (`.buehne-grund`). Beides ist Grafik,
kein Bild, kostet nichts an Ladezeit und skaliert auf jede Bildschirmgröße.

Der Beleg steht im selben Band, nicht als eigener Abschnitt darunter: Der erste
Einwand ist „behaupten kann das jeder", und der wird beantwortet, bevor er
entsteht.

**Der Grund ist ein Hauch neben Reinweiß.** `#fbfaf9` statt `#ffffff`: reines
Weiß hat kein Material. Zusammen mit dem Korn, das als feste Ebene über der
ganzen Seite liegt, bekommt die Fläche Oberfläche, ohne cremig zu werden.

**Zwei dunkle Bänder geben Takt.** Dunkel wird es dort, wo gerechnet und
entschieden wird — beim Rechner und im Abschluss samt Fuß. Technisch ist ein
Band nur die Klasse `.band`: sie schreibt dieselben Farbvariablen mit anderen
Werten neu, und jeder Baustein folgt mit. Kein zweiter Satz Klassen.

> **Fallstrick 1:** Die Farbwerte im `@theme` müssen fest sein, keine Verweise
> auf weitere Variablen. Ein `var()` in einer auf `:root` deklarierten Variablen
> wird bereits dort aufgelöst — `.band` könnte den Wert dann nicht mehr ändern.

> **Fallstrick 2, hat einmal zugeschlagen:** Die Ausgangszustände der Enthüllung
> tragen zwei Attribute (`[data-reveal][data-from="scale"]`) und sind damit
> spezifischer als `[data-reveal="shown"]`. Ohne die zusätzliche Regel
> `[data-reveal="shown"][data-from]` bleibt die Skalierung **dauerhaft** stehen —
> eine große Karte steht dann 36 px neben der Fluchtlinie ihrer Überschrift.

**Ein kursives Wort je Überschrift.** Instrument Serif kursiv, mit einem Marker
dahinter, der beim Erscheinen von links auffährt. Das ist der größte einzelne
Unterschied zwischen „sauber gebaut" und „gestaltet" — und es wirkt nur,
solange es bei einem Wort bleibt.

**Die Kopfleiste schwebt.** Liegt unter ihr ein dunkles Band, kehrt sie
dieselben Variablen um wie das Band (`.kopf-dunkel`), setzt aber keinen eigenen
Grund — sonst läge sie wie ein Brett auf der Seite.

---

## 2. Was nicht behauptet wird

Es werden **keine Referenzen, Kennzahlen oder Zitate erfunden.**

- Unter „Außerdem in Betreuung" stehen nur Gewerk und Ort — keine Kennzahlen.
  Die genannten Betriebe waren bereits auf der alten Website öffentlich; vor dem
  Livegang trotzdem einmal die Einwilligung bestätigen lassen.
- Im `Werbekonto` stehen nur die beiden Werte, die aus dem Konto belegt sind.
  Die dritte getestete Variante hat keine überlieferte Zahl und taucht deshalb
  als Zeile nicht auf.
- Das Zitat von Alexander Lüers ist **nicht freigegeben** und steht nirgends.
- Kein Live-Dashboard, keine Reichweiten, keine „15+ Kunden", kein
  Gründungsjahr — der GbR-Start (04/2025) widerspricht dem früher genannten
  „seit 2022".

Alles Geschäftliche steht in `src/lib/inhalt.ts`.

---

## 3. Umgebungsvariablen

| Variable | Zweck | Pflicht |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Basis für Canonicals, Sitemap, Open Graph | empfohlen |
| `RESEND_API_KEY` | Versand des Anfrageformulars | **ja** |
| `ANFRAGE_AN` | Empfänger, Vorgabe `contact@fokuswerk.de` | nein |
| `ANFRAGE_VON` | Absender, Domäne muss bei Resend verifiziert sein | nein |

Ohne `RESEND_API_KEY` antwortet `/api/anfrage` mit 500 und das Formular zeigt
Telefonnummer und E-Mail als Ausweichweg — die Anfrage geht nie still verloren.

---

## 4. Aufbau

```
src/app/
  globals.css        Designsystem: Token, .band, Korn, Bewegung, Regler
  layout.tsx         Schriften, Metadaten, strukturierte Daten
  page.tsx           Startseite
  fallstudien/…      Fallstudie WAV Westerstede
  kontakt, danke, impressum, datenschutz
  api/anfrage        Serverfunktion Formular
  opengraph-image.tsx
src/components/
  Bewegung.tsx       ein Beobachter, eine Bildschleife, kein Framework
  abschnitte/        die Abschnitte der Startseite
  geraete/           Bühne, Werbekonto
  seite/             Kopf, Fuß, Rechtstext
  ui/
src/lib/inhalt.ts    Stammdaten, CTA, belegte Zahlen, Rechengrößen
```

### Der Filmstreifen

Kein Bilderband: eigene Filmbasis, **rechteckige** Perforation wie bei 35 mm als
SVG-Kachel (rund wäre der Fehler, an dem man einen nachgebauten Streifen sofort
erkennt), Bildstege zwischen den Kadern, Randbeschriftung, Vignette je Kader und
eine warme, leicht flaue Gradation. Gezogen wird er vom Scrollstand, nicht von
einer Uhr.

### Kopfleiste und Menü

Die Kopfleiste schwebt als Pille über der Seite und kehrt über dunklen
Bändern ihre Farben um (`.kopf-dunkel`). Der Schalter („Menü" plus zwei
Linien) öffnet auf jeder Bildschirmgröße dasselbe Vollbildmenü — übernommen
aus der ersten Fassung, weil das an ihr wertig war: Einträge in voller
Displaygröße, die gestaffelt aus einer Maske fahren; beim Überfahren treten
die anderen zurück und eine Beschreibungszeile erscheint (`navigation[].zeile`
in `inhalt.ts`); rechts Schaltfläche und Kontakt.

> **Fallstrick, hat zugeschlagen:** Der Weichzeichner der Menüfläche steht als
> **Inline-Style** in `Kopf.tsx`, nicht im Stylesheet. Im Stylesheet gesetzt
> kam `backdrop-filter` an `.overlay-grund` nicht an — der berechnete Wert im
> Browser war `none`, die Seite stand scharf hinter dem Menü. Die genaue
> Ursache ist nicht geklärt (im ausgelieferten CSS taucht `backdrop-filter`
> auf). Die Kopfleiste setzt ihren Weichzeichner ebenfalls inline und war nie
> betroffen. Also: `backdrop-filter` inline setzen und im Browser prüfen,
> nicht im kopflosen Testbrowser — der rendert ohne GPU.
>
> Zweiter Teil desselben Fehlers: Das Overlay darf kein Scroll-Container sein.
> Gescrollt wird in `.overlay-innen`.

### Aufbau beim Scrollen

Die Einblendungen hängen am **Scrollstand, nicht an einer Uhr** (CSS
`animation-timeline: view()`). Wer schnell scrollt, bekommt die Inhalte so
schnell fertig, wie er scrollt — es gibt nichts, worauf man warten müsste. Wer
langsam scrollt, sieht jeden Abschnitt entstehen. Fertig ist ein Element, wenn
es ein knappes Drittel ins Bild gefahren ist.

- Blöcke steigen und blenden auf, Überschriften Wort für Wort mit leichtem
  Aufrichten, Bilder öffnen sich als Maske von unten, die Prozessschiene zieht
  sich und ihre Punkte füllen sich der Reihe nach.
- Gestaffelt wird über die Strecke statt über die Zeit: `Bewegung.tsx` leitet
  aus `--reveal-delay` (ms) einen `--versatz` (%) ab, 25 ms = 1 %.
- **Nur Langformen** (`animation-name`, `animation-timeline` …), keine
  `animation`-Kurzform — die setzt `animation-timeline` stillschweigend auf
  `auto` zurück.
- Die Bildmaske wächst am Ende über die Kante hinaus (negatives `inset`), sonst
  bliebe der Schatten des Rahmens dauerhaft abgeschnitten.
- Der Titelbereich (`.titel-zone`) bleibt bei der Uhr-Fassung: er steht beim
  Laden schon im Bild und tritt nach dem Auftakt auf.
- Browser ohne Scroll-Zeitleisten bekommen die Uhr-Fassung; bei
  `prefers-reduced-motion` ist alles sofort da.

### Menü-Choreografie

Öffnen: Die Fläche fällt als Vorhang von oben (`clip-path`), an ihrer Kante
läuft eine Haarlinie in der Hausfarbe mit. Dann ziehen sich die Trennlinien von
links auf, die Einträge steigen aus der Maske und richten sich dabei auf
(`skewY` → 0), Nummern und rechte Spalte folgen gestaffelt.

Schließen läuft schneller und rückwärts: Die Einträge treten ab, dann zieht sich
der Vorhang hoch. Die Verzögerungen stehen deshalb nur im geöffneten Zustand —
im geschlossenen wären sie beim Schließen genauso lang wie beim Öffnen.

### Auftakt

Beim ersten Aufruf je Sitzung stehen vier Eckwinkel an den Bildschirmrändern
und ziehen sich auf die Wortmarke zusammen — die Kamera stellt scharf. Dann
hebt sich die Blende nach oben weg (`Intro.tsx`). Unter 1,7 Sekunden, ein Klick
oder eine Taste überspringt, bei `prefers-reduced-motion` gar nicht. Die Seite
darunter ist fertig gerendert, der Auftakt liegt nur darüber.

### Bewegung
Alles läuft über `Bewegung.tsx`: ein IntersectionObserver und eine
rAF-Schleife. Bewegt werden ausschließlich `transform`, `opacity`, `filter`
und `background-size` — nie Layout.

- `data-reveal` (`data-from="left|right|scale|blur"`) — Erscheinen
- `data-split` — Überschrift Wort für Wort; das kursive Wort bleibt als Ganzes
  stehen, weil es den Marker trägt
- `data-zahl` — zählt hoch, sobald sichtbar
- `data-tilt` — Neigung zum Zeiger, nur auf Zeigergeräten
- `data-szene` — schreibt `--p` von 0 auf 1, während das Element ins Bild
  fährt. `data-szene="lang"` rechnet über den gesamten Durchlauf statt bis zur
  Bildmitte — dafür gedacht, lange Bewegungen wie den Filmstreifen zu ziehen.
  Getragen wird die Bewegung von `.szene-geraet`, `.szene-parallaxe` und
  `.fw-streifen`; geschrieben wird nur eine Zahl, den Rest macht CSS.

`prefers-reduced-motion: reduce` schaltet alles ab, Inhalte bleiben sichtbar.

---

## 5. Bilder

Die Aufnahmen unter `public/bilder/` sind **Platzhalter** aus generativer
Erzeugung nach fester Art Direction: dokumentarisch, Tageslicht aus
Hallenfenstern, warm-neutral, leicht entsättigt, Menschen bei der Arbeit, kein
Blickkontakt zur Kamera. Sie sind so kalibriert, dass echte Aufnahmen vom
nächsten Drehtag sie ohne Bruch ersetzen: gleiche Datei überschreiben,
Seitenverhältnis beibehalten, neu bauen.

Bildunterschriften behaupten nirgends, wer auf einem Bild zu sehen ist.

**Fehlt noch:** der Screenshot aus dem Meta-Werbekonto für die Fallstudie.
Das Schaustück `Werbekonto` stellt die belegten Zahlen in eigener Gestaltung
dar — es ist bewusst kein nachgebauter Screenshot.

---

## 6. Auslieferung

Vercel. `vercel.json` setzt die Sicherheits-Header und hält die Seite unter
`*.vercel.app` auf `noindex` — die Regel ist an den Host gebunden und greift
nicht mehr, sobald die echte Domain auf das Projekt zeigt.
