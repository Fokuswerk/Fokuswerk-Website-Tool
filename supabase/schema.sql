create extension if not exists "pgcrypto";

create table if not exists sites (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  company_name  text not null,
  slug          text not null unique,
  industry      text not null default '',
  old_website_url text,
  contact_person  text,
  phone           text,
  email           text,
  address         text,
  primary_color   text not null default '#2563eb',
  hero_headline   text not null default '',
  hero_subheadline text not null default '',
  cta_text        text not null default 'Jetzt anfragen',
  services        text[] not null default '{}',
  benefits        text[] not null default '{}',
  about_text      text,
  status          text not null default 'Entwurf'
);

-- Auto-update updated_at on every row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sites_updated_at
  before update on sites
  for each row execute procedure update_updated_at();
