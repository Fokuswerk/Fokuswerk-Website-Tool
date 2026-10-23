# Serienküche — Prototyp

Klickbarer Produktprototyp für die Serienplanung von Einbauküchen in Wohnbauprojekten.
Ein Projektentwickler lädt Grundrisse hoch, das Werkzeug typisiert sie, plant je Typ und
liefert Mengengerüst, Installationsplan und Bestellvorbereitung.

**Dies ist eine Demo.** Erkennung, Planung und Bestellung sind simuliert. Es gibt keinen
Parser, keinen Solver und keine Herstelleranbindung.

## Starten

```bash
npm install
npm run build && npx next start -p 3000
```

`next dev` bindet auf dem Entwicklungsrechner keinen Port — der Produktionsserver läuft.

## Die acht Bereiche

| Route | Inhalt |
|---|---|
| `/dashboard` | Projektstand, Phase, Typentabelle, nächster Schritt |
| `/projects/demo/documents` | Dokumentenverwaltung, simulierter Verarbeitungslauf beim Upload |
| `/projects/demo/rooms` | Split-View: Typenliste, Grundriss, Eigenschaften mit Herkunft und Freigabe |
| `/projects/demo/types` | 40 Grundrisse → 6 Typen, Zuordnung und Spiegelungen |
| `/projects/demo/planning` | Planungsarbeitsplatz: Wandansicht, Grundriss, Varianten, Gewichtung |
| `/projects/demo/specifications` | Aggregierte Mengen, Stücklisten, unveränderliche Snapshots |
| `/projects/demo/installations` | Anschlusspositionen in der Wandansicht und als Liste |
| `/projects/demo/survey` | Aufmaß je Wohnung, Abweichungen, Bestellvorbereitung |

## Architektur

```
src/
  data/        Demo-Daten: Modulkatalog, Projekt mit Geometrie, Varianten
  lib/
    typen.ts       Datenmodell
    berechnung.ts  Preise, Kennzahlen, Aggregation, Invariantenprüfung
    ableitung.ts   Anschlüsse und Freigabestand aus der Variante abgeleitet
  store/       Zentraler Demo-Zustand, LocalStorage-Persistenz
  components/
    plan/        Grundriss und Wandansicht als SVG aus Geometriedaten
    layout/      Seitenleiste und Rahmen
    ui/          Eigenes Baukastenset
```

**Keine Kostenzahl steht fest im Code.** Jeder Betrag entsteht aus Modulkatalog und
Variantenbelegung. Ein Variantenwechsel wirkt sofort auf Stücklisten, Projektsumme,
Anschlusspositionen und Bestellvorbereitung.

## Grundsätze aus der Konzeptphase, die der Prototyp abbildet

**Millimeter als Integer.** Keine Fließkommazahlen für technische Maße. Koordinaten je
Raum ab linker oberer Innenecke, x nach rechts, y nach unten.

**Herkunft und Freigabe getrennt.** Jedes Attribut trägt, woher der Wert stammt
(`gelesen`, `gerechnet`, `erfasst`, `angenommen`) und ob ein Mensch ihn bestätigt hat.
Beides wird in der Oberfläche getrennt angezeigt.

**Das menschliche Tor ist eine harte Phasengrenze.** Ein Typ mit offenen Pflichtattributen
erhält keinen Küchenvorschlag. Die Planung nennt stattdessen die fehlenden Angaben.
Bestätigt wird je Typ, nicht je Wohnung.

**Neutrale Module, dünner Lieferantenadapter.** Geplant wird mit neutralen Modultypen aus
Koordinationsmaß und Funktion. Das Feld `artikel` bildet sie auf ein Lieferantenprogramm ab.
Ein zweiter Lieferant wäre eine Tabelle.

**Die Produktgrenze liegt beim Aufmaß.** Aus dem Plan entsteht eine Spezifikation mit
Mengengerüst, niemals eine Fertigungsfreigabe. Die Oberfläche benennt das ausdrücklich.

**Invariante:** Die Summe der Korpusbreiten jeder Belegung ergibt exakt die Zeilenlänge.
Geprüft mit `pruefeBelegungen()` und im Prüfskript.

```bash
npx esbuild werkzeuge/pruefe.ts --bundle --platform=node --format=esm \
  --outfile=werkzeuge/pruefe.mjs --alias:@=./src && node werkzeuge/pruefe.mjs
```

## Bewusst simuliert

Grundrisserkennung · Variantengenerierung (vorberechnet statt Solver) · Dateiverarbeitung
beim Upload · Lieferantenzuordnung · Bestellung · Druckansicht über den Browserdialog.

## Bewusst nicht enthalten

Raster- und Skizzenerkennung · 3D-Ansicht · fotorealistische Visualisierung · echter
Beschnittplan für die Säge · Lieferterminplanung, Monteurdisposition und Mängelmanagement
· Mandantenfähigkeit · Benutzerverwaltung.
