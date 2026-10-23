# KI-gestützte Küchenplanung für Wohnbauprojekte

**Machbarkeitsstudie und Entscheidungsvorlage**
Stand: 22. Oktober 2026

---

## Lesehinweis zur Quellenlage

Dieser Bericht trennt drei Arten von Aussagen, und zwar durchgängig und erkennbar:

| Markierung | Bedeutung |
|---|---|
| **[belegt]** | Durch eine verlinkte Primär- oder Fachquelle gedeckt. |
| **[Annahme]** | Plausible Annahme, nicht verifiziert. Grundlage genannt. |
| **[Einschätzung]** | Fachliche Bewertung des Verfassers, keine Tatsachenbehauptung. |

Nicht geprüft wurden: der Volltext von DIN EN 1116:2018-03 und DIN 18040-2 (kostenpflichtig, nur Titel und Geltungsbereich verifiziert), die tatsächlichen API-Fähigkeiten von Cyncly/Winner Flex (keine öffentliche Dokumentation, widersprüchliche Sekundärangaben), und die Konditionen des IDM-Datenzugangs bei einzelnen Herstellern. Diese drei Punkte sind die wichtigsten offenen Fragen und stehen in Kapitel 13.

Preise und Produktstände können sich ändern. Wo Quellen widersprüchlich sind, ist der Widerspruch benannt statt geglättet.

---

## 1. Executive Summary

**Die Software ist technisch baubar. Aber nicht die beschriebene.**

Die Grundidee enthält eine Annahme, die der Recherche nicht standhält: dass das Schwierige die Küchenplanung sei und das Einfache das Lesen des Grundrisses. Es ist genau umgekehrt.

Die Platzierung von Küchenmodulen in einem bekannten Raum ist ein gelöstes kombinatorisches Problem. Küchenmöbel sind rasterisiert, die Regeln sind endlich und aufschreibbar, und es gibt ausgereifte Solver dafür. Das Lesen eines Architektengrundrisses dagegen ist die Schwachstelle: Die stärksten heute verfügbaren multimodalen Modelle erreichen beim reinen Zählen von Türen auf echten Grundrissen eine Exact-Match-Genauigkeit von 0,39, bei Fenstern 0,34 **[belegt]**. Nicht beim Vermessen — beim Zählen. Ein System, das eine Küche auf dieser Grundlage plant, plant auf Sand.

Daraus folgt die erste von drei zentralen Umkehrungen dieses Berichts:

**Erstens: Nicht die KI liest den Plan, sondern der Plan liest sich selbst.** Grundrisse von Architekten entstehen in Revit, ArchiCAD oder AutoCAD und enthalten in aller Regel eine Vektorebene mit Linien, Layernamen und Textobjekten. Diese Geometrie lässt sich deterministisch auslesen — millimetergenau, nachvollziehbar, ohne Modell. Computer Vision und Vision-Modelle sind der *Notfallpfad* für gescannte Pläne und Handskizzen, nicht der Hauptpfad. Wer mit dem Bild anfängt, löst freiwillig das schwerste Problem.

**Zweitens: Das wertvollste Ergebnis ist nicht der Küchenplan, sondern der Installationsplan.** Ein Projektentwickler braucht die Information „wo kommen Wasser, Abwasser, Strom und Abluft hin" *vor* dem Rohbau. Verschiebt sich das später, kostet es Schlitze, Nacharbeit, Fliesen und Terminverzug. Die Küchenplanung selbst findet Monate später statt und kostet den Entwickler nichts, weil der Küchenlieferant sie als Vertriebsaufwand trägt. Das Werkzeug hat seinen Hebel am frühen Ende der Kette, nicht am späten.

**Drittens: „Bestellfähig aus dem PDF" ist physikalisch unmöglich und darf nicht versprochen werden.** Rohbaumaße weichen von Planmaßen ab. Jede Küche braucht am Ende ein Aufmaß vor Ort, bevor Fronten und Arbeitsplatten in Produktion gehen. Die ehrliche Obergrenze des Produkts ist eine *festgeschriebene Spezifikation mit Mengengerüst*, die durch ein Aufmaß bestätigt wird — nicht eine Bestellung. Jeder Anbieter, der etwas anderes behauptet, verschiebt ein Haftungsrisiko auf seinen Kunden.

**Die Marktlücke ist echt, aber schmal.** Drei Welten existieren und keine deckt alle drei nötigen Eigenschaften ab:

| | maßhaltig | bestellfähig | projektweit (Batch) |
|---|---|---|---|
| Consumer-KI-Planer (Planner 5D, WUNDER, home-design.ai) | nein | nein | nein |
| Profi-CAD (Winner Flex, CARAT, pCon) | ja | ja | **nein** |
| Generative Architektur-Tools (TestFit, Maket, Archistar) | teilweise | nein | ja |

Die Lücke heißt: **projektweite Standardisierung mit maßhaltigem Mengengerüst**. Dort ist niemand. Die Lücke existiert aber nicht aus Versehen — sie existiert, weil der Zugang zu Herstellerkatalogdaten verbandsseitig reguliert und herstellerseitig freigabepflichtig ist **[belegt]**, und weil der Markt klein ist.

**Empfehlung in einem Satz:** Bauen — aber als internes Werkzeug eines Entwicklers mit einem engen Funktionskern (Vektor-Ingest, Variantenclustering, Installationsplan, Mengengerüst), nicht als Küchen-CAD und nicht als SaaS. Die SaaS-Frage erst nach drei echten Projekten entscheiden. Vorher ein Proof of Concept von zwei bis drei Wochen, dessen entscheidende Messung lautet: *Reproduziert der Generator die Küchen, die der Küchenplaner in abgeschlossenen Projekten tatsächlich gebaut hat?*

**Harte Vorbedingung vor jeder Zeile Code:** eine schriftliche Auskunft von mindestens einem Küchenlieferanten, ob er eine maschinell erzeugte Modulliste annimmt und bepreist — und zu welchen Bedingungen Katalogdaten verfügbar sind. Ohne diese Zusage entsteht ein Werkzeug, das schöne Pläne erzeugt, die niemand bestellen kann. Das ist das Hauptrisiko des Vorhabens, und es ist kein technisches.

---

## 2. Verständnis des Problems

### 2.1 Was im Ist-Prozess tatsächlich teuer ist

Die Aufgabenstellung beschreibt den Prozess als zeitaufwendig und nennt die Mehrfachanpassung der Planung. Die Recherche legt eine andere Kostenstruktur nahe.

Ein Planungstermin im Küchenstudio dauert ein bis drei Stunden, oft verteilt auf mehrere Termine von 60 bis 90 Minuten; das Aufmaß vor Ort wird mit 45 bis 90 Minuten angesetzt **[belegt]**. Diese Leistung wird dem Kunden nicht in Rechnung gestellt — sie ist Vertriebskosten des Küchenstudios, finanziert aus der Marge der verkauften Küche **[Einschätzung, gestützt auf die durchgehend als kostenlos ausgewiesenen Planungs- und Aufmaßleistungen in den Anbieterquellen]**.

Das hat eine unangenehme Konsequenz für die Geschäftsidee: **Die Stunden, die das Werkzeug einspart, kosten den Projektentwickler heute nichts.** Er zahlt sie nicht. Wer Zeitersparnis als Verkaufsargument gegenüber dem Entwickler aufbaut, verkauft ihm die Einsparung eines Aufwands, den ein Dritter trägt.

Was den Entwickler wirklich Geld kostet:

1. **Rohbaurelevante Entscheidungen auf dem kritischen Pfad.** Wasser-, Abwasser-, Elektro- und Abluftpositionen müssen fest sein, bevor Wände geschlossen und Böden gegossen werden. Kommt die Küchenplanung später, wird entweder großzügig vorgehalten (teuer) oder nachgearbeitet (teurer).
2. **Koordinationsaufwand und Nachtragsabwicklung.** Sonderwünsche laufen über Nachtragsangebote, die Material, Arbeitsleistung, Planung, Koordination und Umsatzsteuer enthalten; die Rechtsprechung legt dem Bauträger eine Koordinationspflicht auf, auch wenn der Erwerber direkt an einen Handwerker vergibt — er muss prüfen, ob sich der Wunsch störungsfrei einfügt, und bei Problemen planerisch eingreifen **[belegt]**. Das ist unbezahlte Projektleiterzeit.
3. **Fehlende Einkaufsmacht durch Uneinheitlichkeit.** 40 individuell geplante Küchen sind 40 Einzelbestellungen. Sechs standardisierte Typen in 40 Wohnungen sind ein Rahmenvertrag.
4. **Verzug.** Lieferzeiten für Projektküchen werden mit vier bis sechs Wochen bis rund zehn Werktagen angegeben, projektabhängig **[belegt]**; ein Dienstleister berichtet von über 300 Küchen in einem Projekt binnen acht Wochen **[belegt, Anbieterangabe, älter]**. Küche ist regelmäßig das letzte Gewerk vor Übergabe und damit terminkritisch.

### 2.2 Die Neuformulierung des Problems

Statt „Küchen schneller planen" lautet die tragfähige Problemformulierung:

> **Die Küchenentscheidung so früh und so einheitlich treffen, dass sie den Rohbau steuert statt ihm zu folgen — und so dokumentiert, dass sie ohne Neuplanung in Einkauf, Nachtragsabwicklung und Vertrieb weiterverwendet werden kann.**

Das ist eine andere Software als die beschriebene. Sie hat denselben technischen Kern, aber ein anderes Hauptergebnis, eine andere Zielgruppe im Haus des Kunden (Projektleitung und Einkauf statt Vertrieb) und einen anderen Zahlungsgrund.

### 2.3 Wer bezahlt — die unbequeme Frage

**[Einschätzung]** Drei Kandidaten, in der Reihenfolge ihrer Zahlungsbereitschaft:

**Der Küchenlieferant im Objektgeschäft (stärkster Kandidat).** Er trägt heute die Vorplanungskosten für Angebote, die er zu einem großen Teil nicht gewinnt. Ein Werkzeug, das aus einem Architektenplansatz an einem Nachmittag 40 bepreiste Küchenvarianten macht, erhöht seine Angebotsfrequenz und senkt seine Vorkosten direkt und messbar. Er hat eine Deckungsbeitragsrechnung pro Angebot. Mehrere Anbieter positionieren sich bereits explizit für Bauträger und Projektentwickler mit standardisierten Küchenkonzepten **[belegt]** — sie haben also das Problem schon erkannt und lösen es heute mit Personal.

**Der Projektentwickler (Auftraggeber dieser Studie, mittlere Zahlungsbereitschaft).** Sein Nutzen ist real, aber indirekt: vermiedene Nacharbeit, Einkaufsvorteil, Projektleiterzeit. Indirekte Einsparungen setzen sich in Softwarebudgets schlechter durch als Rechnungen, die wegfallen. Als internes Werkzeug mit klarem Projektbezug ist er finanzierungsfähig, als SaaS-Abonnent schwierig.

**Wohnungsbaugesellschaften und Bestandshalter (unterschätzter Kandidat).** Sie haben Serienbedarf, kein Vertriebsinteresse an Individualität, lange Haltedauer, Standardisierungsdruck und — wichtig — wiederkehrenden Bedarf durch Mieterwechsel und Modernisierung. Für sie ist eine Küchenbibliothek ein Anlagegut.

Nicht zahlungsbereit, trotz naheliegender Vermutung: **Küchenstudios im Privatkundengeschäft.** Sie haben Winner oder CARAT, deren Planung ist ihr Verkaufsgespräch, und der Planungsaufwand ist ihr Vertriebsinstrument, nicht ihr Problem.

---

## 3. Marktanalyse und Wettbewerber

### 3.1 Die drei getrennten Welten

Der Markt sortiert sich nicht nach Preis, sondern nach dem Grad an Verbindlichkeit des Ergebnisses. Diese Unterscheidung ist entscheidend und wird in der Anbieterkommunikation systematisch verwischt.

**Welt A — optisch beeindruckende KI-Raumvisualisierung.** Erzeugt Bilder. Kein Maß, keine Artikelnummer, keine Fertigungsrelevanz. Hierzu gehören home-design.ai, KitAI, Visualizee, zimmergestalten.de, kitchengpt.io, prompt-render und die große Masse der 2026 beworbenen „KI-Küchenplaner".

**Welt B — maßhaltige, technisch plausible Planung.** Richtige Maße, plausible Module, aber ohne verbindliche Hersteller-Artikelbindung. Hierzu gehören Planner 5D, HomeByMe, RoomSketcher, Roomle, pCon.planner mit neutralen Katalogen.

**Welt C — produktions- und bestellfähige Planung.** Echte Herstellerkataloge mit Varianten, Preisen, Bestelldatenübertragung. Hierzu gehören Winner Flex, CARAT, Design Flex (vormals 2020 Design Live) sowie die Herstellerplanungssysteme.

**Keiner der drei Welten gehört der Batch-Fall.** Alle drei sind auf „eine Küche, ein Raum, ein Kunde" ausgelegt.

### 3.2 Wettbewerbsübersicht

| Anbieter | Welt | Grundriss-Import | Erkennt Wände/Türen/Fenster | Automatische Layouts | API | Preis öffentlich | Für Projektentwickler geeignet | Was entscheidend fehlt |
|---|---|---|---|---|---|---|---|---|
| **Winner Flex** (Cyncly) | C | nicht belegt | nicht belegt | nein | widersprüchlich (s. u.) | nein, auf Anfrage **[belegt]** | nur als Planungsplatz | Batch, Planimport, offene Doku |
| **CARAT** | C | nicht belegt | nicht belegt | nein | nicht belegt | ca. 39–49 €/Monat für Plugins, unklar zugeordnet **[belegt, möglicherweise veraltet]** | nur als Planungsplatz | wie Winner |
| **Design Flex / 2020 Design** (Cyncly) | C | nein — Raummaße werden eingegeben **[belegt]** | nein | ja, aus eingegebenen Maßen **[belegt, Sekundärquelle]** | nicht belegt | nein | nein | Planimport; die „KI" setzt am falschen Ende an |
| **2020 Fusion** (Cyncly) | C | — | — | — | — | — | **wird in Europa abgekündigt** **[belegt]** | — |
| **pCon.planner** (EasternGraphics) | B/C | begrenzt | nein | nein | nein | kostenlose ME-Version **[belegt]** | nein | Küchen-OFML-Daten dünn; Windows-only |
| **Roomle (Rubens)** | B | nein | nein | nein | **ja, dokumentierte SDK/API** **[belegt]** | nicht belegt | als Baustein ja | Küchenlogik, Kataloge, Maßtreue |
| **Planner 5D** | B | ja, Skizze/Foto → Plan **[belegt]** | teilweise | ja (Smart Wizard, berücksichtigt Wände, Türen, Fenster, Freifläche) **[belegt, Anbieterangabe]** | nicht belegt | Free/Premium | nein | Maßtreue, Artikelbindung, Batch |
| **HomeByMe / Homestyler** | B | 2D → 3D **[belegt, Sekundärquelle]** | teilweise | teilweise | nicht belegt | Free/Premium | nein | wie Planner 5D |
| **CubiCasa** | Werkzeug | **ja, Conversion API** **[belegt]** | ja (Kerngeschäft) | nein | **ja, Conversion API + Exporter API + Mobile SDK** **[belegt]**; Preise nur auf Anfrage **[belegt]** | nein | als Baustein ja | kein Küchenwissen |
| **RasterScan** | Werkzeug | ja, Raster → DXF/IFC/GLTF **[belegt, Anbieterangabe]** | ja | nein | ja, Cloud + On-Prem Docker **[belegt]** | ab 99 $ bis 950 $, Angaben widersprüchlich **[belegt]** | als Baustein ja | keine unabhängige Genauigkeitsmessung |
| **TestFit** | Generativ | — | — | ja, auf Gebäudeebene | nicht belegt | ab ca. 100 $/Monat **[belegt, Sekundärquelle]** | ja, aber andere Aufgabe | keine Küchentiefe |
| **Maket.ai** | Generativ | — | — | ja, Grundrisse; Export JPEG/DXF **[belegt, Sekundärquelle]** | nicht belegt | Free-Tier **[belegt]** | nein | schematisch, wird im CAD neu gezeichnet **[belegt]** |
| **Archistar / Autodesk Forma** | Generativ | — | — | Grundstück/Massing | — | — | andere Aufgabe | keine Innenraumtiefe |
| **WUNDER Kitchen, Küchenly** | A/B | Grundriss-Eingabe | nein | ja, „KI erstellt Entwurf" **[belegt, Anbieterangabe]** | nein | kostenlos | nein | alles Verbindliche |

### 3.3 Drei Befunde, die die Produktentscheidung prägen

**Erstens: Die „KI" der Profi-Systeme setzt nach dem schweren Teil an.** Bei 2020 Design gibt der Planer Raummaße und Randbedingungen ein, und die KI schlägt daraufhin Layouts vor; sie prüft außerdem Kollisionen wie Schränke im Türanschlag und fehlende Geräte **[belegt, Sekundärquelle, Betreiber bezeichnet sich als nicht mit Cyncly verbunden]**. Der Schritt „aus dem Architekten-PDF werden Raummaße" ist dort nicht automatisiert. Genau dieser Schritt ist aber der Engpass im Projektgeschäft, wo 40 Pläne vorliegen. **[Einschätzung]** Das ist die Lücke, und sie ist keine Lücke in der Intelligenz, sondern eine im Datenfluss.

**Zweitens: Der Marktführer konsolidiert und schließt Produkte.** Compusoft und 2020 sind zu Cyncly verschmolzen, Winner Flex ist die bevorzugte Küchenplattform, und die Möglichkeit, mit Fusion weiterzuarbeiten, wird ausgelaufen; Cyncly nennt über 70.000 Kunden weltweit **[belegt]**. Winner gilt als Quasi-Standard im deutschen Küchenfachhandel **[belegt, Sekundärquelle ohne Datengrundlage]**. **[Einschätzung]** Für ein eigenes Produkt heißt das: Niemand gewinnt gegen Winner im Küchenstudio. Ein eigenes Werkzeug muss *vor* Winner stehen und in Winner hineinliefern, nicht gegen es antreten.

**Drittens: Zur API-Lage bleibt ein ungelöster Widerspruch.** Eine Suchzusammenfassung zitiert die Cyncly-Capabilities-Seite mit einer „IS Integration", die Winner Flex per REST-API an Geschäftssysteme anbinde. Der direkte Abruf derselben Seite erbrachte diese Aussage nicht — dort stehen nur Bestelldatenübertragung ohne Neueingabe und Anbindung von Geschäftssystemen, ohne Nennung eines Protokolls **[belegt, beide Richtungen]**. Eine Kundenreferenz erwähnt eine „open API integration" **[belegt]**. Öffentliche API-Dokumentation, Endpunkte oder Authentifizierungsangaben existieren nicht. **[Einschätzung]** Die vorsichtige Lesart: Es gibt eine Integrationsschnittstelle für Warenwirtschaft, aber keine offene Planungs-API, mit der ein Dritter eine fertige Küchenplanung in Winner einspielen könnte. Diese Frage muss direkt bei Cyncly geklärt werden, bevor ein Export-Weg geplant wird (Kapitel 13).

### 3.4 Selbst bauen oder integrieren?

**[Einschätzung]** Die Antwort ist unterschiedlich für die vier Schichten des Systems:

| Schicht | Entscheidung | Begründung |
|---|---|---|
| Vektor-Ingest (PDF/DXF/IFC) | **selbst bauen** | Reife Open-Source-Bibliotheken vorhanden, Kernlogik projektspezifisch, keine Abhängigkeit nötig |
| Raster-Fallback (Scan, Skizze) | **einkaufen** (CubiCasa oder RasterScan) | Eigenes CV-Training ist ein Projekt für sich; Fallback-Pfad rechtfertigt das nicht |
| Layout-Generator + Regelwerk | **selbst bauen** | Hier liegt der Wert; kein Anbieter deckt es ab; Solver sind frei verfügbar |
| Katalog- und Bestelldaten | **einkaufen/anbinden** (IDM) | Eigene Katalogpflege ist unmöglich; der Verband hat das Format, die Hersteller die Freigabe |

Eigenentwicklung also im Kern, Zukauf an den Rändern. Das ist auch die einzige Konstellation, die ein kleines Team durchhält.

---

## 4. Technische Machbarkeit

### 4.1 Grundriss analysieren — die zentrale Weichenstellung

#### 4.1.1 Was Vision-Modelle heute wirklich können

Die Aufgabenstellung fragt, wie zuverlässig die Erkennung mit heutiger KI realisierbar ist. Es gibt dazu eine belastbare, aktuelle Messung, und sie ist eindeutig.

AECV-Bench (Januar 2026) prüft multimodale Modelle auf 120 echten, bewusst gut lesbaren Grundrissen aus CubiCasa5K, CVC-FP und öffentlichen Quellen. Aufgabe: Türen, Fenster, Schlafzimmer und WCs zählen. Ergebnis **[belegt]**:

| Modell | Mittlere Genauigkeit | Türen | Fenster | Schlafzimmer | WC |
|---|---|---|---|---|---|
| Gemini 3 Pro | 0,51 | 0,39 | 0,34 | 0,89 | 0,82 |
| GPT-5.2 | 0,49 | 0,28 | 0,27 | 0,91 | 0,76 |
| Claude Opus 4.5 | 0,42 | 0,16 | 0,16 | 0,91 | 0,76 |
| Grok 4.1 Fast | 0,37 | 0,09 | 0,17 | 0,73 | 0,67 |
| GLM-4.6V (beste Open Source) | 0,39 | 0,09 | 0,03 | 0,79 | 0,82 |

Die mittlere prozentuale Abweichung (MAPE) liegt bei Türen und Fenstern selbst bei den stärksten Modellen bei 16 bis 19 Prozent und bei schwächeren bei 50 bis 70 Prozent **[belegt]**. Die Autoren formulieren den Befund so: OCR und textnahe Dokumentfragen sind stark (bis 0,95), räumliches Schließen ist mittelmäßig, und symbolzentriertes Zeichnungsverständnis — insbesondere das zuverlässige Zählen von Türen und Fenstern — ist ungelöst. Die Fehlerbilder: Türanschläge werden falsch gedeutet, Fenster mit Öffnungen oder Fassadenelementen verwechselt, Einrichtungsgegenstände halluziniert, Instanzen in dichten Bereichen übersehen. Entscheidend ist der Zusatzbefund: **Diese Fehler bleiben, obwohl dieselben Modelle auf denselben Zeichnungen gut lesen** — der Engpass liegt nicht im Text, sondern im Verständnis der grafischen Sprache **[belegt]**.

Das deckt sich mit der spezialisierten Forschung: Dedizierte Segmentierungsnetze erreichen bei Wänden etwa 90 bis 95 Prozent, bei Türen und Fenstern deutlich weniger, mit Tür-IoU um 0,64 bis 0,70 **[belegt]**. Hohe Pixel-Accuracy-Werte sind irreführend, weil der Hintergrund dominiert.

**Fazit [Einschätzung]:** Ein Produkt, dessen Geometrie aus einem Bild durch ein Vision-Modell entsteht, hat eine systematische Fehlerrate, die exakt dort am höchsten ist, wo die Küchenplanung am empfindlichsten ist — bei Türen (Anschlag blockiert Schränke), Fenstern (keine Oberschränke, Brüstungshöhe) und Öffnungen. Das ist kein Reifeproblem, das sich in zwei Jahren erledigt. Es ist ein Repräsentationsproblem: Das Modell sieht Pixel, wo die Information in einer Zeichenkonvention steckt.

#### 4.1.2 Der tragfähige Weg: Vektor zuerst

**[Einschätzung, aus der Praxis der Formate abgeleitet]** Architektenpläne entstehen in Revit, ArchiCAD, AutoCAD oder Vectorworks. Die daraus exportierten PDFs sind in aller Regel Vektor-PDFs: Linien, Polylinien, Schraffuren, Textobjekte, Ebenenzuordnung, eingebettete Maßketten. Diese Information ist nicht zu erkennen, sondern zu *lesen*. Millimetergenau und ohne Modell.

Die Eingabeformate nach Verlässlichkeit:

| Format | Verlässlichkeit | Was deterministisch verfügbar ist | Was fehlt |
|---|---|---|---|
| **IFC / BIM** | sehr hoch | Räume als Volumen, Wände mit Stärken, Türen und Fenster als Objekte mit Öffnungsrichtung, teilweise Installationsobjekte | selten vorhanden im Wohnungsbau kleinerer Entwickler |
| **DWG / DXF** | hoch | Polylinien, Blöcke (Türen und Fenster sind fast immer Blöcke), Layernamen, Texte, Maßobjekte | Semantik der Layernamen ist büro­spezifisch |
| **Vektor-PDF** | hoch | Linien, Texte, Maßzahlen, teilweise Layer | Objektidentität; Türen sind Linien plus Bogen, keine Objekte |
| **Raster-PDF / JPG / PNG** | niedrig | nur Pixel | alles; hier beginnt der schwere Pfad |
| **Handskizze** | sehr niedrig | nichts Maßhaltiges | Maßstab, Rechtwinkligkeit, Vollständigkeit |

**Die Produktentscheidung lautet daher: Vektor-PDF, DXF/DWG und IFC sind der unterstützte Hauptpfad. Raster und Skizze sind explizit nicht Teil des ersten Produkts.** Der Verlust ist gering, der Gewinn an Verlässlichkeit enorm. Für den späteren Raster-Fallback existieren Dienste von der Stange (CubiCasa Conversion API, RasterScan mit DXF/IFC/GLTF-Export, Cloud oder On-Prem) **[belegt]** — das muss nicht selbst gebaut werden.

#### 4.1.3 Wo KI tatsächlich hilft

Die Modelle sind stark genau dort, wo die Vektorextraktion schwach ist — bei Text und Semantik. Sinnvolle Einsatzstellen:

- **Layernamen deuten.** „A-WALL-INT-EX", „WAND_TRAGEND_24", „AR_Wand_innen" bedeuten dasselbe. Eine Zuordnung auf ein kanonisches Schema ist eine Sprachaufgabe, keine Bildaufgabe. Ein Büro einmal gelernt, gilt die Zuordnung für alle Pläne dieses Büros.
- **Legende und Schriftfeld lesen.** Maßstab, Geschoss, Wohnungsnummer, Planstand, Revisionsindex. Das ist OCR auf textnahen Regionen, der mit 0,7 bis 0,95 Genauigkeit stärkste Bereich **[belegt]**.
- **Raumstempel zuordnen.** „Küche 9,8 m²", „Kochen/Essen", „KÜ" einem Raumpolygon zuordnen.
- **Freitextanforderungen strukturieren.** „Gehobene Ausstattung, Induktion, kein Geschirrspüler bei den Einzimmerwohnungen" in Parameter übersetzen.
- **Plausibilitätsprüfung als zweite Meinung.** Das Modell beschreibt, was es sieht; die Abweichung von der Vektorextraktion markiert einen Prüffall für den Menschen. KI als Zweifelsgenerator, nicht als Autorität.

#### 4.1.4 Was aus Unterlagen zuverlässig gewinnbar ist — und was nicht

Diese Tabelle ist der ehrliche Kern des technischen Teils.

| Information | Aus Vektorplan gewinnbar | Bemerkung |
|---|---|---|
| Raumpolygon, Fläche | **zuverlässig** | aus Polylinien, über Maßstab skaliert |
| Wandstärken | **zuverlässig** bei DXF/IFC, meist bei Vektor-PDF | aus Doppellinien bzw. Objekteigenschaft |
| Maßstab | **zuverlässig prüfbar** | aus Maßketten gegengerechnet; muss vom Nutzer bestätigt werden |
| Fenster: Position und Breite | **zuverlässig** | als Block oder Wandunterbrechung |
| Fenster: Brüstungshöhe | **nicht aus dem Grundriss** | steht im Schnitt oder in der Fensterliste — planungsentscheidend für Oberschränke und Arbeitsplatte |
| Türen: Position und Breite | **zuverlässig** | als Block |
| Türen: Anschlagrichtung | **meist**, mit Prüfbedarf | aus Bogengeometrie; häufigste Fehlerquelle |
| Deckenhöhe | **nicht aus dem Grundriss** | aus Schnitt oder Baubeschreibung |
| Heizkörperpositionen | **oft** | als Block, Layer „HZ"; blockiert Unterschränke |
| Wasser- und Abwasseranschluss | **selten** | steht im Sanitärplan, nicht im Architektengrundriss; Abwasserfallstrang ist der eigentliche Zwangspunkt |
| Elektroanschlüsse | **selten** | Elektroplan; im Neubau ohnehin erst zu definieren — das ist der Hebel |
| Abluftführung, Schacht | **selten, aber kritisch** | Schächte sind im Grundriss als Polygon oft vorhanden; die Nutzbarkeit nicht |
| Rohbautoleranz | **grundsätzlich nicht** | planerische Unmöglichkeit, siehe 4.1.5 |
| Tragend/nichttragend | **teilweise** | aus Layer oder Schraffur; für Küchen selten relevant |

**[Einschätzung]** Der Nutzer muss zwingend kontrollieren oder ergänzen: Maßstab, Türanschläge, Brüstungshöhen, Deckenhöhe, Lage des Abwasserstrangs und die Frage, welche Räume überhaupt eine Küche erhalten. Das sind in einer gut gebauten Oberfläche fünf bis acht Bestätigungen pro Wohnungstyp — und bei gleichen Typen nur einmal.

Die Aufgabenstellung weist darauf hin, dass Unterlagen fehlerhaft, unvollständig oder uneinheitlich sein können. Das ist richtig und hat eine konstruktive Konsequenz: **Das System muss Lücken explizit als Lücken führen, nicht raten.** Jedes abgeleitete Maß trägt seine Herkunft (aus Maßkette gelesen / aus Geometrie gerechnet / vom Nutzer bestätigt / angenommen). Ein Plan mit unbestätigten Annahmen erzeugt kein freigegebenes Ergebnis, sondern eine Aufgabenliste. Das ist unbequem im Verkaufsgespräch und die einzige haftungsfähige Bauweise.

#### 4.1.5 Die physikalische Obergrenze: Rohbautoleranz

**[Einschätzung, fachlich etabliert, Normtext DIN 18202 nicht im Volltext geprüft]** Rohbaumaße weichen von Planmaßen ab — Wände sind nicht exakt rechtwinklig, Nischenmaße stimmen nicht auf den Millimeter. Eine Küche, deren Arbeitsplatte und Blendenzuschnitt aus Planmaßen gefertigt wird, passt mit hoher Wahrscheinlichkeit nicht. Ein Ratgeber formuliert die Folge treffend: Ein Zentimeterfehler beim Vermessen kann dazu führen, dass die letzte Schranktür nicht schließt **[belegt]**.

Daraus folgt eine harte Produktgrenze:

> Aus einem Plan kann ein **Mengengerüst und eine Spezifikation** entstehen. Eine **Fertigungsfreigabe** kann nur nach Aufmaß am fertigen Rohbau entstehen.

Das klingt wie eine Einschränkung und ist tatsächlich der Kern der Positionierung. Das Produkt liefert, was es *vor* dem Rohbau liefern kann — und das ist genau die Information, die heute fehlt. Das Aufmaß am Ende bleibt, wird aber zur Bestätigung einer bereits getroffenen Entscheidung statt zum Beginn einer Planung. Von drei Stunden Planung plus Aufmaß wird eine halbe Stunde Aufmaß plus Freigabe.

### 4.2 Automatische Küchenplanung

#### 4.2.1 Warum das der leichte Teil ist

Küchenmöbel sind rasterisiert. Die Korpusbreiten folgen einer kleinen, endlichen Menge, Tiefen und Höhen sind weitgehend normiert, Geräte haben Standardnischenmaße. DIN EN 1116:2018-03 „Möbel — Küchenmöbel — Koordinationsmaße für Küchenmöbel und Küchengeräte" legt genau diese Koordinationsmaße für Küchenmöbel, Arbeitsplatten, Nischenverkleidungen, Möbelfronten, Dekorplatten sowie für Küchengeräte und Einbauelemente wie Einbauspülen fest; gewerbliche Küchen sind ausgenommen **[belegt — Titel, Geltungsbereich und Aktualität verifiziert, Volltext nicht geprüft; 17 Seiten, ca. 82,60 € bei DIN Media]**.

**Wichtige Korrektur zu einer verbreiteten Verwechslung:** DIN 68935 ist **nicht** die Küchennorm, sondern „Koordinationsmaße für Badmöbel, Geräte und Sanitärobjekte" **[belegt, DIN-Media-Titel]**. Sie wird in Planungsratgebern regelmäßig fälschlich für Küchen zitiert **[belegt, widersprüchliche Sekundärquelle gefunden]**. Ebenso wird DIN 18022 noch zitiert **[belegt, Sekundärquelle]**, ist aber zurückgezogen; ihre Inhalte zu Bewegungsflächen leben in Sekundärliteratur fort. Wer das Regelwerk des Systems auf der falschen Norm aufbaut, baut es auf Badmöbelmaße.

Weil das Raster endlich und die Regeln endlich sind, ist die Platzierung ein **Packungs- und Zuordnungsproblem mit Nebenbedingungen** — kein Lernproblem. Dafür gibt es ausgereifte Werkzeuge: OR-Tools CP-SAT ist ein auf einer SAT-Engine aufgebauter Constraint-Solver, der seit 2017 mehrfach Gold bei der MiniZinc Challenge gewonnen hat, und dessen `no_overlap_2d`-Nebenbedingung — genau das Konstrukt für 2D-Platzierung — in neueren Versionen verbessert wurde **[belegt]**.

#### 4.2.2 Das Regelwerk: verbindlich, normativ, empfohlen

Die Aufgabenstellung verlangt ausdrücklich die Trennung verbindlicher Vorgaben von ergonomischen Empfehlungen. Diese Trennung ist für die Produkthaftung zentral und muss im Code als Regelkategorie abgebildet sein, nicht nur in der Dokumentation.

**Kategorie 1 — Verbindlich aus öffentlichem Recht und Technikregeln.** Verstoß verhindert Freigabe.
- Mindestabstände Kochstelle zu brennbaren Materialien und zur Dunstabzugshaube: Herstellerangabe, bindend aus Produkthaftung **[Einschätzung; herstellerspezifisch, keine einheitliche Norm]**
- Elektroinstallation: Schutzbereiche und Steckdosenabstände zu Spüle und Kochfeld nach VDE-Regelwerk **[Annahme, Normtext nicht geprüft]**
- Lüftung: Abluftbetrieb in Verbindung mit raumluftabhängigen Feuerstätten ist genehmigungs- und nachweispflichtig; im Wohnungsneubau ist das Lüftungskonzept nach DIN 1946-6 relevant **[Annahme, Normtext nicht geprüft — bei einem Bauvorhaben ohnehin durch den TGA-Planer gesetzt]**
- Barrierefreiheit, wo gefordert: DIN 18040-2 unterscheidet Standard und Rollstuhlnutzung. Sekundärquellen nennen durchgehend 120 × 120 cm Bewegungsfläche im Standard und 150 × 150 cm bei Rollstuhlnutzung, unterfahrbare Arbeitsfläche ab etwa 67 cm Höhe, Spüle ohne Unterschrank, Bedienhöhe 85 cm **[belegt als Sekundärquellen-Konsens; Normtext nicht geprüft, daher vor Produktivnutzung zu verifizieren]**. Eine Quelle behauptet, 150 cm seien bindend, sobald Fördermittel für barrierefreies Bauen beantragt werden — das ließ sich nicht verifizieren und betrifft wahrscheinlich Förderbedingungen, nicht die Norm **[belegt als unbestätigte Behauptung]**

**Kategorie 2 — Branchennorm und Koordinationsmaße.** Verstoß erzeugt eine unbaubare Planung.
- DIN EN 1116:2018-03 Koordinationsmaße **[belegt, Volltext zu beschaffen]**
- DIN EN 13310 Küchenspülen, funktionale Anforderungen **[belegt als Normexistenz]**
- Herstellerraster: Korpusbreiten, Nischenmaße der Geräte, Sockelhöhe, Arbeitsplattentiefe und -überstand **[aus Katalogdaten, herstellerspezifisch]**

**Kategorie 3 — Ergonomie und gute Praxis.** Verstoß ist ein Qualitätsmangel, kein Fehler. Gehört in die Bewertungsfunktion, nicht in die harten Nebenbedingungen.

Aus den AMK-Küchenstandards, erarbeitet auf Basis einer Ergonomiestudie des Instituts für Arbeitswissenschaften der TU Darmstadt im Auftrag der AMK, die mehr als 140 Mitgliedsunternehmen der Küchenbranche vertritt, sind folgende Werte belegt **[belegt, Volltext ausgewertet]**:

| Regel | Wert | Quelle im Dokument |
|---|---|---|
| Arbeitshöhe | 10 bis 15 cm unterhalb des Ellenbogens | AMK-Küchenstandards, Abschnitt Ergonomie |
| Absenkung des Kochfelds | ca. 25 cm gegenüber Arbeitshöhe, „wenn in der Planung möglich" | ebd. |
| Abstand zwischen zwei Küchenzeilen | mindestens 120 cm | ebd. |
| Bewegungsradius zu weiteren Elementen | mindestens 120 cm | ebd. |
| Arbeitsfläche Vorbereitungszone | mindestens 90 cm breit | ebd. |
| Platzbedarf pro Person am Essplatz | etwa 60 bis 70 cm | ebd. |
| Maßgeblich ist | Ellenbogenhöhe, nicht Körpergröße | ebd. |

Ein Widerspruch in den AMK-Quellen ist zu notieren: Eine AMK-Seite nennt für die Absenkung des Kochfelds maximal 15 cm, das Standards-Dokument 25 cm **[belegt als Widerspruch]**. Für einen Serienbau ist das ohnehin nachrangig — individuelle Ellenbogenhöhen gibt es bei unbekannten Erstmietern nicht. **[Einschätzung]** Im Projektgeschäft ist die Arbeitshöhe eine Produktentscheidung (üblich sind Korpus 72 cm plus Sockel, Ergebnis rund 86 bis 92 cm), nicht eine Planungsentscheidung. Die Ergonomieregeln entfalten ihren Wert erst im individualisierten Teil des Produkts.

**Zusätzliche harte Nebenbedingungen aus der Praxis [Einschätzung]:**
- Spüle nicht entfernt vom Abwasserfallstrang (der eigentliche Zwangspunkt; Gefälle der Abwasserleitung begrenzt den Abstand)
- Kein Hochschrank und keine Tür im Schwenkbereich einer Zimmertür
- Keine Oberschränke vor Fenstern; Arbeitsplatte unter Fenster nur bei passender Brüstungshöhe
- Kein Eckschrank ohne nutzbare Auszugstechnik unter einer bestimmten Restbreite
- Kühlschrank nicht direkt neben Backofen (Klimazonen; die AMK führt Klimazonen als eigenen Standard **[belegt]**)
- Heizkörper blockiert Unterschrank
- Mindestabstand Kochfeld zur seitlichen Wand und zur Spüle
- Montagefreundlichkeit: Restmaße unterhalb der kleinsten Passblende sind unbaubar

#### 4.2.3 Bewertungsfunktion

Die Aufgabenstellung listet die Bewertungskriterien bereits zutreffend. Die Umsetzung sollte sie in eine gewichtete, nachvollziehbare und vom Nutzer verstellbare Zielfunktion übersetzen — nicht in eine gelernte Blackbox. **[Einschätzung]** Vorschlag für die Gewichtungsachsen, die ein Projektentwickler verstellen können muss:

1. **Installationsaufwand** (Entfernung zu Fallstrang und Schacht, Zahl der neuen Leitungswege) — im Neubau der größte echte Kostentreiber
2. **Stauraumvolumen pro Laufmeter**
3. **Arbeitsflächenlänge zwischen Spüle und Kochfeld** (die operative Ergonomiekennzahl)
4. **Bewegungsfläche** (harte Grenze 120 cm, darüber Bonus)
5. **Teilekosten** gegen Budget
6. **Varianten-Wiederverwendung** — ein Layout, das einen bereits im Projekt verwendeten Typ trifft, erhält einen Bonus. Dies ist der Kniff, mit dem die Projektoptimierung aus Kapitel 6 in den Einzelsolver eingebaut wird.
7. **Montagefreundlichkeit** (Zahl der Passzuschnitte, Zugänglichkeit)

Die Zielfunktion muss ihre Punktevergabe pro Kriterium offenlegen. Ein Planer, der nicht sieht, *warum* Variante B besser bewertet wurde, akzeptiert das Ergebnis nicht — und hat recht damit.

### 4.3 Die Rolle der künstlichen Intelligenz

Die Aufgabenstellung fragt kritisch, ob eine KI die komplette Küchenplanung übernehmen sollte. Die Antwort ist nein, und zwar nicht aus Vorsicht, sondern aus Konstruktionslogik.

| Variante | Zuverlässigkeit | Prüfbarkeit | Aufwand | Bewertung |
|---|---|---|---|---|
| **1. Vollständig KI-generierte Planung** | niedrig | sehr niedrig | mittel | **Ungeeignet.** Nicht reproduzierbar, nicht begründbar, nicht haftungsfähig. Ein Modell, das Küchen „malt", kann nicht erklären, warum der Kühlschrank dort steht. Für einen Prozess, dessen Ergebnis bestellt und montiert wird, ist Nichtreproduzierbarkeit disqualifizierend. |
| **2. Rein regelbasiert parametrisch** | hoch | hoch | niedrig bis mittel | **Gut, aber zu starr.** Deckt Standardfälle sauber ab, scheitert an untypischen Raumzuschnitten und findet nicht das Optimum, sondern die erste zulässige Lösung. Als Fundament richtig. |
| **3. KI für Erkennung + regelbasierte Planung** | mittel bis hoch | hoch | mittel | **Nah dran, aber die Erkennung ist die falsche Stelle für KI.** Siehe 4.1.1: Genau dort ist die KI am schwächsten. |
| **4. Deterministischer Ingest + Constraint Solver + Optimierung, KI nur für Semantik** | **hoch** | **hoch** | mittel bis hoch | **Empfohlen.** Geometrie deterministisch, Platzierung beweisbar zulässig, Optimierung nachvollziehbar, KI auf ihre Stärke (Text, Semantik, Freitext) begrenzt. Jedes Ergebnis ist gegen das Regelwerk prüfbar. |
| **5. Integration in vorhandenes CAD** | hoch | hoch | **unkalkulierbar** | **Nicht als Fundament.** Keine offene Planungs-API belegt (3.3); Abhängigkeit von einem konsolidierenden Marktführer. Als *Ausgabeziel* sinnvoll, als Plattform riskant. |

**Empfehlung: Variante 4, mit Variante 5 als Exportziel.**

Die wichtigste Eigenschaft dieser Architektur: **Jede Aussage des Systems hat eine Herkunft.** Das Maß kommt aus einer Maßkette oder vom Nutzer. Die Platzierung erfüllt nachweisbar Regel 17 und 23. Die Bewertung ergibt sich aus offengelegten Gewichten. Ein Küchenplaner, ein Projektleiter und notfalls ein Gutachter können das nachvollziehen. Eine KI-generierte Küche kann das nicht, und daran scheitert sie nicht im Labor, sondern bei der ersten Reklamation.

### 4.4 Ausgabe und Weiterverarbeitung

| Ausgabe | Machbarkeit | Bemerkung |
|---|---|---|
| **Bemaßter 2D-Küchenplan (Grundriss + Ansichten)** | hoch | Kernergebnis. Aus der Modellgeometrie direkt gerendert. |
| **Installations- und Rohbauplan** | hoch | **Das wertvollste Ergebnis.** Positionen für Wasser, Abwasser, Elektro, Abluft, Höhenlagen. Projektweit konsistent, früh verfügbar. |
| **Modul- und Stückliste** | hoch | Pro Wohnung und projektweit aggregiert. |
| **Geräte- und Schrankliste** | hoch | — |
| **Budgetkalkulation** | mittel | Hängt vollständig an Preisdaten. Ohne Katalogzugang nur mit hinterlegten Eigenpreisen. |
| **PDF-Dokumentation** | hoch | — |
| **DXF-Export** | hoch | Deterministisch erzeugbar; der realistische Weg in die CAD-Welt des Küchenlieferanten. |
| **IFC-Export** | mittel | Technisch möglich (IfcOpenShell bietet vollständige Parsing-Unterstützung mehrerer IFC-Releases bis IFC4x3, umfangreiche Geometrieunterstützung für IFC2x3 und IFC4 Add2 TC1 **[belegt]**). Nutzen hängt davon ab, ob die Architektenseite überhaupt BIM-basiert arbeitet. |
| **Interaktives 3D-Modell** | mittel | Three.js / React Three Fiber genügt. **[Einschätzung]** Für den Projektentwickler zweitrangig, für den Wohnungskäufer im Vertrieb wertvoll — also ein spätes Feature mit Vertriebs-, nicht Planungsnutzen. |
| **Fotorealistische Visualisierung** | mittel | Reiner Vertriebsnutzen. Gehört nicht in den MVP. |
| **Direkte Schnittstelle zu Hersteller- oder Planungssystemen** | **niedrig bis unklar** | Siehe unten. Der kritische Punkt des gesamten Vorhabens. |

#### 4.4.1 Die Katalog- und Bestellfrage, im Detail

Dies ist der Abschnitt, an dem das Vorhaben steht oder fällt.

**Was existiert [belegt]:** Die deutsche Möbelbranche hat für planungsintensive Möbel ein eigenes Datenmodell, das IDM. Es wurde ursprünglich für planungsintensive Küchenmöbel entwickelt, basiert auf XML, und ein Datensatz enthält Stammdaten zum Produkt, Komponenten, Materialien und Ausprägungen dieser Materialien. Getragen wird es vom Daten Competence Center (DCC). Es wird europaweit von mehr als 40 Softwarehäusern verarbeitet, weshalb Hersteller ihre Daten meist in diesem Format liefern. Als Küchenhersteller mit IDM-Daten werden Leicht, Nobilia und Häcker genannt. Für Küche/Bad wurde das IDM-Format 2.8.0 zum 1.1.2022 scharfgeschaltet. Die Bestellabwicklung läuft über EANCOM; der Empfänger wird über die IDM-Hersteller-ID oder die ILN identifiziert, und Kombivarianten müssen bei bestellrelevanten Daten zwingend übermittelt werden. Für Polstermöbel existiert IDMP, EDIFURN ist ein EDIFACT-Subset für die Möbelindustrie.

**Die parallele Welt [belegt]:** OFML ist der Standard des IBA — Industrieverband Büro und Arbeitswelt, entstanden 1998. OFML-Daten enthalten neben 2D- und 3D-Ansichten konfigurationsrelevante Informationen, beschreibende Produkttexte und kaufmännische Informationen für Angebotserstellung und Warenwirtschaft. Erstellt werden sie mit pCon.creator, verteilt über pCon.update von EasternGraphics. Entscheidend: **Händler müssen vom Hersteller freigeschaltet werden, um dessen OFML-Daten zu erhalten**, und die Freischaltung kann bis zu zwei Arbeitstage dauern. Elektronischer Bestelldatenaustausch per EDI betrifft ausschließlich den kaufmännischen Teil der OFML-Daten.

**Was das für das Produkt bedeutet [Einschätzung]:**

1. **Geometrie und Bestelldaten liegen in verschiedenen Töpfen.** IDM liefert Artikel, Varianten, Preise und Bestellfähigkeit — es ist ein kaufmännisches und konfiguratives Format. Die *Planungsgeometrie und die Planungsregeln* der Küchenhersteller liegen in den proprietären Katalogen der Planungssysteme (Winner, CARAT). Ein Dritter bekommt über IDM also möglicherweise die Bestellfähigkeit, aber nicht die fertige Planungsintelligenz.
2. **Das ist lösbar, weil Küchenmöbel rasterisiert sind.** Die Geometrie muss nicht aus dem Katalog kommen — sie lässt sich aus dem Koordinationsmaßraster und den Maßtabellen des Herstellers selbst modellieren. Das ist Fleißarbeit, kein Risiko. Genau deshalb funktioniert der regelbasierte Ansatz.
3. **Der Zugang ist der Flaschenhals, und er ist kein technischer.** Beide Formatwelten setzen eine Freigabe durch den Hersteller voraus. Das heißt: Ohne eine Partnerschaft mit mindestens einem Hersteller oder einem freigeschalteten Händler ist das Produkt nicht bestellfähig.
4. **Die OFML-Welt ist für Küchen nur begrenzt nutzbar.** Der Standard wurde laut englischsprachiger Wikipedia hauptsächlich von seinen Autoren und einigen Adaptionen genutzt **[belegt]**; die Recherche fand keine küchenspezifischen OFML-Kataloge der genannten Hersteller. EasternGraphics bietet für Großküchen einen herstellerneutralen Katalog **ohne Preisinformationen** an und bezeichnet ihn selbst als Zwischenlösung auf dem Weg zu breiteren Herstellerdaten mit Preisen **[belegt]**. Das ist ein deutliches Signal, dass die Datenlage auch für etablierte Anbieter dünn ist.
5. **Für Winner Flex ist keine Planungs-API belegt** (3.3). Der realistische Weg in die Welt des Küchenlieferanten führt über DXF plus eine strukturierte Stückliste — also über ein Austauschformat, nicht über eine Integration.

**Daraus folgt die Umgehungsstrategie [Einschätzung]:** Der MVP arbeitet mit **einer** Modulfamilie, deren Maße und Preise aus einer vom Partnerlieferanten bereitgestellten Tabelle kommen — nicht aus einem Branchenformat. Das ist unelegant, sofort machbar und bewahrt davor, die Verbands- und Freigabefrage zur Vorbedingung des ersten Produkts zu machen. Die IDM-Anbindung ist ein Skalierungsthema, nicht ein Startthema. Wer sie zur Startbedingung macht, startet nicht.

---

## 5. Empfohlener Lösungsansatz

### 5.1 Die sechs Schichten

```
1  INGEST (deterministisch)
   Vektor-PDF / DXF / DWG / IFC
   → Polylinien, Blöcke, Texte, Layer, Maßketten
   → Bibliotheken: ezdxf (DXF), pdfplumber bzw. PyMuPDF (Vektor-PDF),
     IfcOpenShell (IFC), Shapely (Geometrieoperationen)
   → Raster nur über Zukauf (CubiCasa / RasterScan), nicht im MVP

2  SEMANTIK (hier und nur hier KI)
   Layernamen → kanonisches Schema
   Schriftfeld, Legende, Maßstab, Raumstempel
   Freitextanforderungen → Parameter
   → Claude Haiku 5.5 für Massenextraktion, Opus 5.5 für unklare Fälle

3  MENSCHLICHES TOR (das Produkt, nicht der Notausgang)
   Grundriss-Viewer mit überlagerter erkannter Geometrie
   Bestätigen oder korrigieren: Maßstab, Türanschläge, Brüstungshöhen,
   Deckenhöhe, Fallstrang, "Küche ja/nein" je Raum
   → gemessen in Klicks, nicht in Erkennungsrate
   → Wohnungstypen werden einmal bestätigt, nicht 40-mal

4  GENERATOR (deterministisch, beweisbar)
   Regelwerk (Kat. 1 hart / Kat. 2 hart / Kat. 3 Bewertung)
   OR-Tools CP-SAT mit no_overlap_2d über das Modulraster
   Kandidatenerzeugung je Küchenform (einzeilig, zweizeilig, L, U,
   Halbinsel, Insel) → Bewertung → 2 bis 3 Varianten
   → jede Lösung trägt die erfüllten Regeln als Nachweis mit

5  PROJEKTSCHICHT (der eigentliche Wertbeitrag)
   Geometrie-Normalisierung und Spiegelung
   Clustering ähnlicher Küchensituationen
   Typenbildung, Zuordnung, Toleranzausgleich
   Projektweite Mengen- und Kostenaggregation

6  AUSGABE
   Bemaßter 2D-Plan | Installationsplan | Stückliste | Budget
   | PDF-Dokumentation | DXF | später IFC, 3D
```

### 5.2 Datenfluss, konkret

1. Nutzer legt ein Projekt an, lädt 40 Plan-PDFs hoch (oder einen Plansatz mit 40 Wohnungen).
2. Ingest extrahiert je Plan die Vektorgeometrie. Maßstab wird aus Maßketten gegengerechnet; Abweichung über Schwelle → Prüffall.
3. Semantikschicht liest Schriftfeld, Wohnungsnummern, Raumstempel. Layer-Zuordnung wird für dieses Architekturbüro einmal gelernt und gespeichert.
4. System bildet Raumpolygone, Wandachsen, Öffnungen. Markiert Küchenräume anhand Raumstempel und Plausibilität.
5. **Projektschicht gruppiert vor der Planung**, nicht danach: 40 Küchenräume werden auf n Geometrieklassen reduziert (Kapitel 6).
6. Nutzer bestätigt **n Typen**, nicht 40 Wohnungen. Hier liegt die eigentliche Zeitersparnis.
7. Nutzer definiert Anforderungen: Ausstattungsniveau, Budget pro Einheit, Gerätepaket, Pflichtausstattung, Barrierefreiheitsanteil.
8. Generator erzeugt je Typ zwei bis drei Varianten, bewertet, zeigt Begründung.
9. Nutzer wählt pro Typ, passt bei Bedarf manuell nach. Jede manuelle Änderung wird gegen das Regelwerk geprüft und ggf. als Verstoß markiert.
10. Projektschicht rechnet Mengen und Kosten für das Gesamtprojekt, zeigt die Einsparung durch Standardisierung.
11. Ausgabe: Installationsplan je Wohnung (früh, für den Rohbau), Küchenplan je Typ, Stückliste je Wohnung und aggregiert, DXF, PDF.
12. Nach Rohbaufertigstellung: Aufmaß-Abgleich. Abweichungen je Wohnung werden eingetragen, System rechnet Passmaße und Blendenzuschnitte nach, erzeugt die Freigabefassung.

Schritt 12 ist der Punkt, an dem das Produkt von „Vorplanung" zu „Bestellvorbereitung" wird — und er ist bewusst an das physische Aufmaß gebunden.

---

## 6. Besonderheiten für große Wohnbauprojekte

Die Aufgabenstellung bezeichnet dieses Thema als besonders wichtig. Das ist richtig: **Hier liegt der wirtschaftliche Kern des Vorhabens.** Die Einzelküchenplanung ist ein gelöstes Problem mit vielen Anbietern. Die projektweite Standardisierung ist es nicht.

### 6.1 Wie realistisch ist das Beispiel?

Das Beispiel „40 Wohnungen, sechs Küchensituationen" ist plausibel und wird von der Praxis gestützt: Ein Küchenanbieter formuliert, dass Küchen für Projektentwickler in der Regel innerhalb einer Charge standardisiert sein können, da der Grundriss mehrerer Wohnungen in Großprojekten oft identisch ist **[belegt, Anbieterangabe]**. Ein anderer berichtet von einem Genossenschaftsprojekt, bei dem aufgrund der großen Anzahl alle Küchenmöbel direkt zum Objekt geliefert und von eigenen Montageteams in den verschiedenen Wohneinheiten eingebaut wurden **[belegt, Anbieterangabe]**.

**[Einschätzung]** Mehrfamilienhäuser wiederholen Grundrisse geschossweise, weil Statik, Steigschächte und Treppenhauskern das vorgeben. Die typische Struktur ist: zwei bis fünf Wohnungstypen pro Geschoss, über fünf Geschosse wiederholt, plus Abweichungen im Erd- und Dachgeschoss. Sechs Küchentypen auf 40 Wohnungen ist eher konservativ; realistisch sind oft vier bis acht, wobei Spiegelungen die halbe Arbeit sind.

### 6.2 Die drei technischen Schwierigkeiten — und ihre Lösung

Die Aufgabenstellung benennt sie korrekt: kleine geometrische Unterschiede, gespiegelte Grundrisse, unterschiedliche Installationspositionen. **[Einschätzung]** So lassen sie sich lösen:

**Gespiegelte Grundrisse.** Lösbar und einfach. Jedes Küchenraumpolygon wird kanonisiert: Ursprung in die Ecke am Zwangspunkt (Fallstrang) legen, Hauptachse normieren, dann sowohl das Polygon als auch sein Spiegelbild hashen und den lexikografisch kleineren als Signatur verwenden. Zwei gespiegelte Räume erhalten damit dieselbe Signatur. Die Küche wird einmal geplant und für die gespiegelten Wohnungen gespiegelt ausgegeben — mit dem wichtigen Hinweis, dass Geräte- und Türanschläge mitgespiegelt werden müssen und Spülen-/Kochfeldanschlüsse nicht automatisch spiegelbar sind.

**Kleine geometrische Unterschiede.** Das ist die eigentliche Intelligenz. Nicht nach exakter Gleichheit clustern, sondern nach *Planungsäquivalenz*: Zwei Räume sind äquivalent, wenn dieselbe Modulfolge in beiden zulässig ist. Praktisch: Nischenlänge auf das Modulraster abrunden (ein Raum von 3,42 m und einer von 3,47 m nehmen dieselbe Zeile aus 30+60+60+60+60 cm auf, der Rest geht in die Passblende), Öffnungspositionen auf Toleranzbänder quantisieren, dann über diesen quantisierten Merkmalen clustern. Ergebnis: ein Typ mit einem definierten Toleranzfenster plus Passblendenmaß je Wohnung. Das ist genau die Denkweise, mit der ein erfahrener Küchenplaner im Objektgeschäft arbeitet.

**Unterschiedliche Installationspositionen.** Der härteste Fall — und hier zeigt sich der Wert der Umkehrung aus Kapitel 1. Wenn der Installationsplan *Ergebnis* des Werkzeugs ist und nicht *Eingabe*, löst sich das Problem auf: Das System legt die Anschlusspositionen für alle Wohnungen eines Typs identisch fest und gibt sie an den TGA-Planer. Statt sich an vorgegebene, uneinheitliche Installationen anzupassen, erzeugt es Einheitlichkeit. Das funktioniert naturgemäß nur im Neubau vor dem Rohbau — und genau das ist der Anwendungsfall des Projektentwicklers.

Für Bestandsmodernisierung (Wohnungsbaugesellschaften) gilt das nicht; dort sind die Installationen gesetzt und das Clustering muss sie als Merkmal mitführen. Das ist eine andere Produktvariante.

### 6.3 Was die Projektschicht liefert, das sonst niemand liefert

- **Typenübersicht:** „40 Wohnungen, 6 Küchentypen, Typ A 14-mal, Typ B 9-mal …"
- **Standardisierungsvorschlag mit Preis:** „Wenn Sie Typ C und Typ D auf ein gemeinsames Maß bringen, sparen Sie X € Einkauf und einen Rüstvorgang — es kostet 8 cm Arbeitsfläche in 5 Wohnungen."
- **Mengengerüst über alle Einheiten:** Grundlage für Rahmenvertrag und Ausschreibung
- **Projektweiter Installationsplan**, konsistent, früh
- **Was-wäre-wenn:** Budgetänderung, Gerätepaketwechsel, Entfall des Geschirrspülers in Einzimmerwohnungen — jeweils in Sekunden über 40 Einheiten gerechnet
- **Sonderwunsch-Delta:** Wenn ein Erwerber abweicht, rechnet das System die Differenz zum Standardtyp aus — genau die Kalkulationsbasis, die ein Nachtragsangebot braucht

**[Einschätzung]** Der letzte Punkt verdient Aufmerksamkeit. Die rechtliche Lage macht Sonderwünsche für Bauträger aufwendig: Nachtragsangebote mit Material, Arbeitsleistung, Planung, Koordination und Umsatzsteuer; Beurkundungsfragen; Koordinations- und Prüfpflicht des Bauträgers **[belegt]**. Ein Werkzeug, das aus „Erwerber will eine andere Küche" automatisch ein kalkuliertes Delta und eine technische Machbarkeitsprüfung gegen den Standard macht, trifft einen konkreten, teuren, rechtlich belasteten Prozess. **Das ist möglicherweise der stärkste einzelne Verkaufsgrund im gesamten Produkt** — und er steht nicht in der ursprünglichen Aufgabenstellung.

---

## 7. Produkt- und UX-Konzept

### 7.1 Der Leitgedanke der Oberfläche

**[Einschätzung]** Die Aufgabenstellung nennt als Ziel geringe Komplexität für den Anwender. Der Weg dorthin ist nicht, Entscheidungen zu verstecken, sondern ihre Anzahl zu reduzieren: **Der Nutzer bestätigt Typen, nicht Wohnungen.** 40 Wohnungen mit je fünf Bestätigungen sind 200 Interaktionen und damit unbenutzbar. Sechs Typen mit je fünf Bestätigungen sind 30 Interaktionen und damit ein Nachmittag.

Zweiter Leitgedanke: **Jede Zahl zeigt auf Nachfrage ihre Herkunft.** Ein B2B-Werkzeug, dem der Fachmann nicht ins Werk schauen kann, wird nicht benutzt — es wird parallel nachgerechnet, und dann war es nutzlos.

Dritter Leitgedanke: **Unsicherheit wird gezeigt, nicht geglättet.** Ein erkanntes Maß mit niedriger Konfidenz wird gelb markiert und nicht wie ein bestätigtes Maß dargestellt. Das baut Vertrauen auf, statt es zu verbrauchen.

### 7.2 Der Ablauf, mit Interaktionszählung

| Schritt | Interaktionen | Anmerkung |
|---|---|---|
| Projekt anlegen | 3–5 Felder | Name, Ort, Einheitenzahl, Ausstattungsniveau |
| Pläne hochladen | 1 (Mehrfachauswahl) | — |
| *System: Ingest + Clustering* | 0 | Hintergrundlauf, Minuten |
| **Typen bestätigen** | **n × 5–8** | **der Kern; bei n=6 also 30–50** |
| Anforderungen definieren | 6–10 Felder | projektweit, mit Ausnahmen je Typ |
| *System: Generierung* | 0 | Sekunden bis Minuten |
| Varianten je Typ wählen | n × 1–3 | Vergleichsansicht |
| Optional manuell nachbessern | variabel | mit Regelprüfung |
| Freigeben und exportieren | 2–3 | — |
| *Später:* Aufmaß einpflegen | 40 × 4–6 Maße | hier ist Masse unvermeidlich, aber es ist Dateneingabe, nicht Planung |

**[Einschätzung]** Realistisch bleiben also für ein Projekt mit 40 Wohnungen und 6 Typen etwa 60 bis 100 bewusste Interaktionen bis zur freigegebenen Vorplanung — gegenüber heute 40 Planungsvorgängen. Das ist die ehrliche Zahl. Nicht „ein Klick", aber eine Größenordnung weniger.

### 7.3 Die Bildschirme, die zählen

**Projektübersicht.** Eine Tabelle, keine Kacheln. Spalten: Wohnung, Geschoss, Fläche, Küchentyp, Status (erkannt / bestätigt / geplant / freigegeben / Aufmaß offen), Kosten. Darüber eine Zeile mit dem Projektstand: „40 Einheiten · 6 Typen · 31 freigegeben · Budget 164.000 € von 180.000 €". Filterbar, sortierbar, exportierbar. Ein Projektleiter arbeitet in Listen.

**Dokumentenupload.** Ablagefeld, Statusliste je Datei, und — wichtig — pro Datei die Angabe, *was* erkannt wurde: „Vektorplan, 4 Wohnungen, Maßstab 1:50 aus Maßkette bestätigt" oder „Rasterplan — nicht unterstützt". Sofortige, ehrliche Rückmeldung verhindert die Enttäuschung nach zwanzig Minuten Wartezeit.

**Grundriss-Viewer und Geometriekorrektur.** Der wichtigste Bildschirm. Der Originalplan als Hintergrund, darüber die erkannte Geometrie in halbtransparenten Farben: Wände, Öffnungen, Raumpolygon. Jedes erkannte Element anklickbar und korrigierbar. Türanschläge als Bogen dargestellt, mit einem Umschalter „andere Seite / andere Richtung". Maßstab prominent mit Herkunft und einem Nachmessen-Werkzeug. Die Prüffälle werden als Liste rechts geführt, abarbeitbar mit Tastatur. **Kein KI-Jargon, keine Konfidenzzahlen in Prozent** — stattdessen „bestätigt" / „bitte prüfen".

**Anforderungen.** Formular mit sinnvollen Vorbelegungen, nicht leer. Ausstattungsniveau als drei bis vier benannte Pakete, nicht als Schieberegler. Budget pro Einheit. Gerätepaket. Pflichtpositionen. Ausnahmen je Typ. Freitextfeld, dessen Inhalt in Parameter übersetzt und dann *als Parameter angezeigt* wird, damit der Nutzer die Übersetzung prüfen kann.

**Variantenvergleich.** Zwei bis drei Varianten nebeneinander, je mit 2D-Plan, Kennzahlen (Stauraum, Arbeitsfläche, Installationsaufwand, Kosten) und — entscheidend — der Begründung: „Variante B: Spüle 1,2 m näher am Fallstrang, 40 cm mehr Arbeitsfläche zwischen Spüle und Kochfeld, 180 € teurer." Daneben ein Hinweis auf Wiederverwendung: „Diese Variante entspricht Typ A — keine zusätzliche Bestellposition."

**Budgetoptimierung.** Kein eigener Bildschirm, sondern ein Panel in der Projektübersicht: eine Liste konkreter Vorschläge mit Preis und Preis in Komfort. „Typ C und D zusammenführen: −4.200 €, kostet 8 cm Arbeitsfläche in 5 Einheiten. Übernehmen?"

**Freigabe.** Ein Freigabevorgang, der ausdrücklich benennt, was freigegeben wird und was nicht: „Freigegeben: Mengengerüst, Modulauswahl, Installationspositionen. Nicht freigegeben: Fertigungsmaße — diese erfordern ein Aufmaß nach Rohbaufertigstellung." Diese Formulierung ist nicht juristische Vorsicht, sie ist die Produktwahrheit aus 4.1.5.

**Export und Übergabe.** Ein Paket pro Projekt oder pro Wohnung: PDF-Dokumentation, DXF, Stückliste als XLSX und CSV, Installationsplan. Plus ein Übergabedokument für den Küchenlieferanten, das in seiner Sprache geschrieben ist.

### 7.4 Was absichtlich fehlt

**[Einschätzung]** Fotorealistische Visualisierung, 3D-Rundgang, Materialauswahl mit Oberflächenvorschau, Endkundenportal. Das sind Vertriebswerkzeuge. Sie machen eine Demo schön und ein Projekt teuer. Sie gehören in die Phase nach dem Beweis, dass der Kern funktioniert — und sie sind der Grund, warum viele Werkzeuge in diesem Feld bei Welt A aus Kapitel 3.1 stehen bleiben: Weil die Bilder leichter sind als die Maße.

---

## 8. Architektur und Technologie-Stack

### 8.1 Empfehlung

| Ebene | Empfehlung | Begründung |
|---|---|---|
| **Frontend** | Next.js + TypeScript + Tailwind | Vorhandene Kompetenz; SSR für Listenansichten; schnell |
| **Plan-Viewer** | Canvas/SVG mit eigener Renderschicht, **nicht** Three.js | 2D ist das Arbeitsmedium. Three.js erst für optionale 3D-Ansicht. Ein 3D-Viewer für eine 2D-Aufgabe ist eine teure Fehlentscheidung. |
| **3D (später)** | React Three Fiber | Wenn, dann so. |
| **Backend-Geometrie** | **Python**, FastAPI | Nicht verhandelbar: Die relevanten Bibliotheken (ezdxf, Shapely, IfcOpenShell, OR-Tools) sind Python-Ökosystem. Das Geometrie- und Solver-Backend in TypeScript nachzubauen wäre ein Jahr verschenkte Zeit. |
| **Anwendungs-Backend** | Next.js API Routes oder ein zweiter Node-Dienst | Projekte, Nutzer, Dateien. Der Python-Dienst bleibt ein Rechendienst ohne Fachlogik der Anwendung. |
| **Datenbank** | PostgreSQL, Supabase als Plattform | Vorhandene Kompetenz; Row Level Security für Mandantentrennung; PostGIS optional für Geometrie — nicht nötig, Shapely rechnet im Dienst |
| **Dateiablage** | Supabase Storage oder S3-kompatibel | Pläne sind groß und vertraulich; signierte URLs, kurze Gültigkeit |
| **Warteschlange** | einfache Job-Tabelle mit Polling, nicht Celery/Redis | Lastprofil: wenige Läufe pro Tag, Minutenlaufzeiten. Eine Job-Tabelle genügt jahrelang. |
| **DXF/DWG** | **ezdxf** | Reifste Python-DXF-Bibliothek. DWG nur über Konverter (ODA File Converter oder Zukauf) — DWG ist proprietär. **[Einschätzung; ezdxf-Reife in der Recherche nicht quellenbelegt, aber im Python-CAD-Umfeld etabliert]** |
| **Vektor-PDF** | PyMuPDF oder pdfplumber | Linien, Texte, Transformationsmatrizen |
| **IFC** | **IfcOpenShell** | LGPL; vollständige Parsing-Unterstützung mehrerer IFC-Releases bis IFC4x3, umfangreiche Geometrieunterstützung für IFC2x3 und IFC4 Add2 TC1 **[belegt]** |
| **Geometrie** | **Shapely** | 2D-Operationen, Buffer, Verschneidung. Reicht vollständig. |
| **3D-Geometrie / OpenCascade** | **nicht im MVP** | Küchenplanung ist ein 2,5D-Problem: Grundriss plus Höhenebenen. Volumenmodellierung mit OpenCascade ist eine Größenordnung mehr Komplexität ohne Gegenwert. Eine der wichtigsten Weglassentscheidungen. |
| **Solver** | **OR-Tools CP-SAT** | SAT-basierter Constraint-Solver, mehrfach Gold bei der MiniZinc Challenge seit 2017, mit verbesserter `no_overlap_2d`-Nebenbedingung für 2D-Platzierung **[belegt]** |
| **KI** | **Claude**, zwei Stufen | Haiku 5.5 (0,10 $ / 0,50 $ pro Mio. Token) für Massenextraktion von Text und Layern; Opus 5.5 (4 $ / 20 $ pro Mio. Token) für unklare Fälle und Freitextinterpretation **[belegt, Preisstand Oktober 2026]**. Strukturierte Ausgabe erzwingen, nie Freitext parsen. |
| **Raster-Fallback (später)** | CubiCasa Conversion API oder RasterScan | Zukauf, kein Eigenbau **[belegt, dass beide existieren]** |
| **Hosting** | Vercel (Frontend) + Container für Python (Fly.io, Railway, Hetzner) | Der Python-Dienst braucht Rechenzeit und RAM, nicht Serverless |

### 8.2 Zwei Architekturentscheidungen, die den Unterschied machen

**Erstens: Die Geometrie ist eine eigene, versionierte Datenstruktur, nicht ein Nebenprodukt.** Zwischen Ingest und Generator steht ein explizites, serialisiertes Raummodell: Polygone, Öffnungen, Zwangspunkte, Höhen, und für jedes Attribut seine Herkunft und Konfidenz. Dieses Modell ist versioniert und auditierbar. Es ist die Vertragsschnittstelle zwischen dem unsicheren Teil (Erkennung) und dem sicheren Teil (Planung). Ohne diese Trennung sickert Unsicherheit in die Planung und wird unauffindbar.

**Zweitens: Der Solver bekommt niemals ein unbestätigtes Maß.** Das menschliche Tor ist eine harte Phasengrenze, kein optionaler Prüfschritt. Technisch: Der Generator verweigert die Ausführung, wenn ein Pflichtattribut den Status „unbestätigt" trägt. Das ist unbequem und verhindert die Klasse von Fehlern, die solche Produkte umbringt — plausibel aussehende Ergebnisse auf falschen Eingaben.

### 8.3 Was nicht in den Stack gehört

**[Einschätzung]** Kein eigenes CV-Modelltraining. Kein Vektordatenbank-RAG über Normtexte (die Regeln sind endlich, sie gehören in Code und Tests, nicht in eine Ähnlichkeitssuche). Kein Agent-Framework, das selbständig Planungsentscheidungen trifft — das widerspricht der Prüfbarkeitsanforderung aus 4.3. Kein Microservice-Schnitt bei zwei Entwicklern.

---

## 9. Proof of Concept

### 9.1 Was der PoC beweisen muss

Der PoC prüft nicht, ob eine Küche geplant werden kann. Er prüft die drei Annahmen, bei deren Scheitern das ganze Vorhaben fällt. **Zwei bis drei Wochen, kein Frontend, keine Datenbank, Ergebnisse als PDF und Tabelle.**

**Risiko 1: Sind echte Pläne auslesbar?**
Messung: 20 echte Plansätze des Entwicklers, über mindestens drei verschiedene Architekturbüros. Anteil mit nutzbarer Vektorebene. Fehler der Maßstabsrückrechnung. Abweichung der extrahierten Wandachsen und Nischenlängen gegen eine manuelle Vermessung derselben Pläne.
**Abbruchkriterium:** Weniger als 70 % nutzbare Vektorpläne, oder mittlerer Nischenlängenfehler über 20 mm.

**Risiko 2: Trifft der Generator, was ein Küchenplaner tatsächlich gebaut hat?**
Das ist die entscheidende Messung, und sie ist möglich, weil der Entwickler abgeschlossene Projekte hat. Methode: Generator auf die Küchenräume von drei abgeschlossenen Projekten laufen lassen, **ohne** die damaligen Planungen zu kennen. Dann vergleichen: Küchenform gleich? Spülenposition innerhalb von 60 cm? Kochfeldposition innerhalb von 60 cm? Modulanzahl und Gesamtbreite innerhalb von 5 %?
**Erfolgskriterium:** 70 % der Küchen in Form und Zonenanordnung übereinstimmend. **Abbruchkriterium:** unter 50 %.
Das ist die aussagekräftigste Einzelzahl des gesamten Vorhabens — und niemand sonst kann sie erzeugen, weil niemand sonst die Vergangenheitsdaten hat.

**Risiko 3: Nimmt ein Küchenlieferant das Ergebnis an?**
Keine Programmierung. Ein Gespräch, eine Mappe, eine schriftliche Antwort. Dem Lieferanten werden drei generierte Mengengerüste plus DXF vorgelegt mit einer einzigen Frage: Können Sie darauf ein verbindliches Angebot legen, und wenn nein, was fehlt?
**Abbruchkriterium:** Kein Lieferant kann oder will darauf bepreisen.

### 9.2 Was der PoC absichtlich nicht enthält

Keine Oberfläche. Keine Rastererkennung. Keine 3D-Ansicht. Keine Mehrmandantenfähigkeit. Nur eine Küchenform-Familie und eine Modulfamilie. Kein Clustering (das kommt im MVP, es ist unstrittig machbar).

**[Einschätzung]** Risiko 3 ist das größte und das billigste zu prüfen. Es sollte **zuerst** geprüft werden, in Woche 1, parallel zum Ingest-Experiment. Ein Nein dort erspart alles Weitere.

### 9.3 Qualitätskriterien und Abnahmetests für MVP und Produkt

| Kriterium | Messung | Zielwert |
|---|---|---|
| Vektorplan-Abdeckung | Anteil verarbeitbarer Eingangspläne | > 80 % |
| Maßtreue | Nischenlängenfehler gegen Aufmaß | < 20 mm im Median |
| Türanschlag-Erkennung | Anteil korrekt, vor Nutzerkorrektur | > 85 % |
| Regelkonformität | Anteil generierter Layouts ohne Verstoß gegen Kategorie 1 und 2 | **100 %** (harte Bedingung, durch Solver garantiert) |
| Planerübereinstimmung | Deckung mit menschlicher Planung (s. 9.1) | > 70 % |
| Bestätigungsaufwand | Interaktionen bis freigegebene Vorplanung, 40 Einheiten | < 120 |
| Clustering-Güte | gefundene Typen gegen manuelle Typisierung durch einen Planer | Abweichung ≤ 1 Typ |
| Aufmaß-Delta | Anteil Wohnungen, bei denen das Aufmaß die Modulauswahl ändert | < 10 % |
| Durchlaufzeit | 40 Wohnungen von Upload bis Variantenvorschlag | < 30 min Rechenzeit |

Der Wert „Regelkonformität 100 %" ist bewusst absolut. Ein Solver, der harte Nebenbedingungen erfüllt, erfüllt sie — oder er findet keine Lösung und sagt das. Das ist der strukturelle Vorteil gegenüber einem generativen Ansatz und muss als Testinvariante abgesichert sein.

---

## 10. MVP-Funktionsumfang

### 10.1 Absolut notwendig

- Vektor-PDF und DXF als Eingabe
- Maßstabsbestätigung durch den Nutzer, mit Gegenrechnung aus Maßketten
- Rechteckige und L-förmige Küchenräume (deckt den Wohnungsbau weitgehend ab)
- **Eine** Modulfamilie eines Partnerlieferanten, mit Maßen und Preisen aus Tabelle
- Türen, Fenster, Heizkörper, Fallstrang als Zwangspunkte
- Generierung einzeiliger, zweizeiliger und L-Küchen
- Regelwerk Kategorie 1 und 2 als harte Nebenbedingungen, Kategorie 3 als Bewertung
- Zwei bis drei Varianten je Typ, mit Begründung
- **Variantenclustering über das Projekt** (das Unterscheidungsmerkmal — nicht später)
- Bemaßter 2D-Plan, Stückliste je Wohnung und aggregiert, PDF
- **Installationsplan** (das Wertversprechen — nicht später)
- Manuelle Nachbearbeitung mit Regelprüfung
- Mehrbenutzerfähigkeit innerhalb eines Unternehmens, Projektrechte

### 10.2 Später

Raster- und Skizzenerkennung über Zukauf. U-Küchen, Halbinsel, Insel. IFC-Import und -Export. 3D-Ansicht. Weitere Modulfamilien und Hersteller. IDM-Anbindung und Bestelldatenübertragung. Aufmaß-Modul mit Nachrechnung der Passmaße. Barrierefreiheitsregelwerk nach DIN 18040-2. Sonderwunsch-Delta-Rechnung. Endkundenvisualisierung. Mandantenfähigkeit für echtes SaaS.

### 10.3 Zunächst zu kompliziert oder unwirtschaftlich

**[Einschätzung]**

- **Eigene Grundriss-CV-Modelle.** Die Benchmarkzahlen aus 4.1.1 zeigen, dass selbst Spezialmodelle bei Öffnungen unzuverlässig sind. Ein eigenes Training ist ein Forschungsprojekt.
- **Direkte Integration in Winner oder CARAT.** Keine offene Planungs-API belegt, Marktführer in Konsolidierung (3.2, 3.3). DXF ist der pragmatische Weg.
- **Vollständige Herstellerkataloge.** Katalogpflege ist das Geschäftsmodell anderer. Eine Modulfamilie genügt für den Beweis.
- **Automatische TGA-Planung.** Abluft, Lüftungskonzept, Elektroauslegung gehören zum Fachplaner. Das Werkzeug liefert ihm Positionen, es ersetzt ihn nicht.
- **Fotorealistik.** Teuer, austauschbar, ohne Bezug zum Kernnutzen.
- **Vollautomatik ohne menschliches Tor.** Technisch verlockend, haftungsrechtlich nicht tragbar (4.1.5, Kapitel 13).

---

## 11. Entwicklungsaufwand und Kosten

### 11.1 Grundlagen der Kalkulation

**[belegt]** Stundensätze in Deutschland 2026 sind in den Quellen breit gestreut und widersprüchlich: ein Freelancer-Benchmark nennt einen Median von 95 € netto für IT-Freelancer im DACH-Raum und etwa 90 € für Software- und Webentwicklung; andere Quellen nennen 65 bis 140 €, Senior-Sätze von 120 bis 160 €, und eine Staffelung von 60 bis 90 € (Generalisten) über 90 bis 130 € (Senior) bis 130 bis 180 € (Spezialisten). Tagessätze werden mit 550 bis 650 € bzw. 760 bis 820 € angegeben. Die Quellen unterscheiden nicht durchgängig zwischen brutto und netto und stammen überwiegend von Anbietern eigener Dienstleistungen.

**[Annahme]** Für diese Kalkulation: **110 €/h Mischsatz** bei externer Vergabe (Senior-Niveau ist für Geometrie und Solver nötig). Bei Eigenleistung Opportunitätskosten in gleicher Höhe ansetzen.

**[belegt, Preisstand Oktober 2026]** KI-Kosten: Claude Haiku 5.5 bei 0,10 $ / 0,50 $ pro Mio. Token (Ein-/Ausgabe), Claude Sonnet 5.5 bei 2 $ / 10 $, Claude Opus 5.5 bei 4 $ / 20 $.

### 11.2 Szenario A — Technischer Proof of Concept

| Posten | Aufwand |
|---|---|
| Lieferantengespräch, Mappe, Auswertung (Risiko 3) | 8–16 h |
| Vektor-Ingest für PDF und DXF, Maßstabsrückrechnung | 30–50 h |
| Raummodell, Öffnungsextraktion, Zwangspunkte | 25–40 h |
| Regelwerk Kategorie 1 und 2, erste Fassung | 15–25 h |
| CP-SAT-Modell für einzeilig und L, Bewertung | 30–50 h |
| Rückvergleich gegen abgeschlossene Projekte (Risiko 2) | 15–25 h |
| Ausgabe als PDF und Tabelle, Auswertung, Bericht | 10–20 h |
| **Summe** | **130–230 h** |
| **Dauer** | **2–4 Wochen** (eine Person, konzentriert) |
| **Kosten extern** | **14.000–25.000 €** |
| Infrastruktur | < 50 €/Monat |
| KI-API | < 50 € gesamt |

### 11.3 Szenario B — Nutzbarer MVP

| Posten | Aufwand |
|---|---|
| Ingest produktiv: Formatvarianten, Fehlerfälle, Bürovarianten der Layer | 90–150 h |
| Semantikschicht mit Claude, strukturierte Ausgabe, Layer-Lernen je Büro | 50–80 h |
| Raummodell mit Herkunfts- und Konfidenzführung, Versionierung | 50–80 h |
| **Grundriss-Viewer und Geometriekorrektur** (der aufwendigste Frontend-Teil) | 120–200 h |
| Regelwerk vollständig, Kategorisierung, Testabdeckung | 70–110 h |
| Generator: drei Küchenformen, Bewertung, Begründungsausgabe | 110–180 h |
| **Projektschicht: Normalisierung, Spiegelung, Clustering, Typenverwaltung** | 90–150 h |
| Anforderungs- und Budgetlogik, Was-wäre-wenn | 50–80 h |
| Ausgabe: bemaßter Plan, Installationsplan, Stückliste, PDF, DXF | 110–170 h |
| Projekt-, Nutzer-, Rechte- und Dateiverwaltung | 70–110 h |
| Oberfläche übrige Bildschirme | 100–160 h |
| Test mit echten Projekten, Nachbesserung, Abnahme | 80–140 h |
| **Summe** | **1.060–1.790 h** |
| **Dauer** | **4–7 Monate** (zwei Personen) |
| **Kosten extern** | **117.000–197.000 €** |
| Infrastruktur | 80–250 €/Monat |
| KI-API | s. 11.5 |
| Lizenzen | DIN EN 1116 ca. 83 €, DIN 18040-2 und weitere Normen 300–600 €; DWG-Konverter 0–2.000 €/Jahr |
| Wartung ab Abnahme | 8.000–20.000 €/Jahr **[Annahme: 5–10 % der Herstellkosten]** |

### 11.4 Szenario C — Professionelle SaaS-Plattform

Aufbauend auf B, zusätzlich:

| Posten | Aufwand |
|---|---|
| Echte Mandantenfähigkeit, Rollen, Mandantentrennung, Audit | 150–250 h |
| Raster- und Skizzenpfad (Zukauf anbinden, Qualitätsstufen, Nutzerführung) | 100–170 h |
| Weitere Küchenformen (U, Halbinsel, Insel) mit Solver-Erweiterung | 120–200 h |
| Mehrere Modulfamilien, Katalogabstraktion, Preispflege | 150–250 h |
| IDM-Anbindung, Bestelldatenaufbereitung, EANCOM | 200–400 h **(hochgradig unsicher, s. u.)** |
| IFC-Import und -Export | 100–180 h |
| 3D-Ansicht, optional Visualisierung | 120–220 h |
| Aufmaß-Modul mit Nachrechnung der Fertigungsmaße | 100–170 h |
| Barrierefreiheitsregelwerk | 60–100 h |
| Sonderwunsch-Delta und Nachtragsunterstützung | 80–140 h |
| Abrechnung, Onboarding, Self-Service, Support-Werkzeuge | 120–200 h |
| Betrieb, Überwachung, Sicherheit, Lastfähigkeit | 100–180 h |
| Dokumentation, Schulung, Vertriebsunterlagen | 80–150 h |
| **Summe zusätzlich** | **1.580–2.810 h** |
| **Gesamt (B + C)** | **2.640–4.600 h** |
| **Dauer gesamt** | **14–22 Monate** (zwei bis vier Personen) |
| **Kosten extern gesamt** | **290.000–506.000 €** |
| Infrastruktur im Betrieb | 300–1.200 €/Monat **[Annahme: 20–50 Kunden]** |
| Wartung und Weiterentwicklung | 60.000–120.000 €/Jahr **[Annahme: 0,5–1 VZÄ]** |

**[Einschätzung]** Die Position IDM-Anbindung ist die unsicherste der ganzen Tabelle. Sie kann bei 200 Stunden liegen, wenn ein Partner Daten und Testfälle liefert — oder sie ist für einen Dritten überhaupt nicht erreichbar, weil die Freigabe fehlt. Das ist eine Verhandlungs-, keine Entwicklungsfrage. Sie darf nicht in die Budgetplanung aufgenommen werden, ohne vorher geklärt zu sein.

### 11.5 KI-Kosten — und warum sie kein Kostentreiber sind

**[Einschätzung, auf belegten Listenpreisen gerechnet]** Bei der empfohlenen Architektur wird KI nur für Text und Semantik eingesetzt, nicht für Geometrie. Grobrechnung pro Wohnung: Schriftfeld, Legende, Layernamen, Raumstempel, plus gegebenenfalls ein Bildaufruf zur Plausibilitätsprüfung. Realistisch einige zehntausend Eingabe-Token und wenige Tausend Ausgabe-Token.

| | Haiku 5.5 | Sonnet 5.5 | Opus 5.5 |
|---|---|---|---|
| ca. 30.000 Eingabe- + 3.000 Ausgabe-Token | ~0,005 $ | ~0,09 $ | ~0,18 $ |
| 40 Wohnungen | ~0,20 $ | ~3,60 $ | ~7,20 $ |

Selbst bei großzügiger Auslegung und überwiegendem Einsatz des teuersten Modells bleiben die KI-Kosten pro Projekt im einstelligen Eurobereich. **Der Kostentreiber dieses Produkts ist nicht die KI — es sind die Entwicklungsstunden für Geometrie und Oberfläche sowie die menschliche Prüfzeit beim Nutzer.** Wer dieses Produkt als „KI-Kostenproblem" plant, plant am falschen Posten. Umgekehrt heißt das: Großzügiger KI-Einsatz zur Verbesserung der Erkennungsqualität ist wirtschaftlich unbedenklich — nur nicht für Geometrie, weil er dort nicht hilft (4.1.1).

### 11.6 Wesentliche Kostentreiber und technische Risiken

| Treiber | Wirkung | Gegenmaßnahme |
|---|---|---|
| **Vielfalt der Eingangsformate** | größter einzelner Treiber; jedes Architekturbüro zeichnet anders | Formate hart begrenzen; Layer-Zuordnung je Büro lernen und speichern; Rasterpfad auslagern |
| **Grundriss-Viewer und Korrektur-UX** | 120–200 h im MVP; unterschätzt man regelmäßig | früh prototypen, mit echten Nutzern, vor dem Generator |
| **Regelwerkspflege** | wächst mit jedem Hersteller und Sonderfall | Regeln als Daten, nicht als Code; Testfälle je Regel |
| **Katalog- und Preispflege** | laufend, nicht einmalig | eine Familie im MVP; Pflege vertraglich beim Lieferanten |
| **IDM-Zugang** | kann blockieren statt verzögern | vor Szenario C klären; nicht einplanen bis geklärt |
| **Haftung und Freigabeprozess** | kann Funktionsumfang erzwingen | Positionierung als Vorplanung von Anfang an, auch im Marketing |
| **Erkennungsqualität bei Öffnungen** | belegt schwach (4.1.1) | menschliches Tor als Produkt, nicht als Notausgang |

---

## 12. Wirtschaftlichkeit und Geschäftsmodell

### 12.1 Marktgröße

**[belegt]** In Deutschland wurden 2025 rund 206.600 Wohnungen fertiggestellt, der niedrigste Wert seit 2012 und 18,0 % oder 45.400 Wohnungen weniger als im Vorjahr. Auf neue Mehrfamilienhäuser entfielen 109.800 Wohnungen (Destatis, −18,9 %) bzw. 117.000 (BBSR, −18,7 %); die Abweichung erklären die Quellen nicht. Es ist das zweite Jahr in Folge mit deutlich weniger Fertigstellungen.

**[belegt]** Der Küchenmarkt selbst ist stabil: Die deutsche Küchenmöbelindustrie erzielte 2025 knapp 5,6 Mrd. € Umsatz (−0,3 bis −0,4 %); Endverbraucher gaben rund 13 Mrd. € für Küchenmöbel, Einbaugeräte und Zubehör aus, auf Vorjahresniveau, mit einem Wachstum von rund 16 % seit 2016. Der Möbel-Fachhandel hat 39,3 % Marktanteil, Online 7,2 %. Der Umsatz des Küchenfachhandels mit Küchenmöbeln stieg 2025 um 3,9 % bei leicht rückläufiger Menge.

**[Einschätzung]** Die adressierbare Menge: Von den rund 110.000 Wohnungen in neuen Mehrfamilienhäusern erhält nur ein Teil eine vom Entwickler beschaffte Einbauküche — bei Mietwohnungsbau und institutionellen Bauherren häufiger, bei Eigentumswohnungen oft Sache des Erwerbers. **[Annahme]** Bei 30 bis 50 % Anteil sind das 33.000 bis 55.000 Küchen pro Jahr im Neubau-Mehrfamilienbau. Das ist ein echter, aber kleiner Markt für ein Spezialwerkzeug — und er schrumpft gerade mit zweistelligen Raten. Der Bestandsmarkt (Mieterwechsel, Modernisierung) ist deutlich größer und konjunkturunabhängiger, braucht aber die Bestandsvariante aus 6.2.

**[Einschätzung]** Der schrumpfende Neubau ist ein ernstes Marktargument und ein ambivalentes: Er verkleinert den Markt und erhöht gleichzeitig den Kostendruck bei den verbliebenen Projekten, was Standardisierungswerkzeugen hilft.

### 12.2 ROI-Rechnung — ehrlich gerechnet

**Was *nicht* in die Rechnung gehört:** Die eingesparten Planungsstunden des Küchenstudios. Sie kosten den Entwickler heute nichts (2.1). Wer sie als Ersparnis bucht, rechnet sich das Produkt schön.

**[Annahme] Annahmenbasis**, jeweils kenntlich:
- Küchenwert je Einheit im Projektgeschäft: **2.500–5.000 €** — gestützt auf Angaben eines auf Projektentwickler ausgerichteten Anbieters (Leerblock ab 1.179 € bei 2,25 m, E-Geräte-Block ab 2.198 €, jeweils inkl. MwSt. und Lieferung, ohne ausgewiesene Montage) **[belegt]** sowie allgemeine Angaben zu günstigen Küchen ab 3.000 € **[belegt]**
- Projektleiterstunde intern: 65 €
- Koordinations- und Abstimmungsaufwand je Küche heute: 2–4 h
- Nacharbeitsquote bei spät festgelegten Installationspositionen: 5–15 % der Einheiten, je 400–1.500 € **[Annahme, nicht quellenbelegt — dies ist die unsicherste und gleichzeitig wichtigste Position der Rechnung und muss beim Kunden aus echten Projekten validiert werden]**
- Einkaufsvorteil durch Standardisierung: 5–12 % auf das Küchenvolumen **[Annahme]**

| | 20 Küchen/Jahr | 50 Küchen/Jahr | 100 Küchen/Jahr |
|---|---|---|---|
| Küchenvolumen (3.500 € Mittel) | 70.000 € | 175.000 € | 350.000 € |
| Koordination heute (3 h × 65 €) | 3.900 € | 9.750 € | 19.500 € |
| Koordination mit Werkzeug (−50 %) | −1.950 € | −4.875 € | −9.750 € |
| Nacharbeit heute (10 %, 800 € Mittel) | 1.600 € | 4.000 € | 8.000 € |
| Nacharbeit mit Werkzeug (−60 %) | −960 € | −2.400 € | −4.800 € |
| Einkaufsvorteil (8 %) | −5.600 € | −14.000 € | −28.000 € |
| **Nutzen pro Jahr** | **≈ 8.500 €** | **≈ 21.300 €** | **≈ 42.600 €** |
| Herstellkosten MVP (Mittel 157.000 €) amortisiert | 18,5 Jahre | 7,4 Jahre | 3,7 Jahre |

**[Einschätzung] Das ist das entscheidende Ergebnis dieses Kapitels, und es ist unbequem:** Für einen einzelnen Projektentwickler trägt sich die Eigenentwicklung erst ab etwa 100 Küchen pro Jahr — und selbst dort bei knapp vier Jahren Amortisation ohne Berücksichtigung von Wartung und Opportunitätskosten. Der Einkaufsvorteil ist dabei der größte Posten, und er ist der Posten, der sich auch **ohne Software** erreichen lässt, indem man einen erfahrenen Küchenplaner einmalig sechs Standardtypen definieren lässt.

Daraus folgen drei Konsequenzen:

1. **Die Rechnung geht nur auf, wenn das Werkzeug mehr tut als standardisieren.** Der Hebel liegt bei den Positionen, die sich nicht durch einen Workshop ersetzen lassen: der projektweite, frühe Installationsplan, die Was-wäre-wenn-Rechnung bei Budget- und Ausstattungsänderungen, und das Sonderwunsch-Delta.
2. **Die Rechnung geht beim Küchenlieferanten deutlich besser auf.** Er trägt Vorplanungskosten für verlorene Angebote. **[Annahme]** Bei 4 h Vorplanung je Angebot, 20 % Trefferquote und 50 € Stundenkosten kostet ein gewonnener Auftrag 1.000 € Vorplanung. Ein Werkzeug, das das auf eine Stunde senkt, spart 750 € je gewonnenem Auftrag — bei 50 Projektküchen pro Jahr sind das 37.500 €, und es erhöht zugleich die Zahl der Angebote, die er überhaupt abgeben kann. Das ist eine Rechnung, die ein Mittelständler versteht und unterschreibt.
3. **Finanzierung über mehrere Kunden ist nötig, um die Herstellkosten zu tragen** — also entweder SaaS oder eine Gemeinschaftsfinanzierung mehrerer Entwickler.

### 12.3 Internes Werkzeug oder SaaS?

**[Einschätzung]** Weder noch, in dieser Reihenfolge: **zuerst internes Werkzeug mit Produktarchitektur.**

Die Begründung: Die Nutzenseite (12.2) rechtfertigt für einen Kunden keine SaaS-Entwicklung, aber die Lernseite ist unersetzlich. Nur mit echten Projekten, echten Plänen und echten Lieferanten lässt sich herausfinden, welche der sieben Funktionen tatsächlich benutzt werden. Gleichzeitig muss von Anfang an sauber getrennt gebaut werden — Mandantenfähigkeit nicht implementieren, aber nicht ausschließen; Katalogdaten nicht hart verdrahten; Regelwerk als Daten.

Die SaaS-Entscheidung fällt nach drei abgeschlossenen Projekten anhand von drei Fragen:
1. Haben die Nutzer das Werkzeug ohne Aufforderung weiterbenutzt?
2. Hat mindestens ein Küchenlieferant unaufgefordert nach Zugang gefragt?
3. Ist die Aufwandsreduktion gemessen worden (Interaktionen, Durchlaufzeit, Nacharbeit) und hält sie der Prüfung stand?

Drei Ja: SaaS prüfen. Ein Nein: internes Werkzeug bleiben und pflegen. Zwei Nein: Weiterentwicklung einstellen und das Erreichte dokumentieren.

### 12.4 Preismodelle

**[Einschätzung]** Bewertung der in der Aufgabenstellung genannten Modelle:

| Modell | Bewertung |
|---|---|
| **Preis pro Bauprojekt** | **Bestes Modell.** Passt zur Nutzung (projektweise, nicht kontinuierlich), passt zur Kostenstelle (Projektbudget, nicht IT-Budget), skaliert mit dem Nutzen. Vorschlag: Grundpreis plus Betrag je Einheit, z. B. 1.500 € Projekt + 40–80 € je Küche. Bei 40 Einheiten also 3.100–4.700 €, gegen ein Küchenvolumen von 140.000 €. Das ist vertretbar. |
| **Preis pro geplanter Küche** | Gut, aber bestraft Standardisierung — der Nutzer will ja *weniger* Pläne. Signalfehler. |
| **Monatliches Abonnement** | Schlecht für Projektentwickler (unregelmäßige Nutzung), gut für Küchenlieferanten (kontinuierliche Angebotstätigkeit). |
| **Enterprise-Lizenz** | Sinnvoll erst für Wohnungsbaugesellschaften mit Bestandsgeschäft. |
| **Individuallösung für einen Kunden** | Der realistische Einstieg, aber kein Geschäftsmodell. Die Rechte- und Weiterverwertungsfrage muss im ersten Vertrag geklärt werden, sonst ist der SaaS-Weg später versperrt. |

### 12.5 Zielgruppenbewertung

| Zielgruppe | Zeitdruck | messbarer Kostenvorteil | Zahlungsbereitschaft | Gesamt |
|---|---|---|---|---|
| **Küchenlieferant im Objektgeschäft** | hoch | **hoch und direkt** | hoch | **beste Zielgruppe** |
| Wohnungsbaugesellschaft / Bestandshalter | mittel | hoch (Serie, Wiederholung) | mittel bis hoch | **zweitbeste** |
| Projektentwickler / Bauträger | hoch | mittel, indirekt | mittel | Auftraggeber, aber nicht der beste Markt |
| Generalunternehmer | hoch | niedrig (Küche selten im Vertrag) | niedrig | nein |
| Küchenhersteller | niedrig | niedrig (hat eigene Systeme) | niedrig, außer als Datenpartner | nein, aber **wichtig als Partner** |
| Küchenstudio Privatkundengeschäft | niedrig | niedrig | niedrig | nein |

**[Einschätzung]** Die wichtigste Erkenntnis dieser Tabelle: Der Auftraggeber dieser Studie ist der *Problemeigentümer*, aber nicht der *beste Kunde*. Die ideale Konstellation ist, das Werkzeug mit dem Entwickler zu bauen und an die Küchenlieferanten zu verkaufen, die für ihn und andere arbeiten. Der Entwickler bekommt sein Werkzeug und profitiert als Referenzkunde und möglicher Mitgesellschafter von der Verwertung.

---

## 13. Risiken und offene Fragen

### 13.1 Risiken, nach Schwere

| Risiko | Schwere | Eintrittswahrscheinlichkeit | Gegenmaßnahme |
|---|---|---|---|
| **Kein Lieferant bepreist maschinell erzeugte Mengengerüste** | **tödlich** | mittel | In Woche 1 des PoC klären, schriftlich. Abbruchkriterium. |
| **Fehlende Zahlungsbereitschaft beim Entwickler** (12.2) | **tödlich für SaaS** | hoch | Zielgruppe auf Küchenlieferanten verschieben; Preis pro Projekt |
| **Kein Zugang zu Katalog- und Bestelldaten** (IDM/OFML-Freigabe) | hoch | mittel bis hoch | Start mit einer Lieferantentabelle; IDM als Skalierungsthema |
| **Haftung bei Planungsfehlern** | hoch | mittel | Positionierung als Vorplanung; Aufmaßpflicht im Prozess; AGB; Herkunftsnachweis je Maß; Berufshaftpflicht prüfen |
| **Zu hoher manueller Korrekturaufwand** | hoch | mittel | Vektor-only im MVP; Typen statt Wohnungen bestätigen; Aufwand messen |
| **Ungenaue Maße aus PDF** | mittel | hoch | Maßstabsgegenrechnung; Toleranzführung; Aufmaß als Pflichtschritt |
| **Unvollständige Anschlussinformationen** | mittel | **sehr hoch** | Umkehrung: Installationsplan wird Ergebnis, nicht Eingabe (6.2) |
| **Keine offene API der Planungssysteme** | mittel | hoch | DXF plus Stückliste als Austauschweg |
| **Uneinheitliche Modul- und Schrankprogramme** | mittel | hoch | Katalogabstraktion; eine Familie im MVP |
| **Schrumpfender Neubaumarkt** (−18 % zwei Jahre in Folge, belegt) | mittel | **eingetreten** | Bestandsvariante für Wohnungsbaugesellschaften mitdenken |
| **Bereits vorhandene Lösungen schließen die Lücke** | mittel | mittel | Cyncly hat die Daten und die Kunden; wenn sie Batch bauen, ist der Vorsprung weg. Geschwindigkeit und Nische als Schutz. |
| **Vertraulichkeit von Bauunterlagen** | niedrig bis mittel | mittel | Mandantentrennung; Verschlüsselung; EU-Hosting; keine Weitergabe an KI-Anbieter zum Training; AVV; Löschkonzept |
| **Urheberrecht an Plänen und Produktkatalogen** | niedrig bis mittel | mittel | Bauherr darf eigene Pläne verarbeiten; Katalogdaten nur mit Lizenz; keine Weiterverbreitung von Katalogdaten durch das Werkzeug |
| Datenschutz (DSGVO) | niedrig | niedrig | Bauunterlagen sind in der Regel keine personenbezogenen Daten; Erwerberdaten bei Sonderwünschen schon — dann AVV und Zweckbindung |

### 13.2 Wo zwingend ein Mensch prüfen muss

**[Einschätzung]** Diese Liste ist nicht verhandelbar und sollte im Produkt technisch erzwungen sein:

1. **Maßstabsbestätigung.** Ein falscher Maßstab macht alles Folgende falsch und sieht dabei richtig aus.
2. **Türanschläge und Öffnungen.** Belegt die schwächste Erkennungsstelle (4.1.1).
3. **Brüstungs- und Deckenhöhen.** Nicht im Grundriss enthalten.
4. **Lage des Abwasserfallstrangs.** Der eigentliche Zwangspunkt, selten im Architektenplan.
5. **Welche Räume eine Küche erhalten.** Entscheidung, nicht Erkennung.
6. **Freigabe des Mengengerüsts.** Mit ausdrücklicher Benennung, was nicht freigegeben ist.
7. **Aufmaß vor Fertigungsfreigabe.** Physikalisch unersetzbar (4.1.5).
8. **Jede Abweichung von Regelkategorie 1** (öffentliches Recht, Technikregeln). Das System darf hier nicht abwägen.

### 13.3 Die entscheidenden offenen Fragen

Gesammelt, wie in der Aufgabenstellung gewünscht, statt die Untersuchung zu unterbrechen. Sortiert nach Entscheidungsrelevanz.

**An den Projektentwickler:**
1. Wie viele Küchen pro Jahr, und wie viele davon beschafft der Entwickler selbst (gegenüber: Erwerber kauft, oder Sonderwunsch)? Diese Zahl entscheidet nach 12.2 über die Wirtschaftlichkeit.
2. Gibt es in abgeschlossenen Projekten dokumentierte Fälle, in denen spät festgelegte Küchen-Installationspositionen Nacharbeit verursacht haben — mit Kosten? Das ist die unsicherste Position der ROI-Rechnung.
3. Liegen Plansätze als Vektor-PDF oder DXF vor, oder als Scan? Aus wie vielen verschiedenen Architekturbüros?
4. Existieren BIM-/IFC-Modelle?
5. Wer arbeitet heute mit den Küchenplanungen weiter — ein Studio, mehrere, ein Hersteller direkt? Namentlich?
6. Sind abgeschlossene Projekte mit ihren tatsächlich gebauten Küchenplanungen verfügbar? (Voraussetzung für die PoC-Messung Risiko 2 — die wichtigste Zahl des Vorhabens.)
7. Soll das Ergebnis dem Entwickler allein gehören, oder ist eine Verwertung an Dritte gewollt? (Muss im ersten Vertrag stehen.)

**An mindestens einen Küchenlieferanten:**
8. Nehmen Sie ein maschinell erzeugtes Mengengerüst plus DXF als Angebotsgrundlage an? Was fehlt Ihnen darin?
9. Welches Planungssystem nutzen Sie, und können Sie DXF oder eine Stückliste importieren?
10. Wie hoch ist Ihr Vorplanungsaufwand je Objektangebot, und wie ist Ihre Trefferquote? (Grundlage der Rechnung in 12.2, Punkt 2.)
11. Welche Modulfamilie würden Sie als Ausgangsbasis bereitstellen, mit Maßen und Projektpreisen?

**An Cyncly, CARAT, EasternGraphics:**
12. Existiert eine Planungs-API (nicht nur Warenwirtschafts-Integration), über die eine extern erzeugte Küchenplanung importiert werden kann? (Der Widerspruch aus 3.3 ist ungelöst.)
13. Welche Importformate akzeptiert Winner Flex bzw. CARAT für Raumgeometrie?

**An das DCC und an Hersteller (Nobilia, Häcker, Leicht):**
14. Unter welchen Bedingungen erhält ein Softwarehaus Zugang zum IDM-Format Küche/Bad und zu Herstellerdaten? Ist eine Mitgliedschaft oder Herstellerfreigabe erforderlich?
15. Ist der aktuelle Formatstand noch 2.8.0, oder gibt es eine neuere Fassung? (Belegt ist 2.8.0 zum 1.1.2022; ein Stand für 2026 wurde nicht gefunden.)
16. Enthalten die IDM-Daten Planungsgeometrie, oder nur kaufmännische und konfigurative Daten? (Entscheidend für den Eigenmodellierungsaufwand.)

**Normen, zu beschaffen und im Volltext zu prüfen:**
17. DIN EN 1116:2018-03 — die maßgebliche Küchennorm (ca. 83 €)
18. DIN 18040-2 — Barrierefreiheit, falls im Projekt gefordert
19. DIN 1946-6 — Lüftung, zur Abluftfrage
20. Die einschlägige VDE-Regel zu Schutzbereichen und Steckdosen in Küchen

---

## 14. Konkreter Umsetzungsfahrplan

### Phase 0 — Klären, bevor etwas gebaut wird (1–2 Wochen, ca. 3.000–6.000 €)

Keine Programmierung. Nur Antworten auf die Fragen 1 bis 11 aus 13.3, davon zwingend:
- Ein Gespräch mit einem Küchenlieferanten, Ergebnis schriftlich (Fragen 8–11)
- Plansätze aus drei Projekten sichten, Formate feststellen (Frage 3)
- Küchenzahl pro Jahr und Beschaffungsanteil ermitteln (Frage 1)
- Verfügbarkeit abgeschlossener Projekte mit gebauten Küchenplanungen prüfen (Frage 6)
- DIN EN 1116 beschaffen

**Tor:** Lieferant sagt grundsätzlich ja; mindestens 70 % Vektorpläne; mindestens drei abgeschlossene Projekte als Prüfgrundlage verfügbar. Sonst: Ende.

### Phase 1 — Proof of Concept (2–4 Wochen, 14.000–25.000 €)

Szenario A aus 11.2. Die drei Risikomessungen aus 9.1.

**Tor:** Planerübereinstimmung über 50 %, Nischenlängenfehler unter 20 mm, Lieferant bepreist die drei vorgelegten Mengengerüste. Sonst: Ende, mit dokumentiertem Ergebnis.

### Phase 2 — MVP für ein echtes Projekt (4–7 Monate, 117.000–197.000 €)

Szenario B aus 11.3. Begleitend ein laufendes Bauvorhaben des Entwicklers, von Anfang an, nicht als Test am Ende. Reihenfolge innerhalb der Phase:

1. Ingest und Raummodell produktiv (Monat 1–2)
2. **Grundriss-Viewer und Geometriekorrektur** (Monat 2–3) — vor dem Generator, weil hier das Nutzungsrisiko liegt
3. Generator und Regelwerk (Monat 3–4)
4. Projektschicht und Clustering (Monat 4–5)
5. Ausgabe, Installationsplan, Stückliste (Monat 5–6)
6. Einsatz im echten Projekt, Nachbesserung (Monat 6–7)

**Tor:** Die Qualitätskriterien aus 9.3 erreicht; das Projekt ist mit dem Werkzeug durchgeführt worden; die Nutzer haben es ohne Aufforderung weiterbenutzt.

### Phase 3 — Zwei weitere Projekte, dann Entscheidung (4–6 Monate, 20.000–50.000 € Pflege und Nachbesserung)

Keine neuen Großfunktionen. Zwei weitere Projekte, davon möglichst eines mit einem anderen Architekturbüro und eines mit einem anderen Küchenlieferanten. Messung der Kriterien aus 9.3 und der drei Fragen aus 12.3.

**Tor:** Die drei Fragen aus 12.3 mit Ja. Sonst: internes Werkzeug bleiben.

### Phase 4 — SaaS, nur bei bestandenem Tor (12–18 Monate, 290.000–506.000 € gesamt ab Phase 2)

Szenario C aus 11.4. Zielgruppe: Küchenlieferanten im Objektgeschäft als primär, Wohnungsbaugesellschaften als sekundär. Vorher geklärt: IDM-Zugang (Fragen 14–16) und die Verwertungsrechte aus dem ersten Vertrag (Frage 7).

### Zusammengefasste Investitionsstaffel

| Phase | Dauer | Kosten | Kumuliert | Abbruchmöglichkeit |
|---|---|---|---|---|
| 0 Klären | 1–2 Wochen | 3.000–6.000 € | 6.000 € | ja |
| 1 PoC | 2–4 Wochen | 14.000–25.000 € | 31.000 € | ja |
| 2 MVP | 4–7 Monate | 117.000–197.000 € | 228.000 € | teilweise |
| 3 Bewährung | 4–6 Monate | 20.000–50.000 € | 278.000 € | ja |
| 4 SaaS | 12–18 Monate | 173.000–309.000 € | 587.000 € | — |

Die Staffel ist bewusst so gebaut, dass 95 % der Gesamtinvestition erst nach drei bestandenen Toren fällig werden und die ersten 31.000 € die drei tödlichen Risiken ausräumen.

---

## 15. Abschließende Empfehlung

### Die fünf Fragen

**1. Ist die beschriebene Software mit heutiger Technologie realistisch umsetzbar?**

Teilweise, und nicht in der beschriebenen Form. Realistisch umsetzbar sind: deterministisches Auslesen von Vektorplänen, regelkonforme automatische Layoutgenerierung über Constraint-Solver, projektweites Variantenclustering, Mengengerüste, bemaßte 2D-Pläne, Installationspläne, DXF-Export. Nicht realistisch umsetzbar sind: verlässliche Erkennung aus Raster-PDFs und Handskizzen ohne hohen Korrekturaufwand (belegte Exact-Match-Genauigkeit von 0,39 bei Türen und 0,34 bei Fenstern bei den stärksten Modellen), vollständige Erfassung von Anschlusspositionen aus Architektengrundrissen, und eine direkte Bestellfähigkeit ohne Aufmaß vor Ort. Die Idee ist baubar, wenn man sie von „KI plant Küchen" auf „deterministisches Werkzeug mit KI-Unterstützung an den Textstellen und erzwungener menschlicher Freigabe" umstellt.

**2. Welche vorhandenen Produkte kommen der Idee am nächsten, und welche relevante Marktlücke bleibt?**

Am nächsten kommen drei Produkte aus drei Richtungen, keines deckt den Fall ab:
- **Winner Flex / CARAT** sind maßhaltig und bestellfähig, aber für eine Küche und einen Kunden gebaut, ohne Planimport und ohne Batch.
- **Design Flex / 2020 Design** hat KI-Layoutvorschläge und Kollisionsprüfung, aber der Planer gibt Raummaße ein — der Schritt vom Architekten-PDF zur Geometrie fehlt genau dort, wo er im Projektgeschäft gebraucht wird.
- **CubiCasa** und **RasterScan** lösen die Planerkennung als Dienst, haben aber kein Küchenwissen.
- **TestFit, Maket, Archistar** können Batch und Generierung, aber auf Gebäude- und Grundrissebene ohne Küchentiefe.

**Die Lücke: projektweite Standardisierung von Küchen mit maßhaltigem, bestellvorbereitendem Mengengerüst und frühem Installationsplan.** Sie ist real und unbesetzt. Sie ist aber schmal, weil der Katalogzugang reguliert ist und der Neubaumarkt in Deutschland zwei Jahre in Folge um rund 18 % geschrumpft ist.

**3. Wie würden wir eine solche Software technisch am sinnvollsten entwickeln?**

Sechs Schichten (5.1): deterministischer Vektor-Ingest (ezdxf, PyMuPDF, IfcOpenShell, Shapely) → KI nur für Text und Semantik (Claude Haiku 5.5 im Massenbetrieb, Opus 5.5 für Zweifelsfälle) → erzwungenes menschliches Tor auf Typenebene → regelbasierter Generator mit OR-Tools CP-SAT → Projektschicht mit Normalisierung, Spiegelung und Clustering → Ausgabe als bemaßter Plan, Installationsplan, Stückliste, DXF. Frontend Next.js mit eigenem 2D-Viewer, Rechenkern Python/FastAPI, Daten PostgreSQL/Supabase. Kein OpenCascade, kein eigenes CV-Training, kein 3D im MVP.

Die beiden Architekturentscheidungen, die den Unterschied machen: ein explizites, versioniertes Raummodell mit Herkunfts- und Konfidenzangabe je Attribut als Vertragsschnittstelle zwischen unsicherem und sicherem Teil — und ein Generator, der unbestätigte Maße technisch verweigert.

**4. Mit welchem realistischen finanziellen und zeitlichen Aufwand müssten wir rechnen?**

| | Aufwand | Dauer | Kosten (110 €/h) |
|---|---|---|---|
| Klärungsphase | — | 1–2 Wochen | 3.000–6.000 € |
| Proof of Concept | 130–230 h | 2–4 Wochen | 14.000–25.000 € |
| Nutzbarer MVP | 1.060–1.790 h | 4–7 Monate | 117.000–197.000 € |
| SaaS-Plattform (gesamt) | 2.640–4.600 h | 14–22 Monate | 290.000–506.000 € |

Laufend: Infrastruktur 80–250 €/Monat (MVP) bis 300–1.200 €/Monat (SaaS); KI-API unter 10 € je Projekt mit 40 Einheiten und damit kein Kostenfaktor; Normen 400–700 € einmalig; Wartung 8.000–20.000 €/Jahr (MVP) bis 60.000–120.000 €/Jahr (SaaS).

Die Amortisation für einen einzelnen Entwickler liegt bei 20 Küchen/Jahr bei etwa 18 Jahren, bei 50 bei etwa 7 Jahren und bei 100 bei etwa 4 Jahren — alle drei unattraktiv für eine Alleinfinanzierung des MVP.

**5. Entwickeln, integrieren oder nicht weiterverfolgen?**

**Entwickeln — aber in einem anderen Zuschnitt, für eine andere Zielgruppe und mit einem Abbruchtor nach 31.000 €.**

Nicht weiterverfolgen wäre falsch, weil die Marktlücke belegt unbesetzt ist, der technische Kern mit vorhandenen Werkzeugen beherrschbar ist, und der Auftraggeber über etwas verfügt, das kein Wettbewerber hat: echte Pläne, echte Projekte und abgeschlossene Vorhaben, an denen sich die Qualität des Generators messen lässt.

Integrieren allein wäre ebenfalls falsch, weil keines der vorhandenen Produkte die Batch-Dimension hat und weil keine offene Planungs-API belegt ist. Integration ist die richtige Antwort nur an den Rändern: Raster-Erkennung einkaufen, Katalogdaten anbinden, DXF in die bestehende CAD-Welt exportieren.

Die beschriebene Wunschlösung zu bauen wäre am teuersten falsch. Sie würde die Hauptinvestition in die Raster- und Skizzenerkennung legen (belegt die schwächste Stelle), in Visualisierung (ohne Kernnutzen) und in eine Vollautomatik (nicht haftungsfähig) — und dabei die drei Dinge auslassen, in denen der Wert liegt: Clustering, Installationsplan und Sonderwunsch-Delta.

**Die Empfehlung in ihrer Reihenfolge:**

1. **Zuerst reden, nicht programmieren.** Ein Küchenlieferant muss schriftlich sagen, dass er ein maschinell erzeugtes Mengengerüst bepreist. Kosten: ein Gespräch. Wenn nein, ist das Vorhaben hier beendet, und zwar für 6.000 € statt für 200.000 €.
2. **Dann die eine Zahl messen, die niemand sonst messen kann:** Reproduziert der Generator die Küchen, die in abgeschlossenen Projekten tatsächlich gebaut wurden? Unter 50 %: Ende.
3. **Dann einen MVP mit vier Funktionen bauen** — Vektor-Ingest, Typen-Clustering, Installationsplan, Mengengerüst — und ihn in einem laufenden Projekt einsetzen, nicht in einer Demo.
4. **Die Zielgruppe von Anfang an weiter denken.** Der Projektentwickler ist der Problemeigentümer, der Küchenlieferant im Objektgeschäft ist der zahlungsfähigere Kunde, die Wohnungsbaugesellschaft der größere und konjunkturfestere Markt. Die Verwertungsrechte gehören in den ersten Vertrag, nicht in die zweite Verhandlung.
5. **Die Produktwahrheit nie verlassen:** Aus einem Plan kommt eine Spezifikation, aus einem Aufmaß kommt eine Bestellung. Wer das Gegenteil verspricht, verkauft ein Haftungsrisiko.

---

## Quellen

**Benchmarks und Forschung zur Grundrisserkennung**
- [AECV-Bench: Benchmarking Multimodal Models on Architectural and Engineering Drawing Understanding (arXiv 2601.04819, 05.01.2026)](https://arxiv.org/pdf/2601.04819) — Volltext ausgewertet, Tabellen 1 und 2
- [Multi-Unit Floor Plan Recognition and Reconstruction (arXiv 2408.01526)](https://arxiv.org/html/2408.01526v1)
- [Offset-Guided Attention Network for Room-Level Aware Floor Plan Segmentation (arXiv 2210.17411)](https://arxiv.org/pdf/2210.17411)
- [Deep Floor Plan Recognition Using a Multi-Task Network (arXiv 1908.11025)](https://arxiv.org/pdf/1908.11025)
- [Residential Floor Plan Recognition and Reconstruction (CVPR 2021)](https://openaccess.thecvf.com/content/CVPR2021/papers/Lv_Residential_Floor_Plan_Recognition_and_Reconstruction_CVPR_2021_paper.pdf)
- [A Comprehensive Survey of Floor Plan Recognition (ACM)](https://dl.acm.org/doi/10.1145/3747227.3747250)

**Layoutgenerierung und Optimierung**
- [Co-Layout: LLM-driven Co-optimization for Interior Layout (arXiv 2511.12474)](https://arxiv.org/html/2511.12474)
- [Automatic Generation of Constrained Furniture Layouts (arXiv 1711.10939)](https://arxiv.org/abs/1711.10939)
- [CVAE-LAYOUT: automatic furniture layout with constraints (Springer)](https://link.springer.com/article/10.1007/s00371-023-03204-2)
- [Architect-Ant: Editable Automatic Furnishing of Architectural Floor Plans (arXiv 2606.10953)](https://arxiv.org/html/2606.10953)
- [OR-Tools CP-SAT, MiniZinc Challenge 2026](https://www.minizinc.org/challenge/2026/description_or-tools_cp-sat.txt)
- [IfcOpenShell (PyPI)](https://pypi.org/project/ifcopenshell/0.7.0.230217)

**Normen und Planungsregeln**
- [DIN EN 1116:2018-03 — Koordinationsmaße für Küchenmöbel und Küchengeräte (DIN Media)](https://www.dinmedia.de/de/norm/din-en-1116/275325871)
- [DIN 68935:2009-10 — Koordinationsmaße für Badmöbel, Geräte und Sanitärobjekte (DIN Media)](https://www.dinmedia.de/en/standard/din-68935/119396417)
- [AMK-Küchenstandards (PDF, Volltext ausgewertet)](https://www.amk.de/wp-content/uploads/2018/04/AMK-Kuechenstandards.pdf)
- [AMK Ratgeber Küche: Planen und Gestalten](https://www.amk-ratgeber-kueche.de/kueche/planen-gestalten)
- [nullbarriere.de: Barrierefrei Planen und Bauen — Detail Küche](https://nullbarriere.de/kuechendetail.htm)
- [bfb-barrierefrei-bauen.de: Planung einer barrierefreien Küche](https://www.bfb-barrierefrei-bauen.de/planung-einer-barrierefreien-kueche)
- [kuechen-fachwelt.de: Mindestabstand zwischen Küchenzeilen](https://kuechen-fachwelt.de/kuechenplanung-gestaltung/mindestabstand-zwischen-kuechenzeilen/)

**Katalog-, Bestell- und Datenformate**
- [DCC: Integriertes Datenmodell für planungsintensive Möbel — Struktur und Satzarten (PDF)](https://dcc-moebel.org/fileadmin/download/catatweb/KUECHE/1.7/IDM17_Subversion3_Teil1_Satzarten_2010-11-19.pdf)
- [DCC: Elektronischer Bestelldatenaustausch planungsintensiver Möbel, EANCOM (PDF)](https://www.dcc-moebel.org/fileadmin/download/catatweb/Bestellabwicklung/Kueche/EANCOM-ORDRSP_V152_neu.pdf)
- [DCC Stammdatenserver cat@web — FAQ](https://www.catatweb.de/index.php?id=12)
- [moebelkultur.de: Neue Versionen für Bestellabwicklung und Datenformat bestätigt (IDM Küche/Bad 2.8.0)](https://www.moebelkultur.de/news/neue-versionen-fuer-bestellabwicklung-und-datenformat-bestaetigt/)
- [MÖBELMARKT: Daten Competence Center — Neues Datenformat für Küche/Bad](https://www.moebelmarkt.de/beitrag/daten-competence-center-e-v-neues-datenformat-fuer-kueche-bad-am-start)
- [Sepia: Austauschformate für Produktdaten (IDM, EDIFURN)](https://www.sepia.de/austauschformate-produktdaten)
- [OFML (englische Wikipedia)](https://en.wikipedia.org/wiki/OFML)
- [iba.online: Willkommen in der OFML-Welt](https://iba.online/knowledge/raeume-planen/ofml/ofml-ueberblick)
- [wegscheider-os.de: OFML-Daten, Erstellung und Verteilung](https://www.wegscheider-os.de/produkte/ofml/ofml-daten)
- [cp.de: pCon.planner und OFML-Planungsdaten, Herstellerfreischaltung](https://www.cp.de/service/planung-beratung/pcon-planner-ofml-planungsdaten/)
- [EasternGraphics: neutraler Großküchenkatalog im pCon.planner](https://www.easterngraphics.com/pcon/de/2025/02/14/der-neue-neutrale-grosskuechenkatalog-im-pcon-planner-jetzt-verfuegbar/)

**Wettbewerber und Werkzeuge**
- [Cyncly: Winner Flex Capabilities](https://www.cyncly.com/products/winner-flex/capabilities)
- [kbbreview: 2020 Fusion to be phased out](https://www.kbbreview.com/52771/news/2020-fusion-to-be-phased-out/)
- [Cyncly: Design Flex](https://www.cyncly.com/en/products/design-flex/)
- [2020kitchendesign.com: AI in 2020 Design Software (unabhängiger Betreiber)](https://www.2020kitchendesign.com/ai-in-2020-design-software-2025/)
- [kitchen-finder.com: Why Winner By Cyncly Became The Standard Software In German Kitchen Retail](https://www.kitchen-finder.com/post/insights-winner-by-cyncly-german-kitchen-retail)
- [Cyncly: Kitchen Mania Case Study (open API integration)](https://www.cyncly.com/en/products/winner-flex/case-studies/kitchen-mania/)
- [CARAT: Produkte und Preise](https://www.carat.de/produkte)
- [Capterra: Winner Flex (Preis auf Anfrage)](https://www.capterra.com/p/265753/Winner-Flex/)
- [CubiCasa: APIs for Software Developers](https://www.cubi.casa/developers/)
- [CubiCasa: Floor plan technical specifications](https://www.cubi.casa/resources/specs/floor-plan-technical-specification/)
- [RasterScan: Efficient Floor Plan Recognition (Cloud und On-Prem)](https://www.rasterscan.com/)
- [RasterScan: Floor-Plan-Recognition (GitHub, On-Premise)](https://github.com/RasterScan/Floor-Plan-Recognition)
- [roomagen.com: Floor Plan APIs Compared (2026)](https://roomagen.com/blog/floor-plan-apis-compared-2026)
- [Roomle: Rubens Dokumentation](https://docs.roomle.com/rubens)
- [Roomle: E-Commerce Integration](https://www.roomle.com/en/documentation/eCommerce-integration)
- [Planner 5D: Smart Wizard](https://planner5d.com/smart-wizard)
- [Planner 5D: AI Furniture Placement](https://planner5d.com/use/ai-furniture-placement)
- [Planner 5D: AI Floor Plan Generator](https://planner5d.com/use/ai-floor-plan-generator)
- [pCon.planner: Kataloge (Hilfe)](http://help.pcon-planner.com/de/help/kataloge.htm)
- [learnarchitecture.net: 7 AI Floor Plan Tools (Maket, ARCHITEChTURES, TestFit)](https://learnarchitecture.net/artificial-intelligence/32919-ai-floor-plan-tools.html)
- [myarchitectai.com: AI Tools for Architects & Interior Designers 2026](https://www.myarchitectai.com/blog/ai-tools-for-architects-and-interior-designers)
- [WUNDER Kitchen: KI-Küchenplaner](https://wunder.kitchen/planer/)
- [zimmergestalten.de: Küche mit KI planen — Grenzen](https://www.zimmergestalten.de/blog/kueche-mit-ki-planen)

**Markt, Prozess und Kosten**
- [Destatis: 18,0 % weniger fertiggestellte Wohnungen im Jahr 2025 (PM 174, 22.05.2026)](https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/05/PD26_174_31121.html)
- [BBSR: Baufertigstellungen und Bauüberhänge im Jahr 2025](https://www.bbsr.bund.de/BBSR/DE/forschung/fachbeitraege/wohnen-immobilien/bautaetigkeit/wohnungsbaufertigstellungen/wohnungsbaufertigstellungen.html)
- [moebelkultur.de: VdDK-Jahresbilanz 2025 Küchenmöbelindustrie](https://www.moebelkultur.de/news/vddk-im-dezember-gings-rauf-im-gesamtjahr-leicht-runter-jahresbilanz-kuechenmoebelindustrie-2025/)
- [IFH Köln: Küchenmarkt stabilisiert sich 2025](https://www.ifhkoeln.de/kuechenmarkt-stabilisiert-sich-2025-fachhandel-bleibt-tragende-saeule/)
- [infoboard.de: AMK/NIQ GfK — Küchenfachhandel 2025](https://www.infoboard.de/amk-kuechenfachhandel-baut-position-bei-einbau-und-hausgeraeten-weiter-aus/)
- [olina: Küchenplanung in 10 Schritten](https://www.olina.com/news/detail/kuechenplanung-in-10-schritten-so-laeuft-alles-ab)
- [OBI: Küchenplaner — Planungstermin](https://www.obi.de/beratung-und-planung/kuechenplaner)
- [kuechen-fachwelt.de: Küche zuhause planen lassen (Aufmaßdauer)](https://kuechen-fachwelt.de/kuechenplanung-gestaltung/kueche-zuhause-planen-lassen/)
- [Schrank-Express: Küchen für Hausverwaltungen und Bauträger (Standardisierung innerhalb einer Charge)](https://www.schrank-express.de/b2b/hausverwaltungen-bautraeger)
- [VermieterKüchen (Projektpreise)](https://xn--vermieterkchen-psb.de/)
- [kitchen-concept.de: Küchen für Bauträger](https://kitchen-concept.de/kuechen-bautraeger/)
- [Grimm Küchen: Gewerbekunden (Genossenschaftsprojekt, Direktlieferung)](https://grimm-kuechen.de/service/gewerbekunden)
- [montageservice-berlin.com: Objektküchen (über 300 Küchen in 8 Wochen)](https://montageservice-berlin.com/objektkuechen/)
- [kuechen-fachwelt.de: Was kostet eine Küche](https://kuechen-fachwelt.de/kuechenplanung-gestaltung/was-kostet-eine-kueche/)
- [myinvest-pro.de: Sonderwunsch-Management Bauträger](https://www.myinvest-pro.de/blog/sonderwunsch-management-bautraeger)
- [anwalt.de: Bauträger sind verpflichtet, Sonderwünsche zu koordinieren](https://www.anwalt.de/rechtstipps/bautraeger-aufgepasst-bautraeger-sind-verpflichtet-die-sonderwuensche-des-erwerbers-zu-koordinieren_153913.html)
- [kanzlei-herfurtner.de: Bauträgervertrag, Sonderwunsch und Vergütung](https://kanzlei-herfurtner.de/bautraegervertrag-sonderwunsch-vergutung/)
- [freelancermap: IT-Freelancer Stundensatz 2026](https://www.freelancermap.de/blog/stundensatz-it-freelancer/)
- [wolf-tech.io: Stundensätze freiberuflicher Softwareentwickler 2026](https://wolf-tech.io/de/blog/stundensatz-freiberufler-softwareentwickler-deutschland-2026)
- [TalentUp: Deutschland Contractor-Tagessätze Benchmark 2026](https://talentup.io/insights/de/contractors-benchmark-report/germany/)

**KI-Preise**
- Claude-Modellpreise (Stand Oktober 2026): Haiku 5.5 0,10/0,50 $, Sonnet 5.5 2/10 $, Opus 5.5 4/20 $ pro Mio. Token — aus der im Projekt verfügbaren Anthropic-API-Referenz

---

*Erstellt am 22. Oktober 2026. Keine Programmierung, kein Projekt-Setup — Rechercheergebnis und Entscheidungsvorlage.*
