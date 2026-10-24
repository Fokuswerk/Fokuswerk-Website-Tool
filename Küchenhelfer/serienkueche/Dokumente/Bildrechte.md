# Bildrechte

Stand: 24.10.2026

## Was hier liegt

Unter `public/geraete/` liegen **16 Produktfotos** von Geräten der
BSH Hausgeräte GmbH (Marken Bosch und Siemens). Sie sind aus öffentlich erreichbaren
Produktdarstellungen des Handels zusammengetragen und als WebP verkleinert worden.

## Rechtsstand: offen

**Für diese Fotos liegt keine Lizenz vor.** Weder ein Händlervertrag noch eine
Pressefreigabe noch eine schriftliche Nutzungserlaubnis von BSH.

Das ist für einen Prototyp vertretbar, der einem einzelnen Interessenten gezeigt wird.
Für zwei Fälle ist es es nicht:

1. **Öffentlicher Betrieb.** Sobald die Seite ohne Zugangsschutz erreichbar ist und
   Besucher von außen bekommt, ist das eine öffentliche Zugänglichmachung nach
   § 19a UrhG. Dafür braucht es die Erlaubnis des Rechteinhabers.
2. **Verkauf des Werkzeugs.** Ein Käufer übernimmt mit dem Code auch dieses Risiko.
   Bei einer Due-Diligence-Prüfung fällt ein Ordner mit 16 Herstellerfotos ohne
   Lizenznachweis auf und mindert den Preis — oder kostet eine Garantiezusage.

## Welche Wege es gibt

| Weg | Aufwand | Taugt für |
|---|---|---|
| Händlerzugang bei BSH (Mediapool) | Handelsvertrag nötig, Fotos dann frei für den Verkauf der Geräte | den Echtbetrieb als Küchenverkäufer |
| Fotos selbst machen | Geräte vor Ort, ein Tag Studio | den Verkauf des Werkzeugs |
| Eigene Strichzeichnungen je Gerätetyp | ein Tag Zeichenarbeit, kein Rechtsrisiko | Demo und Verkauf |
| Lizenzbilder eines Bildanbieters | laufende Kosten, selten das genaue Modell | nichts davon richtig |

Für den Verkauf des Werkzeugs ist der dritte Weg der ruhigste: Zeichnungen gehören uns,
altern nicht mit dem Modellwechsel und passen zum übrigen Zeichenstil der Anwendung.

## Was im Code dafür vorbereitet ist

`src/data/geraete.ts` hält zwei Schalter:

- `FOTOS_LIZENZIERT` — steht auf `false`. Solange das so ist, zeigt die Anwendung an
  jeder Stelle mit Produktfotos den Hinweis auf den offenen Rechtsstand.
- `GERAETEFOTO_HINWEIS` / `FOTO_QUELLE` — der Hinweis und die Quellenzeile, die unter den Bildern steht.

Ein Austausch der Bilder ist damit ein Austausch von Dateien plus ein Schalter, kein
Umbau.

## Die Dateien im Einzelnen

| Datei | Marke | Modell | Art |
|---|---|---|---|
| `bo-bosch-hba571.webp` | — | nicht zugeordnet | — |
| `bo-bosch-hbg578.webp` | — | nicht zugeordnet | — |
| `bo-siemens-hb774.webp` | — | nicht zugeordnet | — |
| `da-bosch-dfl064.webp` | — | nicht zugeordnet | — |
| `da-bosch-dft63.webp` | — | nicht zugeordnet | — |
| `da-siemens-li67.webp` | — | nicht zugeordnet | — |
| `gs-bosch-smv4.webp` | — | nicht zugeordnet | — |
| `gs-siemens-sn87.webp` | — | nicht zugeordnet | — |
| `gs-siemens-sr61.webp` | — | nicht zugeordnet | — |
| `gs-siemens-sx63.webp` | — | nicht zugeordnet | — |
| `kf-bosch-pke645.webp` | — | nicht zugeordnet | — |
| `kf-bosch-pug611.webp` | — | nicht zugeordnet | — |
| `kf-siemens-ex645.webp` | — | nicht zugeordnet | — |
| `ks-bosch-kif82.webp` | — | nicht zugeordnet | — |
| `ks-bosch-kur21.webp` | — | nicht zugeordnet | — |
| `ks-siemens-ki81.webp` | — | nicht zugeordnet | — |

Die Fotos der Räume (Startseite, Fragestrecke) kommen von Unsplash und stehen unter der
Unsplash-Lizenz — die erlaubt die kommerzielle Nutzung ohne Namensnennung. Sie sind
davon nicht betroffen.
