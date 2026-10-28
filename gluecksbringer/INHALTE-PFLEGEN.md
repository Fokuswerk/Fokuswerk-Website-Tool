# Inhalte pflegen

Es gibt zwei Wege, Inhalte zu ändern. Der erste ist für den Verein gedacht,
der zweite für alle, die am Quelltext arbeiten.

---

## Der bequeme Weg: im Browser unter `/admin`

Wenn ein Zugang eingerichtet ist (siehe „Zugang einrichten“ weiter unten),
öffnen Sie **`ihre-adresse.de/admin`**, melden sich mit E-Mail und Passwort an
und pflegen alles direkt im Browser:

### Fotos in die Galerie

1. Auf **Galerie** klicken.
2. Das **Jahr** eintragen, unter dem die Bilder erscheinen sollen.
3. Auf **Datei auswählen** klicken und beliebig viele Fotos auf einmal
   markieren. Große Handyfotos werden automatisch verkleinert – Sie müssen
   nichts vorbereiten.
4. Unter jedem Bild stehen zwei Felder:
   - **Bildunterschrift** – steht sichtbar unter dem Foto, darf leer bleiben.
   - **Bildbeschreibung** – was auf dem Bild zu sehen ist. Blinde Menschen
     bekommen diesen Text vorgelesen, und Suchmaschinen lesen ihn mit.
5. Das Häkchen **„Ganz zeigen statt zuschneiden"** ist für Plakate und
   Zeichnungen gedacht, die man vollständig sehen muss.

Was Sie eintippen, wird gespeichert, sobald Sie das Feld verlassen. Ein
Speichern-Knopf ist nicht nötig.

**Ein Foto erscheint erst mit Bildbeschreibung in der Galerie.** Solange die
fehlt, steht in der Verwaltung ein roter Hinweis am Bild. Das ist Absicht: die
Seite ist barrierefrei gebaut, und ein Foto, zu dem niemand sagt, was darauf
ist, wäre für blinde Besucher einfach eine Lücke. Ein Satz reicht völlig.

### Einen Beitrag schreiben

1. Auf **Beiträge → Neuer Beitrag** klicken.
2. **Titel** eingeben – die Adresse der Seite entsteht automatisch daraus.
3. **Datum** und **Kategorie** wählen, einen kurzen **Anreißer** schreiben
   (zwei bis drei Sätze; sie stehen in der Übersicht unter dem Titel).
4. Ein **Aufmacherbild** hochladen und beschreiben.
5. Unter **Text** die Bausteine zusammensetzen: Absatz, Zwischenüberschrift,
   Aufzählung, hervorgehobener Satz oder ein Bild. Mit den Pfeilen lassen sich
   Bausteine verschieben.
6. Unten: Häkchen bei **„Auf der Website zeigen"** setzen und auf
   **Speichern** klicken.

Ohne das Häkchen bleibt der Beitrag ein Entwurf – Sie können also in Ruhe
daran arbeiten und ihn später freischalten. In der Liste steht bei Entwürfen
ein entsprechender Hinweis.

**Bildbeschreibungen sind Pflicht.** Veröffentlichen lässt sich ein Beitrag
nur, wenn jedes Bild beschrieben ist. Das ist keine Schikane: blinde Besucher
bekommen diesen Satz vorgelesen, und die Seite ist ausdrücklich barrierefrei
gebaut. Ein Satz genügt – „Drei Kinder hängen Wunschkarten an den
geschmückten Tannenbaum" sagt mehr als „Foto vom Wunschbaum". Als Entwurf
dürfen die Beschreibungen noch fehlen.

Gespeicherte Änderungen sind sofort auf der Website zu sehen.

### Zugang einrichten

Einmalig, am besten durch die Person, die die Website betreut:

1. Auf [supabase.com](https://supabase.com) ein kostenloses Projekt anlegen
   (Region Frankfurt wählen).
2. Im **SQL Editor** die Datei `supabase/01_schema.sql` aus diesem Ordner
   einfügen und ausführen. Damit entstehen die Tabellen und der Bildordner.
3. Im **SQL Editor** eintragen, wer Inhalte pflegen darf – eine Zeile je
   Person, mit genau der Mailadresse, die später zum Anmelden benutzt wird:

   ```sql
   insert into public.redakteure (email, name) values
     ('vorname.nachname@example.de', 'Vorname Nachname')
   on conflict (email) do nothing;
   ```

4. Unter **Project Settings → API** die beiden Werte kopieren und bei Vercel
   als Umgebungsvariablen eintragen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Unter **Authentication → Users → Add user** die Zugänge anlegen – dieselben
   Mailadressen wie in Schritt 3, mit Haken bei „Auto Confirm User".
6. Unter **Authentication → Sign In / Providers** die Selbstregistrierung
   ausschalten („Allow new users to sign up"). Doppelt gesichert: selbst wenn
   dieser Schalter einmal umgelegt wird, kommt ein fremdes Konto nicht an die
   Inhalte, solange seine Mailadresse nicht in `redakteure` steht.
7. Einmal neu ausrollen.

Eine weitere Person später dazunehmen: Schritt 3 und 5 für sie wiederholen.
Jemandem den Zugang entziehen: ihre Zeile aus `redakteure` löschen
(`delete from public.redakteure where email = '…';`) und den Zugang unter
**Authentication → Users** entfernen.

Solange diese beiden Werte fehlen, funktioniert die Website ganz normal – sie
zeigt dann ausschließlich die Inhalte aus dem Ordner `content/`.

**Wichtig:** Die Beiträge und Bilder, die schon in `content/` stehen, bleiben
immer erhalten. Die Verwaltung legt neue Inhalte obendrauf. Wer einen alten
Beitrag überarbeiten möchte, legt ihn in der Verwaltung mit derselben Adresse
(`slug`) noch einmal an – dann gilt die neue Fassung.

---

## Der zweite Weg: direkt im Quelltext

Alles, was unten steht, gilt weiterhin. Die Dateien in `content/` sind die
Grundlage der Website und lassen sich jederzeit von Hand pflegen.

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
