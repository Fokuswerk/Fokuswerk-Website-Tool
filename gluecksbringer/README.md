# Glücksbringer am Meer e.V. – Website

Relaunch des Webauftritts von [gluecksbringer-am-meer.de](https://gluecksbringer-am-meer.de).

Alle Inhalte, Bilder, Kontakt- und Spendendaten stammen aus dem bisherigen
Auftritt des Vereins und wurden unverändert übernommen.

## Technik

| | |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Sprache | TypeScript |
| Styling | Tailwind CSS 4 (Designtokens in `app/globals.css`) |
| Schriften | Figtree (Überschriften) und Inter (Fließtext), selbst ausgeliefert über `next/font` |
| Bilder | statische Importe aus `assets/bilder`, ausgeliefert über `next/image` (AVIF/WebP, Lazy Loading, unscharfe Vorschau) |
| Hosting | Vercel |

Die Seiten werden beim Bauen vollständig als statisches HTML erzeugt.
Es gibt keine Datenbank und kein CMS – die Inhalte liegen als TypeScript-Dateien
im Ordner `content/`.

## Lokal starten

```bash
npm install
npm run dev        # http://localhost:3000
```

Weitere Befehle:

```bash
npm run build      # Produktionsbuild
npm run start      # Produktionsbuild lokal ausliefern
npm run lint       # ESLint
npm run typecheck  # TypeScript prüfen
```

## Aufbau

```
app/                 Seiten (eine Datei je Route)
  page.tsx             Startseite
  ueber-uns/           Über uns
  aktuelles/           Übersicht + Beitragsseiten (/aktuelles/[slug])
  galerie/             Galerie
  unterstuetzen/       Spenden
  kontakt/             Kontakt (+ Serveraktion für das Formular)
  impressum/           Impressum
  datenschutz/         Datenschutzerklärung
  globals.css          Farben, Schriftgrößen, Abstände
components/          wiederverwendbare Bausteine
content/             ► hier werden Inhalte gepflegt (siehe INHALTE-PFLEGEN.md)
assets/bilder/       Bilddateien
scripts/             einmalige Hilfsskripte (Bildaufbereitung, Vorschaubild)
```

## Umgebungsvariablen

Alle optional. Ohne sie funktioniert die Seite vollständig – nur das
Kontaktformular wird dann nicht angezeigt (stattdessen erscheint die
E-Mail-Adresse als direkter Weg).

| Variable | Zweck |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Adresse der Seite, z. B. `https://gluecksbringer-am-meer.de`. Wird für Canonical-Links, Sitemap und Vorschaubilder gebraucht. |
| `RESEND_API_KEY` | API-Schlüssel von [resend.com](https://resend.com) für den Versand des Kontaktformulars. |
| `KONTAKT_ABSENDER` | Verifizierte Absenderadresse, z. B. `website@gluecksbringer-am-meer.de`. |
| `KONTAKT_EMPFAENGER` | Zieladresse der Formularnachrichten. Standard: `info@gluecksbringer-am-meer.de`. |

Das Formular erscheint nur, wenn `RESEND_API_KEY` **und** `KONTAKT_ABSENDER`
gesetzt sind. Es speichert nichts, sondern leitet die Nachricht per E-Mail weiter.

## Hilfsskripte

```bash
node scripts/prepare-images.mjs <ordner>   # Bilder verkleinern und neu komprimieren
node scripts/og-bild.mjs                   # Vorschaubild für soziale Netzwerke neu erzeugen
```

## Bewegung

Die Bewegungsebene liegt gebündelt am Ende von `app/globals.css`. Alles läuft
über `transform` und `opacity`, damit nichts nachrechnen muss und das Layout
nicht springt.

| Wo | Was |
|---|---|
| Überschrift der jeweiligen Seite | läuft Wort für Wort ein (`components/text-ein.tsx`) |
| Abschnitte beim Scrollen | blenden sanft auf (`components/reveal.tsx`) |
| Zahlen im Faktenband | rollen aus einer Maske nach oben |
| Meeresbild auf der Startseite | ruhige Parallaxe über `animation-timeline: view()` – ohne JavaScript, Browser ohne Unterstützung zeigen das Bild einfach ruhig |
| Fuß der Seite | zwei versetzte Wellen, dazu Puck, der leise wippt |
| Galerie-Großansicht | Ziehen mit dem Finger blättert weiter, nach unten ziehen schließt |
| Beiträge und Galerievorschau auf dem Smartphone | wischbare Reihen mit Punkten (`components/wischreihe.tsx`) |

Wer im Betriebssystem „Bewegung reduzieren“ eingestellt hat, bekommt nichts
davon zu sehen – die Seite bleibt vollständig bedienbar, das Blättern in der
Galerie springt dann ohne Übergang weiter.

## Barrierefreiheit und Performance

Geprüft mit Lighthouse (simuliertes Smartphone, Produktionsbuild):

| Seite | Performance | Barrierefreiheit | Best Practices | SEO |
|---|---|---|---|---|
| Startseite | 99 | 100 | 100 | 100 |
| Über uns | 96 | 100 | 100 | 100 |
| Aktuelles | 99 | 100 | 100 | 100 |
| Beitragsseite | 96 | 100 | 100 | 100 |
| Galerie | 95 | 100 | 100 | 100 |
| Unterstützen | 99 | 100 | 100 | 100 |
| Kontakt | 99 | 100 | 100 | 100 |
| Impressum / Datenschutz | 98 | 100 | 100 | 100 |

Cumulative Layout Shift liegt auf allen Seiten bei 0.

Auf dem Desktop erreichen alle Seiten 100/100/100/100.
