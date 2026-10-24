# Serienküche — Prototyp

Klickbarer Produktprototyp für die Serienplanung von Einbauküchen in Wohnbauprojekten.
Ein Projektentwickler lädt Grundrisse hoch, das Werkzeug typisiert sie, plant je Typ und
liefert Mengengerüst, Installationsplan und Bestellvorbereitung.

**Dies ist eine Demo.** Grundrisserkennung und Bestellung sind simuliert: es gibt keinen
Parser und keine Herstelleranbindung. Die Planung ist es nicht — der Planer in
`lib/planer.ts` sucht die Anordnung jeder Zeile erschöpfend ab, prüft sie gegen harte
Regeln und rechnet den Preis aus dem Modulkatalog. Was er ausgibt, ist gerechnet.

## Starten

```bash
npm install
npm run build && npx next start -p 3000
```

Prüfen:

```bash
npm run verify   # tsc --noEmit, dann die drei Rechenprüfungen
```

`next dev` bindet auf dem Entwicklungsrechner keinen Port — der Produktionsserver läuft.

## Zwei Wege

Auf der Startseite entscheidet sich, welcher Weg gilt.

**Eine einzelne Küche** (`/kueche`) — für Leute ohne Vorkenntnisse. Sechs Schritte:
Raumform, Maße, Fenster und Tür, Wünsche, Vorschläge, Ergebnis. Die Zeichnung wächst
beim Ausfüllen mit. Hier wird wirklich gerechnet: `lib/planer.ts` erzeugt aus den
Eingaben eine Modulfolge, prüft Abstände und Regeln und begründet das Ergebnis in
Alltagssprache. Eingaben in Zentimetern, intern Millimeter.

**Ein ganzes Haus** (`/dashboard` und `/projects/demo/*`) — der Profi-Weg für Bauträger,
acht Bereiche hinter einer festen Seitenleiste.

## Die acht Bereiche des Profi-Wegs

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
    planer.ts      Rechnet freie Räume: Modulfolge, Regeln, Begründungen
    typen.ts       Datenmodell
    berechnung.ts  Preise, Kennzahlen, Aggregation, Invariantenprüfung
    ableitung.ts   Anschlüsse, Freigabestand und Fertigungsmaße aus dem Aufmaß
    planer.ts      Der Planer: Pflichtmodule, Verteilung, Anordnungssuche, Preis
    masse.ts       Höhen und Tiefen — eine Quelle für Zeichnung und Raumbild
    szene.ts       Dieselbe Küche als räumliches Bild
    unterlagen.ts  Stückliste, Maßketten, Anschlüsse, Zuschnitt
  store/
    demo.ts      Zustand des Profi-Wegs
    kueche.ts    Zustand der Schritt-für-Schritt-Strecke
  components/
    plan/        Grundriss und Wandansicht als SVG aus Geometriedaten
    layout/      Seitenleiste und Rahmen
    warm/        Der Privatkunden-Weg: Zeichnungen, Raumbild, Eingabefelder
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
npm run planertest       # harte Regeln, Zeilenbreiten, Stückliste gegen Nettosumme
npm run datentest        # jedes als „gerechnet" ausgewiesene Maß folgt seiner Regel
npm run umstellungtest   # eine umgestellte Küche über zwölf Änderungen
npm run zeitmessung      # wie lange der Planer je Raumgröße braucht
```

`npm run verify` fährt Typprüfung und die drei Rechenprüfungen hintereinander.

## Bewusst simuliert

Grundrisserkennung · Dateiverarbeitung beim Upload · Lieferantenzuordnung · Bestellung ·
Druckansicht über den Browserdialog. Im Profi-Weg sind auch die Varianten vorberechnet.
**Nicht simuliert** ist die Planung im Einzelküchen-Weg — die rechnet aus den Eingaben.

## Bewusst nicht enthalten

Raster- und Skizzenerkennung · fotorealistische Visualisierung · echter Beschnittplan für
die Säge · Lieferterminplanung, Monteurdisposition und Mängelmanagement ·
Mandantenfähigkeit · Benutzerverwaltung.

Eine räumliche Ansicht **ist** enthalten (`lib/szene.ts`, `components/warm/Kuechenraum`) —
gebaut aus denselben Maßen wie die Zeichnungen, nicht gerendert.
