# Fokuswerk — Tracking Setup Checkliste

**Vor dem ersten Euro Ad Spend muss das Tracking stehen.**

---

## Conversion-Events definieren

| Event | Plattform | Priorität | Wert |
|-------|-----------|-----------|------|
| Lead (Formular abgeschickt) | Meta + Google | P1 — Pflicht | ~260 € (10% Close × 2.600 €) |
| Calendly-Buchung | Meta + Google | P1 — Pflicht | gleicher Wert |
| Seitenaufruf Landing Page | Meta | P2 | kein Wert |
| Button-Klick CTA | Meta + Google | P2 | kein Wert |

---

## Meta Pixel Setup

- [ ] Meta Pixel installiert (via GTM oder direkt im Header)
- [ ] `Lead`-Event bei Formular-Submit feuert korrekt
- [ ] `Lead`-Event bei Calendly-Buchung feuert korrekt (Iframe-Lösung oder Calendly Integration)
- [ ] Pixel im Meta Events Manager verifiziert
- [ ] Pixel-Helfer Chrome Extension — Test-Event durchgeführt
- [ ] Cookie-Banner: Pixel feuert NUR nach Zustimmung (DSGVO!)

### UTM-Parameter für alle Meta Links
```
utm_source=facebook&utm_medium=paid_social&utm_campaign=prospecting&utm_content=[creative_name]
```

---

## Google Ads Conversion Tracking

- [ ] Google Tag (gtag.js) auf Website installiert
- [ ] Conversion-Aktion "Lead / Anfrage" erstellt
- [ ] Conversion bei Formular-Absenden trackt korrekt
- [ ] Enhanced Conversions aktiviert (für bessere Attribution)
- [ ] Google Analytics 4 verknüpft
- [ ] Suchanfragen-Bericht täglich in ersten 2 Wochen prüfen

### UTM-Parameter für alle Google Links
```
utm_source=google&utm_medium=cpc&utm_campaign=[kampagnenname]&utm_term={keyword}
```

---

## DSGVO / Datenschutz (Deutschland — Pflicht!)

Meta und Google Ads in Deutschland erfordern:

- [ ] **Cookie-Banner** mit expliziter Zustimmung (kein "Opt-Out" reicht nicht)
  Empfehlung: Cookiebot, Borlabs Cookie, oder Usercentrics
- [ ] Pixel und Tags feuern NUR nach Consent
- [ ] **Datenschutzerklärung** angepasst (Meta Pixel + Google Ads erwähnt)
- [ ] **Impressum** vollständig und erreichbar
- [ ] Meta: Consent Mode oder Conversions API (CAPI) konfigurieren

> ⚠️ OHNE korrekte Cookie-Einwilligung drohen Abmahnungen.
> Das ist in Deutschland kein "Nice to have" — es ist gesetzlich vorgeschrieben.

---

## Attribution-Einstellungen

| Plattform | Empfohlenes Attributionsfenster |
|-----------|--------------------------------|
| Meta | 7-Tage-Klick / 1-Tag-View |
| Google | Datengesteuert (Data-Driven) |
| Gesamt | CRM als Source of Truth verwenden |

**Wichtig:** Plattform-Zahlen übertreiben Attribution um 20–40 %.
Immer mit tatsächlichen CRM-Leads gegenchecken.

---

## Wöchentliche Tracking-Kontrolle

```
□ Alle Conversion-Events feuern korrekt?
□ Keine "Unverified" Events im Meta Events Manager?
□ Google Ads zeigt Conversions an?
□ UTM-Parameter in GA4 sichtbar?
□ Lead-Anzahl aus Ads = Lead-Anzahl in CRM/Inbox?
```
