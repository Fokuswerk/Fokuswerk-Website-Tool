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

Titelbereich · Beweisband · **01 Was wir machen** (fünf Leistungen mit dem, was
hineingeht und was herauskommt) · **02 Das Vorgehen** (die Scroll-Sequenz) ·
**03 Warum das trägt** · **04 Die Fälle** · **05 Die Rechnung** · Abschluss.

Die Seite spricht **Handwerk und technische Betriebe** an, nicht nur
Kfz-Werkstätten. WAV ist der eine Fall mit freigegebenen Zahlen, nicht das
Thema der Seite.

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

### Der Sucher

Das eine Element, das sich durch die ganze Seite zieht. Vier Eckwinkel liegen
fest über der Seite und rasten beim Scrollen auf das Element ein, das gerade in
der Bildmitte steht — wie der Autofokus einer Kamera. Es kommt aus der
Bildmarke und aus dem, was wir tun.

Ziele werden über `data-fokus="Kennung"` markiert; die Kennung erscheint als
Zeile unter dem Rahmen. Regeln, damit es dezent bleibt:

- nur auf Zeigergeräten ab 62 rem, nie auf dem Handy
- nur, solange ein Ziel näher als 42 % der Bildhöhe an der Mitte steht
- Haarlinien in der Hausfarbe, im dunklen Band die aufgehellte Fassung
- bei `prefers-reduced-motion` wird gar nicht erst gerendert

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
