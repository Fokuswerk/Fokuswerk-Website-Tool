# Arbeitsliste — Stand

> **Zweite Runde:** 60 weitere Befunde, abgearbeitet. Siehe
> `Arbeitsliste-Pruefung-2.md` und die Commits ab `01fbbe92`.

64 Punkte aus der Pruefung mit Agenten. **63 erledigt**, 1 teilweise
(Rang 29: die verworfene Umstellung wird jetzt gemeldet statt still
verworfen — wiederherstellbar ist sie nicht).

Die vollstaendigen Befunde stehen in `Arbeitsliste-Pruefung.md`. Hier steht,
was daraus geworden ist.

## Im letzten Durchgang abgearbeitet

| Rang | Befund | Was geaendert wurde |
|---|---|---|
| 13 | „Weiter" uebersprang den Upload, danach behauptete die Pruefseite Herkuenfte | Herkunft wird je Feld gefuehrt: aus dem Plan / von dir geaendert / Annahme |
| 15 | Geraeteschraenke hatten keine eigenen Kennungen | `KS600` und `GS450` mit eigener Artikelnummer; `istHoch()` statt vier Rollenvergleichen |
| 17 | Zwei der drei Vorschlaege waren identisch | Je Strategie ein eigener Fuellschrank; Doppelungen werden benannt statt doppelt gezeigt |
| 18 | Gangbreite und Bewegungsflaeche waren „gerechnet", aber nicht nachrechenbar | Die Regel rechnet sie; `werkzeuge/datentest.ts` prueft das |
| 20 | K-06 wurde mit 910 mm geplant, obwohl 850 mm festgelegt sind | Arbeitshoehe kommt vom Typ, der Sockel nimmt die Differenz auf |
| 21 | Die „Fertigungsmasse" im Aufmass waren keine | Kette aus Nische, Wandversatz, Korpussen, Blende und Platte |
| 22 | Eine Wand, die 16 mm abweicht, hatte keinen Ausgang | Der Katalog wird nach dem Tausch durchsucht, der die Blende zurueckbringt |
| 24 | 16 BSH-Herstellerfotos ohne Lizenz im Repository | `Bildrechte.md` plus Schalter `FOTOS_LIZENZIERT`; der Stand steht in der Anwendung |
| 29 | Umstellung von Hand wurde still verworfen | *(teilweise)* Sie wird gemeldet |
| 35 | Stueckliste und Nettosumme gingen nicht auf | Der Ausstattungszuschlag ist ein Posten; Mindestpreis entfernt; Test ueber 36 Faelle |
| 36 | Jeder Haengeschrank wurde als 600er berechnet | Je Breite eine Zeile mit eigener Artikelnummer |
| 38 | Das Aufpreisschild passte nicht zur Preisaenderung | Jede Moeglichkeit wird durchgeplant; bei gegenlaeufigem Vorzeichen steht der Grund dabei |
| 39 | Eine Typbestaetigung raeumte Attribute und Zwangspunkte nicht auf | `typMitFreigabe()` ueberlagert Attribute, Zwangspunkte und Grundriss |
| 44 | Die Anordnungssuche brach einseitig ab | Grenze von 20.000 auf 400.000 |
| 46 | `moeglich` war im Ergebnis immer true | Befunde der Zeile landen in derselben Achtung-Liste |
| 49 | „Weiter" lag auf dem Handy unter dem Falz | Fussleiste klebt, Scrollposition springt zum Schritt |
| 52 | Nach einer alten Sitzung fehlte der Plan, der Text behauptete eine PDF | Die Art des Uploads wird gemerkt und erklaert |
| 60 | Der Schrittwechsel wurde nicht angekuendigt | Live-Bereich meldet ihn, der Fokus geht auf die Ueberschrift |

## Beim Pruefen zusaetzlich gefunden und behoben

- Der Rahmen auf dem Grundriss setzt die Raumtiefe jetzt selbst — vorher musste
  man „Tiefe uebernehmen" druecken, damit Zeichnung und Plan zusammenpassten.
- Die Fuellung griff nur nach 600er und 450er Schraenken. Blieben 300 mm uebrig,
  wurden sie zur Passleiste — und derselbe Plan warnte, 300 mm Passleiste seien
  zu viel. Den 300er Schrank gab es im Katalog.
- Eine gespeicherte Variantenwahl auf eine entfernte Variante liess den ganzen
  Bautraegerbereich weiss, eine gespeicherte Raumform die Fragestrecke.
- `bewegungsflaeche()` hatte zwei Zweige mit demselben Ergebnis und zog null ab.

## Pruefwerkzeuge

```bash
npx esbuild werkzeuge/planertest.ts --bundle --platform=node --format=esm --alias:@=./src --outfile=/tmp/pt.mjs && node /tmp/pt.mjs
```

```bash
npx esbuild werkzeuge/datentest.ts --bundle --platform=node --format=esm --alias:@=./src --outfile=/tmp/dt.mjs && node /tmp/dt.mjs
```

`planertest.ts` prueft die harten Regeln, dass jede Zeile aufgeht und dass die
Stueckliste die Nettosumme ergibt. `datentest.ts` prueft, dass jedes als
„gerechnet" ausgewiesene Mass seiner eigenen Regel folgt.

## Was bewusst offen bleibt

- **Rang 29:** Eine von Hand umgestellte Belegung wird beim Aendern des Raums
  verworfen. Sie zu retten hiesse, sie gegen die neue Geometrie zu pruefen und
  teilweise zu uebernehmen — das ist ein eigener Umbau, kein Nachtrag.
- **Backend.** Preise, Lieferantenkatalog und Bestellstrecke sind Demo-Daten.
  Das war von Anfang an so gesetzt.

---

## Zweite Prüfrunde

Sechs Spuren, die die erste nicht hatte: Regressionen im Geänderten,
Rechenaufwand, Zustand und Wiederkehr, Käufersicht, Bedienwege, Sprache.
84 Rohbefunde, **60 nach dem Angriff bestätigt**, 24 durchgefallen. Alle 60
abgearbeitet.

Die Befunde im Einzelnen stehen in `Arbeitsliste-Pruefung-2.md`.

**Was dabei am meisten wog:**

- Zwei Stellen, an denen der Unterbau-Kühlschrank noch als Hochschrank galt:
  die Stückliste nannte 2,8 lfm Arbeitsplatte, der Zuschnitt auf demselben
  Blatt 3.400 mm.
- Der Planer war zu langsam und lief zu oft. Die Suche schrieb erst alle
  Anordnungen in ein Feld, prüfte die harten Regeln erst am fertigen Band und
  sortierte austauschbare Füllschränke millionenfach um. Gemessen: 5,20 m Wand
  von 105 auf 22 ms.
- Der Stand wurde nur von wenigen Settern gestempelt — das Wiederkehr-Band
  nannte eine Uhrzeit, die eineinhalb Stunden zurücklag.
- Die Datenschutzerklärung bescheinigte dem Besucher eine USA-Übermittlung,
  die sein Browser nicht macht.

**Prüfbefehle** (neu, vorher standen sie nur in der README):

```bash
npm run verify           # Typprüfung plus die drei Rechenprüfungen
npm run zeitmessung      # wie lange der Planer je Raumgröße braucht
```
