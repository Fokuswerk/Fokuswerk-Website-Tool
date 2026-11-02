# Bildherkunft

Unsplash-Lizenz (freie Nutzung, auch gewerblich, ohne Namensnennungspflicht).
Vor dem echten Start durch eigene Aufnahmen ersetzen.

| Datei | Unsplash-Kennung | Motiv |
|---|---|---|
| hero-* | photo-1747330201652-dbebf32eceb7 | Hände einer älteren Person auf einem Gehstock |
| gespraech-* | photo-1685608625836-7b081c676483 | Zwei Frauen im Gespräch an einem Tisch |

## Graduierung

Beide Bilder laufen durch dieselbe Duotone-Rechnung in `werkzeug/bilder.mjs`:
Tiefen Petrol `rgb(10 43 64)`, Lichter fast neutral `rgb(236 242 246)`, Kontrast 1,08.

Der Grund: vorher lagen hier vier Fotos aus vier Lichtsituationen — ein ausgebranntes
Fensterbild, ein Sepia-Motiv, ein Sofa mit grünem Kissen. Nebeneinander lesen die sich als
vier Einkäufe, nicht als eine Bildsprache. Ein gemeinsamer Ton macht daraus einen Satz und
nimmt gleichzeitig die Fremdfarben aus einer Seite, die sonst nur Petrol und Hellblau kennt.

Neu bauen mit `npm run bilder`. Die Originale landen in `.bilder-roh/` und bleiben
ausserhalb des Repos.
