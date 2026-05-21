# Website Tool

Internes Tool zum schnellen Erstellen von Demo-Websites für lokale Unternehmen.

---

## Schnellstart

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Umgebungsvariablen anlegen

```bash
cp .env.example .env.local
```

Dann `.env.local` öffnen und die Supabase-Daten eintragen (siehe Schritt 3).

### 3. Supabase-Projekt anlegen

1. Gehe zu [supabase.com](https://supabase.com) → "New Project"
2. Projekt erstellen (Name, Passwort, Region wählen)
3. Nach dem Start: **Settings → API**
4. Kopiere:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Trage beide Werte in `.env.local` ein

### 4. Datenbank einrichten

1. In Supabase: **SQL Editor → New Query**
2. Inhalt von `supabase/schema.sql` hineinkopieren
3. **Run** klicken

### 5. Entwicklungsserver starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) → wird automatisch zu `/dashboard` weitergeleitet.

---

## Routen

| Route | Beschreibung |
|---|---|
| `/dashboard` | Projektübersicht |
| `/dashboard/new` | Neue Website anlegen |
| `/dashboard/[id]/edit` | Website bearbeiten |
| `/site/[slug]` | Generierte Demo-Website |

---

## Deployment auf Vercel

```bash
npm install -g vercel
vercel
```

Oder:
1. Repo auf GitHub pushen
2. [vercel.com](https://vercel.com) → "Import Project"
3. Bei **Environment Variables** die beiden Supabase-Werte aus `.env.local` eintragen
4. Deploy

Nach dem Deployment lautet der Preview-Link:
```
https://deine-domain.vercel.app/site/[slug]
```

---

## Workflow

1. Unternehmen anrufen
2. `/dashboard/new` → Daten eingeben → speichern
3. Preview-Link (`/site/[slug]`) kopieren und an den Interessenten schicken
4. Status im Dashboard aktualisieren (Gesendet → Interessiert → Gewonnen)
5. Jederzeit über `/dashboard/[id]/edit` anpassen
