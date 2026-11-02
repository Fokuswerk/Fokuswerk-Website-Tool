# Pflegegeld-Antrag

Rechner für den Pflegegrad nach beiden Rechtsständen: der heutigen Fassung des SGB XI und
den Werten, die der Regierungsentwurf des Pflegeneuordnungsgesetzes zum 1. Januar 2027
vorsieht.

**Live:** https://pflegegeld-antrag-woad.vercel.app (auf `noindex`, siehe „Vor dem Start")

---

## Warum dieses Werkzeug

Drei belegte Tatsachen tragen das ganze Produkt:

1. **§ 142b Abs. 1 SGB XI im Entwurf:** „Die Feststellung des Vorliegens von
   Pflegebedürftigkeit erfolgt jeweils auf der Grundlage des zum Zeitpunkt der
   Antragstellung geltenden Rechts." Ein Antrag bis zum 31. Dezember 2026 wird nach den
   heutigen, niedrigeren Schwellen bewertet.
2. **Die Schwellen steigen** für die Pflegegrade 1 bis 3 von 12,5 / 27 / 47,5 auf
   15 / 30 / 50 Punkte, und in den Modulen 1, 4 und 6 verschieben sich zusätzlich die
   Punktspannen. Das IGES-Institut rechnet mit 12 bis 22 Prozent weniger anerkannten
   Erstbegutachtungen.
3. **§ 142b Abs. 3:** Von Januar bis April 2027 ist die 25-Arbeitstage-Frist der
   Pflegekasse unbeachtlich.

Kein anderer Rechner im Netz kennt heute die neuen Werte. Das ist das Zeitfenster.

## Rechenkern

`src/lib/nba.ts` bildet das Begutachtungsinstrument vollständig ab:

- alle Kriterien aus **Anlage 1 zu § 15 SGB XI** mit ihren Einzelpunkten, inklusive der
  abweichenden Skalen (Essen 0/3/6/9, Trinken und Toilette 0/2/4/6, Sondenernährung
  0/6/3 – teilweise zählt höher als vollständig, so steht es im Gesetz)
- die Häufigkeitslogik von Modul 5: 5.12 bis 5.15 werden erst addiert und dann in
  Einzelpunkte übersetzt
- das Inkontinenz-Tor: 4.11 und 4.12 zählen nur mit entsprechender Feststellung
- die Regel „höchster Wert aus Modul 2 oder 3", die gemeinsam mit 15 Prozent gewichtet wird
- **beide Fassungen der Anlage 2**, also die heutigen und die künftigen Punktspannen

`npm run pruefen` fährt 75 Prüfungen gegen handgerechnete Fälle, darunter die Grenzfälle
der Reform (etwa: acht Einzelpunkte in Modul 4 ergeben heute 20, künftig 10 gewichtete
Punkte). Node 24 führt die TypeScript-Datei direkt aus, dafür braucht es kein Testpaket.

## Gestaltung

Gemessen an wohnsitzmelder.com und den Apple-Grundsätzen aus den WWDC-Vorträgen:
Inter über `next/font` selbst gehostet, Radien von 8 bis 32 px, durchscheinende Kopfleiste
mit `backdrop-filter`, Flächen aus Tokens für hell und dunkel, Druckfeedback auf
`:active`, `prefers-reduced-motion` und `prefers-reduced-transparency` berücksichtigt.
Die senkrechte Flagge an der Wortmarke und die kleinen Vertrauenszeilen sind dem
Vorbild entnommen.

**Falle:** Der CSS-Minifier von Next 16 verwirft `backdrop-filter` ohne Präfix, wenn
keine `browserslist` gesetzt ist — dann sieht die Kopfleiste nur durchsichtig aus statt
zu filtern. Die Browser-Ziele stehen jetzt in der `package.json`.

**Falle:** iCloud legt im Schreibtisch-Ordner Dubletten an (`routes.d 2.ts`), die den
Build brechen. `prebuild` löscht deshalb `.next` vor jedem Bau.

## Aufbau

| Pfad | Zweck | Geld |
|---|---|---|
| `/` | Schnell-Check, sieben Fragen, Ergebnis mit Konsequenz | Einstieg |
| `/check` | alle Kriterien der Anlage 1, Modulvergleich, Hebelmodul | Einstieg |
| `/bescheid` | Werte aus dem Gutachten gegen die eigene Bewertung | führt zum Widerspruch |
| `/reform` | Leistungsvergleich 2026 zu 2027 in Euro im Monat | Reichweite |
| `/mappe` | Begutachtungsmappe, 39 € | Produktverkauf |
| `/widerspruch` | Widerspruch über Partnerkanzlei, 350 € nur bei Erfolg | Produktverkauf |
| `/anfrage` | Anfrage an regionale Anbieter | Partnervergütung |
| `/api/lead` | nimmt Leads an, prüft die Mail, schreibt ins Log | — |
| `/api/klick` | zählt Partnerklicks, leitet nur auf erlaubte Ziele | — |

Die Partnervorschläge am Ende von `/check` hängen am Modul mit dem größten Hilfebedarf,
nicht am Zufall und nicht an der Höhe der Vergütung. Belegte Marktwerte stehen in
`src/lib/partner.ts`: Treppenlift 40 bis 60 € je validem Lead, Hausnotruf um 130 € je
Abschluss, Vergleichsportale rund 30 Prozent Umsatzanteil.

## Rechtliche Konstruktion

- **Der Rechner ist keine Rechtsdienstleistung.** BGH, 9. September 2021, I ZR 113/20:
  Ein Frage-und-Antwort-Generator prüft keinen Einzelfall. Der Hinweis darauf ist Teil des
  Schutzes, nicht Kleingedrucktes – deshalb steht er auf jeder rechnenden Seite.
- **Der Widerspruch gehört einer Kanzlei.** BSG, 13. Juli 2018, B 9 SB 89/17 B: Das Führen
  eines Widerspruchsverfahrens ist keine Nebenleistung einer Pflegeberatung.
- **Kein Geld vom Anwalt an uns.** Der Kunde zahlt die Servicegebühr, die Kanzlei holt ihre
  Kosten bei Erfolg nach § 63 SGB X bei der Pflegekasse. Nur so greift das
  Provisionsverbot des § 49b Abs. 3 BRAO nicht (BGH, 18. April 2024, IX ZR 89/23).
- **Gesundheitsdaten verlassen den Browser nicht.** Gerechnet wird im Client, gespeichert
  wird im localStorage. An `/api/lead` gehen nur Kontaktdaten und Kennzahlen.

## Vor dem Start

| Was | Warum |
|---|---|
| Impressum nach § 5 DDG und Datenschutzerklärung nach Art. 13 DSGVO | ohne das darf die Seite nicht öffentlich sein |
| `robots` in `src/app/layout.tsx` von `noindex` befreien | erst nach den Rechtstexten |
| Datenbank einrichten (siehe unten) | ohne sie weist `/api/lead` jede Adresse mit 503 ab |
| Bezahlvorgang für die Mappe | derzeit nur Vormerkung |
| Kooperationsvertrag mit einer Kanzlei | `/widerspruch` ist bis dahin als „noch nicht freigeschaltet" gekennzeichnet |
| Partnerverträge mit Vergütung je Lead | `/anfrage` sammelt sonst Anfragen ohne Abnehmer |
| Nach dem 31. Dezember: Texte auf den neuen Stand ziehen | der Stichtagshinweis schaltet automatisch um, die Fließtexte nicht |
| Nach dem Bundestagsbeschluss: Werte gegen das verkündete Gesetz prüfen | alle 2027er-Zahlen stammen aus dem Regierungsentwurf |

## Datenbank einrichten

Ohne Datenbank laeuft die Seite vollstaendig, aber `/api/lead` antwortet mit 503 und das
Formular sagt ehrlich, dass die Adresse **nicht** gespeichert wurde. `/admin` zeigt dann
Demo-Zahlen. Das ist Absicht: ein Formular, das "Notiert." sagt, waehrend die Adresse
verfaellt, ist schlimmer als eine Fehlermeldung.

1. **Projekt anlegen** bei Supabase, Region **Frankfurt (eu-central-1)**. Das Ergebnis
   enthaelt Pflegegrade, also Gesundheitsangaben nach Art. 9 DSGVO — die gehoeren in die EU
   und in eine eigene Datenbank, nicht in eine, die nebenbei ein anderes Produkt bedient.
2. **`datenbank/schema.sql`** im SQL-Editor einmal vollstaendig ausfuehren.
3. Unter **Project Settings → API** die Projekt-URL und den **`service_role`**-Schluessel
   holen. Nicht den `anon`-Schluessel: beide Tabellen stehen unter Row Level Security ohne
   Policy, der oeffentliche Schluessel sieht dadurch nichts.
4. Beide Werte bei Vercel hinterlegen:

```bash
npx vercel env add SUPABASE_URL production
```

```bash
npx vercel env add SUPABASE_DIENSTSCHLUESSEL production
```

5. Fuer die Auswertung unter `/admin` zusaetzlich das Zugangspasswort. Ohne diesen Wert
   bleibt der Bereich zu — `angemeldet()` gibt dann immer `false` zurueck, es kann also
   nichts versehentlich offenstehen.

```bash
npx vercel env add ADMIN_PASSWORT production
```

6. Neu ausrollen und **nachweisen**, dass es wirklich geht:

```bash
npm run datenbank
```

Das Skript schreibt einen Probeeintrag, liest ihn zurueck und loescht ihn wieder. Erst damit
ist belegt, dass der Schluessel auch schreiben darf — ein Schluessel mit zu wenig Rechten
faellt sonst erst auf, wenn der erste echte Lead verlorengeht.

**Noch offen, bevor Mails rausgehen duerfen:** Jeder Eintrag steht auf `bestaetigt = false`.
Die Bestaetigungsmail (Double Opt-in) gibt es noch nicht, und ohne sie darf an diese Adressen
nichts verschickt werden.

## Arbeiten am Projekt

```
npm install
npm run pruefen    # 75 Prüfungen des Rechenkerns, Klassen, Kontraste
npm run seiten     # lädt alle zehn Seiten im echten Browser, meldet Abstürze
npm run datenbank  # beweist, dass die Datenbank Leads annimmt und zurückgibt
npm run bilder     # baut die Fotos neu, eine Duotone für alle
npm run vorschau   # baut das Vorschaubild für geteilte Links
npm run build
npm start          # Port 3210
npx vercel --prod  # rollt aus, ohne Git-Bindung
```

Das Projekt hängt bewusst nicht am Sammelrepo, sondern wird direkt aus dem Ordner
ausgerollt.

## Quellen

- Anlage 1 und 2 zu § 15 SGB XI, gesetze-im-internet.de
- Regierungsentwurf Pflegeneuordnungsgesetz, Kabinettsfassung 30. September 2026,
  Bundesgesundheitsministerium
- Leistungsübersicht 2026 des Bundesgesundheitsministeriums, Stand 4. November 2025
