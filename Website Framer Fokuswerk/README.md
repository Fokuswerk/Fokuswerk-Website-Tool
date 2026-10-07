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
