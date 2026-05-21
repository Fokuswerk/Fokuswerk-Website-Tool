-- Migration v6: Create contact_submissions table for contact form submissions

create table if not exists contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  site_slug   text not null,
  site_id     uuid references sites(id) on delete set null,
  name        text not null,
  email       text not null,
  phone       text,
  message     text not null
);

-- Index for looking up submissions by site
create index if not exists contact_submissions_site_slug_idx on contact_submissions(site_slug);
create index if not exists contact_submissions_site_id_idx on contact_submissions(site_id);
create index if not exists contact_submissions_created_at_idx on contact_submissions(created_at desc);
