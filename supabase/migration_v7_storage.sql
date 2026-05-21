-- Migration v7: Supabase Storage bucket for site images
-- Run this in the Supabase SQL Editor

-- Create the storage bucket for site images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images',
  'site-images',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do nothing;

-- Allow public read access (anyone can view uploaded images)
create policy "Public read access"
  on storage.objects for select
  using ( bucket_id = 'site-images' );

-- Allow any authenticated or anonymous upload (adjust if you add auth later)
create policy "Allow uploads"
  on storage.objects for insert
  with check ( bucket_id = 'site-images' );

-- Allow delete (for cleanup)
create policy "Allow delete"
  on storage.objects for delete
  using ( bucket_id = 'site-images' );
