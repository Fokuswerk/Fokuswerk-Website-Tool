# Briefing: Software zur Serienplanung von Einbauküchen

Dieses Dokument fasst eine abgeschlossene Recherche- und Konzeptphase zusammen.
**Aufgabe für dich (ChatGPT): Schreibe daraus einen Bau-Prompt für ein Coding-Modell.**
Was am Ende dieses Dokuments unter „Was der Prompt leisten soll" steht, ist deine eigentliche Aufgabe.

---

## 1. Das Produkt in einem Satz

Ein Werkzeug, das aus Architektengrundrissen eines Mehrfamilienhauses automatisch typisierte, maßhaltige Küchenplanungen mit Mengengerüst und Installationsplan erzeugt — für alle Wohnungen eines Projekts auf einmal statt einzeln.

## 2. Das Problem, belegt

Ein Küchenplaner braucht für eine Projektküche **2–5 Stunden pro Wohnung**. Bei 40 Wohnungen sind das rund 120 Stunden, verteilt über vier bis sechs Wochen Durchlaufzeit. Der Aufwand entsteht nicht durch Denken, sondern durch Wiederholung:

- Die Raumgeometrie wird in Winner/CARAT **von Hand eingetippt** — es gibt keinen Planimport (20–40 min je Wohnung)
- Module werden aus Katalogbäumen geklickt, 15–25 Positionen mit Variantenentscheidungen
- Das Ganze 40-mal, obwohl es faktisch nur 5–8 verschiedene Küchensituationen gibt

Zweites Problem: Küchenstudios geben Planungen oft nur unvollständig heraus (ohne positionsweise Stückliste und Einzelpreise), weil die Planung ihr Vertriebsinstrument ist. Der Bauherr kann deshalb Angebote nicht vergleichen und den Plan nicht wiederverwenden.

## 3. Zielgruppe

| | |
|---|---|
| Primär | Bauträger, Projektentwickler, Wohnungsbaugesellschaften, Bestandshalter |
| Sekundär | Küchenlieferanten im Objektgeschäft (sie tragen heute die Vorplanungskosten) |
| Ausdrücklich nicht | Küchenstudios im Privatkundengeschäft — dort liegt kein Plan vor, der Planer misst selbst auf |

**Offen und noch zu entscheiden:** Mietwohnungsbau/institutionell (Standard durchsetzbar, kein Erwerber im Prozess, Produkt 30–40 % kleiner) gegenüber Eigentumswohnungen (Erwerber wählt mit → vorbepreiste Pakete, Sonderwunsch-Delta und 3D-Ansicht werden Pflicht). Der Prompt sollte beide Fälle kennen und den Mietfall als MVP-Schnitt behandeln.

## 4. Die Prozesskette

```
VOR DEM ROHBAU
 0  Projekt anlegen — Ausstattungsniveau, Budget, Segment
 1  Unterlagen einlesen — Vektor-PDF / DXF / IFC
 2  Raummodell bilden — Polygone, Wandachsen, Öffnungen, Zwangspunkte, Höhen
 3  Typisieren — 40 Wohnungen werden 6 Typen
 4  Bestätigen (Mensch) — je TYP, nicht je Wohnung
 5  Anforderungen setzen (Mensch) — projektweit, je Typ ausnahmefähig
 6  Generieren — Regelwerk + Constraint-Solver, 2–3 Varianten je Typ
 7  Entscheiden (Mensch) — Variantenvergleich, manuelle Nachbesserung
 8  Spezifikation festschreiben — neutrale Typen → Lieferantenadapter → Artikel + Preise
 9  Installationsplan ausgeben — Wasser, Abwasser, Elektro, Abluft; geht an den TGA-Planer

    ░ ROHBAU — MONATE VERGEHEN ░

NACH DEM ROHBAU
10  Aufmaß (Mensch, mobil) — 4–6 echte Maße je Wohnung
11  Fertigungsmaße rechnen — Passblenden, Arbeitsplattenlängen, Stoßpositionen
12  Bestellliste + Plattenbedarf mit projektweiter Verschnittoptimierung
13  Übergabe an die vorhandenen Baustellensysteme (Termine, Montage, Mängel)
```

**Wichtig für den Entwurf:** Das Werkzeug wird **zweimal benutzt, mit Monaten dazwischen und von verschiedenen Personen**. Schritte 0–9 macht die Projektleitung am Schreibtisch, Schritt 10 macht später jemand anderes auf einem Tablet auf der Baustelle. Das muss von Anfang an in Datenmodell, Rechte und Bedienung.

## 5. Architekturentscheidungen, die nicht verhandelbar sind

Diese Punkte sind das Ergebnis der Recherche. Ein Bau-Prompt, der sie aufweicht, ist falsch.

**Vektor zuerst, kein Vision-Modell für Geometrie.** Grundrisse von Architekten entstehen in Revit/ArchiCAD/AutoCAD und enthalten eine Vektorebene. Die wird deterministisch gelesen. Begründung mit Zahl: Der Benchmark AECV-Bench (Januar 2026, 120 echte Grundrisse) misst beim reinen **Zählen** von Türen eine Exact-Match-Genauigkeit von 0,39 (Gemini 3 Pro), 0,28 (GPT-5.2), 0,16 (Claude Opus 4.5); bei Fenstern 0,34 / 0,27 / 0,16. Spezialisierte Segmentierungsnetze liegen bei Wänden bei 90–95 %, bei Türen/Fenstern deutlich darunter. **Raster-PDFs, Scans und Handskizzen sind bewusst nicht im Produkt** — dafür gibt es später Zukauf (CubiCasa Conversion API, RasterScan).

**KI nur für Text und Semantik.** Layernamen auf ein kanonisches Schema abbilden, Schriftfeld und Legende lesen, Raumstempel zuordnen, Freitextanforderungen in Parameter übersetzen. Niemals für Geometrie, niemals für Zählen. Zweistufig: ein günstiges Modell für Massenextraktion, ein starkes für Zweifelsfälle. Strukturierte Ausgabe erzwingen, nie Freitext parsen.

**Deterministischer Generator, kein generatives Modell.** Platzierung ist ein Packungsproblem mit Nebenbedingungen über ein endliches Modulraster, gelöst mit einem Constraint-Solver (OR-Tools CP-SAT, `no_overlap_2d`). Jede Lösung erfüllt die harten Regeln nachweisbar oder es gibt keine Lösung und das Werkzeug sagt das. Begründung: Das Ergebnis löst Bestellungen aus und muss prüfbar und reproduzierbar sein.

**Das menschliche Tor ist eine harte Phasengrenze.** Der Generator verweigert die Ausführung, solange ein Pflichtattribut den Status „vermutet" oder „unbestätigt" trägt. Keine Vorschau auf unbestätigten Daten. Bestätigt wird je Typ, nicht je Wohnung — das ist der Unterschied zwischen 30 und 200 Interaktionen.

**Neutrale Modulschicht, dünner Lieferantenadapter.** Modelliere keine Herstellerkataloge. Modelliere neutrale Modultypen aus Koordinationsmaß und Funktion („Unterschrank 600, 2 Auszüge"). Darunter je Lieferant eine Zuordnungstabelle: neutraler Typ → Artikelnummer → Projektpreis, einige Hundert Zeilen aus einer Preisliste. Damit ist Lieferant Nummer zwei eine Woche Arbeit statt ein Umbau. **Das ist die teuerste Entscheidung, wenn man sie falsch trifft.**

**Die Produktgrenze liegt beim Aufmaß.** Aus einem Plan entsteht eine **Spezifikation mit Mengengerüst**, niemals eine Fertigungsfreigabe. Rohbaumaße weichen von Planmaßen ab. Jede Küche braucht vor der Produktion ein Aufmaß vor Ort. Die Oberfläche muss das explizit benennen („freigegeben: Mengengerüst, Modulauswahl, Anschlusspositionen — nicht freigegeben: Fertigungsmaße").

## 6. Datenmodell-Prinzipien

- **Millimeter als Ganzzahlen, überall.** Nie Gleitkomma für Maße. Eine Ursprungs- und Drehkonvention je Raum, verbindlich.
- **Jedes Attribut trägt Herkunft und Status**: `gelesen` (aus Maßkette/Objekt) / `gerechnet` / `bestätigt` (vom Nutzer) / `angenommen`. Das ist die Vertragsschnittstelle zwischen dem unsicheren und dem sicheren Teil des Systems. Nachträglich einzubauen heißt, alles anzufassen.
- **Toleranzmodell explizit entwerfen**: wo leben Toleranzen (je Attribut? je Typ?), ist eine Passblende ein Modul oder ein berechneter Rest. Davon hängt ab, ob Schritt 11 funktioniert.
- **Versionierung und Unveränderlichkeit**: Ein Typ kann sich ändern, nachdem Wohnungen zugeordnet sind. Eine festgeschriebene Spezifikation ist unveränderlich. Jeder Stand des Raummodells auditierbar.
- **Preisstände mit Gültigkeitsdatum**, damit eine eingefrorene Spezifikation ihren Preis behält.
- **Typisierung**: Raumpolygon kanonisieren (Ursprung am Zwangspunkt, Hauptachse normieren), Spiegelsignatur bilden (Polygon und Spiegelbild hashen, kleineren nehmen), auf das Modulraster quantisieren, dann clustern. Ergebnis: Typ + Toleranzfenster + Passmaß je Wohnung.

## 7. Regelwerk

Regeln sind **Daten, nicht Code** — mit Kategorie, Quelle, Parametern und je Regel einem Testfall. Grund: Der Küchenplaner als Fachexperte muss sie lesen und gegenzeichnen können.

| Kategorie | Inhalt | Behandlung |
|---|---|---|
| 1 | Öffentliches Recht und Technikregeln (Elektro-Schutzbereiche, Abstand Kochfeld/Dunstesse, Lüftung, Barrierefreiheit nach DIN 18040-2 wo gefordert) | harte Nebenbedingung |
| 2 | Koordinationsmaße (DIN EN 1116:2018-03), Herstellerraster, Gerätenischenmaße, Sockel- und Plattenmaße | harte Nebenbedingung |
| 3 | Ergonomie und gute Praxis (AMK: Arbeitshöhe 10–15 cm unter Ellenbogen, Abstand zwischen Zeilen ≥ 120 cm, Vorbereitungszone ≥ 90 cm breit) | geht in die Bewertung ein, erzwingt nichts |

Wichtige Korrektur gegen eine verbreitete Verwechslung: **DIN 68935 ist die Badmöbelnorm, nicht die Küchennorm.** Küche ist **DIN EN 1116:2018-03**. DIN 18022 wird noch zitiert, ist aber zurückgezogen.

Weitere harte Nebenbedingungen aus der Praxis: Spüle nah am Abwasserfallstrang (der eigentliche Zwangspunkt), keine Oberschränke vor Fenstern, kein Hochschrank im Türschwenkbereich, Kühlschrank nicht direkt neben Backofen, Heizkörper blockiert Unterschrank, Restmaße unterhalb der kleinsten Passblende sind unbaubar.

Bewertungsachsen für Kategorie 3 (gewichtet, vom Nutzer verstellbar, Punktevergabe offenlegen): Installationsaufwand (Entfernung zu Fallstrang und Schacht), Stauraum je Laufmeter, Arbeitsfläche zwischen Spüle und Kochfeld, Bewegungsfläche, Teilekosten gegen Budget, **Wiederverwendung eines bereits im Projekt verwendeten Typs**, Montagefreundlichkeit.

## 8. Technologie

| Ebene | Wahl | Begründung |
|---|---|---|
| Rechenkern | **Python**, FastAPI | ezdxf, Shapely, IfcOpenShell, OR-Tools sind Python-Ökosystem |
| DXF | ezdxf | DWG nur über Konverter — im MVP weglassen, nur DXF |
| Vektor-PDF | PyMuPDF oder pdfplumber | Linien, Texte, Transformationsmatrizen |
| IFC | IfcOpenShell | vollständiges Parsing bis IFC4x3 |
| Geometrie | Shapely | 2D reicht vollständig |
| Solver | OR-Tools CP-SAT | `no_overlap_2d` |
| Frontend | Next.js, TypeScript, Tailwind | |
| Plan-Viewer | **Canvas/SVG mit eigener Renderschicht** | 2D ist das Arbeitsmedium; Three.js erst für optionale 3D-Ansicht |
| Daten | PostgreSQL / Supabase | RLS für Mandantentrennung |
| Warteschlange | einfache Job-Tabelle mit Polling | wenige Läufe pro Tag, Minutenlaufzeiten — kein Celery/Redis |

**Nicht im Stack:** OpenCascade (Küchenplanung ist 2,5D — Grundriss plus Höhenebenen), eigenes CV-Modelltraining, Vektordatenbank über Normtexte (Regeln sind endlich, sie gehören in Code und Tests), Agent-Framework für Planungsentscheidungen (widerspricht der Prüfbarkeit), Microservice-Schnitt.

## 9. MVP-Schnitt

**Drin:** Vektor-PDF und DXF als Eingabe · Maßstabsbestätigung mit Gegenrechnung aus Maßketten · rechteckige und L-förmige Küchenräume · **eine** Modulfamilie eines Partnerlieferanten aus Tabelle · Türen, Fenster, Heizkörper, Fallstrang als Zwangspunkte · einzeilige, zweizeilige und L-Küchen · Regelwerk K1/K2 hart, K3 bewertet · 2–3 Varianten je Typ mit Begründung · **Typisierung über das Projekt** · bemaßter 2D-Plan, Stückliste je Wohnung und aggregiert, PDF · **Installationsplan** · manuelle Nachbesserung mit Regelprüfung · Aufmaß-Modul und Bestellliste.

**Später:** U-Küche, Halbinsel, Insel · Raster- und Skizzenerkennung über Zukauf · IFC-Import und -Export · 3D-Ansicht · weitere Lieferanten · IDM-Anbindung und Bestelldatenübertragung (EANCOM) · Barrierefreiheitsregelwerk · Sonderwunsch-Delta · Erwerberpakete · echte Mandantenfähigkeit.

**Ausdrückliche Nicht-Ziele:** fotorealistische Visualisierung · echter Beschnittplan für Säge oder CNC (das ist das Gewerk des Plattenverarbeiters und er benutzt ihn nicht — stattdessen **Materialbedarf mit projektweiter Verschnittoptimierung** für den Einkauf) · Lieferterminplanung, Monteurdisposition und Mängelmanagement (das übernehmen die Baustellensysteme, die beim Kunden schon laufen) · automatische TGA-Planung · Vollautomatik ohne menschliches Tor.

## 10. Qualitätskriterien

| Kriterium | Zielwert |
|---|---|
| Anteil verarbeitbarer Eingangspläne | > 80 % |
| Nischenlängenfehler gegen Aufmaß | < 20 mm im Median |
| Türanschlag-Erkennung vor Nutzerkorrektur | > 85 % |
| Layouts ohne Verstoß gegen Kategorie 1 und 2 | **100 %**, durch Solver garantiert |
| Deckung mit tatsächlich gebauten Küchen abgeschlossener Projekte | > 70 %, Abbruch unter 50 % |
| Interaktionen bis freigegebene Vorplanung, 40 Einheiten | < 120 |
| Clustering gegen manuelle Typisierung durch einen Planer | Abweichung ≤ 1 Typ |
| Wohnungen, bei denen das Aufmaß die Modulauswahl ändert | < 10 % |

## 11. Offene Entscheidungen

1. Segment: Miete/institutionell oder Eigentum mit Erwerbern
2. Partnerlieferant, namentlich — mit Zusage, die Spezifikation gegenzuzeichnen
3. Küchenplaner als Fachexperte, etwa ein Tag pro Woche über die Bauzeit
4. Normen im Volltext beschaffen: DIN EN 1116:2018-03, DIN 18040-2, DIN 1946-6, einschlägige VDE-Regel
5. Repräsentative Testpläne: 20+ Plansätze als Originaldateien aus mindestens drei Architekturbüros
6. Drei abgeschlossene Projekte **mit den tatsächlich gebauten Küchenplanungen** als Messgrundlage

---

## Was der Prompt leisten soll

Schreibe einen Bau-Prompt für ein Coding-Modell, der:

1. **Mit einem klickbaren Ablauf-Prototyp beginnt**, nicht mit Funktionalität — eine Oberfläche, die den Prozess aus Abschnitt 4 über acht Schritte durchspielt, mit erfundenen, aber in sich durchgerechneten Daten (ein Projekt, 40 Einheiten, 6 Typen, echtes Modulraster 600/450/150, realistische Preise). Nichts muss rechnen.
2. **Die Architekturentscheidungen aus Abschnitt 5 als verbindliche Vorgaben mitgibt**, inklusive der Begründungen — sonst schlägt das Modell „KI liest den Grundriss" vor, was belegt nicht funktioniert.
3. **Das Datenmodell aus Abschnitt 6 vorgibt**, besonders Millimeter-Ganzzahlen und Herkunft/Status je Attribut, weil beides nachträglich sehr teuer wird.
4. **Den MVP-Schnitt und die Nicht-Ziele aus Abschnitt 9 wörtlich übernimmt**, damit der Umfang nicht wächst.
5. **Zur Gestaltung vorgibt:** helle Oberfläche (kein dunkles Dashboard mit Leuchtakzent), Seitenleiste mit eigenen Unterseiten je Schritt statt einer langen Seite, dichte Tabellen statt Karten (der Nutzer ist ein Projektleiter und arbeitet in Listen), eine Hauptfarbe plus genau eine Signalfarbe mit klarer Bedeutung („bitte prüfen"), technische Zeichnungsanmutung mit Haarlinien und Maßketten, keine Emoji.
6. **Einen konkreten Testdatensatz definiert**, damit die Daten über alle Schritte zusammenpassen.

Gib den Prompt als einen zusammenhängenden Text aus, den man direkt an ein Coding-Modell übergeben kann.
