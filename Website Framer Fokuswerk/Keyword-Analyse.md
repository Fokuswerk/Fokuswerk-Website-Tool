# Keyword-Analyse Fokuswerk — Branchen und Region

Erhoben am 28.09.2026 mit Google-Keyword-Planner-Daten über Apify
(`steadyfetch/keyword-search-volume-scraper` für 144 Begriffe, `problemsolver/google-keyword-planner-tool`
für Ideen zu 8 Startbegriffen). Markt: Deutschland, Sprache Deutsch. Werte = durchschnittliche
Suchen pro Monat, deutschlandweit. Lokale Begriffe („… oldenburg“) sind darin enthalten.
Kosten: rund 1,20 $ (Gratis-Tarif; das Tageskontingent des ersten Actors war danach verbraucht).

## Ergebnis nach Branche

| Branche | Hauptbegriff | Suchen | weitere Begriffe (Suchen) | Seite |
|---|---|---:|---|---|
| Zahnärzte | marketing für zahnarztpraxen | 2.900 | website für zahnärzte 1.000 · zahnarzt marketing 590 · marketing für zahnärzte 590 · praxismarketing für zahnärzte 390 · webdesign zahnarzt 390 · website zahnarzt 260 · zfa finden 170 · werbeagentur zahnarzt 90 | `/branchen/zahnaerzte` |
| Ärzte | website für ärzte / arzt website | 1.600 | webdesign für ärzte 590 · praxis website 390 · praxismarketing 390 · website arztpraxis 260 · marketing für ärzte 210 · arzt homepage 210 · mfa finden 210 | `/branchen/aerzte` |
| Handwerk | website für handwerker | 880 | webdesign handwerk 590 · aufträge handwerk 590 · marketing im handwerk 260 · handwerker marketing 260 · mitarbeiter finden handwerk 170 · werbung handwerker 110 · handwerker homepage 110 · recruiting handwerk 70 (Klickpreis > 100 $) | `/branchen/handwerk` |
| Werkstätten & Autohäuser | werbung für kfz werkstatt | 110 | marketing für autohäuser 110 · autohaus werbung 110 · kfz mechatroniker finden 70 (Klickpreis 27 $) · autowerkstatt werbung 30 | `/branchen/werkstaetten` |
| Optik & Hörakustik | werbung optiker | 90 (steigend) | augenoptiker gesucht 50 · Rest ≤ 10 | `/branchen/optiker` |

**Lesart:** Praxen sind das mit Abstand größte Suchfeld (Zahnärzte und Ärzte zusammen über 6.000
Suchen im Monat). Handwerk ist solide. Werkstätten und Optik sind klein — die Seiten dort dienen vor
allem als Landingpage für Direktansprache und Anzeigen (siehe `PAID_MEDIA_STRUKTUR.md`: die
Zielgruppe ist namentlich bekannt), nicht als große SEO-Traffic-Quelle. Recruiting-Begriffe haben
sehr hohe Klickpreise — dort ist organische Sichtbarkeit besonders wertvoll.

## Region

| Begriff | Suchen | Trend |
|---|---:|---|
| werbeagentur bremen | 720 | fallend |
| werbeagentur oldenburg | 480 | stabil |
| webagentur oldenburg | 480 | stabil |
| webdesign bremen | 320 | fallend |
| webdesign oldenburg / webdesigner oldenburg | 170 | stabil |
| seo agentur oldenburg | 90 | fallend |
| marketing agentur oldenburg | 70 | steigend |
| social media agentur oldenburg | 70 | fallend |
| webdesign ostfriesland | 70 | fallend |
| performance marketing oldenburg | — | kein Volumen |

→ Startseite umgestellt: Titel „Werbeagentur Oldenburg: Websites & Performance Marketing | Fokuswerk“,
Etikett und Einleitungssatz nennen „Werbeagentur in/aus Oldenburg“. Vorher zielte der Titel auf
„Performance Marketing … Oldenburg“ — dafür gibt es kein messbares Suchvolumen.

## Themen mit Volumen, die noch keine eigene Seite haben

| Begriff | Suchen | Idee |
|---|---:|---|
| website erstellen lassen | 3.600 | Leistungsseite Websites darauf ausrichten |
| performance marketing | 2.900 | Leistungsseite Performance (bundesweit hart umkämpft) |
| google ads agentur | 1.600 | Klickpreis 65 $ — eigene Seite lohnt |
| local seo | 1.000 | Ratgeber oder Leistungsseite „Local SEO & GEO“ |
| website relaunch | 720 | Ratgeber |
| werbeagentur bremen | 720 | Standortseite Bremen (Einzugsgebiet, echte Projekte nötig, sonst Doorway) |
| social recruiting | 590 | Leistungsseite Recruiting — passt zu allen fünf Branchen |
| performance marketing agentur | 590 | Leistungsseite Performance |
| was kostet eine website / website erstellen lassen kosten | 480 / 480 | Ratgeber mit echter Preisspanne |
| recruiting kampagne | 260 | Leistungsseite Recruiting |

## Umgesetzt auf den Branchenseiten

- Title und Description mit Hauptbegriff, H1 mit Hauptbegriff (genau eine H1 je Seite)
- Brotkrumen sichtbar und als `BreadcrumbList`
- Antwort-Block „Kurz gesagt“: Frage als H2, direkte Antwort in zwei Absätzen, Faktenliste —
  für Google-Snippets und KI-Assistenten (GEO)
- Fünf Fragen je Seite zu echten Suchanfragen, als Akkordeon und als `FAQPage`
- `Service` mit Zielgruppe und Einzugsgebiet, verknüpft mit der Organisation
- Querverweise auf Leistungsseiten und die anderen Branchen, Übersicht `/branchen`,
  „Branchen“ in Leiste, Menü und Fußzeile
- Beispielkampagne je Branche mit branchentypischen Suchbegriffen (als Beispiel markiert)

**Zum Livegang:** Alle Seiten stehen auf `noindex` (Seiteneinstellung und `noIndexSite`). Ohne
Freischaltung auf der echten Domain rankt nichts davon.
