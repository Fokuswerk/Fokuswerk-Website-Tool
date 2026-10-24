# Eigene Befunde aus dem Durchgang am Bildschirm

Das, was nur im laufenden Bild zu sehen ist — die Agents lesen Code, nicht Pixel.

## Behoben
1. **Schrittzähler sprang.** „Schritt 2 von 17" wurde nach der Wahl „Über Eck"
   zu „Schritt 3 von 19". Ersetzt durch den Abschnittsnamen; der Balken oben
   zeigt den Fortschritt. (commit 72e3d23d)
2. **„an der linke Wand".** Dativform lag im Planer bereit, wurde aber nicht
   benutzt. (commit 72e3d23d)

## Offen
3. **Geräteschilder überlagern sich im 3D-Bild auf dem Handy.** Auf dem
   Ergebnisschirm liegen „Dunstabzug" und „Kühlschrank" übereinander, „Backofen"
   und „Spülmaschine" fast. Auf dem Desktop passt es. Lösungsrichtung: auf
   schmalen Flächen nummerierte Punkte mit Legende darunter statt Text im Bild.
   Stelle: src/components/warm/Kuechenraum.tsx, Geraetemarke.

## Geprüft und in Ordnung
- Die Einblendung (0,3 s) ist nicht zu langsam; die leeren Bildschirme in
  meinen Aufnahmen waren Aufnahmen mitten in der Bewegung.
- `prefers-reduced-motion` ist global abgefangen.
- Flache Produktfotos (Flachschirmhauben) wirken in der Kachel klein — das
  entspricht dem Produkt, kein Fehler.
