-- Migration v5: image overrides + custom testimonials per site
alter table sites add column if not exists hero_image_url text;
alter table sites add column if not exists about_image_url text;
alter table sites add column if not exists testimonials jsonb;
