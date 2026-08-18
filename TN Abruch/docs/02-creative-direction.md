# TN Abbruch — Creative Direction

## Die Designidee: **Aufmaß**

Die gesamte Sprache dieses Unternehmens ist Volumen. Die Referenzliste ist keine
Erzählung, sie ist eine Tabelle: 62.500 cbm. 21.000 cbm. 2.000 qm. 800 cbm. Ein Angebot
im Rückbau ist ein Leistungsverzeichnis mit Positionsnummern. Eine Freimessung ist ein
Protokoll. Eine Zulassung ist eine Ziffer in einer Anlage.

**Die Website ist als technisches Dokument gebaut.** Nicht als Broschüre.

Konkret heißt das: sichtbares Raster, Positionsnummern wie im LV (`01 —`, `02 —`),
Haarlinien statt Karten, tabellarische Ziffern in Monospace, Maßlinien statt
Dekor-Icons, Registermarken an den Seitenrändern. Autorität durch Präzision, nicht durch
Effekt.

Der Kontrapunkt dazu: **Masse.** Große, dunkle, körnige Bildflächen. Beton, Staub,
Stahl. Die technische Präzision liegt wie ein Messraster über etwas Schwerem.

**Warum das nur zu TN Abbruch passt:** Ein Malerbetrieb hat keine Kubikmeterzahlen. Ein
Generalunternehmer führt keine TRGS-Ziffern. Diese Gestaltung entsteht direkt aus dem
Inhalt — tauscht man das Logo, bricht sie zusammen, weil die Zahlen fehlen.

---

## Farbwelt

Abgeleitet aus zwei realen Quellen: dem Firmenlogo und dem Schwarzbereich.

Das Logo ist ein kräftiges Ultramarin — gemessen **#233B91**. Das ist ein Glücksfall,
denn die gesamte Branche arbeitet mit Orange, Gelb und Rot. Blau ist hier
unterscheidungsstark und trägt gleichzeitig die richtige Bedeutung: Regelwerk, Schutz,
Kontrolle. Es ist außerdem die Farbe der Abschottungsfolie.

| Rolle | Wert | Verwendung |
|---|---|---|
| `--ink` | `#0B0C0E` | Grundfläche dunkel, Typo auf hell |
| `--dust` | `#EDEAE4` | Grundfläche hell — Betonstaub, nicht Weiß |
| `--signal` | `#2B4BC4` | Marke. Links, aktive Zustände, Akzentflächen |
| `--signal-lift` | `#5B7BF0` | Signal auf dunklem Grund (Kontrast ≥ 4.5:1) |
| `--steel` | `#6E7178` | Sekundärtext |
| `--hairline` | `rgba(…, .18)` | Alle Linien. Es gibt keine Schatten. |
| `--warn` | `#D8442A` | **Ausschließlich funktional** — Schadstoffkennzeichnung, Fehler |

Grundmodus ist hell (`--dust`), Sektionen mit Bildmasse und der Schadstoffbereich
schalten auf dunkel. Der Wechsel ist bewusst hart — wie der Übergang vom Weiß- in den
Schwarzbereich.

**Kein Gradient. Kein Glow. Kein Schatten. Border-Radius global 0.** Beton hat keine
Rundungen.

---

## Typografie

| Rolle | Schrift | Warum |
|---|---|---|
| Display | **Archivo** (Variable, Width-Achse) | Amerikanische Grotesk mit industrieller Kante. Über die Width-Achse lassen sich Headlines auf die Spaltenbreite ziehen — das erzeugt die Blocksatz-Wucht eines Deckblatts. |
| Fließtext | **IBM Plex Sans** | Ingenieurschrift. Ruhig, exzellente deutsche Diakritika, hat Charakter ohne sich vorzudrängen. |
| Daten | **IBM Plex Mono** | Tabellenziffern für cbm/qm/Jahre/Positionsnummern. Trägt die Aufmaß-Idee. |

Bewusst nicht: Inter, Poppins, Manrope, Lexend, Montserrat — der Default-Look, den die
Anti-KI-Regel ausschließt. Ebenso nicht Oswald/Bebas: das Bau-Klischee.

Alle Schriften **selbst gehostet** (WOFF2, Subset latin) — kein Google-Fonts-CDN, damit
DSGVO-konform und ohne Drittanfragen.

Skala fluid via `clamp()`, Basis 17px, Zeilenhöhe 1.6 im Fließtext, 0.95 bei
Display-Größen. Headlines in `text-wrap: balance`.

---

## Layoutsystem

- **12-Spalten-Raster**, Gutter 24px, Außenrand 24px mobil / 48px ab 1024px.
- **Sichtbare Konstruktion:** vertikale Haarlinien am Contentrand laufen durch die ganze
  Seite. Sections sind oben durch eine Linie plus Positionsnummer und Kurzlabel in Mono
  markiert — wie Registerkarten in einem Ordner.
- **Asymmetrie ist Regel, nicht Ausnahme.** Fließtext läuft nie über die volle Breite;
  Marginalspalten tragen Daten, Fußnoten, Nachweise.
- Kein Section-Rhythmus vom Typ „Bild links / Text rechts / Bild rechts". Jede Sektion
  hat eine eigene Bauform, abgeleitet aus ihrem Inhaltstyp.

---

## Bildsprache

**Rangfolge, verbindlich:**

1. **Echte TN-Fotos** — haben immer Vorrang. Vorhanden: Fuhrpark-Panorama mit Team
   (2020) und Schadstoffsanierung KMF mit Vollschutz. Beide werden nicht „schöner"
   gemacht, sondern art-directed: harte Beschnitte, leicht entsättigt, Korn, hoher
   Kontrast. Die Authentizität ist der Wert.
2. **Grafik statt Foto**, wo kein Foto existiert. Datenblöcke, Maßdiagramme, Zeitleiste,
   Schleusenschema — gezeichnet als SVG in der Dokumentsprache. Das ist hier die
   *bessere* Lösung, nicht der Notnagel: ein Unterdruck-Schleusenschema erklärt mehr als
   jedes Stimmungsbild.
3. **KI-Materialstudien** ausschließlich als abstrakte Textur- und Übergangsflächen.

### Art Direction für KI-Assets (verbindlich)

Damit sie wie eine Kampagne wirken und nicht wie Einzelbilder, gilt für **jedes**
generierte Bild derselbe Rahmen:

> Makro oder extremes Detail · Material im Vordergrund, kein Motiv im Hintergrund ·
> kühles hartes Tageslicht mit Staub in der Luft · nahezu entsättigt, dokumentarisch ·
> sichtbares Filmkorn · **keine Menschen, keine Maschinen, keine Marken, kein Text,
> keine erkennbare Baustelle**

**Harte Regel:** Ein KI-Bild wird niemals einem Referenzprojekt zugeordnet, nie mit
Ortsangabe versehen und nie in der Nähe der Referenzliste platziert. Es trägt im
Dateinamen `material-` und im `alt`-Text eine Materialbeschreibung, keine Projektaussage.

Die vollständige Prompt-Serie liegt in `docs/03-art-direction-prompts.md`.

---

## Motion Language

Prinzip: **Masse.** Schwere Dinge setzen sich langsam in Bewegung und kommen hart zum
Stehen. Nichts federt, nichts wippt, nichts schwebt.

| Element | Verhalten |
|---|---|
| Einlauf beim Scrollen | 18px von unten, 520 ms, `cubic-bezier(.16,1,.3,1)` — langer Auslauf, harter Stopp |
| Gestaffelte Listen | 45 ms Versatz, maximal 6 Elemente, dann gleichzeitig |
| Kennzahlen | Zählen einmal hoch, wenn sie ins Bild kommen. Nur ganze Zahlen, keine Nachkommastellen. |
| Referenz-Zeitleiste | Jahreszahl links läuft beim Scrollen synchron mit — die einzige aufwendige Bewegung der Seite, weil sie Inhalt transportiert: 28 Jahre Auftragshistorie |
| Hover | 140 ms, nur Farbe und Linienstärke. Keine Transformation, keine Skalierung. |
| Hero | Sehr langsamer Scale (1.0 → 1.06 über die volle Scrollhöhe), sonst nichts |

`prefers-reduced-motion: reduce` schaltet **alles** ab — Einläufe werden zu
Sofort-Sichtbarkeit, Zähler zeigen den Endwert, Parallax steht still.

Die Seite muss ohne jede Animation vollständig funktionieren und gut aussehen. Das ist
die Prüfbedingung, nicht der Notfallplan.

---

## Interaction Design

- **Fokus ist sichtbar und gestaltet:** 2px `--signal` Outline mit 2px Offset, nie entfernt.
- **Touch-Ziele ≥ 44×44px**, Abstände ≥ 8px.
- **Navigation:** Desktop horizontal mit Untermenü für Leistungen (klick-, nicht
  hovergesteuert — Hover allein ist auf Touch nicht bedienbar). Mobil ein Vollbild-Panel
  mit großen Zielen und dauerhaft sichtbarer Telefonnummer.
- **Mobile Aktionsleiste** unten: „Anrufen" und „Anfragen", erscheint nach dem Hero,
  verschwindet nie wieder. Respektiert `env(safe-area-inset-bottom)`.
- **Formulare:** Labels immer sichtbar (nie Placeholder als Label), Fehler direkt am
  Feld, Validierung erst nach Verlassen des Felds, `inputmode`/`autocomplete` gesetzt.

---

## Anti-KI-Prüfliste für dieses Projekt

Wird beim finalen Review gegen die fertige Seite gehalten:

- [ ] `border-radius: 0` durchgängig — keine abgerundeten Karten
- [ ] Keine `box-shadow` als Gestaltungsmittel
- [ ] Kein Verlauf, kein Glow, kein Glassmorphism
- [ ] Keine gleichförmigen 3er-Kartenreihen
- [ ] Keine Emoji, keine generischen Feature-Icons
- [ ] Keine Badges/Pills ohne Funktion
- [ ] Keine austauschbaren Headlines — jede muss einen Fakt enthalten
- [ ] Jede Sektion hat eine eigene Bauform
- [ ] Logo austauschen → Seite ergibt keinen Sinn mehr
