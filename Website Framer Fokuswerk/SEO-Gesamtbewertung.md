# SEO-Gesamtbewertung Fokuswerk — Stand 29.09.2026

Geprüft: neue Seite „FW neu“ (Vorschau https://frank-site-485713.framer.app, noch `noindex`), die alte fokuswerk.de,
Google-Ergebnisse für 12 Suchbegriffe (Deutschland, Seite 1–2), Google Maps für „Werbeagentur Oldenburg“ und „Fokuswerk
Oldenburg“, Suchvolumen für 130 Begriffe (Google-Keyword-Planner-Daten über Apify). Vorheriger Technik-Check: `SEO-GEO-Check.md`.

---

## Kurz gesagt

Die **neue Seite selbst ist gut vorbereitet** (On-Page, Technik, strukturierte Daten, jetzt 23 Ratgeber-Artikel).
**Gefunden wird Fokuswerk heute trotzdem nur über den eigenen Namen.** Bei keinem der 11 geprüften Leistungsbegriffe
(„werbeagentur oldenburg“, „webdesign oldenburg“, „google ads agentur oldenburg“ …) steht fokuswerk.de unter den ersten 20,
und in der Kartenansicht für „Werbeagentur Oldenburg“ nicht unter den ersten 12. Der Engpass liegt nicht mehr auf der
Website, sondern **außerhalb**: Google-Unternehmensprofil, Bewertungen, Verzeichnisse, Erwähnungen und Verlinkungen —
und dem Livegang, ohne den die neue Seite gar nicht bewertet wird.

## Nachprüfung am 29.09.2026 (nach Welle 2)

Vollständiger Durchlauf über alle 50 Seiten (17 Stammseiten + 33 Artikel), gemessen erst, als Framer alle Seiten fertig ausgeliefert hat.

| Prüfung | Ergebnis |
|---|---|
| Status, H1, Titel, Beschreibung | 50 × Status 200, je genau eine H1, keine doppelten Titel/Beschreibungen, alle Titel ≤ 60 Zeichen (9 zu lange gekürzt) |
| Strukturierte Daten | fehlerfrei; Artikel: BlogPosting + FAQPage + Brotkrumen; Übersicht: CollectionPage + Brotkrumen (neu) |
| Interne Links | keine toten Links; jeder Artikel hat 3–14 eingehende Links (Median 6, vorher 3), 12 Artikel um passende Querverweise ergänzt |
| Ladezeit Handy (Lighthouse) | Startseite Performance 89, LCP 2,1 s (heute früh 68 / 6,0 s, davor 55 / 41,5 s) · Artikel 94, LCP 1,0 s (vorher 65 / 7,8 s — die Einblendung der „Kurz gesagt“-Karte hielt den Text zurück) |
| Rest-Gewicht | ~5–7 MB, zum größten Teil Framers eigene Skripte auf der .framer.app-Vorschau und Google Analytics |
| Offen auf der Seite | Orange als Kleintext auf Weiß (Kontrast 3,1 : 1), `noindex` auf allen Seiten (gewollt bis zum Livegang), Sitemap deshalb noch leer |

Die Google-Rankings haben sich nicht verändert und können es auch nicht: Die neue Seite ist bis zum Livegang für Google gesperrt,
gefunden wird weiter die alte fokuswerk.de.

---


### Schlussprüfung 29.09.2026 (Ratgeber zurückgenommen)

- **Ratgeber dezenter:** raus aus Leiste und Menü, raus aus Startseite und Leistungsseiten. Bleibt: Fußzeile, die fünf SEO-Seiten,
  /ratgeber und die Querverweise der Artikel. Jeder Artikel hat weiter 3–12 eingehende Links, keine Seite ist verwaist.
- **Browser-Test aller 50 Seiten** bei 390 px und 1440 px: kein seitlicher Überlauf, keine Ladefehler, keine JavaScript-Fehler
  (einzige Konsolenmeldung: Framers eigener Hinweis „accelerometer not allowed“, harmlos). 78 externe Links und 34 Bilder erreichbar.
- **Hover:** 48 Karten wurden beim Überfahren auf 110 % vergrößert und überlappten — auf 100 % gesetzt.
- **Ladezeit Handy (LCP):** Startseite 2,3 s · /leistungen 2,1 s · /leistungen/websites 1,9 s · /kontakt 1,9 s (vorher 6,2 s —
  gemessen wurde das Logo der Ladeanimation; jetzt als Maske eingebunden) · /website-fuer-handwerker 2,4 s · Artikel 1,0–1,8 s.
  Der erste Abschnitt der Unterseiten blendet nicht mehr zusätzlich ein; die Ladeanimation übernimmt den Auftritt.
- **Aufgeräumt:** leere Menüzeile „Branchen“ entfernt; /branchen ist ein unveröffentlichter Entwurf (404).
- **Bewusst so gelassen:** Etikett „BEISPIELBILD“ an Stockfotos auf den SEO-Seiten, Orange als Kleinschrift (Kontrast 3,1 : 1).

## Punktestand

| Bereich | Gewicht | Punkte | Warum |
|---|---:|---:|---|
| Technik & Indexierbarkeit | 15 % | 85 | alle 50 Seiten Status 200, sauberes HTML ohne JavaScript lesbar, eine H1 je Seite, keine toten Links, eigene 404. Ladezeit Handy (Lighthouse): Startseite LCP 2,1 s, Artikel 1,0 s. **Noch `noindex` — heute 0 für die neue Seite** |
| On-Page-Inhalte | 20 % | 90 | klare Titel/Beschreibungen mit Suchbegriff, „Kurz gesagt“-Antworten, 48 FAQ im HTML + Markup, Leistungs- und 5 SEO-Seiten, jetzt 33 Ratgeber-Artikel (~43.000 Wörter), interne Verlinkung Leistung ↔ Ratgeber |
| Keyword-Abdeckung | 15 % | 80 | Region und Branchen abgedeckt, Ratgeber zielt auf ~48.800 Suchen/Monat. Lücken: eigene Seiten für „Google Ads Agentur“ und „Social Recruiting“, keine echten Fallstudien-Seiten |
| Local SEO | 20 % | 40 | Profil existiert (5,0 ★, **9 Bewertungen, 4 Fotos**), Kategorie „Online-Marketing-Unternehmen“ statt „Werbeagentur“, Name mit Zusatz „– Marketing & Social Media“. Sichtbare Wettbewerber in der Karte: 10–35 Bewertungen |
| Off-Page (Links, Erwähnungen) | 15 % | 25 | Profile auf werbeagentur.de, oldenburger-portal.de, netzundwerke.de — alle mit der **alten Positionierung** („Social Media, Content“). LinkedIn-Unternehmensseite 4 Follower, alte Beschreibung. Kaum Verlinkungen. Namensgleiche Fokuswerk GmbH (Nürnberg) teilt sich die Markensuche |
| GEO (KI-Assistenten) | 15 % | 65 | strukturierte Daten (Organisation, Personen, Artikel, FAQ), zitierfähige Kurzantworten, Autoren. Fehlt: belegte Fallstudien als eigene Seiten, Erwähnungen auf fremden Seiten |
| **Gesamt (nach Livegang)** | | **≈ 64 / 100** | On-Page ist fast ausgereizt, Off-Page und Local bremsen |

Realistische Erwartung: Mit Livegang, gepflegtem Profil und 20+ Bewertungen ist die **Kartenansicht für „Werbeagentur
Oldenburg“ in 3–6 Monaten** erreichbar. Die Ratgeber-Artikel ranken bundesweit gegen starke Konkurrenz; erste Besuche nach
2–4 Monaten, nennenswerter Verkehr (grob 500–2.000 Besuche/Monat) eher nach 6–12 Monaten — und nur, wenn Verlinkungen
dazukommen. Das ist eine Schätzung, keine Zusage.

---

## Was heute bei Google passiert

| Suchbegriff (Suchen/Monat) | fokuswerk.de | Karte | Wer stattdessen oben steht |
|---|---|---|---|
| fokuswerk (40) | **Platz 1** | ja | dazwischen Fokuswerk GmbH Nürnberg (Immobilien), Instagram, werbeagentur.de-Profil |
| fokuswerk oldenburg (–) | nicht in Top 20 | – | Verzeichnisse |
| werbeagentur oldenburg (480) | nicht in Top 20 | ja, Fokuswerk nicht in Top 12 | Gipfelstürmer, Mangoblau, Superidee, Das Telefonbuch, 11880 |
| webagentur / webdesign oldenburg (480/170) | nicht in Top 20 | nein | agentur-77, kim-kolkmann, webmarketiere, kennstdueinen |
| google ads agentur oldenburg | nicht in Top 20 | ja | heise regioconcept, formvermittlung, Löwenstark, werbeagentur.de |
| marketingagentur / social media agentur oldenburg | nicht in Top 20 | teils | werbeagentur.de-Ranglisten, omt.de, feedbax.de |

**Lesart:** Die Portale (werbeagentur.de, omt.de, feedbax.de, 11880, Das Telefonbuch, Das Örtliche, kennstdueinen) belegen
viele der ersten Plätze. Wer dort mit gutem Profil und Bewertungen steht, wird **über die Portale** gefunden — das ist der
schnellste Hebel, schneller als eigenes Ranking.

Vollständige Auswertung: `scratchpad/seo2/serp-auswertung.md` (Top 20 je Begriff).

---

## Keywords — womit nach Fokuswerk gesucht wird

**Region (Hauptziel Startseite):** werbeagentur oldenburg 480 · webagentur oldenburg 480 · webdesign oldenburg 170 ·
seo oldenburg 90 · marketingagentur oldenburg 70 (steigend). „performance marketing oldenburg“ hat kein messbares Volumen —
deshalb zielt der Titel der Startseite auf „Werbeagentur … Oldenburg“ und nennt Performance Marketing als Leistung.

**Branchen (SEO-Seiten, bereits live):** marketing für zahnarztpraxen 2.900 · website für ärzte 1.600 · website für handwerker 880 ·
praxismarketing 390 · werbung für kfz werkstatt 110 · werbung optiker 90.

**Ratgeber (neu, 23 Artikel):**

| Artikel | Suchbegriffe (Suchen/Monat) |
|---|---:|
| Meta Ads für lokale Betriebe | 12.610 |
| Google-Bewertung löschen | 5.500 |
| Was ist Performance Marketing? | 3.880 |
| Landingpage | 2.560 |
| Social Recruiting / Mitarbeiter finden | 2.230 |
| Google-Unternehmensprofil | 2.100 |
| Leadgenerierung | 2.040 |
| Was kostet eine Website? | 1.940 |
| Google-Ads-Agentur finden | 1.660 |
| Local SEO · In ChatGPT gefunden werden · Google-Ads-Kosten | je ~1.560 |
| SEO für Handwerker · Barrierefreie Website · Meta-Pixel · Framer-Website · SEO für Zahnärzte | je ~1.000–1.300 |
| Website-Relaunch · Retargeting · Instagram-/Facebook-Werbung-Kosten · Imagefilm-Kosten · MFA/ZFA finden · Mitarbeiter finden Handwerk | je 290–910 |
| **Summe** | **≈ 48.800** |

Alle Werte deutschlandweit. Die Artikel sind für Leser in der Region geschrieben (Beispiele aus Handwerk, Praxis, Werkstatt,
Oldenburg) und verlinken jeweils auf die passende Leistung und das Erstgespräch.

---

## On-Page — was erledigt ist

- Titel, Beschreibungen, eine H1 je Seite, Überschriftenstruktur, Alt-Texte, Kontrast, 404, Vorschaubild (siehe `SEO-GEO-Check.md`)
- FAQ-Antworten im HTML, FAQ-Markup auf 10 Seiten wörtlich synchron (48/48)
- **Ratgeber:** Übersicht `/ratgeber`, 23 Artikel unter `/ratgeber/<slug>`, je Artikel: eigener SEO-Titel und Beschreibung,
  Kurzantwort oben, Autor und Datum, Fragenblock, Quellen, strukturierte Daten (BlogPosting + FAQPage + Brotkrumen),
  Vor/Zurück-Verlinkung
- **Interne Verlinkung:** Abschnitt „Aus dem Ratgeber“ mit drei passenden Artikeln auf Startseite, /leistungen, den drei
  Leistungsseiten und den fünf SEO-Seiten; „Ratgeber“ in Leiste, Menü und Fußzeile
- **Korrigiert:** LinkedIn-Link führte auf ein fremdes Profil („Lukas Keller“, /company/fokuswerk) → jetzt /company/fokuswerk-media;
  Instagram zeigte auf @fokuswerk.de → jetzt @fokuswerk (das Konto mit den 680 Followern). Auch in den Organisationsdaten.
  Thees' LinkedIn-Profil als `sameAs` am Gründer ergänzt. Fußzeile „Content & Brand“ → „Fotos & Videos“.

## Was nur ihr machen könnt (Reihenfolge nach Wirkung)

1. **Livegang** — noindex aus, Domain fokuswerk.de auf Framer, 301-Weiterleitungen (/über-uns → /agentur, /unsere-arbeit → /arbeiten,
   /unsere-arbeit/{hotel-alte-werft, patio, winhadi, zwillis} → /arbeiten), Search Console anmelden und Sitemap einreichen.
   Ohne diesen Schritt zählt nichts von oben.
2. **Google-Unternehmensprofil** (größter Einzelhebel):
   - Hauptkategorie auf **„Werbeagentur“**, Nebenkategorien „Online-Marketing-Unternehmen“, „Webdesigner“, „Fotograf“, „Videoproduzent“
   - Name auf **„Fokuswerk“** kürzen — Zusätze wie „– Marketing & Social Media“ verstoßen gegen Googles Namensregeln und können zur Sperre führen
   - Beschreibung auf die neue Positionierung (Claim, Leistungen, Einzugsgebiet)
   - 15–20 echte Fotos (Team, Drehs, Büro), Leistungen einzeln anlegen, Website-Link auf die Startseite
   - **Bewertungen: Ziel 25+ in drei Monaten** — jeden zufriedenen Kunden direkt nach Projektende mit Link bitten (die Kunden aus
     Arbeiten/Kundenrad sind genug für 20)
   - alle 2–3 Wochen ein Beitrag (neuer Ratgeber-Artikel, neues Projekt)
3. **Verzeichnisse** auf die neue Positionierung bringen, überall identischer Name/Adresse/Telefon: werbeagentur.de (steht bei 11+ Begriffen oben —
   Profil ausbauen, Bewertungen dort sammeln), omt.de-Agenturfinder, feedbax.de, 11880, Das Telefonbuch, Das Örtliche, Gelbe Seiten,
   kennstdueinen, wlw, Oldenburger Portal, netzundwerke
4. **Verlinkungen von Kundenseiten:** Auf jeder Kundenseite, die unter eigener Domain live ist (heute wav-wst.de, später jede
   weitere), in der Fußzeile „Website: Fokuswerk“ mit Link auf /leistungen/websites — mit Zustimmung des Kunden. Themennahe,
   regionale Links sind für eine kleine Agentur viel wert. Die Entwürfe auf Testadressen (vercel.app) zählen dafür nicht.
5. **LinkedIn-Unternehmensseite** auf die neue Positionierung umschreiben, Julius' LinkedIn-Adresse schicken (für die Firmendaten)
6. **Fallstudien-Seiten** (Zwillis, Patio, WinHadi, Hotel Alte Werft) mit Ausgangslage → Maßnahme → Zahlen → Zeitraum —
   stärkster Hebel für KI-Assistenten und Ziel für die alten /unsere-arbeit/-Adressen
7. **Regionale Erwähnungen:** Wirtschaftsförderung Oldenburg, IHK-Mitgliederverzeichnis, Gründerportale, NWZ/Oldenburger Onlinezeitung
   (Gründergeschichte), Podcasts/Vorträge für Handwerkskammer oder Zahnärztekammer mit Ratgeber-Themen
8. **Google Analytics nur mit Einwilligung** (kein Ranking-Faktor, aber rechtliches Risiko beim Livegang)

## Ratgeber weiter ausbauen

Rhythmus: **2 Artikel pro Monat** reichen, wichtiger als Menge ist Aktualität (Datum pflegen) und dass jeder Artikel eine Frage
besser beantwortet als die Top 3 bei Google. Nächste Themen mit Volumen:

Welle 2 (29.09.2026) ist erledigt: Datenschutzerklärung & Impressum, Cookie-Banner, Google Analytics 4, Conversion-Rate,
Website mieten oder kaufen, Social Media, TikTok, Newsletter, Zielgruppe, Online-Marketing für kleine Unternehmen.

Nächste Kandidaten:

| Thema | Warum |
|---|---|
| Fallstudien als Artikel („So kam Zwillis zu +156 % Buchungen“ usw.) | stärkster GEO-Hebel, braucht Details von euch |
| Google Ads oder Meta Ads — was passt zu welchem Betrieb? | Vergleichsfrage aus Erstgesprächen |
| Website-Ladezeit verbessern | 30 Suchen, aber Grundlage für Relaunch-Beratung |
| Werbung für Arztpraxen: was das Heilmittelwerbegesetz erlaubt | ergänzt die Praxis-Seiten |
| Standort-Artikel mit echten Projekten (Ammerland, Wesermarsch, Bremen) | nur mit echten Kunden vor Ort, sonst Doorway-Risiko |

Die Artikel liegen als Markdown in `Ratgeber/`; `Ratgeber/_BRIEFING.md` ist die Schreibvorlage, `Ratgeber/_import.py` erzeugt den
CMS-Import. Neue Artikel: Datei anlegen → Import → veröffentlichen.
