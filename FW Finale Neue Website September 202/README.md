# Fokuswerk — Website

Strategischer Relaunch, September 2026. Astro, statisch, ohne Framework im Frontend.

Konzept, Positionierung, Dramaturgie und Designsystem stehen in
[`docs/KONZEPT.md`](docs/KONZEPT.md). Diese Datei beschreibt nur den Betrieb.

---

## Befehle

```bash
npm install
npm run dev       # Entwicklungsserver, Port 4330
npm run build     # nach dist/
npm run preview   # gebauten Stand ausliefern, Port 4321
npm run qa        # Barrierefreiheit, tote Links, Überlauf, Meta, Gewicht
npm run shots     # Bildschirmfotos nach qa/shots/
```

`npm run qa` und `npm run shots` erwarten einen laufenden Server. Standard ist
`http://localhost:4331`; abweichend über `BASIS=…` setzen.

```bash
npx astro preview --port 4331 &
BASIS=http://localhost:4331 npm run qa
BASIS=http://localhost:4331 AUS=qa/shots-mobil BREITE=390 HOEHE=844 npm run shots
```

---

## Aufbau

```
src/
  data/firma.ts          Stammdaten, CTA-Label, Navigation, Preis- und Rechengrößen
  data/fallstudien.ts    Fallstudien — eine weitere Fallstudie ist ein Eintrag mehr
  styles/system.css      Designsystem: Token, Typoskala, Raster, Bewegung
  scripts/bewegung.ts    Reveals, Parallaxe, Zahlen-Count-up (3,3 kB inline, kein Paket)
  layouts/Basis.astro    Grundgerüst, Metadaten, strukturierte Daten
  layouts/Rechtstext.astro
  components/            Kopf mit Overlay-Menü, Fuß, Abschnitt, Titel, Bildband …
  components/start/      Die Abschnitte der Startseite in Reihenfolge der Dramaturgie
  pages/                 Startseite, Leistung, Fallstudien, Über uns, Kontakt, Recht
  assets/                Bilder (Original als JPEG, Astro erzeugt WebP-Varianten)
  assets/raw/            unbearbeitete Generate — nicht ausgeliefert
api/anfrage.js           Vercel-Funktion für das Kontaktformular
qa/                      Prüf- und Bildschirmfotoskripte
```

---

## Eine Fallstudie ergänzen

1. Bild nach `src/assets/<name>.jpg` legen (Langseite ≤ 2400 px, JPEG Q88).
2. In `src/data/fallstudien.ts` einen Eintrag ans Array anhängen. Das Feld `bild`
   enthält den Dateinamen ohne Endung.
3. Fertig. Übersicht, Detailseite, Sitemap und die Startseiten-Kachel entstehen daraus.

**Regel, die nicht verhandelbar ist:** Jede Zahl muss aus einem Werbekonto, einer
Rechnung oder einem Vertrag belegbar sein. Ein Zitat kommt nur mit schriftlicher
Freigabe des Betriebs auf die Seite — deshalb ist das Feld `zitat` optional und bei
WAV bewusst leer.

---

## Kontaktformular

`api/anfrage.js` nimmt das Formular entgegen und verschickt es über Resend.
Benötigte Umgebungsvariablen in Vercel:

| Variable | Beispiel | Pflicht |
|---|---|---|
| `RESEND_API_KEY` | `re_…` | ja |
| `ANFRAGE_AN` | `contact@fokuswerk.de` | nein, Vorgabe wie hier |
| `ANFRAGE_VON` | `Website <website@fokuswerk.de>` | nein, Absenderdomäne muss bei Resend verifiziert sein |

Ohne Schlüssel antwortet die Funktion mit 500; das Formular zeigt dann Telefonnummer
und E-Mail als Ausweichweg an. Der Honigtopf heißt `webseite` und ist ausgeblendet.

---

## Datenschutz — Stand der Umsetzung

Die Datenschutzerklärung beschreibt **den tatsächlichen Zustand dieser Website**:
keine Analyse, kein Tracking, keine Cookies, keine externen Skripte, Schriften
selbst gehostet. Deshalb gibt es kein Einwilligungsbanner.

**Wenn GA4, Google Ads oder das Meta Pixel eingebaut werden, muss beides zurück:**
die entsprechenden Abschnitte in `src/pages/datenschutz.astro` und ein
Einwilligungsbanner, das die Skripte erst nach Zustimmung lädt.

---

## Bilder

Alle Bilder sind derzeit **Platzhalter** aus generativer Erzeugung, nach der in
`docs/KONZEPT.md` beschriebenen Art Direction. Sie sind so kalibriert, dass echte
Aufnahmen vom nächsten Drehtag sie ohne Bruch ersetzen: Tageslicht aus Hallenfenstern,
warm-neutral, leicht entsättigt, Menschen bei der Arbeit, kein Blickkontakt zur Kamera.

Ersetzen heißt: gleiche Datei in `src/assets/` überschreiben, gleiches Seitenverhältnis
beibehalten, neu bauen. Die Bildunterschriften behaupten bewusst nirgends, wer auf
einem Bild zu sehen ist.

Für die Fallstudie WAV fehlt noch der **Screenshot aus dem Meta-Werbekonto**
(drei Kampagnenzeilen, Kosten je Ergebnis). Der gehört als Beleg auf
`/fallstudien/wav-westerstede/`, sobald er freigegeben ist.

---

## Auslieferung

Vercel, statisch. `vercel.json` setzt `cleanUrls`, `trailingSlash`, unveränderliche
Zwischenspeicherung für `/fonts/` und `/_astro/` sowie die üblichen Sicherheits-Header.
Die Serverfunktion unter `api/` läuft auf Node.

Gewicht der Startseite: 69 kB HTML, 3,3 kB JavaScript (inline, keine externe Datei),
Schriften 46 kB + 122 kB, Bilder als WebP in vier Breiten.
