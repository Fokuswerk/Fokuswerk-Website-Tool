-- Migration v3: template choice + contact form submissions
alter table sites add column if not exists template text not null default 'premium';

create table if not exists contact_submissions (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  site_id     uuid        references sites(id) on delete set null,
  site_slug   text        not null,
  name        text        not null,
  email       text        not null,
  phone       text,
  message     text        not null
);
alter table contact_submissions disable row level security;
