# Fokuswerk — Kampagnen-Architektur

---

## Meta Ads (400 €/Monat)

```
Account: Fokuswerk
│
├── Kampagne 1: Prospecting — Neue Kunden gewinnen
│   Ziel: Lead Generation
│   Budget: 300 €/Monat (10 €/Tag)
│   Bidding: Lowest Cost
│   Geo: Oldenburg + Bremen + 150km Radius
│   │
│   ├── Ad Set 1A: Inhaber & Geschäftsführer — Interessen
│   │   Targeting:
│   │   - Alter: 30–55
│   │   - Berufsbezeichnung: Inhaber, Geschäftsführer, CEO, Selbstständig
│   │   - Interessen: Unternehmensführung, Marketing, Social Media Business
│   │   - Ausschluss: Studenten, Schüler, Agenturen (Konkurrenz)
│   │   Creatives: 3 Varianten (Video + 2 Static)
│   │
│   └── Ad Set 1B: Broad — Entscheider regional
│       Targeting:
│       - Alter: 28–60
│       - Nur Geo-Targeting (lässt Algorithmus optimieren)
│       - Advantage+ Audience aktivieren
│       Creatives: gleiche 3 Varianten wie 1A
│
├── Kampagne 2: Retargeting — Warme Kontakte
│   Ziel: Lead Generation
│   Budget: 60 €/Monat (2 €/Tag)
│   Bidding: Lowest Cost
│   │
│   └── Ad Set 2A: Website-Besucher (letzten 30 Tage)
│       Mindestgröße: ~500 Personen (erst schalten wenn Pixel Daten hat)
│       Creative: Social Proof — Kundenstimmen / Ergebnisse
│       CTA: "Jetzt Termin sichern"
│
└── Kampagne 3: Lookalike — Skalierung (ab Monat 3)
    Ziel: Lead Generation
    Budget: 40 €/Monat
    Voraussetzung: Min. 100 Leads gesammelt für 1%-Lookalike
    Ad Set 3A: 1% Lookalike aus bestehenden Kunden (E-Mail-Liste hochladen)
```

### Naming Convention
```
FOKUSWERK_META_[ZIEL]_[ZIELGRUPPE]_[GEO]_[MONAT]
Beispiel: FOKUSWERK_META_LEADGEN_Inhaber-Interessen_OL-HB_2026Q2
```

---

## Google Search (100 €/Monat)

```
Account: Fokuswerk
│
└── Kampagne: Brand + Non-Brand Search
    Budget: 100 €/Monat (~3,30 €/Tag)
    Bidding: Maximize Clicks (Monat 1-2), dann Target CPA
    Geo: Oldenburg, Bremen, Hannover, Hamburg (Kernstädte)
    Sprache: Deutsch
    │
    ├── Ad Group 1: Social Media Agentur
    │   Keywords (Exact + Phrase):
    │   - [social media agentur oldenburg]
    │   - [social media agentur bremen]
    │   - "social media agentur niedersachsen"
    │   - "content agentur oldenburg"
    │   - [social media marketing agentur]
    │   Anzeigen: 1 RSA (15 Headlines, 4 Descriptions)
    │
    └── Ad Group 2: Content Produktion
        Keywords:
        - "content produktion unternehmen"
        - "social media content erstellen lassen"
        - "instagram fotos unternehmen"
        - "reels erstellen lassen"
        Anzeigen: 1 RSA
```

### Negative Keywords (sofort hinzufügen)
```
- kostenlos, free, gratis
- jobs, stellenangebote, ausbildung
- kurs, lernen, tutorial, wie erstelle ich
- selbst, selber
- agentur gründen
- instagram für privatpersonen
```

---

## Landing Page Anforderungen

Eine dedizierte Landing Page ist **Pflicht** — nicht die Hauptwebsite verwenden.

**Struktur der Landing Page:**
1. **Headline** (Ergebnis, nicht Dienstleistung)
   > "Euer Unternehmen. Professionell auf Social Media. Ohne Aufwand für euch."
2. **Subheadline** (Konkretisierung)
   > "Wir produzieren monatlich fertigen Content — Posts, Reels, Stories. Ihr postet nur noch."
3. **Social Proof** — 2–3 echte Kundenergebnisse mit Fotos
4. **Was ihr bekommt** — Package-Übersicht kurz (keine Preise!)
5. **CTA** — "Kostenloser Social Media Check buchen" → Calendly oder Formular
6. **Trust Signale** — Kundenzahl, Region, Beispiel-Posts
