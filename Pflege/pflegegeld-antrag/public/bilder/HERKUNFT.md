# Bildherkunft

Unsplash-Lizenz (freie Nutzung, auch gewerblich, ohne Namensnennungspflicht).
Vor dem echten Start durch eigene Aufnahmen ersetzen.

| Datei | Unsplash-Kennung | Motiv |
|---|---|---|
| hero-* | photo-1658632302217-984d432b4d38 | Älteres Paar zu Hause, er beugt sich zu ihr im Sessel |
| gespraech-* | photo-1685608625836-7b081c676483 | Zwei Frauen im Gespräch an einem Tisch |

## Keine Tönung

Eine frühere Fassung legte eine gemeinsame Duotone über alle Bilder, um Fotos aus
verschiedenen Lichtsituationen zusammenzuhalten. Technisch hat das funktioniert, als
Tönung war es aber sichtbar und wurde verworfen.

Das Problem löst jetzt die **Auswahl** statt der Nachbearbeitung: zwei dokumentarische
Aufnahmen bei Tageslicht, beide in ruhigen, gedämpften Farben, beide ohne jemanden, der in
die Kamera lächelt. Zugeschnitten wird mit `position: "attention"`, damit nicht stumpf die
Mitte genommen wird.

Neu bauen mit `npm run bilder`. Die Originale landen in `.bilder-roh/` und bleiben
ausserhalb des Repos.
