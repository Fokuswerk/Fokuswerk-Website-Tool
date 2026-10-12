---
titel: "Google Analytics 4 einrichten: Was Betriebe wirklich brauchen"
slug: "google-analytics-4"
seoTitel: "Google Analytics 4 einrichten für Betriebe | Fokuswerk"
beschreibung: "Google Analytics 4 einrichten: Schritte, Schlüsselereignisse für Anfragen und Anrufe, Einwilligung und Datenschutz. Was ein kleiner Betrieb ansehen sollte."
kategorie: "Website"
hauptkeyword: "google analytics 4"
nebenkeywords: ["ga4 einrichten", "schlüsselereignisse", "analytics alternative"]
autor: "Thees Bodenstab"
datum: "2026-09-29"
lesezeit: 7
kurzantwort: "Google Analytics 4 (GA4) zählt Besuche und Aktionen auf Ihrer Website als Ereignisse und zeigt, woher Besucher kommen und wie viele davon anfragen. Für einen kleinen Betrieb reichen Quellen, Schlüsselereignisse wie Formular und Anruf, und die Handy-Zahlen. In Deutschland ist meist eine Einwilligung nötig. Ein schlankerer Dienst ohne Cookies ist oft die einfachere Wahl."
faq:
  - frage: "Ist Google Analytics 4 kostenlos?"
    antwort: "Ja, die Standardversion von Google Analytics ist kostenlos. Für sehr große Datenmengen und Zusatzfunktionen gibt es eine kostenpflichtige Variante, die für lokale Betriebe nicht relevant ist. Kosten entstehen eher durch die Einrichtung, wenn Sie diese abgeben, und durch das Cookie-Banner."
  - frage: "Warum stimmen die Zahlen in GA4 nicht mit meinen echten Anfragen überein?"
    antwort: "Es fehlen Besucher, die das Tracking ablehnen, und Anrufe, die nicht auf der Website gemessen werden. Außerdem zählen GA4 und Google Ads Conversions teils anders. Vergleichen Sie Trends über Wochen statt einzelne Zahlen und gleichen Sie die Anfragen mit Ihrem Posteingang und Telefon ab."
  - frage: "Wie lange speichert Google Analytics meine Daten?"
    antwort: "Sie stellen die Aufbewahrung für detaillierte Nutzerdaten in der Property selbst ein. Zur Wahl stehen 2 oder 14 Monate. Für Betriebe mit Saisonschwankungen sind 14 Monate sinnvoll, weil Sie so Vorjahresmonate vergleichen können. Die Standardberichte mit zusammengefassten Zahlen bleiben davon unberührt."
  - frage: "Was ist der Unterschied zwischen Universal Analytics und GA4?"
    antwort: "Universal Analytics zählte vor allem Sitzungen und Seitenaufrufe. GA4 arbeitet mit Ereignissen: Jede Aktion ist ein Ereignis, und Sie legen fest, welche davon Erfolge sind. Universal Analytics wurde 2023 abgeschaltet, GA4 ist der aktuelle Standard."
quellen:
  - titel: "Google Analytics-Hilfe: Ereignisse als Schlüsselereignisse markieren"
    url: "https://support.google.com/analytics/answer/13128484?hl=de"
  - titel: "Google Analytics-Hilfe: Erweiterte Messung"
    url: "https://support.google.com/analytics/answer/9216061?hl=de"
  - titel: "Google Analytics-Hilfe: Datenaufbewahrung"
    url: "https://support.google.com/analytics/answer/7667196?hl=de"
  - titel: "Google Analytics-Hilfe: Einwilligungsmodus (Consent Mode)"
    url: "https://support.google.com/analytics/answer/9976101?hl=de"
  - titel: "Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG), § 25"
    url: "https://www.gesetze-im-internet.de/ttdsg/__25.html"
---

Sie haben eine Website und wollen wissen, was dort passiert: Wie viele Besucher kommen, woher, und wie viele davon fragen wirklich an? Google Analytics 4, kurz GA4, beantwortet das kostenlos. Es kann aber auch überfordern. Dieser Ratgeber zeigt, was GA4 misst, wie Sie es in wenigen Schritten einrichten, wie Sie Anfragen und Anrufe als Erfolg zählen, was in Deutschland datenschutzrechtlich zu beachten ist und welche Zahlen ein kleiner Betrieb tatsächlich anschauen sollte.

## Was Google Analytics 4 misst

GA4 arbeitet mit Ereignissen. Jede Aktion eines Besuchers ist ein Ereignis: eine Seite aufrufen, scrollen, einen Link anklicken, ein Formular absenden. Daraus baut GA4 seine Berichte.

Die sogenannte erweiterte Messung erfasst ohne zusätzlichen Code sieben Arten von Ereignissen:

- Seitenaufrufe
- Scrollen (wenn jemand 90 Prozent der Seite erreicht)
- Klicks auf ausgehende Links
- Websitesuche
- Videointeraktionen
- Downloads von Dateien wie PDF
- Formularinteraktionen

Die einzelnen Punkte lassen sich in den Datenstream-Einstellungen an- und ausschalten. Was GA4 nicht von allein kennt, ist Ihr Geschäft. Ob ein Formular-Klick eine echte Anfrage war oder ein Anruf einen Auftrag brachte, müssen Sie festlegen.

## Google Analytics 4 einrichten: die Schritte

Rechnen Sie mit 30 bis 60 Minuten, wenn Sie Zugriff auf Ihre Website haben.

1. **Konto und Property anlegen.** Melden Sie sich unter analytics.google.com mit einem Google-Konto an, das Ihnen gehört, nicht einer Agentur oder einem Freelancer. So behalten Sie die Kontrolle. Legen Sie ein Konto für Ihren Betrieb an und darin eine Property (die Messeinheit für Ihre Website).
2. **Datenstream für das Web anlegen.** Tragen Sie Ihre Website-Adresse ein. GA4 erzeugt eine Mess-ID, die mit „G-“ beginnt.
3. **Mess-ID auf der Website einbauen.** Viele Website-Baukästen haben dafür ein Feld. Alternativ nutzen Sie den Google Tag Manager, der mehrere Tags an einer Stelle bündelt. Wichtig: Das Tag darf bei Einwilligungspflicht erst nach Zustimmung laden (siehe unten).
4. **Erweiterte Messung prüfen.** Lassen Sie die sinnvollen Ereignisse an. Videos und Websitesuche können Sie ausschalten, wenn beides nicht vorkommt.
5. **Datenaufbewahrung einstellen.** Sie wählen zwischen 2 und 14 Monaten. Nehmen Sie 14 Monate, dann sehen Sie Vorjahresvergleiche.
6. **Prüfen, ob es läuft.** Öffnen Sie Ihre Seite in einem zweiten Fenster und schauen Sie im Echtzeitbericht, ob Ihr Besuch auftaucht.

## Anfragen und Anrufe zählen: Schlüsselereignisse

Das ist der wichtigste Teil. Ohne ihn zeigt GA4 nur Besucherzahlen, aber nicht, was sie Ihnen bringen.

Google nennt wichtige Ereignisse jetzt Schlüsselereignisse, früher hießen sie Conversions. Für einen Betrieb sind das meistens:

- **Formular gesendet.** Google kennt dafür das empfohlene Ereignis „generate_lead“.
- **Klick auf die Telefonnummer.** Ein Klick auf einen Link mit „tel:“ zeigt, dass jemand anrufen will.
- **Klick auf E-Mail-Link oder WhatsApp-Button.**
- **Terminbuchung abgeschlossen,** falls Sie ein Buchungstool nutzen.

So markieren Sie ein Ereignis nach der [Anleitung der Google-Hilfe](https://support.google.com/analytics/answer/13128484?hl=de): Öffnen Sie in GA4 „Admin“, dann „Ereignisse“. Sobald das Ereignis in der Liste steht, klicken Sie den Stern daneben. Für ein neues Ereignis legen Sie es über „Ereignis erstellen“ an und aktivieren „Als Schlüsselereignis markieren“. Laut Google kann es bis zu 24 Stunden dauern, bis es in den Standardberichten erscheint. Der Echtzeitbericht zeigt es nach wenigen Minuten. Sie brauchen dafür mindestens die Rolle „Marketingexperte“.

Ein Wort zu Anrufen: GA4 misst nur den Klick auf die Nummer, nicht das Gespräch. Wer nur am Handy die Nummer sieht und antippt, wird gezählt. Wer sie abtippt oder vom Ausdruck wählt, nicht. Zählen Sie deshalb zusätzlich, wie viele Anrufe tatsächlich kommen und wonach Kunden gefragt haben.

Wenn Sie Google Ads schalten, können Sie Schlüsselereignisse als Conversions in Google Ads verwenden. Dann optimiert die Werbung auf echte Anfragen statt auf Klicks. Wie das im Zusammenspiel funktioniert, erklärt die Seite zu [Performance-Marketing](/leistungen/performance-marketing).

## Was ein kleiner Betrieb wirklich anschauen sollte

GA4 hat Dutzende Berichte. Ein Betrieb braucht fünf Zahlen, einmal im Monat:

1. **Besucher nach Kanal:** Woher kommen sie, aus der Google-Suche, aus Anzeigen, direkt, aus sozialen Netzwerken?
2. **Schlüsselereignisse insgesamt und je Kanal:** Wie viele Anfragen und Anrufklicks, und aus welcher Quelle?
3. **Beliebteste Seiten:** Welche Leistungen werden angesehen? Das zeigt, wonach gesucht wird.
4. **Handy gegen Desktop:** Bei vielen lokalen Betrieben kommt der Großteil der Besucher mit dem Smartphone. Sind die Handy-Zahlen deutlich schlechter, ist die Seite auf dem Handy das Problem.
5. **Anteil der Besucher, die anfragen:** Schlüsselereignisse geteilt durch Besucher.

Ein Rechenbeispiel, klar als Beispiel gedacht: Ihre Website hat 800 Besucher im Monat und 16 Anfragen (Formular und Anrufklicks). Das sind 2 Prozent. Kommen davon 300 Besucher aus Google Ads mit 12 Anfragen, sind es 4 Prozent, und die übrigen 500 Besucher bringen 4 Anfragen, also 0,8 Prozent. Jetzt wissen Sie zwei Dinge: Die Anzeigen bringen die Anfragen, und die Seite überzeugt Besucher aus der normalen Suche zu selten. Wie Sie das Verhältnis verbessern, steht im Ratgeber zur [Conversion-Rate-Optimierung](/ratgeber/conversion-rate-optimierung).

Alles Übrige, etwa Nutzerpfade, Zielgruppen oder Attributionsmodelle, ignorieren Sie in den ersten Monaten. Es lenkt ab.

## Einwilligung und Datenschutz bei GA4

GA4 speichert Kennungen im Browser der Besucher. Nach § 25 TDDDG brauchen Sie dafür in der Regel eine Einwilligung. Das heißt: ein Cookie-Banner mit gleichwertigem „Ablehnen“, und das GA4-Tag darf erst nach Zustimmung laden. Die Einzelheiten stehen im Ratgeber zum [Cookie-Banner](/ratgeber/cookie-banner).

Dazu kommen diese Punkte:

- **Datenschutzerklärung:** Nennen Sie GA4, den Zweck, die Rechtsgrundlage (Einwilligung), die Speicherdauer und die Datenübermittlung in die USA.
- **Auftragsverarbeitung:** Schließen Sie mit Google die dafür vorgesehenen Datenverarbeitungsbedingungen ab. Sie finden sie in den Kontoeinstellungen.
- **Google-Signale und Werbefunktionen:** Aktivieren Sie sie nur, wenn Sie sie brauchen, und erwähnen Sie sie dann in der Erklärung.
- **Consent Mode:** Er gibt die Entscheidung des Besuchers an Google weiter. Im Advanced Mode schätzt GA4 fehlende Daten statistisch. Den Banner ersetzt er nicht.

Die Folge: Wer ablehnt, taucht in GA4 nicht oder nur geschätzt auf. Ihre Zahlen sind deshalb immer niedriger als die Wirklichkeit. Für Trends reicht das, für exakte Zählungen nicht.

## Schlanke Alternativen

Wenn Ihnen der Aufwand für Banner und Erklärung zu hoch ist, gibt es Dienste, die ohne Cookies arbeiten und nur das Nötigste zählen: Besucher, Seiten, Quellen, Ziele. Bekannt sind Plausible, Fathom oder Matomo. Vorteile: einfacher, schneller, weniger Rechtsaufwand, oft kein Banner nötig, wenn nichts im Gerät gespeichert wird. Nachteile: Die Verbindung zu Google Ads ist schwächer, und Details zu einzelnen Besuchern fehlen.

Als Faustregel: Schalten Sie keine Anzeigen und wollen nur wissen, ob die Seite Anfragen bringt, dann reicht eine schlanke Lösung. Schalten Sie Google Ads, ist GA4 zusammen mit Ihrem Google-Ads-Konto sinnvoll, weil Sie Conversions dorthin melden können.

## Selbst machen oder machen lassen?

Konto anlegen, Tag einbauen und Schlüsselereignisse für Formular markieren schaffen Sie selbst, mit der Google-Hilfe und einem freien Nachmittag. Schwieriger sind der Telefon-Klick (braucht meist den Tag Manager), die saubere Einwilligung mit Consent Mode und die Verbindung zu Google Ads. Fehler dort führen dazu, dass Sie falsche Zahlen für wahr halten und Budget falsch einsetzen.

Wir richten die Messung zusammen mit Websites und Anzeigen ein, damit Sie im monatlichen Bericht in Klartext sehen, was Anfragen gebracht hat. Bei jeder Einrichtung gilt: Das Konto sollte Ihnen gehören, nicht dem Dienstleister.

## Nächster Schritt

Legen Sie zuerst fest, was für Ihren Betrieb eine Anfrage ist: Formular, Anruf, Termin. Ohne diese Festlegung ist jede Statistik nur Beschäftigung. Wenn Sie die Messung sauber aufsetzen und aus Ihren Besuchern mehr Anfragen holen wollen, sprechen wir in einem [kostenlosen Erstgespräch](/kontakt) darüber. Zum Datenschutz gilt: Dieser Ratgeber ist keine Rechtsberatung. Bei konkreten rechtlichen Fragen wenden Sie sich an eine Anwältin oder einen Anwalt.
