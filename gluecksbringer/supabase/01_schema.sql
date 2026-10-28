-- ============================================================================
--  Glücksbringer am Meer – Inhaltsverwaltung
--
--  Einmal im SQL-Editor des Supabase-Projekts ausführen. Legt zwei Tabellen
--  und einen Speicherordner für Bilder an und setzt die Zugriffsregeln:
--  Lesen darf jeder, Schreiben nur die eingetragene Redaktion.
--
--  Danach die Mailadressen der Redaktion unten in `redakteure` eintragen
--  und unter Authentication → Users die passenden Zugänge anlegen.
--
--  Wichtig: Schreiben darf ausdrücklich nur, wessen Mailadresse in
--  `redakteure` steht. Der öffentliche Schlüssel der Website steht im
--  Browser für jeden lesbar – würde allein das Angemeldetsein genügen,
--  käme jeder mit einem selbst angelegten Konto an die Inhalte.
-- ============================================================================

-- --------------------------------------------------------------- Beiträge ---
create table if not exists public.beitraege (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  titel         text not null,
  kategorie     text not null default 'Aus dem Verein',
  datum         date not null default current_date,
  teaser        text not null default '',
  bild_pfad     text,
  bild_breite   integer,
  bild_hoehe    integer,
  bild_alt      text not null default '',
  inhalt        jsonb not null default '[]'::jsonb,
  veroeffentlicht boolean not null default false,
  erstellt_am   timestamptz not null default now(),
  geaendert_am  timestamptz not null default now()
);

comment on table  public.beitraege is 'Beiträge für den Bereich Aktuelles';
comment on column public.beitraege.slug is 'Adresse der Seite: /aktuelles/<slug>';
comment on column public.beitraege.inhalt is 'Liste von Blöcken, siehe content/aktuelles.ts';
comment on column public.beitraege.bild_pfad is 'Pfad im Speicherordner bilder, ohne führenden Schrägstrich';

create index if not exists beitraege_datum_idx
  on public.beitraege (veroeffentlicht, datum desc);

-- ---------------------------------------------------------------- Galerie ---
create table if not exists public.galerie_bilder (
  id            uuid primary key default gen_random_uuid(),
  jahr          text not null,
  pfad          text not null,
  breite        integer not null,
  hoehe         integer not null,
  alt           text not null default '',
  unterschrift  text,
  -- Plakate und Zeichnungen werden eingepasst statt beschnitten.
  einpassen     boolean not null default false,
  sortierung    integer not null default 0,
  erstellt_am   timestamptz not null default now()
);

comment on table public.galerie_bilder is 'Bilder der Galerie, nach Jahren gruppiert';

create index if not exists galerie_jahr_idx
  on public.galerie_bilder (jahr desc, sortierung, erstellt_am);

-- ---------------------------------------------- geaendert_am mitschreiben ---
create or replace function public.setze_geaendert_am()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.geaendert_am = now();
  return new;
end;
$$;

drop trigger if exists beitraege_geaendert_am on public.beitraege;
create trigger beitraege_geaendert_am
  before update on public.beitraege
  for each row execute function public.setze_geaendert_am();

-- -------------------------------------------------------- Redaktion --------
-- Wer die Inhalte pflegen darf. Nur über den SQL-Editor zu ändern, nicht
-- über die Website: die Tabelle hat bewusst keine einzige Zugriffsregel.
create table if not exists public.redakteure (
  email       text primary key,
  name        text,
  angelegt_am timestamptz not null default now()
);

comment on table public.redakteure is
  'Mailadressen, die Inhalte pflegen dürfen. Ohne Eintrag hier geht nichts.';

alter table public.redakteure enable row level security;

-- Läuft mit den Rechten des Eigentümers, kommt also an die Tabelle oben
-- heran, obwohl sie für alle anderen gesperrt ist.
create or replace function public.ist_redaktion()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.redakteure r
    where lower(r.email) = lower(nullif(auth.jwt() ->> 'email', ''))
  );
$$;

-- ------------------------------------------------------------ Zugriff -------
alter table public.beitraege      enable row level security;
alter table public.galerie_bilder enable row level security;

-- Lesen: veröffentlichte Beiträge und alle Galeriebilder sind öffentlich.
drop policy if exists "Beiträge öffentlich lesen" on public.beitraege;
create policy "Beiträge öffentlich lesen"
  on public.beitraege for select
  to anon, authenticated
  using (veroeffentlicht = true or public.ist_redaktion());

drop policy if exists "Galerie öffentlich lesen" on public.galerie_bilder;
create policy "Galerie öffentlich lesen"
  on public.galerie_bilder for select
  to anon, authenticated
  using (true);

-- Schreiben: nur, wer in `redakteure` steht.
drop policy if exists "Beiträge pflegen" on public.beitraege;
create policy "Beiträge pflegen"
  on public.beitraege for all
  to authenticated
  using (public.ist_redaktion()) with check (public.ist_redaktion());

drop policy if exists "Galerie pflegen" on public.galerie_bilder;
create policy "Galerie pflegen"
  on public.galerie_bilder for all
  to authenticated
  using (public.ist_redaktion()) with check (public.ist_redaktion());

-- ------------------------------------------------------------ Bildablage ----
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bilder', 'bilder', true, 15728640,
  array['image/jpeg','image/png','image/webp','image/avif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 15728640,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

drop policy if exists "Bilder öffentlich lesen" on storage.objects;
create policy "Bilder öffentlich lesen"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'bilder');

drop policy if exists "Bilder hochladen" on storage.objects;
create policy "Bilder hochladen"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'bilder' and public.ist_redaktion());

drop policy if exists "Bilder ersetzen" on storage.objects;
create policy "Bilder ersetzen"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'bilder' and public.ist_redaktion());

drop policy if exists "Bilder löschen" on storage.objects;
create policy "Bilder löschen"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'bilder' and public.ist_redaktion());

-- ------------------------------------------------------- Redaktion füllen ---
-- Hier die Mailadressen eintragen, die Inhalte pflegen dürfen – dieselben
-- Adressen, für die unter Authentication → Users ein Zugang angelegt wird.
--
--   insert into public.redakteure (email, name) values
--     ('vorname.nachname@example.de', 'Vorname Nachname')
--   on conflict (email) do nothing;
