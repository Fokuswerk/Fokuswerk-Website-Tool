-- Schema für Pflegegeld-Antrag.
--
-- So wird es eingespielt:
--   1. In Supabase ein Projekt anlegen, Region Frankfurt (eu-central-1).
--      Das Ergebnis enthält Pflegegrade, also Gesundheitsangaben nach
--      Art. 9 DSGVO — die gehören in die EU und nicht in eine Datenbank,
--      die nebenbei ein anderes Produkt bedient.
--   2. Diese Datei im SQL-Editor einmal vollständig ausführen.
--   3. Unter "Project Settings → API" die Projekt-URL und den
--      service_role-Schlüssel holen (NICHT den anon-Schlüssel: die Tabellen
--      stehen unter Row Level Security ohne jede Policy, der anon-Schlüssel
--      sieht dadurch nichts).
--   4. Beide Werte bei Vercel hinterlegen, siehe README.
--   5. `npm run datenbank` beweist, dass es wirklich funktioniert.

create table if not exists ereignisse (
  id          uuid primary key default gen_random_uuid(),
  zeit        timestamptz not null default now(),
  art         text not null check (art in ('seite','check_start','check_frage','check_fertig','lead','klick')),
  pfad        text not null default '/',
  sitzung     text not null,
  werte       jsonb not null default '{}'::jsonb
);

create index if not exists ereignisse_zeit_idx    on ereignisse (zeit desc);
create index if not exists ereignisse_art_idx     on ereignisse (art);
create index if not exists ereignisse_sitzung_idx on ereignisse (sitzung);

create table if not exists leads (
  id       uuid primary key default gen_random_uuid(),
  zeit     timestamptz not null default now(),
  anlass   text not null,
  mail     text not null,
  name     text not null default '',
  befund   jsonb not null default '{}'::jsonb,
  quelle   text,
  sitzung  text,
  -- false, bis die Bestaetigungsmail beantwortet ist (Double Opt-in)
  bestaetigt boolean not null default false
);

create index if not exists leads_zeit_idx   on leads (zeit desc);
create index if not exists leads_anlass_idx on leads (anlass);

-- Dieselbe Adresse soll je Anlass nur einmal in der Liste stehen. Wer das
-- Formular zweimal abschickt, weil keine Mail ankam, erzeugt sonst Dubletten.
-- Der Schreibvorgang nutzt dazu "resolution=ignore-duplicates": der zweite
-- Versuch laeuft ins Leere, statt einen schon bestaetigten Eintrag wieder auf
-- unbestaetigt zurueckzusetzen.
create unique index if not exists leads_mail_anlass_idx on leads (mail, anlass);

-- Row Level Security an, aber bewusst OHNE Policy: damit kommt ausschliesslich
-- der service_role-Schluessel an die Daten, der RLS umgeht. Der oeffentliche
-- anon-Schluessel sieht nichts, selbst wenn er einmal im Browser landet.
alter table ereignisse enable row level security;
alter table leads      enable row level security;

-- ---------------------------------------------------------------------------
-- Double Opt-in. Nachtraeglich hinzugefuegt; dieser Block laesst sich gefahrlos
-- erneut ausfuehren, auch wenn der obere Teil schon lief.
--
-- Warum die beiden IP-Spalten: Wer behauptet, eine Einwilligung zu haben, muss
-- sie nachweisen koennen (Art. 7 Abs. 1 DSGVO). Fuer Double Opt-in heisst das:
-- Zeitpunkt der Anmeldung, Zeitpunkt der Bestaetigung und von wo. Ohne diesen
-- Nachweis ist die Liste im Streitfall wertlos.
-- ---------------------------------------------------------------------------
alter table leads add column if not exists bestaetigung_token  text;
alter table leads add column if not exists token_gueltig_bis   timestamptz;
alter table leads add column if not exists bestaetigt_am       timestamptz;
alter table leads add column if not exists anmelde_ip          text;
alter table leads add column if not exists bestaetigt_ip       text;

-- Der Token muss eindeutig sein, sonst bestaetigt ein Link den falschen Eintrag.
create unique index if not exists leads_token_idx
  on leads (bestaetigung_token) where bestaetigung_token is not null;
