# TN Abbruch — Website

Relaunch der digitalen Präsenz der TN-Abbruchunternehmen eGbR, Delmenhorst.

Statische Website auf Basis von Astro. Keine externen Ressourcen zur Laufzeit, keine
Cookies, keine Tracking-Skripte.

---

## Schnellstart

```bash
npm install
npm run dev
```

```bash
npm run build && npm run preview
```

---

## Aufbau

```
src/
├── data/company.ts          ← EINZIGE Quelle für Unternehmensdaten
├── content/
│   ├── referenzen.json      ← 20 Referenzprojekte
│   ├── jobs/*.md            ← eine Datei je offener Stelle
│   └── ../content.config.ts ← Schemata (Zod), validiert beim Build
├── components/              ← Header, Footer, Aktionsleiste, Marken, Schleusenschema
├── layouts/
│   ├── Base.astro           ← Head, SEO, strukturierte Daten, Motion
│   └── LeistungPage.astro   ← gemeinsames Gerüst der Leistungsseiten
├── pages/                   ← Seitenstruktur = Verzeichnisstruktur
├── styles/system.css        ← Designsystem: Tokens, Layout, Komponenten
└── assets/                  ← Bildquellen, werden beim Build optimiert
api/anfrage.js               ← Serverless-Funktion für das Anfrageformular
docs/                        ← Strategie, Creative Direction, Art Direction
```

---

## Inhalte pflegen

| Was | Wo | Wie |
|---|---|---|
| Telefon, Adresse, Registerdaten, Gesellschafter | `src/data/company.ts` | Wert ändern — Header, Footer, Impressum und die strukturierten Daten ziehen automatisch nach |
| Gerätebestand, Entsorgungsfraktionen | `src/data/company.ts` (`fleet`, `wasteStreams`) | Liste ergänzen |
| Zulassungen und Mitgliedschaften | `src/data/company.ts` (`credentials`) | Eintrag ergänzen — erscheint auf Startseite, Unternehmensseite und im Footer |
| **Neues Referenzprojekt** | `src/content/referenzen.json` | Objekt ergänzen. Pflicht: `slug`, `year`, `client`, `scope`, `category`, `sector`, `region`. Optional: `quantity` + `unit` |
| **Stelle ausschreiben** | `src/content/jobs/` | Neue `.md`-Datei nach Vorbild anlegen |
| **Stelle besetzt** | `src/content/jobs/` | Datei löschen — verschwindet aus Seite, Zähler und JobPosting-Markup |
| Leistungstexte | `src/pages/leistungen/*.astro` | Props im Frontmatter |

Nach jeder Änderung `npm run build` — Zod prüft die Schemata und bricht bei Fehlern ab.

### Vorbereitet für ein CMS

Die Inhalte liegen bereits getrennt vom Layout und mit validiertem Schema vor. Für ein
redaktionelles Backend genügt es, Decap CMS oder Sanity auf `src/content/` zu setzen —
die Feldstruktur steht in `src/content.config.ts`.

---

## Anfrageformular

Das Formular postet an `/api/anfrage`. Die Funktion liegt in `api/anfrage.js` und wird
von Vercel als Serverless Function erkannt; der Rest der Seite bleibt statisch.

Benötigte Umgebungsvariablen:

| Variable | Bedeutung |
|---|---|
| `RESEND_API_KEY` | API-Schlüssel von resend.com |
| `ANFRAGE_TO` | Zieladresse, z. B. `info@tn-abbruch.de` |
| `ANFRAGE_FROM` | verifizierte Absenderadresse, z. B. `website@tn-abbruch.de` |

Ohne `RESEND_API_KEY` antwortet der Endpunkt mit 503; das Formular zeigt dann
Telefonnummer und E-Mail-Adresse als Ausweichweg. **Vor dem Livegang setzen und einen
Testversand durchführen.**

Wird ein anderer Versandweg gewünscht (SMTP, ein bestehendes Postfach, ein anderer
Anbieter), muss nur der `fetch`-Aufruf in `api/anfrage.js` ersetzt werden — die
Validierung, die Spamfalle, die Anhangsbegrenzung und die Antwortcodes bleiben.

---

## Umzug auf die Domain

- [ ] Umgebungsvariablen für das Formular setzen und Testversand prüfen
- [ ] `site` in `astro.config.mjs` prüfen (aktuell `https://www.tn-abbruch.de`)
- [ ] Weiterleitungen der alten URLs einrichten (siehe unten)
- [ ] `sitemap-index.xml` in der Google Search Console einreichen
- [ ] Datenschutzerklärung anwaltlich prüfen lassen — insbesondere Hoster,
      Auftragsverarbeitung und Löschfristen
- [ ] Google-Unternehmensprofil auf identische NAP-Daten prüfen

### Weiterleitungen der Bestandsseiten

| alt | neu |
|---|---|
| `/index.html` | `/` |
| `/unternehmen.html` | `/unternehmen/` |
| `/unternehmen/jobs.html` | `/karriere/` |
| `/unsere-leistungen.html` | `/leistungen/` |
| `/unsere-leistungen/abbrucharbeiten.html` | `/leistungen/rueckbau-entkernung/` |
| `/unsere-leistungen/schadstoffsanierung.html` | `/leistungen/schadstoffsanierung/` |
| `/unsere-leistungen/gartenarbeiten-und-winterdienst.html` | `/` (Bereich 2021 verkauft, Hinweis steht im Footer) |
| `/referenzen.html` | `/referenzen/` |
| `/wir-sponsern.html` | `/unternehmen/` |
| `/kontakt.html` | `/kontakt/` |
| `/impressum.html` | `/impressum/` |
| `/datenschutz.html` | `/datenschutz/` |

Als `vercel.json` im Projektstamm:

```json
{
  "redirects": [
    { "source": "/index.html", "destination": "/", "permanent": true },
    { "source": "/unternehmen.html", "destination": "/unternehmen/", "permanent": true },
    { "source": "/unternehmen/jobs.html", "destination": "/karriere/", "permanent": true },
    { "source": "/unsere-leistungen.html", "destination": "/leistungen/", "permanent": true },
    { "source": "/unsere-leistungen/abbrucharbeiten.html", "destination": "/leistungen/rueckbau-entkernung/", "permanent": true },
    { "source": "/unsere-leistungen/schadstoffsanierung.html", "destination": "/leistungen/schadstoffsanierung/", "permanent": true },
    { "source": "/unsere-leistungen/gartenarbeiten-und-winterdienst.html", "destination": "/", "permanent": true },
    { "source": "/referenzen.html", "destination": "/referenzen/", "permanent": true },
    { "source": "/wir-sponsern.html", "destination": "/unternehmen/", "permanent": true },
    { "source": "/kontakt.html", "destination": "/kontakt/", "permanent": true },
    { "source": "/impressum.html", "destination": "/impressum/", "permanent": true },
    { "source": "/datenschutz.html", "destination": "/datenschutz/", "permanent": true }
  ]
}
```

---

## Qualitätssicherung

Alle Prüfskripte liegen in `qa/` (nicht Teil des Deployments):

```bash
node qa/functional.mjs     # Navigation, Menü, Filter, Formular, Links, Fokus
node qa/a11y.mjs           # axe-core, 10 Seiten × 2 Viewports
node qa/final-checks.mjs   # Meta, JSON-LD, Alt-Texte, Touch-Ziele, reduced-motion
node qa/shots.mjs /        # Ganzseiten-Screenshots nach qa/shots/
BASE=http://localhost:4322 node qa/perf.mjs   # Seitengewicht, CLS
```

Voraussetzung: `npm run dev` (Port 4321) bzw. `npm run preview -- --port 4322`.

Stand der letzten Prüfung: 36 Funktionsprüfungen bestanden, 0 Accessibility-Verstöße,
53 Struktur- und SEO-Prüfungen bestanden, CLS 0 auf allen Seiten, 0 Anfragen an Dritte.

---

## Konzeptunterlagen

- `docs/01-strategie.md` — Positionierung, Zielgruppen, Informationsarchitektur, Conversion
- `docs/02-creative-direction.md` — Designidee, Farbwelt, Typografie, Motion
- `docs/03-art-direction-prompts.md` — Prompt-Serie für ergänzende Materialstudien
