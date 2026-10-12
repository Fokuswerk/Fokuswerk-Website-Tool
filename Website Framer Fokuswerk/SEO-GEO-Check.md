# SEO- und GEO-Check — Fokuswerk (Vorschau „FW neu“)

Stand: 29.09.2026 · geprüft: https://frank-site-485713.framer.app (16 Seiten, noindex)
Methode: HTML aller Seiten so geladen, wie ein Crawler sie sieht (ohne JavaScript), Lighthouse 12 lokal
(Handy-Simulation, Startseite + /website-fuer-handwerker), Abgleich strukturierte Daten ↔ sichtbarer Text,
alte Seite fokuswerk.de (Sitemap). PageSpeed Insights war nicht nutzbar (öffentliches Tageskontingent erschöpft).

---

## Behoben am 29.09.2026 (gleicher Tag, nach dem Check)

Nachgemessen auf der veröffentlichten Vorschau, alle 16 Seiten neu geladen, nachdem Framer sie fertig
ausgeliefert hatte (`ssg-status: optimized`).

| Punkt | Vorher | Jetzt |
|---|---|---|
| 1 · FAQ-Antworten im HTML | fehlten (Antwort im geschlossenen Zustand ausgeblendet) | stehen auf allen 10 FAQ-Seiten im HTML (Antwort bleibt im DOM, nur auf Höhe 0) |
| 2 · FAQ-Markup ↔ Text | veraltet | neu aus den sichtbaren Fragen erzeugt, 48/48 Antworten stimmen wörtlich überein |
| 3/4 · H1 | zwei H1 pro Seite, Startseite nur „Performance Marketing,“ | genau eine H1 je Seite (Framer wiederholt sie für Tablet/Handy im HTML); Startseite: „Werbeagentur in Oldenburg · Performance Marketing & Websites“; CTA-Titel sind H2 (neuer Textstil „Display XL (H2)“) |
| 6 · Ladezeit Startseite (Lighthouse, Handy) | Performance 55 · LCP 41,5 s · 9,0 MB | Performance 68 · LCP 6,0 s · 6,9 MB · CLS 0,02 |
| 6 · Bilder | 6 Website-Screenshots als PNG, 6,1 MB | als WebP zugeschnitten, 0,77 MB; Unsplash-Bilder als WebP q70 in kleineren Breiten |
| 7 · Titel/Beschreibungen | teils zu lang, Fachsprache | alle Beschreibungen unter 158 Zeichen, einfache Sprache; Titel mit Suchbegriff |
| 8 · Vorschaubild | keins | og-bild.png auf allen Seiten |
| 9 · 404 | Framer-Standard | eigene deutsche 404, liefert Status 404 + noindex |
| 11 · Überschriften | Geisterwörter als H2 | wo die Sektion schon eine H2 hat, jetzt Absatz |
| 12 · Alt-Texte | „Stimme“-Fotos ohne Alt | gesetzt; einziges Bild ohne Alt ist das Logo der Ladeanimation (dekorativ, `aria-hidden`, korrekt) |
| 13 · Kontrast | graue Kleintexte zu blass | Farbtöne „Tinte 40“ → 60 %, „Papier 40“ → 55 %; übrig nur Orange auf Weiß (3,1 : 1) |
| 14 · Organisationsdaten | ohne Logo/Bild | Logo, Bild, neue Beschreibung, Slogan = neuer Claim |
| 15 · Firmenname | uneinheitlich | Rechtstexte: „Fokuswerk (Abt & Bodenstab GbR)“ |

Lighthouse-SEO steht auf der Vorschau weiter bei 69 — das liegt allein am gewollten noindex der Vorschau.

**Beobachtung:** Direkt nach jedem Veröffentlichen liefert Framer einige Minuten lang eine leere Hülle
(26 KB, generischer Titel, ohne robots-Meta) aus, bevor die fertige Seite kommt. Für die Vorschau egal,
nach dem Livegang aber ein Grund, Search Console erst nach ein paar Minuten anzustoßen.

**Offen — braucht Entscheidung oder Zugang:**
- Livegang (Punkt 5): noindex aus, Domain fokuswerk.de umziehen, 301-Weiterleitungen der alten Adressen, Search Console
- Google Analytics lädt ohne Einwilligung (Punkt 10) — Cookie-Banner oder Framer Analytics statt GA
- Orange als Kleintext-Farbe (3,1 : 1) — Markenfarbe, nur mit dunklerem Orange-Ton für Text lösbar
- Fallstudien-Unterseiten als stärkster GEO-Hebel, fehlende Keyword-Seiten
- LinkedIn-Profile der Gründer für `sameAs` (Adressen fehlen)

---

## Gesamturteil

| Bereich | Note | Kurz |
|---|---|---|
| Inhalt & Keywords | gut | Jede Seite hat ein klares Thema, SEO-Seiten mit Suchbegriff in Titel und H1, 1.100–1.600 Wörter, „Kurz gesagt“-Antworten |
| Technik & Auszeichnung | mittel | zwei H1 pro Seite, veraltetes FAQ-Markup, kein Vorschaubild, Standard-404 |
| Ladezeit | schwach | Startseite Handy: Performance 55, LCP 41,5 s (simuliert), 9 MB |
| GEO (KI-Assistenten) | mittel–gut | Texte stehen im HTML, starke Organisationsdaten — aber FAQ-Antworten fehlen im HTML, keine Fallstudien als Beleg |
| Livegang-Bereitschaft | offen | noindex, leere Sitemap, keine Weiterleitungen der alten URLs |

---

## Kritisch (vor Livegang beheben)

### 1. FAQ-Antworten stehen nicht im HTML
Die Akkordeons rendern im zugeklappten Zustand nur die Frage. Die Antwort existiert erst nach einem Klick.
Google, ChatGPT, Perplexity & Co. sehen auf allen 10 Seiten mit Fragen **keine einzige Antwort**.
→ Frage-Komponente so umbauen, dass die Antwort immer im HTML steht und nur optisch zugeklappt ist.

### 2. FAQ-Markup (JSON-LD) passt nicht zum sichtbaren Text
Die FAQPage-Daten wurden einmalig erzeugt; die Antworten wurden seitdem in einfache Sprache umgeschrieben.
Auf **allen 10 Seiten** weichen die Antworten ab, auf 2 Seiten steht eine Frage im Markup, die es sichtbar
nicht mehr gibt („Übernimmt Fokuswerk auch bestehende Kampagnen oder Websites?“). Google wertet
abweichendes Markup als Verstoß (Rich Results fallen weg, im Zweifel manuelle Maßnahme).
→ FAQ-JSON-LD aus den aktuellen Frage-Instanzen neu erzeugen.

### 3. Zwei H1 auf jeder Seite
Die Überschrift im Abschluss („Reden wir über Ihre Zahlen.“) ist durch die Textvorlage „Display“ eine H1 — auf
jeder Seite zusätzlich zur eigentlichen H1.
→ Abschluss-Überschrift auf H2 setzen.

### 4. H1 der Startseite ist nur „Performance Marketing,“
Die Überschrift ist auf zwei Textknoten verteilt, nur Zeile 1 ist H1. Der Hauptsuchbegriff der Startseite
(„Werbeagentur Oldenburg“, 480 Suchen/Monat) steht nur in der kleinen Kennerzeile als Absatz.
→ Empfehlung: Kennerzeile „Werbeagentur in Oldenburg · Performance Marketing & Websites“ als H1,
Claim-Zeilen als H2 — optisch bleibt alles gleich.

### 5. Livegang-Checkliste (Framer)
- noindex auf allen Seiten **und** `noIndexSite` ausschalten → erst dann füllt sich die Sitemap (heute leer).
- Eigene Domain fokuswerk.de verbinden → Canonicals zeigen dann automatisch auf fokuswerk.de (heute framer.app).
- **Weiterleitungen (301) der alten Adressen** — die rankt Google heute:

  | alt (fokuswerk.de) | neu |
  |---|---|
  | /über-uns | /agentur |
  | /unsere-arbeit | /arbeiten |
  | /unsere-arbeit/hotel-alte-werft | /arbeiten (oder neue Fallstudie, s. u.) |
  | /unsere-arbeit/patio | /arbeiten (oder Fallstudie) |
  | /unsere-arbeit/winhadi | /arbeiten (oder Fallstudie) |
  | /unsere-arbeit/zwillis | /arbeiten (oder Fallstudie) |
  | /kontakt | /kontakt (bleibt) |
- Google Search Console: Domain bestätigen, Sitemap einreichen, alte Fallstudien-URLs beobachten.
- /branchen ist Entwurf (404) — nichts verlinkt mehr darauf, passt.

---

## Wichtig

### 6. Ladezeit (Handy, Lighthouse simuliert)

| Seite | Performance | FCP | LCP | TBT | CLS | Datenmenge |
|---|---|---|---|---|---|---|
| Startseite | 55 | 20,0 s | 41,5 s | 20 ms | 0,016 | 9,0 MB (Bilder 3,9 MB, JS 4,7 MB) |
| /website-fuer-handwerker | 63 | 1,0 s | 8,8 s | 350 ms | 0,016 | 5,5 MB (JS 4,7 MB) |

Ziel laut Google: LCP ≤ 2,5 s. Ursachen, nach Hebel sortiert:
- **Ganzseitige Screenshots der Kundenseiten** im Leistungsbereich: Glanzwerk 986 KB, WAV 509 KB (doppelt geladen).
  → auf die oberen 2–3 Bildschirmhöhen zuschneiden, als WebP hochladen (geschätzt −1,5 MB).
- **Bildgrößen**: Lighthouse schätzt 2,2 MB Ersparnis durch passende Größen, 0,7 MB durch WebP/AVIF.
  → Unsplash-Motive mit `fm=webp&q=70` und passender Breite (Filmstreifen 400 statt 700 px, Auftakt 2000 statt 2800 px).
- **LCP-Element ist der Untertitel im Auftakt** — er ist bis zum Ende der Ladeanimation unsichtbar (Deckkraft 0).
  → Unter der Ladeanimation Text deckend lassen und nur Unschärfe/Position animieren; sie ist ohnehin verdeckt.
- **JavaScript 4,7 MB**, einige Framer-Pakete doppelt geladen, dazu Google Analytics (173 KB) und Framers
  Formularschutz (210 KB) auf jeder Seite. Nur begrenzt beeinflussbar; Code-Bausteine sparsam halten.

### 7. Titel und Beschreibungen
- **Beschreibungen zu lang** (Google zeigt ca. 155–160 Zeichen): /leistungen 192, /marketing-fuer-zahnarztpraxen 189,
  /werbung-fuer-kfz-werkstaetten 190, /website-fuer-aerzte 178, /werbung-fuer-optiker 178, Startseite 175.
- **Noch in der alten Fachsprache** („Meta Ads“, „Recruiting“, „Content“, „Tracking“, „planbar“) — passt nicht mehr zum Seitentext.
- /leistungen/content: Titel „Content & Brand — …“ passt nicht mehr zur Seite („Fotos & Videos“).
- Titel sonst gut: eindeutig, Suchbegriff vorn, „| Fokuswerk“ am Ende. /agb (15 Zeichen) und /impressum sind kurz, egal.

### 8. Kein Vorschaubild (og:image) auf allen Seiten
Beim Teilen auf WhatsApp, LinkedIn, Slack erscheint kein Bild; manche KI-Oberflächen nutzen es ebenfalls.
→ Ein Vorschaubild 1200 × 630 (Logo + Claim auf Dunkel) seitenweit setzen.

### 9. 404-Seite ist Framers Standard
„Page Not Found | Framer“, Englisch, ohne Links. → Eigene 404 auf Deutsch mit Links zu Leistungen/Kontakt.

### 10. Google Analytics ohne Einwilligung
Die Seite lädt `gtag/js?id=G-NGN7HYSSP8`, ein Cookie-/Einwilligungsbanner ist nicht zu sehen. In Deutschland braucht
Analytics vorher eine Einwilligung (TTDSG/DSGVO). Kein SEO-Faktor, aber ein rechtliches Risiko beim Livegang.
→ Entweder Einwilligungsbanner mit Consent Mode oder cookielose Statistik (z. B. Framer Analytics allein).

---

## Verbesserungen

### 11. Überschriften-Struktur
- Die großen **Geisterwörter** („Werbung“, „System“, „Beispiele“, „Fotos“ …) sind H2 — direkt gefolgt von der eigentlichen
  H2 des Abschnitts. Das ergibt doppelte, inhaltsleere Überschriften. → Geisterwörter als Absatz, echte Abschnittstitel als H2.
- Alle Überschriften erscheinen im HTML dreimal (Desktop/Tablet/Handy-Fassung). Das ist Framer-typisch und für Google unkritisch.

### 12. Bilder ohne Alt-Text
Startseite 5, /leistungen/websites 11, /arbeiten 3, /leistungen 3 — vor allem die Website-Screenshots und Kundenlogos
in den Code-Bausteinen. Logos und Screenshots sollten beschrieben sein („Website der Kfz-Werkstatt WAV Westerstede“).

### 13. Kontrast (Barrierefreiheit, Lighthouse)
- Graue Etiketten/Brotkrumen `#949392` auf Papier: Kontrast 2,76 (Soll 4,5).
- Oranger Text `#FF5A1F` auf hell: 3,11. Sonst Barrierefreiheit 95–96.
- Fokuswerk fällt als Kleinstunternehmen vermutlich unter die BFSG-Ausnahme — trotzdem gut für Lesbarkeit.

### 14. Organisationsdaten (JSON-LD)
Gut: ProfessionalService mit Anschrift, Telefon, Gründern, Einzugsgebiet, Leistungskatalog, Geo-Koordinaten, sameAs
(Instagram, LinkedIn); Service + BreadcrumbList auf den SEO-Seiten; FAQPage.
Fehlt/veraltet:
- `logo` fehlt; `image` zeigt ein altes Stockfoto (Filmset) → gemeinsames Gründerfoto oder Logo.
- Gründer ohne `sameAs` (LinkedIn-Profile) — hilft KI-Systemen, Personen eindeutig zuzuordnen.
- Leistungsbeschreibungen noch in Fachsprache (in Ordnung für Maschinen, aber „Content-Produktion“ statt „Fotos & Videos“).
- Google-Unternehmensprofil fehlt in `sameAs` (falls vorhanden, eintragen).

### 15. Einheitlicher Firmenname
Meta-Beschreibungen nennen „Fokuswerk GbR“ (AGB, Datenschutz) bzw. „Fokuswerk GbR (Abt & Bodenstab GbR)“ (Impressum),
das JSON-LD „Abt & Bodenstab GbR“. → Überall: „Fokuswerk (Abt & Bodenstab GbR)“.

---

## GEO — Sichtbarkeit in KI-Assistenten

| Kriterium | Stand |
|---|---|
| Inhalt ohne JavaScript lesbar | ✅ Alle Texte, auch aus den Code-Bausteinen (Leistungsbühne, Systemkette, Arbeitsschau, Kundenrad), stehen im HTML |
| Direkte Antworten | ✅ „Kurz gesagt“-Blöcke auf den SEO-Seiten; ❌ FAQ-Antworten fehlen im HTML (Punkt 1) |
| Eindeutige Entität (Name, Ort, Telefon) | ✅ konsistent: Schramperweg 90, 26129 Oldenburg, 0176 63307587 — Firmenname uneinheitlich (Punkt 15) |
| Belege / Zitierfähigkeit | ⚠️ Kennzahlen (+156 %, 69 Bewerbungen, +72 %) ohne Quelle auf der Seite; die alten Fallstudien fallen weg |
| Personen / Expertise | ⚠️ Gründer mit Foto und Kurzbio auf /agentur, aber ohne LinkedIn-Verknüpfung, ohne Einzelprofil |
| KI-Crawler zugelassen | ✅ robots.txt erlaubt alles (GPTBot, ClaudeBot, PerplexityBot …) — greift erst nach Aufheben von noindex |
| llms.txt | ❌ fehlt; Framer kann keine Textdateien im Stammverzeichnis ausliefern (nur über vorgeschalteten Proxy möglich) — niedrige Priorität |
| Aktualität | ⚠️ keine Datumsangaben, kein Blog/Ratgeber |

**Größter GEO-Hebel nach den FAQ:** Fallstudien als eigene Seiten (Zwillis, Patio, WinHadi, Hotel Alte Werft, Haubner) mit
Ausgangslage → Maßnahme → Zahlen → Zeitraum. KI-Assistenten zitieren konkrete, belegte Einzelfälle deutlich lieber als
Leistungsbeschreibungen — und die alten URLs (/unsere-arbeit/…) ließen sich direkt dorthin weiterleiten.

---

## Keywords (aus Keyword-Analyse.md) — noch nicht abgedeckt

| Begriff | Suchen/Monat | Vorschlag |
|---|---:|---|
| website erstellen lassen | 3.600 | /leistungen/websites: Titel/H1 darauf ausrichten („Website erstellen lassen in Oldenburg“) |
| google ads agentur | 1.600 | eigener Abschnitt oder Seite unter Performance |
| local seo | 1.000 | Abschnitt auf /leistungen/websites, später Ratgeber |
| werbeagentur bremen | 720 | nur mit echten Bremer Projekten (sonst Doorway-Risiko) |
| social recruiting | 590 | eigene Leistungsseite „Mitarbeiter finden“ — Thema kommt auf allen SEO-Seiten vor |
| was kostet eine website | 480 | Ratgeber mit echter Preisspanne |

---

## Reihenfolge

1. FAQ-Antworten ins HTML + FAQ-Markup neu erzeugen (Punkte 1–2)
2. Zweite H1 raus, Startseiten-H1 (Punkte 3–4)
3. Bilder verkleinern/zuschneiden, LCP-Text sichtbar lassen (Punkt 6)
4. Beschreibungen kürzen und in einfacher Sprache, Content-Titel (Punkt 7)
5. Vorschaubild, 404, Alt-Texte, Geisterwörter als Absatz, Kontrast, Organisationsdaten (Punkte 8–15)
6. Livegang: noindex aus, Domain, Weiterleitungen, Search Console, Analytics-Einwilligung (Punkte 5, 10)
7. Danach: Fallstudien-Seiten, Keyword-Lücken
