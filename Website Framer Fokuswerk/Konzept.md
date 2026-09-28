# Fokuswerk Relaunch — Konzept

Stand 27.09.2026. Grundlage: der Relaunch-Prompt, die Analyse von fokuswerk.de und neun
Referenzseiten. Gebaut wird im bestehenden Framer-Projekt „FW neu".

## 1. Positionierung

**Vorher:** „Agentur für Social Media, Content & visuelles Branding". Claim: „Marketing, das
Umsatz bringt." Leistungen: Content Creation, Social Management, Paid Media.

**Nachher:** Fokuswerk baut digitale Systeme zur Kundengewinnung. Website, Werbung, Content
und Daten sind keine Einzelmaßnahmen, sondern ein zusammenhängendes System.

Reihenfolge der Leistungen kehrt sich um:
1. Performance Marketing
2. Websites & digitale Systeme
3. Content & Brand

**Claim:** Sichtbarkeit ist kein Zufall. Sie ist ein *System*.
(„System" in Source Serif 4 Italic — der eine editorial-Akzent.)

## 2. Designsystem

**Farbe.** Kein Creme mehr. Grund ist ein warmes Off-White; die Ankerabschnitte (Auftakt,
Leistungswähler, Abschluss) stehen auf Tinte. Signalfarbe ist das Orange aus der Wortmarke.

| Token | Wert | Rolle |
|---|---|---|
| Tinte | `#0E0F12` | dunkle Flächen, Schrift auf Hell |
| Papier | `#F5F3EF` | Grundfläche der Seite |
| Papier Rein | `#FFFFFF` | Medien, Karten auf Papier |
| Signal | `#FF5A1F` | Akzent: Ziffern, Linien, Hover, ein CTA |
| Signal Tief | `#D9440F` | Hover auf Signal |
| Tinte 60/40/16/08 | Abstufungen | Fließtext, Labels, Haarlinien |
| Papier 64/40/16/08 | Abstufungen | Text und Linien auf Tinte |

**Typografie.** Inter für alles Funktionale, Source Serif 4 Italic ausschließlich für einzelne
Akzentwörter in großen Überschriften. Regel: **höchstens ein Serifenwort pro Überschrift.**

| Stil | Desktop / Tablet / Handy | Einsatz |
|---|---|---|
| Display XL | 120 / 72 / 42 px | nur Auftakt |
| Display | 84 / 56 / 36 px | Abschluss-CTA |
| Titel | 56 / 42 / 30 px | Abschnittsüberschriften (h2) |
| Titel S | 30 / 26 / 23 px | h3 |
| Titel XS | 21 / 19 / 18 px | h4, Kartentitel |
| Fließtext Groß | 22 / 20 / 18 px | Vorlauf |
| Fließtext | 18 / 17 / 16 px | Standard |
| Marke | 12 / 11 px, Versalien, +0.12 em | Labels |
| Kennzahl | 72 / 56 / 44 px | Zahlen, Tabularziffern |
| Zitat | 34 / 28 / 23 px, Serif Italic | Kundenstimmen |

Laufweite durchgehend eng (−0.045 bis −0.06 em), Gewicht 500 — die Metrik der alten Seite,
die nachweislich gefällt.

**Raster.** Inhaltsbreite 1240 px, Außenabstand 32 / 28 / 20 px. Abstände nur aus der Skala
8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160.

**Flächen.** Keine Rahmen, keine Karte in der Karte. Medien mit 20 px Radius, Flächen
randlos. Knöpfe rechteckig mit 4 px — keine Pillen.

## 3. Motion-System

| Ebene | Dauer | Kurve | Einsatz |
|---|---|---|---|
| Micro | 200 ms | `0.22,1,0.36,1` | Knöpfe, Links, Hover |
| Interface | 420 ms | `0.22,1,0.36,1` | Karten, Navigation, Tabs |
| Editorial | 900 ms | `0.16,1,0.3,1` | Überschriften, Bildeinblendungen |
| Cinematic | scrollgebunden | — | Auftakt, Ebenenwechsel |

Regeln: keine Bewegung ohne Zweck, kein Scroll-Hijacking, Einblendungen laufen genau einmal
(`replay=false`), Hover-Effekte bekommen auf Touch eine sichtbare Entsprechung.

## 4. Referenzen — was übernommen wird

| Referenz | Übernommenes Prinzip |
|---|---|
| Bauwerk Hamburg | Navigation als eigener Designmoment: ruhiges Overlay, große Typo, gestaffelt |
| Spector | Dunkler Auftakt, übergroße Display-Typo, waagerechtes Bildband, Signalfarbe sparsam |
| Norell | Bild-Hover: Ausschnitt wandert, Zusatzinfo erscheint, alles subtil |
| Agero | Kleines Label über großer Überschrift, viel Luft, Geisterwort hinter der Sektion |
| Homy | Leistungswähler: aktives Feld breit mit Bild, inaktive schmal mit großer Ziffer |
| Vidaro | Ein großer, ruhiger Abschluss-Block mit genau einer Aussage und einem Knopf |
| Norda | Ebenen bewegen sich leicht gegeneinander — Tiefe statt Effekt |
| Bungee | Atmosphärische Unschärfe am unteren Rand, sehr dezent |
| Skala | Abstandsdisziplin und Bildregie |

**Grundsatz:** Keine Referenz darf wiedererkennbar sein. Am Ende steht ein eigenes System.

## 5. Informationsarchitektur

```
/                             Startseite
/leistungen/performance-marketing
/leistungen/websites
/leistungen/content
/arbeiten                     Übersicht
/arbeiten/:case               Detailseiten aus dem CMS
/agentur
/kontakt
/impressum  /agb  /datenschutz
```

Navigation: Leistungen · Arbeiten · Agentur · Kontakt. CTA: **Projekt besprechen.**

## 6. Aufbau der Startseite

| # | Abschnitt | Zweck in der Journey |
|---|---|---|
| 01 | Auftakt, dunkel, mit Knotenfeld | Aufmerksamkeit + Positionierung in einem Satz |
| 02 | Kunden | Relevanz und erster Beweis |
| 03 | Das System | Verständnis: warum Einzelmaßnahmen nicht reichen |
| 04 | Leistungen (Wähler) | Kompetenz, Gewichtung Performance > Web > Content |
| 05 | Arbeiten | Beweis an echten Projekten |
| 06 | Vorgehen | Nachvollziehbarkeit, Consulting-Charakter |
| 07 | Zahlen | messbare Ergebnisse, alle belegt |
| 08 | Stimme | Social Proof |
| 09 | Agentur & Standort | Vertrauen, regionale Verankerung ohne Kleinmachen |
| 10 | Fragen | Einwandbehandlung |
| 11 | Abschluss | Conversion |
| 12 | Fußzeile | editorial, großzügig |

## 7. Was belegt ist und was nicht

Belegt und verwendbar: acht Kundenlogos, das Haubner-Zitat, die Case-Zahlen aus
`Case-Studies.md`, die acht gebauten Websites aus `Bestand.md`, Team und Standort aus
`Seitentexte.md`.

**Nicht erfunden wird:** Awards, Kundenzahlen, Bewertungen, Umsätze, Mitarbeiterzahlen.
