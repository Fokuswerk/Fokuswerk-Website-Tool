# Ratgeber Fokuswerk — Schreibbriefing

Stand 29.09.2026. Gilt für jeden Artikel unter `Ratgeber/<slug>.md`.

## Wer schreibt, für wen

Fokuswerk ist eine Werbeagentur aus Oldenburg (Schramperweg 90, 26129 Oldenburg), zwei Gründer:
- **Thees Bodenstab** — Performance-Marketing (Google Ads, Meta Ads), Websites, Tracking, Strategie.
- **Julius Abt** — Fotografie, Video, Bildgestaltung (seit über acht Jahren).

Leistungen: Werbung bei Google, Instagram und Facebook · Websites (in Framer gebaut) · Fotos & Videos vom Betrieb.
Kunden: lokale Betriebe im Umkreis von ~100 km um Oldenburg — Handwerk, Kfz-Werkstätten, Arzt- und Zahnarztpraxen,
Optiker, Gastronomie, Hotels. Ablauf: 30-Minuten-Erstgespräch → halber Tag Aufnahmen vor Ort → Website in 2–4 Wochen →
Anzeigen ab Woche 5, monatlicher Bericht in Klartext. Festes Angebot nach dem Erstgespräch (keine Stundensätze).
Claim: „Performance Marketing, das messbar Kunden bringt.“

**Belegte Zahlen, die genannt werden dürfen** (sonst KEINE Fokuswerk-Zahlen erfinden):
- Zwillis Padel (Oldenburg): +156 % mehr Buchungen
- Patio (Bar, Oldenburg): 69 Bewerbungen über eine Recruiting-Kampagne, 290.000 Aufrufe
- WinHadi (Hospitality): +72 % längere Verweildauer auf der neuen Website
- Hotel Alte Werft: +27 % Buchungen, +42 % Website-Aufrufe nach neuen Fotos/Videos
- Rechenbeispiel (klar als Beispiel kennzeichnen): 1.000 € Budget → 25 € je Anfrage → 40 Anfragen → 10 Aufträge → 100 € je Auftrag; ein Werkstattkunde ist ca. 2.000 € wert.

**Nie**: Fokuswerk-Preise erfinden, Zertifizierungen/Partnerstatus behaupten, Kundennamen außer den obigen nennen,
den Satz „Mehr Anfragen. Nicht mehr Follower.“ verwenden, Konkurrenten nennen.

## Leser

Inhaber:innen und Praxisleitungen kleiner Betriebe. Keine Marketing-Profis. Wollen eine ehrliche, konkrete Antwort
und danach entscheiden, ob sie es selbst machen oder jemanden beauftragen.

## Ton

- **Sie-Form**, einfache Sprache, kurze Sätze, aktive Verben. Fachbegriffe beim ersten Mal in einem Halbsatz erklären.
- Konkret statt allgemein: echte Zahlen, Spannen, Beispiele aus Handwerk/Praxis/Werkstatt in der Region.
- Ehrlich: auch sagen, wann sich etwas NICHT lohnt oder was man selbst machen kann.
- Keine Floskeln („In der heutigen digitalen Welt“, „Gamechanger“, „ganzheitlich“, „maßgeschneidert“, „Synergien“,
  „Mehrwert“, „nicht nur … sondern auch“ als Dauermuster). Keine Emojis. Keine Ausrufezeichen-Werbung.
- Gedankenstriche sparsam.

## Aufbau jedes Artikels

1. Einstieg (2–4 Sätze, ohne Überschrift): Welche Frage beantwortet der Artikel, für wen.
2. 5–8 Abschnitte mit `##`, bei Bedarf `###`. Überschriften als klare Aussagen oder echte Suchfragen.
   Das Hauptkeyword steht in mindestens einer `##`-Überschrift und im ersten Absatz, natürlich formuliert.
3. Listen (`-` oder `1.`) wo sie Lesern helfen (Checklisten, Schritte). **Keine Tabellen, keine Bilder, kein HTML.**
4. Mindestens ein durchgerechnetes Beispiel oder eine Schritt-für-Schritt-Anleitung.
5. Abschnitt `## Selbst machen oder machen lassen?` (oder sinngemäß) mit ehrlicher Abwägung.
6. Schluss `## Nächster Schritt` mit 2–3 Sätzen und Link zum Erstgespräch: `[kostenloses Erstgespräch](/kontakt)`.

Länge: **1.200–1.800 Wörter** Fließtext (ohne FAQ). Lieber dichter als länger.

## Links

- 2–4 **interne Links** im Text als Markdown `[Text](/pfad)`, nur auf diese Pfade:
  `/leistungen` · `/leistungen/performance-marketing` · `/leistungen/websites` · `/leistungen/content` · `/arbeiten` ·
  `/agentur` · `/kontakt` · `/marketing-fuer-zahnarztpraxen` · `/website-fuer-aerzte` · `/website-fuer-handwerker` ·
  `/werbung-fuer-kfz-werkstaetten` · `/werbung-fuer-optiker` · sowie andere Ratgeber-Artikel `/ratgeber/<slug>` (Liste unten).
- **Externe Links** nur auf Primärquellen (Google-Hilfe, Meta-Hilfe, gesetze-im-internet.de, Bundesregierung, Statistikämter,
  Kammern), und nur dort, wo eine Zahl oder Rechtslage belegt wird.

## Fakten prüfen

Jede Zahl (Klickpreise, Marktpreise, Fristen, Gesetzesinhalte, Plattformregeln) mit WebSearch/WebFetch prüfen und in
`quellen` aufführen. Preisangaben als Spannen und „Richtwerte, Stand 2026“ formulieren. Rechtsthemen: allgemein informieren,
am Ende ein Satz „Das ist keine Rechtsberatung …“. Sparsam suchen (max. ~8 Suchen je Artikel) — das Suchkontingent ist geteilt.

## Dateiformat (exakt so)

```
---
titel: "…"                 # H1, max. 70 Zeichen, enthält Hauptkeyword
slug: "…"                  # wie in der Liste unten
seoTitel: "… | Fokuswerk"  # max. 60 Zeichen inkl. „ | Fokuswerk“
beschreibung: "…"          # Meta-Beschreibung, 130–155 Zeichen, einfache Sprache, enthält Hauptkeyword
kategorie: "…"             # genau eine: Website · Werbung · Gefunden werden · Mitarbeiter finden · Fotos & Videos
hauptkeyword: "…"
nebenkeywords: ["…", "…"]
autor: "Thees Bodenstab"   # oder "Julius Abt" bei Foto/Video
datum: "2026-09-29"
lesezeit: 7                # Minuten, Wörter/200 aufgerundet
kurzantwort: "…"           # 2–3 Sätze, 40–70 Wörter, direkte Antwort auf die Hauptfrage (für Google-Snippets und KI-Assistenten)
faq:
  - frage: "…"             # 4 echte Suchfragen, die im Text NICHT schon 1:1 als Überschrift stehen
    antwort: "…"           # 2–4 Sätze, eigenständig verständlich
quellen:
  - titel: "…"
    url: "https://…"
---

Einstieg …

## …
```

## Artikelliste (Slug · Hauptkeyword · Nebenkeywords mit Suchen/Monat DE)

| Slug | Hauptkeyword | Nebenkeywords |
|---|---|---|
| was-kostet-eine-website | website kosten (720) | was kostet eine website 480 · website erstellen lassen kosten 480 · homepage kosten 260 |
| landingpage | was ist eine landingpage (880) | landingpage erstellen 1.000 · landingpage erstellen lassen 260 · landingpage optimieren 210 · conversion rate optimierung 210 |
| website-relaunch | website relaunch (720) | website relaunch seo 110 · website relaunch checkliste 50 · website relaunch kosten 30 |
| barrierefreie-website | barrierefreie website (1.000) | barrierefreiheitsstärkungsgesetz website 170 · bfsg website 70 |
| framer-website | framer website (880) | website baukasten oder agentur · website mieten 170 |
| google-ads-kosten | google ads kosten (1.000) | was kostet google ads 210 · google ads kosten pro klick 30 · suchmaschinenwerbung 320 |
| instagram-facebook-werbung-kosten | instagram werbung kosten (390) | facebook werbung kosten 170 · was kostet werbung auf instagram 140 · meta ads kosten 90 |
| meta-ads | meta ads (8.100) | facebook ads 2.900 · facebook werbung 880 · instagram werbung schalten 590 · facebook werbung schalten 140 |
| was-ist-performance-marketing | performance marketing (2.900) | was ist performance marketing 390 · performance marketing agentur 590 |
| meta-pixel-conversions-api | meta pixel (880) | conversions api 260 · tracking ohne cookies 50 |
| retargeting | retargeting (880) | — |
| google-ads-agentur-finden | google ads agentur (1.600) | werbeagentur finden 20 · agentur finden 40 |
| google-unternehmensprofil | google unternehmensprofil erstellen (1.900) | google my business optimieren 110 · google unternehmensprofil optimieren 90 |
| google-bewertung-loeschen | google bewertung löschen (5.400) | negative google bewertung 70 · google bewertungen bekommen 30 |
| local-seo | local seo (1.000) | lokale suchmaschinenoptimierung 320 · seo für kleine unternehmen 210 · local seo tipps 50 |
| in-chatgpt-gefunden-werden | generative engine optimization (1.300) | ki sichtbarkeit 170 · ki suchmaschinenoptimierung 90 |
| seo-fuer-handwerker | seo für handwerker (320) | website für handwerker 880 · werbung für handwerker 110 |
| seo-fuer-zahnaerzte | seo zahnarzt (390) | praxismarketing 390 · website für zahnärzte 260 |
| social-recruiting | mitarbeiter finden (720) | social recruiting 590 · mitarbeitergewinnung 260 · personalgewinnung 260 · recruiting kampagne 260 · stellenanzeige instagram 140 |
| mfa-zfa-finden | mfa finden (210) | zfa finden 170 |
| mitarbeiter-finden-handwerk | mitarbeiter finden handwerk (170) | azubis finden 70 · azubi marketing 50 |
| imagefilm-kosten | imagefilm kosten (320) | fotograf unternehmen 170 · unternehmensvideo kosten |
| leadgenerierung | leadgenerierung (1.600) | kunden gewinnen 210 · neukunden gewinnen 90 · cost per lead 140 |

## Welle 2 (29.09.2026) — zehn weitere Artikel

| Slug | Hauptkeyword | Nebenkeywords |
|---|---|---|
| datenschutzerklaerung-impressum | datenschutzerklärung website (720) | impressum pflicht 210 |
| cookie-banner | cookie banner pflicht (140) | tracking ohne cookies 50 |
| google-analytics-4 | google analytics 4 (2.900) | — |
| conversion-rate-optimierung | conversion rate optimierung (210) | landingpage optimieren 210 · mehr anfragen über die website |
| website-mieten-oder-kaufen | website mieten (170) | website im abo · homepage kosten 260 |
| social-media-fuer-unternehmen | social media für unternehmen (210) | instagram für unternehmen 140 · social media marketing 12.100 |
| tiktok-fuer-unternehmen | tiktok für unternehmen (70) | tiktok werbung kosten 40 |
| newsletter-marketing | newsletter marketing (320) | email marketing 9.900 |
| zielgruppe-definieren | zielgruppe definieren (210) | — |
| online-marketing-kleine-unternehmen | online marketing für kleine unternehmen (70) | marketing für kleine unternehmen 50 · marketing budget 170 · werbebudget berechnen 10 |

Bestehende Artikel (für interne Links `/ratgeber/<slug>`): alle Slugs aus beiden Tabellen oben.
