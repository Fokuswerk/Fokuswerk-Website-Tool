-- Schema für Pflegegeld-Antrag.
-- In Supabase unter "SQL Editor" einmal ausführen, dann die Zugangsdaten
-- als Umgebungsvariablen in Vercel hinterlegen (siehe README).

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

-- Zugriff nur über den Dienstschlüssel, nicht über den öffentlichen.
alter table ereignisse enable row level security;
alter table leads      enable row level security;
