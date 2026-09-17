# Inhalte pflegen

Diese Anleitung richtet sich an den Verein. Alle Texte und Bilder liegen in
wenigen Dateien im Ordner `content/`. Wer eine Datei ändert und speichert,
veröffentlicht damit die neue Fassung – Vercel baut die Seite automatisch neu.

> **Faustregel:** Nur das ändern, was zwischen `"` Anführungszeichen steht.
> Kommas und geschweifte Klammern bitte so lassen, wie sie sind.

---

## 1. Neuen Beitrag unter „Aktuelles“ anlegen

Datei: **`content/aktuelles.ts`**

Ganz oben im Abschnitt `export const beitraege = [` einen neuen Block einfügen –
der neueste Beitrag steht immer zuerst:

```ts
{
  slug: "wunschbaum-am-meer-2026",     // Adresse: /aktuelles/wunschbaum-am-meer-2026
  titel: "Mach mit! Der 16. Wunschbaum am Meer",
  kategorie: "Wunschbaum",             // z. B. "Wunschbaum" oder "Aus dem Verein"
  datum: "2026-11-16",                 // JJJJ-MM-TT, wird zum Sortieren benutzt
  datumLabel: "November 2026",         // das, was auf der Seite steht
  teaser: "Ein bis zwei Sätze, die neugierig machen.",
  bild: bilder.meinNeuesBild,          // vorher unter Punkt 3 eintragen
  bildAlt: "Beschreibung des Bildes für blinde Menschen und Suchmaschinen.",
  inhalt: [
    { typ: "absatz", text: "Der erste Absatz." },
    { typ: "ueberschrift", text: "Eine Zwischenüberschrift" },
    { typ: "absatz", text: "Noch ein Absatz." },
  ],
},
```

**Welche Bausteine es für `inhalt` gibt:**

| Baustein | Beispiel |
|---|---|
| Absatz | `{ typ: "absatz", text: "…" }` |
| Zwischenüberschrift | `{ typ: "ueberschrift", text: "…" }` |
| Aufzählung | `{ typ: "liste", punkte: ["Erstens", "Zweitens"] }` |
| Termine/Ablauf | `{ typ: "schritte", eintraege: [{ zeit: "17. November", text: "…" }] }` |
| Hervorgehobener Hinweis | `{ typ: "hinweis", text: "…" }` |
| Spendenkonto einblenden | `{ typ: "spendenkonto", verwendungszweck: "Wunschbaum am Meer" }` |
| Bild im Text | `{ typ: "bild", bild: bilder.xyz, alt: "…", unterschrift: "…" }` |

Alte Beiträge einfach stehen lassen – sie rutschen automatisch nach unten.

---

## 2. Bilder zur Galerie hinzufügen

Datei: **`content/galerie.ts`**

Die Galerie ist nach Jahren gegliedert. Für ein neues Jahr oben einen Abschnitt
anfügen:

```ts
{
  jahr: "2026",
  einleitung: "Optionaler Satz über das Jahr.",   // darf auch weggelassen werden
  bilder: [
    {
      bild: bilder.meinNeuesBild,
      unterschrift: "Was auf dem Bild passiert.",  // optional
      alt: "Beschreibung für blinde Menschen und Suchmaschinen.",
    },
  ],
},
```

---

## 3. Ein Bild in die Website aufnehmen

1. Die Bilddatei in den Ordner `assets/bilder/` legen.
   Dateiname klein schreiben, ohne Umlaute und Leerzeichen,
   z. B. `wunschbaum-2026-uebergabe.jpg`.
2. In **`content/bilder.ts`** ganz oben eine Zeile ergänzen:

   ```ts
   import meinNeuesBild from "@/assets/bilder/wunschbaum-2026-uebergabe.jpg";
   ```

3. Weiter unten in der Liste `export const bilder = {` den Namen eintragen:

   ```ts
   meinNeuesBild,
   ```

Danach kann das Bild überall als `bilder.meinNeuesBild` verwendet werden.

**Tipp:** Sehr große Fotos aus dem Handy vorher verkleinern. Das Skript
`node scripts/prepare-images.mjs <ordner>` erledigt das für einen ganzen Ordner.

---

## 4. Kontaktdaten, Spendenkonto, Namen ändern

Datei: **`content/verein.ts`**

Dort stehen an einer Stelle:

* Anschrift und E-Mail-Adressen
* Registernummer
* Links zu Facebook, Instagram, PayPal und zum digitalen Wunschbaum
* **Bankverbindung** (IBAN, BIC, Bank)
* die Namen der Ansprechpartnerinnen und des Teams
* die Hauptnavigation

Änderungen wirken sich sofort auf allen Seiten aus – auch im Impressum und im
Footer.

> ⚠️ **Bankverbindung nur nach Rücksprache im Verein ändern.**

---

## 5. Projekte und Zeitleiste

Datei: **`content/projekte.ts`**

* `projekte` – die vier Projekte auf Startseite und Über-uns-Seite
* `meilensteine` – die Zeitleiste „Von 2011 bis heute“
* `unterstuetzer` – wer den Verein unterstützt

---

## 6. Rechtliche Seiten

* `app/impressum/page.tsx`
* `app/datenschutz/page.tsx`

Diese Texte bitte nur nach Rücksprache bzw. rechtlicher Prüfung ändern.

---

## 7. Was nach dem Speichern passiert

Die Website liegt bei Vercel. Sobald eine Änderung in den Hauptzweig des
Git-Repositories gespeichert wird, baut Vercel die Seite automatisch neu –
das dauert etwa ein bis zwei Minuten. Es muss nichts hochgeladen werden.

Wer sich mit Git nicht auskennt, kann die Dateien auch direkt auf GitHub im
Browser bearbeiten: Datei öffnen → Stiftsymbol → ändern → „Commit changes“.
